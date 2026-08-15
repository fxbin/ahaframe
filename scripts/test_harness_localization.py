from __future__ import annotations

from pathlib import Path
import json
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
SLUG='agent-reliability'
MOUNT='[data-agent-reliability-lab]'
COPY='data-agent-reliability-copy'


def load(locale: str):
    prefix='en' if locale=='en' else 'zh-cn'
    path=SITE/prefix/'labs'/SLUG/'index.html'
    assert path.exists(), f'missing localized lab: {path.relative_to(SITE)}'
    return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')


def main():
    assert not list((SITE/'assets').glob('*-zh.js')), 'locale-specific JS is forbidden'
    assert not list((SITE/'assets').glob('*.zh.js')), 'locale-specific JS is forbidden'

    en=load('en');zh=load('zh-CN')
    assert en.html.get('lang')=='en'
    assert zh.html.get('lang')=='zh-CN'

    en_scripts=[n.get('src') for n in en.find_all('script',src=True)]
    zh_scripts=[n.get('src') for n in zh.find_all('script',src=True)]
    assert en_scripts==zh_scripts, 'Harness locales must load identical runtime assets'
    for required in ['/assets/lab-engine.js','/assets/lab-scenarios.js','/assets/agent-reliability.js']:
        assert required in en_scripts, required

    en_mount=en.select_one(MOUNT);zh_mount=zh.select_one(MOUNT)
    assert en_mount is not None and zh_mount is not None
    en_copy=json.loads(en_mount[COPY]);zh_copy=json.loads(zh_mount[COPY])
    assert set(en_copy['diagnosis'])==set(zh_copy['diagnosis'])=={
        'healthy','runaway-loop','unsafe-action','task-failure','slow-policy','expensive-policy'
    }
    assert set(en_copy['validation'])==set(zh_copy['validation'])=={'on','off'}
    assert set(en_copy['human'])==set(zh_copy['human'])=={'on','off'}

    zh_text=zh.get_text(' ',strip=True)
    cjk=sum('\u3400'<=ch<='\u9fff' for ch in zh_text)
    assert cjk>=420, f'agent-reliability: zh-CN copy too thin ({cjk} CJK chars)'

    assert '/en/labs/agent-reliability/' in en.find('link',rel='canonical')['href']
    assert '/zh-cn/labs/agent-reliability/' in zh.find('link',rel='canonical')['href']

    scenario=(SITE/'assets'/'lab-scenarios.js').read_text(encoding='utf-8')
    adapter=(SITE/'assets'/'agent-reliability.js').read_text(encoding='utf-8')
    assert "id:'agent-reliability'" in scenario
    assert 'zh-CN' not in scenario and '/zh-cn/' not in scenario, 'locale logic leaked into shared scenario'
    assert "derived.failureType" in adapter and "copy.diagnosis" in adapter, 'adapter must localize stable semantic failure keys'
    assert "agent_reliability_parameter_changed" in adapter, 'analytics event semantics must remain stable'

    print('PASS: Harness en + zh-CN routes share one scenario/adapter and localize only presentation semantics.')


if __name__=='__main__':
    main()
