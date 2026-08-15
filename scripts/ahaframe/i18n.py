"""Locale registry and presentation-source contract for AhaFrame.

This module owns locale identity, URL prefix mapping, shared UI lookup, and
locale-source validation. It deliberately does not own Lab scenarios, actions,
metrics, presets, checkpoints, or analytics event names.
"""

from __future__ import annotations

from functools import lru_cache
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CONTENT_DIR = ROOT / "content"

DEFAULT_LOCALE = "en"
SUPPORTED_LOCALES = ("en", "zh-CN")
ROUTE_PREFIX = {
    "en": "en",
    "zh-CN": "zh-cn",
}
HREFLANG = {
    "en": "en",
    "zh-CN": "zh-CN",
}

# Public Validation Alpha route surface. Slugs stay locale-neutral in v1.
PUBLIC_ROUTE_RELATIVES = (
    "",
    "pricing/",
    "early-access/",
    "lessons/token-playground/",
    "lessons/context-window/",
    "lessons/agent-loop/",
    "labs/instruction-conflict/",
    "labs/rag-failure/",
    "labs/context-compression/",
    "labs/agent-reliability/",
    "labs/agent-workflow-graph/",
    "labs/evaluation-failure/",
    "build/reliable-support-agent/",
)

# M1 only locks shared shell/UI keys. Page prose is localized by #45/#46.
REQUIRED_UI_KEYS = (
    "nav.lessons",
    "nav.roadmap",
    "nav.pricing",
    "nav.about",
    "nav.early_access",
    "nav.menu",
    "footer.sitemap",
    "footer.about",
    "footer.early_access",
    "language.en",
    "language.zh-CN",
)


def normalize_locale(locale: str) -> str:
    if locale not in SUPPORTED_LOCALES:
        raise ValueError(f"Unsupported locale: {locale!r}; expected one of {SUPPORTED_LOCALES}")
    return locale


def route_prefix(locale: str) -> str:
    return ROUTE_PREFIX[normalize_locale(locale)]


def locale_root(locale: str) -> str:
    return f"/{route_prefix(locale)}/"


def _strip_known_prefix(path: str) -> str:
    normalized = "/" + path.lstrip("/")
    for prefix in ROUTE_PREFIX.values():
        root = f"/{prefix}/"
        if normalized == root.rstrip("/"):
            return ""
        if normalized.startswith(root):
            return normalized[len(root) :]
    return normalized.lstrip("/")


def localized_path(path: str, locale: str) -> str:
    """Map an existing public route to the equivalent locale-prefixed route."""
    relative = _strip_known_prefix(path)
    if relative and not relative.endswith("/"):
        # Current public content routes are directory routes. Asset/API paths are
        # intentionally outside this helper.
        raise ValueError(f"Expected a directory-style public route, got {path!r}")
    return f"/{route_prefix(locale)}/{relative}"


def equivalent_paths(path: str) -> dict[str, str]:
    return {locale: localized_path(path, locale) for locale in SUPPORTED_LOCALES}


def language_switch_items(path: str) -> tuple[dict[str, str], ...]:
    return tuple(
        {
            "locale": locale,
            "label": ui(locale, f"language.{locale}"),
            "href": localized_path(path, locale),
            "hreflang": HREFLANG[locale],
        }
        for locale in SUPPORTED_LOCALES
    )


@lru_cache(maxsize=None)
def load_locale_source(locale: str) -> dict[str, Any]:
    locale = normalize_locale(locale)
    path = CONTENT_DIR / f"{locale}.json"
    if not path.exists():
        raise FileNotFoundError(f"Missing locale source: {path.relative_to(ROOT)}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("locale") != locale:
        raise ValueError(f"{path.name}: locale field must be {locale!r}")
    return data


def _lookup(mapping: dict[str, Any], dotted_key: str) -> Any:
    current: Any = mapping
    for part in dotted_key.split("."):
        if not isinstance(current, dict) or part not in current:
            raise KeyError(dotted_key)
        current = current[part]
    return current


def ui(locale: str, key: str) -> str:
    value = _lookup(load_locale_source(locale), f"ui.{key}")
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{locale}: ui.{key} must be a non-empty string")
    return value


def validate_locale_sources() -> None:
    """Fail fast when locale identity or required shared UI keys drift."""
    errors: list[str] = []
    for locale in SUPPORTED_LOCALES:
        try:
            source = load_locale_source(locale)
        except Exception as exc:  # report both locales in one build failure
            errors.append(str(exc))
            continue
        if source.get("routePrefix") != ROUTE_PREFIX[locale]:
            errors.append(
                f"{locale}: routePrefix must be {ROUTE_PREFIX[locale]!r}, got {source.get('routePrefix')!r}"
            )
        for key in REQUIRED_UI_KEYS:
            try:
                value = _lookup(source, f"ui.{key}")
            except KeyError:
                errors.append(f"{locale}: missing ui.{key}")
                continue
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{locale}: ui.{key} must be a non-empty string")

    if errors:
        raise SystemExit("Invalid locale sources:\n- " + "\n- ".join(errors))


def assert_public_route_contract() -> None:
    """Validate that every public route has deterministic en/zh-CN equivalents."""
    seen: set[str] = set()
    for relative in PUBLIC_ROUTE_RELATIVES:
        source = f"/en/{relative}"
        for locale, target in equivalent_paths(source).items():
            expected = f"/{ROUTE_PREFIX[locale]}/{relative}"
            if target != expected:
                raise AssertionError(f"Route mapping drift: {source} -> {target}; expected {expected}")
            if target in seen:
                raise AssertionError(f"Duplicate localized route: {target}")
            seen.add(target)
