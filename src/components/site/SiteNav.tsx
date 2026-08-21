"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRegisterModal } from "@/components/RegisterModalContext";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/platform", label: "Platform" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about-us", label: "About us" },
  { href: "/faq", label: "FAQ" },
];

const LOGIN_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
  : "http://localhost:3000/login";

export default function SiteNav() {
  const { openRegisterModal } = useRegisterModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on route change, and stop background scroll while it's open.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <img src="/brand/omni1os-logo.png" alt="Omni1OS" className="h-8 w-auto object-contain sm:h-10" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[var(--text-dim)] md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[var(--text)]">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={LOGIN_URL}
            onClick={(e) => e.stopPropagation()}
            className="hidden rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 md:inline-block"
          >
            Log in
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation(); // don't let this click count toward the admin gesture
              openRegisterModal();
            }}
            className="rounded-full px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:scale-105 hover:shadow-lg sm:px-4 sm:text-sm"
            style={{ background: "var(--gradient-brand)" }}
          >
            Get Started
          </button>

          {/* Mobile menu toggle — only the links + login live behind this below md */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text)] md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`overflow-hidden border-t border-[var(--border)] bg-[var(--bg)] transition-[max-height] duration-300 ease-in-out md:hidden ${
          menuOpen ? "max-h-96" : "max-h-0 border-t-0"
        }`}
      >
        <nav className="flex flex-col px-4 py-3 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg px-2 py-3 text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--text)]"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={LOGIN_URL}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-center font-medium text-white"
          >
            Log in
          </a>
        </nav>
      </div>
    </header>
  );
}
