from __future__ import annotations
from pathlib import Path
from urllib.parse import urlparse
import json, subprocess, sys, xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]; SITE=ROOT/"site"; CONTENT=json.loads((ROOT/"content/en.json").read_text(encoding="utf-8"))
EXPECTED_HTML={"index.html","404.html","en/index.html","en/pricing/index.html","en/early-access/index.html","en/lessons/token-playground/index.html","en/lessons/context-window/index.html","en/lessons/agent-loop/index.html","en/labs/rag-failure/index.html","en/labs/agent-reliability/index.html","en/labs/evaluation-failure/index.html","en/labs/context-compression/index.html","en/labs/instruction-conflict/index.html","en/labs/agent-workflow-graph/index.html","en/build/reliable-support-agent/index.html"}
INTERACTIVE_HTML={"en/index.html","en/lessons/token-playground/index.html","en/lessons/context-window/index.html","en/lessons/agent-loop/index.html","en/labs/rag-failure/index.html","en/labs/agent-reliability/index.html","en/labs/evaluation-failure/index.html","en/labs/context-compression/index.html","en/labs/instruction-conflict/index.html","en/labs/agent-workflow-graph/index.html","en/build/reliable-support-agent/index.html"}
errors=[]
if not SITE.exists(): raise SystemExit("site/ is missing. Run scripts/build_site.py first.")
html_files=sorted(SITE.rglob("*.html")); actual_html={str(path.relative_to(SITE)) for path in html_files}
if actual_html!=EXPECTED_HTML: errors.append(f"HTML route set mismatch: missing={sorted(EXPECTED_HTML-actual_html)}, extra={sorted(actual_html-EXPECTED_HTML)}")

for file in html_files:
    soup=BeautifulSoup(file.read_text(encoding="utf-8"),"html.parser"); rel=str(file.relative_to(SITE))
    if not soup.title: errors.append(f"{rel}: missing title")
    if not soup.find("meta",attrs={"name":"description"}): errors.append(f"{rel}: missing meta description")
    if not soup.find("link",attrs={"rel":"canonical"}): errors.append(f"{rel}: missing canonical")
    ids=[node.get("id") for node in soup.find_all(attrs={"id":True})]; dup=sorted({v for v in ids if ids.count(v)>1})
    if dup: errors.append(f"{rel}: duplicate ids {dup}")
    for image in soup.find_all("img"):
        if not image.has_attr("alt"): errors.append(f"{rel}: image missing alt")
    for button in soup.find_all("button"):
        if button.get("type") not in {"button","submit","reset"}: errors.append(f"{rel}: button missing explicit type")
    for script in soup.find_all("script",attrs={"type":"application/ld+json"}):
        try: json.loads(script.string or script.get_text())
        except Exception as exc: errors.append(f"{rel}: invalid JSON-LD: {exc}")

    if rel in INTERACTIVE_HTML:
        scripts=[node.get("src") for node in soup.find_all("script",src=True)]; engine="/assets/lab-engine.js"; scenarios="/assets/lab-scenarios.js"
        if engine not in scripts or scenarios not in scripts: errors.append(f"{rel}: missing Lab Engine runtime")
        elif scripts.index(engine)>scripts.index(scenarios): errors.append(f"{rel}: lab-engine.js must load before lab-scenarios.js")
        extras={"en/labs/evaluation-failure/index.html":("/assets/evaluation-scenario.js","/assets/evaluation.js"),"en/labs/context-compression/index.html":("/assets/context-compression-scenario.js","/assets/context-compression.js"),"en/labs/instruction-conflict/index.html":("/assets/instruction-conflict-scenario.js","/assets/prompt-authority.js"),"en/labs/agent-workflow-graph/index.html":("/assets/agent-workflow-graph-scenario.js","/assets/agent-workflow-graph.js")}
        if rel in extras:
            scenario,adapter=extras[rel]
            if scenario not in scripts or adapter not in scripts: errors.append(f"{rel}: missing page scenario or adapter")
            elif not scripts.index(scenarios)<scripts.index(scenario)<scripts.index(adapter): errors.append(f"{rel}: invalid scenario/adapter load order")
        if rel=="en/build/reliable-support-agent/index.html":
            required=["/assets/instruction-conflict-scenario.js","/assets/evaluation-scenario.js","/assets/context-compression-scenario.js","/assets/agent-workflow-graph-scenario.js","/assets/reliable-support-scenario.js","/assets/integrated-build.js"]
            if any(item not in scripts for item in required): errors.append(f"{rel}: missing integrated scenario modules")
            else:
                positions=[scripts.index(item) for item in required]
                if positions!=sorted(positions) or scripts.index(scenarios)>positions[0]: errors.append(f"{rel}: invalid integrated scenario load order")

    if rel.startswith("en/lessons/"):
        if len(soup.find_all("h1"))!=1: errors.append(f"{rel}: expected one H1")
        if len(soup.get_text(" ",strip=True).split())<250: errors.append(f"{rel}: lesson textual content too thin")
        if "LearningResource" not in " ".join(n.get_text() for n in soup.find_all("script",attrs={"type":"application/ld+json"})): errors.append(f"{rel}: missing LearningResource schema")
        if not soup.select_one(".quick-answer") or not soup.select_one("[data-share]") or not soup.select_one("[data-complete-lesson]"): errors.append(f"{rel}: incomplete lesson controls")

    if rel.startswith("en/labs/") or rel.startswith("en/build/"):
        if len(soup.find_all("h1"))!=1: errors.append(f"{rel}: expected one H1")
        if len(soup.get_text(" ",strip=True).split())<300: errors.append(f"{rel}: interactive content too thin")
        if "LearningResource" not in " ".join(n.get_text() for n in soup.find_all("script",attrs={"type":"application/ld+json"})): errors.append(f"{rel}: missing LearningResource schema")
        if not soup.select_one(".quick-answer") or not soup.select_one("[data-share]"): errors.append(f"{rel}: missing answer-first/share controls")
    mounts={"en/labs/rag-failure/index.html":"[data-rag-lab]","en/labs/agent-reliability/index.html":"[data-agent-reliability-lab]","en/labs/evaluation-failure/index.html":"[data-evaluation-lab]","en/labs/context-compression/index.html":"[data-context-compression-lab]","en/labs/instruction-conflict/index.html":"[data-instruction-conflict-lab]","en/labs/agent-workflow-graph/index.html":"[data-agent-workflow-graph-lab]","en/build/reliable-support-agent/index.html":"[data-reliable-support-agent]"}
    if rel in mounts and not soup.select_one(mounts[rel]): errors.append(f"{rel}: missing interactive mount point")
    for anchor in soup.find_all("a",href=True):
        href=anchor["href"]
        if href.startswith("/") and not href.startswith("//"):
            path=urlparse(href).path
            if path in {"/llms.txt","/sitemap.xml"}: continue
            target=SITE/path.lstrip("/"); target=target/"index.html" if path.endswith("/") else target
            if path=="/": target=SITE/"index.html"
            if not target.exists(): errors.append(f"{rel}: broken link {href}")

try:
    root=ET.fromstring((SITE/"sitemap.xml").read_text(encoding="utf-8")); ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}; locs=[n.text for n in root.findall("s:url/s:loc",ns)]; lastmods=[n.text for n in root.findall("s:url/s:lastmod",ns)]
    if len(locs)!=13: errors.append(f"sitemap: expected 13 URLs, got {len(locs)}")
    for slug in ["rag-failure","agent-reliability","evaluation-failure","context-compression","instruction-conflict","agent-workflow-graph"]:
        if not any((v or '').endswith(f"/en/labs/{slug}/") for v in locs): errors.append(f"sitemap: missing {slug}")
    if not any((v or '').endswith('/en/build/reliable-support-agent/') for v in locs): errors.append('sitemap: missing integrated Build')
    if len(lastmods)!=len(locs) or any(v!=CONTENT["meta"]["updated"] for v in lastmods): errors.append('sitemap: invalid lastmod')
except Exception as exc: errors.append(f"sitemap invalid: {exc}")

for required in ["lab-engine.js","lab-scenarios.js","rag.js","agent-reliability.js","evaluation-scenario.js","evaluation.js","context-compression-scenario.js","context-compression.js","instruction-conflict-scenario.js","prompt-authority.js","agent-workflow-graph-scenario.js","agent-workflow-graph.js","reliable-support-scenario.js","integrated-build.js"]:
    if not (SITE/"assets"/required).exists(): errors.append(f"assets/{required}: missing")
for js in sorted((SITE/"assets").glob("*.js")):
    result=subprocess.run(["node","--check",str(js)],capture_output=True,text=True)
    if result.returncode: errors.append(f"{js.relative_to(SITE)}: JS syntax error\n{result.stderr}")
for test_file,label in [("test_lab_engine.js","Lab Engine"),("test_instruction_conflict.js","Prompt"),("test_agent_workflow_graph.js","Graph"),("test_integrated_build.js","Integrated Build")]:
    result=subprocess.run(["node",str(ROOT/"scripts"/test_file)],capture_output=True,text=True)
    if result.returncode: errors.append(f"{label} tests failed\n{result.stdout}\n{result.stderr}")
try:
    vercel=json.loads((ROOT/"vercel.json").read_text(encoding="utf-8"))
    if vercel.get("outputDirectory")!="site" or "scripts/build_site.py" not in vercel.get("buildCommand",""): errors.append('vercel.json invalid build config')
except Exception as exc: errors.append(f"vercel.json invalid: {exc}")
if errors: print("\n".join(errors)); sys.exit(1)
print(f"PASS: {len(html_files)} pages; six-layer conceptual closure, integration, JS and deployment config validated.")
