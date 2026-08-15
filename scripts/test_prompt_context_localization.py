from __future__ import annotations

from pathlib import Path
import json
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'

LABS={
    'instruction-conflict':{
        'mount':'[data-instruction-conflict-lab]',
        'copy':'data-instruction-copy',
        'scripts':['/assets/instruction-conflict-scenario.js','/assets/prompt-authority.js'],
        'scenario':'instruction-conflict',
    },
    'rag-failure':{
        'mount':'[data-rag-lab]',
        'copy':'data-rag-copy',
        'scripts':['/assets/rag.js'],
        'scenario':'rag-failure',
    },
    'context-compression':{
        'mount':'[data-context-compression-lab]',
        'copy':'data-context-compression-copy',
        'scripts':['/assets/context-compression-scenario.js','/assets/context-compression.js'],
        'scenario':'context-compression',
    },
}


def load(locale: str, slug: str):
    prefix='en' if locale=='en' else 'zh-cn'
    path=SITE/prefix/'labs'/slug/'index.html'
    assert path.exists(), f'missing localized lab: {path.relative_to(SITE)}'
    return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')


def main():
    assert not list((SITE/'assets').glob('*-zh.js')), 'locale-specific JS is forbidden'
    assert not list((SITE/'assets').glob('*.zh.js')), 'locale-specific JS is forbidden'

    for slug,contract in LABS.items():
        en=load('en',slug)
        zh=load('zh-CN',slug)
        assert en.html.get('lang')=='en'
        assert zh.html.get('lang')=='zh-CN'

        en_scripts=[n.get('src') for n in en.find_all('script',src=True)]
        zh_scripts=[n.get('src') for n in zh.find_all('script',src=True)]
        assert en_scripts==zh_scripts, f'{slug}: locales must load identical runtime assets'
        for required in ['/assets/lab-engine.js','/assets/lab-scenarios.js',*contract['scripts']]:
            assert required in en_scripts, (slug,required)

        en_mount=en.select_one(contract['mount'])
        zh_mount=zh.select_one(contract['mount'])
        assert en_mount is not None and zh_mount is not None
        en_copy=json.loads(en_mount[contract['copy']])
        zh_copy=json.loads(zh_mount[contract['copy']])
        assert en_copy and zh_copy

        zh_text=zh.get_text(' ',strip=True)
        cjk=sum('\u3400'<=ch<='\u9fff' for ch in zh_text)
        assert cjk>=280, f'{slug}: zh-CN copy too thin ({cjk} CJK chars)'

        en_canonical=en.find('link',rel='canonical')['href']
        zh_canonical=zh.find('link',rel='canonical')['href']
        assert f'/en/labs/{slug}/' in en_canonical
        assert f'/zh-cn/labs/{slug}/' in zh_canonical

    # Presentation keys are semantic mappings, while scenario files stay locale-neutral.
    instruction=json.loads(load('zh-CN','instruction-conflict').select_one('[data-instruction-conflict-lab]')['data-instruction-copy'])
    assert set(instruction['diagnosis'])=={'authority-conflict','context-as-instruction','ambiguous-policy','output-contract','harness-boundary'}
    assert set(instruction['sources'])=={'system','developer','retrieved','user','tool'}

    rag=json.loads(load('zh-CN','rag-failure').select_one('[data-rag-lab]')['data-rag-copy'])
    assert set(rag['presentation']['failure'])=={'healthy','missed-evidence','retrieval-noise','weak-tradeoff'}

    compression=json.loads(load('zh-CN','context-compression').select_one('[data-context-compression-lab]')['data-context-compression-copy'])
    assert set(compression['diagnosis'])=={
        'healthy','context-budget-overflow','retrieval-budget-starvation','critical-information-loss',
        'evidence-starvation','instruction-loss','quality-regression','cost-heavy-context'
    }
    assert set(compression['segments'])=={
        'system-policy','customer-request','account-state','refund-policy','retrieved-order-evidence',
        'recent-conversation','long-term-memory','tool-trace','product-background'
    }

    scenario_files=['instruction-conflict-scenario.js','lab-scenarios.js','context-compression-scenario.js']
    for asset in scenario_files:
        text=(SITE/'assets'/asset).read_text(encoding='utf-8')
        assert 'zh-CN' not in text and '/zh-cn/' not in text, f'{asset}: locale logic leaked into scenario'
    assert "id:'instruction-conflict'" in (SITE/'assets'/'instruction-conflict-scenario.js').read_text(encoding='utf-8')
    assert "id:'rag-failure'" in (SITE/'assets'/'lab-scenarios.js').read_text(encoding='utf-8')
    assert "id:'context-compression'" in (SITE/'assets'/'context-compression-scenario.js').read_text(encoding='utf-8')

    print('PASS: Prompt/Context en + zh-CN Labs share identical runtime assets, stable scenario IDs, parseable presentation maps, and locale-neutral scenarios.')


if __name__=='__main__':
    main()
