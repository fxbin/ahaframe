"""Build the AhaFrame static validation site."""

from ahaframe import agent, agent_reliability, build_meta, context, context_compression, discovery, evaluation, graph, home, instruction_conflict, integrated_build, marketing, performance, rag, third_party_analytics, token
from ahaframe.core import SITE
from ahaframe.i18n import assert_public_route_contract, validate_locale_sources


def main():
    # Locale identity, route-prefix mapping, and shared UI sources are build-time
    # contracts. Fail before generating pages when they drift.
    validate_locale_sources()
    assert_public_route_contract()

    home.build()
    token.build()
    context.build()
    agent.build()
    rag.build()
    agent_reliability.build()
    evaluation.build()
    context_compression.build()
    instruction_conflict.build()
    graph.build()
    integrated_build.build()
    marketing.build()
    discovery.build()
    third_party_analytics.apply()
    performance.apply()
    # Public, non-secret release identity used by Production Smoke to prove that
    # ahaframe.com is serving the exact main commit under test.
    build_meta.apply(SITE)


if __name__ == "__main__":
    main()
