import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 md:py-36">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        About Omni1OS
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--text-dim)]">
        Omni1OS was built to solve the fragmentation problem in school administration. 
        Most schools currently juggle between five and ten different platforms to manage 
        their admissions, fees, academics, attendance, and communication. We built one 
        platform that does it all.
      </p>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <p className="mt-4 text-[var(--text-dim)]">
          To provide an intelligent, unified operating system that empowers schools to 
          focus on education, while we handle the operational complexity seamlessly.
        </p>
      </div>

      <div className="mt-16 rounded-2xl border border-[var(--border-strong)] bg-white/5 p-8 backdrop-blur-sm">
        <h2 className="text-xl font-semibold">Ready to unify your school?</h2>
        <div className="mt-6">
          <Link
            href="/"
            className="rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: "var(--gradient-brand)" }}
          >
            Go back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
