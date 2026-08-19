"use client";

const SCHOOLS = ["Greenfield Int'l", "Kings College", "Rollers Int'l", "Ajegunle High", "Hallmark High"];

export default function TrustedBy() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-8 sm:flex-row sm:justify-between">
        <span className="text-xs uppercase tracking-wider text-[var(--text-faint)] whitespace-nowrap">
          Trusted by schools like
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {SCHOOLS.map((name) => (
            <span key={name} className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                {name.charAt(0)}
              </span>
              {name}
            </span>
          ))}
        </div>
        <span
          className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          Growing every term
        </span>
      </div>
    </section>
  );
}
