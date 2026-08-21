"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Settings, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminProvider } from "./AdminContext";

type Admin = { id: string; email: string; full_name: string | null; is_super_admin: boolean };

const NAV = [
  { href: "/omni-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/omni-admin/schools", label: "Schools", icon: Building2 },
  { href: "/omni-admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ admin, children }: { admin: Admin; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer on route change, and stop background scroll while it's open.
  useEffect(() => setNavOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const SidebarContent = (
    <>
      <div className="mb-8 flex items-center gap-2 px-1">
        <img src="/brand/omni1os-logo.png" alt="" className="h-7 w-7 object-contain" />
        <span className="font-display text-sm font-semibold">Omni1OS Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm ${
                active ? "bg-[var(--surface)] text-[var(--text)]" : "text-[var(--text-dim)] hover:bg-[var(--surface)]"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--border)] pt-4">
        <p className="truncate text-xs text-[var(--text-dim)]">{admin.full_name || admin.email}</p>
        <p className="text-[11px] text-[var(--text-faint)]">{admin.is_super_admin ? "Super admin" : "Admin"}</p>
        <button
          onClick={handleLogout}
          className="mt-3 flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Desktop sidebar — unchanged, just hidden below lg */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] p-5 lg:flex">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <img src="/brand/omni1os-logo.png" alt="" className="h-6 w-6 object-contain" />
          <span className="font-display text-sm font-semibold">Omni1OS Admin</span>
        </div>
        <button
          onClick={() => setNavOpen((v) => !v)}
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
        >
          {navOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer + backdrop */}
      {navOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setNavOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80vw] flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] p-5 transition-transform duration-200 lg:hidden ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {SidebarContent}
      </aside>

      <main className="flex-1 overflow-y-auto p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
        <AdminProvider admin={admin}>{children}</AdminProvider>
      </main>
    </div>
  );
}
