"use client";
import { useState, useEffect } from "react";
import RegisterSchoolModal from "@/components/RegisterSchoolModal";
import Link from "next/link";

const IMAGES = [
  "/brand/hero-bg-1.webp",
  "/brand/hero-bg-2.webp",
  "/brand/hero-bg-3.webp"
];

export default function Hero() {
  const [showRegister, setShowRegister] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IMAGES.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section id="top" className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 10%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(50% 40% at 10% 0%, rgba(225,0,127,0.14), transparent 60%)",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-24 pt-20 md:grid-cols-[1.1fr_0.9fr] md:pb-36 md:pt-32">
          <div>
            <img
              src="/brand/hero-logo.png"
              alt="Omni1OS - The Intelligent School OS"
              className="h-24 w-auto mb-6 object-contain drop-shadow-2xl"
            />

            <h1 className="font-display mt-5 text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              One dashboard.
              <br />
              <span className="text-gradient">Every part of your school.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--text-dim)]">
              Admissions, fees, academics, attendance, gatepass, payroll and parent communication.
              Omni1OS runs it all from a dashboard shaped around your school, with your logo, your
              colours, and your own Paystack account for fee collection.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRegister(true);
                }}
                className="rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
                style={{ background: "var(--gradient-brand)" }}
              >
                Start free trial
              </button>
              <Link
                href="/features"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full border border-[var(--border-strong)] px-6 py-3 text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
              >
                Explore features
              </Link>
            </div>

          <div className="mt-10 flex gap-8 font-data text-sm">
            <div>
              <p className="text-lg font-semibold">14 days</p>
              <p className="text-xs text-[var(--text-faint)]">free trial per school</p>
            </div>
            <div>
              <p className="text-lg font-semibold">100%</p>
              <p className="text-xs text-[var(--text-faint)]">fees go to your own Paystack</p>
            </div>
            <div>
              <p className="text-lg font-semibold">0</p>
              <p className="text-xs text-[var(--text-faint)]">schools can see each other&apos;s data</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-12 w-full max-w-2xl lg:mt-0 lg:max-w-none">
          <div className="relative rounded-2xl bg-white/5 ring-1 ring-white/10 p-2 shadow-2xl backdrop-blur-sm transition-transform hover:scale-[1.02] duration-500">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[var(--surface-2)] relative aspect-video">
              {IMAGES.map((src, idx) => (
                <img
                  key={src}
                  src={src}
                  alt={`Omni1OS Dashboard Preview ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover shadow-2xl transition-opacity duration-1000 ease-in-out ${
                    idx === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>
          {/* Decorative glow behind the image */}
          <div
            className="absolute -inset-4 -z-10 animate-pulse rounded-full opacity-30 blur-2xl"
            style={{ background: "var(--gradient-brand)" }}
          />
        </div>
      </div>
    </section>
    {showRegister && <RegisterSchoolModal onClose={() => setShowRegister(false)} />}
    </>
  );
}


