"""Submit the deployed Next.js sitemap URLs to IndexNow.

Workflow:
  1. Deploy AhaFrame with INDEXNOW_KEY so /{key}.txt is publicly reachable.
  2. Verify the deployed key file.
  3. Run this script against the production origin.

Usage:
  INDEXNOW_KEY=... AHAFRAME_BASE_URL=https://ahaframe.com python3 scripts/indexnow.py
"""
from urllib.parse import urlparse
import json
import os
import re
import urllib.request
import xml.etree.ElementTree as ET

BASE = os.environ.get("AHAFRAME_BASE_URL", "").rstrip("/")
KEY = os.environ.get("INDEXNOW_KEY", "")

if not BASE or not KEY:
    raise SystemExit("Set AHAFRAME_BASE_URL and INDEXNOW_KEY first.")
if not re.fullmatch(r"[A-Za-z0-9-]{8,128}", KEY):
    raise SystemExit("INDEXNOW_KEY must be 8–128 characters using letters, digits, or hyphens.")

parsed = urlparse(BASE)
if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path not in {"", "/"}:
    raise SystemExit("AHAFRAME_BASE_URL must be an origin such as https://ahaframe.com (no path).")

sitemap_url = f"{BASE}/sitemap.xml"
try:
    with urllib.request.urlopen(sitemap_url, timeout=15) as response:
        sitemap_xml = response.read()
except Exception as exc:
    raise SystemExit(f"Deployed sitemap is not reachable at {sitemap_url}: {exc}") from exc

root = ET.fromstring(sitemap_xml)
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [x.text for x in root.findall("s:url/s:loc", ns) if x.text]
if not urls or any(urlparse(url).netloc != parsed.netloc for url in urls):
    raise SystemExit("Sitemap URLs do not match AHAFRAME_BASE_URL.")

key_url = f"{BASE}/{KEY}.txt"
try:
    with urllib.request.urlopen(key_url, timeout=15) as response:
        deployed_key = response.read().decode("utf-8").strip()
except Exception as exc:
    raise SystemExit(f"IndexNow key file is not reachable at {key_url}: {exc}") from exc
if deployed_key != KEY:
    raise SystemExit("The deployed IndexNow key file does not match INDEXNOW_KEY.")

payload = {
    "host": parsed.netloc,
    "key": KEY,
    "keyLocation": key_url,
    "urlList": urls,
}
request = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json; charset=utf-8"},
    method="POST",
)
with urllib.request.urlopen(request, timeout=20) as response:
    print("IndexNow status:", response.status)
