from pathlib import Path
import json, os, html, re, shutil
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'src'
SITE=ROOT/'site'
CONTENT=json.loads((ROOT/'content/en.json').read_text(encoding='utf-8'))
BASE=os.environ.get('AHAFRAME_BASE_URL','http://localhost:8080').rstrip('/')
UPDATED=os.environ.get('AHAFRAME_UPDATED',CONTENT.get('meta',{}).get('updated','2026-08-12'))

parsed_base=urlparse(BASE)
if parsed_base.scheme not in {'http','https'} or not parsed_base.netloc or parsed_base.path not in {'','/'}:
    raise SystemExit('AHAFRAME_BASE_URL must be an origin such as https://example.com (no path).')
if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',UPDATED):
    raise SystemExit('AHAFRAME_UPDATED must use YYYY-MM-DD.')
IS_LOCAL=parsed_base.hostname in {'localhost','127.0.0.1'}

# site/ is build output only. Recreate it to prevent stale pages or assets from surviving a build.
if SITE.exists():
    shutil.rmtree(SITE)
for target in ['en/lessons/token-playground','en/lessons/context-window','en/lessons/agent-loop','en/pricing','en/early-access']:
    (SITE/target).mkdir(parents=True,exist_ok=True)
shutil.copytree(SRC/'assets', SITE/'assets')
styles = ROOT/'src'/'styles'
css = ''.join((styles/name).read_text(encoding='utf-8') for name in ['base.css','marketing.css','lessons.css','responsive.css'])
(SITE/'assets'/'styles.css').write_text(css, encoding='utf-8')
from generate_og import generate_og
generate_og(SITE/'assets'/'og-ahaframe.png')

# Public runtime configuration. Endpoint URLs are intentionally build-time values, never secrets.
runtime_config={
    'waitlistEndpoint':os.environ.get('AHAFRAME_WAITLIST_ENDPOINT',''),
    'analyticsEndpoint':os.environ.get('AHAFRAME_ANALYTICS_ENDPOINT',''),
}
(SITE/'assets/config.js').write_text('window.AHAFRAME_CONFIG = '+json.dumps(runtime_config,separators=(',',':'))+';\n',encoding='utf-8')

def logo():
    return '''<span class="logo" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M20 4.5 33 12v16L20 35.5 7 28V12L20 4.5Z" stroke="currentColor" stroke-width="4.2" stroke-linejoin="round"/></svg></span>'''

def header(active=''):
    def cls(n): return 'active' if n==active else ''
    links=f'''<a class="{cls('Lessons')}" href="/en/#lessons">Lessons</a><a class="{cls('Roadmap')}" href="/en/#roadmap">Roadmap</a><a class="{cls('Pricing')}" href="/en/pricing/">Pricing</a><a class="{cls('About')}" href="/en/#about">About</a>'''
    return f'''<header class="site-header"><div class="container nav"><a class="brand" href="/en/" aria-label="AhaFrame home">{logo()}<span>AhaFrame</span></a><nav class="nav-links" aria-label="Primary">{links}</nav><div class="nav-actions"><a class="btn primary" data-event="header_early_access" href="/en/early-access/">Join Early Access</a></div><details class="mobile-nav"><summary class="btn small" aria-label="Open navigation">Menu</summary><div class="mobile-panel">{links}<a href="/en/early-access/">Join Early Access</a></div></details></div></header>'''

def footer():
    return '''<footer class="footer"><div class="container footer-grid"><div>© 2026 AhaFrame · Interactive visual learning for AI engineering.</div><div class="footer-links"><a href="/sitemap.xml">Sitemap</a><a href="/en/#about">About</a><a href="/en/early-access/">Early Access</a></div></div></footer>'''

def jsonld(obj):
    return '<script type="application/ld+json">'+json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'</script>'

def page(title,desc,path,body,active='',schemas=None,scripts='',robots=None):
    url=BASE+path
    if robots is None:
        robots='noindex,nofollow' if IS_LOCAL else 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    head=f'''<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc,quote=True)}"><link rel="canonical" href="{url}"><link rel="alternate" hreflang="en" href="{url}"><link rel="alternate" hreflang="x-default" href="{url}"><meta name="robots" content="{robots}"><meta property="og:type" content="website"><meta property="og:site_name" content="AhaFrame"><meta property="og:title" content="{html.escape(title,quote=True)}"><meta property="og:description" content="{html.escape(desc,quote=True)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}/assets/og-ahaframe.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="AhaFrame — interactive visual learning for AI engineering"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{html.escape(title,quote=True)}"><meta name="twitter:description" content="{html.escape(desc,quote=True)}"><meta name="twitter:image" content="{BASE}/assets/og-ahaframe.png"><meta name="theme-color" content="#fbfbf8"><link rel="icon" href="/assets/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="/assets/styles.css">'''
    base_schema={'@context':'https://schema.org','@type':'Organization','@id':BASE+'/#organization','name':'AhaFrame','url':BASE,'description':'Interactive visual lessons for understanding and building AI systems.'}
    head+=jsonld(base_schema)
    for s in schemas or []: head+=jsonld(s)
    return f'''<!doctype html><html lang="en"><head>{head}</head><body>{header(active)}<main>{body}</main>{footer()}<script src="/assets/config.js" defer></script><script src="/assets/app.js" defer></script>{scripts}</body></html>'''

def breadcrumb(items):
    return {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':name,'item':BASE+url} for i,(name,url) in enumerate(items)]}

def learning_schema(slug):
    d=CONTENT['lessons'][slug]
    url=f'{BASE}/en/lessons/{slug}/'
    return {'@context':'https://schema.org','@graph':[
        {'@type':'WebPage','@id':url+'#webpage','url':url,'name':d['name'],'description':d['description'],'inLanguage':'en','dateModified':UPDATED,'mainEntity':{'@id':url+'#learning-resource'}},
        {'@type':'LearningResource','@id':url+'#learning-resource','name':d['name'],'description':d['description'],'url':url,'inLanguage':'en','educationalLevel':d['level'],'learningResourceType':'Interactive resource','timeRequired':f"PT{d['minutes']}M",'isAccessibleForFree':True,'publisher':{'@id':BASE+'/#organization'}}
    ]}

def quick_answer(text):
    return f'''<section class="card quick-answer"><strong>In one sentence</strong><p>{text}</p></section>'''

def lesson_header(slug,icon):
    d=CONTENT['lessons'][slug]
    return f'''<div class="breadcrumb"><a href="/en/">Lessons</a> / {d['category']}</div><section class="lesson-hero"><div class="lesson-title-row"><div class="lesson-icon">{icon}</div><div><h1>{d['name']}</h1><div class="badges"><span class="badge level">{d['level']}</span><span class="badge">{d['minutes']} min</span></div><p class="lede">{d['description']}</p></div></div><div class="lesson-tools"><button type="button" class="btn small" data-share>Share</button><button type="button" class="btn small primary" data-complete-lesson="{slug}">Mark lesson complete</button></div></section>'''

def takeaways(items):
    return '<section class="card lesson-section" style="padding:18px"><div class="panel-title">Key takeaways</div><div class="takeaways" style="margin-top:12px">'+''.join(f'<div class="takeaway"><strong>{a}</strong><span>{b}</span></div>' for a,b in items)+'</div></section>'

def build_challenge(title,text):
    return f'''<section class="card build-card"><div><span class="eyebrow">Build challenge</span><h3>{title}</h3><p>{text}</p></div><a class="btn" href="/en/early-access/?intent=build-lab">Advanced labs →</a></section>'''

def faq(items):
    return '<div class="faq-list">'+''.join(f'<div class="faq"><strong>{q}</strong><p>{a}</p></div>' for q,a in items)+'</div>'
