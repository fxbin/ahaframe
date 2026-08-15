from __future__ import annotations
from pathlib import Path
from urllib.parse import urlparse
import json, re, subprocess, sys, xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

from ahaframe.i18n import ROUTE_PREFIX, SUPPORTED_LOCALES, load_locale_source

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/"site"
CONTENT=json.loads((ROOT/"content/en.json").read_text(encoding="utf-8"))


def route_file(locale: str, relative: str) -> str:
    prefix=ROUTE_PREFIX[locale]
    return f"{prefix}/index.html" if not relative else f"{prefix}/{relative}index.html"


def route_files(relative: str) -> set[str]:
    return {
        route_file(locale,relative)
        for locale in SUPPORTED_LOCALES
        if relative in load_locale_source(locale).get("availableRoutes",[])
    }


EXPECTED_HTML={"index.html","404.html"}
for locale in SUPPORTED_LOCALES:
    for relative in load_locale_source(locale).get("availableRoutes",[]):
        EXPECTED_HTML.add(route_file(locale,relative))

INTERACTIVE_RELATIVES={
    "",
    "lessons/token-playground/","lessons/context-window/","lessons/agent-loop/",
    "labs/rag-failure/","labs/agent-reliability/","labs/evaluation-failure/",
    "labs/context-compression/","labs/instruction-conflict/","labs/agent-workflow-graph/",
    "build/reliable-support-agent/",
}
INTERACTIVE_HTML=set().union(*(route_files(relative) for relative in INTERACTIVE_RELATIVES))

EXTRA_SCRIPTS={
    "labs/evaluation-failure/":("/assets/evaluation-scenario.js","/assets/evaluation.js"),
    "labs/context-compression/":("/assets/context-compression-scenario.js","/assets/context-compression.js"),
    "labs/instruction-conflict/":("/assets/instruction-conflict-scenario.js","/assets/prompt-authority.js"),
    "labs/agent-workflow-graph/":("/assets/agent-workflow-graph-scenario.js","/assets/agent-workflow-graph.js"),
}
MOUNTS={
    "labs/rag-failure/":"[data-rag-lab]",
    "labs/agent-reliability/":"[data-agent-reliability-lab]",
    "labs/evaluation-failure/":"[data-evaluation-lab]",
    "labs/context-compression/":"[data-context-compression-lab]",
    "labs/instruction-conflict/":"[data-instruction-conflict-lab]",
    "labs/agent-workflow-graph/":"[data-agent-workflow-graph-lab]",
    "build/reliable-support-agent/":"[data-reliable-support-agent]",
}


def locale_relative_for_file(rel: str):
    for locale in SUPPORTED_LOCALES:
        prefix=ROUTE_PREFIX[locale]+"/"
        if rel.startswith(prefix):
            suffix=rel[len(prefix):]
            if suffix=="index.html":
                return locale,""
            if suffix.endswith("index.html"):
                return locale,suffix[:-len("index.html")]
    return None,None


def textual_weight(text: str) -> int:
    # English whitespace words + CJK codepoints gives a stable cross-locale
    # thin-content guard without pretending Chinese segmentation is whitespace based.
    latin_words=len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'_-]*",text))
    cjk=len(re.findall(r"[\u3400-\u9fff]",text))
    return latin_words+cjk


errors=[]
if not SITE.exists(): raise SystemExit("site/ is missing. Run scripts/build_site.py first.")
html_files=sorted(SITE.rglob("*.html")); actual_html={str(path.relative_to(SITE)) for path in html_files}
if actual_html!=EXPECTED_HTML: errors.append(f"HTML route set mismatch: missing={sorted(EXPECTED_HTML-actual_html)}, extra={sorted(actual_html-EXPECTED_HTML)}")

for file in html_files:
    soup=BeautifulSoup(file.read_text(encoding="utf-8"),"html.parser"); rel=str(file.relative_to(SITE))
    locale,relative=locale_relative_for_file(rel)
    if not soup.title: errors.append(f"{rel}: missing title")
    if not soup.find("meta",attrs={"name":"description"}): errors.append(f"{rel}: missing meta description")
    if not soup.find("link",attrs={"rel":"canonical"}): errors.append(f"{rel}: missing canonical")
    if locale and soup.html and soup.html.get("lang")!=locale: errors.append(f"{rel}: html lang must be {locale}")
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
        if relative in EXTRA_SCRIPTS:
            scenario,adapter=EXTRA_SCRIPTS[relative]
            if scenario not in scripts or adapter not in scripts: errors.append(f"{rel}: missing page scenario or adapter")
            elif not scripts.index(scenarios)<scripts.index(scenario)<scripts.index(adapter): errors.append(f"{rel}: invalid scenario/adapter load order")
        if relative=="build/reliable-support-agent/":
            required=["/assets/instruction-conflict-scenario.js","/assets/evaluation-scenario.js","/assets/context-compression-scenario.js","/assets/agent-workflow-graph-scenario.js","/assets/reliable-support-scenario.js","/assets/integrated-build.js"]
            if any(item not in scripts for item in required): errors.append(f"{rel}: missing integrated scenario modules")
            else:
                positions=[scripts.index(item) for item in required]
                if positions!=sorted(positions) or scripts.index(scenarios)>positions[0]: errors.append(f"{rel}: invalid integrated scenario load order")

    if relative and relative.startswith("lessons/"):
        if len(soup.find_all("h1"))!=1: errors.append(f"{rel}: expected one H1")
        if textual_weight(soup.get_text(" ",strip=True))<250: errors.append(f"{rel}: lesson textual content too thin")
        if "LearningResource" not in " ".join(n.get_text() for n in soup.find_all("script",attrs={"type":"application/ld+json"})): errors.append(f"{rel}: missing LearningResource schema")
        if not soup.select_one(".quick-answer") or not soup.select_one("[data-share]") or not soup.select_one("[data-complete-lesson]"): errors.append(f"{rel}: incomplete lesson controls")

    if relative and (relative.startswith("labs/") or relative.startswith("build/")):
        if len(soup.find_all("h1"))!=1: errors.append(f"{rel}: expected one H1")
        if textual_weight(soup.get_text(" ",strip=True))<300: errors.append(f"{rel}: interactive content too thin")
        if "LearningResource" not in " ".join(n.get_text() for n in soup.find_all("script",attrs={"type":"application/ld+json"})): errors.append(f"{rel}: missing LearningResource schema")
        if not soup.select_one(".quick-answer") or not soup.select_one("[data-share]"): errors.append(f"{rel}: missing answer-first/share controls")
    if relative in MOUNTS and not soup.select_one(MOUNTS[relative]): errors.append(f"{rel}: missing interactive mount point")

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
    # Sitemap localization is the explicit #47 release/SEO gate. Until then the
    # canonical English discovery surface remains 13 URLs.
    if len(locs)!=13: errors.append(f"sitemap: expected 13 English URLs before #47, got {len(locs)}")
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
print(f"PASS: {len(html_files)} pages across {len(SUPPORTED_LOCALES)} locales; six-layer conceptual closure, integration, JS and deployment config validated.")
