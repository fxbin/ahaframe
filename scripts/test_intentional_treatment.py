#!/usr/bin/env python3
from __future__ import annotations

import json
from collections import Counter, defaultdict
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
GUIDES = CONTENT / "guides"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
CONTRACT = GUIDES / "intentional-treatment-v1.0.json"
COVERAGE_PLAN = GUIDES / "coverage-plan-v1.0.json"
PRODUCTION = CONTENT / "ai-content-production-v1.0.json"
RECONCILIATION = CONTENT / "practice-evidence-reconciliation-v1.0.json"

EXPECTED_TREATMENTS = {
    "CONCISE_CANONICAL",
    "PRACTICE_OR_COURSE_FIRST",
    "SEMANTIC_OVERLAP_REVIEW",
    "FULL_GUIDE_ON_TRIGGER",
}
EXPECTED_CLASS_COUNTS = {
    "CONCISE_CANONICAL": 6,
    "PRACTICE_OR_COURSE_FIRST": 9,
    "SEMANTIC_OVERLAP_REVIEW": 8,
    "FULL_GUIDE_ON_TRIGGER": 2,
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def load_inventory():
    concepts: dict[str, dict] = {}
    paths: dict[str, dict] = {}
    concept_paths: dict[str, set[str]] = defaultdict(set)
    for path in sorted(INVENTORY.glob("*.json")):
        fragment = load(path)
        require(fragment.get("version") == "1.0.0", f"Inventory version drifted: {path.name}")
        for concept in fragment.get("concepts", []):
            concept_id = concept["id"]
            require(concept_id not in concepts, f"Duplicate canonical Concept: {concept_id}")
            concepts[concept_id] = concept
        for learning_path in fragment.get("paths", []):
            path_id = learning_path["id"]
            require(path_id not in paths, f"Duplicate canonical Path: {path_id}")
            paths[path_id] = learning_path
            for concept_id in {
                concept_id
                for milestone in learning_path.get("milestones", [])
                for concept_id in milestone.get("conceptIds", [])
            }:
                concept_paths[concept_id].add(path_id)
    return concepts, paths, concept_paths


def load_guide_concepts(locale: str) -> set[str]:
    concept_ids: set[str] = set()
    guide_count = 0
    for path in sorted(GUIDES.glob(f"core-*.{locale}.json")):
        payload = load(path)
        for guide in payload.get("guides", []):
            concept_id = guide["conceptId"]
            require(concept_id not in concept_ids, f"Duplicate {locale} Guide Concept binding: {concept_id}")
            concept_ids.add(concept_id)
            guide_count += 1
    require(guide_count == 120, f"Intentional treatment contract requires published Core-120, got {guide_count} {locale} Guides")
    return concept_ids


def compose_practice_evidence() -> list[dict]:
    production = load(PRODUCTION)
    reconciliation = load(RECONCILIATION)
    evidence = deepcopy([item for item in production["experiences"] if item.get("status") == "EXISTING"])
    by_id = {item["id"]: item for item in evidence}
    for entry in reconciliation.get("augmentations", []):
        target = by_id[entry["experienceId"]]
        target["conceptIds"] = list(dict.fromkeys([*target.get("conceptIds", []), *entry.get("addConceptIds", [])]))
    for entry in reconciliation.get("referencePractices", []):
        evidence.append(
            {
                "id": entry["experienceId"],
                "pathIds": entry["pathIds"],
                "conceptIds": entry["conceptIds"],
            }
        )
    return evidence


def main() -> None:
    contract = load(CONTRACT)
    plan = load(COVERAGE_PLAN)
    concepts, paths, concept_paths = load_inventory()
    en_guides = load_guide_concepts("en")
    zh_guides = load_guide_concepts("zh-CN")
    evidence = compose_practice_evidence()

    require(contract.get("version") == "1.0.0", "Intentional treatment contract version drifted")
    require(contract.get("status") == "FINAL", "Intentional treatment contract must remain FINAL")
    require(len(concepts) == 145, f"Expected 145 canonical Concepts, got {len(concepts)}")
    require(len(paths) == 15, f"Expected 15 canonical Paths, got {len(paths)}")
    require(en_guides == zh_guides, "EN/zh-CN published Guide Concept sets must remain identical")
    require(len(en_guides) == 120, f"Expected Core-120 Guide set, got {len(en_guides)}")

    residual = set(concepts) - en_guides
    require(len(residual) == 25, f"Core-120 residual must contain exactly 25 Concepts, got {len(residual)}")

    basis = contract.get("basis", {})
    require(basis.get("canonicalConceptCount") == 145, "Contract canonical Concept count drifted")
    require(basis.get("publishedGuideStage") == "core-120", "Contract must be based on Core-120")
    require(basis.get("publishedGuideCount") == 120, "Contract published Guide count drifted")
    require(basis.get("remainingConceptCount") == 25, "Contract remaining Concept count drifted")
    require(basis.get("conciseSurfaceFollowUpIssue") == 202, "Concise Concept surface must remain delegated to #202")

    policy = contract.get("policy", {})
    require(policy.get("automaticFullGuideExpansionStoppedAt") == "core-120", "Automatic full-Guide expansion must stop at Core-120")
    require(policy.get("core140OrCore145BatchAllowed") is False, "Core-140/Core-145 batch publication must remain disallowed")
    require(policy.get("preserveCanonicalConceptReachability") is True, "All canonical Concepts must remain intentionally reachable")
    require(policy.get("fullGuidePromotionRequiresNewEvidence") is True, "Post-Core-120 full Guides must require new evidence")
    require(set(policy.get("allowedTreatments", [])) == EXPECTED_TREATMENTS, "Allowed treatment classes drifted")

    plan_policy = plan.get("policy", {})
    require(plan_policy.get("automaticFullGuideWaveAfterCore120") is False, "Coverage plan must keep automatic post-Core-120 waves disabled")
    require("core140Additions" not in plan and "core145Additions" not in plan, "Coverage plan must not grow a Core-140/Core-145 batch")
    require("core140MinimumPathCoverage" not in plan_policy and "core145MinimumPathCoverage" not in plan_policy, "Coverage policy must not define Core-140/Core-145 floors")

    treatments = contract.get("treatments", [])
    require(len(treatments) == 25, f"Expected 25 final treatment entries, got {len(treatments)}")
    treatment_ids = [item.get("conceptId") for item in treatments]
    require(len(set(treatment_ids)) == 25, "Every residual Concept must receive exactly one treatment")
    require(set(treatment_ids) == residual, f"Treatment partition must exactly equal Core-120 residual: missing={sorted(residual - set(treatment_ids))} unexpected={sorted(set(treatment_ids) - residual)}")
    require(en_guides | set(treatment_ids) == set(concepts), "Published Guides plus final treatments must intentionally cover all 145 canonical Concepts")

    counts = Counter(item.get("treatment") for item in treatments)
    require(dict(counts) == EXPECTED_CLASS_COUNTS, f"Treatment class counts drifted: {dict(counts)}")
    require(contract.get("classCounts") == EXPECTED_CLASS_COUNTS, "Frozen classCounts must match computed treatments")

    evidence_by_concept_path: dict[tuple[str, str], set[str]] = defaultdict(set)
    for practice in evidence:
        for path_id in practice.get("pathIds", []):
            for concept_id in practice.get("conceptIds", []):
                evidence_by_concept_path[(concept_id, path_id)].add(practice["id"])

    practice_first = []
    course_first = []
    trigger_only = []
    overlap_reviewed = []

    for item in treatments:
        concept_id = item["conceptId"]
        treatment = item["treatment"]
        path_id = item["pathId"]
        require(concept_id in concepts, f"Treatment references unknown Concept: {concept_id}")
        require(path_id in paths, f"Treatment references unknown Path: {concept_id} -> {path_id}")
        require(concept_id not in en_guides, f"Residual treatment cannot target a published Guide Concept: {concept_id}")
        require(concept_paths.get(concept_id) == {path_id}, f"Residual treatment Path must exactly match canonical membership for {concept_id}: {sorted(concept_paths.get(concept_id, set()))}")
        require(treatment in EXPECTED_TREATMENTS, f"Unknown treatment class for {concept_id}: {treatment}")
        require(item.get("currentSurface") == "CONCISE_CANONICAL", f"Every non-Guide Concept must retain concise canonical support: {concept_id}")
        require(len(item.get("rationale", "")) >= 80, f"Treatment rationale is too thin: {concept_id}")
        require("relatedConceptIds" not in item and "relatedGuides" not in item, f"Treatment contract must not author a second relationship graph: {concept_id}")

        if treatment == "PRACTICE_OR_COURSE_FIRST":
            mode = item.get("deliveryMode")
            practice_ids = set(item.get("practiceIds", []))
            require(mode in {"PRACTICE_FIRST", "COURSE_FIRST"}, f"Practice/Course-first treatment needs a delivery mode: {concept_id}")
            earned = evidence_by_concept_path[(concept_id, path_id)]
            if mode == "PRACTICE_FIRST":
                require(practice_ids, f"Practice-first treatment needs explicit Practice evidence: {concept_id}")
                require(practice_ids <= earned, f"Practice-first mapping is not earned by current evidence: {concept_id} -> provided={sorted(practice_ids)} earned={sorted(earned)}")
                practice_first.append(concept_id)
            else:
                require(not practice_ids, f"Course-first treatment must not fabricate Practice evidence: {concept_id}")
                course_first.append(concept_id)
        elif treatment == "SEMANTIC_OVERLAP_REVIEW":
            require(item.get("resolution") == "KEEP_DISTINCT_CONCISE", f"Semantic-overlap review must be resolved, not left pending: {concept_id}")
            overlap_reviewed.append(concept_id)
        elif treatment == "FULL_GUIDE_ON_TRIGGER":
            triggers = item.get("triggers", [])
            require(len(triggers) >= 2 and all(len(trigger) >= 20 for trigger in triggers), f"Full-Guide trigger policy is too weak: {concept_id}")
            trigger_only.append(concept_id)
        else:
            require("deliveryMode" not in item and "resolution" not in item and "triggers" not in item, f"Concise treatment must remain simple: {concept_id}")

    require(len(practice_first) == 4, f"Expected four evidence-backed Practice-first Concepts, got {len(practice_first)}")
    require(len(course_first) == 5, f"Expected five Course-first Concepts, got {len(course_first)}")
    require(len(overlap_reviewed) == 8, f"Expected eight resolved semantic-overlap Concepts, got {len(overlap_reviewed)}")
    require(len(trigger_only) == 2, f"Expected two trigger-only full-Guide candidates, got {len(trigger_only)}")

    print("PASS Content Completeness V1 intentional treatment")
    print("- published full Guides: 120/145")
    print("- intentional non-Guide treatments: 25/25")
    print(f"- classes: {EXPECTED_CLASS_COUNTS}")
    print(f"- Practice-first with earned evidence: {sorted(practice_first)}")
    print(f"- Course-first without fabricated Practice evidence: {sorted(course_first)}")
    print(f"- resolved overlap reviews: {sorted(overlap_reviewed)}")
    print(f"- full Guide only on new evidence trigger: {sorted(trigger_only)}")
    print("- Core-140/Core-145 batch expansion: disabled")


if __name__ == "__main__":
    main()
