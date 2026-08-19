import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const viewport: Viewport = {
  themeColor: "#0E0A1A",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Omni1OS",
    default: "Omni1OS The Intelligent School OS",
  },
  description:
    "Omni1OS is the intelligent operating system for schools. Admissions, fees, academics, attendance, and communication, run from one dashboard built for your school.",
  icons: { icon: "/brand/omni1os-logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1E1730",
              color: "#F5F3FB",
              border: "1px solid rgba(255,255,255,0.09)",
            },
          }}
        />
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
