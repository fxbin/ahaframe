from __future__ import annotations

from pathlib import Path
import json
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
MOUNT='[data-reliable-support-agent]'
COPY='data-build-copy'
BLOCKER_CODES={
    'prompt-conflicts','context-overflow','graph-propagation','loop-runaway',
    'architecture-threshold','safety-floor','retrieval-recall-floor',
    'critical-retention-floor','cost-budget',
}
WARNING_CODES={'prompt-open','graph-coordination','approval-load','demo-evaluation','weak-context-economics'}
POLICY_KEYS={'prompt','retrieval','context','execution','graph','evaluation'}


def load(locale: str):
    prefix='en' if locale=='en' else 'zh-cn'
    path=SITE/prefix/'build'/'reliable-support-agent'/'index.html'
    assert path.exists(), f'missing localized build: {path.relative_to(SITE)}'
    return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')


def main():
    assert not list((SITE/'assets').glob('*-zh.js')), 'locale-specific JS is forbidden'
    assert not list((SITE/'assets').glob('*.zh.js')), 'locale-specific JS is forbidden'

    en=load('en');zh=load('zh-CN')
    assert en.html.get('lang')=='en'
    assert zh.html.get('lang')=='zh-CN'

    en_scripts=[n.get('src') for n in en.find_all('script',src=True)]
    zh_scripts=[n.get('src') for n in zh.find_all('script',src=True)]
    assert en_scripts==zh_scripts, 'Integrated Build locales must load identical runtime assets'
    for required in [
        '/assets/lab-engine.js','/assets/lab-scenarios.js',
        '/assets/instruction-conflict-scenario.js','/assets/evaluation-scenario.js',
        '/assets/context-compression-scenario.js','/assets/agent-workflow-graph-scenario.js',
        '/assets/reliable-support-scenario.js','/assets/integrated-build.js',
    ]:
        assert required in en_scripts, required

    en_mount=en.select_one(MOUNT);zh_mount=zh.select_one(MOUNT)
    assert en_mount is not None and zh_mount is not None
    en_copy=json.loads(en_mount[COPY]);zh_copy=json.loads(zh_mount[COPY])
    assert set(en_copy['decision'])==set(zh_copy['decision'])=={'SHIP','BLOCK','INCONCLUSIVE'}
    assert set(en_copy['blockers'])==set(zh_copy['blockers'])==BLOCKER_CODES
    assert set(en_copy['warnings'])==set(zh_copy['warnings'])==WARNING_CODES
    assert set(en_copy['policyLabels'])==set(zh_copy['policyLabels'])==POLICY_KEYS
    for key in POLICY_KEYS:
        assert set(en_copy['policyLabels'][key])==set(zh_copy['policyLabels'][key]), key

    zh_text=zh.get_text(' ',strip=True)
    cjk=sum('\u3400'<=ch<='\u9fff' for ch in zh_text)
    assert cjk>=900, f'Integrated Build zh-CN copy too thin ({cjk} CJK chars)'

    assert '/en/build/reliable-support-agent/' in en.find('link',rel='canonical')['href']
    assert '/zh-cn/build/reliable-support-agent/' in zh.find('link',rel='canonical')['href']
    en_alpha=en.find('a',href='/en/early-access/?intent=validation-alpha')
    zh_alpha=zh.find('a',href='/zh-cn/early-access/?intent=validation-alpha')
    assert en_alpha is not None and zh_alpha is not None, 'Validation Alpha CTA semantics must remain locale-parallel'

    scenario=(SITE/'assets'/'reliable-support-scenario.js').read_text(encoding='utf-8')
    adapter=(SITE/'assets'/'integrated-build.js').read_text(encoding='utf-8')
    assert "id:'reliable-support-agent'" in scenario
    assert 'zh-CN' not in scenario and '/zh-cn/' not in scenario, 'locale logic leaked into Integrated Build scenario'
    for action in (
        'SET_PROMPT_POLICY','SET_RETRIEVAL_POLICY','SET_CONTEXT_POLICY',
        'SET_EXECUTION_POLICY','SET_GRAPH_POLICY','SET_EVALUATION_POLICY',
        'APPLY_REFERENCE_ARCHITECTURE',
    ):
        assert action in scenario, action
    for code in BLOCKER_CODES|WARNING_CODES:
        assert f"'{code}'" in scenario, code
    assert 'blockerDetails' in scenario and 'warningDetails' in scenario and 'diagnosisCode' in scenario
    assert 'derived.blockerDetails' in adapter
    assert 'derived.warningDetails' in adapter
    assert 'derived.diagnosisCode' in adapter
    assert "out('decision').dataset.decision=derived.decision" in adapter

    print('PASS: Integrated Build en + zh-CN share one six-layer scenario/adapter, stable semantic diagnostics/actions/decisions, and localized presentation only.')


if __name__=='__main__':
    main()
