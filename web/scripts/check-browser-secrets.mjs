import { readdir, readFile, stat } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const webRoot = process.cwd();
const nextRoot = resolve(webRoot, ".next");
const scanRoots = [resolve(nextRoot, "static"), resolve(nextRoot, "server", "app")];
const browserLikeExtensions = new Set([".js", ".mjs", ".css", ".html", ".rsc", ".txt", ".json"]);

const forbiddenIdentifiers = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "POSTGRES_PASSWORD",
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "WAFFO_SECRET",
  "STRIPE_SECRET_KEY",
  "VERCEL_OIDC_TOKEN",
];

const forbiddenValuePatterns = [
  { label: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: "OpenAI-style secret", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: "Supabase secret", pattern: /\bsb_secret_[A-Za-z0-9_-]{20,}\b/ },
  { label: "credentialed database URL", pattern: /\bpostgres(?:ql)?:\/\/[^\s"'<>:]+:[^\s"'<>@]+@[^\s"'<>]+/i },
];

async function walk(path) {
  const info = await stat(path).catch(() => null);
  if (!info) return [];
  if (info.isFile()) return [path];
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => walk(resolve(path, entry.name))));
  return nested.flat();
}

const files = (await Promise.all(scanRoots.map(walk)))
  .flat()
  .filter((file) => browserLikeExtensions.has(extname(file)));

if (!files.length) {
  throw new Error("Browser secret scan found no Next browser/prerender output. Run `npm run build` first.");
}

const findings = [];
for (const file of files) {
  const text = await readFile(file, "utf8").catch(() => "");
  if (!text) continue;

  for (const identifier of forbiddenIdentifiers) {
    if (text.includes(identifier)) findings.push(`${relative(nextRoot, file)} contains forbidden identifier ${identifier}`);
  }
  for (const { label, pattern } of forbiddenValuePatterns) {
    if (pattern.test(text)) findings.push(`${relative(nextRoot, file)} contains a ${label}`);
  }
}

if (findings.length) {
  throw new Error(`Browser secret boundary failed:\n${findings.map((item) => `- ${item}`).join("\n")}`);
}

console.log(`PASS Browser secret boundary: scanned ${files.length} client/prerender files with no forbidden server-secret identifiers or credential patterns.`);
