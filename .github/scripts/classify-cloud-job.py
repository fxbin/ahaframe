#!/usr/bin/env python3
import argparse
import json
import os
import sys
import urllib.request


def fetch_jobs():
    api = os.environ.get("GITHUB_API_URL", "https://api.github.com")
    repo = os.environ["GITHUB_REPOSITORY"]
    run_id = os.environ["GITHUB_RUN_ID"]
    token = os.environ["GITHUB_TOKEN"]
    url = f"{api}/repos/{repo}/actions/runs/{run_id}/jobs?filter=latest&per_page=100"
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2026-03-10",
            "User-Agent": "ahaframe-ci-router",
        },
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.load(response).get("jobs", [])


def classify(job):
    steps = job.get("steps") or []
    runner_name = job.get("runner_name")

    # The quota/billing failure we are routing around has no assigned runner
    # and GitHub never creates workflow steps for it.
    if not runner_name and not steps:
        return "fallback"

    failed_steps = [step for step in steps if step.get("conclusion") == "failure"]
    if failed_steps:
        return "failed"

    if job.get("conclusion") == "success":
        return "passed"

    return "failed"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--job", required=True, help="Exact workflow job display name")
    parser.add_argument("--output", required=True, help="GITHUB_OUTPUT key")
    args = parser.parse_args()

    jobs = fetch_jobs()
    matches = [job for job in jobs if job.get("name") == args.job]
    if not matches:
        print(f"Could not find workflow job named {args.job!r}", file=sys.stderr)
        state = "failed"
    else:
        job = matches[-1]
        state = classify(job)
        print(
            f"{args.job}: state={state}, runner={job.get('runner_name')!r}, "
            f"steps={len(job.get('steps') or [])}, conclusion={job.get('conclusion')!r}"
        )

    output = os.environ.get("GITHUB_OUTPUT")
    if output:
        with open(output, "a", encoding="utf-8") as handle:
            handle.write(f"{args.output}={state}\n")
    else:
        print(f"{args.output}={state}")


if __name__ == "__main__":
    main()
