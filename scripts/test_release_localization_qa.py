from __future__ import annotations

from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
sys.path.insert(0,str(ROOT/'scripts'))
from ahaframe.i18n import HREFLANG, PUBLIC_ROUTE_RELATIVES, SUPPORTED_LOCALES, equivalent_paths, route_prefix  # noqa: E402

BASE='https://ahaframe.com'
INTENTIONAL_TERMS={
    'AhaFrame','AI','LLM','Prompt','Context','Agent','Harness','Loop','Graph','Evaluation','RAG','Retrieval','Reranker',
    'Token','Token Playground','Tokenize','Predict','Sample','Repeat','Memory','Hybrid','Top-K','Schema','Judge','Gate',
    'SHIP','BLOCK','INCONCLUSIVE','SHIP · BLOCK · INCONCLUSIVE','SEE','PLAY','BREAK','AHA','BUILD','Temperature',
    'Coordinator','Coordinator + Workers','Workers × {count}','Join','Verifier','Recall','Precision','Overlap','Conversation',
    'Prompt / Context','Harness → Evaluation','Developer instruction','System policy','PROMPT FAILURE','PROMPT FIXED · HARNESS REQUIRED',
    'Production Labs','Validation Alpha','Capstone','Rubric','API','JSON','SQL','ON','OFF','s','pts','v1','v2','Δ',
    '1 · Prompt','2 · Tokenization','4 · Temperature','Harness + Loop','v1 → v2','you@example.com',
}
INTENTIONAL_SYMBOLS={'¶','⌕','▱','⌘','✓','—'}
BANNED_ZH_VISIBLE=(
    'Mark lesson complete','Not started','Did this change how you think about this system?','Send feedback',
    'Waiting for changes','Key takeaways','Common questions','In one sentence','Build challenge','Current diagnosis',
    'Get Production Labs','Reset baseline','Reset starting architecture','Apply reference architecture',
)


def page_file(locale:str,relative:str)->Path:
    base=SITE/route_prefix(locale)
    return base/'index.html' if not relative else base/relative/'index.html'


def cjk(text:str)->int:
    return sum('\u3400'<=ch<='\u9fff' for ch in text)


def visible(soup:BeautifulSoup)->str:
    clone=BeautifulSoup(str(soup),'html.parser')
    for tag in clone(['script','style','code','pre']): tag.decompose()
    return ' '.join(clone.stripped_strings)


def equal_strings(en,zh,path=''):
    if isinstance(en,dict) and isinstance(zh,dict):
        for key in en.keys()&zh.keys():
            yield from equal_strings(en[key],zh[key],f'{path}.{key}' if path else key)
    elif isinstance(en,list) and isinstance(zh,list):
        for i,(left,right) in enumerate(zip(en,zh)): yield from equal_strings(left,right,f'{path}[{i}]')
    elif isinstance(en,str) and isinstance(zh,str) and en==zh:
        yield path,en


def allowed_equal(path:str,value:str)->bool:
    value=value.strip()
    if not value or value in INTENTIONAL_TERMS or value in INTENTIONAL_SYMBOLS: return True
    if path.endswith(('.key','.format')): return True
    if path.endswith('.state'): return True
    if path.endswith('.price') and re.fullmatch(r'\$\d+(?:\.\d+)?',value): return True
    if value.startswith(('/', '?', '#', 'http://', 'https://')): return True
    if re.fullmatch(r'[a-z0-9_-]+(?:\.[a-z0-9_-]+)*',value) and ('_' in value or '-' in value): return True
    if re.fullmatch(r'[\d\s.:/+×→%–—-]+',value): return True
    return False


def test_content_sources():
    failures=[]
    for en_path in sorted((ROOT/'content').glob('*.en.json')):
        zh_path=en_path.with_name(en_path.name.replace('.en.json','.zh-CN.json'))
        if not zh_path.exists():
            failures.append(f'{en_path.name}: missing zh-CN pair'); continue
        en=json.loads(en_path.read_text(encoding='utf-8')); zh=json.loads(zh_path.read_text(encoding='utf-8'))
        for path,value in equal_strings(en,zh):
            if not allowed_equal(path,value): failures.append(f'{zh_path.name}:{path}: untranslated exact English string {value!r}')
    assert not failures,'\n'.join(failures[:60])


def test_pages_and_alternates():
    expected_langs={HREFLANG[x] for x in SUPPORTED_LOCALES}|{'x-default'}
    for relative in PUBLIC_ROUTE_RELATIVES:
        equivalents=equivalent_paths(f'/en/{relative}')
        for locale in SUPPORTED_LOCALES:
            soup=BeautifulSoup(page_file(locale,relative).read_text(encoding='utf-8'),'html.parser')
            assert soup.html.get('lang')==locale,(relative,locale,'lang')
            viewport=soup.find('meta',attrs={'name':'viewport'}); assert viewport and 'width=device-width' in viewport.get('content',''),(relative,locale,'viewport')
            canonical=soup.find('link',rel='canonical'); assert canonical and canonical.get('href')==BASE+equivalents[locale],(relative,locale,'canonical')
            alternates={n.get('hreflang'):n.get('href') for n in soup.find_all('link',rel='alternate')}; assert set(alternates)==expected_langs,(relative,locale,alternates)
            for target,path in equivalents.items(): assert alternates[HREFLANG[target]]==BASE+path
            assert alternates['x-default']==BASE+equivalents['en']
            title=soup.title.get_text(strip=True) if soup.title else ''; desc=(soup.find('meta',attrs={'name':'description'}) or {}).get('content',''); assert title and desc,(relative,locale,'metadata')
            if locale=='zh-CN':
                assert cjk(title+desc)>=8,(relative,'zh metadata too thin',title,desc)
                text=visible(soup)
                for banned in BANNED_ZH_VISIBLE: assert banned not in text,(relative,'untranslated UI',banned)
                assert not re.search(r'\b\d+\s+min\b',text),(relative,'use Chinese minute unit')
            assert soup.select_one('.mobile-nav') is not None,(relative,locale,'mobile nav')
            switch=soup.select_one('.language-switcher'); assert switch is not None,(relative,locale,'language switcher')
            counterpart=equivalents['zh-CN' if locale=='en' else 'en']; assert switch.find('a',href=counterpart) is not None,(relative,locale,'counterpart link')
            for node in soup.find_all('script',attrs={'type':'application/ld+json'}):
                stack=[json.loads(node.string or '{}')]
                while stack:
                    item=stack.pop()
                    if isinstance(item,dict):
                        if 'inLanguage' in item: assert item['inLanguage']==locale,(relative,locale,'schema language',item.get('@type'))
                        stack.extend(item.values())
                    elif isinstance(item,list): stack.extend(item)


def test_sitemap_and_geo():
    tree=ET.parse(SITE/'sitemap.xml'); ns={'sm':'http://www.sitemaps.org/schemas/sitemap/0.9','x':'http://www.w3.org/1999/xhtml'}; nodes=tree.findall('sm:url',ns)
    expected={BASE+p for relative in PUBLIC_ROUTE_RELATIVES for p in equivalent_paths(f'/en/{relative}').values()}; actual={n.find('sm:loc',ns).text for n in nodes}; assert actual==expected,f'sitemap mismatch missing={expected-actual} extra={actual-expected}'
    for node in nodes: assert {x.attrib.get('hreflang') for x in node.findall('x:link',ns)}=={'en','zh-CN','x-default'},node.find('sm:loc',ns).text
    llms=(SITE/'llms.txt').read_text(encoding='utf-8'); assert f'{BASE}/zh-cn/' in llms and '简体中文学习入口' in llms


def test_shared_runtime_and_backend_contract():
    validation=(SITE/'assets'/'validation-context.js').read_text(encoding='utf-8'); app=(SITE/'assets'/'app.js').read_text(encoding='utf-8'); ui=(SITE/'assets'/'validation-ui.js').read_text(encoding='utf-8')
    assert "'zh-cn':'zh-CN'" in validation and 'locale:c.locale' in validation
    assert "'zh-CN':" in app and "'zh-CN':" in ui
    check=ui.split('function checkCapstone',1)[1].split('function bindFallbackControls',1)[0]
    assert "dataset.decision==='SHIP'" in check and "textContent||''" not in check,'capstone completion must use stable decision enum'
    combined='\n'.join(p.read_text(encoding='utf-8') for p in (SITE/'assets').glob('*.js')); assert not re.search(r"track\(['\"][^'\"]*(?:_zh|zh_|_cn|cn_)[^'\"]*['\"]",combined,re.I),'locale-specific analytics event name found'
    migration=(ROOT/'supabase/migrations/20260815000100_validation_locale.sql').read_text(encoding='utf-8'); product_migration=(ROOT/'supabase/migrations/20260816085500_product_feedback.sql').read_text(encoding='utf-8'); ingest=(ROOT/'supabase/functions/validation-ingest/index.ts').read_text(encoding='utf-8')
    assert migration.count('add column if not exists locale')==3
    assert 'locale text not null' in product_migration,'product feedback must persist locale'
    assert ingest.count('locale: locale(body.locale)')==4,'event, Aha feedback, product feedback, and waitlist must each normalize locale'
    for function_name in ('ingestEvent','ingestFeedback','ingestProductFeedback','ingestWaitlist'):
        assert f'function {function_name}' in ingest,f'missing locale-aware ingest path: {function_name}'


def mobile_one_column_selectors(css:str)->set[str]:
    marker='@media(max-width:760px)'
    assert marker in css
    mobile=css.split(marker,1)[1].split('@media(',1)[0]
    selectors=set()
    for selector_list in re.findall(r'([^{}]+)\{grid-template-columns:1fr!important\}',mobile):
        selectors.update(selector.strip() for selector in selector_list.split(','))
    return selectors


def test_mobile_contract():
    css=(SITE/'assets'/'styles.css').read_text(encoding='utf-8')
    one_column=mobile_one_column_selectors(css)
    assert '.mobile-nav{display:block}' in css
    assert '.lab-control-grid' in one_column,'.lab-control-grid missing from mobile one-column rule'
    assert '.campaign-grid' in one_column,'.campaign-grid missing from mobile one-column rule'
    assert '.compare-grid{grid-template-columns:1fr}' in css
    for relative in ('','labs/instruction-conflict/','labs/agent-workflow-graph/','build/reliable-support-agent/','pricing/','early-access/'):
        for locale in SUPPORTED_LOCALES:
            soup=BeautifulSoup(page_file(locale,relative).read_text(encoding='utf-8'),'html.parser'); assert soup.select_one('details.mobile-nav') is not None,(locale,relative,'mobile menu')
            if relative.startswith(('labs/','build/')): assert soup.select_one('input[type="range"], select') is not None,(locale,relative,'interactive control')


def annotation(value:object)->str:
    return str(value).replace('%','%25').replace('\r','%0D').replace('\n','%0A')[:7000]


def main():
    checks=(('content-source-leakage',test_content_sources),('page-seo-and-alternates',test_pages_and_alternates),('sitemap-and-geo',test_sitemap_and_geo),('runtime-and-backend',test_shared_runtime_and_backend_contract),('mobile-contract',test_mobile_contract))
    for name,check in checks:
        try: check(); print(f'PASS {name}')
        except Exception as exc: print(f'::error title=Localization QA {name}::{annotation(exc)}'); raise
    print(f'PASS release localization QA: {len(PUBLIC_ROUTE_RELATIVES)} route pairs, reciprocal SEO, bilingual sitemap/GEO, leakage guard, locale analytics contract, and mobile structure.')


if __name__=='__main__': main()
