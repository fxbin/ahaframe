#!/usr/bin/env python3
"""Compute Guide coverage over the 145 Concept × 15 Path matrix."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY_ROOT = ROOT / "content" / "ai-knowledge-inventory-v1.0"
GUIDE_ROOT = ROOT / "content" / "guides"
PLAN_PATH = GUIDE_ROOT / "coverage-plan-v1.0.json"


def load_paths() -> dict[str, dict[str, object]]:
    paths: dict[str, dict[str, object]] = {}
    for filename in sorted(INVENTORY_ROOT.glob("paths-*.json")):
        payload = json.loads(filename.read_text(encoding="utf-8"))
        if payload.get("version") != "1.0.0":
            raise ValueError(f"Unexpected path inventory version: {filename}")
        for path in payload.get("paths", []):
            concept_ids = {
                concept_id
                for milestone in path.get("milestones", [])
                for concept_id in milestone.get("conceptIds", [])
            }
            paths[path["id"]] = {"title": path.get("en", path["id"]), "conceptIds": concept_ids}
    return paths


def load_actual_guide_ids() -> set[str]:
    concept_ids: set[str] = set()
    for filename in sorted(GUIDE_ROOT.glob("core-*.en.json")):
        payload = json.loads(filename.read_text(encoding="utf-8"))
        for guide in payload.get("guides", []):
            concept_id = guide["conceptId"]
            if concept_id in concept_ids:
                raise ValueError(f"Duplicate Guide Concept binding: {concept_id}")
            concept_ids.add(concept_id)
    return concept_ids


def load_plan() -> dict[str, object]:
    return json.loads(PLAN_PATH.read_text(encoding="utf-8"))


def build_reuse(paths: dict[str, dict[str, object]]) -> Counter[str]:
    reuse: Counter[str] = Counter()
    for path in paths.values():
        for concept_id in path["conceptIds"]:  # type: ignore[index]
            reuse[concept_id] += 1
    return reuse


def stage_metrics(selected: set[str], paths: dict[str, dict[str, object]], reuse: Counter[str]) -> dict[str, object]:
    per_path = []
    for path_id, path in paths.items():
        concept_ids: set[str] = path["conceptIds"]  # type: ignore[assignment]
        covered = len(concept_ids & selected)
        total = len(concept_ids)
        per_path.append({"id": path_id, "title": path["title"], "covered": covered, "total": total, "ratio": covered / total})
    membership_covered = sum(reuse[concept_id] for concept_id in selected)
    membership_total = sum(reuse.values())
    return {
        "guideCount": len(selected),
        "conceptCoverage": len(selected) / len(reuse),
        "membershipCovered": membership_covered,
        "membershipTotal": membership_total,
        "membershipCoverage": membership_covered / membership_total,
        "pathReach": sum(1 for row in per_path if row["covered"] > 0),
        "minimumPathCoverage": min(row["ratio"] for row in per_path),
        "perPath": sorted(per_path, key=lambda row: (row["ratio"], row["title"])),
    }


def theoretical_membership_max(baseline: set[str], target_count: int, reuse: Counter[str]) -> int:
    remaining = sorted((reuse[concept_id] for concept_id in reuse if concept_id not in baseline), reverse=True)
    additions = target_count - len(baseline)
    return sum(reuse[concept_id] for concept_id in baseline) + sum(remaining[:additions])


def pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    paths = load_paths()
    reuse = build_reuse(paths)
    plan = load_plan()

    baseline = set(plan["baselineConceptIds"])
    core40 = baseline | set(plan["core40Additions"])
    core60 = core40 | set(plan["core60Additions"])
    core80 = core60 | set(plan["core80Additions"])
    core100 = core80 | set(plan["core100Additions"])
    actual = load_actual_guide_ids()

    stage_sets = {
        "core-20": baseline,
        "core-40": core40,
        "core-60": core60,
        "core-80": core80,
        "core-100": core100,
    }
    stages = {name: stage_metrics(selected, paths, reuse) for name, selected in stage_sets.items()}

    errors: list[str] = []
    expected_matrix = plan["matrix"]
    if len(reuse) != expected_matrix["conceptCount"]:
        errors.append(f"Concept count drift: {len(reuse)}")
    if len(paths) != expected_matrix["pathCount"]:
        errors.append(f"Path count drift: {len(paths)}")
    if sum(reuse.values()) != expected_matrix["pathConceptMembershipCount"]:
        errors.append(f"Path-Concept membership drift: {sum(reuse.values())}")

    expected_counts = {20, 40, 60, 80, 100}
    if {len(selected) for selected in stage_sets.values()} != expected_counts:
        errors.append("Coverage plan must contain cumulative 20 / 40 / 60 / 80 / 100 unique Concepts")

    expected_actual_by_count = {len(selected): selected for selected in stage_sets.values()}
    expected_actual = expected_actual_by_count.get(len(actual))
    if expected_actual is None:
        errors.append(f"Published Guide count must match a planned stage (20/40/60/80/100), got {len(actual)}")
    elif actual != expected_actual:
        errors.append(
            f"Actual Guide bindings differ from the planned core-{len(actual)} stage: "
            f"missing={sorted(expected_actual - actual)} unexpected={sorted(actual - expected_actual)}"
        )

    unknown = core100 - set(reuse)
    if unknown:
        errors.append(f"Unknown planned Concepts: {sorted(unknown)}")

    floors = {
        "core-40": float(plan["policy"]["core40MinimumPathCoverage"]),
        "core-60": float(plan["policy"]["core60MinimumPathCoverage"]),
        "core-80": float(plan["policy"]["core80MinimumPathCoverage"]),
        "core-100": float(plan["policy"]["core100MinimumPathCoverage"]),
    }
    for stage_name, floor in floors.items():
        if stages[stage_name]["minimumPathCoverage"] + 1e-12 < floor:
            errors.append(f"{stage_name} minimum Path coverage fell below plan floor")

    theoretical = {
        name: theoretical_membership_max(baseline, len(stage_sets[name]), reuse)
        for name in ("core-40", "core-60", "core-80", "core-100")
    }

    output = {
        "matrix": {"conceptCount": len(reuse), "pathCount": len(paths), "pathConceptMembershipCount": sum(reuse.values())},
        "publishedGuideCount": len(actual),
        "stages": stages,
        "theoreticalMembershipMaximum": theoretical,
        "errors": errors,
    }

    if args.json:
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print("Guide Coverage: 145 Concepts × 15 Paths")
        print(f"Published Guide stage: {len(actual)} Guides")
        print()
        for name in stage_sets:
            metric = stages[name]
            maximum = theoretical.get(name)
            efficiency = ""
            if maximum:
                efficiency = f" | reuse efficiency {metric['membershipCovered']}/{maximum} ({pct(metric['membershipCovered'] / maximum)})"
            print(
                f"{name}: {metric['guideCount']}/145 Concepts ({pct(metric['conceptCoverage'])}) | "
                f"Path-Concept {metric['membershipCovered']}/{metric['membershipTotal']} ({pct(metric['membershipCoverage'])}) | "
                f"Path reach {metric['pathReach']}/15 | floor {pct(metric['minimumPathCoverage'])}{efficiency}"
            )
        print()
        stage_names = list(stage_sets)
        print("| Path | Concepts | " + " | ".join(stage_names) + " |")
        print("| --- | ---: | " + " | ".join("---:" for _ in stage_names) + " |")
        by_stage = {name: {row["id"]: row for row in metric["perPath"]} for name, metric in stages.items()}
        for path_id, path in paths.items():
            first = by_stage[stage_names[0]][path_id]
            cells = []
            for stage_name in stage_names:
                row = by_stage[stage_name][path_id]
                cells.append(f"{row['covered']}/{row['total']} ({pct(row['ratio'])})")
            print(f"| {path['title']} | {first['total']} | " + " | ".join(cells) + " |")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1 if args.check else 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
