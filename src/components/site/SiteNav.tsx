"use client";

import { useRegisterModal } from "@/components/RegisterModalContext";
import Link from "next/link";

export default function SiteNav() {
  const { openRegisterModal } = useRegisterModal();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <img src="/brand/omni1os-logo.png" alt="Omni1OS" className="h-10 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[var(--text-dim)] md:flex">
          <Link href="/" className="hover:text-[var(--text)]">Home</Link>
          <Link href="/platform" className="hover:text-[var(--text)]">Platform</Link>
          <Link href="/how-it-works" className="hover:text-[var(--text)]">How it works</Link>
          <Link href="/about-us" className="hover:text-[var(--text)]">About us</Link>
          <Link href="/faq" className="hover:text-[var(--text)]">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : "http://localhost:3000/login"}
            onClick={(e) => e.stopPropagation()}
            className="hidden rounded-full bg-white/5 border border-white/10 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 sm:inline-block"
          >
            Log in
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation(); // don't let this click count toward the admin gesture
              openRegisterModal();
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: "var(--gradient-brand)" }}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
