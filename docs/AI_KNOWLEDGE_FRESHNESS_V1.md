# AI Knowledge Graph v1.0 — Freshness Policy

Status: **current as of 2026-08-28**  
Issue: #145

## Principle

AhaFrame keeps durable engineering concepts vendor-neutral. A concept does not become version-sensitive merely because a current product is a useful example.

Use `versionSensitive: true` only when the learning claim materially depends on a moving protocol, SDK/tool behavior, deployment mechanism, or fast-changing implementation practice. Such concepts must reference at least one registered primary source and every source must define a `reviewAfter` trigger.

## 2026 review findings

### MCP

The canonical MCP reference is the stable **2026-07-28** specification release. The v1 inventory now teaches MCP as a stateless protocol core with explicit application state, header-addressable routing, cacheable discovery/list results, Multi Round-Trip Requests, an extensions framework, Tasks as an extension, and hardened authorization/deprecation semantics.

This supersedes the previous 2025-11-25 authoring references. The curriculum should not teach protocol sessions, the experimental core Tasks API, or deprecated Roots/Sampling/Logging behavior as timeless fundamentals.

Review trigger: any new stable MCP specification.

### Agent evaluation

Agent evaluation remains grounded in task/trial/grader/trace evidence and in the distinction between outcome and trajectory evaluation. The Jan 9, 2026 Anthropic engineering methodology remains a current primary reference for the version-sensitive evaluation-environment concept.

Review trigger: a material change to multi-turn/agent evaluation methodology, not routine provider product releases.

### Agentic coding and computer use

The stable canonical concepts remain specification, repository context, tests, review, bounded autonomy, visible-state grounding, sandboxing and permission boundaries. They are intentionally not named after Codex, Claude Code, Cursor or any single coding-agent product.

The sandbox/permission implementation concept is marked version-sensitive and uses OpenAI's May 8, 2026 Codex safety engineering write-up as one current operational reference for managed configuration, constrained execution, network policy, approvals and agent-native telemetry.

Review trigger: a material change in agent sandbox/approval architecture.

### Model engineering

Dataset-quality concepts remain durable. Adapter fine-tuning and inference/serving implementation guidance are version-sensitive because the practical PEFT, quantization and serving stack changes quickly. Current Hugging Face Transformers documentation is used as the implementation-level primary reference while the canonical concepts remain framework-neutral.

Review trigger: major changes to adapter/PEFT integration or production serving/quantization guidance.

## CI invariant

`scripts/build_ai_knowledge_graph_v1.py` validates freshness before materializing the canonical graph:

- every `versionSensitive` Concept has at least one `sourceRef`;
- every referenced source is registered;
- every referenced source uses HTTPS and has a `reviewAfter` policy;
- obsolete `mcp-2025-11-25*` references are rejected;
- the current MCP, agent-eval, PEFT and serving primary references must be exercised by the inventory.

Stable concepts are allowed—and preferred—to have no source reference when their meaning is durable and vendor-neutral.

## Current primary references

- Model Context Protocol, 2026-07-28 stable specification release: `https://blog.modelcontextprotocol.io/posts/2026-07-28/`
- Anthropic, *Demystifying evals for AI agents*, 2026-01-09: `https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents`
- OpenAI, *Running Codex safely at OpenAI*, 2026-05-08: `https://openai.com/index/running-codex-safely/`
- Hugging Face Transformers, Parameter-efficient fine-tuning: `https://huggingface.co/docs/transformers/peft`
- Hugging Face Transformers, Optimization overview: `https://huggingface.co/docs/transformers/optimization_overview`

These references inform coverage and freshness. AhaFrame's prose, scenarios, labs, decisions and mental models remain original.
