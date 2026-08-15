# AhaFrame Product Gate Decision Memo

Status: M4 decision process for #64  
Depends on: M2 read models (#62) + M3 Validation Console (#63)

## Purpose

The Product Gate memo converts reproducible Validation Alpha evidence into a deliberate reviewed product decision.

It is **not** an automatic scoring system. Numeric targets remain internal hypotheses. The final decision must be explicitly reviewed by the operator after reading quantitative evidence, contradictory qualitative evidence, data-health caveats, and observed product demand.

Choose exactly one final decision:

```text
GO PLATFORM
VALIDATE AGAIN
REFRAME
CONTENT / BRAND ASSET
STOP
```

## Two-phase lifecycle

### M4A — before recruitment

Before #19 starts, AhaFrame must have:

- a versioned memo template;
- an operator command that pre-fills reproducible M2/M3 evidence;
- explicit data-health and smoke-exclusion checks;
- a qualitative review section;
- a platform-demand review section;
- a fixed five-decision set;
- a required reasons-against-alternatives section;
- a required next-phase plan and operator sign-off.

M4A does **not** choose a decision. #64 remains open.

### M4B — after the Alpha cohort closes

After #19 closes its cohort window:

1. regenerate the memo with the final cohort/time window;
2. open the corresponding M3 Validation Console report;
3. review strong and weak Aha notes, contradictions, UX friction, and platform demand;
4. choose exactly one Product Gate decision;
5. explain why the alternatives were rejected;
6. define the next-phase plan tied to the decision;
7. record operator/review date;
8. preserve the final versioned memo as the Product Gate evidence record;
9. close #64 only after this final review is complete.

This avoids the circular mistake of requiring a final cohort decision before the cohort has actually run.

## Generate a memo draft

Production/operator mode:

```bash
python3 scripts/product_gate_memo.py \
  --cohort alpha-2026-08 \
  --days 14 \
  --env-file .env.local
```

For an exact final cohort window:

```bash
python3 scripts/product_gate_memo.py \
  --cohort alpha-2026-08 \
  --from 2026-08-15T00:00:00Z \
  --to 2026-08-29T00:00:00Z \
  --version 1
```

Offline/fixture mode:

```bash
python3 scripts/product_gate_memo.py \
  --cohort alpha-fixture \
  --from 2026-08-01T00:00:00Z \
  --to 2026-08-12T00:00:00Z \
  --fixture scripts/fixtures/validation_console_fixture.json
```

Default output:

```text
.artifacts/product-gate/<cohort>-<window-end>-decision-memo-v<version>.md
```

Generated memo drafts are operator artifacts and are gitignored by default.

## Source-of-truth rule

`product_gate_memo.py` does not implement Product Gate SQL or redefine metric formulas.

It reuses the same evidence path as the M3 Console:

```text
validation_product_metrics_v1
+ M2 fact/quality views
        ↓
validation_report.EvidenceBundle
        ↓
validation_report.build_model()
        ↓
product_gate_memo.py
```

If a Product Gate metric changes, update the M2 metric contract first. Do not patch the memo generator to make its numbers disagree with the Validation Console.

## Evidence readiness is not a decision

The memo may label the evidence state as:

```text
NO COHORT EVIDENCE
EARLY / LOW SAMPLE
REVIEWABLE
BLOCKED — DATA HEALTH ERROR
BLOCKED — SMOKE EXCLUSION FAILURE
```

These labels describe whether the evidence is safe/mature enough to review. They do **not** select one of the five Product Gate decisions.

Likewise, `AT / ABOVE` and `BELOW` only compare a metric with an internal target hypothesis. They must never auto-select `GO PLATFORM`, `STOP`, or any other business decision.

## GO PLATFORM review bar

A `GO PLATFORM` decision should normally require a credible combination of:

- meaningful Aha evidence with response counts;
- continuation across Labs / engineering layers;
- return or future-use intent;
- credible paid, founding, waitlist, or more-Labs demand;
- no unresolved evidence-integrity/trust problem;
- observed demand for account/save/sync/cross-device behavior;
- a reason to resume platform work that is stronger than “the platform would be more complete.”

Current `Want more Labs` remains **not directly measurable** in the semantic event contract. Do not infer it from unrelated CTA traffic.

## Qualitative boundary

The memo intentionally includes **counts and synthesis placeholders**, not raw participant note text.

The operator should use the M3 report to review raw qualitative evidence locally, then summarize recurring themes into the final memo without copying participant identifiers.

The memo must explicitly include contradictory evidence. Do not write a one-sided justification after deciding what you want the answer to be.

## Platform feature gate

Auth, Billing, Entitlement, Credits, cross-device durable progress, and full Next.js production migration remain paused unless the final Product Gate decision supports `GO PLATFORM`.

A successful engineering implementation of those features is not itself evidence that users need them.

## Tests

```bash
python3 scripts/test_product_gate_memo.py
```

The regression proves:

- M3/M2 evidence is reused rather than redefined;
- target comparisons do not auto-select a decision;
- all five decisions remain explicit and unchecked in a generated draft;
- the memo does not copy raw qualitative note text;
- no service-role or anonymous participant identifier is rendered;
- Data Health and smoke exclusion remain visible;
- output is deterministic and versioned.
