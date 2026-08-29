#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
MANIFEST = CONTENT / "ai-content-production-v1.0.json"
GRAPH = CONTENT / "ai-knowledge-graph-v1.0.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def main():
    manifest = load(MANIFEST)
    graph = load(GRAPH)
    concept_ids: set[str] = set()
    path_ids: set[str] = set()
    for path in sorted(INVENTORY.glob("*.json")):
        data = load(path)
        concept_ids.update(item["id"] for item in data.get("concepts", []))
        path_ids.update(item["id"] for item in data.get("paths", []))

    require(manifest["version"] == "1.0.0", "content production manifest version drifted")
    require(manifest["principles"]["knowledgeMapOpen"] is True, "Knowledge Map must remain open")
    require(manifest["principles"]["reuseCanonicalConcepts"] is True, "content production must reuse canonical concepts")
    require(manifest["principles"]["billingActivation"] is False, "#146/#149 must not activate Billing")
    require(
        manifest["principles"]["freeChoiceActivation"] is False,
        "#149 foundation must remain dormant until Content Readiness explicitly activates free-choice claiming",
    )
    require("freeLimit" not in json.dumps(manifest), "free-choice quota belongs to entitlement, not content-production data")

    experiences = manifest["experiences"]
    experience_ids = [item["id"] for item in experiences]
    require(len(experience_ids) == len(set(experience_ids)), "duplicate experience id")
    require(len(experiences) >= 15, "production plan must cover a meaningful first library")

    allowed_access = set(manifest["principles"]["accessPolicyIds"])
    seeded_content = {item["id"] for item in graph["contentNodes"]}
    covered_paths: set[str] = set()
    for item in experiences:
        require(item["pathIds"], f"experience needs at least one path: {item['id']}")
        require(item["conceptIds"], f"experience needs canonical concepts: {item['id']}")
        require(all(path_id in path_ids for path_id in item["pathIds"]), f"unknown path on {item['id']}: {item['pathIds']}")
        require(all(concept_id in concept_ids for concept_id in item["conceptIds"]), f"unknown concept on {item['id']}: {item['conceptIds']}")
        require(item["accessPolicyId"] in allowed_access, f"unknown access policy on {item['id']}")
        if item["status"] in {"EXISTING", "SEEDED"}:
            require(item["id"] in seeded_content, f"{item['status']} experience is not in canonical graph seed: {item['id']}")
        covered_paths.update(item["pathIds"])

    require(covered_paths == path_ids, f"every v1 path needs a production experience; missing={sorted(path_ids - covered_paths)}")

    waves = manifest["waves"]
    require([item["order"] for item in waves] == list(range(len(waves))), "wave order must be contiguous")
    wave_experiences: list[str] = []
    for wave in waves:
        require(wave["experienceIds"], f"empty production wave: {wave['id']}")
        require(all(item in set(experience_ids) for item in wave["experienceIds"]), f"unknown experience in {wave['id']}")
        wave_experiences.extend(wave["experienceIds"])
    require(len(wave_experiences) == len(set(wave_experiences)), "an experience may belong to only one production wave")
    require(set(wave_experiences) == set(experience_ids), "every production experience must be assigned to a wave")

    access_counts = {access: sum(1 for item in experiences if item["accessPolicyId"] == access) for access in allowed_access}
    require(access_counts.get("access-open", 0) >= 1, "at least one full experience must remain open")
    require(access_counts.get("access-free-choice", 0) >= 3, "free-choice catalog needs multiple meaningful options")
    require(access_counts.get("access-membership", 0) >= 5, "membership library needs real depth")

    print(
        "PASS AI content production v1: "
        f"{len(experiences)} experiences across {len(waves)} waves cover all {len(path_ids)} paths; "
        f"access={access_counts}; Billing and free-choice claiming remain disabled."
    )


if __name__ == "__main__":
    main()
