#!/usr/bin/env python3
"""Audit Practice density after the Core-80 Guide expansion.

This deliberately separates three questions that are easy to conflate:

1. Link coverage: does every published Guide point at a real public Practice?
2. Production concept coverage: is the Guide Concept explicitly named by at
   least one current production Experience?
3. Same-Path concept coverage: within a Course, is a Guide-backed Concept
   explicitly exercised by a production Experience assigned to that Path?

A Guide link is useful navigation, but it is not evidence that the Practice
actually exercises that exact Concept. The stricter metrics keep future
Practice expansion evidence-based.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
GUIDES = CONTENT / "guides"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
PLAN_PATH = GUIDES / "coverage-plan-v1.0.json"
PRODUCTION_PATH = CONTENT / "ai-content-production-v1.0.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_guides() -> list[dict]:
    guides: list[dict] = []
    for path in sorted(GUIDES.glob("core-*.en.json")):
        payload = load(path)
        guides.extend(payload.get("guides", []))
    return guides


def load_paths() -> list[dict]:
    paths: list[dict] = []
    for path in sorted(INVENTORY.glob("paths-*.json")):
        payload = load(path)
        for item in payload.get("paths", []):
            concept_ids = {
                concept_id
                for milestone in item.get("milestones", [])
                for concept_id in milestone.get("conceptIds", [])
            }
            paths.append({"id": item["id"], "title": item["en"], "conceptIds": concept_ids})
    return paths


def practice_route(href: str) -> str:
    return href.strip("/") + "/"


def target_id(href: str) -> str:
    parts = [part for part in href.split("/") if part]
    return parts[-1] if parts else ""


def pct(numerator: int, denominator: int) -> str:
    return f"{(numerator / denominator * 100) if denominator else 0:.1f}%"


def build_audit() -> dict:
    guides = load_guides()
    paths = load_paths()
    production = load(PRODUCTION_PATH)
    plan = load(PLAN_PATH)
    public_routes = set(load(CONTENT / "en.json")["availableRoutes"])

    guide_concepts = {guide["conceptId"] for guide in guides}
    experiences = [item for item in production["experiences"] if item.get("status") == "EXISTING"]
    experience_by_id = {item["id"]: item for item in experiences}

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

    production_concepts = {
        concept_id
        for experience in experiences
        for concept_id in experience.get("conceptIds", [])
    }
    guided_concepts_with_production_practice = guide_concepts & production_concepts

    per_path = []
    guided_memberships = 0
    same_path_explicit_memberships = 0
    production_path_memberships = 0
    for learning_path in paths:
        guided = learning_path["conceptIds"] & guide_concepts
        path_experiences = [item for item in experiences if learning_path["id"] in item.get("pathIds", [])]
        production_path_memberships += len(path_experiences)
        explicit_concepts = {
            concept_id
            for experience in path_experiences
            for concept_id in experience.get("conceptIds", [])
        }
        explicitly_practiced = guided & explicit_concepts
        guided_memberships += len(guided)
        same_path_explicit_memberships += len(explicitly_practiced)
        per_path.append(
            {
                "id": learning_path["id"],
                "title": learning_path["title"],
                "guidedConcepts": len(guided),
                "productionPractices": len(path_experiences),
                "explicitlyPracticedGuidedConcepts": len(explicitly_practiced),
                "explicitPracticeRatio": len(explicitly_practiced) / len(guided) if guided else 0,
                "practiceIds": [item["id"] for item in path_experiences],
                "explicitPracticeGaps": sorted(guided - explicitly_practiced),
            }
        )

    core80 = set(plan["core80Additions"])
    core80_memberships = 0
    core80_same_path_memberships = 0
    for learning_path in paths:
        new_guided = learning_path["conceptIds"] & core80
        path_experiences = [item for item in experiences if learning_path["id"] in item.get("pathIds", [])]
        explicit_concepts = {
            concept_id
            for experience in path_experiences
            for concept_id in experience.get("conceptIds", [])
        }
        core80_memberships += len(new_guided)
        core80_same_path_memberships += len(new_guided & explicit_concepts)

    type_counts = Counter(item["nodeType"] for item in experiences)
    production_target_counts = {
        item_id: target_counts[item_id]
        for item_id in sorted(target_counts)
        if item_id in experience_by_id
    }
    specialist_or_legacy_targets = {
        item_id: target_counts[item_id]
        for item_id in sorted(target_counts)
        if item_id not in experience_by_id
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
        "productionExperienceCount": len(experiences),
        "productionExperienceTypeCounts": dict(sorted(type_counts.items())),
        "productionPathMemberships": production_path_memberships,
        "productionPathReach": sum(1 for row in per_path if row["productionPractices"] > 0),
        "guideConceptsExplicitlyCoveredByProductionPractice": len(guided_concepts_with_production_practice),
        "guidedPathConceptMemberships": guided_memberships,
        "samePathExplicitPracticeMemberships": same_path_explicit_memberships,
        "samePathExplicitPracticeCoverage": same_path_explicit_memberships / guided_memberships,
        "core80PathConceptMemberships": core80_memberships,
        "core80SamePathExplicitPracticeMemberships": core80_same_path_memberships,
        "core80SamePathExplicitPracticeCoverage": core80_same_path_memberships / core80_memberships,
        "perPath": sorted(per_path, key=lambda row: (row["explicitPracticeRatio"], -row["guidedConcepts"], row["title"])),
        "monetization": {
            "billingActivation": production["principles"]["billingActivation"],
            "freeChoiceActivation": production["principles"]["freeChoiceActivation"],
        },
    }


def check(audit: dict) -> list[str]:
    errors: list[str] = []
    expected_types = {"BUILD": 6, "INCIDENT": 3, "LAB": 3, "MISSION": 4, "PLAYGROUND": 1}
    invariants = [
        (audit["publishedGuideCount"] == 80, f"Expected 80 published Guides, got {audit['publishedGuideCount']}"),
        (audit["guidesWithPracticeLink"] == 80, f"Expected 80 Guides with Practice links, got {audit['guidesWithPracticeLink']}"),
        (not audit["invalidGuidePracticeLinks"], f"Guide Practice links are not public: {audit['invalidGuidePracticeLinks']}"),
        (audit["productionExperienceCount"] == 17, f"Expected 17 current production Experiences, got {audit['productionExperienceCount']}"),
        (audit["productionExperienceTypeCounts"] == expected_types, f"Production Experience type distribution drifted: {audit['productionExperienceTypeCounts']}"),
        (audit["productionPathMemberships"] == 19, f"Expected 19 production Path-Practice memberships, got {audit['productionPathMemberships']}"),
        (audit["productionPathReach"] == 15, f"Expected Practice reach across all 15 Paths, got {audit['productionPathReach']}"),
        (audit["guideConceptsExplicitlyCoveredByProductionPractice"] == 40, f"Expected 40/80 Guide Concepts explicitly represented by production Practice, got {audit['guideConceptsExplicitlyCoveredByProductionPractice']}"),
        (audit["guidedPathConceptMemberships"] == 143, f"Expected 143 guided Path-Concept memberships, got {audit['guidedPathConceptMemberships']}"),
        (audit["samePathExplicitPracticeMemberships"] == 52, f"Expected 52/143 same-Path explicit Practice memberships, got {audit['samePathExplicitPracticeMemberships']}"),
        (audit["core80PathConceptMemberships"] == 21, f"Expected 21 Core-80 Path-Concept memberships, got {audit['core80PathConceptMemberships']}"),
        (audit["core80SamePathExplicitPracticeMemberships"] == 9, f"Expected 9/21 Core-80 same-Path explicit Practice memberships, got {audit['core80SamePathExplicitPracticeMemberships']}"),
        (audit["monetization"]["billingActivation"] is False, "Practice audit must not activate Billing"),
        (audit["monetization"]["freeChoiceActivation"] is False, "Practice audit must not activate free-choice claiming"),
    ]
    for ok, message in invariants:
        if not ok:
            errors.append(message)
    return errors


def print_report(audit: dict) -> None:
    print("Practice Density Audit — Core-80")
    print(
        f"Guide links: {audit['guidesWithPracticeLink']}/{audit['publishedGuideCount']} | "
        f"unique targets {audit['uniqueGuidePracticeTargets']} | "
        f"production Experiences {audit['productionExperienceCount']} | "
        f"Path reach {audit['productionPathReach']}/15"
    )
    print(
        f"Explicit production Practice coverage: "
        f"{audit['guideConceptsExplicitlyCoveredByProductionPractice']}/80 Guide Concepts | "
        f"same-Path {audit['samePathExplicitPracticeMemberships']}/{audit['guidedPathConceptMemberships']} "
        f"({pct(audit['samePathExplicitPracticeMemberships'], audit['guidedPathConceptMemberships'])}) | "
        f"Core-80 same-Path {audit['core80SamePathExplicitPracticeMemberships']}/{audit['core80PathConceptMemberships']} "
        f"({pct(audit['core80SamePathExplicitPracticeMemberships'], audit['core80PathConceptMemberships'])})"
    )
    print(f"Production types: {audit['productionExperienceTypeCounts']}")
    print(f"Guide target families: {audit['guidePracticeTargetFamilies']}")
    print(f"Guide target reuse: {audit['guidePracticeTargetReuse']}")
    print()
    print("| Path | Guided Concepts | Production Practice | Explicitly Practiced | Coverage |")
    print("| --- | ---: | ---: | ---: | ---: |")
    for row in audit["perPath"]:
        print(
            f"| {row['title']} | {row['guidedConcepts']} | {row['productionPractices']} | "
            f"{row['explicitlyPracticedGuidedConcepts']} | {pct(row['explicitlyPracticedGuidedConcepts'], row['guidedConcepts'])} |"
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    parser.add_argument("--check", action="store_true", help="Fail when the frozen Core-80 audit baseline drifts")
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
