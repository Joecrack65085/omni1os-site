import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminShell from "./AdminShell";

export default async function OmniAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const admin = createAdminClient();
  const { data: adminRow } = await admin
    .from("platform_admins")
    .select("id, email, full_name, is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow) redirect("/");

  return <AdminShell admin={adminRow}>{children}</AdminShell>;
}
