#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
GUIDES = CONTENT / "guides"
POLICY_FILE = CONTENT / "ai-knowledge-concise-v1.0.json"
TREATMENT_FILE = GUIDES / "intentional-treatment-v1.0.json"
LOCALE_FILES = {
    "en": CONTENT / "ai-knowledge-graph-v1.0.en.json",
    "zh-CN": CONTENT / "ai-knowledge-graph-v1.0.zh-CN.json",
}
CANONICAL_COUNT = 145
GUIDE_COUNT = 120
RESIDUAL_COUNT = 25
FIELDS = ("summary", "mentalModel", "whyItMatters")


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
    paths = sorted(GUIDES.glob(f"core-*.{locale}.json"))
    for path in paths:
        bundle = load(path)
        concepts.extend(item["conceptId"] for item in bundle.get("guides", []))
    return concepts


def main():
    inventory = load_inventory()
    policy = load(POLICY_FILE)
    treatment = load(TREATMENT_FILE)

    require(len(inventory) == CANONICAL_COUNT, f"canonical inventory must contain exactly {CANONICAL_COUNT} Concepts")
    require(policy.get("version") == "1.0.0", "concise policy version drifted")
    require(policy.get("expectedConceptCount") == CANONICAL_COUNT, "concise policy expectedConceptCount drifted")
    require(policy.get("policy", {}).get("guideIsOptionalEnrichment") is True, "full Guide must remain optional enrichment")
    require(policy.get("policy", {}).get("relatedConceptsRemainGraphDerived") is True, "related Concepts must remain graph-derived")
    require(policy.get("policy", {}).get("residualConceptsRequireAuthoredCopy") is True, "residual Concepts must require authored concise copy")

    canonical_ids = set(inventory)
    kinds = {concept["kind"] for concept in inventory.values()}
    require(set(policy.get("genericByKind", {})) == kinds, "concise generic kind templates must exactly cover canonical Concept kinds")

    treatments = treatment.get("treatments", [])
    treatment_ids = {item["conceptId"] for item in treatments}
    require(len(treatments) == RESIDUAL_COUNT and len(treatment_ids) == RESIDUAL_COUNT, "#199 must provide exactly 25 unique residual treatments")
    require(all(item.get("currentSurface") == "CONCISE_CANONICAL" for item in treatments), "every residual Concept must currently resolve to concise canonical copy")
    require(set(policy.get("overrides", {})) == treatment_ids, "all and only the 25 post-Core-120 residual Concepts must have authored concise overrides")

    en_guides = load_guide_concepts("en")
    zh_guides = load_guide_concepts("zh-CN")
    require(len(en_guides) == GUIDE_COUNT and len(set(en_guides)) == GUIDE_COUNT, "EN Guide Concept bindings must remain exactly 120")
    require(en_guides == zh_guides, "EN/zh-CN Guide Concept bindings must remain in exact parity")
    require(canonical_ids - set(en_guides) == treatment_ids, "120 Guide Concepts + 25 treatments must exactly partition the 145 canonical Concepts")

    minimums = {
        "en": {"summary": 55, "mentalModel": 65, "whyItMatters": 65},
        "zh-CN": {"summary": 20, "mentalModel": 24, "whyItMatters": 24},
    }
    for locale, path in LOCALE_FILES.items():
        presentation = load(path)
        require(presentation.get("locale") == locale, f"presentation locale mismatch: {locale}")
        copies = presentation.get("concepts", {})
        require(set(copies) == canonical_ids, f"{locale} concise presentation must cover exactly 145 canonical Concept IDs")
        for concept_id, concept in inventory.items():
            copy = copies[concept_id]
            expected_title = concept["en"] if locale == "en" else concept["zh"]
            require(copy.get("title") == expected_title, f"localized Concept title drifted: {locale}/{concept_id}")
            require(set(copy) == {"title", *FIELDS}, f"Concept presentation shape drifted: {locale}/{concept_id}")
            for field in FIELDS:
                value = copy.get(field, "")
                require(isinstance(value, str) and len(value.strip()) >= minimums[locale][field], f"concise copy too thin: {locale}/{concept_id}/{field}")
                require("{title}" not in value and "TODO" not in value and "TBD" not in value, f"unresolved concise-copy placeholder: {locale}/{concept_id}/{field}")

    for concept_id in treatment_ids:
        override = policy["overrides"][concept_id]
        require(set(override) == {"en", "zh-CN"}, f"residual Concept must have exact EN/zh-CN authored parity: {concept_id}")
        for locale in ("en", "zh-CN"):
            require(set(override[locale]) == set(FIELDS), f"residual Concept concise fields drifted: {locale}/{concept_id}")

    print(
        "PASS concise Concept surface: 145/145 canonical Concepts materialize summary + mental model + why-it-matters in EN/zh-CN; "
        "120 full Guides remain optional enrichment, all 25 post-Core-120 residual Concepts have authored bilingual copy, and related Concepts remain graph-derived."
    )


if __name__ == "__main__":
    main()
