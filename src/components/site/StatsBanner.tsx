"use client";

import { useEffect, useState } from "react";
import { School, Users, GraduationCap, Sparkles } from "lucide-react";

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K+";
  return String(n);
}

export default function StatsBanner() {
  const [stats, setStats] = useState<{ schools: number; students: number; teachers: number } | null>(null);

  useEffect(() => {
    fetch("/api/public/platform-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  const items = [
    { icon: School, value: stats ? formatCount(stats.schools) : "—", label: "Schools live on Omni1OS" },
    { icon: Users, value: stats ? formatCount(stats.students) : "—", label: "Students managed" },
    { icon: GraduationCap, value: stats ? formatCount(stats.teachers) : "—", label: "Teachers & staff" },
    { icon: Sparkles, value: "100%", label: "Fees settle to schools' own accounts" },
  ];

  return (
    <section className="border-y border-[var(--border)]" style={{ background: "var(--gradient-brand)" }}>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="font-display max-w-md text-2xl font-semibold text-white">
          Growing with every school that comes on board
        </h2>
        <p className="mt-1 text-sm text-white/75">Live numbers, straight from the platform — updated in real time.</p>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map((it) => (
            <div key={it.label}>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <it.icon size={16} className="text-white" />
              </div>
              <p className="font-data text-2xl font-bold text-white">{it.value}</p>
              <p className="mt-0.5 text-xs text-white/70">{it.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
