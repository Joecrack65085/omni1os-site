"use client";

import { Zap, LifeBuoy, ShieldCheck } from "lucide-react";

const FAQS = [
  {
    q: "Does our school's fee money ever pass through Omni1OS?",
    a: "No. Each school connects its own Paystack account, so every payment settles directly to your school — Omni1OS never holds or touches your funds.",
  },
  {
    q: "Can other schools see our data?",
    a: "No. Every school's data is fully isolated at the database level — not just hidden in the interface, but actually inaccessible to any other school's account.",
  },
  {
    q: "What happens during the review period?",
    a: "You can register straight away, but access to the dashboard only opens once our team confirms your school's details are complete and approves the account.",
  },
  {
    q: "Can we change our theme later?",
    a: "Yes — from your school's settings, at any time, whether you started with an auto-matched theme or a preset.",
  },
];

export default function FaqAndCta({ onRegisterClick }: { onRegisterClick: () => void }) {
  return (
    <>
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <span className="text-xs uppercase tracking-wider text-[var(--text-faint)]">FAQ</span>
        <h2 className="font-display mt-2 text-3xl font-semibold">Good to know</h2>

        <div className="mt-8 divide-y divide-[var(--border)]">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {f.q}
                <span className="text-[var(--text-faint)] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div
            className="relative overflow-hidden rounded-[var(--radius-lg)] px-8 py-14 sm:px-14"
            style={{ background: "var(--gradient-brand)" }}
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{ background: "radial-gradient(circle, white, transparent 70%)" }}
            />
            <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="font-display max-w-md text-3xl font-semibold text-white">
                  Ready to transform your school?
                </h2>
                <p className="mt-3 max-w-sm text-sm text-white/80">
                  Join the schools already running on Omni1OS to work smarter and give parents,
                  teachers and students one connected experience.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegisterClick();
                    }}
                    className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--purple)]"
                  >
                    Register your school
                  </button>
                  <a
                    href="#platform"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full border border-white/40 px-6 py-3 text-sm text-white hover:bg-white/10"
                  >
                    See how it works
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                {[
                  { icon: Zap, title: "Quick setup", body: "Get started in minutes" },
                  { icon: LifeBuoy, title: "Real support", body: "We're here when you need us" },
                  { icon: ShieldCheck, title: "Secure & isolated", body: "Your school's data is your own" },
                ].map((c) => (
                  <div key={c.title} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <c.icon size={16} className="text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{c.title}</p>
                      <p className="text-xs text-white/70">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
