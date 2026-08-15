"""Inject third-party traffic analytics into generated public HTML.

This layer is intentionally separate from AhaFrame's first-party Validation Alpha
instrumentation. Vercel Web Analytics and GA4 are traffic/growth observability;
Validation Alpha remains the product-decision event source of truth.
"""

from __future__ import annotations

import html
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "site"

GA_PATTERN = re.compile(r"^G-[A-Z0-9]+$")
DEFAULT_GA_MEASUREMENT_ID = "G-EWPR5QXGWJ"
VERCEL_MARKER = 'data-ahaframe-analytics="vercel"'
GA_MARKER = 'data-ahaframe-analytics="ga4"'


def is_public_build() -> bool:
    raw = os.environ.get("AHAFRAME_BASE_URL", "http://localhost:8080").strip()
    parsed = urlparse(raw)
    return parsed.hostname not in {"localhost", "127.0.0.1", None}


def google_analytics_id() -> str:
    configured = (
        os.environ.get("NEXT_PUBLIC_GA_MEASUREMENT_ID")
        or os.environ.get("AHAFRAME_GA_MEASUREMENT_ID")
        or ""
    ).strip().upper()
    raw = configured or (DEFAULT_GA_MEASUREMENT_ID if is_public_build() else "")
    if raw and not GA_PATTERN.fullmatch(raw):
        raise SystemExit(
            "Google Analytics Measurement ID must use GA4 format G-XXXXXXXXXX "
            "(NEXT_PUBLIC_GA_MEASUREMENT_ID or AHAFRAME_GA_MEASUREMENT_ID)."
        )
    return raw


def ga4_head_snippet(measurement_id: str) -> str:
    if not measurement_id:
        return ""
    safe_attr = html.escape(measurement_id, quote=True)
    safe_js = json.dumps(measurement_id)
    return (
        f'<script {GA_MARKER} async '
        f'src="https://www.googletagmanager.com/gtag/js?id={safe_attr}"></script>'
        f'<script {GA_MARKER}>'
        "window.dataLayer=window.dataLayer||[];"
        "function gtag(){dataLayer.push(arguments);};"
        "gtag('js',new Date());"
        f"gtag('config',{safe_js});"
        "</script>"
    )


def vercel_body_snippet() -> str:
    return (
        f'<script {VERCEL_MARKER}>'
        "window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};"
        "</script>"
        f'<script {VERCEL_MARKER} defer src="/_vercel/insights/script.js"></script>'
    )


def inject_html_document(
    source: str,
    *,
    enable_vercel: bool,
    measurement_id: str = "",
) -> str:
    result = source
    if measurement_id and GA_MARKER not in result:
        if "<head>" not in result:
            raise ValueError("Generated HTML is missing <head> for GA4 injection.")
        result = result.replace("<head>", "<head>" + ga4_head_snippet(measurement_id), 1)
    if enable_vercel and VERCEL_MARKER not in result:
        if "</body>" not in result:
            raise ValueError("Generated HTML is missing </body> for Vercel Analytics injection.")
        result = result.replace("</body>", vercel_body_snippet() + "</body>", 1)
    return result


def apply() -> None:
    enable_vercel = is_public_build()
    measurement_id = google_analytics_id()
    if not enable_vercel and not measurement_id:
        return

    pages = sorted(SITE.rglob("*.html"))
    if not pages:
        raise SystemExit("No generated HTML pages found for analytics injection.")

    for path in pages:
        source = path.read_text(encoding="utf-8")
        rendered = inject_html_document(
            source,
            enable_vercel=enable_vercel,
            measurement_id=measurement_id,
        )
        path.write_text(rendered, encoding="utf-8")
