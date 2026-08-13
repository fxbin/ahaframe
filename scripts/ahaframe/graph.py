from .core import SITE


def build():
    target = SITE / 'en/labs/agent-workflow-graph'
    target.mkdir(parents=True, exist_ok=True)
