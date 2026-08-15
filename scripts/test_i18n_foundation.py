from __future__ import annotations

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from ahaframe.i18n import (  # noqa: E402
    DEFAULT_LOCALE,
    PUBLIC_ROUTE_RELATIVES,
    REQUIRED_UI_KEYS,
    SUPPORTED_LOCALES,
    assert_public_route_contract,
    equivalent_paths,
    language_switch_items,
    load_content_source,
    load_locale_source,
    localized_or_default_path,
    localized_path,
    route_available,
    ui,
    validate_locale_sources,
)

ZH_READY={
    "",
    "pricing/",
    "early-access/",
    "lessons/token-playground/",
    "lessons/context-window/",
    "lessons/agent-loop/",
}


def main() -> None:
    assert DEFAULT_LOCALE == "en"
    assert SUPPORTED_LOCALES == ("en", "zh-CN")

    validate_locale_sources()
    assert_public_route_contract()

    en = load_locale_source("en")
    zh = load_locale_source("zh-CN")
    assert en["routePrefix"] == "en"
    assert zh["routePrefix"] == "zh-cn"
    assert set(en["availableRoutes"]) == set(PUBLIC_ROUTE_RELATIVES)
    assert set(zh["availableRoutes"]) == ZH_READY

    for locale in SUPPORTED_LOCALES:
        for key in REQUIRED_UI_KEYS:
            assert ui(locale, key).strip(), (locale, key)
        assert load_content_source(locale,"home")["title"].strip()
        assert load_content_source(locale,"marketing")["pricing"]["title"].strip()
        foundation=load_content_source(locale,"foundation")
        assert set(foundation["lessons"]) == {"token-playground","context-window","agent-loop"}
        for slug,lesson in foundation["lessons"].items():
            assert lesson["name"].strip(), (locale,slug)
            assert lesson["quick"].strip(), (locale,slug)
            assert lesson["guide"]["title"].strip(), (locale,slug)

    assert ui("zh-CN", "nav.lessons") == "课程"
    assert ui("zh-CN", "language.zh-CN") == "简体中文"

    assert localized_path("/en/", "zh-CN") == "/zh-cn/"
    assert localized_path("/en/labs/rag-failure/", "zh-CN") == "/zh-cn/labs/rag-failure/"
    assert localized_path("/zh-cn/build/reliable-support-agent/", "en") == "/en/build/reliable-support-agent/"

    assert route_available("/en/", "zh-CN") is True
    assert route_available("/en/pricing/", "zh-CN") is True
    for slug in ("token-playground","context-window","agent-loop"):
        path=f"/en/lessons/{slug}/"
        assert route_available(path,"zh-CN") is True
        assert localized_or_default_path(path,"zh-CN") == f"/zh-cn/lessons/{slug}/"
    assert route_available("/en/labs/rag-failure/", "en") is True
    assert route_available("/en/labs/rag-failure/", "zh-CN") is False
    assert localized_or_default_path("/en/labs/rag-failure/","zh-CN") == "/en/labs/rag-failure/"

    lesson_switcher=language_switch_items("/en/lessons/context-window/")
    assert lesson_switcher[1]["available"] is True
    assert lesson_switcher[1]["href"] == "/zh-cn/lessons/context-window/"

    lab_switcher=language_switch_items("/en/labs/rag-failure/")
    assert lab_switcher[1]["available"] is False

    all_routes = set()
    for relative in PUBLIC_ROUTE_RELATIVES:
        paths = equivalent_paths(f"/en/{relative}")
        assert paths["en"] == f"/en/{relative}"
        assert paths["zh-CN"] == f"/zh-cn/{relative}"
        all_routes.update(paths.values())
    assert len(all_routes) == len(PUBLIC_ROUTE_RELATIVES) * len(SUPPORTED_LOCALES)

    localized_scenario_forks = sorted(
        p.name
        for p in (ROOT / "src" / "assets").glob("*.js")
        if "-zh" in p.stem.lower() or ".zh" in p.stem.lower()
    )
    assert localized_scenario_forks == [], localized_scenario_forks

    print(
        f"PASS: i18n foundation validates {len(SUPPORTED_LOCALES)} locales, "
        f"{len(PUBLIC_ROUTE_RELATIVES)} public route pairs, zh-CN Foundation rollout, "
        "shared UI keys, and no locale-specific scenario forks."
    )


if __name__ == "__main__":
    main()
