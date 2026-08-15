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
    path=SITE/prefix/'labs'/'agent-reliability'/'index.html'
    assert path.exists(), f'missing generated Mission route: {path}'
    text=path.read_text(encoding='utf-8')
    label=f'{locale} $47,000 Retry page'
    require(text,'data-retry-mission',label)
    require(text,'The $47,000 Retry',label)
    require(text,'data-mission-evidence="tool-timeline"',label)
    require(text,'data-mission-control="idempotency"',label)
    require(text,'data-mission-control="compensation"',label)
    require(text,'data-mission-decision="SHIP"',label)
    require(text,'data-mission-decision="BLOCK"',label)
    scripts=[
        '/assets/mission-engine.js',
        '/assets/47000-retry-scenario.js',
        '/assets/47000-retry-mission.js',
        '/assets/47000-retry.js',
    ]
    positions=[]
    for script in scripts:
        require(text,script,label)
        positions.append(text.index(script))
    assert positions==sorted(positions), f'{label}: Mission scripts must preserve runtime load order'
    forbid(text,'/assets/agent-reliability.js',label)
    forbid(text,'data-agent-reliability-lab',label)


check('en')
check('zh-CN')

for locale in ('en','zh-CN'):
    source=ROOT/'content'/f'mission-47000-retry.{locale}.json'
    data=json.loads(source.read_text(encoding='utf-8'))
    assert data['locale']==locale
    assert data['mission']['minutes']==15
    assert data['mission']['next']['href']=='/en/labs/instruction-conflict/'

print('PASS generated $47,000 Retry Mission: preserved route, bilingual content, runtime controls, decision flow, asset order, old reliability adapter removed.')
