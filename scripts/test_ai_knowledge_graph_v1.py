#!/usr/bin/env python3
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
LOCALES = ("en", "zh-CN")
EXPECTED_DOMAINS = {"domain-understand-ai", "domain-build-ai", "domain-use-ai"}
EXPECTED_ACCESS = {
    "access-open": "OPEN",
    "access-free-choice": "FREE_CHOICE",
    "access-membership": "MEMBERSHIP",
}


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
        for target in edges.get(node, []):
            visit(target)
        visiting.remove(node)
        visited.add(node)

    for node in nodes:
        visit(node)


def normalize_route(route: str) -> str:
    if not route.startswith("/"):
        route = "/" + route
    return route if route.endswith("/") else route + "/"


def main():
    schema = load("ai-knowledge-graph-v1.0.schema.json")
    presentation_schema = load("ai-knowledge-graph-presentation-v1.0.schema.json")
    graph = load("ai-knowledge-graph-v1.0.json")
    legacy = load("learning-graph-v0.9.json")
    localized = {locale: load(f"ai-knowledge-graph-v1.0.{locale}.json") for locale in LOCALES}

    require(schema["$schema"] == "https://json-schema.org/draft/2020-12/schema", "semantic schema must use JSON Schema 2020-12")
    require(presentation_schema["$schema"] == "https://json-schema.org/draft/2020-12/schema", "presentation schema must use JSON Schema 2020-12")
    for definition in ("domain", "branch", "concept", "edge", "path", "contentNode", "accessPolicy", "migration"):
        require(definition in schema["$defs"], f"semantic schema missing $defs.{definition}")

    require(graph["schemaVersion"] == "1.0.0", "graph schemaVersion must be 1.0.0")
    require(graph["graphVersion"] == "1.0.0", "seed graphVersion must be 1.0.0")
    require(graph["status"] == "DRAFT", "v1 seed remains DRAFT until curriculum cutover")
    require(tuple(graph["locales"]) == LOCALES, "locale contract drifted")

    domains = graph["domains"]
    branches = graph["branches"]
    concepts = graph["concepts"]
    edges = graph["edges"]
    paths = graph["paths"]
    content_nodes = graph["contentNodes"]
    access_policies = graph["accessPolicies"]

    domain_ids = {item["id"] for item in domains}
    branch_ids = {item["id"] for item in branches}
    concept_ids = {item["id"] for item in concepts}
    edge_ids = {item["id"] for item in edges}
    path_ids = {item["id"] for item in paths}
    content_ids = {item["id"] for item in content_nodes}
    access_ids = {item["id"] for item in access_policies}

    require(domain_ids == EXPECTED_DOMAINS, f"v1 must expose Understand/Build/Use AI roots, got {domain_ids}")
    unique((item["id"] for item in domains), "domain id")
    unique((item["slug"] for item in domains), "domain slug")
    unique((item["id"] for item in branches), "branch id")
    unique((item["id"] for item in concepts), "concept id")
    unique((item["id"] for item in edges), "edge id")
    unique((item["id"] for item in paths), "path id")
    unique((item["slug"] for item in paths), "path slug")
    unique((item["id"] for item in content_nodes), "content id")
    unique((item["analyticsId"] for item in content_nodes), "content analytics id")

    # Branches are a browse tree. Parent references stay in-domain and may not cycle.
    branch_by_id = {item["id"]: item for item in branches}
    branch_parent_edges: dict[str, list[str]] = {}
    sibling_orders: dict[tuple[str, str | None], list[int]] = defaultdict(list)
    for branch in branches:
        require(branch["domainId"] in domain_ids, f"unknown domain for {branch['id']}")
        parent = branch["parentBranchId"]
        if parent is not None:
            require(parent in branch_ids, f"unknown parent branch for {branch['id']}: {parent}")
            require(branch_by_id[parent]["domainId"] == branch["domainId"], f"branch parent crosses domains: {branch['id']}")
            branch_parent_edges[branch["id"]] = [parent]
        else:
            branch_parent_edges[branch["id"]] = []
        sibling_orders[(branch["domainId"], parent)].append(branch["order"])
    assert_acyclic(branch_ids, branch_parent_edges, "branch hierarchy")
    for key, orders in sibling_orders.items():
        require(sorted(orders) == list(range(len(orders))), f"branch sibling order must be contiguous for {key}: {orders}")

    # Concepts are graph nodes and may intentionally appear in many browse branches.
    source_refs = set(graph["sourceRefs"])
    legacy_aliases: list[str] = []
    shared_concepts = 0
    for concept in concepts:
        require(concept["primaryBranchId"] in branch_ids, f"unknown primary branch on {concept['id']}")
        require(concept["primaryBranchId"] in concept["branchIds"], f"primary branch missing from branchIds on {concept['id']}")
        require(all(item in branch_ids for item in concept["branchIds"]), f"unknown branch on {concept['id']}")
        if len(concept["branchIds"]) > 1:
            shared_concepts += 1
        require(all(item in source_refs for item in concept["sourceRefs"]), f"unknown sourceRef on {concept['id']}")
        if concept["versionSensitive"]:
            require(concept["sourceRefs"], f"version-sensitive concept needs source provenance: {concept['id']}")
        legacy_aliases.extend(concept["legacyIds"])
    require(shared_concepts >= 5, "seed must demonstrate reusable concepts across multiple branches")
    unique(legacy_aliases, "concept legacy alias")

    # Only PREREQUISITE edges form a DAG. RELATED/APPLIES_TO/etc. are allowed to form general graph relationships.
    prerequisite_edges: dict[str, list[str]] = defaultdict(list)
    seen_edge_tuples: set[tuple[str, str, str]] = set()
    for edge in edges:
        require(edge["fromConceptId"] in concept_ids and edge["toConceptId"] in concept_ids, f"broken concept edge: {edge['id']}")
        require(edge["fromConceptId"] != edge["toConceptId"], f"self edge: {edge['id']}")
        edge_tuple = (edge["fromConceptId"], edge["toConceptId"], edge["type"])
        require(edge_tuple not in seen_edge_tuples, f"duplicate semantic edge: {edge_tuple}")
        seen_edge_tuples.add(edge_tuple)
        if edge["type"] == "PREREQUISITE":
            prerequisite_edges[edge["fromConceptId"]].append(edge["toConceptId"])
    assert_acyclic(concept_ids, prerequisite_edges, "concept prerequisites")

    # Access metadata describes content classification only. User quotas/entitlement state belong elsewhere.
    require({item["id"]: item["entitlementMode"] for item in access_policies} == EXPECTED_ACCESS, "access policy contract drifted")
    allowed_access_fields = {"id", "catalogVisibility", "entitlementMode", "description"}
    for policy in access_policies:
        require(set(policy) == allowed_access_fields, f"user entitlement state leaked into access policy {policy['id']}")
    forbidden_commercial_fields = {"freeLimit", "unlockCount", "remainingUnlocks", "userId", "subscriptionId"}
    require(not any(forbidden_commercial_fields & set(policy) for policy in access_policies), "billing/user quota fields must stay outside knowledge graph")

    # Content is an experience layer over concepts. Planned content may have no route; published content must.
    published_routes: list[str] = []
    content_prereq_edges: dict[str, list[str]] = {}
    for node in content_nodes:
        require(node["primaryBranchId"] in branch_ids, f"unknown content branch: {node['id']}")
        require(node["conceptIds"] and all(item in concept_ids for item in node["conceptIds"]), f"broken concept refs on {node['id']}")
        require(node["accessPolicyId"] in access_ids, f"unknown access policy on {node['id']}")
        require(all(item in source_refs for item in node["sourceRefs"]), f"unknown content sourceRef on {node['id']}")
        for field in ("prerequisiteContentIds", "recommendedBackfillIds", "nextContentIds"):
            refs = node[field]
            require(all(item in content_ids for item in refs), f"broken {field} on {node['id']}: {refs}")
            require(node["id"] not in refs, f"self link in {field} on {node['id']}")
        if node["lifecycle"] == "PUBLISHED":
            require(isinstance(node["route"], str) and node["route"].startswith("/") and node["route"].endswith("/"), f"published node needs stable route: {node['id']}")
            published_routes.append(normalize_route(node["route"]))
        content_prereq_edges[node["id"]] = node["prerequisiteContentIds"]
    unique(published_routes, "published route")
    assert_acyclic(content_ids, content_prereq_edges, "content prerequisites")

    # Paths are projections over existing concepts/content, never cloned curricula.
    milestone_ids: list[str] = []
    concept_path_membership: dict[str, set[str]] = defaultdict(set)
    for path in paths:
        require(all(item in domain_ids for item in path["domainIds"]), f"unknown path domain on {path['id']}")
        require(all(item in branch_ids for item in path["branchIds"]), f"unknown path branch on {path['id']}")
        require(all(item in path_ids for item in path["recommendedPrerequisitePathIds"]), f"unknown prerequisite path on {path['id']}")
        require(path["id"] not in path["recommendedPrerequisitePathIds"], f"self prerequisite path: {path['id']}")
        require([item["order"] for item in path["milestones"]] == list(range(len(path["milestones"]))), f"milestone order drifted on {path['id']}")
        for milestone in path["milestones"]:
            milestone_ids.append(milestone["id"])
            require(milestone["conceptIds"] or milestone["contentNodeIds"], f"empty path milestone: {milestone['id']}")
            require(all(item in concept_ids for item in milestone["conceptIds"]), f"unknown concept in {milestone['id']}")
            require(all(item in content_ids for item in milestone["contentNodeIds"]), f"unknown content in {milestone['id']}")
            for concept_id in milestone["conceptIds"]:
                concept_path_membership[concept_id].add(path["id"])
        require(all(item in content_ids for item in path["capstoneContentIds"]), f"unknown capstone on {path['id']}")
    unique(milestone_ids, "milestone id")
    require(any(path["kind"] == "ENGINEERING" for path in paths), "v1 needs an engineering path")
    require(any(path["kind"] == "OUTCOME" for path in paths), "v1 needs an outcome/business path")
    require(len(concept_path_membership["concept-context-management"]) >= 3, "context management should prove cross-path reuse")
    require("path-write-book-ai" in path_ids and "path-build-knowledge-base" in path_ids and "path-vibe-coding" in path_ids, "seed paths must cover the agreed Use AI + Vibe Coding examples")

    # EN/zh-CN files are presentation only and must have exact semantic parity.
    semantic_sets = {
        "domains": domain_ids,
        "branches": branch_ids,
        "concepts": concept_ids,
        "edges": edge_ids,
        "paths": path_ids,
        "milestones": set(milestone_ids),
        "content": content_ids,
    }
    allowed_locale_fields = {
        "domains": {"title", "description"},
        "branches": {"title", "description"},
        "concepts": {"title", "summary"},
        "edges": {"rationale"},
        "paths": {"title", "description", "goal", "deliverable"},
        "milestones": {"title"},
        "content": {"title", "promise", "debrief", "transferPrompt"},
    }
    for locale, data in localized.items():
        require(data["schemaVersion"] == "1.0.0" and data["graphVersion"] == graph["graphVersion"], f"presentation version mismatch for {locale}")
        require(data["locale"] == locale, f"locale marker mismatch for {locale}")
        for section, ids in semantic_sets.items():
            require(set(data[section]) == ids, f"{locale} parity failed for {section}: missing={ids - set(data[section])}, extra={set(data[section]) - ids}")
            for item_id, copy in data[section].items():
                require(set(copy) == allowed_locale_fields[section], f"presentation semantic leakage at {locale}/{section}/{item_id}: {set(copy)}")
                for key, value in copy.items():
                    if value is not None:
                        require(isinstance(value, str) and value.strip(), f"empty localized {key} at {locale}/{item_id}")

    # v0.9 remains the current runtime graph. v1 reserves every published model ID and preserves every public content route for explicit migration.
    migration = graph["migration"]
    require(migration["fromGraphVersion"] == legacy["version"], "migration source version mismatch")
    legacy_model_ids = {item["id"] for item in legacy["models"]}
    require(set(migration["reservedLegacyModelIds"]) == legacy_model_ids, "v1 must reserve every v0.9 mental-model ID")
    legacy_routes = {item["id"]: normalize_route(item["route"]) for item in legacy["contentNodes"]}
    preserved_routes = {item["contentId"]: normalize_route(item["route"]) for item in migration["preservedContentRoutes"]}
    require(preserved_routes == legacy_routes, f"v0.9 route preservation drifted: expected={legacy_routes}, got={preserved_routes}")

    print(
        "PASS AI Knowledge Graph v1.0: "
        f"{len(domains)} domains, {len(branches)} browse branches, {len(concepts)} reusable concepts, "
        f"{len(edges)} typed edges, {len(paths)} paths, {len(content_nodes)} seed experiences, "
        "EN/zh-CN parity, entitlement boundary and v0.9 migration preservation."
    )


if __name__ == "__main__":
    main()
