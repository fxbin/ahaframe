from __future__ import annotations

import html
import json

from .core import BASE, ROOT, SITE, page
from .i18n import load_content_source, localized_path, route_prefix

DOMAIN='campaign-discovery'
CONTRACT_PATH=ROOT/'content'/'lab-reconciliation-v0.8.json'


def _contract():
    data=json.loads(CONTRACT_PATH.read_text(encoding='utf-8'))
    if data.get('status')!='active':
        raise ValueError('Lab reconciliation contract must be active before building Campaign discovery.')
    return data


def _localized_experience_href(item: dict,locale: str) -> str:
    return localized_path(item['route'],locale)


def _tag_list(items: list[str]) -> str:
    return ''.join(f'<span class="badge">{html.escape(item)}</span>' for item in items)


def _campaign_card(item: dict,copy: dict,locale: str,position: int) -> str:
    href=_localized_experience_href(item,locale)
    mission_id=item['missionId']
    return f'''<article class="card incident-card" data-flagship-impression data-mission-id="{html.escape(mission_id)}" data-position="{position}" data-campaign-role="{html.escape(item['campaignRole'])}">
      <div class="incident-step">{html.escape(copy['step'])}</div>
      <div class="incident-card-head"><h3>{html.escape(copy['title'])}</h3><span class="badge">{html.escape(copy['minutes'])}</span></div>
      <p class="incident-stakes">{html.escape(copy['incident'])}</p>
      <p class="subtle">{html.escape(copy['decision'])}</p>
      <div class="badges incident-dimensions">{_tag_list(copy['dimensions'])}</div>
      <a class="lesson-link" data-flagship-cta data-mission-id="{html.escape(mission_id)}" data-position="{position}" data-source="campaign-card" href="{href}">{html.escape(copy['cta'])} →</a>
    </article>'''


def _knowledge_item(item: dict,copy: dict,locale: str) -> str:
    href=_localized_experience_href(item,locale)
    return f'''<a class="knowledge-link" href="{href}"><span><strong>{html.escape(copy['name'])}</strong><small>{html.escape(copy['note'])}</small></span><span aria-hidden="true">→</span></a>'''


def _build(locale: str):
    d=load_content_source(locale,DOMAIN)
    contract=_contract()
    by_id={item['id']:item for item in contract['experiences']}
    campaign_ids=contract['primaryCampaign']
    if len(campaign_ids)!=4:
        raise ValueError('v0.8 homepage expects the #90 Campaign contract to contain exactly four primary steps.')
    if any(item_id not in by_id for item_id in campaign_ids):
        raise ValueError('Campaign contract references an unknown experience.')

    campaign_items=[by_id[item_id] for item_id in campaign_ids]
    first=campaign_items[0]
    first_href=_localized_experience_href(first,locale)
    alpha_href=localized_path('/en/early-access/',locale)+'?intent=validation-alpha'
    target=SITE/route_prefix(locale)
    target.mkdir(parents=True,exist_ok=True)
    root_path=localized_path('/en/',locale)

    hero_queue=''.join(
        f'''<div class="hero-incident-row"><span class="hero-incident-no">{html.escape(number)}</span><span><strong>{html.escape(title)}</strong><small>{html.escape(text)}</small></span></div>'''
        for number,title,text in d['hero']['queue']
    )
    proof=''.join(
        f'''<div class="hero-proof"><strong>{html.escape(value)}</strong><span>{html.escape(label)}</span></div>'''
        for value,label in d['hero']['proof']
    )

    incident_cards=''.join(
        _campaign_card(item,d['campaign']['cards'][item['id']],locale,index)
        for index,item in enumerate(campaign_items[:3],start=1)
    )
    boss_item=campaign_items[3]
    boss_copy=d['campaign']['cards'][boss_item['id']]
    boss_href=_localized_experience_href(boss_item,locale)

    method_steps=''.join(
        f'''<div class="method"><div class="method-no">{html.escape(number)}</div><h3>{html.escape(title)}</h3><p>{html.escape(text)}</p></div>'''
        for number,title,text in d['method']['steps']
    )

    foundations=[item for item in contract['experiences'] if item['primaryStatus']=='KEEP AS FOUNDATION']
    specialist=[item for item in contract['experiences'] if item['primaryStatus']=='MERGE INTO FLAGSHIP']
    prerequisites=[item for item in contract['experiences'] if item['primaryStatus']=='PREREQUISITE NODE']
    grouped={
        'foundation':foundations,
        'campaign':campaign_items,
        'specialist':specialist,
        'prerequisite':prerequisites,
    }
    knowledge_ids=[item['id'] for items in grouped.values() for item in items]
    contract_ids=[item['id'] for item in contract['experiences']]
    if sorted(knowledge_ids)!=sorted(contract_ids):
        raise ValueError('Knowledge Map grouping must cover every #90 experience exactly once.')

    knowledge_groups=''.join(
        f'''<div class="knowledge-group"><div class="knowledge-group-head"><span class="section-kicker">{html.escape(d['knowledge']['groups'][key]['title'])}</span><p>{html.escape(d['knowledge']['groups'][key]['description'])}</p></div><div>{''.join(_knowledge_item(item,d['knowledge']['experiences'][item['id']],locale) for item in items)}</div></div>'''
        for key,items in grouped.items()
    )
    about_points=''.join(
        f'''<div class="takeaway"><strong>{html.escape(title)}</strong><span>{html.escape(text)}</span></div>'''
        for title,text in d['about']['points']
    )

    body=f'''<section class="hero"><div class="container hero-grid"><div><span class="eyebrow">{html.escape(d['hero']['eyebrow'])}</span><h1>{html.escape(d['hero']['headline'])}</h1><p class="lede">{html.escape(d['hero']['subheadline'])}</p><div class="actions"><a class="btn primary" data-flagship-cta data-mission-id="{html.escape(first['missionId'])}" data-position="1" data-source="hero" href="{first_href}">{html.escape(d['hero']['primaryCta'])} →</a><a class="btn" href="#lessons">{html.escape(d['hero']['secondaryCta'])}</a></div><div class="hero-proof-row">{proof}</div></div><div class="card hero-incident-console"><div class="panel-title"><span>{html.escape(d['hero']['queueTitle'])}</span><span class="badge">{html.escape(d['hero']['queueStatus'])}</span></div>{hero_queue}</div></div></section>

    <section class="section" id="lessons"><div class="container"><div class="section-head"><div><div class="section-kicker">{html.escape(d['campaign']['kicker'])}</div><h2 class="section-title">{html.escape(d['campaign']['title'])}</h2><p class="section-copy">{html.escape(d['campaign']['copy'])}</p></div></div><div class="campaign-grid">{incident_cards}</div>
    <article class="card campaign-boss" data-flagship-impression data-mission-id="{html.escape(boss_item['missionId'])}" data-position="4" data-campaign-role="{html.escape(boss_item['campaignRole'])}"><div><div class="section-kicker">{html.escape(d['campaign']['bossKicker'])}</div><h3>{html.escape(boss_copy['title'])}</h3><p class="incident-stakes">{html.escape(boss_copy['incident'])}</p><p class="subtle">{html.escape(d['campaign']['bossCopy'])}</p><div class="badges incident-dimensions">{_tag_list(boss_copy['dimensions'])}</div></div><div class="campaign-boss-action"><span class="badge">{html.escape(boss_copy['minutes'])}</span><a class="btn primary" data-flagship-cta data-mission-id="{html.escape(boss_item['missionId'])}" data-position="4" data-source="final-boss" href="{boss_href}">{html.escape(boss_copy['cta'])} →</a></div></article></div></section>

    <section class="section surface-soft"><div class="container"><div class="section-head"><div><div class="section-kicker">{html.escape(d['method']['kicker'])}</div><h2 class="section-title">{html.escape(d['method']['title'])}</h2><p class="section-copy">{html.escape(d['method']['copy'])}</p></div></div><div class="method-grid">{method_steps}</div></div></section>

    <section class="section" id="roadmap"><div class="container"><div class="section-head"><div><div class="section-kicker">{html.escape(d['knowledge']['kicker'])}</div><h2 class="section-title">{html.escape(d['knowledge']['title'])}</h2><p class="section-copy">{html.escape(d['knowledge']['copy'])}</p></div><span class="badge">{len(contract_ids)} experiences</span></div><div class="knowledge-grid">{knowledge_groups}</div></div></section>

    <section class="section surface-soft" id="about"><div class="container"><div class="section-head"><div><div class="section-kicker">{html.escape(d['about']['kicker'])}</div><h2 class="section-title">{html.escape(d['about']['title'])}</h2><p class="section-copy">{html.escape(d['about']['copy'])}</p></div></div><div class="takeaways">{about_points}</div></div></section>

    <section><div class="container cta-band"><div><h2>{html.escape(d['closing']['title'])}</h2><p>{html.escape(d['closing']['copy'])}</p></div><div class="actions"><a class="btn primary" data-flagship-cta data-mission-id="{html.escape(first['missionId'])}" data-position="1" data-source="closing" href="{first_href}">{html.escape(d['closing']['primary'])} →</a><a class="btn" data-event="homepage_validation_alpha_click" href="{alpha_href}">{html.escape(d['closing']['secondary'])}</a></div></section>'''

    item_list={
        '@context':'https://schema.org',
        '@type':'ItemList',
        'name':'AhaFrame v0.8 Campaign' if locale=='en' else 'AhaFrame v0.8 Campaign 挑战路径',
        'numberOfItems':len(campaign_items),
        'itemListElement':[
            {
                '@type':'ListItem',
                'position':index,
                'name':d['campaign']['cards'][item['id']]['title'],
                'url':BASE+_localized_experience_href(item,locale),
            }
            for index,item in enumerate(campaign_items,start=1)
        ],
    }
    website={'@context':'https://schema.org','@type':'WebSite','name':'AhaFrame','url':BASE+root_path,'inLanguage':locale,'description':d['meta']['description']}
    scripts='<script src="/assets/home.js" defer></script>'
    (target/'index.html').write_text(page(d['meta']['title'],d['meta']['description'],root_path,body,schemas=[website,item_list],scripts=scripts,locale=locale),encoding='utf-8')


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
