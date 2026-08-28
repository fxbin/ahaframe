export const FREE_CHOICE_LIMIT = 3 as const;

export type MembershipStatus = "ANONYMOUS" | "FREE" | "MEMBER";
export type ContentAccessClassification = "OPEN" | "FREE_CHOICE" | "MEMBERSHIP";
export type ContentAccessReason =
  | "OPEN"
  | "MEMBER"
  | "PERMANENT_FREE_CHOICE"
  | "FREE_CHOICE_AVAILABLE"
  | "FREE_CHOICE_LIMIT_REACHED"
  | "SIGN_IN_REQUIRED"
  | "MEMBERSHIP_REQUIRED";

export interface EntitlementSnapshot {
  userId: string | null;
  membershipStatus: MembershipStatus;
  freeChoiceContentIds: string[];
}

export interface ContentAccessDecision {
  accessible: boolean;
  claimable: boolean;
  remainingFreeChoices: number;
  reason: ContentAccessReason;
}

export function remainingFreeChoices(snapshot: EntitlementSnapshot): number {
  if (snapshot.membershipStatus === "MEMBER") return FREE_CHOICE_LIMIT;
  return Math.max(0, FREE_CHOICE_LIMIT - new Set(snapshot.freeChoiceContentIds).size);
}

export function resolveContentAccess(
  classification: ContentAccessClassification,
  contentId: string,
  snapshot: EntitlementSnapshot,
): ContentAccessDecision {
  const remaining = remainingFreeChoices(snapshot);

  if (classification === "OPEN") {
    return { accessible: true, claimable: false, remainingFreeChoices: remaining, reason: "OPEN" };
  }

  if (snapshot.membershipStatus === "MEMBER") {
    return { accessible: true, claimable: false, remainingFreeChoices: remaining, reason: "MEMBER" };
  }

  if (classification === "FREE_CHOICE") {
    if (snapshot.freeChoiceContentIds.includes(contentId)) {
      return {
        accessible: true,
        claimable: false,
        remainingFreeChoices: remaining,
        reason: "PERMANENT_FREE_CHOICE",
      };
    }
    if (snapshot.membershipStatus === "ANONYMOUS") {
      return {
        accessible: false,
        claimable: false,
        remainingFreeChoices: FREE_CHOICE_LIMIT,
        reason: "SIGN_IN_REQUIRED",
      };
    }
    if (remaining > 0) {
      return {
        accessible: false,
        claimable: true,
        remainingFreeChoices: remaining,
        reason: "FREE_CHOICE_AVAILABLE",
      };
    }
    return {
      accessible: false,
      claimable: false,
      remainingFreeChoices: 0,
      reason: "FREE_CHOICE_LIMIT_REACHED",
    };
  }

  return {
    accessible: false,
    claimable: false,
    remainingFreeChoices: remaining,
    reason: snapshot.membershipStatus === "ANONYMOUS" ? "SIGN_IN_REQUIRED" : "MEMBERSHIP_REQUIRED",
  };
}
