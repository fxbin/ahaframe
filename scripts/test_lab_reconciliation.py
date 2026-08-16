from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / 'content' / 'lab-reconciliation-v0.8.json'
VALIDATION = ROOT / 'src' / 'assets' / 'validation-context.js'

EXPECTED_IDS = {
    'token-playground',
    'context-window',
    'agent-loop',
    'rag-failure',
    'context-compression',
    'agent-reliability',
    'instruction-conflict',
    'evaluation-failure',
    'agent-workflow-graph',
    'reliable-support-agent',
}
EXPECTED_CAMPAIGN = [
    'rag-failure',
    'agent-reliability',
    'instruction-conflict',
    'reliable-support-agent',
]
FLAGSHIP_MISSIONS = {
    'rag-failure': 'broken-rag-pipeline',
    'agent-reliability': '47000-retry',
    'instruction-conflict': 'prompt-injection-attack',
    'reliable-support-agent': 'production-support-launch',
}


def relative_route(route: str) -> str:
    assert route.startswith('/en/') and route.endswith('/'), route
    return route[len('/en/'):]


def main() -> None:
    data = json.loads(CONTRACT.read_text(encoding='utf-8'))
    assert data['version'] == '0.8.0'
    assert data['status'] == 'active'
    assert data['primaryCampaign'] == EXPECTED_CAMPAIGN
    assert data['invariants'] == {
        'deletePublicRoutes': False,
        'preserveStableLabIds': True,
        'preserveStableInteractionEvents': True,
        'primaryCampaignIsNotKnowledgeMap': True,
        'missionIdentityIsAdditive': True,
    }

    allowed = set(data['allowedStatuses'])
    experiences = data['experiences']
    ids = [item['id'] for item in experiences]
    routes = [item['route'] for item in experiences]
    assert set(ids) == EXPECTED_IDS, f'inventory mismatch: {set(ids) ^ EXPECTED_IDS}'
    assert len(ids) == len(set(ids)), 'duplicate experience id'
    assert len(routes) == len(set(routes)), 'duplicate public route'

    validation = VALIDATION.read_text(encoding='utf-8')
    for item in experiences:
        assert item['primaryStatus'] in allowed, item
        assert item['seoPolicy'].startswith('KEEP_INDEXED'), item['id']
        assert item['telemetryPolicy'].startswith('PRESERVE_'), item['id']
        assert item['migrationAction'].strip(), item['id']
        assert item['learnerPromise'].strip(), item['id']
        assert item['productionDecision'].strip(), item['id']
        assert item['ahaMoment'].strip(), item['id']

        relative = re.escape(relative_route(item['route']))
        lab_id = re.escape(item['id'])
        pattern = rf"'{relative}':\{{[^\n]*labId:'{lab_id}'"
        assert re.search(pattern, validation), f"{item['id']}: stable route/labId missing from validation-context.js"

    by_id = {item['id']: item for item in experiences}
    for lab_id, mission_id in FLAGSHIP_MISSIONS.items():
        item = by_id[lab_id]
        assert item['primaryStatus'] == 'REFRAME AS MISSION'
        assert item['missionId'] == mission_id
        assert 'ADDITIVE_MISSION_EVENTS' in item['telemetryPolicy']

    assert by_id['context-compression']['primaryStatus'] == 'MERGE INTO FLAGSHIP'
    assert by_id['evaluation-failure']['primaryStatus'] == 'PREREQUISITE NODE'
    assert by_id['agent-workflow-graph']['primaryStatus'] == 'PREREQUISITE NODE'
    for lab_id in ('token-playground', 'context-window', 'agent-loop'):
        assert by_id[lab_id]['primaryStatus'] == 'KEEP AS FOUNDATION'

    assert all(item['primaryStatus'] != 'RETIRE FROM PRIMARY PATH' for item in experiences), (
        'v0.8 currently preserves every public experience; retirement must be an explicit later decision'
    )

    print('PASS Lab reconciliation v0.8: 10 experiences classified, 4-step Campaign bounded, public routes/lab_ids preserved, Mission identity additive.')


if __name__ == '__main__':
    main()
