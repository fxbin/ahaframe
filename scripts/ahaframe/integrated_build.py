from __future__ import annotations

from .core import BASE, SITE, breadcrumb, page
from .i18n import json_attr, load_content_source, localized_or_default_path, localized_path, route_prefix

DOMAIN='mission-final-boss'


def opts(items: dict[str,str], selected: str) -> str:
    return ''.join(
        f'<option value="{value}"{" selected" if value == selected else ""}>{label}</option>'
        for value,label in items.items()
    )


def _build(locale: str):
    source=load_content_source(locale,DOMAIN)
    d=source['mission'];u=d['ui'];groups=d['groups'];evidence=d['evidenceLabels']
    path=localized_path('/en/build/reliable-support-agent/',locale)
    target=SITE/route_prefix(locale)/'build/reliable-support-agent'
    target.mkdir(parents=True,exist_ok=True)
    root=localized_path('/en/',locale)
    minute_unit='min' if locale=='en' else '分钟'
    next_href=localized_or_default_path(d['next']['href'],locale)+d['next'].get('query','')

    initial={
        'prompt':'loose',
        'retrieval':'balanced',
        'context':'balanced',
        'execution':'autonomous',
        'graph':'complex',
        'evaluation':'demo',
    }
    copy={
        'ui':u,
        'evidenceLabels':evidence,
        'groups':groups,
        'metrics':d['metrics'],
        'metricLabels':d['metricLabels'],
        'blockers':d['blockers'],
        'warnings':d['warnings'],
        'outcomes':d['outcomes'],
        'debrief':d['debrief'],
    }
    evidence_buttons=''.join(
        f'<button type="button" class="btn small" data-mission-evidence="{key}">{label}</button>'
        for key,label in evidence.items()
    )
    controls=''.join(
        f'''<div><label class="label" for="launch-{key}-policy">{group['label']}</label>
        <select id="launch-{key}-policy" class="select" data-mission-control="{group['intervention']}" data-state-key="{key}Policy">{opts(group['options'],initial[key])}</select></div>'''
        for key,group in groups.items()
    )
    metrics=''.join(
        f'<div class="metric">{item["label"]}<br><strong data-mission-metric="{item["key"]}">—</strong></div>'
        for item in d['metrics']
    )
    incident_ledger=''.join(
        f'<div class="takeaway"><strong>{title}</strong><span>{text}</span></div>'
        for title,text in d['incidentLedger']
    )
    debrief_points=''.join(f'<li>{point}</li>' for point in d['debrief']['points'])

    schema={
        '@context':'https://schema.org',
        '@type':'LearningResource',
        'name':d['name'],
        'description':d['description'],
        'url':BASE+path,
        'inLanguage':locale,
        'educationalLevel':d['level'],
        'learningResourceType':'Interactive production launch challenge',
        'timeRequired':f"PT{d['minutes']}M",
        'isAccessibleForFree':True,
    }

    body=f'''<div class="container">
    <div class="breadcrumb"><a href="{root}">{('Home' if locale=='en' else '首页')}</a> / {('Final Boss' if locale=='en' else '最终挑战')} / {d['name']}</div>
    <section class="lesson-hero"><div class="lesson-title-row"><div class="lesson-icon">⌘</div><div><h1>{d['name']}</h1><div class="badges"><span class="badge level">{d['level']}</span><span class="badge">{d['layer']}</span><span class="badge">{d['minutes']} {minute_unit}</span></div><p class="lede">{d['hero']}</p></div></div><div class="lesson-tools"><button type="button" class="btn small" data-share>{('Share' if locale=='en' else '分享')}</button></div></section>
    <section class="card quick-answer"><strong>{('In one sentence' if locale=='en' else '一句话理解')}</strong><p>{d['quick']}</p></section>

    <div data-production-support-launch data-mission-copy="{json_attr(copy)}">
      <section class="card lesson-section" style="padding:22px"><span class="eyebrow">{d['brief']['eyebrow']}</span><h2>{d['brief']['title']}</h2><p><strong>{d['brief']['role']}</strong> {d['brief']['body']}</p><div class="note"><strong>{d['brief']['objective']}</strong><br>{d['brief']['stakes']}</div><div class="takeaways" style="margin-top:16px">{incident_ledger}</div><div class="actions"><button type="button" class="btn primary" data-mission-start>{u['start']}</button></div></section>

      <div data-mission-workspace hidden>
        <section class="card interactive" style="margin-top:18px"><div class="panel-title"><span>{u['workspace']}</span><span class="badge"><span data-mission-budget>5</span> {u['budget']}</span></div>
          <div class="lab-control-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:18px">
            <div><div class="label">{u['evidence']}</div><div class="actions" style="margin-top:10px">{evidence_buttons}</div><div class="note" data-mission-evidence-view style="margin-top:14px;min-height:180px">{u['waiting']}</div></div>
            <div><div class="label">{u['policy']}</div><div class="lab-control-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px">{controls}</div><div class="actions"><button type="button" class="btn primary" data-mission-run>{u['run']}</button><button type="button" class="btn" data-mission-reset>{u['reset']}</button></div><div class="status" data-mission-status></div></div>
          </div>
        </section>

        <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title"><span>{u['outcome']}</span><span class="badge" data-mission-outcome>—</span></div><div class="metrics" style="margin-top:14px">{metrics}</div></section>
        <section class="roadmap-shell" style="margin-top:18px"><div class="card" style="padding:20px"><div class="panel-title">{u['blockers']}</div><ul data-mission-blockers class="takeaways"><li>{u['noBlockers']}</li></ul></div><div class="card" style="padding:20px"><div class="panel-title">{u['warnings']}</div><ul data-mission-warnings class="takeaways"><li>{u['noWarnings']}</li></ul></div></section>
        <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title">{u['attempts']}</div><div data-mission-attempts class="takeaways" style="margin-top:12px"><div class="takeaway"><span>{u['noAttempts']}</span></div></div><div data-mission-compare class="note" style="margin-top:14px" hidden></div></section>

        <section class="card lesson-section" style="padding:22px;margin-top:18px"><div class="panel-title">{u['release']}</div><p class="subtle">{u['releaseHint']}</p><div class="actions"><button type="button" class="btn" data-mission-decision="SHIP">{u['ship']}</button><button type="button" class="btn" data-mission-decision="BLOCK">{u['block']}</button><button type="button" class="btn" data-mission-decision="INCONCLUSIVE">{u['inconclusive']}</button></div><label class="label" for="launch-rationale" style="display:block;margin-top:16px">{u['rationale']}</label><textarea id="launch-rationale" class="input" rows="4" maxlength="1200" data-mission-rationale placeholder="{u['rationalePlaceholder']}" style="margin-top:8px"></textarea><div class="actions"><button type="button" class="btn primary" data-mission-submit-decision>{u['submitDecision']}</button></div><div class="status" data-mission-decision-status></div></section>

        <section class="card lesson-section" data-mission-debrief hidden style="padding:22px;margin-top:18px"><span class="eyebrow">{d['debrief']['eyebrow']}</span><h2>{d['debrief']['title']}</h2><div class="note"><strong>{d['debrief']['rule']}</strong></div><p>{d['debrief']['body']}</p><ul>{debrief_points}</ul><div class="actions"><button type="button" class="btn primary" data-mission-complete>{u['complete']}</button></div></section>
      </div>
    </div>

    <section class="card next-band"><div><strong>{d['next']['title']}</strong><div class="subtle">{d['next']['description']}</div></div><a class="btn primary" href="{next_href}">{d['next']['button']} →</a></section>
    </div>'''

    scripts=''.join([
        '<script src="/assets/mission-engine.js" defer></script>',
        '<script src="/assets/instruction-conflict-scenario.js" defer></script>',
        '<script src="/assets/evaluation-scenario.js" defer></script>',
        '<script src="/assets/context-compression-scenario.js" defer></script>',
        '<script src="/assets/agent-workflow-graph-scenario.js" defer></script>',
        '<script src="/assets/reliable-support-scenario.js" defer></script>',
        '<script src="/assets/production-support-launch-mission.js" defer></script>',
        '<script src="/assets/production-support-launch.js" defer></script>',
    ])
    crumbs=[('AhaFrame',root),(('Final Boss' if locale=='en' else '最终挑战'),path),(d['name'],path)]
    (target/'index.html').write_text(
        page(d['seoTitle'],d['description'],path,body,active='Lessons',schemas=[schema,breadcrumb(crumbs)],scripts=scripts,locale=locale),
        encoding='utf-8',
    )


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
