#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
GUIDES = CONTENT / "guides"
LEGACY_POLICY_FILE = CONTENT / "ai-knowledge-concise-v1.0.json"
AUTHORED_MANIFEST_FILE = CONTENT / "ai-knowledge-concise-authored-v1.0.json"
TREATMENT_FILE = GUIDES / "intentional-treatment-v1.0.json"
COVERAGE_FILE = GUIDES / "coverage-plan-v1.0.json"
LOCALE_FILES = {
    "en": CONTENT / "ai-knowledge-graph-v1.0.en.json",
    "zh-CN": CONTENT / "ai-knowledge-graph-v1.0.zh-CN.json",
}
CANONICAL_COUNT = 145
GUIDE_COUNT = 120
RESIDUAL_COUNT = 25
FIELDS = ("summary", "mentalModel", "whyItMatters")
WAVE_PLAN_KEYS = {
    "core-20": "baselineConceptIds",
    "core-40": "core40Additions",
    "core-60": "core60Additions",
    "core-80": "core80Additions",
    "core-100": "core100Additions",
    "core-120": "core120Additions",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def load_inventory():
    concepts = {}
    for path in sorted(INVENTORY.glob("*.json")):
        data = load(path)
        require(data.get("version") == "1.0.0", f"inventory version drifted: {path.name}")
        for concept in data.get("concepts", []):
            require(concept["id"] not in concepts, f"duplicate canonical Concept: {concept['id']}")
            concepts[concept["id"]] = concept
    return concepts


def load_guide_concepts(locale: str):
    concepts = []
    for path in sorted(GUIDES.glob(f"core-*.{locale}.json")):
        bundle = load(path)
        concepts.extend(item["conceptId"] for item in bundle.get("guides", []))
    return concepts


def validate_authored_copy(concept_id: str, by_locale: dict, minimums: dict):
    require(set(by_locale) == set(LOCALE_FILES), f"authored concise locale parity drifted: {concept_id}")
    for locale in LOCALE_FILES:
        copy = by_locale[locale]
        require(set(copy) == set(FIELDS), f"authored concise fields drifted: {locale}/{concept_id}")
        for field in FIELDS:
            value = copy[field]
            require(isinstance(value, str) and len(value.strip()) >= minimums[locale][field], f"authored concise copy too thin: {locale}/{concept_id}/{field}")
            require("{title}" not in value and "TODO" not in value and "TBD" not in value, f"authored concise placeholder forbidden: {locale}/{concept_id}/{field}")


def main():
    inventory = load_inventory()
    canonical_ids = set(inventory)
    require(len(inventory) == CANONICAL_COUNT, f"canonical inventory must contain exactly {CANONICAL_COUNT} Concepts")

    legacy_policy = load(LEGACY_POLICY_FILE)
    manifest = load(AUTHORED_MANIFEST_FILE)
    treatment = load(TREATMENT_FILE)
    coverage = load(COVERAGE_FILE)

    require(manifest.get("version") == "1.0.0", "authored concise manifest version drifted")
    require(manifest.get("expectedConceptCount") == CANONICAL_COUNT, "authored concise expectedConceptCount drifted")
    require(manifest.get("publishedGuideConceptCount") == GUIDE_COUNT, "authored concise publishedGuideConceptCount drifted")
    require(manifest.get("residualConceptCount") == RESIDUAL_COUNT, "authored concise residualConceptCount drifted")
    policy = manifest.get("policy", {})
    require(policy.get("allConceptsRequireAuthoredCopy") is True, "every canonical Concept must require authored concise copy")
    require(policy.get("publishedGenericFallbackAllowed") is False, "published generic fallback must remain disabled")
    require(policy.get("guideIsOptionalEnrichment") is True, "full Guide must remain optional enrichment")
    require(policy.get("relatedConceptsRemainGraphDerived") is True, "related Concepts must remain graph-derived")
    require(manifest.get("residualSource") == "ai-knowledge-concise-v1.0.json#overrides", "authored concise residual source drifted")

    expected_fragments = [f"ai-knowledge-concise-v1.0/{wave}.json" for wave in WAVE_PLAN_KEYS]
    require(manifest.get("guideBackedFragments") == expected_fragments, "authored concise Guide fragment order/set drifted")

    minimums = {
        "en": {"summary": 55, "mentalModel": 65, "whyItMatters": 65},
        "zh-CN": {"summary": 20, "mentalModel": 24, "whyItMatters": 24},
    }

    core_authored = {}
    for relative in manifest["guideBackedFragments"]:
        fragment = load(CONTENT / relative)
        wave = fragment.get("wave")
        require(fragment.get("version") == "1.0.0", f"authored concise fragment version drifted: {relative}")
        require(wave in WAVE_PLAN_KEYS, f"unknown authored concise wave: {wave}")
        entries = fragment.get("concepts", {})
        require(len(entries) == 20, f"authored concise wave must contain exactly 20 Concepts: {wave}")
        expected_ids = set(coverage[WAVE_PLAN_KEYS[wave]])
        require(set(entries) == expected_ids, f"authored concise wave must exactly match frozen Guide wave: {wave}")
        for concept_id, by_locale in entries.items():
            require(concept_id not in core_authored, f"duplicate Guide-backed authored concise Concept: {concept_id}")
            validate_authored_copy(concept_id, by_locale, minimums)
            core_authored[concept_id] = by_locale

    require(len(core_authored) == GUIDE_COUNT, f"Guide-backed authored concise copy must contain exactly {GUIDE_COUNT} Concepts")

    treatments = treatment.get("treatments", [])
    treatment_ids = {item["conceptId"] for item in treatments}
    require(len(treatments) == RESIDUAL_COUNT and len(treatment_ids) == RESIDUAL_COUNT, "#199 must provide exactly 25 unique residual treatments")
    require(all(item.get("currentSurface") == "CONCISE_CANONICAL" for item in treatments), "every residual Concept must currently resolve to concise canonical copy")

    residual = legacy_policy.get("overrides", {})
    require(set(residual) == treatment_ids, "legacy residual authored overrides must exactly match the #199 residual set")
    for concept_id, by_locale in residual.items():
        validate_authored_copy(concept_id, by_locale, minimums)

    require(set(core_authored).isdisjoint(residual), "Guide-backed and residual authored concise sets must not overlap")
    authored = {**core_authored, **residual}
    require(set(authored) == canonical_ids and len(authored) == CANONICAL_COUNT, "145 canonical Concepts must have exactly one authored bilingual concise surface")

    en_guides = load_guide_concepts("en")
    zh_guides = load_guide_concepts("zh-CN")
    require(len(en_guides) == GUIDE_COUNT and len(set(en_guides)) == GUIDE_COUNT, "EN Guide Concept bindings must remain exactly 120")
    require(en_guides == zh_guides, "EN/zh-CN Guide Concept bindings must remain in exact parity")
    require(set(core_authored) == set(en_guides), "120 Guide-backed authored concise Concepts must exactly equal published Guide Concept bindings")
    require(canonical_ids - set(en_guides) == treatment_ids, "120 Guide Concepts + 25 residual treatments must exactly partition the 145 canonical Concepts")

    # Defense-only generic templates may remain in the legacy file for backward tooling,
    # but no published Concept is allowed to resolve from them.
    generic_by_kind = legacy_policy.get("genericByKind", {})
    for concept_id, concept in inventory.items():
        for locale in LOCALE_FILES:
            authored_copy = authored[concept_id][locale]
            generic = generic_by_kind.get(concept["kind"], {}).get(locale)
            if generic:
                rendered_generic = {field: generic[field].replace("{title}", concept["en"] if locale == "en" else concept["zh"]) for field in FIELDS}
                require(authored_copy != rendered_generic, f"published concise copy must not equal generic fallback: {locale}/{concept_id}")

    for locale, path in LOCALE_FILES.items():
        presentation = load(path)
        require(presentation.get("locale") == locale, f"presentation locale mismatch: {locale}")
        copies = presentation.get("concepts", {})
        require(set(copies) == canonical_ids, f"{locale} presentation must cover exactly 145 canonical Concept IDs")
        summaries = []
        for concept_id, concept in inventory.items():
            copy = copies[concept_id]
            expected_title = concept["en"] if locale == "en" else concept["zh"]
            require(copy.get("title") == expected_title, f"localized Concept title drifted: {locale}/{concept_id}")
            require(set(copy) == {"title", "summary"}, f"legacy Concept presentation shape drifted: {locale}/{concept_id}")
            require(copy.get("summary") == authored[concept_id][locale]["summary"], f"materialized Concept summary drifted from authored concise surface: {locale}/{concept_id}")
            summaries.append(copy["summary"])
        require(len(set(summaries)) == CANONICAL_COUNT, f"{locale} authored concise summaries must be concept-specific, not duplicated templates")

    print(
        "PASS authored concise Concept surface: 145/145 canonical Concepts have concept-specific summary + mental model + why-it-matters in exact EN/zh-CN parity; "
        "120 Guide-backed authored fragments exactly match frozen Guide waves, 25 residual authored copies exactly match #199, "
        "full Guides remain optional enrichment, graph relations remain canonical, and published generic fallback is disabled."
    )


if __name__ == "__main__":
    main()
