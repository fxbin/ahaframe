from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse
import json
import subprocess
import sys
import xml.etree.ElementTree as ET

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
CONTENT = json.loads((ROOT / "content/en.json").read_text(encoding="utf-8"))
EXPECTED_HTML = {
    "index.html", "404.html", "en/index.html", "en/pricing/index.html", "en/early-access/index.html",
    "en/lessons/token-playground/index.html", "en/lessons/context-window/index.html", "en/lessons/agent-loop/index.html",
    "en/labs/rag-failure/index.html", "en/labs/agent-reliability/index.html", "en/labs/evaluation-failure/index.html",
    "en/labs/context-compression/index.html", "en/labs/instruction-conflict/index.html", "en/labs/agent-workflow-graph/index.html",
}
INTERACTIVE_HTML = {
    "en/index.html", "en/lessons/token-playground/index.html", "en/lessons/context-window/index.html", "en/lessons/agent-loop/index.html",
    "en/labs/rag-failure/index.html", "en/labs/agent-reliability/index.html", "en/labs/evaluation-failure/index.html",
    "en/labs/context-compression/index.html", "en/labs/instruction-conflict/index.html", "en/labs/agent-workflow-graph/index.html",
}
errors: list[str] = []

if not SITE.exists():
    raise SystemExit("site/ is missing. Run scripts/build_site.py first.")

html_files = sorted(SITE.rglob("*.html"))
actual_html = {str(path.relative_to(SITE)) for path in html_files}
if actual_html != EXPECTED_HTML:
    errors.append("HTML route set mismatch: " f"missing={sorted(EXPECTED_HTML-actual_html)}, extra={sorted(actual_html-EXPECTED_HTML)}")

for file in html_files:
    text = file.read_text(encoding="utf-8")
    soup = BeautifulSoup(text, "html.parser")
    rel = str(file.relative_to(SITE))
    if not soup.title: errors.append(f"{rel}: missing title")
    if not soup.find("meta", attrs={"name": "description"}): errors.append(f"{rel}: missing meta description")
    if not soup.find("link", attrs={"rel": "canonical"}): errors.append(f"{rel}: missing canonical")
    ids = [node.get("id") for node in soup.find_all(attrs={"id": True})]
    duplicate_ids = sorted({value for value in ids if ids.count(value) > 1})
    if duplicate_ids: errors.append(f"{rel}: duplicate ids {duplicate_ids}")
    for image in soup.find_all("img"):
        if not image.has_attr("alt"): errors.append(f"{rel}: image missing alt")
    for button in soup.find_all("button"):
        if button.get("type") not in {"button", "submit", "reset"}: errors.append(f"{rel}: button missing explicit type")
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try: json.loads(script.string or script.get_text())
        except Exception as exc: errors.append(f"{rel}: invalid JSON-LD: {exc}")

    if rel in INTERACTIVE_HTML:
        scripts = [node.get("src") for node in soup.find_all("script", src=True)]
        engine, scenarios = "/assets/lab-engine.js", "/assets/lab-scenarios.js"
        if engine not in scripts or scenarios not in scripts: errors.append(f"{rel}: missing Lab Engine runtime")
        elif scripts.index(engine) > scripts.index(scenarios): errors.append(f"{rel}: lab-engine.js must load before lab-scenarios.js")
        extras={
            "en/labs/evaluation-failure/index.html":("/assets/evaluation-scenario.js","/assets/evaluation.js","Evaluation Failure"),
            "en/labs/context-compression/index.html":("/assets/context-compression-scenario.js","/assets/context-compression.js","Context Compression"),
            "en/labs/instruction-conflict/index.html":("/assets/instruction-conflict-scenario.js","/assets/prompt-authority.js","Instruction Conflict"),
            "en/labs/agent-workflow-graph/index.html":("/assets/agent-workflow-graph-scenario.js","/assets/agent-workflow-graph.js","Agent Workflow Graph"),
        }
        if rel in extras:
            scenario, adapter, label=extras[rel]
            if scenario not in scripts or adapter not in scripts: errors.append(f"{rel}: missing {label} scenario or adapter")
            elif not (scripts.index(scenarios) < scripts.index(scenario) < scripts.index(adapter)): errors.append(f"{rel}: {label} scripts must load scenario before adapter after base scenarios")

    if rel.startswith("en/lessons/"):
        h1=soup.find_all("h1")
        if len(h1)!=1: errors.append(f"{rel}: expected one H1, found {len(h1)}")
        if len(soup.get_text(" ",strip=True).split())<250: errors.append(f"{rel}: lesson textual content too thin")
        ld_text=" ".join(node.get_text() for node in soup.find_all("script",attrs={"type":"application/ld+json"}))
        if "LearningResource" not in ld_text: errors.append(f"{rel}: missing LearningResource semantic schema")
        if '"@type":"Course"' in ld_text: errors.append(f"{rel}: Course schema should not be used for an MVP lesson")
        if not soup.select_one(".quick-answer"): errors.append(f"{rel}: missing answer-first block")
        if not soup.select_one("[data-share]"): errors.append(f"{rel}: missing share control")
        if not soup.select_one("[data-complete-lesson]"): errors.append(f"{rel}: missing completion control")

    if rel.startswith("en/labs/"):
        h1=soup.find_all("h1")
        if len(h1)!=1: errors.append(f"{rel}: expected one H1, found {len(h1)}")
        if len(soup.get_text(" ",strip=True).split())<300: errors.append(f"{rel}: production lab textual content too thin")
        ld_text=" ".join(node.get_text() for node in soup.find_all("script",attrs={"type":"application/ld+json"}))
        if "LearningResource" not in ld_text: errors.append(f"{rel}: missing LearningResource semantic schema")
        if not soup.select_one(".quick-answer"): errors.append(f"{rel}: missing answer-first block")
        if not soup.select_one("[data-share]"): errors.append(f"{rel}: missing share control")
        mounts={
            "en/labs/rag-failure/index.html":"[data-rag-lab]",
            "en/labs/agent-reliability/index.html":"[data-agent-reliability-lab]",
            "en/labs/evaluation-failure/index.html":"[data-evaluation-lab]",
            "en/labs/context-compression/index.html":"[data-context-compression-lab]",
            "en/labs/instruction-conflict/index.html":"[data-instruction-conflict-lab]",
            "en/labs/agent-workflow-graph/index.html":"[data-agent-workflow-graph-lab]",
        }
        if rel in mounts and not soup.select_one(mounts[rel]): errors.append(f"{rel}: missing Lab mount point")

    for anchor in soup.find_all("a",href=True):
        href=anchor["href"]
        if href.startswith("/") and not href.startswith("//"):
            path=urlparse(href).path
            if path in {"/llms.txt","/sitemap.xml"}: continue
            target=SITE/path.lstrip("/")
            if path.endswith("/"): target=target/"index.html"
            if path=="/": target=SITE/"index.html"
            if not target.exists(): errors.append(f"{rel}: broken link {href}")

try:
    sitemap_text=(SITE/"sitemap.xml").read_text(encoding="utf-8")
    if "<changefreq>" in sitemap_text or "<priority>" in sitemap_text: errors.append("sitemap: remove ignored changefreq/priority fields")
    root=ET.fromstring(sitemap_text); ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs=[node.text for node in root.findall("s:url/s:loc",ns)]; lastmods=[node.text for node in root.findall("s:url/s:lastmod",ns)]
    if len(locs)!=12: errors.append(f"sitemap: expected 12 URLs, got {len(locs)}")
    for slug in ["rag-failure","agent-reliability","evaluation-failure","context-compression","instruction-conflict","agent-workflow-graph"]:
        if not any((value or "").endswith(f"/en/labs/{slug}/") for value in locs): errors.append(f"sitemap: missing {slug} URL")
    if len(lastmods)!=len(locs) or any(value!=CONTENT["meta"]["updated"] for value in lastmods): errors.append("sitemap: lastmod must match the explicit content update date")
except Exception as exc: errors.append(f"sitemap invalid: {exc}")

css=(SITE/"assets/styles.css").read_text(encoding="utf-8").lower()
if "#4f46e5" in css or "#6d38f7" in css: errors.append("legacy blue-purple brand colors remain in CSS")

for required in ["lab-engine.js","lab-scenarios.js","rag.js","agent-reliability.js","evaluation-scenario.js","evaluation.js","context-compression-scenario.js","context-compression.js","instruction-conflict-scenario.js","prompt-authority.js","agent-workflow-graph-scenario.js","agent-workflow-graph.js"]:
    if not (SITE/"assets"/required).exists(): errors.append(f"assets/{required}: missing generated Lab asset")

for js in sorted((SITE/"assets").glob("*.js")):
    result=subprocess.run(["node","--check",str(js)],capture_output=True,text=True)
    if result.returncode: errors.append(f"{js.relative_to(SITE)}: JS syntax error\n{result.stderr}")

for test_file,label in [("test_lab_engine.js","Lab Engine"),("test_instruction_conflict.js","Instruction Conflict"),("test_agent_workflow_graph.js","Agent Workflow Graph")]:
    result=subprocess.run(["node",str(ROOT/"scripts"/test_file)],capture_output=True,text=True)
    if result.returncode: errors.append(f"{label} behavioral tests failed\n{result.stdout}\n{result.stderr}")

try:
    vercel=json.loads((ROOT/"vercel.json").read_text(encoding="utf-8"))
    if vercel.get("outputDirectory")!="site": errors.append("vercel.json: outputDirectory must be site")
    if "scripts/build_site.py" not in vercel.get("buildCommand",""): errors.append("vercel.json: buildCommand must run scripts/build_site.py")
except Exception as exc: errors.append(f"vercel.json invalid: {exc}")

if errors:
    print("\n".join(errors)); sys.exit(1)

print(f"PASS: {len(html_files)} HTML pages; routes, metadata, Lab Engine, Prompt, Context, Harness, Loop, Graph, Evaluation, JS and deployment config validated.")
