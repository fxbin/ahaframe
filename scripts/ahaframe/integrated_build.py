from .core import BASE, SITE, UPDATED, breadcrumb, page
from .i18n import json_attr, load_content_source, localized_or_default_path, localized_path, route_prefix

DOMAIN='integrated-build'


def opts(items):
    return ''.join(f'<option value="{value}">{label}</option>' for value,label in items.items())


def _build(locale):
    source=load_content_source(locale,DOMAIN);d=source['build'];u=source['ui'];c=d['interactive']
    path=localized_path('/en/build/reliable-support-agent/',locale)
    target=SITE/route_prefix(locale)/'build/reliable-support-agent'
    target.mkdir(parents=True,exist_ok=True)
    copy=dict(d['presentation'])
    copy['policyLabels']={key:group['options'] for key,group in d['groups'].items()}
    controls=''.join(f'<div><label class="label" for="build-{key}-policy">{group["label"]} {c["policySuffix"]}</label><select id="build-{key}-policy" class="select">{opts(group["options"])}</select></div>' for key,group in d['groups'].items())
    metric_keys=['architecture','task','reliability','safety','latency','cost']
    metrics=''.join(f'<div class="metric">{label}<br><strong data-build-{key}>—</strong></div>' for key,label in zip(metric_keys,c['metrics']))
    explainer=''.join(f'<p>{text}</p>' for text in d['explainer']['paragraphs'])
    schema={'@context':'https://schema.org','@type':'LearningResource','name':d['name'],'description':d['description'],'url':BASE+path,'inLanguage':locale,'educationalLevel':d['level'],'learningResourceType':'Interactive architecture challenge','timeRequired':f"PT{d['minutes']}M",'isAccessibleForFree':True}
    root=localized_path('/en/',locale)
    next_href=localized_or_default_path(d['next']['href'],locale)+d['next'].get('query','')
    body=f'''<div class="container"><div class="breadcrumb"><a href="{root}">{u['home']}</a> / {u['build']} / {d['name']}</div><section class="lesson-hero"><div class="lesson-title-row"><div class="lesson-icon">⌘</div><div><h1>{d['name']}</h1><div class="badges"><span class="badge level">{d['badges'][0]}</span><span class="badge">{d['badges'][1]}</span><span class="badge">{d['minutes']} min</span></div><p class="lede">{d['hero']}</p></div></div><div class="lesson-tools"><button type="button" class="btn small" data-share>{u['share']}</button></div></section><section class="card quick-answer"><strong>{u['inOneSentence']}</strong><p>{d['quick']}</p></section>
    <div data-reliable-support-agent data-build-copy="{json_attr(copy)}"><section class="card interactive"><div class="panel-title"><span>{c['title']}</span><span class="badge">{c['badge']}</span></div><div class="lab-control-grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px">{controls}</div><div class="actions"><button type="button" class="btn primary" data-build-reference>{c['reference']}</button><button type="button" class="btn" data-build-reset>{c['reset']}</button></div><p class="subtle">{c['referenceNote']}</p></section>
    <section class="card lesson-section"><div class="panel-title"><span>{c['stack']}</span><span class="badge" data-build-evidence>{c['evidence']}</span></div><div class="flow-mini" data-build-stack style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"></div></section>
    <section class="card lesson-section"><div class="panel-title"><span>{c['release']}</span><strong class="badge" data-build-decision>—</strong></div><div class="metrics">{metrics}</div><div class="note"><strong>{c['diagnosis']}:</strong> <span data-build-diagnosis>—</span></div></section>
    <section class="roadmap-shell"><div class="card" style="padding:20px"><div class="panel-title">{c['blockers']}</div><ul data-build-blockers class="takeaways"></ul></div><div class="card" style="padding:20px"><div class="panel-title">{c['warnings']}</div><ul data-build-warnings class="takeaways"></ul></div></section><section class="card lesson-section"><div class="panel-title">{c['explanation']}</div><ul data-build-tradeoffs class="takeaways"></ul><div data-build-compare style="display:grid;gap:7px;margin-top:16px"></div></section></div>
    <section class="card section-explainer"><span class="eyebrow">{d['explainer']['eyebrow']}</span><h2>{d['explainer']['title']}</h2>{explainer}</section><section class="card next-band"><div><strong>{d['next']['title']}</strong><div class="subtle">{d['next']['description']}</div></div><a class="btn primary" href="{next_href}">{d['next']['button']} →</a></section></div>'''
    scripts='<script src="/assets/instruction-conflict-scenario.js" defer></script><script src="/assets/evaluation-scenario.js" defer></script><script src="/assets/context-compression-scenario.js" defer></script><script src="/assets/agent-workflow-graph-scenario.js" defer></script><script src="/assets/reliable-support-scenario.js" defer></script><script src="/assets/integrated-build.js" defer></script>'
    (target/'index.html').write_text(page(d['seoTitle'],d['description'],path,body,active='Lessons',schemas=[schema,breadcrumb([('AhaFrame',root),(u['build'],root+'#production-labs'),(d['name'],path)])],scripts=scripts,locale=locale),encoding='utf-8')


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
