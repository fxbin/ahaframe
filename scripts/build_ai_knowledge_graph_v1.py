#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
INVENTORY = CONTENT / "ai-knowledge-inventory-v1.0"
GRAPH_FILE = CONTENT / "ai-knowledge-graph-v1.0.json"
CONCISE_FILE = CONTENT / "ai-knowledge-concise-v1.0.json"
AUTHORED_CONCISE_FILE = CONTENT / "ai-knowledge-concise-authored-v1.0.json"
LOCALE_FILES = {
    "en": CONTENT / "ai-knowledge-graph-v1.0.en.json",
    "zh-CN": CONTENT / "ai-knowledge-graph-v1.0.zh-CN.json",
}
FIELDS = ("summary", "mentalModel", "whyItMatters")

CURRENT_SOURCES = {
    "mcp-2026-07-28-spec": {
        "url": "https://blog.modelcontextprotocol.io/posts/2026-07-28/",
        "kind": "protocol-release",
        "reviewAfter": "new-stable-mcp-specification",
    },
    "anthropic-agent-evals-2026-01-09": {
        "url": "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents",
        "kind": "methodology-reference",
        "reviewAfter": "material-agent-eval-methodology-change",
    },
    "openai-codex-safety-2026-05-08": {
        "url": "https://openai.com/index/running-codex-safely/",
        "kind": "agentic-coding-operations-reference",
        "reviewAfter": "material-agentic-coding-sandbox-or-approval-change",
    },
    "hf-transformers-peft-current": {
        "url": "https://huggingface.co/docs/transformers/peft",
        "kind": "model-engineering-reference",
        "reviewAfter": "major-peft-or-transformers-adapter-change",
    },
    "hf-peft-quantization-current": {
        "url": "https://huggingface.co/docs/peft/developer_guides/quantization",
        "kind": "model-engineering-reference",
        "reviewAfter": "major-quantized-peft-or-qlora-guidance-change",
    },
    "hf-transformers-serving-current": {
        "url": "https://huggingface.co/docs/transformers/main/optimization_overview",
        "kind": "model-serving-reference",
        "reviewAfter": "major-serving-or-quantization-guidance-change",
    },
    "vllm-lora-serving-current": {
        "url": "https://docs.vllm.ai/en/latest/api/vllm/entrypoints/serve/lora/",
        "kind": "model-serving-reference",
        "reviewAfter": "major-vllm-lora-serving-change",
    },
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def suffix(value: str, prefix: str) -> str:
    return value[len(prefix):] if value.startswith(prefix) else value


def load_inventory():
    branches, concepts, edges, paths = [], [], [], []
    for path in sorted(INVENTORY.glob("*.json")):
        data = load(path)
        if data.get("version") != "1.0.0":
            raise ValueError(f"inventory version mismatch: {path}")
        branches.extend(data.get("branches", []))
        concepts.extend(data.get("concepts", []))
        edges.extend(data.get("edges", []))
        paths.extend(data.get("paths", []))
    return branches, concepts, edges, paths


def validate_freshness(concepts, source_refs):
    obsolete_prefixes = ("mcp-2025-11-25",)
    referenced = set()
    for concept in concepts:
        refs = concept.get("sourceRefs", [])
        if concept.get("versionSensitive") and not refs:
            raise ValueError(f"version-sensitive concept has no sourceRefs: {concept['id']}")
        for ref in refs:
            if ref.startswith(obsolete_prefixes):
                raise ValueError(f"obsolete source reference on {concept['id']}: {ref}")
            if ref not in source_refs:
                raise ValueError(f"unknown source reference on {concept['id']}: {ref}")
            referenced.add(ref)
    for ref in referenced:
        source = source_refs[ref]
        if not source.get("url", "").startswith("https://"):
            raise ValueError(f"source must use https: {ref}")
        if not source.get("reviewAfter"):
            raise ValueError(f"source missing reviewAfter policy: {ref}")
    required_current = {
        "mcp-2026-07-28-spec",
        "anthropic-agent-evals-2026-01-09",
        "hf-transformers-peft-current",
        "hf-peft-quantization-current",
        "hf-transformers-serving-current",
        "vllm-lora-serving-current",
    }
    missing = required_current - referenced
    if missing:
        raise ValueError(f"current primary references are not exercised by version-sensitive concepts: {sorted(missing)}")


def validate_copy(concept_id: str, by_locale: dict):
    if set(by_locale) != set(LOCALE_FILES):
        raise ValueError(f"authored concise locale parity drifted: {concept_id}")
    for locale in LOCALE_FILES:
        copy = by_locale[locale]
        if set(copy) != set(FIELDS):
            raise ValueError(f"authored concise fields drifted: {locale}/{concept_id}")
        for field in FIELDS:
            value = copy[field]
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"authored concise copy missing: {locale}/{concept_id}/{field}")
            if "{title}" in value or "TODO" in value or "TBD" in value:
                raise ValueError(f"authored concise placeholder is forbidden: {locale}/{concept_id}/{field}")


def load_authored_concise(concise_policy: dict, manifest: dict, concepts: list[dict]) -> dict[str, dict]:
    if manifest.get("version") != "1.0.0":
        raise ValueError("authored concise manifest version mismatch")
    if manifest.get("expectedConceptCount") != len(concepts):
        raise ValueError("authored concise expected count does not match canonical inventory")
    if manifest.get("publishedGuideConceptCount") != 120 or manifest.get("residualConceptCount") != 25:
        raise ValueError("authored concise Guide/residual counts drifted")
    policy = manifest.get("policy", {})
    if policy.get("allConceptsRequireAuthoredCopy") is not True:
        raise ValueError("all canonical Concepts must require authored concise copy")
    if policy.get("publishedGenericFallbackAllowed") is not False:
        raise ValueError("published generic concise fallback must stay disabled")
    if policy.get("guideIsOptionalEnrichment") is not True or policy.get("relatedConceptsRemainGraphDerived") is not True:
        raise ValueError("authored concise architecture policy drifted")
    if manifest.get("residualSource") != "ai-knowledge-concise-v1.0.json#overrides":
        raise ValueError("authored concise residual source drifted")

    canonical_ids = {item["id"] for item in concepts}
    authored: dict[str, dict] = {}
    core_count = 0
    for relative in manifest.get("guideBackedFragments", []):
        fragment = load(CONTENT / relative)
        if fragment.get("version") != "1.0.0":
            raise ValueError(f"authored concise fragment version drifted: {relative}")
        entries = fragment.get("concepts", {})
        if len(entries) != 20:
            raise ValueError(f"authored concise fragment must contain exactly 20 Concepts: {relative}")
        for concept_id, by_locale in entries.items():
            if concept_id in authored:
                raise ValueError(f"duplicate authored concise Concept: {concept_id}")
            validate_copy(concept_id, by_locale)
            authored[concept_id] = by_locale
            core_count += 1
    if core_count != manifest["publishedGuideConceptCount"]:
        raise ValueError(f"authored concise Guide-backed count drifted: {core_count}")

    residual = concise_policy.get("overrides", {})
    if len(residual) != manifest["residualConceptCount"]:
        raise ValueError(f"authored concise residual count drifted: {len(residual)}")
    for concept_id, by_locale in residual.items():
        if concept_id in authored:
            raise ValueError(f"residual concise copy overlaps Guide-backed copy: {concept_id}")
        validate_copy(concept_id, by_locale)
        authored[concept_id] = by_locale

    if set(authored) != canonical_ids:
        missing = sorted(canonical_ids - set(authored))
        unknown = sorted(set(authored) - canonical_ids)
        raise ValueError(f"authored concise partition must exactly cover canonical Concepts; missing={missing}, unknown={unknown}")
    return authored


def concise_copy(authored: dict[str, dict], item: dict, locale: str):
    try:
        return authored[item["id"]][locale]
    except KeyError as exc:
        raise ValueError(f"missing authored concise copy: {locale}/{item['id']}") from exc


def materialize_branch(item):
    slug = item.get("slug") or suffix(item["id"], "branch-")
    return {
        "id": item["id"], "domainId": item["domainId"], "parentBranchId": item["parentBranchId"],
        "slug": slug, "order": item["order"], "titleKey": f"branches.{slug}.title",
        "descriptionKey": f"branches.{slug}.description",
    }


def materialize_concept(item):
    slug = suffix(item["id"], "concept-")
    return {
        "id": item["id"], "kind": item["kind"], "primaryBranchId": item["primaryBranchId"],
        "branchIds": item["branchIds"], "titleKey": f"concepts.{slug}.title",
        "summaryKey": f"concepts.{slug}.summary", "difficulty": item["difficulty"],
        "maturity": item["maturity"], "versionSensitive": item["versionSensitive"],
        "sourceRefs": item["sourceRefs"], "tags": item["tags"], "legacyIds": item["legacyIds"],
    }


def materialize_edge(item):
    slug = suffix(item["id"], "edge-")
    return {
        "id": item["id"], "fromConceptId": item["fromConceptId"], "toConceptId": item["toConceptId"],
        "type": item["type"], "rationaleKey": f"edges.{slug}.rationale",
    }


def materialize_path(item):
    path_slug = suffix(item["id"], "path-")
    milestones = []
    for order, milestone in enumerate(item["milestones"]):
        milestone_slug = suffix(milestone["id"], "milestone-")
        milestones.append({
            "id": milestone["id"], "order": order, "titleKey": f"milestones.{milestone_slug}.title",
            "conceptIds": list(dict.fromkeys(milestone["conceptIds"])),
            "contentNodeIds": list(dict.fromkeys(milestone["contentNodeIds"])), "required": milestone["required"],
        })
    return {
        "id": item["id"], "kind": item["kind"], "slug": item["slug"], "domainIds": item["domainIds"],
        "branchIds": item["branchIds"], "titleKey": f"paths.{path_slug}.title",
        "descriptionKey": f"paths.{path_slug}.description", "goalKey": f"paths.{path_slug}.goal",
        "deliverableKey": f"paths.{path_slug}.deliverable", "audienceTags": item["audienceTags"],
        "difficulty": item["difficulty"], "lifecycle": item["lifecycle"],
        "recommendedPrerequisitePathIds": item["recommendedPrerequisitePathIds"], "milestones": milestones,
        "capstoneContentIds": item["capstoneContentIds"],
    }


def build():
    seed = load(GRAPH_FILE)
    seed_locales = {locale: load(path) for locale, path in LOCALE_FILES.items()}
    concise_policy = load(CONCISE_FILE)
    authored_manifest = load(AUTHORED_CONCISE_FILE)
    branches, concepts, edges, paths = load_inventory()
    authored = load_authored_concise(concise_policy, authored_manifest, concepts)
    source_refs = {**seed.get("sourceRefs", {}), **CURRENT_SOURCES}
    validate_freshness(concepts, source_refs)

    graph = {
        "schemaVersion": "1.0.0", "graphVersion": "1.0.0", "status": "DRAFT", "locales": ["en", "zh-CN"],
        "domains": seed["domains"], "branches": [materialize_branch(item) for item in branches],
        "concepts": [materialize_concept(item) for item in concepts], "edges": [materialize_edge(item) for item in edges],
        "paths": [materialize_path(item) for item in paths], "contentNodes": seed["contentNodes"],
        "accessPolicies": seed["accessPolicies"], "sourceRefs": source_refs, "migration": seed["migration"],
    }

    presentations = {}
    for locale, seed_copy in seed_locales.items():
        is_en = locale == "en"
        old_edges = seed_copy.get("edges", {})
        branch_copy = {
            item["id"]: {"title": item["en"] if is_en else item["zh"], "description": item["enDescription"] if is_en else item["zhDescription"]}
            for item in branches
        }
        concept_copy = {}
        for item in concepts:
            title = item["en"] if is_en else item["zh"]
            copy = concise_copy(authored, item, locale)
            concept_copy[item["id"]] = {"title": title, "summary": copy["summary"]}

        edge_copy = {}
        for item in edges:
            previous = old_edges.get(item["id"], {})
            rationale = previous.get("rationale")
            if not rationale:
                source_title = concept_copy[item["fromConceptId"]]["title"]
                target_title = concept_copy[item["toConceptId"]]["title"]
                rationale = (
                    f"Connect {source_title} to {target_title} as a {item['type'].lower().replace('_', ' ')} relationship."
                    if is_en else f"将「{source_title}」与「{target_title}」建立为 {item['type']} 关系。"
                )
            edge_copy[item["id"]] = {"rationale": rationale}

        path_copy, milestone_copy = {}, {}
        for path_item in paths:
            path_copy[path_item["id"]] = {
                "title": path_item["en"] if is_en else path_item["zh"],
                "description": path_item["enDescription"] if is_en else path_item["zhDescription"],
                "goal": path_item["enGoal"] if is_en else path_item["zhGoal"],
                "deliverable": path_item["enDeliverable"] if is_en else path_item["zhDeliverable"],
            }
            for milestone in path_item["milestones"]:
                milestone_copy[milestone["id"]] = {"title": milestone["en"] if is_en else milestone["zh"]}

        presentations[locale] = {
            "schemaVersion": "1.0.0", "graphVersion": "1.0.0", "locale": locale,
            "domains": seed_copy["domains"], "branches": branch_copy, "concepts": concept_copy,
            "edges": edge_copy, "paths": path_copy, "milestones": milestone_copy, "content": seed_copy["content"],
        }
    return graph, presentations


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="materialize canonical v1 graph + locale files")
    args = parser.parse_args()
    graph, presentations = build()
    if args.write:
        write(GRAPH_FILE, graph)
        for locale, data in presentations.items():
            write(LOCALE_FILES[locale], data)
    version_sensitive = sum(1 for concept in graph["concepts"] if concept["versionSensitive"])
    print(
        f"AI Knowledge Graph v1 inventory: {len(graph['branches'])} branches, "
        f"{len(graph['concepts'])} concepts ({version_sensitive} version-sensitive), "
        f"{len(graph['edges'])} edges, {len(graph['paths'])} paths; "
        f"{len(presentations['en']['concepts'])} authored bilingual Concept summaries materialized with published generic fallback disabled."
    )


if __name__ == "__main__":
    main()
