from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "content" / "content-preview-v0.8.json"

MISSION_ASSETS = {
    "broken-rag-pipeline": "broken-rag-pipeline.js",
    "47000-retry": "47000-retry.js",
    "prompt-injection-attack": "prompt-injection-attack.js",
    "production-support-launch": "production-support-launch.js",
}

DISCOVERY_EVENTS = {
    "homepage_flagship_impression",
    "homepage_flagship_click",
}
MISSION_EVENTS = {
    "mission_started",
    "simulation_run",
    "release_decision_submitted",
    "mission_completed",
}
DECISIONS = {"START ALPHA", "ITERATE CONTENT AGAIN"}


def main() -> None:
    contract = json.loads(CONTRACT.read_text(encoding="utf-8"))

    assert contract["version"] == "0.8"
    assert contract["issue"] == 92
    assert contract["status"] == "ready-to-run"

    cohort = contract["cohortId"]
    alpha = contract["formalAlphaCohortId"]
    assert re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,79}", cohort)
    assert cohort == "content-preview-2026-08"
    assert alpha == "alpha-2026-08"
    assert cohort != alpha

    target = contract["targetParticipants"]
    assert target == {"min": 3, "max": 5}

    for locale, url in contract["entryUrls"].items():
        assert locale in {"en", "zh-CN"}
        assert f"cohort={cohort}" in url
        assert "cohort=alpha-2026-08" not in url

    mission_ids = contract["campaignMissionIds"]
    assert mission_ids == list(MISSION_ASSETS)

    analytics = contract["analyticsContract"]
    assert set(analytics["discovery"]) == DISCOVERY_EVENTS
    assert set(analytics["mission"]) == MISSION_EVENTS
    assert set(contract["decisionEnum"]) == DECISIONS

    rules = contract["rules"]
    assert rules["doNotPrimeMissionChoice"] is True
    assert rules["doNotModifyFormalAlphaMetricDefinitions"] is True
    assert rules["doNotUseParticipantPiiInNotes"] is True
    assert rules["doNotCountPreviewAsFormalAlpha"] is True
    assert rules["formalAlphaStartsOnlyAfterStartAlphaDecision"] is True

    home = (ROOT / "src" / "assets" / "home.js").read_text(encoding="utf-8")
    for event in DISCOVERY_EVENTS:
        assert event in home, f"missing discovery event: {event}"

    for mission_id, asset_name in MISSION_ASSETS.items():
        source = (ROOT / "src" / "assets" / asset_name).read_text(encoding="utf-8")
        for event in MISSION_EVENTS:
            assert event in source, f"{mission_id} missing preview event: {event}"
        assert f"missionId:'{mission_id}'" in source or f'missionId:"{mission_id}"' in source, (
            mission_id,
            "stable missionId missing from event payloads",
        )

    print(
        "PASS: #92 content preview contract isolates content-preview-2026-08 from formal Alpha, "
        "pins the 3–5 participant protocol, and validates discovery/Mission telemetry."
    )


if __name__ == "__main__":
    main()
