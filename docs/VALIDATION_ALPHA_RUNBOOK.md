# AhaFrame Validation Alpha Runbook

Status: **READY TO RECRUIT**  
Execution issue: #19  
Evidence Epic: #60  
Final Product Gate: #64 M4B

## 1. Experiment goal

Run the first deliberately recruited AhaFrame Validation Alpha with approximately **20–30 qualified software developers moving toward AI engineering**.

The experiment answers:

> Does the existing AhaFrame product create enough meaningful product value to justify the next phase?

It does **not** answer whether the team is capable of building Auth, Billing, Entitlement or a larger SaaS platform.

## 2. Cohort identity

Stable cohort ID:

```text
alpha-2026-08
```

Canonical invite URLs:

```text
EN:    https://ahaframe.com/en/?cohort=alpha-2026-08
ZH-CN: https://ahaframe.com/zh-cn/?cohort=alpha-2026-08
```

Cohort attribution is experiment context, not participant identity. No account is required.

Do not create a different cohort ID for each acquisition channel. Source, locale and UTM are separate dimensions.

## 3. Who to recruit

Prefer developers who can meaningfully judge the product:

- professional or serious software-development experience;
- currently learning, evaluating or building toward AI engineering;
- able to interact with technical concepts such as context, RAG, agents or evaluation;
- not selected only because they are friends willing to say something positive.

The cohort does not need to be statistically representative of all developers. It does need to be qualified enough that feedback about the product's technical learning value is interpretable.

Target:

```text
20–30 qualified participants
```

Do not broaden recruitment merely to hit a traffic number.

## 4. Recruitment channels

This is a deliberately recruited Alpha, not a public launch.

Suitable bounded channels may include:

- direct outreach to developer contacts;
- small developer/AI communities where targeted invitations are acceptable;
- previous colleagues or interview-network developers who match the cohort definition;
- focused X/LinkedIn/GitHub outreach to individuals rather than broad launch posts.

Avoid Product Hunt / Hacker News / broad Reddit launch as the primary Alpha mechanism. Those may become later acquisition experiments after the first product-value decision.

## 5. Invite message principle

Keep the invitation neutral. Do not prime participants to report an Aha moment or tell them which Lab should be impressive.

Suggested structure:

```text
I'm testing an interactive AI-engineering learning product for software developers.

Please use it naturally for 10–20 minutes. There is no signup requirement and no required Lab order.

I'm primarily interested in where the product becomes useful, confusing, or not worth continuing.

<cohort URL>
```

Do not promise payment features, account sync or future Labs that are not currently shipped.

## 6. Start the cohort deliberately

Before sending the first invite, record:

```text
cohort_id:    alpha-2026-08
started_at:   <UTC ISO timestamp>
target_size:  20–30
operator:     fxbin
```

Record the start timestamp in #19. This timestamp becomes the default lower bound for final M3/M4 evidence.

Do not count earlier anonymous production traffic as cohort evidence unless it carries the exact cohort ID.

## 7. Participant instructions

Participants should:

- enter through the tracked cohort URL;
- use AhaFrame naturally;
- choose the Labs/paths that interest them;
- interact rather than only scan pages;
- answer Aha feedback when it appears if they are willing;
- return later only if they naturally want to.

Do **not** force:

- a fixed Lab order;
- every participant to complete the Integrated Build;
- a minimum number of Labs;
- a positive Aha response;
- a pricing visit;
- a return visit.

Forced behavior destroys the meaning of continuation and demand signals.

## 8. What is measured

Canonical Product Gate metrics come from M2, not ad-hoc SQL:

```text
validation_product_metrics_v1(...)
```

Primary evidence:

- cohort visitors;
- Landing → Lab Start;
- Meaningful Interaction;
- failure/trade-off exposure;
- Strong Aha with response counts;
- second Lab / second engineering layer;
- ≥2 meaningful Labs;
- Integrated Build start/completion;
- any return and D7 return;
- pricing visits;
- paid/founding intent;
- waitlist conversion;
- strongest/weakest Lab/layer;
- locale/source mix where sample size is interpretable.

Interpretation constraints:

- `meaningful_interaction` and `failure_tradeoff_observed` are currently structurally coupled; do not count them as two independent wins.
- `Want more Labs` is currently **not directly measurable**. Treat it as a qualitative question until a stable semantic signal exists.
- Strong Aha is self-reported product evidence, not academic efficacy.
- smoke/test cohorts are excluded from Product Gate evidence.

## 9. Monitoring during the run

Use the M3 operator report periodically, for example:

```bash
python3 scripts/validation_report.py \
  --cohort alpha-2026-08 \
  --from <COHORT_START_ISO> \
  --to <CURRENT_TIME_ISO> \
  --env-file .env.local
```

Monitoring is for:

- evidence/data-health integrity;
- discovering P0/P1 failures;
- reviewing qualitative confusion themes;
- confirming recruitment is reaching the intended cohort.

Monitoring is **not** permission to optimize the product every day against interim metrics.

Do not change thresholds, metric formulas or instrumentation naming because an early percentage looks disappointing.

## 10. Freeze rule

During the active cohort, freeze by default:

- Product Gate metric definitions;
- event semantics;
- Lab mechanics;
- pricing hypothesis presentation;
- major page hierarchy;
- cohort ID;
- Aha rating semantics.

Also avoid adding new Labs simply because a participant requests one.

Minor copy/style fixes that cannot materially change behavior may be considered only when necessary, but should be documented in #19.

## 11. P0 / P1 stop rules

### P0 — stop Alpha immediately

Examples:

- broad public-site outage;
- production evidence corruption or pollution;
- security/privacy boundary failure;
- schema/migration failure threatening evidence integrity;
- a release where production identity cannot be verified.

Action:

```text
stop invitations
→ investigate/fix
→ exact-commit Production Smoke green
→ assess whether existing cohort evidence remains valid
→ resume or restart deliberately
```

### P1 — pause new invitations

Examples:

- validation ingest unavailable;
- a critical Lab or Integrated Build flow is broken enough that users generate misleading evidence;
- Aha feedback/waitlist claims success without durable persistence.

Resume only after the affected path is fixed and production verification is green.

Ordinary UX friction or an individual participant disliking the product is **not** a P0/P1 incident; that is evidence.

## 12. Production release rule during Alpha

Every production change must retain the exact-commit release gate:

```text
main CI green
→ ahaframe.com build-meta SHA == triggering main SHA
→ 14 GET smoke
→ event / feedback / waitlist POST smoke
```

Do not interpret a Vercel `READY` state alone as evidence that the expected release is live.

If a non-critical code change can wait until the cohort closes, prefer waiting.

## 13. Qualitative review

Use M3 locally to review notes. Do not copy participant anonymous IDs into analysis memos.

Look for recurring themes such as:

- which mental model changed;
- where causality became clearer;
- what remained confusing;
- why a participant stopped;
- whether they want to use another Lab later;
- whether save/sync/account/cross-device capability is genuinely desired;
- whether they would pay for additional value and why.

Explicitly capture evidence that contradicts the story you prefer.

## 14. D7 timing

Do not finalize D7 retention while most participants have not yet had seven full days to return.

The M2 definition only treats eligible participants as the D7 denominator. Final Product Gate review should wait until a meaningful portion of the cohort has matured or explicitly record that D7 evidence is incomplete.

Do not keep the cohort open indefinitely merely to improve D7.

## 15. Close the cohort deliberately

When recruitment and the observation window are complete, record in #19:

```text
ended_at:             <UTC ISO timestamp>
participants/reach:   <operator summary>
material incidents:   <none or references>
metric-contract drift:<none or documented exception>
```

After `ended_at`, stop treating later activity as part of this cohort window even if users still have the cohort persisted locally. The final M3/M4 commands must use the explicit start/end timestamps.

## 16. Final M3 evidence report

Generate the final operator report for the exact cohort window:

```bash
python3 scripts/validation_report.py \
  --cohort alpha-2026-08 \
  --from <COHORT_START_ISO> \
  --to <COHORT_END_ISO> \
  --env-file .env.local
```

Confirm:

- no unresolved Data Health ERROR;
- smoke/test exclusion PASS;
- metric denominators are interpretable;
- low sample warnings are visible;
- qualitative queue has no participant IDs.

## 17. M4B Product Gate memo

Generate a versioned memo draft:

```bash
python3 scripts/product_gate_memo.py \
  --cohort alpha-2026-08 \
  --from <COHORT_START_ISO> \
  --to <COHORT_END_ISO> \
  --version 1 \
  --env-file .env.local
```

Then review the M3 report and fill the memo's qualitative synthesis, contradictory evidence, platform demand, reasons-against-alternatives, next-phase plan and sign-off.

Choose exactly one:

```text
GO PLATFORM
VALIDATE AGAIN
REFRAME
CONTENT / BRAND ASSET
STOP
```

The generator never chooses automatically.

## 18. GO PLATFORM bar

`GO PLATFORM` is not “the current site works.” It should normally require a credible combination of:

- clear product-value / Strong Aha evidence with sufficient responses;
- cross-Lab / cross-layer continuation;
- return/future-use intent;
- credible paid/waitlist/additional-value demand;
- no unresolved evidence-integrity/trust issue;
- observed demand that Auth/save/sync/Entitlement would actually solve.

If users like the content but do not demonstrate platform demand, `CONTENT / BRAND ASSET` or another decision may be more accurate than `GO PLATFORM`.

## 19. After the decision

Only a reviewed `GO PLATFORM` resumes the conditional platform path:

```text
Next.js production cutover
Auth / identity
cross-device progress
Entitlement
Waffo
Credits when real compute exists
Live Mode / public beta later
```

Other decisions must produce their own bounded next plan rather than silently resuming platform work.
