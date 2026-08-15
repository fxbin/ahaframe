from __future__ import annotations

import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'


def require(text: str, token: str, label: str):
    assert token in text, f'{label}: missing {token!r}'


def forbid(text: str, token: str, label: str):
    assert token not in text, f'{label}: stale token present {token!r}'


def check(locale: str):
    prefix='zh-cn' if locale=='zh-CN' else 'en'
    path=SITE/prefix/'labs'/'instruction-conflict'/'index.html'
    assert path.exists(), f'missing generated Mission route: {path}'
    text=path.read_text(encoding='utf-8')
    label=f'{locale} Prompt Injection page'
    require(text,'data-prompt-injection-mission',label)
    require(text,'The Prompt Injection Attack',label)
    require(text,'data-mission-evidence="context-provenance"',label)
    require(text,'data-mission-evidence="permission-scopes"',label)
    require(text,'data-mission-control="tool-scope"',label)
    require(text,'data-mission-control="runtime-gate"',label)
    require(text,'data-mission-decision="SHIP"',label)
    scripts=[
        '/assets/mission-engine.js',
        '/assets/prompt-injection-attack-scenario.js',
        '/assets/prompt-injection-attack-mission.js',
        '/assets/prompt-injection-attack.js',
    ]
    positions=[]
    for script in scripts:
        require(text,script,label)
        positions.append(text.index(script))
    assert positions==sorted(positions), f'{label}: Mission scripts must preserve runtime load order'
    forbid(text,'/assets/prompt-authority.js',label)
    forbid(text,'data-instruction-conflict-lab',label)


check('en')
check('zh-CN')

for locale in ('en','zh-CN'):
    source=ROOT/'content'/f'mission-prompt-injection.{locale}.json'
    data=json.loads(source.read_text(encoding='utf-8'))
    assert data['locale']==locale
    assert data['mission']['minutes']==15
    assert data['mission']['next']['href']=='/en/build/reliable-support-agent/'

print('PASS generated Prompt Injection Mission: preserved route, bilingual content, provenance/capability evidence, decision flow, asset order, old prompt adapter removed.')
