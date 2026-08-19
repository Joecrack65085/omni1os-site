// src/lib/supabase/admin.ts
// SERVER-ONLY. Uses the service role key, which bypasses Row Level
// Security entirely. Never import this file from a client component —
// it must only ever be used inside route handlers (src/app/api/**).
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
