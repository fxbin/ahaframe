from __future__ import annotations

from .i18n import json_attr, load_content_source
from .production import lab_header, next_band, quick_answer, takeaways, write_lab

CONTENT_DOMAIN='mission-47000-retry'
UI_DOMAIN='production-harness'


def _options(values: dict[str,str], selected: str) -> str:
    return ''.join(
        f'<option value="{key}"{" selected" if key == selected else ""}>{label}</option>'
        for key,label in values.items()
    )


def _build(locale: str):
    slug='agent-reliability'
    d=load_content_source(locale,CONTENT_DOMAIN)['mission']
    ui=d['ui'];controls=d['controls'];evidence=d['evidenceLabels']
    copy={'ui':ui,'evidenceLabels':evidence,'metrics':d['metrics'],'outcomes':d['outcomes'],'debrief':d['debrief']}
    evidence_buttons=''.join(f'<button type="button" class="btn small" data-mission-evidence="{key}">{label}</button>' for key,label in evidence.items())
    metric_cards=''.join(f'<div class="metric">{item["label"]}<br><strong data-mission-metric="{item["key"]}">—</strong></div>' for item in d['metrics'])

    body=f'''<div class="container">{lab_header(slug,'↻',locale,d,UI_DOMAIN)}{quick_answer(d['quick'],locale,UI_DOMAIN)}
    <div data-retry-mission data-mission-copy="{json_attr(copy)}">
      <section class="card lesson-section" style="padding:22px"><span class="eyebrow">{d['brief']['eyebrow']}</span><h2>{d['brief']['title']}</h2><p><strong>{d['brief']['role']}</strong> {d['brief']['body']}</p><div class="note"><strong>{d['brief']['objective']}</strong><br>{d['brief']['stakes']}</div><div class="actions"><button type="button" class="btn primary" data-mission-start>{ui['start']}</button></div></section>
      <div data-mission-workspace hidden>
        <section class="card interactive" style="margin-top:18px"><div class="panel-title"><span>{ui['workspace']}</span><span class="badge"><span data-mission-budget>6</span> · {ui['budget']}</span></div>
          <div class="lab-control-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:18px"><div><div class="label">{ui['evidence']}</div><div class="actions" style="margin-top:10px">{evidence_buttons}</div><div class="note" data-mission-evidence-view style="margin-top:14px;min-height:150px">{ui['waiting']}</div></div><div><div class="label">{ui['policy']}</div>
            <label class="label" style="display:block;margin-top:10px">{controls['retry-limit']['label']}</label><select class="select" data-mission-control="retry-limit" data-value-type="number">{_options(controls['retry-limit']['options'],'2')}</select>
            <label class="label" style="display:block;margin-top:12px">{controls['timeout']['label']}</label><select class="select" data-mission-control="timeout" data-value-type="number">{_options(controls['timeout']['options'],'4')}</select>
            <label class="label" style="display:block;margin-top:12px">{controls['idempotency']['label']}</label><select class="select" data-mission-control="idempotency" data-value-type="string">{_options(controls['idempotency']['options'],'none')}</select>
            <label class="label" style="display:block;margin-top:12px">{controls['approval']['label']}</label><select class="select" data-mission-control="approval" data-value-type="string">{_options(controls['approval']['options'],'none')}</select>
            <label class="label" style="display:block;margin-top:12px">{controls['compensation']['label']}</label><select class="select" data-mission-control="compensation" data-value-type="string">{_options(controls['compensation']['options'],'none')}</select>
            <label class="label" style="display:block;margin-top:12px">{controls['terminal-verifier']['label']}</label><select class="select" data-mission-control="terminal-verifier" data-value-type="boolean">{_options(controls['terminal-verifier']['options'],'false')}</select>
            <div class="actions"><button type="button" class="btn primary" data-mission-run>{ui['run']}</button><button type="button" class="btn" data-mission-reset>{ui['reset']}</button></div><div class="status" data-mission-status></div>
          </div></div>
        </section>
        <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title"><span>{ui['outcome']}</span><span class="badge" data-mission-outcome>—</span></div><div class="metrics" style="margin-top:14px">{metric_cards}</div></section>
        <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title">{ui['attempts']}</div><div data-mission-attempts class="takeaways" style="margin-top:12px"><div class="takeaway"><span>{ui['noAttempts']}</span></div></div><div data-mission-compare class="note" style="margin-top:14px" hidden></div></section>
        <section class="card lesson-section" style="padding:20px;margin-top:18px"><div class="panel-title">{ui['release']}</div><p class="subtle">{ui['releaseHint']}</p><div class="actions"><button type="button" class="btn" data-mission-decision="SHIP">{ui['ship']}</button><button type="button" class="btn" data-mission-decision="BLOCK">{ui['block']}</button><button type="button" class="btn" data-mission-decision="INCONCLUSIVE">{ui['inconclusive']}</button></div><div class="status" data-mission-decision-status></div></section>
        <section class="card lesson-section" data-mission-debrief hidden style="padding:22px;margin-top:18px"><span class="eyebrow">{d['debrief']['eyebrow']}</span><h2>{d['debrief']['title']}</h2><div class="note"><strong>{d['debrief']['rule']}</strong></div><p>{d['debrief']['body']}</p><ul>{''.join(f'<li>{point}</li>' for point in d['debrief']['points'])}</ul><div class="actions"><button type="button" class="btn primary" data-mission-complete>{ui['complete']}</button></div></section>
      </div>
    </div>{takeaways(d['takeaways'],locale,UI_DOMAIN)}{next_band(d['next'],locale)}{next_band(d['earlyAccess'],locale)}</div>'''
    scripts=''.join(['<script src="/assets/mission-engine.js" defer></script>','<script src="/assets/47000-retry-scenario.js" defer></script>','<script src="/assets/47000-retry-mission.js" defer></script>','<script src="/assets/47000-retry.js" defer></script>'])
    write_lab(slug,locale,body,d,scripts,UI_DOMAIN)


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
