"use client";

import { useState } from "react";
import RegisterSchoolModal from "@/components/RegisterSchoolModal";

const TIERS = [
  {
    name: "Starter",
    id: "tier-starter",
    href: "#",
    priceMonthly: "₦15,000",
    description: "The essentials to get your small school or daycare up and running.",
    features: ["Up to 100 Students", "Basic Academics & Grading", "Parent Portal", "Email Support"],
    featured: false,
  },
  {
    name: "Professional",
    id: "tier-professional",
    href: "#",
    priceMonthly: "₦35,000",
    description: "A comprehensive plan that scales with your growing institution.",
    features: [
      "Up to 500 Students",
      "Paystack Fee Collection",
      "Gatepass System",
      "Staff Payroll",
      "Priority Support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "#",
    priceMonthly: "Custom",
    description: "Dedicated support and infrastructure for large group schools.",
    features: [
      "Unlimited Students",
      "Multi-Campus Management",
      "Custom Branding & Themes",
      "Dedicated Account Manager",
      "24/7 Phone Support",
    ],
    featured: false,
  },
];

export default function PricingPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-[#E1007F]">Pricing</h2>
            <p className="font-display mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Pricing plans for schools of all sizes
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-[var(--text-dim)]">
            Choose an affordable plan that fits your school&apos;s needs. All plans include a 14-day free trial, no credit card required.
          </p>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-3xl p-8 xl:p-10 ${
                  tier.featured
                    ? "bg-[var(--surface-2)] ring-2 ring-[#4F8EF7]"
                    : "ring-1 ring-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={`text-lg font-semibold leading-8 ${
                      tier.featured ? "text-white" : "text-white"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  {tier.featured ? (
                    <p className="rounded-full bg-[#4F8EF7]/10 px-2.5 py-1 text-xs font-semibold leading-5 text-[#4F8EF7]">
                      Most popular
                    </p>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--text-dim)]">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">{tier.priceMonthly}</span>
                  {tier.priceMonthly !== "Custom" && <span className="text-sm font-semibold leading-6 text-[var(--text-faint)]">/month</span>}
                </p>
                <button
                  onClick={() => setShowRegister(true)}
                  aria-describedby={tier.id}
                  className={`mt-6 block w-full rounded-md px-3 py-2.5 text-center text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    tier.featured
                      ? "bg-[#4F8EF7] text-white hover:bg-[#3d7be5] focus-visible:outline-[#4F8EF7]"
                      : "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white"
                  }`}
                >
                  Get started
                </button>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-[var(--text-dim)]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-[#4F8EF7]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showRegister && <RegisterSchoolModal onClose={() => setShowRegister(false)} />}
    </>
  );
}
