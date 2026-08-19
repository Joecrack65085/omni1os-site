// src/lib/supabase/client.ts
// Browser client — safe to use in client components. Only ever uses the
// public anon key. Auth is used here purely for the platform-admin login
// (Supabase Auth session) — school registration itself does NOT require
// an account, it goes through the service-role API route instead.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
