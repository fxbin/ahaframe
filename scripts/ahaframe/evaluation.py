from .i18n import json_attr
from .production import build_challenge, concept_guide, lab_header, lab_source, next_band, quick_answer, takeaways, write_lab

DOMAIN='production-graph-evaluation'


def _options(items, selected=None):
    return ''.join(f'<option value="{value}"{" selected" if value==selected else ""}>{label}</option>' for value,label in items.items())


def _build(locale):
    slug='evaluation-failure';d=lab_source(locale,slug,DOMAIN);c=d['interactive'];p=d['presentation'];m=c['metrics'];cols=c['sliceColumns']
    body=f'''<div class="container">{lab_header(slug,'✓',locale,d,DOMAIN)}{quick_answer(d['quick'],locale,DOMAIN)}
    <div data-evaluation-lab data-evaluation-copy="{json_attr(p)}"><section class="card interactive"><div class="panel-title"><span>{c['panelTitle']}</span><span class="badge">{c['simulation']}</span></div><p class="subtle">{c['intro']}</p><div class="lab-control-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px"><div>
      <label class="label" for="evaluation-dataset">{c['dataset']}</label><select id="evaluation-dataset" class="select" style="margin-top:8px">{_options(c['datasetOptions'],'demo-biased')}</select>
      <label class="label" for="evaluation-threshold" style="display:block;margin-top:18px">{c['threshold']}</label><div class="control-row"><input id="evaluation-threshold" class="slider" type="range" min="70" max="95" step="1" value="80"><output class="badge" data-evaluation-threshold-value>80</output></div>
      <label class="label" for="evaluation-sample-size" style="display:block;margin-top:18px">{c['sampleSize']}</label><select id="evaluation-sample-size" class="select" style="margin-top:8px">{_options(c['sampleOptions'],'50')}</select>
      </div><div><label class="label" for="evaluation-judge-mode">{c['judge']}</label><select id="evaluation-judge-mode" class="select" style="margin-top:8px">{_options(c['judgeOptions'],'rubric')}</select>
      <button type="button" class="btn wide" data-evaluation-safety style="margin-top:16px">{p['safety']['off']}</button><button type="button" class="btn wide" data-evaluation-cost-gate style="margin-top:10px">{p['costGate']['off']}</button>
      <div class="note" style="margin-top:16px">{c['criticalPolicy']}</div><div class="actions" style="margin-top:16px"><button type="button" class="btn primary" data-evaluation-production-preset>{c['preset']}</button><button type="button" class="btn" data-evaluation-reset>{c['reset']}</button></div></div></div></section>
      <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title"><span>{c['releaseDecision']}</span><strong class="decision-chip" data-evaluation-decision data-decision="SHIP">{p['decision']['SHIP']}</strong></div><div class="metrics" style="margin-top:14px"><div class="metric">{m[0]}<br><strong data-evaluation-v1>—</strong></div><div class="metric">{m[1]}<br><strong data-evaluation-v2>—</strong></div><div class="metric">{m[2]}<br><strong data-evaluation-delta>—</strong></div><div class="metric">{m[3]}<br><strong data-evaluation-safety-score>—</strong></div><div class="metric">{m[4]}<br><strong data-evaluation-regressions>—</strong></div><div class="metric">{m[5]}<br><strong data-evaluation-confidence>—</strong></div><div class="metric">{m[6]}<br><strong data-evaluation-judge-noise>—</strong></div><div class="metric">{m[7]}<br><strong data-evaluation-cost>—</strong></div></div><div class="note" style="margin-top:14px"><strong>{c['diagnosis']}:</strong> <span data-evaluation-diagnosis>—</span></div></section>
      <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title"><span>{c['sliceTitle']}</span><span class="badge">{c['sliceBadge']}</span></div><p class="subtle">{c['sliceIntro']}</p><div style="overflow-x:auto;margin-top:12px"><table class="feature-matrix eval-table"><thead><tr><th>{cols[0]}</th><th>{cols[1]}</th><th>{cols[2]}</th><th>{cols[3]}</th><th>{cols[4]}</th></tr></thead><tbody data-evaluation-slices></tbody></table></div></section>
      <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title">{c['economics']}</div><div class="compare-grid" style="margin-top:14px"><div class="compare-card warn"><span class="label">{c['costPerSuccess']}</span><strong>v1 <span data-evaluation-cost-v1>—</span> · v2 <span data-evaluation-cost-v2>—</span></strong><p class="subtle">{c['costNote']}</p></div><span class="flow-arrow">→</span><div class="compare-card good"><span class="label">{c['yourPolicy']}</span><div data-evaluation-compare style="display:grid;gap:6px;margin-top:6px"><span>{c['waiting']}</span></div></div></div></section></div>
    {takeaways(d['takeaways'],locale,DOMAIN)}{concept_guide(d,locale,DOMAIN)}{build_challenge(d['challenge'],locale,DOMAIN)}{next_band(d['next'],locale)}</div>'''
    scripts='<script src="/assets/evaluation-scenario.js" defer></script><script src="/assets/evaluation.js" defer></script>'
    write_lab(slug,locale,body,d,scripts,DOMAIN)


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
