from urllib.parse import urlsplit, urlunsplit

from .core import BASE, SITE, page
from .i18n import load_content_source, localized_or_default_path, localized_path


def _href(raw, locale):
    parts=urlsplit(raw)
    if not parts.path.startswith('/') or parts.netloc:
        return raw
    path=localized_or_default_path(parts.path,locale) if parts.path.startswith(('/en/','/zh-cn/')) else parts.path
    return urlunsplit(('', '', path, parts.query, parts.fragment))


def _pricing(locale, copy):
    c=copy['pricing']
    plan_html=[]
    for index,plan in enumerate(c['plans']):
        badge=f'<span class="badge level">{plan["badge"]}</span>' if plan['badge'] else ''
        featured=' featured' if index==1 else ''
        event=f' data-event="{plan["event"]}"' if plan['event'] else ''
        plan_html.append(f'''<div class="card price-card{featured}">{badge}<h2 style="margin-top:10px">{plan['name']}</h2><p class="subtle">{plan['description']}</p><div class="price">{plan['price']} <small>{plan['suffix']}</small></div><ul class="check-list">{''.join(f'<li>{item}</li>' for item in plan['items'])}</ul><a class="btn{' primary' if index==1 else ''} wide"{event} href="{_href(plan['href'],locale)}">{plan['cta']}</a></div>''')
    headers=''.join(f'<th>{item}</th>' for item in c['matrixHeaders'])
    rows=''.join('<tr>'+''.join(f'<td>{cell}</td>' for cell in row)+'</tr>' for row in c['matrixRows'])
    sequence=''.join(f'''<div class="coming-item"><div class="icon-box">{['⌕','⌘','✓','▱','◎'][i]}</div><div><strong>{item[0]}</strong><br><span>{item[1]}</span></div><span class="badge{' level' if i<3 else ''}">{item[2]}</span></div>''' for i,item in enumerate(c['sequence']))
    early=localized_path('/en/early-access/',locale)
    body=f'''<section class="hero"><div class="container" style="max-width:1120px"><div class="section-kicker">{c['kicker']}</div><h1 style="font-size:64px;max-width:850px">{c['headlineBefore']} <span class="accent-text">{c['headlineAccent']}</span>.</h1><p class="lede">{c['intro']}</p><div class="price-grid" style="margin-top:36px">{''.join(plan_html)}</div></div></section><section class="section"><div class="container pricing-compare"><div class="card" style="padding:20px"><h2 style="font-size:20px;margin-top:0">{c['compareTitle']}</h2><table class="feature-matrix"><thead><tr>{headers}</tr></thead><tbody>{rows}</tbody></table></div><div><h2 style="font-size:20px;margin-top:0">{c['sequenceTitle']}</h2><div class="coming">{sequence}</div></div></div></section><section><div class="container cta-band"><div><h2>{c['ctaTitle']}</h2><p>{c['ctaCopy']}</p></div><a class="btn primary" href="{early}?intent=pricing">{c['ctaButton']}</a></div></section>'''
    path=localized_path('/en/pricing/',locale)
    schema={'@context':'https://schema.org','@type':'WebPage','name':c['title'],'url':BASE+path,'description':c['description'],'inLanguage':locale}
    target=SITE/path.lstrip('/')/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(page(c['title'],c['description'],path,body,active='Pricing',schemas=[schema],locale=locale),encoding='utf-8')


def _early_access(locale, copy):
    c=copy['earlyAccess']
    cards=''.join(f'''<div class="card lesson-card"><div class="lesson-num">{item[0]}</div><h3>{item[1]}</h3><p>{item[2]}</p></div>''' for item in c['cards'])
    status_id=f'ea-status-{locale}'
    trust_id=f'ea-trust-{locale}'
    success_href=localized_path('/en/',locale)+'#lessons'
    body=f'''<section class="hero"><div class="container" style="max-width:880px;text-align:center"><span class="eyebrow">{c['eyebrow']}</span><h1 style="max-width:830px;margin-left:auto;margin-right:auto">{c['headlineBefore']} <span class="accent-text">{c['headlineAccent']}</span>.</h1><p class="lede" style="margin-left:auto;margin-right:auto">{c['intro']}</p><div class="card" style="max-width:620px;margin:30px auto 0;padding:24px;text-align:left"><form data-waitlist-form data-intent="early-access" aria-describedby="{trust_id} {status_id}"><label for="ea-email-{locale}" style="font-weight:800">{c['emailLabel']}</label><input id="ea-email-{locale}" class="input" style="margin:9px 0 12px" name="email" type="email" inputmode="email" autocomplete="email" placeholder="{c['placeholder']}" required><button type="submit" class="btn primary wide">{c['button']}</button></form><div id="{status_id}" data-status class="status" role="status" aria-live="polite"></div><div data-waitlist-success class="waitlist-success" hidden><strong>{c['successTitle']}</strong><p>{c['successCopy']}</p><a class="btn" href="{success_href}">{c['successLink']}</a></div><p id="{trust_id}" data-waitlist-trust class="subtle" style="margin-bottom:0">{c['trustNote']}</p></div></div></section><section class="section"><div class="container"><div class="lesson-cards">{cards}</div></div></section>'''
    path=localized_path('/en/early-access/',locale)
    schema={'@context':'https://schema.org','@type':'WebPage','name':c['title'],'url':BASE+path,'description':c['description'],'inLanguage':locale}
    target=SITE/path.lstrip('/')/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(page(c['title'],c['description'],path,body,schemas=[schema],locale=locale),encoding='utf-8')


def build():
    for locale in ('en','zh-CN'):
        copy=load_content_source(locale,'marketing')
        _pricing(locale,copy)
        _early_access(locale,copy)
