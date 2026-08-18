import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, "..");
const repositoryRoot = resolve(webRoot, "..");
const sourceRoot = resolve(repositoryRoot, "src/assets");
const targetRoot = resolve(webRoot, "public/runtime");
const definition = JSON.parse(await readFile(resolve(webRoot, "runtime-assets.json"), "utf8"));
const generatedManifest = JSON.parse(await readFile(resolve(targetRoot, "manifest.json"), "utf8"));

if (generatedManifest.version !== definition.version) {
  throw new Error(`Runtime manifest version mismatch: expected ${definition.version}, got ${generatedManifest.version}.`);
}

const generatedByFile = new Map(generatedManifest.generated.map((entry) => [entry.file, entry]));
for (const asset of definition.assets) {
  const source = await readFile(resolve(sourceRoot, asset));
  const copied = await readFile(resolve(targetRoot, asset));
  if (!source.equals(copied)) {
    throw new Error(`Runtime sync is not byte-preserving for ${asset}.`);
  }
  const sha256 = createHash("sha256").update(source).digest("hex");
  const recorded = generatedByFile.get(asset);
  if (!recorded || recorded.sha256 !== sha256 || recorded.bytes !== source.byteLength) {
    throw new Error(`Generated runtime manifest is invalid for ${asset}.`);
  }
}

if (generatedByFile.size !== definition.assets.length) {
  throw new Error("Generated runtime manifest contains unexpected or missing assets.");
}

console.log(`PASS Runtime asset integrity: ${definition.assets.length} canonical files are byte-identical with verified SHA-256 metadata.`);
