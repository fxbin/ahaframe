from .i18n import json_attr
from .production import build_challenge, concept_guide, lab_header, lab_source, next_band, quick_answer, takeaways, write_lab


def _options(values):
    return ''.join(f'<option value="{key}">{label}</option>' for key,label in values.items())


def _build(locale):
    slug='context-compression';d=lab_source(locale,slug);c=d['interactive'];metrics=c['metrics']
    body=f'''<div class="container">{lab_header(slug,'▱',locale,d)}{quick_answer(d['quick'],locale)}
    <div data-context-compression-lab data-context-compression-copy="{json_attr(d['presentation'])}"><section class="card interactive"><div class="panel-title"><span>{c['panelTitle']}</span><span class="badge">{c['simulation']}</span></div><p class="subtle">{c['intro']}</p><div class="lab-control-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px"><div>
      <label class="label" for="context-compression-ratio">{c['compression']}</label><div class="control-row"><input id="context-compression-ratio" class="slider" type="range" min="20" max="85" step="1" value="72"><output class="badge" data-context-compression-ratio-value>72%</output></div>
      <label class="label" for="context-summary-depth" style="display:block;margin-top:18px">{c['summary']}</label><select id="context-summary-depth" class="select" style="margin-top:8px">{_options(c['summaryOptions'])}</select>
      <label class="label" for="context-retrieval-budget" style="display:block;margin-top:18px">{c['retrieval']}</label><div class="control-row"><input id="context-retrieval-budget" class="slider" type="range" min="800" max="4200" step="200" value="1600"><output class="badge" data-context-retrieval-budget-value>1,600</output></div>
    </div><div><label class="label" for="context-memory-budget">{c['memory']}</label><div class="control-row"><input id="context-memory-budget" class="slider" type="range" min="0" max="3000" step="300" value="600"><output class="badge" data-context-memory-budget-value>600</output></div><button type="button" class="btn wide" data-context-protect-critical style="margin-top:16px">{c['criticalOff']}</button><div class="note" style="margin-top:16px">{c['constraint']}</div><div class="actions" style="margin-top:16px"><button type="button" class="btn primary" data-context-balanced-preset>{c['preset']}</button><button type="button" class="btn" data-context-compression-reset>{c['reset']}</button></div></div></div></section>
    <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title"><span>{c['outcome']}</span><span class="badge" data-context-budget-status>—</span></div><div class="metrics" style="margin-top:14px"><div class="metric">{metrics[0]}<br><strong data-context-active-tokens>—</strong></div><div class="metric">{metrics[1]}<br><strong data-context-savings>—</strong></div><div class="metric">{metrics[2]}<br><strong data-context-critical-retention>—</strong></div><div class="metric">{metrics[3]}<br><strong data-context-evidence-coverage>—</strong></div><div class="metric">{metrics[4]}<br><strong data-context-task-quality>—</strong></div><div class="metric">{metrics[5]}<br><strong data-context-hallucination-risk>—</strong></div><div class="metric">{metrics[6]}<br><strong data-context-latency-index>—</strong></div><div class="metric">{metrics[7]}<br><strong data-context-cost-index>—</strong></div></div><div class="note" style="margin-top:14px"><strong>{c['diagnosis']}:</strong> <span data-context-compression-diagnosis>—</span></div></section>
    <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title"><span>{c['segmentsTitle']}</span><span class="badge">{c['segmentsBadge']}</span></div><p class="subtle">{c['segmentsIntro']}</p><div style="overflow-x:auto;margin-top:12px"><table class="feature-matrix eval-table"><thead><tr>{''.join(f'<th>{item}</th>' for item in c['segmentHeaders'])}</tr></thead><tbody data-context-segments></tbody></table></div></section>
    <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title">{c['tradeoff']}</div><div class="compare-grid" style="margin-top:14px"><div class="compare-card warn"><span class="label">{c['baseline']}</span><strong>{c['baselineStrong']}</strong><p class="subtle">{c['baselineText']}</p></div><span class="flow-arrow">→</span><div class="compare-card good"><span class="label">{c['current']}</span><div data-context-compression-compare style="display:grid;gap:6px;margin-top:6px"><span>{c['waiting']}</span></div></div></div></section></div>
    {takeaways(d['takeaways'],locale)}{concept_guide(d,locale)}{build_challenge(d['challenge'],locale)}{next_band(d['next'],locale)}</div>'''
    scripts='<script src="/assets/context-compression-scenario.js" defer></script><script src="/assets/context-compression.js" defer></script>'
    write_lab(slug,locale,body,d,scripts)


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
