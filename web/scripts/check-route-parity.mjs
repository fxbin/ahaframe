import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const WEB_ROOT = process.cwd();
const REPO_ROOT = path.resolve(WEB_ROOT, "..");
const CONTENT_ROOT = path.join(REPO_ROOT, "content");

const PUBLIC_ROUTES = [
  "",
  "pricing/",
  "early-access/",
  "lessons/token-playground/",
  "lessons/context-window/",
  "lessons/agent-loop/",
  "labs/instruction-conflict/",
  "labs/rag-failure/",
  "labs/context-compression/",
  "labs/agent-reliability/",
  "labs/agent-workflow-graph/",
  "labs/evaluation-failure/",
  "build/reliable-support-agent/",
];

const REQUIRED_APP_FILES = [
  "app/(root)/page.tsx",
  "app/(site)/[locale]/page.tsx",
  "app/(site)/[locale]/pricing/page.tsx",
  "app/(site)/[locale]/early-access/page.tsx",
  "app/(site)/[locale]/lessons/[slug]/page.tsx",
  "app/(site)/[locale]/labs/[slug]/page.tsx",
  "app/(site)/[locale]/build/reliable-support-agent/page.tsx",
  "app/api/waitlist/route.ts",
];

const FLAGSHIP_MISSIONS = [
  "mission-broken-rag",
  "mission-47000-retry",
  "mission-prompt-injection",
  "mission-final-boss",
];

function sameRoutes(left, right) {
  return left.length === right.length && left.every((route, index) => route === right[index]);
}

const contract = JSON.parse(await readFile(path.join(CONTENT_ROOT, "lab-reconciliation-v0.8.json"), "utf8"));
if (contract.status !== "active") {
  throw new Error("v0.8 lab reconciliation contract is not active.");
}
if (contract.primaryCampaign.length !== 4) {
  throw new Error("v0.8 Campaign must contain exactly three incidents and one Final Boss.");
}

for (const locale of ["en", "zh-CN"]) {
  const source = JSON.parse(await readFile(path.join(CONTENT_ROOT, `${locale}.json`), "utf8"));
  if (!sameRoutes(source.availableRoutes, PUBLIC_ROUTES)) {
    throw new Error(
      `${locale} public route contract drifted.\nExpected: ${JSON.stringify(PUBLIC_ROUTES)}\nActual: ${JSON.stringify(source.availableRoutes)}`,
    );
  }

  const campaign = JSON.parse(await readFile(path.join(CONTENT_ROOT, `campaign-discovery.${locale}.json`), "utf8"));
  for (const experience of contract.experiences) {
    if (!campaign.knowledge?.experiences?.[experience.id]) {
      throw new Error(`${locale} Knowledge Map is missing ${experience.id}.`);
    }
  }
  for (const id of contract.primaryCampaign) {
    if (!campaign.campaign?.cards?.[id]) {
      throw new Error(`${locale} Campaign is missing primary card ${id}.`);
    }
  }

  for (const mission of FLAGSHIP_MISSIONS) {
    await access(path.join(CONTENT_ROOT, `${mission}.${locale}.json`));
  }
}

for (const relativePath of REQUIRED_APP_FILES) {
  await access(path.join(WEB_ROOT, relativePath));
}

console.log(`Next.js public-route parity contract OK (${PUBLIC_ROUTES.length} routes × 2 locales; v0.8 Campaign + waitlist adapter verified).`);
