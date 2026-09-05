#!/usr/bin/env python3
"""Audit Practice density for Core-80 before and after evidence reconciliation.

The production manifest remains the canonical 17-Experience wave plan. A separate,
bounded reconciliation contract may augment those Experiences or register existing
public specialist/reference Practices as evidence sources when their runtime
interaction genuinely exercises canonical Concepts.

Navigation is never counted as learning evidence, and this audit does not change
local Seen / Read / Practiced semantics.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
GUIDES = CONTENT / "guides"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
PLAN_PATH = GUIDES / "coverage-plan-v1.0.json"
PRODUCTION_PATH = CONTENT / "ai-content-production-v1.0.json"
RECONCILIATION_PATH = CONTENT / "practice-evidence-reconciliation-v1.0.json"
RUNTIME_PATH = ROOT / "web" / "runtime-experiences.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_guides() -> list[dict]:
    guides: list[dict] = []
    for path in sorted(GUIDES.glob("core-*.en.json")):
        payload = load(path)
        guides.extend(payload.get("guides", []))
    return guides


def load_inventory() -> tuple[set[str], list[dict]]:
    concept_ids: set[str] = set()
    paths: list[dict] = []
    for path in sorted(INVENTORY.glob("*.json")):
        payload = load(path)
        concept_ids.update(item["id"] for item in payload.get("concepts", []))
        for item in payload.get("paths", []):
            path_concepts = {
                concept_id
                for milestone in item.get("milestones", [])
                for concept_id in milestone.get("conceptIds", [])
            }
            paths.append({"id": item["id"], "title": item["en"], "conceptIds": path_concepts})
    return concept_ids, paths


def practice_route(href: str) -> str:
    return href.strip("/") + "/"


def target_id(href: str) -> str:
    parts = [part for part in href.split("/") if part]
    return parts[-1] if parts else ""


def pct(numerator: int, denominator: int) -> str:
    return f"{(numerator / denominator * 100) if denominator else 0:.1f}%"


def public_route_for_experience(experience_id: str, public_routes: set[str]) -> str | None:
    suffix = f"/{experience_id}/"
    matches = sorted(route for route in public_routes if f"/{route}".endswith(suffix))
    return matches[0] if matches else None


def validate_reconciliation(
    production_experiences: list[dict],
    reconciliation: dict,
    canonical_concepts: set[str],
    canonical_paths: set[str],
    runtime_ids: set[str],
    public_routes: set[str],
) -> list[str]:
    errors: list[str] = []
    production_by_id = {item["id"]: item for item in production_experiences}

    if reconciliation.get("version") != "1.0.0":
        errors.append("Practice evidence reconciliation version drifted")
    policy = reconciliation.get("policy", {})
    if policy.get("productionPlanRemainsCanonicalForWaves") is not True:
        errors.append("Reconciliation must preserve the production wave plan")
    if policy.get("runtimeSemanticsChanged") is not False:
        errors.append("Reconciliation must not claim runtime semantic changes")
    if policy.get("evidenceMustBeEarnedByInteraction") is not True:
        errors.append("Reconciliation must require interaction-earned evidence")
    if policy.get("billingActivation") is not False or policy.get("freeChoiceActivation") is not False:
        errors.append("Reconciliation must not activate monetization gates")

    seen_ids: set[str] = set()
    for entry in reconciliation.get("augmentations", []):
        experience_id = entry.get("experienceId")
        if experience_id in seen_ids:
            errors.append(f"Duplicate reconciliation entry: {experience_id}")
        seen_ids.add(experience_id)
        if experience_id not in production_by_id:
            errors.append(f"Augmentation must target a production Experience: {experience_id}")
        if experience_id not in runtime_ids:
            errors.append(f"Augmentation has no runtime registration: {experience_id}")
        if not public_route_for_experience(experience_id, public_routes):
            errors.append(f"Augmentation has no public route: {experience_id}")
        add_concepts = entry.get("addConceptIds", [])
        if not add_concepts:
            errors.append(f"Augmentation needs Concept evidence: {experience_id}")
        unknown = sorted(set(add_concepts) - canonical_concepts)
        if unknown:
            errors.append(f"Augmentation uses unknown Concepts on {experience_id}: {unknown}")
        for source in entry.get("evidenceSources", []):
            if not (ROOT / source).is_file():
                errors.append(f"Missing reconciliation evidence source: {source}")
        if not entry.get("rationale"):
            errors.append(f"Augmentation needs a rationale: {experience_id}")

    for entry in reconciliation.get("referencePractices", []):
        experience_id = entry.get("experienceId")
        if experience_id in seen_ids:
            errors.append(f"Duplicate reconciliation entry: {experience_id}")
        seen_ids.add(experience_id)
        if experience_id in production_by_id:
            errors.append(f"Reference Practice must remain outside production waves: {experience_id}")
        if experience_id not in runtime_ids:
            errors.append(f"Reference Practice has no runtime registration: {experience_id}")
        if not public_route_for_experience(experience_id, public_routes):
            errors.append(f"Reference Practice has no public route: {experience_id}")
        path_ids = set(entry.get("pathIds", []))
        concept_ids = set(entry.get("conceptIds", []))
        if not path_ids:
            errors.append(f"Reference Practice needs a canonical Path: {experience_id}")
        if not concept_ids:
            errors.append(f"Reference Practice needs Concept evidence: {experience_id}")
        unknown_paths = sorted(path_ids - canonical_paths)
        unknown_concepts = sorted(concept_ids - canonical_concepts)
        if unknown_paths:
            errors.append(f"Reference Practice uses unknown Paths on {experience_id}: {unknown_paths}")
        if unknown_concepts:
            errors.append(f"Reference Practice uses unknown Concepts on {experience_id}: {unknown_concepts}")
        for source in entry.get("evidenceSources", []):
            if not (ROOT / source).is_file():
                errors.append(f"Missing reconciliation evidence source: {source}")
        if not entry.get("rationale"):
            errors.append(f"Reference Practice needs a rationale: {experience_id}")

    return errors


def compose_evidence(production_experiences: list[dict], reconciliation: dict) -> list[dict]:
    evidence = deepcopy(production_experiences)
    by_id = {item["id"]: item for item in evidence}
    for entry in reconciliation.get("augmentations", []):
        target = by_id[entry["experienceId"]]
        target["conceptIds"] = list(dict.fromkeys([*target.get("conceptIds", []), *entry["addConceptIds"]]))
        target["evidenceMode"] = "PRODUCTION_AUGMENTED"
    for entry in reconciliation.get("referencePractices", []):
        evidence.append(
            {
                "id": entry["experienceId"],
                "nodeType": entry["nodeType"],
                "status": "EXISTING_REFERENCE",
                "pathIds": entry["pathIds"],
                "conceptIds": entry["conceptIds"],
                "evidenceMode": "REFERENCE_RECONCILED",
            }
        )
    return evidence


def density(experiences: list[dict], guide_concepts: set[str], paths: list[dict], core80: set[str]) -> dict:
    explicit_global = {
        concept_id
        for experience in experiences
        for concept_id in experience.get("conceptIds", [])
    }
    per_path = []
    guided_memberships = 0
    explicit_memberships = 0
    path_memberships = 0
    core80_memberships = 0
    core80_explicit = 0
    for learning_path in paths:
        guided = learning_path["conceptIds"] & guide_concepts
        path_experiences = [item for item in experiences if learning_path["id"] in item.get("pathIds", [])]
        explicit = {
            concept_id
            for experience in path_experiences
            for concept_id in experience.get("conceptIds", [])
        }
        practiced = guided & explicit
        new_guided = learning_path["conceptIds"] & core80
        guided_memberships += len(guided)
        explicit_memberships += len(practiced)
        path_memberships += len(path_experiences)
        core80_memberships += len(new_guided)
        core80_explicit += len(new_guided & explicit)
        per_path.append(
            {
                "id": learning_path["id"],
                "title": learning_path["title"],
                "guidedConcepts": len(guided),
                "practiceEvidenceSources": len(path_experiences),
                "explicitlyPracticedGuidedConcepts": len(practiced),
                "explicitPracticeRatio": len(practiced) / len(guided) if guided else 0,
                "practiceIds": [item["id"] for item in path_experiences],
                "explicitPracticeGaps": sorted(guided - practiced),
            }
        )
    return {
        "experienceCount": len(experiences),
        "pathMemberships": path_memberships,
        "pathReach": sum(1 for row in per_path if row["practiceEvidenceSources"] > 0),
        "guideConceptsExplicitlyCovered": len(guide_concepts & explicit_global),
        "guidedPathConceptMemberships": guided_memberships,
        "samePathExplicitPracticeMemberships": explicit_memberships,
        "samePathExplicitPracticeCoverage": explicit_memberships / guided_memberships,
        "core80PathConceptMemberships": core80_memberships,
        "core80SamePathExplicitPracticeMemberships": core80_explicit,
        "core80SamePathExplicitPracticeCoverage": core80_explicit / core80_memberships,
        "perPath": sorted(per_path, key=lambda row: (row["explicitPracticeRatio"], -row["guidedConcepts"], row["title"])),
    }


def build_audit() -> dict:
    guides = load_guides()
    canonical_concepts, paths = load_inventory()
    canonical_paths = {item["id"] for item in paths}
    production = load(PRODUCTION_PATH)
    reconciliation = load(RECONCILIATION_PATH)
    plan = load(PLAN_PATH)
    public_routes = set(load(CONTENT / "en.json")["availableRoutes"])
    runtime_ids = set(load(RUNTIME_PATH)["experiences"])

    guide_concepts = {guide["conceptId"] for guide in guides}
    production_experiences = [item for item in production["experiences"] if item.get("status") == "EXISTING"]
    validation_errors = validate_reconciliation(
        production_experiences,
        reconciliation,
        canonical_concepts,
        canonical_paths,
        runtime_ids,
        public_routes,
    )
    evidence_experiences = compose_evidence(production_experiences, reconciliation)

    linked_guides = [guide for guide in guides if guide.get("practice")]
    invalid_links = [
        {"slug": guide["slug"], "href": guide["practice"]["href"]}
        for guide in linked_guides
        if practice_route(guide["practice"]["href"]) not in public_routes
    ]
    target_counts = Counter(target_id(guide["practice"]["href"]) for guide in linked_guides)
    target_route_family = Counter(
        next((part for part in guide["practice"]["href"].split("/") if part), "unknown")
        for guide in linked_guides
    )
    core80 = set(plan["core80Additions"])
    baseline = density(production_experiences, guide_concepts, paths, core80)
    reconciled = density(evidence_experiences, guide_concepts, paths, core80)

    production_by_id = {item["id"]: item for item in production_experiences}
    production_target_counts = {
        item_id: target_counts[item_id]
        for item_id in sorted(target_counts)
        if item_id in production_by_id
    }
    specialist_or_legacy_targets = {
        item_id: target_counts[item_id]
        for item_id in sorted(target_counts)
        if item_id not in production_by_id
    }

    return {
        "publishedGuideCount": len(guides),
        "guidesWithPracticeLink": len(linked_guides),
        "uniqueGuidePracticeTargets": len(target_counts),
        "invalidGuidePracticeLinks": invalid_links,
        "guidePracticeTargetFamilies": dict(sorted(target_route_family.items())),
        "guidePracticeTargetReuse": dict(target_counts.most_common()),
        "productionGuideTargetReuse": production_target_counts,
        "specialistOrLegacyGuideTargetReuse": specialist_or_legacy_targets,
        "productionExperienceTypeCounts": dict(sorted(Counter(item["nodeType"] for item in production_experiences).items())),
        "reconciliation": {
            "augmentationCount": len(reconciliation.get("augmentations", [])),
            "referencePracticeCount": len(reconciliation.get("referencePractices", [])),
            "validationErrors": validation_errors,
        },
        "baseline": baseline,
        "reconciled": reconciled,
        "monetization": {
            "billingActivation": production["principles"]["billingActivation"],
            "freeChoiceActivation": production["principles"]["freeChoiceActivation"],
        },
        "frozenBaseline": reconciliation["baseline"],
        "expectedPostReconciliation": reconciliation["expectedPostReconciliation"],
    }


def check(audit: dict) -> list[str]:
    errors: list[str] = list(audit["reconciliation"]["validationErrors"])
    expected_types = {"BUILD": 6, "INCIDENT": 3, "LAB": 3, "MISSION": 4, "PLAYGROUND": 1}
    frozen = audit["frozenBaseline"]
    post = audit["expectedPostReconciliation"]
    baseline = audit["baseline"]
    reconciled = audit["reconciled"]
    invariants = [
        (audit["publishedGuideCount"] == frozen["publishedGuides"], f"Expected {frozen['publishedGuides']} published Guides, got {audit['publishedGuideCount']}"),
        (audit["guidesWithPracticeLink"] == audit["publishedGuideCount"], "Every published Guide must retain a real Practice link"),
        (not audit["invalidGuidePracticeLinks"], f"Guide Practice links are not public: {audit['invalidGuidePracticeLinks']}"),
        (baseline["experienceCount"] == 17, f"Expected 17 current production Experiences, got {baseline['experienceCount']}"),
        (audit["productionExperienceTypeCounts"] == expected_types, f"Production Experience type distribution drifted: {audit['productionExperienceTypeCounts']}"),
        (baseline["pathMemberships"] == 19, f"Expected 19 production Path-Practice memberships, got {baseline['pathMemberships']}"),
        (baseline["pathReach"] == 15, f"Expected production Practice reach across all 15 Paths, got {baseline['pathReach']}"),
        (baseline["guideConceptsExplicitlyCovered"] == frozen["guideConceptsExplicitlyCovered"], f"Frozen pre-reconciliation Guide Concept baseline drifted: {baseline['guideConceptsExplicitlyCovered']}"),
        (baseline["guidedPathConceptMemberships"] == frozen["guidedPathConceptMemberships"], f"Frozen guided Path-Concept baseline drifted: {baseline['guidedPathConceptMemberships']}"),
        (baseline["samePathExplicitPracticeMemberships"] == frozen["samePathExplicitPracticeMemberships"], f"Frozen same-Path Practice baseline drifted: {baseline['samePathExplicitPracticeMemberships']}"),
        (baseline["core80PathConceptMemberships"] == frozen["core80PathConceptMemberships"], f"Frozen Core-80 Path-Concept baseline drifted: {baseline['core80PathConceptMemberships']}"),
        (baseline["core80SamePathExplicitPracticeMemberships"] == frozen["core80SamePathExplicitPracticeMemberships"], f"Frozen Core-80 Practice baseline drifted: {baseline['core80SamePathExplicitPracticeMemberships']}"),
        (reconciled["experienceCount"] == post["evidencePracticeCount"], f"Expected {post['evidencePracticeCount']} reconciled evidence Practices, got {reconciled['experienceCount']}"),
        (reconciled["pathMemberships"] == post["evidencePathMemberships"], f"Expected {post['evidencePathMemberships']} reconciled Path-Practice memberships, got {reconciled['pathMemberships']}"),
        (reconciled["guideConceptsExplicitlyCovered"] == post["guideConceptsExplicitlyCovered"], f"Expected {post['guideConceptsExplicitlyCovered']}/80 reconciled Guide Concepts, got {reconciled['guideConceptsExplicitlyCovered']}"),
        (reconciled["samePathExplicitPracticeMemberships"] == post["samePathExplicitPracticeMemberships"], f"Expected {post['samePathExplicitPracticeMemberships']}/143 reconciled same-Path memberships, got {reconciled['samePathExplicitPracticeMemberships']}"),
        (reconciled["core80SamePathExplicitPracticeMemberships"] == post["core80SamePathExplicitPracticeMemberships"], f"Expected {post['core80SamePathExplicitPracticeMemberships']}/21 reconciled Core-80 memberships, got {reconciled['core80SamePathExplicitPracticeMemberships']}"),
        (audit["monetization"]["billingActivation"] is False, "Practice audit must not activate Billing"),
        (audit["monetization"]["freeChoiceActivation"] is False, "Practice audit must not activate free-choice claiming"),
    ]
    for ok, message in invariants:
        if not ok:
            errors.append(message)
    return errors


def print_density(label: str, row: dict) -> None:
    print(
        f"{label}: {row['guideConceptsExplicitlyCovered']}/80 Guide Concepts | "
        f"same-Path {row['samePathExplicitPracticeMemberships']}/{row['guidedPathConceptMemberships']} "
        f"({pct(row['samePathExplicitPracticeMemberships'], row['guidedPathConceptMemberships'])}) | "
        f"Core-80 {row['core80SamePathExplicitPracticeMemberships']}/{row['core80PathConceptMemberships']} "
        f"({pct(row['core80SamePathExplicitPracticeMemberships'], row['core80PathConceptMemberships'])})"
    )


def print_report(audit: dict) -> None:
    print("Practice Density Audit — Core-80 reconciliation")
    print(
        f"Guide links: {audit['guidesWithPracticeLink']}/{audit['publishedGuideCount']} | "
        f"unique targets {audit['uniqueGuidePracticeTargets']} | "
        f"reconciliation {audit['reconciliation']['augmentationCount']} augmentations + "
        f"{audit['reconciliation']['referencePracticeCount']} reference Practices"
    )
    print_density("Before reconciliation", audit["baseline"])
    print_density("After reconciliation", audit["reconciled"])
    print(f"Production types remain: {audit['productionExperienceTypeCounts']}")
    print(f"Guide target families: {audit['guidePracticeTargetFamilies']}")
    print()
    print("| Path | Guided | Before | After | Reconciled coverage |")
    print("| --- | ---: | ---: | ---: | ---: |")
    before = {row["id"]: row for row in audit["baseline"]["perPath"]}
    for row in audit["reconciled"]["perPath"]:
        old = before[row["id"]]
        print(
            f"| {row['title']} | {row['guidedConcepts']} | {old['explicitlyPracticedGuidedConcepts']} | "
            f"{row['explicitlyPracticedGuidedConcepts']} | {pct(row['explicitlyPracticedGuidedConcepts'], row['guidedConcepts'])} |"
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    parser.add_argument("--check", action="store_true", help="Fail when frozen Core-80 reconciliation contracts drift")
    args = parser.parse_args()

    audit = build_audit()
    errors = check(audit) if args.check else []
    if args.json:
        print(json.dumps({**audit, "errors": errors}, ensure_ascii=False, indent=2))
    else:
        print_report(audit)
        for error in errors:
            print(f"ERROR: {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
