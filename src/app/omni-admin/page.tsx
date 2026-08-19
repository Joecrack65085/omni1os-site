"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, GraduationCap, Wallet, Clock, TrendingUp } from "lucide-react";

type Stats = {
  totalSchools: number;
  pendingApprovals: number;
  activeSchools: number;
  totalStudents: number;
  totalFeesProcessed: number;
  subscriptionRevenue: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--text-dim)]">Platform-wide overview across every school on Omni1OS.</p>

      {stats?.pendingApprovals ? (
        <Link
          href="/omni-admin/schools?filter=pending"
          className="mt-5 flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--purple)]/40 bg-[var(--surface)] px-4 py-3 text-sm"
        >
          <Clock size={16} className="text-[var(--purple)]" />
          <span>
            <strong className="font-data">{stats.pendingApprovals}</strong> school
            {stats.pendingApprovals === 1 ? "" : "s"} waiting for approval
          </span>
          <span className="ml-auto text-[var(--text-dim)]">Review →</span>
        </Link>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Building2} label="Schools registered" value={stats?.totalSchools} />
        <StatCard icon={Building2} label="Active schools" value={stats?.activeSchools} accent />
        <StatCard icon={GraduationCap} label="Total students" value={stats?.totalStudents} />
        <StatCard
          icon={Wallet}
          label="Fees processed (all schools)"
          value={stats ? formatNaira(stats.totalFeesProcessed) : undefined}
          hint="Each school's own money — routed to their own Paystack account, shown here for monitoring only"
        />
        <StatCard
          icon={TrendingUp}
          label="Omni1OS subscription revenue"
          value={stats ? formatNaira(stats.subscriptionRevenue) : undefined}
          hint="Termly — set each school's per-student rate in Settings → Billing Calculator"
        />
        <StatCard icon={Clock} label="Pending approvals" value={stats?.pendingApprovals} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-[var(--text-dim)]">
        <Icon size={15} />
        <span className="text-xs">{label}</span>
      </div>
      <p
        className="font-data mt-3 text-2xl font-semibold"
        style={accent ? { color: "var(--purple)" } : undefined}
      >
        {value ?? "—"}
      </p>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-[var(--text-faint)]">{hint}</p>}
    </div>
  );
}

function formatNaira(amount: number) {
  return "₦" + amount.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}
