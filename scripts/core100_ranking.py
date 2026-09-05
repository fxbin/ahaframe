#!/usr/bin/env python3
"""Validate the Core-100 candidate ranking after Practice reconciliation.

Stage 1 is algorithmic: with exactly 20 additional Guides, maximize the minimum
canonical Path Guide coverage. Post-Core-80 remaining Concepts are expected to
have at most one Path membership, so this yields a deterministic Path quota.

Stage 2 freezes an editorial candidate set inside those quotas. Practice
proximity is derived from the reconciled evidence contract; search value and
pedagogical distinctiveness remain explicit editorial judgments in the plan.
This script validates structure, coverage optimality and evidence claims. It
does not publish Guides.
"""

from __future__ import annotations

import argparse
import json
from copy import deepcopy
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
GUIDES = CONTENT / "guides"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
COVERAGE_PLAN = GUIDES / "coverage-plan-v1.0.json"
RANKING_PLAN = GUIDES / "core100-ranking-v1.0.json"
PRODUCTION_PLAN = CONTENT / "ai-content-production-v1.0.json"
RECONCILIATION = CONTENT / "practice-evidence-reconciliation-v1.0.json"
GUIDE_BUDGET = 20


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_inventory() -> tuple[dict[str, dict], dict[str, dict]]:
    concepts: dict[str, dict] = {}
    paths: dict[str, dict] = {}
    for file in sorted(INVENTORY.glob("*.json")):
        payload = load(file)
        for concept in payload.get("concepts", []):
            if concept["id"] in concepts:
                raise AssertionError(f"duplicate canonical Concept: {concept['id']}")
            concepts[concept["id"]] = concept
        for item in payload.get("paths", []):
            if item["id"] in paths:
                raise AssertionError(f"duplicate canonical Path: {item['id']}")
            concept_ids = {
                concept_id
                for milestone in item.get("milestones", [])
                for concept_id in milestone.get("conceptIds", [])
            }
            paths[item["id"]] = {
                "id": item["id"],
                "title": item["en"],
                "kind": item["kind"],
                "conceptIds": concept_ids,
            }
    return concepts, paths


def published_core80(plan: dict) -> set[str]:
    return (
        set(plan["baselineConceptIds"])
        | set(plan["core40Additions"])
        | set(plan["core60Additions"])
        | set(plan["core80Additions"])
    )


def compose_practice_evidence() -> list[dict]:
    production = load(PRODUCTION_PLAN)
    reconciliation = load(RECONCILIATION)
    evidence = deepcopy([item for item in production["experiences"] if item.get("status") == "EXISTING"])
    by_id = {item["id"]: item for item in evidence}
    for entry in reconciliation.get("augmentations", []):
        target = by_id[entry["experienceId"]]
        target["conceptIds"] = list(dict.fromkeys([*target.get("conceptIds", []), *entry["addConceptIds"]]))
    for entry in reconciliation.get("referencePractices", []):
        evidence.append(
            {
                "id": entry["experienceId"],
                "pathIds": entry["pathIds"],
                "conceptIds": entry["conceptIds"],
            }
        )
    return evidence


def ceil_fraction(value: Fraction) -> int:
    return (value.numerator + value.denominator - 1) // value.denominator


def maximum_floor_and_quotas(paths: dict[str, dict], current: set[str], concepts: dict[str, dict]) -> tuple[Fraction, dict[str, int], dict[str, list[str]]]:
    memberships: dict[str, list[str]] = {concept_id: [] for concept_id in concepts}
    for path_id, path in paths.items():
        for concept_id in path["conceptIds"]:
            memberships.setdefault(concept_id, []).append(path_id)

    remaining_by_path: dict[str, list[str]] = {path_id: [] for path_id in paths}
    multi_path_remaining: dict[str, list[str]] = {}
    for concept_id in concepts:
        if concept_id in current:
            continue
        path_ids = memberships.get(concept_id, [])
        if len(path_ids) > 1:
            multi_path_remaining[concept_id] = sorted(path_ids)
        elif len(path_ids) == 1:
            remaining_by_path[path_ids[0]].append(concept_id)

    if multi_path_remaining:
        raise AssertionError(
            "Post-Core-80 quota model assumes remaining Concepts have <=1 Path membership; "
            f"found {multi_path_remaining}"
        )

    thresholds: set[Fraction] = set()
    current_counts: dict[str, int] = {}
    for path_id, path in paths.items():
        current_count = len(path["conceptIds"] & current)
        current_counts[path_id] = current_count
        capacity = len(remaining_by_path[path_id])
        total = len(path["conceptIds"])
        for addition in range(capacity + 1):
            thresholds.add(Fraction(current_count + addition, total))

    best = Fraction(0, 1)
    best_quotas: dict[str, int] = {}
    for threshold in sorted(thresholds):
        quotas: dict[str, int] = {}
        feasible = True
        for path_id, path in paths.items():
            total = len(path["conceptIds"])
            needed_total = ceil_fraction(threshold * total)
            needed = max(0, needed_total - current_counts[path_id])
            if needed > len(remaining_by_path[path_id]):
                feasible = False
                break
            if needed:
                quotas[path_id] = needed
        if feasible and sum(quotas.values()) <= GUIDE_BUDGET:
            best = threshold
            best_quotas = quotas

    return best, best_quotas, remaining_by_path


def build_report() -> dict:
    concepts, paths = load_inventory()
    coverage = load(COVERAGE_PLAN)
    ranking = load(RANKING_PLAN)
    current = published_core80(coverage)
    evidence = compose_practice_evidence()

    max_floor, derived_quotas, remaining_by_path = maximum_floor_and_quotas(paths, current, concepts)
    plan_quotas = {path_id: int(count) for path_id, count in ranking["pathQuotas"].items()}
    selected = ranking["selected"]
    selected_ids = [item["conceptId"] for item in selected]
    selected_set = set(selected_ids)

    evidence_by_path: dict[str, set[str]] = {path_id: set() for path_id in paths}
    for experience in evidence:
        for path_id in experience.get("pathIds", []):
            if path_id in evidence_by_path:
                evidence_by_path[path_id].update(experience.get("conceptIds", []))

    selected_by_path: dict[str, list[dict]] = {path_id: [] for path_id in paths}
    practice_proximal = 0
    for item in selected:
        path_id = item["pathId"]
        if path_id in selected_by_path:
            selected_by_path[path_id].append(item)
        derived_proximity = item["conceptId"] in evidence_by_path.get(path_id, set())
        item["practiceProximityDerived"] = derived_proximity
        if derived_proximity:
            practice_proximal += 1

    projected_rows = []
    membership_gain = 0
    for path_id, path in paths.items():
        selected_here = {item["conceptId"] for item in selected_by_path[path_id]}
        current_count = len(path["conceptIds"] & current)
        projected_count = len(path["conceptIds"] & (current | selected_set))
        membership_gain += projected_count - current_count
        projected_rows.append(
            {
                "id": path_id,
                "title": path["title"],
                "kind": path["kind"],
                "conceptCount": len(path["conceptIds"]),
                "core80Guides": current_count,
                "quota": len(selected_here),
                "core100Guides": projected_count,
                "coverage": Fraction(projected_count, len(path["conceptIds"])),
                "selected": sorted(selected_here),
            }
        )

    deferred = ranking["deferredRationale"]
    quota_path_partition: dict[str, dict] = {}
    for path_id, quota in plan_quotas.items():
        selected_here = {item["conceptId"] for item in selected_by_path[path_id]}
        deferred_here = set(deferred[path_id]["conceptIds"])
        quota_path_partition[path_id] = {
            "remaining": set(remaining_by_path[path_id]),
            "selected": selected_here,
            "deferred": deferred_here,
            "quota": quota,
        }

    return {
        "concepts": concepts,
        "paths": paths,
        "ranking": ranking,
        "current": current,
        "maxFloor": max_floor,
        "derivedQuotas": derived_quotas,
        "planQuotas": plan_quotas,
        "selected": selected,
        "selectedIds": selected_ids,
        "selectedSet": selected_set,
        "practiceProximalSelections": practice_proximal,
        "projectedRows": projected_rows,
        "membershipGain": membership_gain,
        "quotaPathPartition": quota_path_partition,
    }


def check(report: dict) -> list[str]:
    errors: list[str] = []
    ranking = report["ranking"]
    expected = ranking["expectedProjection"]
    selected = report["selected"]
    selected_ids = report["selectedIds"]
    selected_set = report["selectedSet"]
    concepts = report["concepts"]
    paths = report["paths"]
    current = report["current"]

    if ranking.get("version") != "1.0.0":
        errors.append("Core-100 ranking version drifted")
    if ranking.get("status") != "CANDIDATE_SET_FROZEN":
        errors.append("Core-100 ranking must remain a frozen candidate set")
    policy = ranking.get("policy", {})
    if policy.get("guideBudget") != GUIDE_BUDGET:
        errors.append(f"Core-100 ranking budget must be {GUIDE_BUDGET}")
    if policy.get("doNotPublishFromThisFile") is not True:
        errors.append("Ranking contract must not itself publish Guides")
    if policy.get("billingActivation") is not False or policy.get("freeChoiceActivation") is not False:
        errors.append("Core-100 ranking must not activate monetization gates")

    if len(current) != 80:
        errors.append(f"Expected Core-80 baseline of 80 Concepts, got {len(current)}")
    if len(selected) != GUIDE_BUDGET or len(selected_set) != GUIDE_BUDGET:
        errors.append(f"Core-100 must select exactly {GUIDE_BUDGET} unique Concepts, got {len(selected)}/{len(selected_set)}")
    unknown = sorted(selected_set - set(concepts))
    already_published = sorted(selected_set & current)
    if unknown:
        errors.append(f"Core-100 selects unknown Concepts: {unknown}")
    if already_published:
        errors.append(f"Core-100 re-selects already published Concepts: {already_published}")

    if report["planQuotas"] != report["derivedQuotas"]:
        errors.append(
            "Core-100 Path quotas do not match the mathematically minimal quota needed for the maximum floor: "
            f"plan={report['planQuotas']} derived={report['derivedQuotas']}"
        )
    if sum(report["derivedQuotas"].values()) != GUIDE_BUDGET:
        errors.append(
            f"Expected the optimal floor to consume exactly {GUIDE_BUDGET} slots, got {sum(report['derivedQuotas'].values())}"
        )

    for item in selected:
        concept_id = item["conceptId"]
        path_id = item["pathId"]
        if path_id not in paths:
            errors.append(f"Selected Concept uses unknown Path: {concept_id} -> {path_id}")
            continue
        if concept_id not in paths[path_id]["conceptIds"]:
            errors.append(f"Selected Concept does not belong to its ranked Path: {concept_id} -> {path_id}")
        memberships = [pid for pid, path in paths.items() if concept_id in path["conceptIds"]]
        if memberships != [path_id]:
            errors.append(f"Selected post-Core-80 Concept must have exactly one Path membership: {concept_id} -> {memberships}")
        if item.get("searchValue") not in {1, 2, 3}:
            errors.append(f"Selected Concept needs searchValue 1..3: {concept_id}")
        if item.get("distinctiveness") not in {1, 2, 3}:
            errors.append(f"Selected Concept needs distinctiveness 1..3: {concept_id}")
        if not item.get("reason"):
            errors.append(f"Selected Concept needs an explicit reason: {concept_id}")
        if item.get("practiceProximityExpected") is not item.get("practiceProximityDerived"):
            errors.append(
                f"Practice proximity claim drifted for {concept_id}: expected={item.get('practiceProximityExpected')} "
                f"derived={item.get('practiceProximityDerived')}"
            )

    selected_counts = {path_id: len(items) for path_id, items in report["quotaPathPartition"].items()}
    for path_id, partition in report["quotaPathPartition"].items():
        actual_count = len(partition["selected"])
        if actual_count != partition["quota"]:
            errors.append(f"Path quota mismatch for {path_id}: expected {partition['quota']}, got {actual_count}")
        if partition["selected"] | partition["deferred"] != partition["remaining"]:
            missing = sorted(partition["remaining"] - (partition["selected"] | partition["deferred"]))
            extra = sorted((partition["selected"] | partition["deferred"]) - partition["remaining"])
            errors.append(f"Selected/deferred partition drifted for {path_id}: missing={missing} extra={extra}")
        if partition["selected"] & partition["deferred"]:
            errors.append(f"Concept cannot be both selected and deferred in {path_id}: {sorted(partition['selected'] & partition['deferred'])}")
        if not ranking["deferredRationale"][path_id].get("reason"):
            errors.append(f"Deferred candidates need a group rationale for {path_id}")

    projected_floor = min(row["coverage"] for row in report["projectedRows"])
    if projected_floor != report["maxFloor"]:
        errors.append(f"Selected Core-100 set does not achieve maximum floor: {projected_floor} vs {report['maxFloor']}")
    if len(current | selected_set) != expected["guideConceptCount"]:
        errors.append(f"Projected Guide Concept count drifted: {len(current | selected_set)}")
    if report["membershipGain"] != expected["selectedConceptMembershipGain"]:
        errors.append(f"Projected Path-Concept membership gain drifted: {report['membershipGain']}")
    projected_memberships = 143 + report["membershipGain"]
    if projected_memberships != expected["pathConceptMembershipCount"]:
        errors.append(f"Projected Path-Concept membership count drifted: {projected_memberships}")
    if abs(float(projected_floor) - expected["minimumPathCoverage"]) > 1e-12:
        errors.append(f"Projected minimum Path coverage drifted: {float(projected_floor)}")
    if report["practiceProximalSelections"] != expected["practiceProximalSelections"]:
        errors.append(
            f"Practice-proximal selection count drifted: expected {expected['practiceProximalSelections']}, "
            f"got {report['practiceProximalSelections']}"
        )

    expected_above = set(ranking["deferredRationale"]["alreadyAboveCore100Floor"]["pathIds"])
    quota_paths = set(report["planQuotas"])
    no_quota_paths = set(paths) - quota_paths
    if expected_above != no_quota_paths:
        errors.append(f"Above-floor Path classification drifted: expected {sorted(no_quota_paths)}, got {sorted(expected_above)}")

    return errors


def pct(value: Fraction) -> str:
    return f"{float(value) * 100:.1f}%"


def print_report(report: dict) -> None:
    print("Core-100 Ranking — after Practice reconciliation")
    print(
        f"Optimal 20-Guide minimum Path floor: {pct(report['maxFloor'])} | "
        f"quota slots {sum(report['derivedQuotas'].values())}/20 | "
        f"practice-proximal selections {report['practiceProximalSelections']}/20"
    )
    print(f"Derived quotas: {report['derivedQuotas']}")
    print(f"Selected Concepts: {', '.join(report['selectedIds'])}")
    print()
    print("| Path | Core-80 | + | Core-100 | Coverage |")
    print("| --- | ---: | ---: | ---: | ---: |")
    for row in sorted(report["projectedRows"], key=lambda item: (item["coverage"], item["title"])):
        print(
            f"| {row['title']} | {row['core80Guides']}/{row['conceptCount']} | {row['quota']} | "
            f"{row['core100Guides']}/{row['conceptCount']} | {pct(row['coverage'])} |"
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    report = build_report()
    errors = check(report) if args.check else []
    if args.json:
        serializable = {
            "maxFloor": float(report["maxFloor"]),
            "derivedQuotas": report["derivedQuotas"],
            "selected": [
                {
                    **{key: value for key, value in item.items() if key != "practiceProximityDerived"},
                    "practiceProximityDerived": item["practiceProximityDerived"],
                }
                for item in report["selected"]
            ],
            "practiceProximalSelections": report["practiceProximalSelections"],
            "membershipGain": report["membershipGain"],
            "projectedRows": [
                {**row, "coverage": float(row["coverage"])} for row in report["projectedRows"]
            ],
            "errors": errors,
        }
        print(json.dumps(serializable, ensure_ascii=False, indent=2))
    else:
        print_report(report)
        for error in errors:
            print(f"ERROR: {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
