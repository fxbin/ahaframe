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
    path=SITE/prefix/'labs'/'rag-failure'/'index.html'
    assert path.exists(), f'missing generated Mission route: {path}'
    text=path.read_text(encoding='utf-8')
    label=f'{locale} Broken RAG page'
    require(text,'data-broken-rag-mission',label)
    require(text,expected_title,label)
    require(text,'data-mission-evidence="retrieval-trace"',label)
    require(text,'data-mission-control="freshness-policy"',label)
    require(text,'data-mission-control="authority-policy"',label)
    require(text,'data-mission-decision="SHIP"',label)
    require(text,'data-mission-decision="INCONCLUSIVE"',label)
    scripts=[
        '/assets/mission-engine.js',
        '/assets/broken-rag-pipeline-scenario.js',
        '/assets/broken-rag-pipeline-mission.js',
        '/assets/broken-rag-pipeline.js',
    ]
    positions=[]
    for script in scripts:
        require(text,script,label)
        positions.append(text.index(script))
    assert positions==sorted(positions), f'{label}: Mission scripts must preserve runtime load order'
    forbid(text,'/assets/rag.js',label)
    forbid(text,'data-rag-lab',label)


check('en','The Broken RAG Pipeline')
check('zh-CN','失效的 RAG Pipeline')

for locale in ('en','zh-CN'):
    source=ROOT/'content'/f'mission-broken-rag.{locale}.json'
    data=json.loads(source.read_text(encoding='utf-8'))
    assert data['locale']==locale
    assert data['mission']['minutes']==15
    assert data['mission']['next']['href']=='/en/labs/agent-reliability/'

print('PASS generated Broken RAG Mission: preserved route, bilingual content, Mission console, decision controls, runtime asset order, old RAG adapter removed.')
