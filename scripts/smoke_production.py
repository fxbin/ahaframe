from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone


def request(url: str, *, method: str = 'GET', body: dict | None = None, origin: str | None = None):
    data = None
    headers = {'User-Agent': 'AhaFrame-Production-Smoke/1.0'}
    if body is not None:
        data = json.dumps(body).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    if origin:
        headers['Origin'] = origin
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            raw = response.read().decode('utf-8', errors='replace')
            return response.status, raw, dict(response.headers)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode('utf-8', errors='replace')
        return exc.code, raw, dict(exc.headers)


def expect(status: int, wanted: int, label: str, body: str = ''):
    if status != wanted:
        raise SystemExit(f'{label}: expected HTTP {wanted}, got {status}: {body[:500]}')


def main():
    parser = argparse.ArgumentParser(description='Smoke-test the deployed bilingual AhaFrame validation surface.')
    parser.add_argument('--base-url', default='https://ahaframe.com')
    parser.add_argument('--validation-endpoint', required=True)
    parser.add_argument('--run-id', required=True)
    parser.add_argument('--cohort', default='production-smoke')
    args = parser.parse_args()

    base = args.base_url.rstrip('/')
    endpoint = args.validation_endpoint
    run_id = args.run_id.replace(' ', '-')[:80]
    cohort = args.cohort.strip().lower()[:80]
    origin = base

    pages = [
        '/en/',
        '/zh-cn/',
        '/en/labs/instruction-conflict/',
        '/zh-cn/labs/instruction-conflict/',
        '/en/labs/agent-workflow-graph/',
        '/zh-cn/labs/agent-workflow-graph/',
        '/en/build/reliable-support-agent/',
        '/zh-cn/build/reliable-support-agent/',
        '/en/pricing/',
        '/zh-cn/pricing/',
        '/en/early-access/',
        '/zh-cn/early-access/',
        '/robots.txt',
        '/sitemap.xml',
    ]
    for path in pages:
        status, body, headers = request(base + path)
        expect(status, 200, path, body)
        if path in {'/en/','/zh-cn/'} and 'AhaFrame' not in body:
            raise SystemExit(f'{path}: landing page does not contain AhaFrame branding')
        if path.startswith('/zh-cn/') and '<html lang="zh-CN">' not in body:
            raise SystemExit(f'{path}: zh-CN html language marker missing')
        if path == '/robots.txt' and 'Sitemap:' not in body:
            raise SystemExit('robots.txt does not advertise a sitemap')
        if path == '/sitemap.xml' and '/zh-cn/' not in body:
            raise SystemExit('sitemap.xml does not include the zh-CN surface')
        print(f'PASS GET {path} {status}')

    now = datetime.now(timezone.utc).isoformat()
    common = {
        'anonymousUserId': f'smoke-user-{run_id}',
        'sessionId': f'smoke-session-{run_id}',
        'cohortId': cohort,
        'locale': 'zh-CN',
        'path': '/zh-cn/labs/instruction-conflict/',
        'layer': 'Prompt',
        'labId': 'instruction-conflict',
        'labVersion': '1.0.0',
        'deviceClass': 'desktop',
    }

    event = {
        **common,
        'eventId': f'smoke-event-{run_id}',
        'name': 'production_smoke_test',
        'props': {'runId': run_id, 'cohortId': cohort},
        'ts': now,
        'pageType': 'lab',
        'visitCount': 1,
        'returnVisit': False,
        'utmSource': 'github-actions',
        'utmMedium': 'smoke',
        'utmCampaign': 'validation-deployment',
        'firstUtmSource': 'github-actions',
        'referrer': '',
    }
    feedback = {
        **common,
        'feedbackId': f'smoke-feedback-{run_id}',
        'rating': 'yes',
        'strongAha': True,
        'note': 'production smoke test zh-CN locale and cohort persistence',
        'attribution': {'source': 'github-actions', 'runId': run_id, 'cohortId': cohort},
        'submittedAt': now,
    }
    waitlist = {
        **common,
        'email': f'ahaframe-smoke+{run_id}@example.invalid',
        'intent': 'production-smoke',
        'source': '/zh-cn/early-access/',
        'utmSource': 'github-actions',
        'utmMedium': 'smoke',
        'utmCampaign': 'validation-deployment',
        'firstUtmSource': 'github-actions',
        'referrer': '',
    }

    for label, payload in [('event', event), ('feedback', feedback), ('waitlist', waitlist)]:
        status, body, headers = request(endpoint, method='POST', body=payload, origin=origin)
        expect(status, 200, f'validation {label}', body)
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError as exc:
            raise SystemExit(f'validation {label}: invalid JSON response: {body[:500]}') from exc
        if parsed.get('ok') is not True:
            raise SystemExit(f'validation {label}: endpoint did not return ok=true: {parsed}')
        print(f'PASS POST {label}: {parsed}')

    print(f'PASS AhaFrame bilingual production smoke run_id={run_id} cohort={cohort}')
    print(f'Expected DB IDs with locale=zh-CN and cohort_id={cohort}: smoke-event-{run_id}, smoke-feedback-{run_id}, ahaframe-smoke+{run_id}@example.invalid')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'FAIL production smoke: {exc}', file=sys.stderr)
        raise
