import Features from "@/components/site/Features";

export const metadata = {
  title: "Features",
  description: "Explore the powerful features of Omni1OS that help you manage your school from a single dashboard.",
};

export default function FeaturesPage() {
  return (
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Everything your school needs.
        </h1>
        <p className="mt-6 text-lg leading-8 text-[var(--text-dim)]">
          From academics and fee collection to gatepass management and payroll. Omni1OS connects every department into one seamless ecosystem.
        </p>
      </div>
      <div className="mt-8">
        <Features />
      </div>
    </div>
  );
}
