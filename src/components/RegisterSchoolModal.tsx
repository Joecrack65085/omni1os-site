"use client";

import { useState } from "react";
import { X, Upload, Check } from "lucide-react";
import toast from "react-hot-toast";
import LogoCropper from "./LogoCropper";
import { THEME_PRESETS, type ThemePresetId } from "@/lib/themePresets";
import { extractPalette } from "@/lib/compressImage";

type Step = "info" | "logo" | "theme" | "done";

export default function RegisterSchoolModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("info");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    schoolName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [autoPalette, setAutoPalette] = useState<string[] | null>(null);

  const [themeMode, setThemeMode] = useState<"auto" | "preset">("auto");
  const [preset, setPreset] = useState<ThemePresetId>("signature");

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function infoValid() {
    return (
      form.schoolName.trim().length > 2 &&
      /\S+@\S+\.\S+/.test(form.contactEmail) &&
      form.contactPhone.trim().length > 6
    );
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file for your logo.");
      return;
    }
    setRawFile(f);
  }

  function handleCropConfirm(result: { blob: Blob; dataUrl: string }) {
    setLogoBlob(result.blob);
    setLogoPreview(result.dataUrl);
    setRawFile(null);

    // Pull a suggested palette from the cropped logo for the "auto theme" option
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d")!.drawImage(img, 0, 0);
      const palette = extractPalette(c);
      if (palette.length) setAutoPalette(palette);
    };
    img.src = result.dataUrl;

    setStep("theme");
  }

  async function handleSubmit() {
    if (!logoBlob) {
      toast.error("Please upload a logo before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("schoolName", form.schoolName.trim());
      fd.append("contactEmail", form.contactEmail.trim());
      fd.append("contactPhone", form.contactPhone.trim());
      fd.append("address", form.address.trim());
      fd.append("themeMode", themeMode);
      if (themeMode === "preset") fd.append("themePreset", preset);
      if (themeMode === "auto" && autoPalette) fd.append("autoPalette", JSON.stringify(autoPalette));
      fd.append("logo", logoBlob, "logo.jpg");

      const res = await fetch("/api/schools/register", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");

      setStep("done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--text-dim)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        >
          <X size={18} />
        </button>

        {step === "info" && (
          <>
            <h2 className="font-display text-2xl font-semibold">Register your school</h2>
            <p className="mt-1 text-sm text-[var(--text-dim)]">
              Tell us about your school. Our team reviews every registration before access opens.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <Field label="School name">
                <input
                  className="site-input"
                  value={form.schoolName}
                  onChange={(e) => updateField("schoolName", e.target.value)}
                  placeholder="e.g. Brightstars International School"
                />
              </Field>
              <Field label="Contact email">
                <input
                  type="email"
                  className="site-input"
                  value={form.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  placeholder="director@yourschool.com"
                />
              </Field>
              <Field label="Contact phone">
                <input
                  className="site-input"
                  value={form.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </Field>
              <Field label="School address">
                <textarea
                  className="site-input min-h-[72px] resize-none"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Street, city, state"
                />
              </Field>
            </div>

            <button
              disabled={!infoValid()}
              onClick={() => setStep("logo")}
              className="mt-6 w-full rounded-full py-3 text-sm font-medium text-white disabled:opacity-40"
              style={{ background: "var(--gradient-brand)" }}
            >
              Continue
            </button>
          </>
        )}

        {step === "logo" && !rawFile && (
          <>
            <h2 className="font-display text-2xl font-semibold">Upload your logo</h2>
            <p className="mt-1 text-sm text-[var(--text-dim)]">
              This appears on your school&apos;s dashboard, receipts, and ID cards. You&apos;ll crop it
              next — final file is capped at 80kb.
            </p>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] py-12 text-[var(--text-dim)] hover:border-[var(--purple)] hover:text-[var(--text)]">
              <Upload size={22} />
              <span className="text-sm">Click to choose an image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFilePicked} />
            </label>

            <button
              onClick={() => setStep("info")}
              className="mt-6 text-sm text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              ← Back
            </button>
          </>
        )}

        {step === "logo" && rawFile && (
          <>
            <h2 className="font-display text-2xl font-semibold">Crop your logo</h2>
            <div className="mt-6">
              <LogoCropper file={rawFile} onCancel={() => setRawFile(null)} onConfirm={handleCropConfirm} />
            </div>
          </>
        )}

        {step === "theme" && (
          <>
            <h2 className="font-display text-2xl font-semibold">Choose a theme</h2>
            <p className="mt-1 text-sm text-[var(--text-dim)]">
              We can match your dashboard to your logo automatically, or you can pick one of our
              preset palettes now — either way, this can be changed later in settings.
            </p>

            {logoPreview && (
              <img
                src={logoPreview}
                alt="Your uploaded logo"
                className="mx-auto mt-4 h-16 w-16 rounded-full border border-[var(--border-strong)] object-cover"
              />
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setThemeMode("auto")}
                className={`flex items-center gap-3 rounded-[var(--radius-sm)] border p-3 text-left ${
                  themeMode === "auto" ? "border-[var(--purple)]" : "border-[var(--border)]"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)]">
                  {themeMode === "auto" && <Check size={14} />}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">Match my logo</span>
                  <span className="block text-xs text-[var(--text-dim)]">
                    We pull colours straight from what you uploaded
                  </span>
                </span>
                <span className="flex gap-1">
                  {(autoPalette || ["#E1007F", "#8B5CF6", "#4F8EF7"]).map((c) => (
                    <span key={c} className="h-5 w-5 rounded-full border border-white/10" style={{ background: c }} />
                  ))}
                </span>
              </button>

              <button
                onClick={() => setThemeMode("preset")}
                className={`rounded-[var(--radius-sm)] border p-3 text-left ${
                  themeMode === "preset" ? "border-[var(--purple)]" : "border-[var(--border)]"
                }`}
              >
                <span className="mb-3 flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)]">
                    {themeMode === "preset" && <Check size={14} />}
                  </span>
                  <span className="text-sm font-medium">Pick a preset</span>
                </span>
                <span className="grid grid-cols-3 gap-2 pl-9">
                  {THEME_PRESETS.map((p) => (
                    <span
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setThemeMode("preset");
                        setPreset(p.id);
                      }}
                      className={`rounded-[10px] border p-2 text-center text-[11px] ${
                        themeMode === "preset" && preset === p.id
                          ? "border-[var(--purple)]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <span className="mb-1 flex justify-center gap-0.5">
                        {p.colors.map((c) => (
                          <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
                        ))}
                      </span>
                      {p.label}
                    </span>
                  ))}
                </span>
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep("logo")}
                className="flex-1 rounded-full border border-[var(--border-strong)] py-3 text-sm text-[var(--text-dim)] hover:text-[var(--text)]"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-full py-3 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: "var(--gradient-brand)" }}
              >
                {submitting ? "Submitting…" : "Submit for approval"}
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="py-6 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "var(--gradient-brand-soft)" }}
            >
              <Check size={26} />
            </div>
            <h2 className="font-display mt-4 text-2xl font-semibold">Registration received</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-dim)]">
              Our team is reviewing {form.schoolName || "your school"}&apos;s details now. You&apos;ll
              get an email at <span className="text-[var(--text)]">{form.contactEmail}</span> as soon
              as you&apos;re approved and ready to sign in.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full px-6 py-2.5 text-sm font-medium text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              Done
            </button>
          </div>
        )}
      </div>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[var(--text-dim)]">{label}</span>
      {children}
    </label>
  );
}
