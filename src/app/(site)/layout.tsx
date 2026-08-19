"use client";

import AdminGestureLayer from "@/components/AdminGestureLayer";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { RegisterModalProvider } from "@/components/RegisterModalContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <RegisterModalProvider>
      <AdminGestureLayer>
        <SiteNav />
        {children}
        <SiteFooter />
      </AdminGestureLayer>
    </RegisterModalProvider>
  );
}
