#!/usr/bin/env python3
import json
import os
import sys
import urllib.error
import urllib.request

SELF_HOSTED = '"self-hosted"'
GITHUB_HOSTED = '"ubuntu-latest"'
PLAN_MINUTES = {
    "free": 2000,
    "pro": 3000,
}
RESERVE_MINUTES = int(os.environ.get("ACTIONS_CLOUD_RESERVE_MINUTES", "120"))


def write_output(name: str, value: str) -> None:
    output = os.environ.get("GITHUB_OUTPUT")
    if not output:
        print(f"{name}={value}")
        return
    with open(output, "a", encoding="utf-8") as handle:
        handle.write(f"{name}={value}\n")


def request_json(url: str, token: str):
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
        return json.load(response)


def choose_self_hosted(reason: str) -> None:
    print(f"CI runner: self-hosted ({reason})")
    write_output("runner", SELF_HOSTED)
    write_output("mode", "self-hosted")
    write_output("reason", reason.replace("\n", " "))


def main() -> int:
    token = os.environ.get("GH_BILLING_READ_TOKEN", "").strip()
    if not token:
        choose_self_hosted("GH_BILLING_READ_TOKEN is not configured")
        return 0

    api = os.environ.get("GITHUB_API_URL", "https://api.github.com")
    try:
        user = request_json(f"{api}/user", token)
        login = user.get("login")
        plan_name = ((user.get("plan") or {}).get("name") or "").lower()
        included = PLAN_MINUTES.get(plan_name)
        if not login or included is None:
            choose_self_hosted(f"unsupported or unknown GitHub plan: {plan_name or 'unknown'}")
            return 0

        usage = request_json(
            f"{api}/users/{login}/settings/billing/usage/summary?product=Actions",
            token,
        )
        minute_items = [
            item
            for item in usage.get("usageItems", [])
            if str(item.get("product", "")).lower() == "actions"
            and str(item.get("unitType", "")).lower() == "minutes"
        ]
        discounted = sum(float(item.get("discountQuantity") or 0) for item in minute_items)
        gross = sum(float(item.get("grossQuantity") or 0) for item in minute_items)
        used_included = discounted if discounted > 0 else min(gross, included)
        remaining = max(0.0, included - used_included)

        print(
            f"GitHub plan={plan_name}, included={included}, "
            f"used_included={used_included:.1f}, remaining={remaining:.1f}, "
            f"reserve={RESERVE_MINUTES}"
        )

        if remaining > RESERVE_MINUTES:
            write_output("runner", GITHUB_HOSTED)
            write_output("mode", "github-hosted")
            write_output("reason", f"{remaining:.1f} included minutes remain")
        else:
            choose_self_hosted(
                f"only {remaining:.1f} included minutes remain (reserve {RESERVE_MINUTES})"
            )
        return 0
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError, KeyError) as exc:
        choose_self_hosted(f"billing preflight unavailable: {exc}")
        return 0


if __name__ == "__main__":
    sys.exit(main())
