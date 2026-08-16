from __future__ import annotations

from pathlib import Path
import json
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
BLOCKER_CODES={
    'prompt-conflicts','context-overflow','graph-propagation','loop-runaway',
    'architecture-threshold','safety-floor','retrieval-recall-floor',
    'critical-retention-floor','cost-budget',
}
WARNING_CODES={'prompt-open','graph-coordination','approval-load','demo-evaluation','weak-context-economics'}
POLICY_KEYS={'prompt','retrieval','context','execution','graph','evaluation'}
FINAL_OUTCOMES={
    'CRITICAL_SAFETY_VETO','RELEASE_BLOCKED','EVIDENCE_INCONCLUSIVE',
    'VIABLE_BUT_OUTSIDE_OPERATING_BUDGET','CONSTRAINT_MISS',
    'PRODUCTION_VIABLE_BALANCED','PRODUCTION_VIABLE_SAFETY_HEAVY',
}


def load(locale: str):
    prefix='en' if locale=='en' else 'zh-cn'
    path=SITE/prefix/'build'/'reliable-support-agent'/'index.html'
    assert path.exists(), f'missing localized build: {path.relative_to(SITE)}'
    return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')


def common(en,zh):
    assert en.html.get('lang')=='en'
    assert zh.html.get('lang')=='zh-CN'
    en_scripts=[n.get('src') for n in en.find_all('script',src=True)]
    zh_scripts=[n.get('src') for n in zh.find_all('script',src=True)]
    assert en_scripts==zh_scripts, 'Integrated Build locales must load identical runtime assets'
    assert '/assets/lab-engine.js' in en_scripts
    assert '/assets/lab-scenarios.js' in en_scripts
    assert '/en/build/reliable-support-agent/' in en.find('link',rel='canonical')['href']
    assert '/zh-cn/build/reliable-support-agent/' in zh.find('link',rel='canonical')['href']
    en_alpha=en.find('a',href='/en/early-access/?intent=validation-alpha')
    zh_alpha=zh.find('a',href='/zh-cn/early-access/?intent=validation-alpha')
    assert en_alpha is not None and zh_alpha is not None, 'Validation Alpha CTA semantics must remain locale-parallel'
    zh_text=zh.get_text(' ',strip=True)
    cjk=sum('\u3400'<=ch<='\u9fff' for ch in zh_text)
    assert cjk>=900, f'Integrated Build zh-CN copy too thin ({cjk} CJK chars)'
    return en_scripts


def assert_machine_scenario():
    scenario=(SITE/'assets'/'reliable-support-scenario.js').read_text(encoding='utf-8')
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


def assert_legacy(en,zh,en_scripts):
    for required in [
        '/assets/instruction-conflict-scenario.js','/assets/evaluation-scenario.js',
        '/assets/context-compression-scenario.js','/assets/agent-workflow-graph-scenario.js',
        '/assets/reliable-support-scenario.js','/assets/integrated-build.js',
    ]:
        assert required in en_scripts, required
    en_mount=en.select_one('[data-reliable-support-agent]');zh_mount=zh.select_one('[data-reliable-support-agent]')
    assert en_mount is not None and zh_mount is not None
    en_copy=json.loads(en_mount['data-build-copy']);zh_copy=json.loads(zh_mount['data-build-copy'])
    assert set(en_copy['decision'])==set(zh_copy['decision'])=={'SHIP','BLOCK','INCONCLUSIVE'}
    assert set(en_copy['blockers'])==set(zh_copy['blockers'])==BLOCKER_CODES
    assert set(en_copy['warnings'])==set(zh_copy['warnings'])==WARNING_CODES
    assert set(en_copy['policyLabels'])==set(zh_copy['policyLabels'])==POLICY_KEYS
    adapter=(SITE/'assets'/'integrated-build.js').read_text(encoding='utf-8')
    assert 'derived.blockerDetails' in adapter
    assert 'derived.warningDetails' in adapter
    assert "out('decision').dataset.decision=derived.decision" in adapter


def assert_final_boss(en,zh,en_scripts):
    required=[
        '/assets/mission-engine.js','/assets/instruction-conflict-scenario.js','/assets/evaluation-scenario.js',
        '/assets/context-compression-scenario.js','/assets/agent-workflow-graph-scenario.js',
        '/assets/reliable-support-scenario.js','/assets/production-support-launch-mission.js',
        '/assets/production-support-launch.js',
    ]
    for asset in required:
        assert asset in en_scripts, asset
    positions=[en_scripts.index(asset) for asset in required]
    assert positions==sorted(positions), 'Final Boss runtime load order must remain deterministic'
    assert '/assets/integrated-build.js' not in en_scripts, 'legacy adapter must not drive Final Boss route'

    en_mount=en.select_one('[data-production-support-launch]');zh_mount=zh.select_one('[data-production-support-launch]')
    assert en_mount is not None and zh_mount is not None
    en_copy=json.loads(en_mount['data-mission-copy']);zh_copy=json.loads(zh_mount['data-mission-copy'])
    assert set(en_copy['groups'])==set(zh_copy['groups'])==POLICY_KEYS
    for key in POLICY_KEYS:
        assert set(en_copy['groups'][key]['options'])==set(zh_copy['groups'][key]['options']),key
    assert set(en_copy['outcomes'])==set(zh_copy['outcomes'])==FINAL_OUTCOMES
    assert [item['key'] for item in en_copy['metrics']]==[item['key'] for item in zh_copy['metrics']]
    assert en.select_one('[data-mission-rationale]') is not None
    assert zh.select_one('[data-mission-rationale]') is not None
    assert en.select_one('[data-build-reference]') is None and zh.select_one('[data-build-reference]') is None

    mission=(SITE/'assets'/'production-support-launch-mission.js').read_text(encoding='utf-8')
    adapter=(SITE/'assets'/'production-support-launch.js').read_text(encoding='utf-8')
    assert "id:'production-support-launch'" in mission
    assert 'interventionBudget:5' in mission
    assert 'zh-CN' not in mission and '/zh-cn/' not in mission, 'locale logic leaked into Final Boss machine contract'
    assert '/zh-cn/' not in adapter, 'locale-specific route leaked into Final Boss shared adapter'
    assert 'reliable_support_agent_architecture_changed' in adapter
    assert "track?.('mission_completed'" in adapter
    assert 'capstone_completed' not in adapter, 'canonical capstone completion must be owned by Validation runtime'
    assert 'rationaleLengthBucket' in adapter and 'rationale:' not in adapter, 'rationale text must not enter analytics payloads'


def main():
    assert not list((SITE/'assets').glob('*-zh.js')), 'locale-specific JS is forbidden'
    assert not list((SITE/'assets').glob('*.zh.js')), 'locale-specific JS is forbidden'
    en=load('en');zh=load('zh-CN')
    en_scripts=common(en,zh)
    assert_machine_scenario()
    if en.select_one('[data-production-support-launch]') is not None:
        assert_final_boss(en,zh,en_scripts)
        mode='Final Boss Mission'
    else:
        assert_legacy(en,zh,en_scripts)
        mode='legacy Integrated Build'
    print(f'PASS: Integrated Build en + zh-CN {mode} preserves one six-layer machine model, stable release semantics, and localized presentation only.')


if __name__=='__main__':
    main()
