import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/requirePlatformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
  if (!check.admin.is_super_admin) {
    return NextResponse.json({ error: "Only a super admin can remove admins" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  if (id === check.admin.id) {
    return NextResponse.json({ error: "You can't remove your own admin account" }, { status: 400 });
  }

  const { data: target } = await admin.from("platform_admins").select("is_super_admin").eq("id", id).maybeSingle();
  if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  if (target.is_super_admin) {
    const { count } = await admin
      .from("platform_admins")
      .select("id", { count: "exact", head: true })
      .eq("is_super_admin", true);
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: "Can't remove the last super admin" }, { status: 400 });
    }
  }

  const { error } = await admin.from("platform_admins").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Remove failed" }, { status: 500 });

  // Also revoke their ability to sign in at all, not just their admin-panel
  // access — otherwise a removed admin's auth account still works, it just
  // has nowhere to go, which is a confusing half-removed state.
  await admin.auth.admin.deleteUser(id).catch(() => {});

  return NextResponse.json({ ok: true });
}
