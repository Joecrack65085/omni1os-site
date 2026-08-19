"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error("Incorrect email or password.");
      }

      // Confirm this account is actually a platform admin before letting
      // the browser think it's "in" — a valid Supabase Auth login alone
      // (e.g. a school director's own account) must NOT be enough.
      const res = await fetch("/api/admin/whoami");
      if (!res.ok) {
        await supabase.auth.signOut();
        throw new Error("This account doesn't have Omni1OS admin access.");
      }

      router.push("/omni-admin");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--text-dim)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "var(--gradient-brand-soft)" }}
          >
            <Lock size={16} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold leading-none">Omni1OS Admin</h2>
            <p className="mt-1 text-xs text-[var(--text-dim)]">Platform team sign-in</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            required
            autoFocus
            placeholder="you@omni1os.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="site-input"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="site-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full py-2.5 text-sm font-medium text-white disabled:opacity-60"
          style={{ background: "var(--gradient-brand)" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <style jsx global>{`
        .site-input {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--text);
        }
        .site-input::placeholder { color: var(--text-faint); }
        .site-input:focus { border-color: var(--purple); outline: none; }
      `}</style>
    </div>
  );
}
