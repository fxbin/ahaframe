# AhaFrame v0.8 Content & Experience Preview Runbook

Status: **READY TO RUN**  
Execution issue: #92  
Parent: #83  
Precedes: #19 Validation Alpha

## 1. Purpose

Run a deliberately small **3–5 developer pre-Alpha preview** to answer one question before spending the formal Alpha cohort:

> Does the refreshed AhaFrame attract qualified engineers into a Mission, and does the experience feel like real AI-engineering practice rather than another article/course catalog?

This preview is not the Product Gate cohort and must not be interpreted as statistically representative.

The machine-readable contract is:

```text
content/content-preview-v0.8.json
```

## 2. Cohort isolation

Stable preview cohort:

```text
content-preview-2026-08
```

Canonical URLs:

```text
EN:    https://ahaframe.com/en/?cohort=content-preview-2026-08
ZH-CN: https://ahaframe.com/zh-cn/?cohort=content-preview-2026-08
```

Formal Alpha remains:

```text
alpha-2026-08
```

Never reuse `alpha-2026-08` for these preview sessions. Preview evidence may inform the #92 content decision, but it must not count as #19 Product Gate evidence.

## 3. Who to recruit

Recruit 3–5 participants who can judge the engineering experience:

- experienced software/backend engineers; or
- engineers actively building or learning LLM/Agent systems.

Prefer people who do not already know AhaFrame's intended six-layer story. Avoid selecting only close collaborators who have been exposed to the design rationale.

Do not broaden the audience merely to fill five seats.

## 4. What to send

Send only the relevant cohort URL and a neutral request to use the site naturally.

Do not explain:

- the six engineering layers;
- which Mission is the flagship;
- which Mission they should click first;
- what an Aha moment is supposed to be;
- what decision you hope to reach.

The first 10 seconds are part of the test.

## 5. Observation protocol

Observe without coaching:

1. Within about 10 seconds, what do they think AhaFrame is?
2. Which experience do they choose first?
3. Why did they choose it?
4. Do they start a Mission without prompting?
5. Once inside, do they inspect evidence before randomly changing controls?
6. Do they run, retry and compare attempts?
7. Can they explain the engineering trade-off afterwards in their own words?
8. Do they voluntarily open a second Mission or the Final Boss?

Do not rescue ordinary UX confusion too quickly. Confusion is evidence unless the product is technically broken.

## 6. Instrumentation contract

Discovery events introduced for #91:

```text
homepage_flagship_impression
homepage_flagship_click
```

Campaign Mission events:

```text
mission_started
simulation_run
release_decision_submitted
mission_completed
```

These events are supporting evidence for the preview. They do not replace direct observation, and #92 does not redefine formal Alpha metric formulas.

For each session, verify the participant entered with:

```text
cohortId = content-preview-2026-08
```

Do not create participant-specific cohort IDs.

## 7. Observer notes template

Keep notes outside public analytics and do not record participant names, emails, phone numbers, employer-sensitive details or other PII.

Use a disposable label such as `P1`, `P2`, etc.

```text
participant: P1
locale: en | zh-CN
session_started_at: <UTC ISO>

10-second interpretation:
<what they believe the product is>

first Mission:
<mission>

why first:
<reason>

started without prompt: yes | no
inspected evidence first: yes | no | mixed
ran/retried/compared: yes | no | mixed

trade-off explanation:
<their explanation in paraphrase; no PII>

second experience voluntarily opened: <mission | none>

confusion / boredom:
<notes>

fake-gamification signal:
<notes>

share intent:
<would they send a Mission to another engineer; which one and why>

requested incident:
<what production incident they want next>
```

## 8. Required questions after use

Ask every participant the same six questions:

1. Which Mission was most attractive before you tried it?
2. Which was most useful after you tried it?
3. Where were you confused or bored?
4. Did any interaction feel like fake gamification?
5. What production incident would you want AhaFrame to simulate next?
6. Would you send one of these Missions to another engineer? Which one?

Do not turn these into leading yes/no questions.

## 9. Attraction heuristics

Review qualitatively rather than manufacturing statistical certainty from N=3–5.

Strong signals include:

- a compelling Mission is found without explanation;
- incident stakes are understandable immediately;
- a clear majority voluntarily starts a Mission;
- multiple participants voluntarily explore a second experience or Final Boss;
- participants describe AhaFrame as a simulator, practice environment or engineering challenge rather than a generic AI tutorial/course.

The `3/5` and `2/5` heuristics in #92 are decision aids, not automatic pass/fail formulas.

## 10. Separate two problem classes

At review time, separate findings into:

### Attraction / discovery

Examples:

- homepage promise is unclear;
- Mission card stakes are weak;
- user cannot tell where to start;
- Final Boss progression is invisible;
- page feels like a catalog/course before interaction begins.

### Learning mechanics

Examples:

- evidence is hard to interpret;
- controls encourage random tweaking;
- causality between intervention and outcome is unclear;
- attempt comparison is weak;
- release decision feels cosmetic;
- challenge feels fake rather than production-grounded.

Do not solve a discovery problem by adding more curriculum, and do not solve a mechanics problem with more homepage copy.

## 11. During the preview

Freeze by default:

- cohort ID;
- Mission identity and event semantics;
- observation questions;
- formal Alpha metric definitions;
- major curriculum expansion.

Fix only P0/P1 technical failures that make evidence invalid. Record any material product change in #92 because sessions before and after the change may no longer be comparable.

## 12. Closeout

After 3–5 real sessions, summarize findings without participant PII.

The closeout must include:

- sessions completed;
- first-Mission choices;
- unprompted Mission starts;
- second-experience behavior;
- repeated attraction/discovery themes;
- repeated learning-mechanics themes;
- strongest Mission before use;
- most useful Mission after use;
- fake-gamification concerns;
- requested future incidents;
- evidence integrity caveats.

Record exactly one decision in #92:

```text
START ALPHA
```

or:

```text
ITERATE CONTENT AGAIN
```

If the decision is `ITERATE CONTENT AGAIN`, list only the smallest bounded changes required for another preview. Do not reopen unlimited curriculum expansion.

## 13. Alpha handoff rule

#19 must remain paused until all of the following are true:

1. #92 has 3–5 completed real sessions;
2. the qualitative summary is recorded;
3. the explicit decision is `START ALPHA`;
4. only then is the first real `alpha-2026-08` invitation sent and #19 moved to RUNNING.

The preview cohort and formal Alpha cohort remain separate throughout.
