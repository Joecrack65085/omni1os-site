// src/lib/requirePlatformAdmin.ts
// Every /api/admin/* route calls this first. It confirms the request
// carries a valid Supabase Auth session AND that the session's user id
// exists in platform_admins — the same table the "7 taps -> login modal"
// flow authenticates against. School users (however senior) are never in
// this table, so this alone is what keeps the omni-admin API off limits
// to every school's staff.
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requirePlatformAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "Not signed in" };
  }

  const admin = createAdminClient();
  const { data: adminRow } = await admin
    .from("platform_admins")
    .select("id, email, full_name, is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow) {
    return { ok: false as const, status: 403, error: "Not a platform admin" };
  }

  return { ok: true as const, admin: adminRow };
}
