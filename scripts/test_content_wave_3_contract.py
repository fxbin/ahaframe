#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
WEB = ROOT / "web"
WAVE_IDS = [
    "multi-agent-coordination-incident",
    "production-release-gate-build",
    "model-adaptation-decision-lab",
    "solo-business-operating-system-build",
]
EXPECTED_ROUTES = {
    "multi-agent-coordination-incident": "labs/multi-agent-coordination-incident/",
    "production-release-gate-build": "build/production-release-gate-build/",
    "model-adaptation-decision-lab": "labs/model-adaptation-decision-lab/",
    "solo-business-operating-system-build": "build/solo-business-operating-system-build/",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def control_shape(mission: dict):
    return {
        key: sorted(value["options"].keys())
        for key, value in sorted(mission.get("controls", mission.get("groups", {})).items())
    }


def main():
    manifest = load(CONTENT / "ai-content-production-v1.0.json")
    runtime = load(WEB / "runtime-experiences.json")["experiences"]
    en_routes = load(CONTENT / "en.json")["availableRoutes"]
    zh_routes = load(CONTENT / "zh-CN.json")["availableRoutes"]
    en = load(CONTENT / "content-wave-3.en.json")
    zh = load(CONTENT / "content-wave-3.zh-CN.json")
    model_inventory = load(CONTENT / "ai-knowledge-inventory-v1.0" / "build-model-engineering.json")
    builder = (ROOT / "scripts" / "build_ai_knowledge_graph_v1.py").read_text(encoding="utf-8")

    require(en["locale"] == "en" and zh["locale"] == "zh-CN", "wave 3 locale ids drifted")
    require(set(en["missions"]) == set(WAVE_IDS), "English Wave 3 content must contain exactly the planned Experiences")
    require(set(zh["missions"]) == set(WAVE_IDS), "Chinese Wave 3 content must contain exactly the planned Experiences")
    require(en_routes == zh_routes, "Wave 3 publication requires exact EN/zh-CN route parity")

    by_id = {item["id"]: item for item in manifest["experiences"]}
    wave = next(item for item in manifest["waves"] if item["id"] == "wave-3-scale-production")
    require(wave["experienceIds"] == WAVE_IDS, "Wave 3 production order drifted")
    require(manifest["principles"]["billingActivation"] is False, "Wave 3 must not activate Billing")
    require(manifest["principles"]["freeChoiceActivation"] is False, "Wave 3 must not activate free-choice claiming")

    for experience_id in WAVE_IDS:
        item = by_id[experience_id]
        require(item["status"] == "EXISTING", f"Wave 3 Experience is not shipped: {experience_id}")
        require(item["accessPolicyId"] == "access-membership", f"Wave 3 depth should remain membership-classified: {experience_id}")
        require(experience_id in runtime, f"Wave 3 Experience lacks runtime: {experience_id}")
        require(EXPECTED_ROUTES[experience_id] in en_routes, f"Wave 3 Experience lacks public route: {experience_id}")
        en_mission = en["missions"][experience_id]
        zh_mission = zh["missions"][experience_id]
        require(control_shape(en_mission) == control_shape(zh_mission), f"bilingual control/option parity drifted: {experience_id}")
        require(
            [metric["key"] for metric in en_mission["metrics"]] == [metric["key"] for metric in zh_mission["metrics"]],
            f"bilingual metric parity drifted: {experience_id}",
        )
        require(len(en_mission["controls"]) >= 4, f"Wave 3 needs multi-variable system decisions: {experience_id}")
        require(en_mission.get("transferPrompt") and zh_mission.get("transferPrompt"), f"Wave 3 needs transfer prompts: {experience_id}")

    model_concepts = {item["id"]: item for item in model_inventory["concepts"]}
    adapter_refs = set(model_concepts["concept-adapter-finetuning"]["sourceRefs"])
    serving_refs = set(model_concepts["concept-inference-serving"]["sourceRefs"])
    require("hf-transformers-peft-current" in adapter_refs, "adapter concept lost current PEFT source")
    require("hf-peft-quantization-current" in adapter_refs, "adapter concept lost quantized PEFT source")
    require("hf-transformers-serving-current" in serving_refs, "serving concept lost Transformers optimization source")
    require("vllm-lora-serving-current" in serving_refs, "serving concept lost current LoRA serving source")
    for source_id in ["hf-peft-quantization-current", "vllm-lora-serving-current"]:
        require(source_id in builder, f"freshness source is not registered by graph builder: {source_id}")

    release = en["missions"]["production-release-gate-build"]
    require("BLOCK" == release["ui"]["block"], "release gate must expose BLOCK explicitly")
    require(len(release["metrics"]) >= 6, "release gate needs evidence across risk, eval, observability, rollback, exposure and cost")

    solo_concepts = set(by_id["solo-business-operating-system-build"]["conceptIds"])
    require(
        {"concept-workflow-automation-boundary", "concept-automation-maintenance", "concept-human-review-boundary"}.issubset(solo_concepts),
        "solo business build must reuse engineering Concepts rather than prompt-template content",
    )

    print(
        "PASS Content Wave 3 publication: 4 membership Experiences are runtime-backed, bilingual, multi-variable and transfer-ready; "
        "release vetoes remain explicit; model adaptation sources are freshness-reviewed; solo business reuses engineering Concepts; "
        "Billing and free-choice claiming remain disabled."
    )


if __name__ == "__main__":
    main()
