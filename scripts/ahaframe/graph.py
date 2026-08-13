from .core import BASE, SITE, UPDATED, breadcrumb, page, quick_answer


def options(items):
    return ''.join(f'<option value="{value}">{label}</option>' for value,label in items)


def build():
    path='/en/labs/agent-workflow-graph/'
    target=SITE/'en/labs/agent-workflow-graph'
    target.mkdir(parents=True,exist_ok=True)
    title='Agent Workflow Graph Lab — Orchestrate AI systems | AhaFrame'
    desc='Compare AI workflow topologies, state boundaries, retry scope, joins, parallelism, and review gates.'
    controls=[
        ('graph-topology','Topology',[('single-agent','Single Agent'),('sequential','Sequential Pipeline'),('branched','Branched Workflow'),('parallel','Parallel Specialists'),('coordinator','Coordinator + Workers')]),
        ('graph-state-mode','State boundary',[('shared','Shared state'),('isolated','Isolated state')]),
        ('graph-retry-scope','Retry scope',[('graph','Whole graph'),('node','Failed node only')]),
        ('graph-join-strategy','Join strategy',[('first','First result'),('all','All results'),('verified','Verified merge')]),
        ('graph-human-gate','Review gate',[('none','None'),('before-refund','Before consequential action')]),
    ]
    selects=''.join(f'<label for="{cid}">{label}</label><select id="{cid}" class="select">{options(items)}</select>' for cid,label,items in controls)
    sliders='''<label for="graph-agent-count">Agent count</label><div class="control-row"><input id="graph-agent-count" class="slider" type="range" min="1" max="6" value="5"><output class="badge" data-graph-agent-count-value>5</output></div><label for="graph-parallelism">Parallelism</label><div class="control-row"><input id="graph-parallelism" class="slider" type="range" min="1" max="4" value="4"><output class="badge" data-graph-parallelism-value>4</output></div>'''
    metric_names=[('architecture-score','Architecture score'),('reliability','Reliability'),('success','Success'),('latency','Latency'),('cost','Cost'),('coordination','Coordination'),('state-complexity','State complexity'),('propagation','Failure propagation'),('duplicate-work','Duplicate work'),('unsafe-action','Action risk'),('human-reviews','Human reviews')]
    metrics=''.join(f'<div class="metric">{label}<br><strong data-graph-{key}>—</strong></div>' for key,label in metric_names)
    paragraphs=[
        'Graph Engineering designs control flow around an AI system. A workflow may contain deterministic application steps, retrieval, local agent loops, validation, review, and final actions. The graph decides how those responsibilities connect, not how impressive the diagram looks.',
        'Loop Engineering and Graph Engineering operate at different levels. A loop defines how one local unit iterates through action, observation, verification, retry, recovery, escalation, and stopping. A graph decides where that local loop sits relative to other nodes and branches.',
        'Retry scope changes the failure blast radius. Restarting an entire workflow because one node failed duplicates work that already succeeded. A node-level retry keeps recovery local and makes side effects easier to reason about.',
        'Shared mutable state reduces plumbing but increases coupling. One stale observation can contaminate branches that never depended on the failing node. Isolated branch state requires an explicit merge, creating a useful validation boundary.',
        'Parallel branches can shorten a critical path when work is genuinely independent. They also add scheduling, duplicated setup, synchronization, and join decisions. First-result joins are fast; verified joins trade extra work for stronger evidence.',
        'More agents are not a goal. Extra workers are useful only when they represent independent capabilities or contexts. Deterministic code is often the better node when a responsibility has a stable contract.',
        'Review placement is also topology. A review step everywhere creates a bottleneck. A gate at the consequential boundary protects the important action while leaving low-risk work automated. All values in this Lab are deterministic educational metrics rather than production benchmarks.',
    ]
    explainer=''.join(f'<p>{text}</p>' for text in paragraphs)
    schema={'@context':'https://schema.org','@type':'LearningResource','name':'Agent Workflow Graph Lab','description':desc,'url':BASE+path,'inLanguage':'en','educationalLevel':'Intermediate','learningResourceType':'Interactive simulation','timeRequired':'PT25M','isAccessibleForFree':True}
    body=f'''<div class="container"><div class="breadcrumb"><a href="/en/">Home</a> / Production Labs / Agent Workflow Graph Lab</div><section class="lesson-hero"><div class="lesson-title-row"><div class="lesson-icon">◇</div><div><h1>Agent Workflow Graph Lab</h1><div class="badges"><span class="badge level">Production Lab Preview</span><span class="badge">Graph Engineering</span><span class="badge">25 min</span></div><p class="lede">Start from an over-engineered coordinator graph and find the smallest topology that earns its complexity.</p></div></div><div class="lesson-tools"><button type="button" class="btn small" data-share>Share</button></div></section>{quick_answer('Graph Engineering shapes orchestration: how deterministic steps, tools, local loops, agents, branches, joins, and review gates connect.')}
    <div data-agent-workflow-graph-lab><section class="card interactive"><div class="panel-title">Workflow controls</div><div class="lab-control-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:24px">{selects}<div>{sliders}</div></div><div class="actions"><button type="button" class="btn primary" data-graph-balanced-preset>Apply bounded graph</button><button type="button" class="btn" data-graph-reset>Reset baseline</button></div></section><section class="card lesson-section"><div class="metrics">{metrics}</div><div class="note"><strong>Diagnosis:</strong> <span data-graph-diagnosis>—</span></div><div class="mini flow-mini" data-graph-topology-stages></div><div class="note"><strong>Loop vs Graph:</strong> <span data-graph-loop-vs-graph>—</span></div><div data-graph-compare></div></section></div><section class="card section-explainer"><h2>Graph Engineering is not “add more agents”</h2>{explainer}</section><section class="card next-band"><div><strong>Local iteration and global orchestration are different responsibilities.</strong><div class="subtle">The capstone combines Prompt, Context, Harness, Loop, Graph, and Evaluation.</div></div><a class="btn primary" href="/en/early-access/?intent=reliable-support-agent-build">Continue →</a></section></div>'''
    scripts='<script src="/assets/agent-workflow-graph-scenario.js" defer></script><script src="/assets/agent-workflow-graph.js" defer></script>'
    (target/'index.html').write_text(page(title,desc,path,body,active='Lessons',schemas=[schema,breadcrumb([('AhaFrame','/en/'),('Production Labs','/en/#production-labs'),('Agent Workflow Graph Lab',path)])],scripts=scripts),encoding='utf-8')
