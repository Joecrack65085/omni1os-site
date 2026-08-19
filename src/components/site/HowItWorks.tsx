const STEPS = [
  {
    n: "01",
    title: "Register your school",
    body: "Tell us about your school and upload your logo. Takes about three minutes  no card required.",
  },
  {
    n: "02",
    title: "We review & approve",
    body: "Our team checks your details are complete, then approves your account. You'll get an email the moment you're in.",
  },
  {
    n: "03",
    title: "Your school goes live",
    body: "Sign in, connect your own Paystack account, invite your staff, and start running your school on Omni1OS.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <span className="text-xs uppercase tracking-wider text-[var(--text-faint)]">How it works</span>
        <h2 className="font-display mt-2 max-w-md text-3xl font-semibold">From sign-up to live in three steps</h2>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              <span className="font-data text-3xl font-semibold text-[var(--text-faint)]">{s.n}</span>
              <h3 className="font-display mt-3 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{s.body}</p>
              {i < STEPS.length - 1 && (
                <span
                  className="absolute right-[-1rem] top-2 hidden h-px w-8 md:block"
                  style={{ background: "var(--gradient-brand)" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
