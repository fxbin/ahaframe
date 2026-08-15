import json
import os
import re
from xml.sax.saxutils import escape as xml_escape

from .core import BASE, CONTENT, IS_LOCAL, SITE, UPDATED, page
from .i18n import HREFLANG, PUBLIC_ROUTE_RELATIVES, SUPPORTED_LOCALES, equivalent_paths, localized_path


def _sitemap_entry(path):
    alternates=equivalent_paths(path)
    links=''.join(
        f'<xhtml:link rel="alternate" hreflang="{HREFLANG[locale]}" href="{xml_escape(BASE+alternate)}"/>'
        for locale,alternate in alternates.items()
    )
    links+=f'<xhtml:link rel="alternate" hreflang="x-default" href="{xml_escape(BASE+alternates["en"])}"/>'
    return f'  <url><loc>{xml_escape(BASE+path)}</loc><lastmod>{UPDATED}</lastmod>{links}</url>\n'


def build():
    h = CONTENT['home']
    (SITE/'index.html').write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AhaFrame</title><meta name="description" content="{h['description']}"><link rel="canonical" href="{BASE}/en/"><link rel="alternate" hreflang="en" href="{BASE}/en/"><link rel="alternate" hreflang="zh-CN" href="{BASE}/zh-cn/"><link rel="alternate" hreflang="x-default" href="{BASE}/en/"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=/en/"></head><body><p><a href="/en/">Continue to AhaFrame</a></p></body></html>''',encoding='utf-8')
    not_found='''<section class="hero"><div class="container" style="text-align:center"><div class="section-kicker">404</div><h1>Outside the current context.</h1><p class="lede" style="margin:auto">The page you requested does not exist in this AhaFrame build.</p><div class="actions" style="justify-content:center"><a class="btn primary" href="/en/">Back to AhaFrame →</a></div></div></section>'''
    (SITE/'404.html').write_text(page('Page not found | AhaFrame','The requested AhaFrame page could not be found.','/404.html',not_found,robots='noindex,follow'),encoding='utf-8')

    urls=[]
    for relative in PUBLIC_ROUTE_RELATIVES:
        source=f'/en/{relative}'
        urls.extend(equivalent_paths(source).values())
    robots_text=(f'User-agent: *\nDisallow: /\n' if IS_LOCAL else f'User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n')
    (SITE/'robots.txt').write_text(robots_text,encoding='utf-8')
    xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+''.join(_sitemap_entry(u) for u in urls)+'</urlset>\n'
    (SITE/'sitemap.xml').write_text(xml,encoding='utf-8')
    (SITE/'llms.txt').write_text(f'''# AhaFrame\n\n> Optional machine-readable index. Canonical HTML pages are the source of truth. English is the x-default locale; equivalent Simplified Chinese pages live under `/zh-cn/`.\n\n## English core lessons\n- {BASE}/en/lessons/token-playground/ — next-token prediction and sampling\n- {BASE}/en/lessons/context-window/ — context budgets and management\n- {BASE}/en/lessons/agent-loop/ — local action / observation / retry loops\n\n## English production labs\n- {BASE}/en/labs/instruction-conflict/ — Prompt authority and cross-layer boundaries\n- {BASE}/en/labs/rag-failure/ — retrieval trade-offs\n- {BASE}/en/labs/context-compression/ — context retention and cost\n- {BASE}/en/labs/agent-reliability/ — Harness reliability and safety trade-offs\n- {BASE}/en/labs/agent-workflow-graph/ — workflow topology, state, retries, joins, and coordination\n- {BASE}/en/labs/evaluation-failure/ — evaluation and release decisions\n\n## English build\n- {BASE}/en/build/reliable-support-agent/ — six-layer Prompt / Context / Harness / Loop / Graph / Evaluation architecture challenge\n\n## 简体中文学习入口\n- {BASE}/zh-cn/ — 中文首页\n- {BASE}/zh-cn/lessons/token-playground/ — Token 预测与采样\n- {BASE}/zh-cn/lessons/context-window/ — 上下文窗口与预算\n- {BASE}/zh-cn/lessons/agent-loop/ — Agent 局部迭代循环\n- {BASE}/zh-cn/labs/instruction-conflict/ — Prompt 权威与跨层边界\n- {BASE}/zh-cn/labs/rag-failure/ — 检索权衡\n- {BASE}/zh-cn/labs/context-compression/ — 上下文保留与成本\n- {BASE}/zh-cn/labs/agent-reliability/ — Harness 可靠性与安全\n- {BASE}/zh-cn/labs/agent-workflow-graph/ — 工作流编排、状态与 Join\n- {BASE}/zh-cn/labs/evaluation-failure/ — 评测与发布决策\n- {BASE}/zh-cn/build/reliable-support-agent/ — 六层生产架构综合挑战\n\n## Product\n- {BASE}/en/pricing/\n- {BASE}/en/early-access/\n- {BASE}/zh-cn/pricing/\n- {BASE}/zh-cn/early-access/\n''',encoding='utf-8')
    (SITE/'manifest.webmanifest').write_text(json.dumps({'name':'AhaFrame','short_name':'AhaFrame','start_url':'/en/','display':'standalone','background_color':'#fbfbf8','theme_color':'#0f766e','icons':[]},indent=2),encoding='utf-8')

    indexnow_key=os.environ.get('INDEXNOW_KEY','')
    if indexnow_key:
        if not re.fullmatch(r'[A-Za-z0-9-]{8,128}',indexnow_key):
            raise SystemExit('INDEXNOW_KEY must be 8–128 characters using letters, digits, or hyphens.')
        (SITE/f'{indexnow_key}.txt').write_text(indexnow_key,encoding='utf-8')
    print(f'Built AhaFrame validation build for {BASE} ({UPDATED}) with {len(urls)} localized sitemap URLs')
