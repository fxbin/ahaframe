# GitHub Actions Governance

Status: execution contract for #71.

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

`CI` and `Localization Release QA` run for pull requests targeting `main`.

Feature-branch `push` events do not run these workflows automatically. Before opening a PR, developers/agents should run bounded local checks. A draft PR can be opened when shared CI evidence is needed.

When a newer commit is pushed to the same PR, `concurrency.cancel-in-progress` cancels obsolete CI/Localization runs for that PR.

## Main Gate

Every push to `main` runs `CI` and `Localization Release QA` against the exact merged commit.

Main is intentionally not path-filtered: merged production candidates retain a complete repository-level verification record.

## Production Gate

`Production Smoke` runs only after a completed `CI` workflow whose source branch is `main`, and only executes the smoke job when that CI conclusion is `success`.

This prevents feature-branch CI from creating no-op/skipped Production Smoke workflow runs.

Manual `workflow_dispatch` remains available for controlled production smoke reruns.

## Why Localization QA is not path-filtered yet

A workflow skipped by branch/path filtering can leave a required check pending, depending on repository protection configuration. Until the required-check contract is explicit and tested, the first governance pass prefers one predictable Localization QA run per PR/main head over risky path-level workflow suppression.

If runner usage remains material after duplicate-run elimination, a later change may keep the workflow/check present while conditionally skipping heavyweight jobs or steps based on a trusted change classifier.

## Cost-control rules

- batch related repository writes into one coherent commit when practical;
- avoid using remote CI as a substitute for tight local edit/test loops;
- open a PR when shared integration evidence is useful, not for every intermediate edit;
- do not push a sequence of one-file commits solely to discover obvious syntax errors;
- allow a newer PR head to supersede obsolete in-progress validation;
- do not weaken main or production evidence solely to save runner minutes.

## Invariants

- every PR targeting `main` receives `CI`;
- every PR targeting `main` receives Localization Release QA;
- every merge to `main` receives both gates again on the exact merge commit;
- Production Smoke runs only from successful main CI or explicit manual dispatch;
- production evidence remains tied to an exact commit SHA.
