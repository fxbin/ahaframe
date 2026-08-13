import json
import os
import re
from xml.sax.saxutils import escape as xml_escape

from .core import BASE, CONTENT, IS_LOCAL, SITE, UPDATED, page


def build():
    h = CONTENT['home']
    (SITE/'index.html').write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AhaFrame</title><meta name="description" content="{h['description']}"><link rel="canonical" href="{BASE}/en/"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=/en/"></head><body><p><a href="/en/">Continue to AhaFrame</a></p></body></html>''',encoding='utf-8')
    not_found='''<section class="hero"><div class="container" style="text-align:center"><div class="section-kicker">404</div><h1>Outside the current context.</h1><p class="lede" style="margin:auto">The page you requested does not exist in this AhaFrame build.</p><div class="actions" style="justify-content:center"><a class="btn primary" href="/en/">Back to AhaFrame →</a></div></div></section>'''
    (SITE/'404.html').write_text(page('Page not found | AhaFrame','The requested AhaFrame page could not be found.','/404.html',not_found,robots='noindex,follow'),encoding='utf-8')

    urls=['/en/','/en/lessons/token-playground/','/en/lessons/context-window/','/en/lessons/agent-loop/','/en/labs/rag-failure/','/en/labs/agent-reliability/','/en/labs/evaluation-failure/','/en/labs/context-compression/','/en/labs/instruction-conflict/','/en/pricing/','/en/early-access/']
    robots_text=(f'User-agent: *\nDisallow: /\n' if IS_LOCAL else f'User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n')
    (SITE/'robots.txt').write_text(robots_text,encoding='utf-8')
    xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{xml_escape(BASE+u)}</loc><lastmod>{UPDATED}</lastmod></url>\n' for u in urls)+'</urlset>\n'
    (SITE/'sitemap.xml').write_text(xml,encoding='utf-8')
    (SITE/'llms.txt').write_text(f'''# AhaFrame\n\n> Optional machine-readable index. Google Search does not require or use llms.txt for generative AI visibility; the canonical HTML pages are the source of truth.\n\n## Core lessons\n- {BASE}/en/lessons/token-playground/ — tokenization, next-token probability, sampling, temperature\n- {BASE}/en/lessons/context-window/ — context budgets, summarization, RAG, memory\n- {BASE}/en/lessons/agent-loop/ — tool use, observations, retries, termination\n\n## Production lab previews\n- {BASE}/en/labs/instruction-conflict/ — instruction authority, prompt specificity, retrieved-context boundaries, output contracts, and cross-layer diagnosis\n- {BASE}/en/labs/rag-failure/ — chunking, Top-K, hybrid retrieval, reranking, recall/precision/context trade-offs\n- {BASE}/en/labs/agent-reliability/ — max steps, retries, timeouts, validation, human approval, termination, reliability/cost trade-offs\n- {BASE}/en/labs/evaluation-failure/ — dataset composition, slice regressions, safety vetoes, evidence strength, judge strategy, and release decisions\n- {BASE}/en/labs/context-compression/ — compression ratio, summarization depth, retrieval and memory budgets, critical-information retention, quality, latency, and cost\n\n## Product\n- {BASE}/en/\n- {BASE}/en/pricing/\n- {BASE}/en/early-access/\n''',encoding='utf-8')
    (SITE/'manifest.webmanifest').write_text(json.dumps({'name':'AhaFrame','short_name':'AhaFrame','start_url':'/en/','display':'standalone','background_color':'#fbfbf8','theme_color':'#0f766e','icons':[]},indent=2),encoding='utf-8')

    indexnow_key=os.environ.get('INDEXNOW_KEY','')
    if indexnow_key:
        if not re.fullmatch(r'[A-Za-z0-9-]{8,128}',indexnow_key):
            raise SystemExit('INDEXNOW_KEY must be 8–128 characters using letters, digits, or hyphens.')
        (SITE/f'{indexnow_key}.txt').write_text(indexnow_key,encoding='utf-8')
    print(f'Built AhaFrame v0.3 validation build for {BASE} ({UPDATED})')
