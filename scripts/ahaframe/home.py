from textwrap import dedent

from .core import BASE, SITE, page
from .i18n import load_content_source, localized_or_default_path, localized_path


def _foundation_preview(slug):
    if slug == 'token-playground':
        return '''<div class="mini"><div class="prob-row"><span>Paris</span><div class="bar"><span style="width:91%"></span></div><b>91%</b></div><div class="prob-row"><span>Lyon</span><div class="bar light"><span style="width:16%"></span></div><b>3%</b></div><div class="prob-row"><span>located</span><div class="bar light"><span style="width:10%"></span></div><b>2%</b></div></div>'''
    if slug == 'context-window':
        return '''<div class="mini"><div class="context-bar"><span class="seg-system" style="width:12%"></span><span class="seg-convo" style="width:42%"></span><span class="seg-docs" style="width:28%"></span><span class="seg-tools" style="width:12%"></span><span class="seg-memory" style="width:6%"></span></div><small class="subtle">191,250 / 200,000 tokens</small></div>'''
    return '''<div class="mini flow-mini"><span class="flow-node">User</span><span class="flow-arrow">→</span><span class="flow-node">Agent</span><span class="flow-arrow">→</span><span class="flow-node">Tool</span><span class="flow-arrow">→</span><span class="flow-node">Observe</span></div>'''


def _build_home(locale):
    copy = load_content_source(locale, 'home')
    hero = copy['hero']
    foundations = copy['foundations']
    production = copy['production']
    method = copy['method']
    stack = copy['stack']
    audience = copy['audience']
    cta = copy['cta']

    home_path = localized_path('/en/', locale)
    early_path = localized_or_default_path('/en/early-access/', locale)
    first_lesson = localized_or_default_path('/en/lessons/token-playground/', locale)

    item_list={'@context':'https://schema.org','@type':'ItemList','name':copy['title'],'itemListElement':[]}
    position = 1
    for card in foundations['cards']:
        path = localized_or_default_path(f"/en/lessons/{card['slug']}/", locale)
        item_list['itemListElement'].append({'@type':'ListItem','position':position,'url':BASE+path,'item':{'@type':'LearningResource','name':card['name'],'description':card['description'],'url':BASE+path,'publisher':{'@id':BASE+'/#organization'}}})
        position += 1
    for card in production['cards']:
        path = localized_or_default_path(f"/en/labs/{card['slug']}/", locale)
        item_list['itemListElement'].append({'@type':'ListItem','position':position,'url':BASE+path,'item':{'@type':'LearningResource','name':card['name'],'description':card['description'],'url':BASE+path,'publisher':{'@id':BASE+'/#organization'}}})
        position += 1

    home_schema=[{'@context':'https://schema.org','@type':'WebSite','@id':BASE+home_path+'#website','name':'AhaFrame','url':BASE+home_path,'description':copy['description'],'inLanguage':locale,'publisher':{'@id':BASE+'/#organization'}},item_list]

    foundation_cards=[]
    icon_by_slug={'token-playground':'◇','context-window':'▱','agent-loop':'⌘'}
    icon_class={'token-playground':'','context-window':' warm','agent-loop':' violet'}
    for card in foundations['cards']:
        path=localized_or_default_path(f"/en/lessons/{card['slug']}/",locale)
        foundation_cards.append(f'''<a class="card lesson-card" href="{path}" data-event="lesson_card_click"><span class="lesson-status" data-lesson-status="{card['slug']}">{foundations['notStarted']}</span><div class="lesson-num">{card['number']} · {card['category']}</div><div class="lesson-head"><div class="icon-box{icon_class[card['slug']]}">{icon_by_slug[card['slug']]}</div><div><h3>{card['name']}</h3><p>{card['description']}</p></div></div>{_foundation_preview(card['slug'])}<span class="lesson-link">{card['link']}</span></a>''')

    production_cards=[]
    for card in production['cards']:
        path=localized_or_default_path(f"/en/labs/{card['slug']}/",locale)
        production_cards.append(f'''<a class="card lesson-card" href="{path}" data-event="production_lab_click"><span class="lesson-status">{card['status']}</span><div class="lesson-num">Production Lab · {card['layer']}</div><div class="lesson-head"><div class="icon-box">{card['icon']}</div><div><h3>{card['name']}</h3><p>{card['description']}</p></div></div><div class="mini"><div class="takeaway"><strong>{card['firstLabel']}</strong><span>{card['first']}</span></div><div class="takeaway"><strong>{card['secondLabel']}</strong><span>{card['second']}</span></div></div><span class="lesson-link">{card['link']}</span></a>''')

    method_html=''.join(f'''<div class="method"><span class="method-no">{i:02}</span><h3>{item['name']}</h3><p>{item['description']}</p></div>''' for i,item in enumerate(method['items'],1))
    stack_html=''.join(f'''<div class="roadmap-step"><span class="road-num">{i:02}</span><strong>{name}</strong><small>{sub}</small></div>''' for i,(name,sub) in enumerate(stack['layers'],1))
    audience_icons=['&lt;/&gt;','▣','◉']
    audience_html=''.join(f'''<div class="audience-row"><span class="audience-icon">{audience_icons[i]}</span><div><strong>{item[0]}</strong><br><span class="subtle">{item[1]}</span></div></div>''' for i,item in enumerate(audience['items']))

    home_body=f'''
    <section class="hero"><div class="container hero-grid"><div><span class="eyebrow">{hero['eyebrow']}</span><h1>{hero['headlineBefore']}<br><span class="accent-text">{hero['headlineAccent']}</span>{hero['headlineAfter']}</h1><p class="lede">{hero['subheadline']}</p><div class="actions"><a class="btn primary" data-event="hero_start_learning_click" href="{first_lesson}">{hero['primary']}</a><a class="btn" data-event="hero_demo_click" href="#production-labs">{hero['secondary']}</a></div><div class="proof-row">{''.join(f'<span class="proof-chip">{item}</span>' for item in hero['proofs'])}</div></div>
    <div class="card demo-card" aria-label="Token Playground"><div class="demo-header"><strong>{hero['demoTitle']}</strong><span class="live-badge">{hero['demoBadge']}</span></div><div class="hero-demo-grid"><div class="hero-demo-main"><span class="label">{hero['promptLabel']}</span><div class="prompt-box">The capital of France is</div><div class="demo-subtitle">{hero['predictionLabel']}</div><div class="prob-row" data-hero-prob><span data-label>Paris</span><div class="bar"><span style="width:91%"></span></div><b data-value>91%</b></div><div class="prob-row" data-hero-prob><span data-label>Lyon</span><div class="bar light"><span style="width:3%"></span></div><b data-value>3%</b></div><div class="prob-row" data-hero-prob><span data-label>located</span><div class="bar light"><span style="width:2%"></span></div><b data-value>2%</b></div></div><aside class="hero-demo-side"><span class="label">{hero['settings']}</span><div class="label" style="margin-top:14px">{hero['temperature']}</div><div class="control-row"><input id="hero-temperature" class="slider" type="range" min="0" max="2" step="0.1" value="0.7" aria-label="Temperature"><output id="hero-temperature-value">0.7</output></div><div class="label" style="margin-top:21px">{hero['sampling']}</div><select id="hero-sampling" class="select" aria-label="Sampling"><option value="sample">Sample</option><option value="greedy">Greedy</option></select><div class="selected-panel"><span class="subtle">{hero['sampleToken']}</span><div class="big" data-hero-selected>Paris</div></div></aside></div></div></div></section>
    <section class="section" id="lessons"><div class="container"><div class="section-head"><div><div class="section-kicker">{foundations['kicker']}</div><h2 class="section-title">{foundations['title']}</h2><p class="section-copy">{foundations['copy']}</p></div><div class="card progress-card"><div class="progress-ring" data-progress-ring><strong data-progress-count>0/3</strong></div><div><h3>{foundations['progressTitle']}</h3><p>{foundations['progressCopy']}</p></div></div></div><div class="lesson-cards">{''.join(foundation_cards)}</div></div></section>
    <section class="section" id="production-labs"><div class="container"><div class="section-head"><div><div class="section-kicker">{production['kicker']}</div><h2 class="section-title">{production['title']}</h2><p class="section-copy">{production['copy']}</p></div></div><div class="lesson-cards production-lab-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">{''.join(production_cards)}</div></div></section>
    <section class="section"><div class="container"><div class="section-head"><div><div class="section-kicker">{method['kicker']}</div><h2 class="section-title">{method['title']}</h2></div></div><div class="method-grid" style="grid-template-columns:repeat(5,minmax(0,1fr))">{method_html}</div></div></section>
    <section class="section" id="roadmap"><div class="container"><div class="section-head"><div><div class="section-kicker">{stack['kicker']}</div><h2 class="section-title">{stack['title']}</h2><p class="section-copy">{stack['copy']}</p></div></div><div class="roadmap-shell"><div class="card roadmap">{stack_html}</div><aside class="card audience-card" id="about"><h3>{audience['title']}</h3>{audience_html}</aside></div></div></section>
    <section><div class="container cta-band"><div><h2>{cta['title']}</h2><p>{cta['copy']}</p></div><div><form class="signup" data-waitlist-form data-intent="homepage"><label class="sr-only" for="home-email-{locale}">{cta['email']}</label><input id="home-email-{locale}" class="input" name="email" type="email" autocomplete="email" placeholder="{cta['placeholder']}" required><button type="submit" class="btn primary">{cta['button']}</button></form><div data-status class="status"></div></div></div></section>
    '''
    home_body=dedent(home_body)
    target=SITE/('en' if locale=='en' else 'zh-cn')/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(page(copy['title'],copy['description'],home_path,home_body,schemas=home_schema,scripts='<script src="/assets/home.js" defer></script>',locale=locale),encoding='utf-8')


def build():
    _build_home('en')
    _build_home('zh-CN')
