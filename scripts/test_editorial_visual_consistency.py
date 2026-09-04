from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

BRAND_SURFACES = [
    "web/components/marketing-pages.tsx",
    "web/components/waitlist-form.tsx",
    "web/components/lesson-page.tsx",
    "web/components/lab-page.tsx",
    "web/components/mission-page.tsx",
    "web/components/experience-page-sequence.tsx",
    "web/components/guide-page.tsx",
    "web/components/guide-directory-page.tsx",
    "web/components/guide-problem-discovery.tsx",
    "web/components/knowledge-map-overview.tsx",
    "web/components/learning-map-preview.tsx",
    "web/components/locale-switch.tsx",
    "web/components/global-search.tsx",
    "web/components/learning-return-bar.tsx",
    "web/components/guide-practice-return-bar.tsx",
]

for relative in BRAND_SURFACES:
    text = (ROOT / relative).read_text(encoding="utf-8")
    if "var(--primary)" in text:
        raise AssertionError(f"{relative} reintroduced legacy --primary as a page-level brand accent")
    if "var(--primary-soft)" in text:
        raise AssertionError(f"{relative} reintroduced legacy --primary-soft as a page-level brand surface")

first_aha = (ROOT / "web/components/first-aha-panel.tsx").read_text(encoding="utf-8")
if "var(--primary)" in first_aha:
    raise AssertionError("First Aha selection must use --brand-accent, not --primary")
if first_aha.count("var(--primary-soft)") != 1 or "text-[var(--success)]" not in first_aha:
    raise AssertionError("First Aha may retain --primary-soft only for the explicit semantic success tone")

learning_path = (ROOT / "web/components/learning-path-client.tsx").read_text(encoding="utf-8")
semantic_practiced = 'border-[var(--primary)] text-[var(--primary)]'
if learning_path.count("var(--primary)") != 2 or semantic_practiced not in learning_path:
    raise AssertionError("Learning Path --primary usage must remain limited to the semantic PRACTICED state")
if "focus-visible:outline-[var(--primary)]" in learning_path:
    raise AssertionError("Learning Path navigation focus must use --brand-accent")

editorial_css = (ROOT / "web/app/editorial-learning.css").read_text(encoding="utf-8")
if ".editorial-experience-page" not in editorial_css:
    raise AssertionError("Editorial Experience scope is missing")
if "--primary: var(--brand-accent);" not in editorial_css or "--primary-soft: var(--brand-accent-soft);" not in editorial_css:
    raise AssertionError("Legacy runtime primary tokens must be scoped to editorial brand accents on Experience pages")

globals_css = (ROOT / "web/app/globals.css").read_text(encoding="utf-8")
for required in (
    "--brand-accent: #d63b32;",
    "--brand-accent-soft: #f6e9e7;",
    "--success: #2f7658;",
):
    if required not in globals_css:
        raise AssertionError(f"Missing visual token contract: {required}")

print(f"PASS editorial visual consistency: {len(BRAND_SURFACES)} brand surfaces use editorial accents; semantic green remains explicit.")
