# GitHub Actions Governance

Status: execution contract for #71 and repository merge-gate policy for `main`.

## Goal

AhaFrame uses high-frequency AI-assisted development. GitHub Actions should validate meaningful integration boundaries without running duplicate pipelines for every intermediate branch commit.

The execution model is:

```text
Local / agent checks
        ↓
PR Gate
        ↓
Main Gate
        ↓
Production Gate
```

## PR Gate

`CI` runs for pull requests targeting `main`.

The merge-relevant required checks are the two stable CI job names:

- `validate`
- `validation-read-models`

Both jobs must complete successfully before a pull request is merged into `main`.

Feature-branch `push` events do not run `CI` automatically. Before opening a PR, developers/agents should run bounded local checks. A draft PR can be opened when shared CI evidence is needed.

A newer PR head supersedes older validation evidence. Merge decisions must be made against the current PR head SHA, not a previously green commit.

## Repository protection contract

GitHub repository settings for `main` should enforce the PR Gate rather than relying on convention alone.

Required repository-side rules:

- require a pull request before merging into `main`;
- require `validate` to pass;
- require `validation-read-models` to pass;
- do not require a reviewer approval count for the current solo-maintainer workflow;
- do not allow force pushes to `main`;
- do not allow deletion of `main`;
- avoid bypassing the required checks for normal merges or direct pushes.

`Production Smoke` is deliberately **not** a pre-merge required check. It is post-merge production evidence and runs only after successful `main` CI.

The removed `Localization Release QA` workflow is also **not** a required check. Its historical release documentation remains useful, but the workflow itself no longer exists in the current `.github/workflows` surface.

CI configuration alone cannot prevent a direct push. The repository protection rule is therefore part of the release contract, not an optional UI preference.

## Main Gate

Every push to `main` runs `CI` against the exact merged commit.

Main is intentionally not path-filtered: merged production candidates retain a complete repository-level verification record.

The `main` CI run is post-merge evidence. It does not replace the pre-merge PR requirement or the two required PR checks.

## Production Gate

`Production Smoke` runs only after a completed `CI` workflow whose source branch is `main`, and only executes the smoke job when that CI conclusion is `success`.

This prevents feature-branch CI from creating no-op/skipped Production Smoke workflow runs.

Manual `workflow_dispatch` remains available for controlled production smoke reruns.

## Required-check stability

Branch protection must reference check names that are present on every PR targeting `main`.

For the current workflow, the protected check names are the job names `validate` and `validation-read-models`. Renaming or conditionally omitting either job is a repository-governance change because it can leave protected PRs unmergeable or silently weaken the gate.

If a future heavyweight test should run conditionally, keep a stable required check present and move conditional logic inside that check rather than path-filtering the required workflow away.

## Cost-control rules

- batch related repository writes into one coherent commit when practical;
- avoid using remote CI as a substitute for tight local edit/test loops;
- open a PR when shared integration evidence is useful, not for every intermediate edit;
- do not push a sequence of one-file commits solely to discover obvious syntax errors;
- allow a newer PR head to supersede obsolete in-progress validation;
- do not weaken main or production evidence solely to save runner minutes.

## Invariants

- every PR targeting `main` receives `CI`;
- every PR targeting `main` receives both `validate` and `validation-read-models`;
- `main` is merged through a pull request rather than normal direct pushes;
- required checks are evaluated against the current PR head;
- every merge to `main` receives `CI` again on the exact merge commit;
- Production Smoke runs only from successful main CI or explicit manual dispatch;
- production evidence remains tied to an exact commit SHA.
