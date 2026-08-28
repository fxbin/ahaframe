import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ContentAccessClassification, EntitlementSnapshot, MembershipStatus } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();

interface ProductionExperience {
  id: string;
  accessPolicyId: "access-open" | "access-free-choice" | "access-membership";
}

interface ProductionManifest {
  version: string;
  principles: { billingActivation: boolean };
  experiences: ProductionExperience[];
}

const CLASSIFICATION_BY_POLICY: Record<ProductionExperience["accessPolicyId"], ContentAccessClassification> = {
  "access-open": "OPEN",
  "access-free-choice": "FREE_CHOICE",
  "access-membership": "MEMBERSHIP",
};

let manifestPromise: Promise<ProductionManifest> | null = null;

async function loadManifest(): Promise<ProductionManifest> {
  manifestPromise ??= readFile(path.join(CONTENT_ROOT, "ai-content-production-v1.0.json"), "utf8").then(
    (source) => JSON.parse(source) as ProductionManifest,
  );
  const manifest = await manifestPromise;
  if (manifest.version !== "1.0.0") throw new Error("Content access manifest version mismatch.");
  if (manifest.principles.billingActivation !== false) {
    throw new Error("Knowledge Graph entitlement foundation must not activate Billing.");
  }
  return manifest;
}

export async function getPlannedContentAccessClassification(contentId: string): Promise<ContentAccessClassification | null> {
  const manifest = await loadManifest();
  const experience = manifest.experiences.find((item) => item.id === contentId);
  return experience ? CLASSIFICATION_BY_POLICY[experience.accessPolicyId] : null;
}

export async function isFreeChoiceContent(contentId: string): Promise<boolean> {
  return (await getPlannedContentAccessClassification(contentId)) === "FREE_CHOICE";
}

/**
 * Reads durable account grants through the user's own RLS-bound session.
 * Missing auth is a valid anonymous snapshot, not an error.
 */
export async function getCurrentEntitlementSnapshot(): Promise<EntitlementSnapshot> {
  const supabase = await createClient();
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult.user) {
    return { userId: null, membershipStatus: "ANONYMOUS", freeChoiceContentIds: [] };
  }

  const userId = userResult.user.id;
  const [{ data: access, error: accessError }, { data: grants, error: grantsError }] = await Promise.all([
    supabase.from("account_access").select("membership_status").eq("user_id", userId).maybeSingle(),
    supabase
      .from("content_entitlements")
      .select("content_id,source")
      .eq("user_id", userId)
      .eq("source", "FREE_CHOICE"),
  ]);

  if (accessError) throw new Error(`Unable to read account access: ${accessError.message}`);
  if (grantsError) throw new Error(`Unable to read content entitlements: ${grantsError.message}`);

  const membershipStatus: MembershipStatus = access?.membership_status === "MEMBER" ? "MEMBER" : "FREE";
  return {
    userId,
    membershipStatus,
    freeChoiceContentIds: (grants ?? []).map((grant) => grant.content_id),
  };
}
