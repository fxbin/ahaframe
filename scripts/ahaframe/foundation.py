from __future__ import annotations

from .core import BASE, UPDATED, breadcrumb, page
from .i18n import load_content_source, localized_or_default_path, localized_path


def lesson_source(locale: str, slug: str) -> dict:
    source=load_content_source(locale,'foundation')
    return source['lessons'][slug]


def foundation_ui(locale: str) -> dict:
    return load_content_source(locale,'foundation')['ui']


def learning_schema(slug: str, locale: str, lesson: dict):
    path=localized_path(f'/en/lessons/{slug}/',locale)
    url=BASE+path
    return {'@context':'https://schema.org','@graph':[
        {'@type':'WebPage','@id':url+'#webpage','url':url,'name':lesson['name'],'description':lesson['description'],'inLanguage':locale,'dateModified':UPDATED,'mainEntity':{'@id':url+'#learning-resource'}},
        {'@type':'LearningResource','@id':url+'#learning-resource','name':lesson['name'],'description':lesson['description'],'url':url,'inLanguage':locale,'educationalLevel':lesson['level'],'learningResourceType':'Interactive resource','timeRequired':f"PT{lesson['minutes']}M",'isAccessibleForFree':True,'publisher':{'@id':BASE+'/#organization'}}
    ]}


def lesson_breadcrumb(slug: str, locale: str, lesson: dict):
    ui=foundation_ui(locale)
    root=localized_path('/en/',locale)
    path=localized_path(f'/en/lessons/{slug}/',locale)
    return breadcrumb([('AhaFrame',root),(ui['lessons'],root+'#lessons'),(lesson['name'],path)])


def lesson_header(slug: str, icon: str, locale: str, lesson: dict):
    ui=foundation_ui(locale)
    root=localized_path('/en/',locale)
    return f'''<div class="breadcrumb"><a href="{root}">{ui['lessons']}</a> / {lesson['category']}</div><section class="lesson-hero"><div class="lesson-title-row"><div class="lesson-icon">{icon}</div><div><h1>{lesson['name']}</h1><div class="badges"><span class="badge level">{lesson['level']}</span><span class="badge">{lesson['minutes']} {ui['minutes']}</span></div><p class="lede">{lesson['description']}</p></div></div><div class="lesson-tools"><button type="button" class="btn small" data-share>{ui['share']}</button><button type="button" class="btn small primary" data-complete-lesson="{slug}">{ui['markComplete']}</button></div></section>'''


def quick_answer(text: str, locale: str):
    return f'''<section class="card quick-answer"><strong>{foundation_ui(locale)['inOneSentence']}</strong><p>{text}</p></section>'''


def takeaways(items, locale: str):
    title=foundation_ui(locale)['keyTakeaways']
    return '<section class="card lesson-section" style="padding:18px"><div class="panel-title">'+title+'</div><div class="takeaways" style="margin-top:12px">'+''.join(f'<div class="takeaway"><strong>{a}</strong><span>{b}</span></div>' for a,b in items)+'</div></section>'


def build_challenge(title: str, text: str, locale: str):
    ui=foundation_ui(locale)
    early=localized_or_default_path('/en/early-access/',locale)
    return f'''<section class="card build-card"><div><span class="eyebrow">{ui['buildChallenge']}</span><h3>{title}</h3><p>{text}</p></div><a class="btn" href="{early}?intent=build-lab">{ui['advancedLabs']} →</a></section>'''


def faq(items):
    return '<div class="faq-list">'+''.join(f'<div class="faq"><strong>{q}</strong><p>{a}</p></div>' for q,a in items)+'</div>'


def sidebar(lesson: dict, locale: str, path_title: str | None=None, path_steps=None, control_copy: str | None=None):
    ui=foundation_ui(locale)
    learn=''.join(f'<li>{item}</li>' for item in lesson['learn'])
    left=f'''<div class="card side-card"><h3>{ui['whatYouLearn']}</h3><ul class="check-list">{learn}</ul></div>'''
    if control_copy:
        return left+f'''<div class="card side-card"><h3>{path_title or ui['lessonPath']}</h3><p class="subtle">{control_copy}</p></div>'''
    steps=''.join(f'''<li class="{step.get('state','')}"><span class="step-num">{i}</span><div><b>{step['name']}</b><div class="subtle">{step['description']}</div></div>{'<span>✓</span>' if step.get('state')=='done' else ''}</li>''' for i,step in enumerate(path_steps or [],1))
    return left+f'''<div class="card side-card"><h3>{path_title or ui['lessonPath']}</h3><ol class="steps">{steps}</ol></div>'''


def concept_guide(lesson: dict, locale: str):
    ui=foundation_ui(locale)
    guide=lesson['guide']
    sections=''.join(f'''<h3>{section['title']}</h3><p>{section['body']}</p>''' for section in guide['sections'])
    questions=faq([(item['q'],item['a']) for item in guide['faq']])
    return f'''<section class="card section-explainer"><span class="eyebrow">{ui['conceptGuide']}</span><h2>{guide['title']}</h2><p>{guide['intro']}</p>{sections}<h3>{ui['commonQuestions']}</h3>{questions}<div class="references"><strong>{ui['learningNote']}</strong> · {ui['reviewed']} {UPDATED}. {guide['note']}</div></section>'''


def next_band(lesson: dict, locale: str):
    next_item=lesson['next']
    href=localized_or_default_path(next_item['href'],locale)
    return f'''<section class="card next-band"><div><strong>{next_item['title']}</strong><div class="subtle">{next_item['description']}</div></div><a class="btn primary" data-event="{next_item.get('event','lesson_next_clicked')}" href="{href}{next_item.get('query','')}">{next_item['button']}</a></section>'''


def write_lesson(slug: str, locale: str, body: str, lesson: dict, scripts: str):
    path=localized_path(f'/en/lessons/{slug}/',locale)
    title=lesson['seoTitle']
    target_path=path.lstrip('/')
    from .core import SITE
    target=SITE/target_path/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(page(title,lesson['description'],path,body,active='Lessons',schemas=[learning_schema(slug,locale,lesson),lesson_breadcrumb(slug,locale,lesson)],scripts=scripts,locale=locale),encoding='utf-8')
