import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const FULL_SHA = /^[0-9a-f]{40}$/i;

function firstFullSha(...values) {
  return values.find((value) => typeof value === "string" && FULL_SHA.test(value.trim()))?.trim() || null;
}

function gitHead() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: resolve(process.cwd(), ".."),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const gitCommitSha = firstFullSha(
  process.env.AHAFRAME_BUILD_COMMIT_SHA,
  process.env.VERCEL_GIT_COMMIT_SHA,
  process.env.GITHUB_SHA,
  gitHead(),
) || "unknown";

const gitCommitRef =
  process.env.AHAFRAME_BUILD_COMMIT_REF ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_REF_NAME ||
  "unknown";

const environment = process.env.VERCEL_ENV || process.env.AHAFRAME_BUILD_ENV || (process.env.CI ? "ci" : "local");
const targetDir = resolve(process.cwd(), "public", "assets");
const target = resolve(targetDir, "build-meta.json");

await mkdir(targetDir, { recursive: true });
await writeFile(
  target,
  `${JSON.stringify({ schemaVersion: 1, gitCommitSha, gitCommitRef, environment }, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote Next release marker ${gitCommitSha} (${environment}) to public/assets/build-meta.json.`);
