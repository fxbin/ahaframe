from .i18n import json_attr, localized_or_default_path
from .production import lab_header, lab_source, quick_answer, write_lab

DOMAIN='production-graph-evaluation'


def _options(items):
    return ''.join(f'<option value="{value}">{label}</option>' for value,label in items.items())


def _build(locale):
    slug='agent-workflow-graph';d=lab_source(locale,slug,DOMAIN);c=d['interactive'];p=d['presentation']
    controls=[
        ('graph-topology',c['topology'],c['topologyOptions']),
        ('graph-state-mode',c['stateMode'],c['stateModeOptions']),
        ('graph-retry-scope',c['retryScope'],c['retryScopeOptions']),
        ('graph-join-strategy',c['joinStrategy'],c['joinStrategyOptions']),
        ('graph-human-gate',c['humanGate'],c['humanGateOptions']),
    ]
    selects=''.join(f'<label for="{cid}">{label}</label><select id="{cid}" class="select">{_options(items)}</select>' for cid,label,items in controls)
    sliders=f'''<label for="graph-agent-count">{c['agentCount']}</label><div class="control-row"><input id="graph-agent-count" class="slider" type="range" min="1" max="6" value="5"><output class="badge" data-graph-agent-count-value>5</output></div><label for="graph-parallelism">{c['parallelism']}</label><div class="control-row"><input id="graph-parallelism" class="slider" type="range" min="1" max="4" value="4"><output class="badge" data-graph-parallelism-value>4</output></div>'''
    metric_keys=['architecture-score','reliability','success','latency','cost','coordination','state-complexity','propagation','duplicate-work','unsafe-action','human-reviews']
    metrics=''.join(f'<div class="metric">{label}<br><strong data-graph-{key}>—</strong></div>' for key,label in zip(metric_keys,c['metrics']))
    explainer=''.join(f'<p>{text}</p>' for text in d['explainer']['paragraphs'])
    next_item=d['next'];next_href=localized_or_default_path(next_item['href'],locale)+next_item.get('query','')
    body=f'''<div class="container">{lab_header(slug,'◇',locale,d,DOMAIN)}{quick_answer(d['quick'],locale,DOMAIN)}
    <div data-agent-workflow-graph-lab data-graph-copy="{json_attr(p)}"><section class="card interactive"><div class="panel-title">{c['panelTitle']}</div><div class="lab-control-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:24px">{selects}<div>{sliders}</div></div><div class="actions"><button type="button" class="btn primary" data-graph-balanced-preset>{c['preset']}</button><button type="button" class="btn" data-graph-reset>{c['reset']}</button></div></section><section class="card lesson-section"><div class="metrics">{metrics}</div><div class="note"><strong>{c['diagnosis']}:</strong> <span data-graph-diagnosis>—</span></div><div class="mini flow-mini" data-graph-topology-stages></div><div class="note"><strong>{c['loopVsGraph']}:</strong> <span data-graph-loop-vs-graph>{p['loopVsGraph']}</span></div><div data-graph-compare></div></section></div>
    <section class="card section-explainer"><h2>{d['explainer']['title']}</h2>{explainer}</section>
    <section class="card next-band"><div><strong>{next_item['title']}</strong><div class="subtle">{next_item['description']}</div></div><a class="btn primary" href="{next_href}">{next_item['button']} →</a></section></div>'''
    scripts='<script src="/assets/agent-workflow-graph-scenario.js" defer></script><script src="/assets/agent-workflow-graph.js" defer></script>'
    write_lab(slug,locale,body,d,scripts,DOMAIN)


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
