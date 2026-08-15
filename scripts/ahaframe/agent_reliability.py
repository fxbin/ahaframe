from .i18n import json_attr
from .production import concept_guide, lab_header, lab_source, next_band, quick_answer, takeaways, write_lab

DOMAIN='production-harness'


def _options(values):
    return ''.join(f'<option value="{key}">{label}</option>' for key,label in values.items())


def _build(locale):
    slug='agent-reliability';d=lab_source(locale,slug,DOMAIN);c=d['interactive'];metrics=c['metrics']
    body=f'''<div class="container">{lab_header(slug,'⌘',locale,d,DOMAIN)}{quick_answer(d['quick'],locale,DOMAIN)}
    <div data-agent-reliability-lab data-agent-reliability-copy="{json_attr(d['presentation'])}">
      <section class="card interactive"><div class="panel-title"><span>{c['panelTitle']}</span><span class="badge">{c['simulation']}</span></div><p class="subtle">{c['intro']}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px"><div>
        <label class="label" for="agent-max-steps">{c['maxSteps']}</label><div class="control-row"><input id="agent-max-steps" class="slider" type="range" min="4" max="20" step="1" value="14"><output class="badge" data-agent-max-steps-value>14</output></div>
        <label class="label" for="agent-retry-limit" style="display:block;margin-top:18px">{c['retryLimit']}</label><div class="control-row"><input id="agent-retry-limit" class="slider" type="range" min="0" max="5" step="1" value="4"><output class="badge" data-agent-retry-value>4</output></div>
        <label class="label" for="agent-timeout" style="display:block;margin-top:18px">{c['timeout']}</label><div class="control-row"><input id="agent-timeout" class="slider" type="range" min="2" max="20" step="1" value="12"><output class="badge" data-agent-timeout-value>12</output></div>
      </div><div>
        <label class="label" for="agent-termination">{c['termination']}</label><select id="agent-termination" class="select" style="margin-top:8px">{_options(c['terminationOptions'])}</select>
        <button type="button" class="btn wide" data-agent-validation style="margin-top:16px">—</button><button type="button" class="btn wide" data-agent-human style="margin-top:10px">—</button>
        <div class="note" style="margin-top:16px">{c['irreversible']}</div><div class="actions" style="margin-top:16px"><button type="button" class="btn primary" data-agent-balanced>{c['preset']}</button><button type="button" class="btn" data-agent-reset>{c['reset']}</button></div>
      </div></div></section>
      <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title">{c['systemSees']}</div><div class="metrics" style="margin-top:14px">
        <div class="metric">{metrics[0]}<br><strong data-agent-success>—</strong></div><div class="metric">{metrics[1]}<br><strong data-agent-reliability>—</strong></div><div class="metric">{metrics[2]}<br><strong data-agent-runaway>—</strong></div><div class="metric">{metrics[3]}<br><strong data-agent-unsafe>—</strong></div><div class="metric">{metrics[4]}<br><strong data-agent-latency>—</strong></div><div class="metric">{metrics[5]}<br><strong data-agent-cost>—</strong></div><div class="metric">{metrics[6]}<br><strong data-agent-reviews>—</strong></div>
      </div><div class="note" style="margin-top:14px"><strong>{c['diagnosis']}:</strong> <span data-agent-diagnosis>—</span></div>
      <div class="compare-grid" style="margin-top:16px"><div class="compare-card warn"><span class="label">{c['baseline']}</span><strong>{c['baselineStrong']}</strong><p class="subtle">{c['baselineText']}</p></div><span class="flow-arrow">→</span><div class="compare-card good"><span class="label">{c['current']}</span><div data-agent-compare style="display:grid;gap:6px;margin-top:6px"><span>{c['waiting']}</span></div></div></div></section>
    </div>{takeaways(d['takeaways'],locale,DOMAIN)}{concept_guide(d,locale,DOMAIN)}{next_band(d['next'],locale)}</div>'''
    write_lab(slug,locale,body,d,'<script src="/assets/agent-reliability.js" defer></script>',DOMAIN)


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
