import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, "..");
const repositoryRoot = resolve(webRoot, "..");
const sourceRoot = resolve(repositoryRoot, "src/assets");
const targetRoot = resolve(webRoot, "public/runtime");
const manifestPath = resolve(webRoot, "runtime-assets.json");

const definition = JSON.parse(await readFile(manifestPath, "utf8"));
if (!definition || definition.version !== 1 || !Array.isArray(definition.assets) || definition.assets.length === 0) {
  throw new Error("runtime-assets.json must declare a non-empty version 1 asset allowlist.");
}

const unique = new Set(definition.assets);
if (unique.size !== definition.assets.length) {
  throw new Error("runtime-assets.json contains duplicate assets.");
}

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });

const generated = [];
for (const asset of definition.assets) {
  if (typeof asset !== "string" || !asset.endsWith(".js") || asset.includes("/") || asset.includes("\\")) {
    throw new Error(`Invalid runtime asset allowlist entry: ${String(asset)}`);
  }
  const sourcePath = resolve(sourceRoot, asset);
  let bytes;
  try {
    bytes = await readFile(sourcePath);
  } catch (error) {
    throw new Error(`Required canonical runtime asset is missing: src/assets/${asset}`, { cause: error });
  }
  const targetPath = resolve(targetRoot, asset);
  await writeFile(targetPath, bytes);
  generated.push({
    file: asset,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}

await writeFile(
  resolve(targetRoot, "manifest.json"),
  `${JSON.stringify({ version: definition.version, generated }, null, 2)}\n`,
  "utf8",
);

console.log(`Synced ${generated.length} canonical runtime assets into web/public/runtime.`);
