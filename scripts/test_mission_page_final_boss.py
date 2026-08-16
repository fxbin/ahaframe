from __future__ import annotations

import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'


def require(text: str, token: str, label: str):
    assert token in text, f'{label}: missing {token!r}'


def forbid(text: str, token: str, label: str):
    assert token not in text, f'{label}: stale token present {token!r}'


def check(locale: str, expected_title: str):
    prefix='zh-cn' if locale=='zh-CN' else 'en'
    path=SITE/prefix/'build'/'reliable-support-agent'/'index.html'
    assert path.exists(), f'missing generated Final Boss route: {path}'
    text=path.read_text(encoding='utf-8')
    label=f'{locale} Final Boss page'
    require(text,'data-production-support-launch',label)
    require(text,expected_title,label)
    require(text,'data-mission-evidence="release-scorecard"',label)
    require(text,'data-mission-evidence="release-blockers"',label)
    require(text,'data-mission-control="prompt-policy"',label)
    require(text,'data-mission-control="evaluation-policy"',label)
    require(text,'data-mission-budget>5<',label)
    require(text,'data-mission-rationale',label)
    require(text,'data-mission-decision="SHIP"',label)
    require(text,'data-mission-decision="BLOCK"',label)
    require(text,'data-mission-decision="INCONCLUSIVE"',label)
    require(text,'?intent=validation-alpha',label)
    scripts=[
        '/assets/mission-engine.js',
        '/assets/instruction-conflict-scenario.js',
        '/assets/evaluation-scenario.js',
        '/assets/context-compression-scenario.js',
        '/assets/agent-workflow-graph-scenario.js',
        '/assets/reliable-support-scenario.js',
        '/assets/production-support-launch-mission.js',
        '/assets/production-support-launch.js',
    ]
    positions=[]
    for script in scripts:
        require(text,script,label)
        positions.append(text.index(script))
    assert positions==sorted(positions), f'{label}: Final Boss scripts must preserve runtime load order'
    forbid(text,'/assets/integrated-build.js',label)
    forbid(text,'data-reliable-support-agent',label)
    forbid(text,'data-build-reference',label)


check('en','Ship the Production Support Agent')
check('zh-CN','发布生产客服 Agent')

for locale in ('en','zh-CN'):
    source=ROOT/'content'/f'mission-final-boss.{locale}.json'
    data=json.loads(source.read_text(encoding='utf-8'))
    assert data['locale']==locale
    assert data['mission']['minutes']==25
    assert data['mission']['next']['href']=='/en/early-access/'
    assert data['mission']['next']['query']=='?intent=validation-alpha'
    assert len(data['mission']['groups'])==6

print('PASS generated Final Boss Mission: preserved capstone route, bilingual content, five-point budget, evidence console, rationale, explicit release decision, and no reference-architecture cheat.')
