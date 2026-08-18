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
  "app/(redirect)/page.tsx",
  "app/(site)/[locale]/page.tsx",
  "app/(site)/[locale]/pricing/page.tsx",
  "app/(site)/[locale]/early-access/page.tsx",
  "app/(site)/[locale]/lessons/[slug]/page.tsx",
  "app/(site)/[locale]/labs/[slug]/page.tsx",
  "app/(site)/[locale]/build/reliable-support-agent/page.tsx",
];

function sameRoutes(left, right) {
  return left.length === right.length && left.every((route, index) => route === right[index]);
}

for (const locale of ["en", "zh-CN"]) {
  const source = JSON.parse(await readFile(path.join(CONTENT_ROOT, `${locale}.json`), "utf8"));
  if (!sameRoutes(source.availableRoutes, PUBLIC_ROUTES)) {
    throw new Error(
      `${locale} public route contract drifted.\nExpected: ${JSON.stringify(PUBLIC_ROUTES)}\nActual: ${JSON.stringify(source.availableRoutes)}`,
    );
  }
}

for (const relativePath of REQUIRED_APP_FILES) {
  await access(path.join(WEB_ROOT, relativePath));
}

const contract = JSON.parse(await readFile(path.join(CONTENT_ROOT, "lab-reconciliation-v0.8.json"), "utf8"));
if (contract.status !== "active") {
  throw new Error("v0.8 lab reconciliation contract is not active.");
}
if (contract.primaryCampaign.length !== 4) {
  throw new Error("v0.8 Campaign must contain exactly three incidents and one Final Boss.");
}

console.log(`Next.js public-route parity contract OK (${PUBLIC_ROUTES.length} routes × 2 locales; root English landing preserved).`);
