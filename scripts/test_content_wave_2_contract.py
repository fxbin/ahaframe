#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
WEB = ROOT / "web"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def main():
    manifest = load(CONTENT / "ai-content-production-v1.0.json")
    runtime = load(WEB / "runtime-experiences.json")["experiences"]
    en_routes = load(CONTENT / "en.json")["availableRoutes"]
    zh_routes = load(CONTENT / "zh-CN.json")["availableRoutes"]
    en = load(CONTENT / "content-wave-2.en.json")
    zh = load(CONTENT / "content-wave-2.zh-CN.json")

    wave = next(item for item in manifest["waves"] if item["id"] == "wave-2-build-systems")
    expected = wave["experienceIds"]
    by_id = {item["id"]: item for item in manifest["experiences"]}

    require(en["locale"] == "en" and zh["locale"] == "zh-CN", "wave 2 bundle locale metadata drifted")
    require(set(en["missions"]) == set(expected), "English wave 2 bundle must cover the exact production wave")
    require(set(zh["missions"]) == set(expected), "Chinese wave 2 bundle must cover the exact production wave")
    require(en_routes == zh_routes, "wave 2 requires exact public route parity")

    for content_id in expected:
        item = by_id[content_id]
        require(item["status"] == "EXISTING", f"wave 2 content is not shipped: {content_id}")
        require(content_id in runtime, f"wave 2 content has no runtime: {content_id}")
        expected_route = f"build/{content_id}/" if item["nodeType"] == "BUILD" else f"labs/{content_id}/"
        require(expected_route in en_routes, f"wave 2 public route missing: {expected_route}")

        en_mission = en["missions"][content_id]
        zh_mission = zh["missions"][content_id]
        require(en_mission.get("transferPrompt") and zh_mission.get("transferPrompt"), f"missing transfer prompt: {content_id}")
        require(len(en_mission.get("controls", {})) >= 4, f"wave 2 experience needs multi-variable decisions: {content_id}")
        require(set(en_mission["controls"]) == set(zh_mission["controls"]), f"control parity drifted: {content_id}")
        for control_id in en_mission["controls"]:
            require(
                set(en_mission["controls"][control_id]["options"]) == set(zh_mission["controls"][control_id]["options"]),
                f"control option parity drifted: {content_id}/{control_id}",
            )
        require(
            [metric["key"] for metric in en_mission["metrics"]] == [metric["key"] for metric in zh_mission["metrics"]],
            f"metric parity drifted: {content_id}",
        )
        require(len(en_mission["debrief"]["points"]) >= 3, f"thin English debrief: {content_id}")
        require(len(zh_mission["debrief"]["points"]) >= 3, f"thin Chinese debrief: {content_id}")

    concept_by_id = {}
    for path in INVENTORY.glob("*.json"):
        for concept in load(path).get("concepts", []):
            concept_by_id[concept["id"]] = concept
    for concept_id in ("concept-mcp-boundaries", "concept-mcp-capability-negotiation"):
        concept = concept_by_id[concept_id]
        require(concept["versionSensitive"] is True, f"MCP concept must remain version-sensitive: {concept_id}")
        require("mcp-2026-07-28-spec" in concept["sourceRefs"], f"MCP concept lost current source review: {concept_id}")

    source = (ROOT / "src/assets/content-wave-2-scenarios.js").read_text(encoding="utf-8")
    require("currentSpecVersion:'2026-07-28'" in source, "MCP Mission must expose the reviewed current specification")
    require("mcp-2025-11-25" not in source, "obsolete MCP specification leaked into Wave 2")
    require(manifest["principles"]["billingActivation"] is False, "Wave 2 must not activate Billing")
    require(manifest["principles"]["freeChoiceActivation"] is False, "Wave 2 must not activate free-choice claiming")

    print(
        "PASS Content Wave 2 contract: 7 shipped Experiences have exact EN/zh-CN controls/metrics/routes, "
        "runtime backing, transfer prompts, multi-variable decisions, current MCP source review, and dormant monetization gates."
    )


if __name__ == "__main__":
    main()
