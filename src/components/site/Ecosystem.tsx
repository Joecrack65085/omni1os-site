"use client";

import { useState } from "react";
import { Check, Building2, GraduationCap, Heart, Backpack } from "lucide-react";

const TABS = [
  {
    key: "schools",
    label: "For Schools",
    icon: Building2,
    points: [
      "Centralise every school operation in one dashboard",
      "Improve staff productivity and save admin time",
      "Make data-driven decisions with real reports",
      "Scale from one campus to a network with ease",
    ],
  },
  {
    key: "teachers",
    label: "For Teachers",
    icon: GraduationCap,
    points: [
      "Take attendance and enter results in minutes, not hours",
      "Set assignments and CBT exams from your phone",
      "Message parents directly, no more lost paper notes",
      "See your timetable and classes at a glance",
    ],
  },
  {
    key: "parents",
    label: "For Parents",
    icon: Heart,
    points: [
      "Pay fees by card, transfer or USSD in one tap",
      "Get instant alerts on results, attendance and events",
      "Message teachers directly through the app",
      "Track your child's progress all through the term",
    ],
  },
  {
    key: "students",
    label: "For Students",
    icon: Backpack,
    points: [
      "Sit computer-based tests without paper or queues",
      "Check results and report cards the moment they're out",
      "See homework and class updates in one place",
      "Access everything from any device, anywhere",
    ],
  },
] as const;

export default function Ecosystem() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("schools");
  const tab = TABS.find((t) => t.key === active)!;

  return (
    <section id="ecosystem" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>
          <span className="text-xs uppercase tracking-wider text-[var(--text-faint)]">
            One platform, many possibilities
          </span>
          <h2 className="font-display mt-2 text-3xl font-semibold">
            A complete ecosystem for <span className="text-gradient">modern schools</span>
          </h2>

          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                  active === t.key
                    ? "border-transparent text-white"
                    : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
                }`}
                style={active === t.key ? { background: "var(--gradient-brand)" } : undefined}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </div>

          <ul className="mt-7 space-y-3">
            {tab.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-[var(--text-dim)]">
                <span
                  className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--gradient-brand-soft)" }}
                >
                  <Check size={11} className="text-[var(--purple)]" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <AppStackIllustration active={active} />
      </div>
    </section>
  );
}

// Original illustration (no stock imagery) — three floating "app" cards
// stacked to suggest the staff/parent/student surfaces of one connected
// system, with the active role's card brought forward and highlighted.
function AppStackIllustration({ active }: { active: string }) {
  const cards = [
    { key: "schools", label: "Admin Dashboard", rot: -6, x: -8, y: 10 },
    { key: "teachers", label: "Teacher App", rot: 3, x: 6, y: -6 },
    { key: "parents", label: "Parent App", rot: -2, x: 16, y: 22 },
    { key: "students", label: "Student App", rot: 5, x: -18, y: 30 },
  ];

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md" aria-hidden="true">
      <div
        className="absolute inset-8 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      {cards.map((c, i) => {
        const isActive = c.key === active;
        return (
          <div
            key={c.key}
            className="absolute left-1/2 top-1/2 w-52 rounded-2xl border p-4 shadow-2xl transition-all duration-300"
            style={{
              transform: `translate(-50%, -50%) translate(${c.x}px, ${c.y}px) rotate(${isActive ? 0 : c.rot}deg) scale(${isActive ? 1.08 : 0.92})`,
              zIndex: isActive ? 10 : i,
              background: isActive ? "var(--surface-2)" : "var(--surface)",
              borderColor: isActive ? "var(--purple)" : "var(--border)",
              opacity: isActive ? 1 : 0.55,
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--gradient-brand)" }} />
              <span className="text-[11px] font-medium text-[var(--text-dim)]">{c.label}</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-3/4 rounded-full bg-white/10" />
              <div className="h-2 w-1/2 rounded-full bg-white/10" />
              <div className="h-2 w-2/3 rounded-full bg-white/10" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
