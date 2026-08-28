import { NextResponse } from "next/server";
import { FREE_CHOICE_LIMIT, remainingFreeChoices } from "@/lib/entitlements";
import { getCurrentEntitlementSnapshot, isFreeChoiceContent } from "@/lib/content-access-server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

interface ClaimBody {
  contentId?: unknown;
}

export async function GET() {
  try {
    const snapshot = await getCurrentEntitlementSnapshot();
    return NextResponse.json({
      ok: true,
      authenticated: snapshot.membershipStatus !== "ANONYMOUS",
      membershipStatus: snapshot.membershipStatus,
      freeChoiceLimit: FREE_CHOICE_LIMIT,
      freeChoicesUsed: snapshot.freeChoiceContentIds.length,
      freeChoicesRemaining: remainingFreeChoices(snapshot),
      freeChoiceContentIds: snapshot.freeChoiceContentIds,
      billingActive: false,
    });
  } catch (error) {
    console.error("[entitlements] status failed", error);
    return NextResponse.json({ ok: false, error: "ENTITLEMENT_STATUS_UNAVAILABLE" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: ClaimBody;
  try {
    body = (await request.json()) as ClaimBody;
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const contentId = typeof body.contentId === "string" ? body.contentId.trim() : "";
  if (!contentId) {
    return NextResponse.json({ ok: false, error: "CONTENT_ID_REQUIRED" }, { status: 400 });
  }

  // Curriculum data is the source of truth for which Experiences are eligible.
  // The privileged database function never receives an unvalidated content id.
  if (!(await isFreeChoiceContent(contentId))) {
    return NextResponse.json({ ok: false, error: "CONTENT_NOT_FREE_CHOICE" }, { status: 422 });
  }

  const userClient = await createClient();
  const { data: userResult, error: userError } = await userClient.auth.getUser();
  if (userError || !userResult.user) {
    return NextResponse.json({ ok: false, error: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  }

  try {
    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient.rpc("claim_free_content_choice", {
      p_user_id: userResult.user.id,
      p_content_id: contentId,
    });
    if (error) {
      if (error.message.includes("FREE_CHOICE_LIMIT_REACHED")) {
        return NextResponse.json({ ok: false, error: "FREE_CHOICE_LIMIT_REACHED" }, { status: 409 });
      }
      if (error.message.includes("MEMBERSHIP_ALREADY_UNLOCKS_LIBRARY")) {
        return NextResponse.json({ ok: false, error: "MEMBERSHIP_ALREADY_UNLOCKS_LIBRARY" }, { status: 409 });
      }
      throw error;
    }

    const result = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      ok: true,
      contentId,
      freeChoiceLimit: FREE_CHOICE_LIMIT,
      freeChoicesUsed: result?.free_choices_used ?? null,
      freeChoicesRemaining: result?.free_choices_remaining ?? null,
      alreadyGranted: result?.already_granted ?? false,
      billingActive: false,
    });
  } catch (error) {
    console.error("[entitlements] claim failed", error);
    return NextResponse.json({ ok: false, error: "ENTITLEMENT_CLAIM_UNAVAILABLE" }, { status: 503 });
  }
}
