import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const WEB_ROOT = process.cwd();
const REPO_ROOT = path.resolve(WEB_ROOT, "..");
const CONTENT_ROOT = path.join(REPO_ROOT, "content");
const INVENTORY_ROOT = path.join(CONTENT_ROOT, "ai-knowledge-inventory-v1.0");
const GUIDE_ROOT = path.join(CONTENT_ROOT, "guides");
const CORE_GUIDE_BUNDLE_COUNT = 20;
const CORE_GUIDE_COUNT = 100;

const REQUIRED_CORE_ROUTES = [
  "", "courses/", "guides/", "learning/", "pricing/", "early-access/",
  "lessons/token-playground/", "lessons/context-window/", "lessons/agent-loop/",
  "labs/instruction-conflict/", "labs/rag-failure/", "labs/context-compression/", "labs/agent-reliability/",
  "labs/agent-workflow-graph/", "labs/evaluation-failure/", "build/reliable-support-agent/",
];

const REQUIRED_APP_FILES = [
  "app/(root)/page.tsx", "app/(site)/[locale]/page.tsx", "app/(site)/[locale]/courses/page.tsx",
  "app/(site)/[locale]/courses/[slug]/page.tsx", "app/(site)/[locale]/guides/page.tsx",
  "app/(site)/[locale]/guides/[slug]/page.tsx", "app/(site)/[locale]/learning/page.tsx",
  "app/(site)/[locale]/pricing/page.tsx", "app/(site)/[locale]/early-access/page.tsx",
  "app/(site)/[locale]/lessons/[slug]/page.tsx", "app/(site)/[locale]/labs/[slug]/page.tsx",
  "app/(site)/[locale]/build/[slug]/page.tsx", "app/(site)/[locale]/build/reliable-support-agent/page.tsx",
  "app/api/waitlist/route.ts",
];

const FLAGSHIP_MISSIONS = ["mission-broken-rag", "mission-47000-retry", "mission-prompt-injection", "mission-final-boss"];

const pathFiles = (await readdir(INVENTORY_ROOT)).filter((filename) => filename.startsWith("paths-") && filename.endsWith(".json")).sort();
const canonicalCourseRoutes = [];
for (const filename of pathFiles) {
  const fragment = JSON.parse(await readFile(path.join(INVENTORY_ROOT, filename), "utf8"));
  for (const learningPath of fragment.paths ?? []) canonicalCourseRoutes.push(`courses/${learningPath.slug}/`);
}
canonicalCourseRoutes.sort();
if (canonicalCourseRoutes.length !== 15) throw new Error(`Knowledge Graph must expose 15 canonical Learning Paths; got ${canonicalCourseRoutes.length}.`);

function expectedGuideWave(filename) {
  const match = filename.match(/^core-(\d{2})\./);
  if (!match) throw new Error(`Invalid Core Guide filename: ${filename}`);
  const number = Number(match[1]);
  if (number <= 4) return "core-20";
  if (number <= 8) return "core-40";
  if (number <= 12) return "core-60";
  if (number <= 16) return "core-80";
  if (number <= 20) return "core-100";
  throw new Error(`Unsupported Core Guide bundle number: ${filename}`);
}

async function guideRoutesForLocale(locale) {
  const files = (await readdir(GUIDE_ROOT))
    .filter((filename) => /^core-\d{2}\.(en|zh-CN)\.json$/.test(filename) && filename.endsWith(`.${locale}.json`))
    .sort();
  if (files.length !== CORE_GUIDE_BUNDLE_COUNT) {
    throw new Error(`${locale} must contain exactly ${CORE_GUIDE_BUNDLE_COUNT} Core Guide bundles; got ${files.length}.`);
  }
  const routes = [];
  for (const filename of files) {
    const bundle = JSON.parse(await readFile(path.join(GUIDE_ROOT, filename), "utf8"));
    if (bundle.version !== "1.0.0" || bundle.wave !== expectedGuideWave(filename) || bundle.locale !== locale) {
      throw new Error(`Guide bundle contract mismatch: ${filename}`);
    }
    for (const guide of bundle.guides ?? []) routes.push(`guides/${guide.slug}/`);
  }
  if (routes.length !== CORE_GUIDE_COUNT || new Set(routes).size !== CORE_GUIDE_COUNT) {
    throw new Error(`${locale} must expose exactly ${CORE_GUIDE_COUNT} unique Core Guide routes.`);
  }
  return routes.sort();
}

const canonicalGuideRoutes = await guideRoutesForLocale("en");
const zhGuideRoutes = await guideRoutesForLocale("zh-CN");
if (JSON.stringify(canonicalGuideRoutes) !== JSON.stringify(zhGuideRoutes)) {
  throw new Error(`EN/zh-CN Core Guide slug parity drifted.\nEN: ${canonicalGuideRoutes.join(", ")}\nZH: ${zhGuideRoutes.join(", ")}`);
}

function assertRouteManifest(routes, locale) {
  if (!Array.isArray(routes) || routes.some((route) => typeof route !== "string")) throw new Error(`${locale} availableRoutes must be a string array.`);
  if (new Set(routes).size !== routes.length) throw new Error(`${locale} availableRoutes contains duplicates.`);
  for (const route of routes) {
    if (route && (!route.endsWith("/") || route.startsWith("/") || route.includes("//"))) throw new Error(`${locale} contains a non-canonical public route: ${route}`);
  }
  for (const required of REQUIRED_CORE_ROUTES) if (!routes.includes(required)) throw new Error(`${locale} lost required existing route ${required}.`);
  const courseRoutes = routes.filter((route) => route.startsWith("courses/") && route !== "courses/").sort();
  if (JSON.stringify(courseRoutes) !== JSON.stringify(canonicalCourseRoutes)) throw new Error(`${locale} Course routes must exactly mirror canonical Knowledge Graph Path slugs.`);
  const guideRoutes = routes.filter((route) => route.startsWith("guides/") && route !== "guides/").sort();
  if (JSON.stringify(guideRoutes) !== JSON.stringify(canonicalGuideRoutes)) throw new Error(`${locale} Guide routes must exactly mirror the Core Guide publication bundles.`);
}

const contract = JSON.parse(await readFile(path.join(CONTENT_ROOT, "lab-reconciliation-v0.8.json"), "utf8"));
if (contract.status !== "active") throw new Error("v0.8 lab reconciliation contract is not active.");
if (contract.primaryCampaign.length !== 4) throw new Error("v0.8 Campaign must contain exactly three incidents and one Final Boss.");

const localeSources = {};
for (const locale of ["en", "zh-CN"]) {
  const source = JSON.parse(await readFile(path.join(CONTENT_ROOT, `${locale}.json`), "utf8"));
  assertRouteManifest(source.availableRoutes, locale);
  localeSources[locale] = source;
  const campaign = JSON.parse(await readFile(path.join(CONTENT_ROOT, `campaign-discovery.${locale}.json`), "utf8"));
  for (const experience of contract.experiences) if (!campaign.knowledge?.experiences?.[experience.id]) throw new Error(`${locale} Knowledge Map is missing ${experience.id}.`);
  for (const id of contract.primaryCampaign) if (!campaign.campaign?.cards?.[id]) throw new Error(`${locale} Campaign is missing primary card ${id}.`);
  for (const mission of FLAGSHIP_MISSIONS) await access(path.join(CONTENT_ROOT, `${mission}.${locale}.json`));
}

const enRoutes = localeSources.en.availableRoutes;
const zhRoutes = localeSources["zh-CN"].availableRoutes;
if (JSON.stringify(enRoutes) !== JSON.stringify(zhRoutes)) throw new Error(`EN/zh-CN public route parity drifted.`);
for (const relativePath of REQUIRED_APP_FILES) await access(path.join(WEB_ROOT, relativePath));
console.log(`Next.js public-route parity contract OK (${enRoutes.length} routes × 2 locales; 15 Course routes + Guides directory + ${CORE_GUIDE_COUNT} Core Guide routes mirror canonical content; Knowledge Map and stable routes preserved).`);
