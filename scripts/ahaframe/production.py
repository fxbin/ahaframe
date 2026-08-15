from __future__ import annotations

from .core import BASE, SITE, UPDATED, breadcrumb, page
from .i18n import json_attr, load_content_source, localized_or_default_path, localized_path


def lab_source(locale: str, slug: str, domain: str='production-prompt-context') -> dict:
    return load_content_source(locale,domain)['labs'][slug]


def production_ui(locale: str, domain: str='production-prompt-context') -> dict:
    return load_content_source(locale,domain)['ui']


def lab_schema(slug: str, locale: str, lab: dict):
    path=localized_path(f'/en/labs/{slug}/',locale)
    url=BASE+path
    return {
        '@context':'https://schema.org',
        '@graph':[
            {'@type':'WebPage','@id':url+'#webpage','url':url,'name':lab['name'],'description':lab['description'],'inLanguage':locale,'dateModified':UPDATED,'mainEntity':{'@id':url+'#learning-resource'}},
            {'@type':'LearningResource','@id':url+'#learning-resource','name':lab['name'],'description':lab['description'],'url':url,'inLanguage':locale,'educationalLevel':lab['level'],'learningResourceType':'Interactive simulation','timeRequired':f"PT{lab['minutes']}M",'isAccessibleForFree':True,'publisher':{'@id':BASE+'/#organization'}},
        ],
    }


def lab_header(slug: str, icon: str, locale: str, lab: dict, domain: str='production-prompt-context'):
    ui=production_ui(locale,domain)
    root=localized_path('/en/',locale)
    return f'''<div class="breadcrumb"><a href="{root}">{ui['home']}</a> / {ui['productionLabs']} / {lab['name']}</div><section class="lesson-hero"><div class="lesson-title-row"><div class="lesson-icon">{icon}</div><div><h1>{lab['name']}</h1><div class="badges"><span class="badge level">{ui['preview']}</span><span class="badge">{lab['layer']}</span><span class="badge">{lab['minutes']} {ui['minutes']}</span></div><p class="lede">{lab['hero']}</p></div></div><div class="lesson-tools"><button type="button" class="btn small" data-share>{ui['share']}</button></div></section>'''


def quick_answer(text: str, locale: str, domain: str='production-prompt-context'):
    return f'''<section class="card quick-answer"><strong>{production_ui(locale,domain)['inOneSentence']}</strong><p>{text}</p></section>'''


def takeaways(items, locale: str, domain: str='production-prompt-context'):
    ui=production_ui(locale,domain)
    return '<section class="card lesson-section" style="padding:18px"><div class="panel-title">'+ui['keyTakeaways']+'</div><div class="takeaways" style="margin-top:12px">'+''.join(f'<div class="takeaway"><strong>{a}</strong><span>{b}</span></div>' for a,b in items)+'</div></section>'


def faq(items):
    return '<div class="faq-list">'+''.join(f'<div class="faq"><strong>{item["q"]}</strong><p>{item["a"]}</p></div>' for item in items)+'</div>'


def concept_guide(lab: dict, locale: str, domain: str='production-prompt-context'):
    ui=production_ui(locale,domain)
    guide=lab['guide']
    sections=''.join(f'''<h3>{section['title']}</h3><p>{section['body']}</p>''' for section in guide['sections'])
    return f'''<section class="card section-explainer"><span class="eyebrow">{guide['eyebrow']}</span><h2>{guide['title']}</h2><p>{guide['intro']}</p>{sections}<h3>{ui['commonQuestions']}</h3>{faq(guide['faq'])}<div class="references"><strong>{ui['simulationNote']}</strong> · {ui['reviewed']} {UPDATED}. {guide['note']}</div></section>'''


def build_challenge(challenge: dict, locale: str, domain: str='production-prompt-context'):
    ui=production_ui(locale,domain)
    href=localized_or_default_path(challenge['href'],locale)
    query=challenge.get('query','')
    event=challenge.get('event','production_build_challenge_started')
    return f'''<section class="card build-card"><div><span class="eyebrow">{ui['buildChallenge']}</span><h3>{challenge['title']}</h3><p>{challenge['body']}</p></div><a class="btn" data-event="{event}" href="{href}{query}">{challenge['button']} →</a></section>'''


def next_band(next_item: dict, locale: str):
    href=localized_or_default_path(next_item['href'],locale)
    query=next_item.get('query','')
    event=next_item.get('event','production_next_clicked')
    return f'''<section class="card next-band"><div><strong>{next_item['title']}</strong><div class="subtle">{next_item['description']}</div></div><a class="btn primary" data-event="{event}" href="{href}{query}">{next_item['button']} →</a></section>'''


def write_lab(slug: str, locale: str, body: str, lab: dict, scripts: str, domain: str='production-prompt-context'):
    path=localized_path(f'/en/labs/{slug}/',locale)
    root=localized_path('/en/',locale)
    ui=production_ui(locale,domain)
    crumbs=breadcrumb([('AhaFrame',root),(ui['productionLabs'],root+'#production-labs'),(lab['name'],path)])
    target=SITE/path.lstrip('/')/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(page(lab['seoTitle'],lab['description'],path,body,active='Lessons',schemas=[lab_schema(slug,locale,lab),crumbs],scripts=scripts,locale=locale),encoding='utf-8')
