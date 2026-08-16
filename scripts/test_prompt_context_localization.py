from __future__ import annotations

from pathlib import Path
import json
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'

LEGACY={
    'instruction-conflict':{
        'mount':'[data-instruction-conflict-lab]','copy':'data-instruction-copy',
        'scripts':['/assets/instruction-conflict-scenario.js','/assets/prompt-authority.js'],
    },
    'rag-failure':{
        'mount':'[data-rag-lab]','copy':'data-rag-copy','scripts':['/assets/rag.js'],
    },
    'context-compression':{
        'mount':'[data-context-compression-lab]','copy':'data-context-compression-copy',
        'scripts':['/assets/context-compression-scenario.js','/assets/context-compression.js'],
    },
}
MISSION={
    'instruction-conflict':{
        'mount':'[data-prompt-injection-mission]','copy':'data-mission-copy',
        'scripts':['/assets/mission-engine.js','/assets/prompt-injection-attack-scenario.js','/assets/prompt-injection-attack-mission.js','/assets/prompt-injection-attack.js'],
    },
    'rag-failure':{
        'mount':'[data-broken-rag-mission]','copy':'data-mission-copy',
        'scripts':['/assets/mission-engine.js','/assets/broken-rag-pipeline-scenario.js','/assets/broken-rag-pipeline-mission.js','/assets/broken-rag-pipeline.js'],
    },
}


def load(locale: str, slug: str):
    prefix='en' if locale=='en' else 'zh-cn'
    path=SITE/prefix/'labs'/slug/'index.html'
    assert path.exists(), f'missing localized lab: {path.relative_to(SITE)}'
    return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')


def contract_for(en,zh,slug: str):
    mission=MISSION.get(slug)
    if mission and en.select_one(mission['mount']) is not None:
        assert zh.select_one(mission['mount']) is not None, f'{slug}: locale Mission mount mismatch'
        return mission,'mission'
    legacy=LEGACY[slug]
    assert en.select_one(legacy['mount']) is not None and zh.select_one(legacy['mount']) is not None
    return legacy,'legacy'


def main():
    assert not list((SITE/'assets').glob('*-zh.js')), 'locale-specific JS is forbidden'
    assert not list((SITE/'assets').glob('*.zh.js')), 'locale-specific JS is forbidden'

    resolved={}
    for slug in ('instruction-conflict','rag-failure','context-compression'):
        en=load('en',slug);zh=load('zh-CN',slug)
        assert en.html.get('lang')=='en';assert zh.html.get('lang')=='zh-CN'
        contract,kind=contract_for(en,zh,slug);resolved[slug]=(contract,kind,en,zh)

        en_scripts=[n.get('src') for n in en.find_all('script',src=True)]
        zh_scripts=[n.get('src') for n in zh.find_all('script',src=True)]
        assert en_scripts==zh_scripts, f'{slug}: locales must load identical runtime assets'
        for required in ['/assets/lab-engine.js','/assets/lab-scenarios.js',*contract['scripts']]:
            assert required in en_scripts, (slug,required)

        en_mount=en.select_one(contract['mount']);zh_mount=zh.select_one(contract['mount'])
        en_copy=json.loads(en_mount[contract['copy']]);zh_copy=json.loads(zh_mount[contract['copy']])
        assert en_copy and zh_copy

        zh_text=zh.get_text(' ',strip=True)
        cjk=sum('\u3400'<=ch<='\u9fff' for ch in zh_text)
        assert cjk>=280, f'{slug}: zh-CN copy too thin ({cjk} CJK chars)'

        assert f'/en/labs/{slug}/' in en.find('link',rel='canonical')['href']
        assert f'/zh-cn/labs/{slug}/' in zh.find('link',rel='canonical')['href']

    contract,kind,en,zh=resolved['instruction-conflict']
    instruction=json.loads(zh.select_one(contract['mount'])[contract['copy']])
    if kind=='mission':
        assert {'SECURITY_VETO','SAFE_BUT_OVERBLOCKING','PRODUCTION_VIABLE'}<=set(instruction['outcomes'])
        assert {'context-provenance','permission-scopes','policy-trace'}<=set(instruction['evidenceLabels'])
    else:
        assert set(instruction['diagnosis'])=={'authority-conflict','context-as-instruction','ambiguous-policy','output-contract','harness-boundary'}
        assert set(instruction['sources'])=={'system','developer','retrieved','user','tool'}

    contract,kind,en,zh=resolved['rag-failure']
    rag=json.loads(zh.select_one(contract['mount'])[contract['copy']])
    if kind=='mission':
        assert {'STALE_AUTHORITY_FAILURE','CONTEXT_OVERFLOW','PRODUCTION_VIABLE'}<=set(rag['outcomes'])
        assert {'retrieval-trace','documents','context-composition','answer'}<=set(rag['evidenceLabels'])
    else:
        assert set(rag['presentation']['failure'])=={'healthy','missed-evidence','retrieval-noise','weak-tradeoff'}

    contract,kind,en,zh=resolved['context-compression']
    compression=json.loads(zh.select_one(contract['mount'])[contract['copy']])
    assert set(compression['diagnosis'])=={
        'healthy','context-budget-overflow','retrieval-budget-starvation','critical-information-loss',
        'evidence-starvation','instruction-loss','quality-regression','cost-heavy-context'
    }
    assert set(compression['segments'])=={
        'system-policy','customer-request','account-state','refund-policy','retrieved-order-evidence',
        'recent-conversation','long-term-memory','tool-trace','product-background'
    }

    for asset in ['instruction-conflict-scenario.js','lab-scenarios.js','context-compression-scenario.js','broken-rag-pipeline-scenario.js','prompt-injection-attack-scenario.js']:
        path=SITE/'assets'/asset
        if not path.exists():
            continue
        text=path.read_text(encoding='utf-8')
        assert 'zh-CN' not in text and '/zh-cn/' not in text, f'{asset}: locale logic leaked into scenario'

    print('PASS: Prompt/Context en + zh-CN routes preserve shared runtime semantics across legacy Labs and v0.8 Mission migrations.')


if __name__=='__main__':
    main()
