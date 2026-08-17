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
    (SITE/'llms.txt').write_text(f'''# AhaFrame\n\n> AhaFrame teaches software engineers AI engineering through interactive production-incident simulations covering Prompt, Context, Harness, Loop, Graph, and Evaluation.\n\nCanonical HTML pages are the source of truth. English is the x-default locale; equivalent Simplified Chinese pages live under `/zh-cn/`.\n\n## English campaign\n- [The Broken RAG Pipeline]({BASE}/en/labs/rag-failure/): Diagnose stale retrieval, freshness, authority, and grounding failures.\n- [The $47,000 Retry]({BASE}/en/labs/agent-reliability/): Reason about retries, idempotency, approvals, and irreversible side effects.\n- [The Prompt Injection Attack]({BASE}/en/labs/instruction-conflict/): Defend trust boundaries with provenance, least privilege, and runtime enforcement.\n- [Ship the Production Support Agent]({BASE}/en/build/reliable-support-agent/): Make a cross-layer production release decision across all six engineering layers.\n\n## English foundations and specialist labs\n- [Token Playground]({BASE}/en/lessons/token-playground/): Explore next-token prediction and sampling mechanics.\n- [Context Window Lab]({BASE}/en/lessons/context-window/): Understand finite context budgets and management trade-offs.\n- [Agent Loop Simulator]({BASE}/en/lessons/agent-loop/): Explore bounded action, observation, retry, and stopping loops.\n- [Context Compression Lab]({BASE}/en/labs/context-compression/): Balance context retention quality against context pressure and cost.\n- [Agent Workflow Graph Lab]({BASE}/en/labs/agent-workflow-graph/): Explore workflow topology, state, retries, joins, and coordination.\n- [Evaluation Failure Lab]({BASE}/en/labs/evaluation-failure/): Reason about evaluation evidence, uncertainty, vetoes, and release decisions.\n\n## English product\n- [AhaFrame home]({BASE}/en/): Start the production-incident Campaign and browse the Knowledge Map.\n- [Pricing]({BASE}/en/pricing/): Review the current Foundations offer and Production Labs positioning.\n- [Early Access]({BASE}/en/early-access/): Join Validation Alpha and product early access.\n\n## 简体中文\n- [AhaFrame 中文首页]({BASE}/zh-cn/): 从生产事故 Campaign 开始，并浏览知识地图。\n- [Broken RAG Pipeline]({BASE}/zh-cn/labs/rag-failure/): 诊断检索新鲜度、权威性与 grounding 故障。\n- [$47,000 Retry]({BASE}/zh-cn/labs/agent-reliability/): 理解重试、幂等、审批与不可逆副作用。\n- [Prompt Injection Attack]({BASE}/zh-cn/labs/instruction-conflict/): 处理来源信任、最小权限与运行时防护。\n- [Production Support Agent Final Boss]({BASE}/zh-cn/build/reliable-support-agent/): 完成六层生产架构发布决策。\n- [Token Playground]({BASE}/zh-cn/lessons/token-playground/): Token 预测与采样机制。\n- [Context Window Lab]({BASE}/zh-cn/lessons/context-window/): 上下文窗口、预算与管理。\n- [Agent Loop Simulator]({BASE}/zh-cn/lessons/agent-loop/): Agent 行动、观察、重试与停止循环。\n- [Context Compression Lab]({BASE}/zh-cn/labs/context-compression/): 上下文保留质量与成本权衡。\n- [Agent Workflow Graph Lab]({BASE}/zh-cn/labs/agent-workflow-graph/): 工作流拓扑、状态、重试与 Join。\n- [Evaluation Failure Lab]({BASE}/zh-cn/labs/evaluation-failure/): 评测证据、不确定性与发布决策。\n- [定价]({BASE}/zh-cn/pricing/): 查看当前 Foundations 与 Production Labs 产品方案。\n- [Early Access]({BASE}/zh-cn/early-access/): 加入 Validation Alpha 与产品早期访问。\n''',encoding='utf-8')
    (SITE/'manifest.webmanifest').write_text(json.dumps({'name':'AhaFrame','short_name':'AhaFrame','start_url':'/en/','display':'standalone','background_color':'#fbfbf8','theme_color':'#0f766e','icons':[]},indent=2),encoding='utf-8')

    indexnow_key=os.environ.get('INDEXNOW_KEY','')
    if indexnow_key:
        if not re.fullmatch(r'[A-Za-z0-9-]{8,128}',indexnow_key):
            raise SystemExit('INDEXNOW_KEY must be 8–128 characters using letters, digits, or hyphens.')
        (SITE/f'{indexnow_key}.txt').write_text(indexnow_key,encoding='utf-8')
    print(f'Built AhaFrame validation build for {BASE} ({UPDATED}) with {len(urls)} localized sitemap URLs')
