"""Build the AhaFrame static validation site."""

from ahaframe import agent, agent_reliability, context, discovery, evaluation, home, marketing, rag, token


def main():
    home.build()
    token.build()
    context.build()
    agent.build()
    rag.build()
    agent_reliability.build()
    evaluation.build()
    marketing.build()
    discovery.build()


if __name__ == "__main__":
    main()
