import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/requirePlatformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = createAdminClient();

  const [{ count: totalSchools }, { count: pendingApprovals }, { count: activeSchools }, { count: totalStudents }] =
    await Promise.all([
      admin.from("schools").select("id", { count: "exact", head: true }),
      admin.from("schools").select("id", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("schools").select("id", { count: "exact", head: true }).eq("status", "active"),
      admin.from("pupils").select("id", { count: "exact", head: true }),
    ]);

  // Aggregate fee volume processed across every school's own Paystack
  // account — this is each school's own money, shown here purely for
  // platform monitoring, never moved or held by Omni1OS.
  let totalFeesProcessed = 0;
  const { data: paymentSums } = await admin.from("payments").select("amount").eq("status", "success");
  if (paymentSums) {
    totalFeesProcessed = paymentSums.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }

  // Omni1OS's own termly subscription revenue = each active school's
  // (live pupil count × their manually-set amount_per_student rate),
  // set via the billing calculator in Settings. Schools with no rate set
  // yet (amount_per_student = 0) simply contribute nothing until an admin
  // configures them.
  const { data: billableSchools } = await admin
    .from("schools")
    .select("id, amount_per_student")
    .eq("status", "active")
    .gt("amount_per_student", 0);

  let subscriptionRevenue = 0;
  if (billableSchools?.length) {
    const { data: pupilRows } = await admin
      .from("pupils")
      .select("school_id")
      .in("school_id", billableSchools.map((s) => s.id));
    const countBySchool = new Map<string, number>();
    (pupilRows || []).forEach((r) => countBySchool.set(r.school_id, (countBySchool.get(r.school_id) || 0) + 1));
    subscriptionRevenue = billableSchools.reduce(
      (sum, s) => sum + (countBySchool.get(s.id) || 0) * Number(s.amount_per_student),
      0
    );
  }

  return NextResponse.json({
    totalSchools: totalSchools || 0,
    pendingApprovals: pendingApprovals || 0,
    activeSchools: activeSchools || 0,
    totalStudents: totalStudents || 0,
    totalFeesProcessed,
    subscriptionRevenue,
  });
}
