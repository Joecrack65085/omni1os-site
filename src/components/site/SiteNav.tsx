"use client";

import { useRegisterModal } from "@/components/RegisterModalContext";
import Link from "next/link";

export default function SiteNav() {
  const { openRegisterModal } = useRegisterModal();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/brand/omni1os-logo.png" alt="Omni1OS" className="h-8 sm:h-10 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[var(--text-dim)] md:flex">
          <Link href="/" className="hover:text-[var(--text)]">Home</Link>
          <Link href="/platform" className="hover:text-[var(--text)]">Platform</Link>
          <Link href="/how-it-works" className="hover:text-[var(--text)]">How it works</Link>
          <Link href="/about-us" className="hover:text-[var(--text)]">About us</Link>
          <Link href="/faq" className="hover:text-[var(--text)]">FAQ</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : "http://localhost:3000/login"}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full bg-white/5 border border-white/10 px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 inline-block whitespace-nowrap"
          >
            Log in
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openRegisterModal();
            }}
            className="rounded-full px-4 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm transition-all hover:scale-105 hover:shadow-lg whitespace-nowrap"
            style={{ background: "var(--gradient-brand)" }}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
