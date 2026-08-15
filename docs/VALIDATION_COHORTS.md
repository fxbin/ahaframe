# AhaFrame Validation Cohort Contract

Status: M1 contract for #60 / #61.

## Purpose

A validation cohort groups anonymous product-evidence traffic for a deliberate experiment. It is **not** an account, user identity, authorization token, or marketing profile.

Example:

```text
https://ahaframe.com/zh-cn/?cohort=alpha-2026-08
```

## Runtime field

```text
cohortId
```

The value is included in:

- semantic validation events;
- Aha feedback payloads;
- validation waitlist payloads.

Production storage uses:

```text
cohort_id
```

on:

```text
validation_events
aha_feedback
validation_waitlist
```

## Naming contract

Cohort IDs must:

- be 1–80 characters;
- start with a lowercase ASCII letter or digit;
- contain only lowercase ASCII letters, digits, `.`, `_`, or `-`;
- contain no name, email, phone number, or other personal information.

Valid examples:

```text
alpha-2026-08
alpha-2026-08-direct
alpha-2026-08-reddit
experiment.rag-v1
```

Invalid examples:

```text
Alice
alice@example.com
alpha cohort
../admin
```

The browser and ingest endpoint both normalize to lowercase and reject/ignore values outside the naming contract.

## Persistence semantics

- The first valid cohort for a browser session is stored locally.
- Later sessions without a `cohort` query parameter retain the stored cohort.
- A later session entered with a new valid explicit `?cohort=...` may replace the current cohort attribution.
- Removing a query parameter does not erase the stored anonymous cohort.
- `anonymousUserId` remains independent from cohort membership.

This allows the same anonymous browser identity to participate in a later deliberate experiment without creating an account.

## Relationship to UTM and locale

These dimensions remain independent:

```text
cohortId     = experiment / validation group
locale       = presentation language
UTM fields   = acquisition attribution
anonymous ID = pseudonymous browser identity
```

Do not overload `utm_campaign` as the canonical product cohort dimension.

## Privacy boundary

Cohort attribution must not introduce:

- authentication;
- fingerprinting;
- precise location;
- participant names in analytics;
- email in ordinary analytics events;
- hidden durable identity beyond the existing anonymous browser identifier.

## Smoke/test traffic

Production smoke uses:

```text
cohortId = production-smoke
```

Decision read models should explicitly exclude `production-smoke` from product metrics.

## Operator rule

A cohort name should be created once before recruitment and reused consistently for the full measurement window. Do not rename a cohort mid-run; create a new cohort for a materially different experiment.