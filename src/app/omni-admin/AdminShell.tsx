"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Settings, LogOut } from "lucide-react";
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[var(--bg)] text-[var(--text)]">
      <aside className="flex w-full md:w-60 shrink-0 flex-col border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--bg-elevated)] p-5 md:sticky md:top-0 md:h-screen z-10">
        <div className="mb-4 md:mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <img src="/brand/omni1os-logo.png" alt="" className="h-7 w-7 object-contain" />
            <span className="font-display text-sm font-semibold">Omni1OS Admin</span>
          </div>
          {/* On mobile, show a quick sign out button in the header instead of bottom */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] md:hidden"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <nav className="flex flex-row flex-wrap md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm ${
                  active ? "bg-[var(--surface)] text-[var(--text)]" : "text-[var(--text-dim)] hover:bg-[var(--surface)]"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t border-[var(--border)] pt-4 md:block">
          <p className="truncate text-xs text-[var(--text-dim)]">{admin.full_name || admin.email}</p>
          <p className="text-[11px] text-[var(--text-faint)]">{admin.is_super_admin ? "Super admin" : "Admin"}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 min-w-0">
        <AdminProvider admin={admin}>{children}</AdminProvider>
      </main>
    </div>
  );
}
