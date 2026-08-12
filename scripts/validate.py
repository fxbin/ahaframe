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
    "index.html",
    "404.html",
    "en/index.html",
    "en/pricing/index.html",
    "en/early-access/index.html",
    "en/lessons/token-playground/index.html",
    "en/lessons/context-window/index.html",
    "en/lessons/agent-loop/index.html",
}
errors: list[str] = []

if not SITE.exists():
    raise SystemExit("site/ is missing. Run scripts/build_site.py first.")

html_files = sorted(SITE.rglob("*.html"))
actual_html = {str(path.relative_to(SITE)) for path in html_files}
if actual_html != EXPECTED_HTML:
    errors.append(
        "HTML route set mismatch: "
        f"missing={sorted(EXPECTED_HTML-actual_html)}, extra={sorted(actual_html-EXPECTED_HTML)}"
    )

for file in html_files:
    text = file.read_text(encoding="utf-8")
    soup = BeautifulSoup(text, "html.parser")
    rel = str(file.relative_to(SITE))

    if not soup.title:
        errors.append(f"{rel}: missing title")
    if not soup.find("meta", attrs={"name": "description"}):
        errors.append(f"{rel}: missing meta description")
    if not soup.find("link", attrs={"rel": "canonical"}):
        errors.append(f"{rel}: missing canonical")

    ids = [node.get("id") for node in soup.find_all(attrs={"id": True})]
    duplicate_ids = sorted({value for value in ids if ids.count(value) > 1})
    if duplicate_ids:
        errors.append(f"{rel}: duplicate ids {duplicate_ids}")

    for image in soup.find_all("img"):
        if not image.has_attr("alt"):
            errors.append(f"{rel}: image missing alt")

    for button in soup.find_all("button"):
        if button.get("type") not in {"button", "submit", "reset"}:
            errors.append(f"{rel}: button missing explicit type")

    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            json.loads(script.string or script.get_text())
        except Exception as exc:
            errors.append(f"{rel}: invalid JSON-LD: {exc}")

    if rel.startswith("en/lessons/"):
        h1 = soup.find_all("h1")
        if len(h1) != 1:
            errors.append(f"{rel}: expected one H1, found {len(h1)}")
        if len(soup.get_text(" ", strip=True).split()) < 250:
            errors.append(f"{rel}: lesson textual content too thin")
        ld_text = " ".join(
            node.get_text() for node in soup.find_all("script", attrs={"type": "application/ld+json"})
        )
        if "LearningResource" not in ld_text:
            errors.append(f"{rel}: missing LearningResource semantic schema")
        if '"@type":"Course"' in ld_text:
            errors.append(f"{rel}: Course schema should not be used for an MVP lesson")
        if not soup.select_one(".quick-answer"):
            errors.append(f"{rel}: missing answer-first block")
        if not soup.select_one("[data-share]"):
            errors.append(f"{rel}: missing share control")
        if not soup.select_one("[data-complete-lesson]"):
            errors.append(f"{rel}: missing completion control")

    for anchor in soup.find_all("a", href=True):
        href = anchor["href"]
        if href.startswith("/") and not href.startswith("//"):
            path = urlparse(href).path
            if path in {"/llms.txt", "/sitemap.xml"}:
                continue
            target = SITE / path.lstrip("/")
            if path.endswith("/"):
                target = target / "index.html"
            if path == "/":
                target = SITE / "index.html"
            if not target.exists():
                errors.append(f"{rel}: broken link {href}")

# Sitemap: Google uses accurate lastmod but ignores changefreq and priority.
try:
    sitemap_text = (SITE / "sitemap.xml").read_text(encoding="utf-8")
    if "<changefreq>" in sitemap_text or "<priority>" in sitemap_text:
        errors.append("sitemap: remove ignored changefreq/priority fields")
    root = ET.fromstring(sitemap_text)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [node.text for node in root.findall("s:url/s:loc", ns)]
    lastmods = [node.text for node in root.findall("s:url/s:lastmod", ns)]
    if len(locs) != 6:
        errors.append(f"sitemap: expected 6 URLs, got {len(locs)}")
    if len(lastmods) != len(locs) or any(value != CONTENT["meta"]["updated"] for value in lastmods):
        errors.append("sitemap: lastmod must match the explicit content update date")
except Exception as exc:
    errors.append(f"sitemap invalid: {exc}")

css = (SITE / "assets/styles.css").read_text(encoding="utf-8").lower()
if "#4f46e5" in css or "#6d38f7" in css:
    errors.append("legacy blue-purple brand colors remain in CSS")

for js in sorted((SITE / "assets").glob("*.js")):
    result = subprocess.run(["node", "--check", str(js)], capture_output=True, text=True)
    if result.returncode:
        errors.append(f"{js.relative_to(SITE)}: JS syntax error\n{result.stderr}")

# Deployment config must build from source and emit site/ rather than committing generated output.
try:
    vercel = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
    if vercel.get("outputDirectory") != "site":
        errors.append("vercel.json: outputDirectory must be site")
    if "scripts/build_site.py" not in vercel.get("buildCommand", ""):
        errors.append("vercel.json: buildCommand must run scripts/build_site.py")
except Exception as exc:
    errors.append(f"vercel.json invalid: {exc}")

if errors:
    print("\n".join(errors))
    sys.exit(1)

print(
    f"PASS v0.2: {len(html_files)} HTML pages; routes, links, metadata, JSON-LD, "
    "accessibility basics, sitemap, theme, JS and deployment config validated."
)
