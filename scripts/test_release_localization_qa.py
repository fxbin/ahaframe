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
INTENTIONAL_EQUAL_STRINGS={
    'AhaFrame','AI','LLM','Prompt','Context','Agent','Harness','Loop','Graph','Evaluation','RAG','Retrieval','Reranker',
    'Token','Token Playground','Hybrid','Top-K','Schema','Judge','Gate','SHIP','BLOCK','INCONCLUSIVE','SEE','PLAY','BREAK','AHA','BUILD',
    'Temperature','Coordinator + Workers','Production Labs','Validation Alpha','Capstone','Rubric','API','JSON','SQL','ON','OFF','s','pts',
}
BANNED_ZH_VISIBLE=(
    'Mark lesson complete','Not started','Did this change how you think about this system?','Send feedback',
    'Waiting for changes','Key takeaways','Common questions','In one sentence','Build challenge','Current diagnosis',
    'Get Production Labs','Reset baseline','Reset starting architecture','Apply reference architecture',
)


def page_file(locale: str, relative: str) -> Path:
    base=SITE/route_prefix(locale)
    return base/'index.html' if not relative else base/relative/'index.html'


def cjk_count(text: str) -> int:
    return sum('\u3400'<=ch<='\u9fff' for ch in text)


def visible_text(soup: BeautifulSoup) -> str:
    clone=BeautifulSoup(str(soup),'html.parser')
    for tag in clone(['script','style','code','pre']):
        tag.decompose()
    return ' '.join(clone.stripped_strings)


def iter_equal_strings(en,zh,path=''):
    if isinstance(en,dict) and isinstance(zh,dict):
        for key in en.keys()&zh.keys():
            yield from iter_equal_strings(en[key],zh[key],f'{path}.{key}' if path else key)
    elif isinstance(en,list) and isinstance(zh,list):
        for index,(left,right) in enumerate(zip(en,zh)):
            yield from iter_equal_strings(left,right,f'{path}[{index}]')
    elif isinstance(en,str) and isinstance(zh,str) and en==zh:
        yield path,en


def allowed_equal(value: str) -> bool:
    stripped=value.strip()
    if not stripped:
        return True
    if stripped in INTENTIONAL_EQUAL_STRINGS:
        return True
    if stripped.startswith(('/', '?', '#', 'http://', 'https://')):
        return True
    if re.fullmatch(r'[a-z0-9_-]+(?:\.[a-z0-9_-]+)*',stripped) and ('_' in stripped or '-' in stripped):
        return True
    if re.fullmatch(r'[\d\s.:/+×→%–—-]+',stripped):
        return True
    return False


def test_content_sources():
    failures=[]
    for en_path in sorted((ROOT/'content').glob('*.en.json')):
        zh_path=en_path.with_name(en_path.name.replace('.en.json','.zh-CN.json'))
        if not zh_path.exists():
            failures.append(f'{en_path.name}: missing zh-CN pair')
            continue
        en=json.loads(en_path.read_text(encoding='utf-8'))
        zh=json.loads(zh_path.read_text(encoding='utf-8'))
        for path,value in iter_equal_strings(en,zh):
            if not allowed_equal(value):
                failures.append(f'{zh_path.name}:{path}: untranslated exact English string {value!r}')
    assert not failures, '\n'.join(failures[:40])


def test_pages_and_alternates():
    expected_hreflangs={HREFLANG[locale] for locale in SUPPORTED_LOCALES}|{'x-default'}
    for relative in PUBLIC_ROUTE_RELATIVES:
        equivalents=equivalent_paths(f'/en/{relative}')
        for locale in SUPPORTED_LOCALES:
            path=page_file(locale,relative)
            assert path.exists(), path
            soup=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
            expected_url=BASE+equivalents[locale]
            assert soup.html.get('lang')==locale, (relative,locale,'lang')
            viewport=soup.find('meta',attrs={'name':'viewport'})
            assert viewport and 'width=device-width' in viewport.get('content',''), (relative,locale,'viewport')
            canonical=soup.find('link',rel='canonical')
            assert canonical and canonical.get('href')==expected_url, (relative,locale,'canonical')
            alternates={node.get('hreflang'):node.get('href') for node in soup.find_all('link',rel='alternate')}
            assert set(alternates)==expected_hreflangs, (relative,locale,alternates)
            for target_locale,target_path in equivalents.items():
                assert alternates[HREFLANG[target_locale]]==BASE+target_path
            assert alternates['x-default']==BASE+equivalents['en']
            title=soup.title.get_text(strip=True) if soup.title else ''
            desc=(soup.find('meta',attrs={'name':'description'}) or {}).get('content','')
            assert title and desc, (relative,locale,'metadata')
            if locale=='zh-CN':
                assert cjk_count(title+desc)>=8, (relative,'zh metadata too thin',title,desc)
                text=visible_text(soup)
                for banned in BANNED_ZH_VISIBLE:
                    assert banned not in text, (relative,'untranslated UI',banned)
                assert not re.search(r'\b\d+\s+min\b',text), (relative,'use Chinese minute unit')
            assert soup.select_one('.mobile-nav') is not None, (relative,locale,'mobile nav')
            switch=soup.select_one('.language-switcher')
            assert switch is not None, (relative,locale,'language switcher')
            counterpart=equivalents['zh-CN' if locale=='en' else 'en']
            assert switch.find('a',href=counterpart) is not None, (relative,locale,'counterpart link')
            for node in soup.find_all('script',attrs={'type':'application/ld+json'}):
                obj=json.loads(node.string or '{}')
                stack=[obj]
                while stack:
                    item=stack.pop()
                    if isinstance(item,dict):
                        if 'inLanguage' in item:
                            assert item['inLanguage']==locale, (relative,locale,'schema language',item.get('@type'))
                        stack.extend(item.values())
                    elif isinstance(item,list):
                        stack.extend(item)


def test_sitemap_and_geo():
    tree=ET.parse(SITE/'sitemap.xml')
    ns={'sm':'http://www.sitemaps.org/schemas/sitemap/0.9','x':'http://www.w3.org/1999/xhtml'}
    url_nodes=tree.findall('sm:url',ns)
    expected={BASE+path for relative in PUBLIC_ROUTE_RELATIVES for path in equivalent_paths(f'/en/{relative}').values()}
    actual={node.find('sm:loc',ns).text for node in url_nodes}
    assert actual==expected, f'sitemap mismatch missing={expected-actual} extra={actual-expected}'
    for node in url_nodes:
        links=node.findall('x:link',ns)
        hreflangs={link.attrib.get('hreflang') for link in links}
        assert hreflangs=={'en','zh-CN','x-default'}, (node.find('sm:loc',ns).text,hreflangs)
    llms=(SITE/'llms.txt').read_text(encoding='utf-8')
    assert f'{BASE}/zh-cn/' in llms and '简体中文学习入口' in llms


def test_shared_runtime_and_backend_contract():
    validation=(SITE/'assets'/'validation-context.js').read_text(encoding='utf-8')
    app=(SITE/'assets'/'app.js').read_text(encoding='utf-8')
    ui=(SITE/'assets'/'validation-ui.js').read_text(encoding='utf-8')
    assert "'zh-cn':'zh-CN'" in validation
    assert 'locale:c.locale' in validation
    assert "'zh-CN':" in app and "'zh-CN':" in ui
    assert "dataset.decision==='SHIP'" in ui, 'capstone completion must use stable decision enum, not localized visible text'
    assert "textContent||''" not in ui.split('function checkCapstone',1)[1].split('function bindFallbackControls',1)[0]
    combined='\n'.join(p.read_text(encoding='utf-8') for p in (SITE/'assets').glob('*.js'))
    assert not re.search(r"track\(['\"][^'\"]*(?:_zh|zh_|_cn|cn_)[^'\"]*['\"]",combined,re.I), 'locale-specific analytics event name found'
    migration=(ROOT/'supabase/migrations/202608150001_validation_locale.sql').read_text(encoding='utf-8')
    ingest=(ROOT/'supabase/functions/validation-ingest/index.ts').read_text(encoding='utf-8')
    assert migration.count('add column if not exists locale')==3
    assert ingest.count('locale: locale(body.locale)')==3


def test_mobile_contract():
    css=(SITE/'assets'/'styles.css').read_text(encoding='utf-8')
    assert '@media(max-width:760px)' in css
    for selector in ('.mobile-nav{display:block}', '.lab-control-grid{grid-template-columns:1fr!important}', '.compare-grid{grid-template-columns:1fr}'):
        assert selector in css, selector
    for relative in ('','labs/instruction-conflict/','labs/agent-workflow-graph/','build/reliable-support-agent/','pricing/','early-access/'):
        for locale in SUPPORTED_LOCALES:
            soup=BeautifulSoup(page_file(locale,relative).read_text(encoding='utf-8'),'html.parser')
            assert soup.select_one('details.mobile-nav') is not None, (locale,relative,'mobile menu')
            if '/labs/' in f'/{relative}' or relative.startswith('build/'):
                assert soup.select_one('input[type="range"], select') is not None, (locale,relative,'interactive control')


def main():
    test_content_sources()
    test_pages_and_alternates()
    test_sitemap_and_geo()
    test_shared_runtime_and_backend_contract()
    test_mobile_contract()
    print(f'PASS release localization QA: {len(PUBLIC_ROUTE_RELATIVES)} route pairs, reciprocal SEO, bilingual sitemap/GEO, leakage guard, locale analytics contract, and mobile structure.')


if __name__=='__main__':
    main()
