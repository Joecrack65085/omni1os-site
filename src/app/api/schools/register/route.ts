// src/app/api/schools/register/route.ts
// Public endpoint — no auth required, this is how a new customer signs up.
// Uses the service role key because the submitter has no account yet.
// Every new row lands with status: 'pending' — RLS on the main system
// (see 002_tenant_isolation.sql) means nobody can access anything for
// this school until a platform admin approves it.
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const LOGO_MAX_BYTES = 80 * 1024;

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "school"
  );
}

function randomCode(len = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const schoolName = String(form.get("schoolName") || "").trim();
    const contactEmail = String(form.get("contactEmail") || "").trim();
    const contactPhone = String(form.get("contactPhone") || "").trim();
    const address = String(form.get("address") || "").trim();
    const themeMode = String(form.get("themeMode") || "auto");
    const themePreset = form.get("themePreset") ? String(form.get("themePreset")) : null;
    const autoPaletteRaw = form.get("autoPalette");
    const logo = form.get("logo") as File | null;

    if (!schoolName || schoolName.length < 3) {
      return NextResponse.json({ error: "Please enter a valid school name." }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      return NextResponse.json({ error: "Please enter a valid contact email." }, { status: 400 });
    }
    if (!contactPhone || contactPhone.length < 6) {
      return NextResponse.json({ error: "Please enter a valid contact phone number." }, { status: 400 });
    }
    if (!logo) {
      return NextResponse.json({ error: "A logo is required." }, { status: 400 });
    }
    if (logo.size > LOGO_MAX_BYTES) {
      return NextResponse.json({ error: "Logo must be 80kb or smaller." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Unique slug: base name, then append a short random suffix on collision
    const base = slugify(schoolName);
    let slug = base;
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await admin.from("schools").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = `${base}-${randomCode(3).toLowerCase()}`;
    }

    let schoolCode = randomCode(5);
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await admin.from("schools").select("id").eq("school_code", schoolCode).maybeSingle();
      if (!existing) break;
      schoolCode = randomCode(5);
    }

    let themeTokens: Record<string, unknown> = {};
    if (themeMode === "auto" && autoPaletteRaw) {
      try {
        const palette = JSON.parse(String(autoPaletteRaw));
        themeTokens = { palette };
      } catch {
        // ignore malformed palette, falls back to defaults at approval time
      }
    }

    const { data: school, error: insertError } = await admin
      .from("schools")
      .insert({
        name: schoolName,
        slug,
        school_code: schoolCode,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address,
        status: "pending",
        theme_mode: themeMode === "preset" ? "preset" : "auto",
        theme_preset: themeMode === "preset" ? themePreset : null,
        theme_tokens: themeTokens,
      })
      .select("id, slug, school_code")
      .single();

    if (insertError || !school) {
      console.error("school insert failed", insertError);
      return NextResponse.json({ error: "Could not save your registration. Please try again." }, { status: 500 });
    }

    // Upload logo to a per-school path in the (pre-existing, public-read) "school-logos" bucket
    const logoBytes = new Uint8Array(await logo.arrayBuffer());
    const logoPath = `${school.id}/logo.jpg`;
    const { error: uploadError } = await admin.storage
      .from("school-logos")
      .upload(logoPath, logoBytes, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      console.error("logo upload failed", uploadError);
      // Don't fail the whole registration over the logo — school can re-upload after approval contact
    } else {
      const { data: publicUrl } = admin.storage.from("school-logos").getPublicUrl(logoPath);
      await admin
        .from("schools")
        .update({ logo_url: publicUrl.publicUrl, logo_size_bytes: logoBytes.byteLength })
        .eq("id", school.id);
    }

    // Placeholder payment settings row so the school's Paystack setup page
    // has something to update against once they're approved.
    await admin.from("school_payment_settings").insert({ school_id: school.id }).select().maybeSingle();

    return NextResponse.json({ ok: true, schoolCode: school.school_code });
  } catch (err) {
    console.error("registration error", err);
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}
