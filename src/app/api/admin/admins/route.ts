import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/requirePlatformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = createAdminClient();
  const { data } = await admin
    .from("platform_admins")
    .select("id, email, full_name, is_super_admin, created_at")
    .order("created_at", { ascending: true });

  return NextResponse.json({ admins: data || [] });
}

export async function POST(req: NextRequest) {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  // Both Admin and Super Admin can invite new admins — but the new admin is
  // always created as a regular Admin (is_super_admin: false below).
  // Super Admin status itself is deliberately not grantable from this UI.

  const { email, fullName } = await req.json();
  if (!/\S+@\S+\.\S+/.test(email || "")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Invite via Supabase Auth (sends them a set-password email), then link
  // the resulting auth user into platform_admins.
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteError || !invited?.user) {
    return NextResponse.json({ error: inviteError?.message || "Invite failed" }, { status: 500 });
  }

  const { error: insertError } = await admin.from("platform_admins").insert({
    id: invited.user.id,
    email,
    full_name: fullName || null,
    is_super_admin: false,
    created_by: check.admin.id,
  });

  if (insertError) {
    return NextResponse.json({ error: "Could not save admin record" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
