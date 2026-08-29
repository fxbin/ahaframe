import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, "..");
const repositoryRoot = resolve(webRoot, "..");
const runtimeAssets = JSON.parse(await readFile(resolve(webRoot, "runtime-assets.json"), "utf8"));
const runtimeExperiences = JSON.parse(await readFile(resolve(webRoot, "runtime-experiences.json"), "utf8"));
const en = JSON.parse(await readFile(resolve(repositoryRoot, "content/en.json"), "utf8"));
const zh = JSON.parse(await readFile(resolve(repositoryRoot, "content/zh-CN.json"), "utf8"));

const FINAL_BOSS_SCRIPTS = [
  "lab-engine.js",
  "lab-scenarios.js",
  "instruction-conflict-scenario.js",
  "context-compression-scenario.js",
  "agent-workflow-graph-scenario.js",
  "evaluation-scenario.js",
  "reliable-support-scenario.js",
  "mission-engine.js",
  "production-support-launch-mission.js",
];

const experiences = runtimeExperiences?.experiences;
if (!experiences || runtimeExperiences.version !== 1 || typeof experiences !== "object") {
  throw new Error("runtime-experiences.json must declare a version 1 experiences object.");
}
if (JSON.stringify(en.availableRoutes) !== JSON.stringify(zh.availableRoutes)) {
  throw new Error("Runtime contract requires exact EN/zh-CN route parity.");
}

const interactiveRouteEntries = en.availableRoutes
  .map((route) => {
    const match = route.match(/^(lessons|labs|build)\/([^/]+)\/$/);
    return match ? { route, key: match[2] } : null;
  })
  .filter(Boolean);
const routedKeys = interactiveRouteEntries.map((item) => item.key).sort();
const keys = Object.keys(experiences).sort();
if (JSON.stringify(keys) !== JSON.stringify(routedKeys)) {
  throw new Error(`Runtime experience/public route mismatch. Runtime=${keys.join(", ")}; routes=${routedKeys.join(", ")}.`);
}

const allowedAssets = new Set(runtimeAssets.assets);
const runtimeIds = new Set();
for (const [key, experience] of Object.entries(experiences)) {
  if (!experience || !["lab", "mission"].includes(experience.kind)) throw new Error(`${key} must declare kind=lab|mission.`);
  if (typeof experience.runtimeId !== "string" || !experience.runtimeId.trim()) throw new Error(`${key} must declare a non-empty runtimeId.`);
  if (runtimeIds.has(experience.runtimeId)) throw new Error(`Duplicate runtimeId: ${experience.runtimeId}.`);
  runtimeIds.add(experience.runtimeId);

  if (!Array.isArray(experience.scripts) || experience.scripts.length < 2) throw new Error(`${key} must declare an ordered runtime script list.`);
  if (new Set(experience.scripts).size !== experience.scripts.length) throw new Error(`${key} repeats a runtime script.`);
  for (const script of experience.scripts) {
    if (!allowedAssets.has(script)) throw new Error(`${key} references runtime script outside the canonical allowlist: ${script}.`);
  }
  if (experience.scripts[0] !== "lab-engine.js") throw new Error(`${key} must load lab-engine.js first.`);

  const missionIndex = experience.scripts.indexOf("mission-engine.js");
  if (experience.kind === "lab" && missionIndex !== -1) throw new Error(`${key} is a Lab but loads mission-engine.js.`);
  if (experience.kind === "mission") {
    if (missionIndex < 2 || missionIndex !== experience.scripts.length - 2) {
      throw new Error(`${key} must load scenario assets, then mission-engine.js, then its Mission registration asset.`);
    }
  }
}

if (JSON.stringify(experiences["reliable-support-agent"].scripts) !== JSON.stringify(FINAL_BOSS_SCRIPTS)) {
  throw new Error("Final Boss must load every canonical component scenario before reliable-support-scenario.js and Mission Engine.");
}

console.log(`PASS Runtime experience manifest: ${keys.length} public interactive routes have deterministic IDs, canonical script order, locale parity, and Final Boss transitive dependencies.`);
