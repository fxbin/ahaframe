#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
GUIDES = CONTENT / "guides"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
GUIDE_COUNT = 80
BUNDLE_COUNT = 16


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def load_concepts():
    concepts = {}
    for path in sorted(INVENTORY.glob("*.json")):
        fragment = load(path)
        require(fragment.get("version") == "1.0.0", f"inventory version drifted: {path.name}")
        for concept in fragment.get("concepts", []):
            require(concept["id"] not in concepts, f"duplicate canonical Concept: {concept['id']}")
            concepts[concept["id"]] = concept
    return concepts


def expected_wave(bundle_number: int) -> str:
    if bundle_number <= 4:
        return "core-20"
    if bundle_number <= 8:
        return "core-40"
    if bundle_number <= 12:
        return "core-60"
    if bundle_number <= 16:
        return "core-80"
    raise AssertionError(f"unsupported Core Guide bundle number: {bundle_number}")


def load_guides(locale: str):
    paths = sorted(GUIDES.glob(f"core-*.{locale}.json"))
    require(len(paths) == BUNDLE_COUNT, f"{locale} must have exactly {BUNDLE_COUNT} Core Guide bundles, got {len(paths)}")
    guides = []
    for expected_number, path in enumerate(paths, start=1):
        bundle = load(path)
        require(bundle.get("version") == "1.0.0", f"Guide version drifted: {path.name}")
        require(bundle.get("locale") == locale, f"Guide locale drifted: {path.name}")
        require(bundle.get("wave") == expected_wave(expected_number), f"Guide wave drifted: {path.name}")
        require(bundle.get("bundle") == f"core-{expected_number:02d}", f"Guide bundle order drifted: {path.name}")
        require(len(bundle.get("guides", [])) == 5, f"Each Core Guide bundle must contain five Guides: {path.name}")
        guides.extend(bundle["guides"])
    return guides


def minimum_copy(guide: dict, locale: str):
    limits = {
        "en": {"summary": 45, "mental": 65, "why": 120, "section": 115},
        "zh-CN": {"summary": 18, "mental": 28, "why": 55, "section": 55},
    }[locale]
    require(len(guide["summary"]) >= limits["summary"], f"Guide summary is too thin: {locale}/{guide['slug']}")
    require(len(guide["mentalModel"]) >= limits["mental"], f"Guide mental model is too thin: {locale}/{guide['slug']}")
    require(len(guide["whyItMatters"]) >= limits["why"], f"Guide why-it-matters is too thin: {locale}/{guide['slug']}")
    for section in guide["sections"]:
        require(len(section["body"]) >= limits["section"], f"Guide section is too thin: {locale}/{guide['slug']}/{section['id']}")


def main():
    concepts = load_concepts()
    en = load_guides("en")
    zh = load_guides("zh-CN")
    en_routes = load(CONTENT / "en.json")["availableRoutes"]
    zh_routes = load(CONTENT / "zh-CN.json")["availableRoutes"]
    manifest = load(CONTENT / "ai-content-production-v1.0.json")
    coverage_plan = load(GUIDES / "coverage-plan-v1.0.json")

    require(len(en) == GUIDE_COUNT and len(zh) == GUIDE_COUNT, f"Core Guide publication must contain exactly {GUIDE_COUNT} Guides per locale")
    require([item["slug"] for item in en] == [item["slug"] for item in zh], "EN/zh-CN Guide slug order drifted")
    require([item["conceptId"] for item in en] == [item["conceptId"] for item in zh], "EN/zh-CN Guide Concept binding drifted")
    require([item["readingMinutes"] for item in en] == [item["readingMinutes"] for item in zh], "EN/zh-CN Guide reading-time parity drifted")
    require(en_routes == zh_routes, "Core Guide publication requires exact EN/zh-CN public-route parity")

    slugs = [item["slug"] for item in en]
    concept_ids = [item["conceptId"] for item in en]
    require(len(set(slugs)) == GUIDE_COUNT, "Core Guide slugs must be unique")
    require(len(set(concept_ids)) == GUIDE_COUNT, "Each Core Guide must bind exactly one unique canonical Concept")

    planned_core80 = (
        set(coverage_plan["baselineConceptIds"])
        | set(coverage_plan["core40Additions"])
        | set(coverage_plan["core60Additions"])
        | set(coverage_plan["core80Additions"])
    )
    require(set(concept_ids) == planned_core80, "Published Guide Concept bindings must exactly match the frozen core-80 coverage plan")

    require("guides/" in en_routes, "Guide Directory must remain a public canonical route")
    public_guide_routes = sorted(route for route in en_routes if route.startswith("guides/") and route != "guides/")
    expected_routes = sorted(f"guides/{slug}/" for slug in slugs)
    require(public_guide_routes == expected_routes, f"Public Guide detail routes must exactly mirror the {GUIDE_COUNT} Guide slugs")

    for en_guide, zh_guide in zip(en, zh, strict=True):
        slug = en_guide["slug"]
        concept_id = en_guide["conceptId"]
        require(concept_id in concepts, f"Guide points to unknown canonical Concept: {slug} -> {concept_id}")
        concept = concepts[concept_id]
        if concept.get("versionSensitive") is True:
            require(bool(concept.get("sourceRefs")), f"Version-sensitive Guide Concept must retain canonical sourceRefs: {concept_id}")
        require(en_guide.get("access") == "OPEN" and zh_guide.get("access") == "OPEN", f"Core Guide must remain OPEN: {slug}")
        require([item["id"] for item in en_guide.get("sections", [])] == ["mechanism", "example"], f"English Guide section contract drifted: {slug}")
        require([item["id"] for item in zh_guide.get("sections", [])] == ["mechanism", "example"], f"Chinese Guide section contract drifted: {slug}")
        require(en_guide.get("practice", {}).get("href") == zh_guide.get("practice", {}).get("href"), f"Guide practice target parity drifted: {slug}")
        practice_route = en_guide["practice"]["href"].lstrip("/")
        require(practice_route in en_routes, f"Guide practice target is not a public route: {slug} -> {practice_route}")
        for locale, guide in (("en", en_guide), ("zh-CN", zh_guide)):
            require("relatedConceptIds" not in guide and "relatedConcepts" not in guide, f"Guide must not author a second relation graph: {locale}/{slug}")
            require(len(guide.get("failureModes", [])) >= 3, f"Guide needs >=3 failure modes: {locale}/{slug}")
            require(len(guide.get("heuristics", [])) >= 3, f"Guide needs >=3 engineering heuristics: {locale}/{slug}")
            require(len(guide.get("takeaways", [])) >= 3, f"Guide needs >=3 takeaways: {locale}/{slug}")
            minimum_copy(guide, locale)

    require(manifest["principles"]["billingActivation"] is False, "Core Guides must not activate Billing")
    require(manifest["principles"]["freeChoiceActivation"] is False, "Core Guides must not activate free-choice claiming")

    subprocess.run([sys.executable, str(ROOT / "scripts" / "guide_coverage.py"), "--check"], cwd=ROOT, check=True)
    subprocess.run([sys.executable, str(ROOT / "scripts" / "practice_density.py"), "--check"], cwd=ROOT, check=True)
    subprocess.run([sys.executable, str(ROOT / "scripts" / "core100_ranking.py"), "--check"], cwd=ROOT, check=True)

    print(
        "PASS Core Guide v1 publication: 80 canonical Concepts now have substantial OPEN Guides in exact EN/zh-CN parity; "
        "version-sensitive Concepts retain canonical sourceRefs, coverage-plan, Practice-density and Core-100 ranking invariants pass, "
        "the Guide Directory and all Guide detail routes/practice targets are public, relations remain Knowledge-Graph-derived, and monetization gates stay disabled."
    )


if __name__ == "__main__":
    main()
