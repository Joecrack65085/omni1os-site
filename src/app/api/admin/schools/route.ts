import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/requirePlatformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = createAdminClient();

  const { data: schools, error } = await admin
    .from("schools")
    .select(
      "id, name, slug, school_code, contact_email, contact_phone, status, theme_mode, theme_preset, logo_url, created_at, approved_at, subscription_plan, subscription_status, amount_per_student"
    )
    .order("created_at", { ascending: false });

  if (error || !schools) {
    return NextResponse.json({ error: "Could not load schools" }, { status: 500 });
  }

  // Per-school student count + fee volume, done as two grouped queries
  // rather than N+1 lookups.
  const [{ data: pupilRows }, { data: paymentRows }, { data: paystackRows }] = await Promise.all([
    admin.from("pupils").select("school_id"),
    admin.from("payments").select("school_id, amount").eq("status", "success"),
    admin.from("school_payment_settings").select("school_id, is_paystack_enabled, is_verified"),
  ]);

  const studentCounts = new Map<string, number>();
  (pupilRows || []).forEach((r) => studentCounts.set(r.school_id, (studentCounts.get(r.school_id) || 0) + 1));

  const feeTotals = new Map<string, number>();
  (paymentRows || []).forEach((r) =>
    feeTotals.set(r.school_id, (feeTotals.get(r.school_id) || 0) + (Number(r.amount) || 0))
  );

  const paystackStatus = new Map<string, { enabled: boolean; verified: boolean }>();
  (paystackRows || []).forEach((r) =>
    paystackStatus.set(r.school_id, { enabled: r.is_paystack_enabled, verified: r.is_verified })
  );

  const result = schools.map((s) => ({
    ...s,
    studentCount: studentCounts.get(s.id) || 0,
    feesProcessed: feeTotals.get(s.id) || 0,
    paystack: paystackStatus.get(s.id) || { enabled: false, verified: false },
  }));

  return NextResponse.json({ schools: result });
}
