# AhaFrame Exact Production Release Gate

Status: production control-plane guard for #78.

## Why this exists

A successful `main` CI run proves the code/build plane. It does **not** prove that `https://ahaframe.com` has already switched to the same commit.

A prior release showed the failure mode directly: Production Smoke passed while Vercel was still serving the preceding deployment. That creates a false-green release signal.

## Release identity

Every static build writes a public, non-secret marker:

```text
/assets/build-meta.json
```

Example:

```json
{
  "schemaVersion": 1,
  "gitCommitSha": "<40-character git SHA>",
  "gitCommitRef": "main",
  "environment": "production"
}
```

Commit resolution order:

1. `AHAFRAME_BUILD_COMMIT_SHA` explicit override;
2. Vercel `VERCEL_GIT_COMMIT_SHA` system environment variable;
3. GitHub `GITHUB_SHA` when applicable;
4. `git rev-parse HEAD` fallback;
5. `unknown` when no trustworthy full SHA can be resolved.

The marker contains no token, user identity, Supabase credential, or other secret.

## Automated Production Smoke sequence

For a successful `CI` workflow on `main`, `Production Smoke` uses:

```text
expected_commit = workflow_run.head_sha
```

Then it performs:

```text
main CI green
    ↓
GET /assets/build-meta.json
    ↓
Does gitCommitSha == expected_commit?
    ├─ no → wait 5 seconds and retry
    └─ yes → continue
    ↓
14 public GET checks
    ↓
validation event / feedback / waitlist POST smoke
```

The deployment wait is bounded:

```text
timeout: 120 seconds
poll interval: 5 seconds
```

If production never reports the exact expected SHA within the timeout, the workflow fails with a stale-deployment diagnostic. It must **not** continue to route or POST smoke against the old release.

This is intentionally fail-closed.

## Why no Vercel API token is needed

The smoke gate verifies the identity of the content actually served at the public production origin rather than trusting deployment-control metadata alone. Therefore GitHub Actions does not need a Vercel API token for this check.

Vercel deployment history remains useful operator evidence, but the public build marker is the release identity used by the automated smoke.

## Manual smoke

The CLI now requires an exact commit:

```bash
python3 scripts/smoke_production.py \
  --base-url https://ahaframe.com \
  --validation-endpoint https://swzddvprnyjrrgpzcsgp.supabase.co/functions/v1/validation-ingest \
  --expected-commit <FULL_40_CHAR_SHA> \
  --run-id manual-<id>
```

Optional tuning:

```text
--deployment-timeout-seconds 120
--deployment-poll-seconds 5
```

Do not bypass the release marker merely because Vercel reports `READY`: `READY` and exact production content identity are separate pieces of evidence.

## Regression contract

`scripts/test_production_release_marker.py` locks:

- build marker emission with a full SHA;
- immediate matching SHA success;
- stale SHA followed by matching SHA polling success;
- stale SHA timeout fails closed;
- workflow passes `workflow_run.head_sha` into the smoke CLI.

The existing bilingual route and Validation Alpha POST checks remain unchanged after the exact-commit gate passes.
