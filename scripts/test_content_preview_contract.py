from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "content" / "content-preview-v0.8.json"

MISSION_IDS = [
    "broken-rag-pipeline",
    "47000-retry",
    "prompt-injection-attack",
    "production-support-launch",
]
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
    assert contract["targetParticipants"] == {"min": 3, "max": 5}

    for locale, url in contract["entryUrls"].items():
        assert locale in {"en", "zh-CN"}
        assert f"cohort={cohort}" in url
        assert "cohort=alpha-2026-08" not in url

    assert contract["campaignMissionIds"] == MISSION_IDS
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

    campaign = (ROOT / "web" / "components" / "campaign-telemetry.tsx").read_text(encoding="utf-8")
    for event in DISCOVERY_EVENTS:
        assert event in campaign, f"missing Next discovery event: {event}"
    for field in ("missionId", "position", "campaignRole", "campaignVersion"):
        assert field in campaign, f"Campaign telemetry lost {field}"

    mission_hook = (ROOT / "web" / "hooks" / "use-mission-runtime.ts").read_text(encoding="utf-8")
    for event in MISSION_EVENTS:
        assert event in mission_hook, f"missing Next Mission event: {event}"
    for mission_id in MISSION_IDS:
        assert mission_id in mission_hook or mission_id == "production-support-launch", f"Mission telemetry mapping lost {mission_id}"

    validation_client = (ROOT / "web" / "lib" / "validation-client.ts").read_text(encoding="utf-8")
    assert "PRIVATE_EVENT_PROP" in validation_client
    for private_key in ("email", "message", "note", "rationale", "contact"):
        assert private_key in validation_client, f"ordinary event privacy filter lost {private_key}"
    assert 'fetch("/api/validation"' in validation_client

    print(
        "PASS: #92 content preview contract remains isolated from formal Alpha and its "
        "discovery/Mission telemetry now lives in the current Next.js runtime."
    )


if __name__ == "__main__":
    main()
