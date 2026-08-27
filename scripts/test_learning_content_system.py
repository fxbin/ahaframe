#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"

NODE_TYPES = {
    "GUIDE", "PLAYGROUND", "LAB", "MISSION", "INCIDENT",
    "DRILL", "REVIEW", "BUILD", "BOSS", "REFERENCE",
}
EFFORT_BANDS = {"SHORT", "MEDIUM", "DEEP"}
LOCALES = ("en", "zh-CN")


def load(name: str):
    return json.loads((CONTENT / name).read_text(encoding="utf-8"))


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def unique(values: Iterable[str], label: str):
    values = list(values)
    require(len(values) == len(set(values)), f"duplicate {label}: {values}")


def assert_acyclic(nodes: Iterable[str], edges: dict[str, list[str]], label: str):
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str):
        if node in visited:
            return
        require(node not in visiting, f"illegal cycle in {label} at {node}")
        visiting.add(node)
        for dependency in edges.get(node, []):
            visit(dependency)
        visiting.remove(node)
        visited.add(node)

    for node in nodes:
        visit(node)


def normalize_route(route: str) -> str:
    route = route.replace("/en/", "/", 1) if route.startswith("/en/") else route
    if not route.startswith("/"):
        route = "/" + route
    return route if route.endswith("/") else route + "/"


def main():
    graph = load("learning-graph-v0.9.json")
    examples = load("learning-node-examples-v0.9.json")
    reconciliation = load("lab-reconciliation-v0.8.json")
    labels = {locale: load(f"learning-graph.{locale}.json") for locale in LOCALES}

    require(graph["version"] == "0.9.0", "learning graph version must be 0.9.0")
    require(graph["status"] == "active", "learning graph must be active")
    require(tuple(graph["locales"]) == LOCALES, "learning graph locale contract drifted")
    require(set(graph["nodeTypes"]) == NODE_TYPES, "node type enum drifted")
    require(set(graph["effortBands"]) == EFFORT_BANDS, "effort band enum drifted")

    stages = graph["stages"]
    models = graph["models"]
    content_nodes = graph["contentNodes"]
    require(len(stages) == 10, f"expected 10 stages, got {len(stages)}")
    require(len(models) == 52, f"expected 52 mental models, got {len(models)}")
    unique((stage["id"] for stage in stages), "stage id")
    unique((stage["slug"] for stage in stages), "stage slug")
    unique((model["id"] for model in models), "model id")
    unique((node["id"] for node in content_nodes), "content id")
    unique((normalize_route(node["route"]) for node in content_nodes), "content route")
    unique((node["analyticsId"] for node in content_nodes), "analytics semantic id")

    stage_ids = {stage["id"] for stage in stages}
    model_ids = {model["id"] for model in models}
    content_ids = {node["id"] for node in content_nodes}
    require([stage["order"] for stage in stages] == list(range(10)), "stage order must remain 0..9")

    listed_models: list[str] = []
    for stage in stages:
        require(stage["labelKey"] == f"stages.{stage['id']}.title", f"bad labelKey for {stage['id']}")
        require(stage["descriptionKey"] == f"stages.{stage['id']}.description", f"bad descriptionKey for {stage['id']}")
        listed_models.extend(stage["modelIds"])
    require(set(listed_models) == model_ids and len(listed_models) == len(model_ids), "stage model membership must cover every model exactly once")

    model_edges: dict[str, list[str]] = {}
    referenced_source_refs: set[str] = set()
    for model in models:
        require(model["stageId"] in stage_ids, f"unknown model stage for {model['id']}")
        require(model["primaryFormat"] in NODE_TYPES, f"unknown primary format for {model['id']}")
        require(model["titleKey"] == f"models.{model['id']}.title", f"bad model titleKey for {model['id']}")
        prerequisites = model.get("prerequisiteModelIds", [])
        require(all(item in model_ids for item in prerequisites), f"broken model prerequisite on {model['id']}")
        require(model["id"] not in prerequisites, f"self prerequisite on {model['id']}")
        model_edges[model["id"]] = prerequisites
        for source_ref in model.get("sourceRefs", []):
            referenced_source_refs.add(source_ref)
    assert_acyclic(model_ids, model_edges, "mental-model prerequisites")

    content_prereq_edges: dict[str, list[str]] = {}
    for node in content_nodes:
        require(node["format"] in NODE_TYPES, f"unknown content format for {node['id']}")
        require(node["stageId"] in stage_ids, f"unknown content stage for {node['id']}")
        require(node["effortBand"] in EFFORT_BANDS, f"unknown effort band for {node['id']}")
        require(node["titleKey"] == f"content.{node['id']}.title", f"bad titleKey for {node['id']}")
        require(node["promiseKey"] == f"content.{node['id']}.promise", f"bad promiseKey for {node['id']}")
        require(node["route"].startswith("/") and node["route"].endswith("/"), f"route must be locale-neutral and slash-bounded for {node['id']}")
        require(not node["route"].startswith("/en/") and not node["route"].startswith("/zh-cn/"), f"locale leaked into route semantics for {node['id']}")
        require(node.get("modelIds") and all(item in model_ids for item in node["modelIds"]), f"broken model link on {node['id']}")
        for field in ("prerequisiteContentIds", "recommendedBackfillIds", "nextContentIds"):
            refs = node.get(field, [])
            require(all(item in content_ids for item in refs), f"broken {field} on {node['id']}: {refs}")
            require(node["id"] not in refs, f"self link in {field} on {node['id']}")
        require(isinstance(node["reviewEligible"], bool), f"reviewEligible must be boolean for {node['id']}")
        require(node["analyticsId"].strip() != "", f"analyticsId required for {node['id']}")
        require(node.get("provenance"), f"provenance required for {node['id']}")
        content_prereq_edges[node["id"]] = node.get("prerequisiteContentIds", [])
    assert_acyclic(content_ids, content_prereq_edges, "content prerequisites")

    source_refs = graph.get("sourceRefs", {})
    require(referenced_source_refs <= set(source_refs), f"missing sourceRef definitions: {referenced_source_refs - set(source_refs)}")
    for source_id, source in source_refs.items():
        require(source["url"].startswith("https://"), f"sourceRef {source_id} must be an HTTPS URL")
        require(source.get("kind") and source.get("reviewAfter"), f"sourceRef {source_id} requires kind + reviewAfter")

    # Locale files are presentation-only and must have exact parity with semantic IDs.
    for locale, localized in labels.items():
        require(localized["locale"] == locale, f"locale marker mismatch for {locale}")
        require(set(localized["stages"]) == stage_ids, f"stage localization parity failed for {locale}")
        require(set(localized["models"]) == model_ids, f"model localization parity failed for {locale}")
        require(set(localized["content"]) == content_ids, f"content localization parity failed for {locale}")
        for stage_id, copy in localized["stages"].items():
            require(copy.get("title", "").strip() and copy.get("description", "").strip(), f"empty stage copy for {locale}/{stage_id}")
        for model_id, copy in localized["models"].items():
            require(set(copy) == {"title"} and copy["title"].strip(), f"model locale files may contain title only: {locale}/{model_id}")
        for content_id, copy in localized["content"].items():
            require(set(copy) == {"title", "promise"}, f"runtime semantics leaked into localized content for {locale}/{content_id}")
            require(copy["title"].strip() and copy["promise"].strip(), f"empty content copy for {locale}/{content_id}")

    # Every current v0.8 public experience must map to the v0.9 graph without route or ID loss.
    graph_by_id = {node["id"]: node for node in content_nodes}
    for old in reconciliation["experiences"]:
        require(old["id"] in graph_by_id, f"v0.8 experience missing from v0.9 graph: {old['id']}")
        current = graph_by_id[old["id"]]
        require(normalize_route(old["route"]) == normalize_route(current["route"]), f"route drift for {old['id']}: {old['route']} -> {current['route']}")

    # Authoring examples define the complete reusable node contract and quality floor.
    require(examples["version"] == "0.9.0", "example contract version mismatch")
    sample_types = {example["nodeType"] for example in examples["examples"]}
    require(sample_types == NODE_TYPES, f"authoring examples must cover all node types, missing={NODE_TYPES - sample_types}")
    required_example_fields = {
        "id", "version", "nodeType", "stageId", "modelIds", "prerequisiteContentIds",
        "recommendedNextContentIds", "effortBand", "teachingFormat", "learningObjective",
        "evidenceRequirement", "debrief", "transferPrompt", "reviewEligible", "localeKeyRoot",
        "analyticsId", "runtimeRef", "provenance",
    }
    unique((example["id"] for example in examples["examples"]), "example id")
    unique((example["analyticsId"] for example in examples["examples"]), "example analytics id")
    for example in examples["examples"]:
        require(set(example) == required_example_fields, f"authoring contract field drift on {example['id']}")
        require(example["nodeType"] in NODE_TYPES, f"bad example type for {example['id']}")
        require(example["stageId"] in stage_ids, f"bad example stage for {example['id']}")
        require(all(item in model_ids for item in example["modelIds"]), f"bad model IDs in {example['id']}")
        require(example["effortBand"] in EFFORT_BANDS, f"bad effort band in {example['id']}")
        for field in ("teachingFormat", "learningObjective", "evidenceRequirement", "debrief", "transferPrompt", "localeKeyRoot", "analyticsId"):
            require(isinstance(example[field], str) and example[field].strip(), f"{field} required in {example['id']}")
        require(example["provenance"], f"provenance required in {example['id']}")

        if example["nodeType"] in {"MISSION", "INCIDENT"}:
            require("evidence" in example["teachingFormat"] or "engineering" in example["teachingFormat"], f"Mission/Incident must encode evidence/decision structure: {example['id']}")
        if example["nodeType"] in {"DRILL", "REVIEW"}:
            text = (example["teachingFormat"] + " " + example["learningObjective"] + " " + example["transferPrompt"]).lower()
            require("transfer" in text or "retrieve" in text or "recall" in text, f"Drill/Review must require retrieval or transfer: {example['id']}")
        if example["nodeType"] in {"BUILD", "BOSS"}:
            require(len(example["modelIds"]) >= 2, f"Build/Boss must integrate multiple models: {example['id']}")
        if example["nodeType"] == "REFERENCE":
            require(any(item.startswith("source:") for item in example["provenance"]), "versioned Reference example requires a source provenance entry")

    print(
        "PASS Content System v0.9: "
        f"{len(stages)} stages, {len(models)} mental models, {len(content_nodes)} migrated public nodes, "
        f"{len(examples['examples'])} authoring contracts, bilingual parity, DAG integrity, route preservation."
    )


if __name__ == "__main__":
    main()
