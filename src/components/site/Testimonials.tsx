"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";

// Drop real testimonials in here as you collect them from actual schools —
// { quote, name, role, school }. Left empty on purpose: a landing page
// should never put words in a real (or real-sounding) person's mouth that
// they didn't actually say.
const TESTIMONIALS: { quote: string; name: string; role: string; school: string }[] = [];

export default function Testimonials() {
  const [i, setI] = useState(0);

  if (TESTIMONIALS.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Early days</span>
        <h2 className="font-display mt-2 text-3xl font-semibold">You could be our first story</h2>
        <div className="surface-card mx-auto mt-8 max-w-lg p-8">
          <Sparkles size={20} className="mx-auto text-[var(--purple)]" />
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-dim)]">
            Omni1OS is onboarding its first schools right now. Register yours today and this space
            will feature your school&apos;s own experience — real feedback, not stock quotes.
          </p>
        </div>
      </section>
    );
  }

  const t = TESTIMONIALS[i];
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <span className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Loved by educators</span>
      <h2 className="font-display mt-2 text-3xl font-semibold">What schools are saying</h2>

      <div className="surface-card relative mx-auto mt-8 max-w-lg p-8">
        <Quote size={22} className="mx-auto mb-3 text-[var(--purple)]" />
        <p className="text-sm leading-relaxed text-[var(--text-dim)]">{t.quote}</p>
        <p className="mt-5 text-sm font-medium">{t.name}</p>
        <p className="text-xs text-[var(--text-faint)]">{t.role}, {t.school}</p>

        {TESTIMONIALS.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => setI((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} aria-label="Previous">
              <ChevronLeft size={18} className="text-[var(--text-faint)] hover:text-[var(--text)]" />
            </button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, idx) => (
                <span
                  key={idx}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: idx === i ? "var(--purple)" : "var(--border-strong)" }}
                />
              ))}
            </div>
            <button onClick={() => setI((p) => (p + 1) % TESTIMONIALS.length)} aria-label="Next">
              <ChevronRight size={18} className="text-[var(--text-faint)] hover:text-[var(--text)]" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
