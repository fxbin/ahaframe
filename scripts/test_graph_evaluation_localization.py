from __future__ import annotations

from pathlib import Path
import json
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'

LABS={
    'agent-workflow-graph':{
        'mount':'[data-agent-workflow-graph-lab]',
        'copy':'data-graph-copy',
        'scripts':['/assets/agent-workflow-graph-scenario.js','/assets/agent-workflow-graph.js'],
        'scenario_asset':'agent-workflow-graph-scenario.js',
        'scenario':"id:'agent-workflow-graph'",
        'min_cjk':430,
    },
    'evaluation-failure':{
        'mount':'[data-evaluation-lab]',
        'copy':'data-evaluation-copy',
        'scripts':['/assets/evaluation-scenario.js','/assets/evaluation.js'],
        'scenario_asset':'evaluation-scenario.js',
        'scenario':"id:'evaluation-failure'",
        'min_cjk':650,
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

    copies={}
    for slug,contract in LABS.items():
        en=load('en',slug);zh=load('zh-CN',slug)
        assert en.html.get('lang')=='en'
        assert zh.html.get('lang')=='zh-CN'
        en_scripts=[n.get('src') for n in en.find_all('script',src=True)]
        zh_scripts=[n.get('src') for n in zh.find_all('script',src=True)]
        assert en_scripts==zh_scripts, f'{slug}: locales must load identical runtime assets'
        for required in ['/assets/lab-engine.js','/assets/lab-scenarios.js',*contract['scripts']]:
            assert required in en_scripts, (slug,required)

        en_mount=en.select_one(contract['mount']);zh_mount=zh.select_one(contract['mount'])
        assert en_mount is not None and zh_mount is not None
        en_copy=json.loads(en_mount[contract['copy']]);zh_copy=json.loads(zh_mount[contract['copy']])
        assert en_copy and zh_copy
        copies[slug]=(en_copy,zh_copy)

        zh_text=zh.get_text(' ',strip=True)
        cjk=sum('\u3400'<=ch<='\u9fff' for ch in zh_text)
        assert cjk>=contract['min_cjk'], f'{slug}: zh-CN copy too thin ({cjk} CJK chars)'
        assert f'/en/labs/{slug}/' in en.find('link',rel='canonical')['href']
        assert f'/zh-cn/labs/{slug}/' in zh.find('link',rel='canonical')['href']

        scenario=(SITE/'assets'/contract['scenario_asset']).read_text(encoding='utf-8')
        assert contract['scenario'] in scenario
        assert 'zh-CN' not in scenario and '/zh-cn/' not in scenario, f'{slug}: locale logic leaked into scenario'

    graph_en,graph_zh=copies['agent-workflow-graph']
    graph_failures={'healthy','shared-state-contamination','retry-blast-radius','premature-join','unnecessary-multi-agent','coordination-overhead','human-bottleneck'}
    assert set(graph_en['diagnosis'])==set(graph_zh['diagnosis'])==graph_failures
    assert set(graph_en['topologyStages'])==set(graph_zh['topologyStages'])=={'single-agent','sequential','branched','parallel','coordinator'}
    graph_adapter=(SITE/'assets'/'agent-workflow-graph.js').read_text(encoding='utf-8')
    assert 'copy.diagnosis?.[derived.failureType]' in graph_adapter
    assert 'copy.topologyStages?.[state.topology]' in graph_adapter
    assert 'copy.loopVsGraph' in graph_adapter

    eval_en,eval_zh=copies['evaluation-failure']
    eval_failures={'healthy','aggregate-score-trap','economic-regression','underpowered-eval','demo-biased-dataset','missing-veto','judge-mismatch'}
    slice_ids={'common-faq','retrieval-heavy','tool-calling','long-horizon','safety-critical-refund'}
    assert set(eval_en['diagnosis'])==set(eval_zh['diagnosis'])==eval_failures
    assert set(eval_en['sliceLabels'])==set(eval_zh['sliceLabels'])==slice_ids
    assert set(eval_en['decision'])==set(eval_zh['decision'])=={'SHIP','BLOCK','INCONCLUSIVE'}
    eval_adapter=(SITE/'assets'/'evaluation.js').read_text(encoding='utf-8')
    assert 'copy.diagnosis?.[derived.failureType]' in eval_adapter
    assert 'copy.sliceLabels?.[slice.id]' in eval_adapter
    assert 'outputs.decision.dataset.decision=decision' in eval_adapter
    for event in ('evaluation_build_challenge_started','evaluation_paid_intent_click'):
        en_event=load('en','evaluation-failure').select_one(f'[data-event="{event}"]')
        zh_event=load('zh-CN','evaluation-failure').select_one(f'[data-event="{event}"]')
        assert en_event is not None and zh_event is not None, event
    for event in ('evaluation_dataset_preset_changed','evaluation_parameter_changed','evaluation_safety_veto_changed','evaluation_sample_size_changed','evaluation_judge_mode_changed','evaluation_cost_gate_changed','evaluation_production_preset_applied','evaluation_naive_baseline_reset'):
        assert event in eval_adapter, event

    print('PASS: Graph/Evaluation en + zh-CN routes share runtime assets, stable semantic keys/enums/events, and locale-neutral scenarios.')


if __name__=='__main__':
    main()
