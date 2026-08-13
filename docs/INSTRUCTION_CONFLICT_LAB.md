# Instruction Conflict Lab

Date: 2026-08-13  
Status: implemented specification  
Layer: Prompt Engineering

## Product question

> When several pieces of text all sound like instructions, which ones are allowed to define behavior, and what still cannot be enforced by Prompt alone?

## Core mental model

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Evaluation proves whether the combined system is safe enough to release.
```

Prompt Engineering is therefore not a collection of phrasing tricks. It is the engineering of an instruction contract: authority, specificity, ambiguity, and output shape.

## Scenario

A refund-capable support agent sees five relevant sources:

```text
System policy
Developer instruction
Retrieved refund policy
User request
Refund tool capability
```

The baseline deliberately blurs responsibility:

- authority is effectively flat;
- the system policy is vague;
- retrieved evidence can behave like an instruction;
- policy ambiguity is unresolved;
- output is free form;
- the refund tool is still executable without an enforced approval boundary.

The learner can repair the first five items because they belong to Prompt / Prompt–Context boundary design.

The learner cannot repair the final capability boundary through Prompt controls. Once the Prompt layer is coherent, the Lab intentionally changes diagnosis to:

```text
PROMPT FIXED · HARNESS REQUIRED
```

Release evidence also remains explicitly `Not evaluated`.

## State

```js
{
  authorityModel: 'flat' | 'hierarchical',
  systemSpecificity: 'vague' | 'explicit',
  retrievedContentMode: 'instructional' | 'data-only',
  schemaMode: 'loose' | 'strict',
  policyAmbiguity: 'high' | 'resolved'
}
```

## Actions

```text
SET_AUTHORITY_MODEL
SET_SYSTEM_SPECIFICITY
SET_RETRIEVED_CONTENT_MODE
SET_SCHEMA_MODE
SET_POLICY_AMBIGUITY
APPLY_PROMPT_PRESET
```

## Derived signals

```text
Instruction Adherence
Ambiguity Risk
Policy Violation Risk
Output Validity
Prompt Quality
Unresolved Conflict Count
Harness Risk
Release Evidence
Failure Diagnosis
Next Layer
```

All values are deterministic educational quantities.

## Failure taxonomy

### `authority-conflict`

Application-owned instruction, retrieved text, and user requests are treated too similarly.

Primary layer: **Prompt**.

### `context-as-instruction`

Retrieved evidence is allowed to behave like an application instruction.

Boundary: **Prompt / Context**.

### `ambiguous-policy`

The highest-authority consequential constraint remains underspecified.

Primary layer: **Prompt**.

### `output-contract`

Behavior is better constrained but the result remains free form and hard to validate downstream.

Primary layer: **Prompt**.

### `harness-boundary`

Prompt conflicts are closed. The model now selects the safer intended behavior, but the runtime still exposes the underlying capability without enforcing the approval boundary.

Next layers: **Harness → Evaluation**.

This is an intentional teaching state, not a failed preset.

## Baseline

```text
Authority             flat
System specificity    vague
Retrieved content     instructional
Output schema         loose
Policy ambiguity      high
```

Expected properties:

- weak instruction adherence;
- material policy-violation risk;
- multiple unresolved conflicts;
- Prompt is the first diagnosis layer.

## Prompt-layer preset

```text
Authority             hierarchical
System specificity    explicit
Retrieved content     data-only
Output schema         strict
Policy ambiguity      resolved
```

Expected properties:

- high adherence;
- low ambiguity;
- low prompt-driven policy risk;
- strict output validity;
- zero Prompt conflicts;
- non-zero Harness risk;
- no invented release evidence.

The preset is successful only if it teaches:

> Better Prompt Engineering can improve intended behavior while still leaving a system unsafe to operate.

## Cross-layer boundaries

### Prompt vs Context

A retrieved document may contain imperative language. Its wording does not determine its authority. The application decides whether it is evidence or instruction.

### Prompt vs Harness

A sentence such as “require approval above $100” influences model behavior. It does not enforce tool permission. The Harness must make bypass impossible or detectable at the runtime boundary.

### Prompt vs Evaluation

A coherent prompt is not evidence that the system is release-ready. Representative evaluation is still required across model behavior, tools, safety, latency, cost, and failure modes.

## Non-goals

The v1 Lab does not:

- provide a prompt-template library;
- teach hidden chain-of-thought prompting;
- claim a universal instruction hierarchy for every provider;
- execute a live LLM;
- test real prompt-injection attacks;
- implement tool permissions;
- run production evaluation.

## Engine implications

No generic Engine extension is required.

The existing contract remains sufficient:

```text
Scenario
→ State
→ Action
→ Reducer
→ Derived Metrics
→ Adapter
```

The Lab uses checkpoint / compare to show that Prompt quality can improve substantially while Harness risk remains outside the Prompt layer.

## Exit criterion

A learner should be able to say:

> “I would first fix instruction authority and ambiguity in the Prompt layer, keep retrieved policy as Context, enforce irreversible actions in the Harness, and use Evaluation to prove the final system.”
