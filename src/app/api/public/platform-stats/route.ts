import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Unauthenticated on purpose — this only ever returns aggregate counts for
// the public marketing homepage (schools/students/teachers), never anything
// school-identifying or sensitive. No PII, no per-school breakdown.
export async function GET() {
  const admin = createAdminClient();

  const [{ count: schools }, { count: students }, { count: teachers }] = await Promise.all([
    admin.from("schools").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("pupils").select("id", { count: "exact", head: true }),
    admin.from("staff").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    schools: schools || 0,
    students: students || 0,
    teachers: teachers || 0,
  });
}
