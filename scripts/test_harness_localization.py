from __future__ import annotations

from pathlib import Path
import json
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
SLUG='agent-reliability'


def load(locale: str):
    prefix='en' if locale=='en' else 'zh-cn'
    path=SITE/prefix/'labs'/SLUG/'index.html'
    assert path.exists(), f'missing localized lab: {path.relative_to(SITE)}'
    return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')


def assert_common(en,zh):
    assert en.html.get('lang')=='en'
    assert zh.html.get('lang')=='zh-CN'
    en_scripts=[n.get('src') for n in en.find_all('script',src=True)]
    zh_scripts=[n.get('src') for n in zh.find_all('script',src=True)]
    assert en_scripts==zh_scripts, 'Harness locales must load identical runtime assets'
    assert '/assets/lab-engine.js' in en_scripts and '/assets/lab-scenarios.js' in en_scripts
    assert '/en/labs/agent-reliability/' in en.find('link',rel='canonical')['href']
    assert '/zh-cn/labs/agent-reliability/' in zh.find('link',rel='canonical')['href']
    zh_text=zh.get_text(' ',strip=True)
    cjk=sum('\u3400'<=ch<='\u9fff' for ch in zh_text)
    assert cjk>=420, f'agent-reliability: zh-CN copy too thin ({cjk} CJK chars)'
    en_cta=en.select_one('[data-event="agent_reliability_paid_intent_click"]')
    zh_cta=zh.select_one('[data-event="agent_reliability_paid_intent_click"]')
    assert en_cta is not None and zh_cta is not None, 'paid-intent event must remain stable across locales'
    assert en_cta.get('href')=='/en/early-access/?intent=agent-reliability-production-labs'
    assert zh_cta.get('href')=='/zh-cn/early-access/?intent=agent-reliability-production-labs'
    return en_scripts


def assert_legacy(en,zh,en_scripts):
    assert '/assets/agent-reliability.js' in en_scripts
    en_mount=en.select_one('[data-agent-reliability-lab]');zh_mount=zh.select_one('[data-agent-reliability-lab]')
    assert en_mount is not None and zh_mount is not None
    en_copy=json.loads(en_mount['data-agent-reliability-copy']);zh_copy=json.loads(zh_mount['data-agent-reliability-copy'])
    assert set(en_copy['diagnosis'])==set(zh_copy['diagnosis'])=={
        'healthy','runaway-loop','unsafe-action','task-failure','slow-policy','expensive-policy'
    }
    assert set(en_copy['validation'])==set(zh_copy['validation'])=={'on','off'}
    assert set(en_copy['human'])==set(zh_copy['human'])=={'on','off'}
    scenario=(SITE/'assets'/'lab-scenarios.js').read_text(encoding='utf-8')
    adapter=(SITE/'assets'/'agent-reliability.js').read_text(encoding='utf-8')
    assert "id:'agent-reliability'" in scenario
    assert 'zh-CN' not in scenario and '/zh-cn/' not in scenario, 'locale logic leaked into shared scenario'
    assert "derived.failureType" in adapter and "copy.diagnosis" in adapter
    assert "agent_reliability_parameter_changed" in adapter


def assert_mission(en,zh,en_scripts):
    required=['/assets/mission-engine.js','/assets/47000-retry-scenario.js','/assets/47000-retry-mission.js','/assets/47000-retry.js']
    for asset in required:
        assert asset in en_scripts, asset
    positions=[en_scripts.index(asset) for asset in required]
    assert positions==sorted(positions), 'Retry Mission runtime asset order must be stable'
    assert '/assets/agent-reliability.js' not in en_scripts, 'legacy adapter must not drive the Mission route'

    en_mount=en.select_one('[data-retry-mission]');zh_mount=zh.select_one('[data-retry-mission]')
    assert en_mount is not None and zh_mount is not None
    en_copy=json.loads(en_mount['data-mission-copy']);zh_copy=json.loads(zh_mount['data-mission-copy'])
    expected={'DUPLICATE_SIDE_EFFECT','SAFE_BUT_TOO_MANUAL','SAFE_BUT_LOW_RECOVERY','SAFE_BUT_TOO_SLOW','SAFE_BUT_TOO_EXPENSIVE','PRODUCTION_VIABLE'}
    assert set(en_copy['outcomes'])==set(zh_copy['outcomes'])==expected
    assert [item['key'] for item in en_copy['metrics']]==[item['key'] for item in zh_copy['metrics']]

    scenario=(SITE/'assets'/'47000-retry-scenario.js').read_text(encoding='utf-8')
    mission=(SITE/'assets'/'47000-retry-mission.js').read_text(encoding='utf-8')
    adapter=(SITE/'assets'/'47000-retry.js').read_text(encoding='utf-8')
    for machine_asset in (scenario,mission):
        assert 'zh-CN' not in machine_asset and '/zh-cn/' not in machine_asset, 'locale logic leaked into Retry Mission machine model'
    assert '/zh-cn/' not in adapter, 'locale-specific route leaked into shared Retry adapter'
    assert "id:'47000-retry-scenario'" in scenario
    assert "id:'47000-retry'" in mission
    assert "agent_reliability_parameter_changed" in adapter
    assert "missionId:'47000-retry'" in adapter
    assert 'mission_policy_changed' not in adapter


def main():
    assert not list((SITE/'assets').glob('*-zh.js')), 'locale-specific JS is forbidden'
    assert not list((SITE/'assets').glob('*.zh.js')), 'locale-specific JS is forbidden'
    en=load('en');zh=load('zh-CN')
    en_scripts=assert_common(en,zh)
    if en.select_one('[data-retry-mission]') is not None:
        assert_mission(en,zh,en_scripts)
        mode='Mission'
    else:
        assert_legacy(en,zh,en_scripts)
        mode='legacy Lab'
    print(f'PASS: Harness en + zh-CN {mode} route preserves runtime parity, stable paid-intent semantics, and locale-neutral machine semantics.')


if __name__=='__main__':
    main()
