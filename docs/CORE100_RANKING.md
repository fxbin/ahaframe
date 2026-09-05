# Core-100 Ranking — after Core-80 Practice Reconciliation

## Decision

Core-100 is a **ranking decision**, not a publication event.

The next 20 Guide candidates are selected in two stages:

1. **Maximize the minimum canonical Path Guide coverage** with exactly 20 additions.
2. Inside the mathematically required Path quotas, choose the Concepts with the strongest combination of:
   - reconciled Practice proximity;
   - likely direct-search / retrieval value;
   - pedagogical distinctiveness;
   - continuity of the Course learning arc.

The published product remains Core-80 until a later implementation wave authors and validates bilingual Guides.

## Why coverage allocation comes first

At Core-80:

- 80/145 Concepts have Guides = 55.2%
- 143/208 Path–Concept memberships are Guide-backed = 68.8%
- all 15 Paths are reached
- the minimum Path Guide coverage is 60.0%

After Core-80, the remaining Concepts no longer provide useful cross-Path reuse for this 20-Guide allocation. Therefore the next bottleneck is Path balance rather than membership reuse.

With exactly 20 new Guides, the highest mathematically achievable minimum Path coverage is **72.7%**. Reaching that optimum consumes all 20 slots and determines the quota:

| Path | Core-80 | Core-100 quota | Projected | Coverage |
| --- | ---: | ---: | ---: | ---: |
| AI Foundations | 24/40 | +6 | 30/40 | 75.0% |
| Agent Engineering | 12/20 | +3 | 15/20 | 75.0% |
| RAG & Knowledge Systems | 10/16 | +2 | 12/16 | 75.0% |
| Production AI Reliability | 14/22 | +2 | 16/22 | **72.7%** |
| LLM Application Engineering | 9/14 | +2 | 11/14 | 78.6% |
| Vibe Coding & Agentic Software Engineering | 8/12 | +1 | 9/12 | 75.0% |
| Multi-Agent & Orchestration | 6/9 | +1 | 7/9 | 77.8% |
| Model Engineering | 6/9 | +1 | 7/9 | 77.8% |
| Create a Course or Knowledge Product with AI | 6/9 | +1 | 7/9 | 77.8% |
| Run a Solo Business with AI | 6/9 | +1 | 7/9 | 77.8% |
| Write a Book with AI | 9/11 | +0 | 9/11 | 81.8% |
| Research with AI | 8/10 | +0 | 8/10 | 80.0% |
| Build an AI Knowledge Base | 9/10 | +0 | 9/10 | 90.0% |
| Data Analysis with AI | 6/7 | +0 | 6/7 | 85.7% |
| AI Customer Support | 10/10 | +0 | 10/10 | 100.0% |

Allocating a Core-100 slot to one of the five already-high Paths would necessarily prevent another lower Path from reaching the optimal floor.

## Frozen candidate set

### AI Foundations — +6

1. `concept-attention-budget`
   - Large context windows do not remove attention scarcity.
   - Bridges Context Window to Context Relevance and later Context Engineering.
   - Strong direct lookup value.

2. `concept-instruction-authority`
   - Existing Instruction Conflict Practice directly exercises source-aware authority.
   - Provides a stable model for system/developer/context/user precedence.

3. `concept-instruction-conflict`
   - Existing Practice makes conflicting instruction sources observable.
   - Distinct from merely writing a more specific prompt.

4. `concept-prompt-context-runtime-boundary`
   - A core AhaFrame mental model: prompt/model persuasion is not runtime enforcement.
   - Existing Instruction Conflict / Prompt Injection interaction already demonstrates this boundary.

5. `concept-reasoning-budget`
   - Treats reasoning effort as an engineering quality/latency/cost budget.
   - More actionable for production decisions than a generic explanation of hidden reasoning.

6. `concept-capability-vs-guarantee`
   - A model can be capable of a behavior without guaranteeing it reliably.
   - Transfers to evaluation, agents, RAG and production reliability.

Deferred here: sequence ordering, multimodal representation, modality grounding, examples-shape-behavior, prompt specificity, planning-as-search, reasoning opacity, distribution shift, bias/fairness and human accountability. They remain valid Concepts, but the selected six create more transferable engineering boundaries, stronger current Practice adjacency, or higher direct retrieval value.

### Vibe Coding & Agentic Software Engineering — +1

`concept-ai-code-review`

The shipped AI Code Review Mission already turns generated code into an evidence-backed merge decision. It outranks repository context, plan-before-code and dependency/migration verification for this single slot because it has exact Practice adjacency and completes the generate → test → review loop.

### LLM Application Engineering — +2

1. `concept-conversation-state`
   - Separates application state from raw context and model memory.
   - Essential for robust multi-turn product behavior.

2. `concept-model-routing-fallback`
   - Connects model selection to resilience, cost and graceful degradation.
   - Strong direct-search value and production relevance.

Deferred: context structure/cache, prompt caching and API rate-limit resilience. These matter, but they are narrower operational optimizations than state ownership and routing/fallback architecture.

### RAG & Knowledge Systems — +2

1. `concept-evidence-granularity`
   - Broken RAG Pipeline already exposes chunk size and overlap as decision variables.
   - Gives the mental model behind chunking instead of treating chunk sizes as magic constants.

2. `concept-memory-authority-conflict`
   - Closes the next memory-lifecycle gap: what wins when durable memory conflicts with fresher or more authoritative evidence?

Deferred: metadata retrieval, user/domain memory, knowledge-graph structure and hybrid structured/unstructured search. They are narrower extensions after granularity and authority are understood.

### Agent Engineering — +3

1. `concept-mcp-boundaries`
2. `concept-mcp-capability-negotiation`
3. `concept-interrupt-cancel`

All three have exact existing Mission adjacency. MCP Boundaries and Capability Negotiation are exercised by the MCP Capability Boundary Mission; Interrupt/Cancel is exercised by Long-Running Agent Recovery. They outrank MCP tasks/elicitation, planning-vs-direct, environment observation, action grounding and sandbox permissions because those alternatives currently have weaker Practice evidence or are more specialized.

### Multi-Agent & Orchestration — +1

`concept-loop-vs-graph`

Agent Workflow Graph already exercises loop/graph topology, delegation, parallelism and verification. Loop-vs-graph is selected over delegation state and independent verification because it is the upstream decision: if a loop is sufficient, the learner should not pay coordination complexity at all.

### Production AI Reliability — +2

1. `concept-runtime-enforcement`
   - Prompt Injection Attack demonstrates that model persuasion cannot replace scoped tools, approval and runtime gates.

2. `concept-ship-block-inconclusive`
   - Evaluation Failure already produces SHIP / BLOCK / INCONCLUSIVE consequences.
   - Makes evidence synthesis and veto logic explicit before release decisions.

Deferred: compensation/recovery, outcome/trajectory evaluation, release economics, failure attribution, cross-layer architecture and queue/backpressure. Compensation and release economics already have Practice evidence, but they are narrower than the two selected production-wide decision boundaries.

### Model Engineering — +1

`concept-adapter-finetuning`

Model Adaptation Decision already compares LoRA, QLoRA and full fine-tuning. Adapter fine-tuning combines high direct-search demand with a bounded engineering decision. Fine-tune dataset design and inference serving remain natural follow-ons.

### Create a Course or Knowledge Product with AI — +1

`concept-curriculum-decomposition`

The existing Build already exercises curriculum decomposition. It is upstream of media review and publishing and therefore creates the largest continuity gain between learning objectives and generated assets.

### Run a Solo Business with AI — +1

`concept-automation-maintenance`

The Solo Business Build explicitly exposes maintenance burden. This is more AhaFrame-specific than generic customer research or content marketing and prevents the common trap where nominal automation leverage creates a larger exception/upkeep surface.

## Practice proximity after reconciliation

**14 of the 20 selected Concepts already have exact same-Path Practice evidence.**

Practice-backed selections:

- instruction authority
- instruction conflict
- prompt/context/runtime boundary
- AI code review
- evidence granularity
- MCP boundaries
- MCP capability negotiation
- interrupt/cancel
- loop vs graph
- runtime enforcement
- SHIP/BLOCK/INCONCLUSIVE
- adapter fine-tuning
- curriculum decomposition
- automation maintenance

The other six are selected because they close high-value conceptual discontinuities even without a current dedicated interaction:

- attention budget
- reasoning budget
- capability vs guarantee
- conversation state
- model routing/fallback
- memory authority conflict

This distinction matters: **Practice proximity is a ranking signal, not a requirement that every Guide have its own unique Practice runtime.**

## Projected Core-100 state

If the candidate set is later authored and published:

- Guide Concepts: **100/145 = 69.0%**
- Guide-backed Path–Concept memberships: **163/208 = 78.4%**
- Path reach: **15/15**
- minimum Path coverage: **72.7%**
- selected Concepts with same-Path existing Practice evidence: **14/20**

The five Paths already above the Core-100 floor receive no slot in this wave; this is deliberate balance, not a statement that their remaining Concepts are low value.

## What #198 does not authorize

This ranking does **not** automatically authorize:

- publishing Core-100 Guides;
- creating new Labs/Missions;
- changing Course ordering;
- activating Billing/free-choice;
- turning every remaining Concept into long-form content.

A later implementation wave can author these 20 Guides with the existing bilingual Guide contract. After that, #199 should intentionally classify the remaining Concepts as full Guide, concise canonical explanation, primarily Practice/Course-taught, or merge/deprecate candidate.

## Reproduce the ranking contract

```bash
python3 scripts/core100_ranking.py
python3 scripts/core100_ranking.py --json
python3 scripts/core100_ranking.py --check
```

The validator recomputes the maximum floor and required quotas from the canonical graph, validates that selected/deferred candidates partition every remaining Concept in quota Paths, and derives Practice proximity from the merged reconciliation evidence rather than trusting authored labels.
