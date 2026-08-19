"use client";

import { createContext, useContext } from "react";

export type Admin = { id: string; email: string; full_name: string | null; is_super_admin: boolean };

const AdminContext = createContext<Admin | null>(null);

export function AdminProvider({ admin, children }: { admin: Admin; children: React.ReactNode }) {
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>;
}

// Every page under /omni-admin renders inside AdminShell, which always
// provides this — so a null return here means the provider is missing,
// not that the admin is unauthenticated (that's already handled in
// omni-admin/layout.tsx before any page renders).
export function useAdmin(): Admin {
  const admin = useContext(AdminContext);
  if (!admin) throw new Error("useAdmin() called outside AdminProvider");
  return admin;
}
