# Omni1OS — Public Site + Platform Admin

This is the customer-facing Omni1OS site: marketing pages, the "Register
your school" flow, and the hidden Omni1OS platform-admin dashboard. It's a
**separate deployment** from the school system itself (that's the other
zip) — this is what runs at `omni1os.com`, the school system runs at each
school's own subdomain/URL.

Both projects point at the **same Supabase project** — the `schools`,
`platform_admins`, and `school_payment_settings` tables created by the
migrations in `/omni1os_migrations` are shared between them.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project
   URL, anon key, and service role key.
3. Run, in order, against your Supabase project's SQL editor (if you
   haven't already from the previous phase):
   - `001_saas_foundation.sql`
   - `002_tenant_isolation.sql`
   - `003_school_logos_storage.sql` (new — creates the public logo bucket)
4. Create `jonahamande@gmail.com` as a Supabase Auth user (Dashboard →
   Authentication → Users → Add user) if you haven't yet, then re-run the
   seed block at the bottom of `001_saas_foundation.sql`.
5. `npm run dev`

## What's here

- **`/`** — the marketing site. Clicking anywhere on the page 7 times
  (within ~2.5s of each other) opens the hidden platform-admin login
  modal — there is no visible button for it anywhere, by design.
- **"Register your school"** — a 3-step modal: school details → logo
  upload with an in-browser crop tool that compresses the final file to
  80kb or smaller → theme choice (auto-matched to the logo's colours, or
  one of six presets). Submits to `/api/schools/register`, which creates
  the school with `status: pending` — no further access until approved.
- **`/omni-admin`** — gated by real auth (Supabase session +
  membership in `platform_admins`, checked server-side in the layout
  *and* independently in every API route — a school director's own login
  is never enough to reach this, even if they somehow got a valid
  session). Contains:
  - **Dashboard** — total schools, active schools, total students,
    aggregate fees processed across all schools (informational only —
    each school's own money, in their own Paystack account), pending
    approvals.
  - **Schools** — every registered school with student count, fees
    processed, Paystack connection status. Approve / reject / deactivate /
    reactivate / permanently delete (delete is restricted to the super
    admin). Approval is blocked with a clear error if required fields
    (name, contact email, contact phone, logo) are missing — this is the
    "no approval, no access" gate from the brief, enforced in the API, not
    just the UI.
  - **Settings** — invite additional platform admins (super-admin only;
    sends a Supabase Auth invite email).

## Design notes

Dark, deep-indigo palette pulled directly from the logo's magenta →
violet → blue gradient, `Sora` for display type, `Inter` for body copy,
and `IBM Plex Mono` reserved specifically for numbers (stats, school
codes, currency) so data always reads distinctly from prose. The hero's
signature element is a small animated lattice of cubes — a nod to the
logo's cube mark, reframed as many schools connected by one system.

## What's intentionally not built yet

- Omni1OS's own subscription billing (schools paying Omni1OS) — the
  dashboard has a placeholder for this revenue figure
- Per-school Paystack secret key entry UI (the `school_payment_settings`
  table and RLS already exist; the settings page inside the *school
  system* to enter/encrypt the key is the next phase)
- Auto-theme resolution being applied inside the school system itself —
  today it's captured at registration (`theme_mode` / `theme_tokens` /
  `theme_preset` columns) but the school app doesn't read it yet
