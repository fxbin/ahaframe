"""Build the AhaFrame static validation site."""

from ahaframe import agent, context, discovery, home, marketing, rag, token


def main():
    home.build()
    token.build()
    context.build()
    agent.build()
    rag.build()
    marketing.build()
    discovery.build()


if __name__ == "__main__":
    main()
