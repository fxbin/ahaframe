const baseUrl = (process.env.CUTOVER_BASE_URL || "http://127.0.0.1:4300").replace(/\/$/, "");
const expectedCommit = process.env.CUTOVER_EXPECTED_COMMIT || "";
const expectedEnvironment = process.env.CUTOVER_EXPECTED_ENVIRONMENT || "";
const expectIndexing = process.env.CUTOVER_EXPECT_INDEXING === "1";

if (!/^[0-9a-f]{40}$/i.test(expectedCommit)) {
  throw new Error("CUTOVER_EXPECTED_COMMIT must be a full 40-character git SHA.");
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

function requireHeader(response, name, expected) {
  const actual = response.headers.get(name);
  if (actual !== expected) {
    throw new Error(`${response.url} ${name} mismatch: expected ${expected}; got ${actual}`);
  }
}

const markerResponse = await request("/assets/build-meta.json", { redirect: "manual" });
if (markerResponse.status !== 200) throw new Error(`release marker returned HTTP ${markerResponse.status}`);
const marker = await markerResponse.json();
if (marker.schemaVersion !== 1) throw new Error(`release marker schemaVersion mismatch: ${marker.schemaVersion}`);
if (marker.gitCommitSha !== expectedCommit) {
  throw new Error(`release marker commit mismatch: expected ${expectedCommit}; got ${marker.gitCommitSha}`);
}
if (expectedEnvironment && marker.environment !== expectedEnvironment) {
  throw new Error(`release marker environment mismatch: expected ${expectedEnvironment}; got ${marker.environment}`);
}
if (marker.indexingEnabled !== expectIndexing) {
  throw new Error(`release marker indexing mismatch: expected ${expectIndexing}; got ${marker.indexingEnabled}`);
}

const slashRedirect = await request("/en", { redirect: "manual" });
if (![307, 308].includes(slashRedirect.status)) {
  throw new Error(`/en must redirect to the canonical trailing-slash URL; got HTTP ${slashRedirect.status}`);
}
const redirectLocation = slashRedirect.headers.get("location") || "";
if (!redirectLocation.endsWith("/en/")) {
  throw new Error(`/en redirect target mismatch: ${redirectLocation}`);
}

const criticalRoutes = [
  "/en/",
  "/en/pricing/",
  "/en/labs/rag-failure/",
  "/en/build/reliable-support-agent/",
  "/zh-cn/",
];

for (const path of criticalRoutes) {
  const response = await request(path, { redirect: "manual" });
  if (response.status !== 200) throw new Error(`${path} returned HTTP ${response.status}`);
  requireHeader(response, "x-content-type-options", "nosniff");
  requireHeader(response, "referrer-policy", "strict-origin-when-cross-origin");
  requireHeader(response, "permissions-policy", "camera=(), microphone=(), geolocation=()");
}

const [home, robotsResponse] = await Promise.all([request("/en/"), request("/robots.txt")]);
const html = await home.text();
const robotsMeta = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";
if (robotsResponse.status !== 200) throw new Error(`robots.txt returned HTTP ${robotsResponse.status}`);
const robots = await robotsResponse.text();

const errors = [];
if (expectIndexing) {
  if (!robotsMeta.includes("index") || !robotsMeta.includes("follow") || robotsMeta.includes("noindex") || robotsMeta.includes("nofollow")) {
    errors.push(`page robots meta expected index,follow; got ${robotsMeta || "<missing>"}`);
  }
  if (!/Allow:\s*\//i.test(robots) || /Disallow:\s*\//i.test(robots)) {
    errors.push(`robots.txt expected Allow: / without root Disallow; got ${JSON.stringify(robots)}`);
  }
} else {
  if (!robotsMeta.includes("noindex") || !robotsMeta.includes("nofollow")) {
    errors.push(`page robots meta expected noindex,nofollow; got ${robotsMeta || "<missing>"}`);
  }
  if (!/Disallow:\s*\//i.test(robots)) {
    errors.push(`robots.txt expected Disallow: /; got ${JSON.stringify(robots)}`);
  }
}
if (!robots.includes("https://ahaframe.com/sitemap.xml")) errors.push("robots.txt lost the canonical sitemap URL");
if (errors.length) {
  throw new Error(
    `indexing artifact mismatch (marker.indexingEnabled=${marker.indexingEnabled}):\n${errors.map((error) => `- ${error}`).join("\n")}`,
  );
}

const sitemapResponse = await request("/sitemap.xml");
if (sitemapResponse.status !== 200) throw new Error(`sitemap.xml returned HTTP ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (locations.length !== 26) throw new Error(`sitemap must contain 26 canonical URLs; got ${locations.length}`);

console.log(
  `PASS Cutover runtime: commit=${expectedCommit} environment=${marker.environment} indexing=${expectIndexing ? "enabled" : "blocked"} trailing-slash/security/sitemap contracts preserved.`,
);
