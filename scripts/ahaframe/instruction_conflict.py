from .i18n import json_attr
from .production import build_challenge, concept_guide, lab_header, lab_source, next_band, quick_answer, takeaways, write_lab


def _options(values):
    return ''.join(f'<option value="{key}">{label}</option>' for key,label in values.items())


def _build(locale):
    slug='instruction-conflict';d=lab_source(locale,slug);c=d['interactive'];metrics=c['metrics']
    body=f'''<div class="container">{lab_header(slug,'¶',locale,d)}{quick_answer(d['quick'],locale)}
    <div data-instruction-conflict-lab data-instruction-copy="{json_attr(d['presentation'])}">
      <section class="card interactive"><div class="panel-title"><span>{c['panelTitle']}</span><span class="badge">{c['simulation']}</span></div><p class="subtle">{c['intro']}</p>
      <div class="lab-control-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px"><div>
        <label class="label" for="instruction-authority">{c['authority']}</label><select id="instruction-authority" class="select" style="margin-top:8px">{_options(c['authorityOptions'])}</select>
        <label class="label" for="instruction-specificity" style="display:block;margin-top:18px">{c['specificity']}</label><select id="instruction-specificity" class="select" style="margin-top:8px">{_options(c['specificityOptions'])}</select>
        <label class="label" for="instruction-retrieval-mode" style="display:block;margin-top:18px">{c['retrieval']}</label><select id="instruction-retrieval-mode" class="select" style="margin-top:8px">{_options(c['retrievalOptions'])}</select>
      </div><div>
        <label class="label" for="instruction-schema">{c['schema']}</label><select id="instruction-schema" class="select" style="margin-top:8px">{_options(c['schemaOptions'])}</select>
        <label class="label" for="instruction-ambiguity" style="display:block;margin-top:18px">{c['ambiguity']}</label><select id="instruction-ambiguity" class="select" style="margin-top:8px">{_options(c['ambiguityOptions'])}</select>
        <div class="note" style="margin-top:16px">{c['crossLayer']}</div><div class="actions" style="margin-top:16px"><button type="button" class="btn primary" data-instruction-preset>{c['preset']}</button><button type="button" class="btn" data-instruction-reset>{c['reset']}</button></div>
      </div></div></section>
      <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title"><span>{c['outcome']}</span><span class="badge" data-instruction-state-label>—</span></div><div class="metrics" style="margin-top:14px">
        <div class="metric">{metrics[0]}<br><strong data-instruction-adherence>—</strong></div><div class="metric">{metrics[1]}<br><strong data-instruction-ambiguity-risk>—</strong></div><div class="metric">{metrics[2]}<br><strong data-instruction-policy-risk>—</strong></div><div class="metric">{metrics[3]}<br><strong data-instruction-validity>—</strong></div><div class="metric">{metrics[4]}<br><strong data-instruction-prompt-quality>—</strong></div><div class="metric">{metrics[5]}<br><strong data-instruction-conflict-count>—</strong></div><div class="metric">{metrics[6]}<br><strong data-instruction-harness-risk>—</strong></div><div class="metric">{metrics[7]}<br><strong data-instruction-release-evidence>—</strong></div>
      </div><div class="note" style="margin-top:14px"><strong>{c['diagnosis']}:</strong> <span data-instruction-diagnosis>—</span><br><strong>{c['inspect']}:</strong> <span data-instruction-next-layer>—</span></div></section>
      <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title"><span>{c['sourcesTitle']}</span><span class="badge">{c['sourcesBadge']}</span></div><p class="subtle">{c['sourcesIntro']}</p><div class="takeaways" data-instruction-source-stack style="margin-top:12px"></div></section>
      <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title">{c['compareTitle']}</div><div class="compare-grid" style="margin-top:14px"><div class="compare-card warn"><span class="label">{c['baseline']}</span><strong>{c['baselineStrong']}</strong><p class="subtle">{c['baselineText']}</p></div><span class="flow-arrow">→</span><div class="compare-card good"><span class="label">{c['current']}</span><div data-instruction-compare style="display:grid;gap:6px;margin-top:6px"><span>{c['waiting']}</span></div></div></div></section>
    </div>{takeaways(d['takeaways'],locale)}{concept_guide(d,locale)}{build_challenge(d['challenge'],locale)}{next_band(d['next'],locale)}</div>'''
    scripts='<script src="/assets/instruction-conflict-scenario.js" defer></script><script src="/assets/prompt-authority.js" defer></script>'
    write_lab(slug,locale,body,d,scripts)


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
