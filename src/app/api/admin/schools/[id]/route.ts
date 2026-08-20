import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requirePlatformAdmin } from "@/lib/requirePlatformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type Action = "approve" | "reject" | "activate" | "deactivate" | "suspend" | "set_billing_rate";

const STATUS_BY_ACTION: Record<Action, string | null> = {
  approve: "active",
  reject: "rejected",
  activate: "active",
  deactivate: "deactivated",
  suspend: "suspended",
  set_billing_rate: null, // doesn't touch status
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: school, error: schoolErr } = await admin
    .from("schools")
    .select("id, name, slug, school_code, contact_email, contact_phone, address, logo_url, status, created_at, approved_at")
    .eq("id", id)
    .single();
  if (schoolErr || !school) return NextResponse.json({ error: "School not found" }, { status: 404 });

  // school_settings only exists once the invited super-admin has actually
  // completed onboarding — a pending/newly-approved school won't have a row
  // here yet, so this is expected to be null rather than an error case.
  const { data: settings } = await admin
    .from("school_settings")
    .select("school_name, school_code, school_email, school_phone1, school_phone2, school_address, head_teacher_name, school_motto, logo_url")
    .eq("school_id", id)
    .maybeSingle();

  return NextResponse.json({ school, settings });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
  let approvalInviteLink: string | null = null;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body.action as Action;
  const reason = typeof body.reason === "string" ? body.reason : null;

  const admin = createAdminClient();

  // Billing rate is a plain field update, not a status transition — handle
  // it separately before the status-action validation below.
  if (action === "set_billing_rate") {
    const rate = Number(body.amount_per_student);
    if (!Number.isFinite(rate) || rate < 0) {
      return NextResponse.json({ error: "amount_per_student must be a non-negative number" }, { status: 400 });
    }
    const { error } = await admin.from("schools").update({ amount_per_student: rate }).eq("id", id);
    if (error) return NextResponse.json({ error: "Failed to update billing rate" }, { status: 500 });
    return NextResponse.json({ ok: true, amount_per_student: rate });
  }

  if (!STATUS_BY_ACTION[action]) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  // Vital-info gate: an admin can approve a school ONLY once its
  // registration is actually complete — this is the "no approval, no
  // access" review step described in the brief.
  if (action === "approve") {
    const { data: school } = await admin
      .from("schools")
      .select("name, contact_email, contact_phone, address, logo_url, school_code")
      .eq("id", id)
      .single();

    const missing: string[] = [];
    if (!school?.name) missing.push("school name");
    if (!school?.contact_email) missing.push("contact email");
    if (!school?.contact_phone) missing.push("contact phone");
    if (!school?.logo_url) missing.push("logo");

    if (missing.length) {
      return NextResponse.json(
        { error: `Can't approve — missing: ${missing.join(", ")}` },
        { status: 422 }
      );
    }

    // ── 1. Seed school_settings so the Omni1OS app has data from day one ──
    const { error: seedError } = await admin.from("school_settings").upsert(
      {
        school_id: id,
        school_name: school!.name,
        school_email: school!.contact_email,
        school_phone1: school!.contact_phone,
        school_address: school!.address,
        school_code: school!.school_code,
        logo_url: school!.logo_url,
      },
      { onConflict: "school_id" }
    );
    if (seedError) {
      console.error("school_settings seed failed", seedError);
      // Non-fatal: continue with the approval even if seeding fails
    }

    // ── 2. Generate a one-time invite link for the school contact ──
    // Same mechanism as staff invites in the Omni1OS app: no auth user is
    // created here, and nothing goes through Supabase's mailer — the link
    // itself carries everything needed, stays valid until first opened
    // (not on a timer), and is spent the moment it's clicked.
    const appUrl = process.env.NEXT_PUBLIC_OMNI1OS_APP_URL ?? "http://localhost:3001";

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", school!.contact_email)
      .maybeSingle();

    let inviteLink: string | null = null;

    if (existingProfile) {
      // Contact email already has an account elsewhere — just promote it
      // to super_admin for this school directly, no link needed.
      await admin
        .from("profiles")
        .update({ role: "super_admin", school_id: id, first_login_done: false })
        .eq("id", existingProfile.id);
    } else {
      // Retire any earlier unclicked invite for this school before issuing
      // a new one, so only the latest link is ever valid.
      await admin
        .from("school_invite_tokens")
        .update({ opened_at: new Date().toISOString() })
        .eq("school_id", id)
        .is("completed_at", null)
        .is("opened_at", null);

      const token = randomBytes(32).toString("base64url");
      const { error: tokenErr } = await admin.from("school_invite_tokens").insert({
        token,
        school_id: id,
        email: school!.contact_email,
        full_name: `${school!.name} Admin`,
        created_by: check.admin.id,
      });
      if (tokenErr) {
        return NextResponse.json({ error: `Failed to create invite: ${tokenErr.message}` }, { status: 500 });
      }
      inviteLink = `${appUrl}/school-invite/${token}`;
    }
    approvalInviteLink = inviteLink;
  }

  const update: Record<string, unknown> = { status: STATUS_BY_ACTION[action], updated_at: new Date().toISOString() };
  if (action === "approve") {
    update.approved_at = new Date().toISOString();
    update.approved_by = check.admin.id;
  }
  if (action === "reject" && reason) {
    update.rejection_reason = reason;
  }

  const { error } = await admin.from("schools").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inviteLink: approvalInviteLink });
}


export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
  if (!check.admin.is_super_admin) {
    return NextResponse.json({ error: "Only a super admin can permanently delete a school" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("schools").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
