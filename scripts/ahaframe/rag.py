from .i18n import json_attr
from .production import concept_guide, lab_header, lab_source, next_band, quick_answer, takeaways, write_lab


def _options(values):
    return ''.join(f'<option value="{key}">{label}</option>' for key,label in values.items())


def _build(locale):
    slug='rag-failure';d=lab_source(locale,slug);c=d['interactive'];metrics=c['metrics']
    adapter_copy={"presentation":d['presentation'],"rerankerOn":c['rerankerOn'],"rerankerOff":c['rerankerOff']}
    body=f'''<div class="container">{lab_header(slug,'⌕',locale,d)}{quick_answer(d['quick'],locale)}
    <div data-rag-lab data-rag-copy="{json_attr(adapter_copy)}"><section class="card interactive"><div class="panel-title"><span>{c['panelTitle']}</span><span class="badge">{c['simulation']}</span></div><p class="subtle">{c['intro']}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px"><div>
      <label class="label" for="rag-chunk-size">{c['chunk']}</label><div class="control-row"><input id="rag-chunk-size" class="slider" type="range" min="200" max="1400" step="100" value="1200"><output class="badge" data-rag-chunk-value>1200</output></div>
      <label class="label" for="rag-overlap" style="display:block;margin-top:18px">{c['overlap']}</label><div class="control-row"><input id="rag-overlap" class="slider" type="range" min="0" max="1150" step="50" value="100"><output class="badge" data-rag-overlap-value>100</output></div>
      <label class="label" for="rag-top-k" style="display:block;margin-top:18px">{c['topK']}</label><div class="control-row"><input id="rag-top-k" class="slider" type="range" min="2" max="15" step="1" value="12"><output class="badge" data-rag-top-k-value>12</output></div>
    </div><div><label class="label" for="rag-retrieval">{c['retrieval']}</label><select id="rag-retrieval" class="select" style="margin-top:8px">{_options(c['retrievalOptions'])}</select><button type="button" class="btn wide" data-rag-reranker style="margin-top:16px">{c['rerankerOff']}</button><div class="note" style="margin-top:16px">{c['budget']}</div><div class="actions" style="margin-top:16px"><button type="button" class="btn primary" data-rag-balanced>{c['preset']}</button><button type="button" class="btn" data-rag-reset>{c['reset']}</button></div></div></div></section>
    <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title">{c['outcome']}</div><div class="metrics" style="margin-top:14px"><div class="metric">{metrics[0]}<br><strong data-rag-recall>—</strong></div><div class="metric">{metrics[1]}<br><strong data-rag-precision>—</strong></div><div class="metric">{metrics[2]}<br><strong data-rag-context>—</strong></div><div class="metric">{metrics[3]}<br><strong data-rag-quality>—</strong></div><div class="metric">{metrics[4]}<br><strong data-rag-latency>—</strong></div><div class="metric">{metrics[5]}<br><strong data-rag-cost>—</strong></div></div><div class="bar" style="margin-top:16px"><span data-rag-context-bar style="width:100%"></span></div><div class="note" style="margin-top:14px"><strong>{c['diagnosis']}:</strong> <span data-rag-failure>—</span></div><div class="compare-grid" style="margin-top:16px"><div class="compare-card warn"><span class="label">{c['compareBaseline']}</span><strong>{c['compareBaselineStrong']}</strong><p class="subtle">{c['compareBaselineText']}</p></div><span class="flow-arrow">→</span><div class="compare-card good"><span class="label">{c['compareCurrent']}</span><div data-rag-compare style="display:grid;gap:6px;margin-top:6px"><span>{c['waiting']}</span></div></div></div></section></div>
    {takeaways(d['takeaways'],locale)}{concept_guide(d,locale)}{next_band(d['next'],locale)}</div>'''
    write_lab(slug,locale,body,d,'<script src="/assets/rag.js" defer></script>')


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
