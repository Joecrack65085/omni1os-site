"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { UserPlus, ShieldCheck, Trash2, Calculator } from "lucide-react";
import { useAdmin } from "../AdminContext";

type AdminRow = { id: string; email: string; full_name: string | null; is_super_admin: boolean; created_at: string };
type SchoolRow = {
  id: string;
  name: string;
  status: string;
  studentCount: number;
  amount_per_student: number;
};

function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function SettingsPage() {
  const me = useAdmin();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ── Billing calculator ──
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [rateInput, setRateInput] = useState("");
  const [savingRate, setSavingRate] = useState(false);

  const loadSchools = useCallback(async () => {
    setSchoolsLoading(true);
    try {
      const res = await fetch("/api/admin/schools");
      const json = await res.json();
      const rows: SchoolRow[] = (json.schools || []).map((s: { id: string; name: string; status: string; studentCount: number; amount_per_student: number; created_at: string; }) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        studentCount: s.studentCount || 0,
        amount_per_student: Number(s.amount_per_student) || 0,
        created_at: s.created_at,
      }));
      setSchools(rows);
    } catch {
      toast.error("Failed to load schools");
    } finally {
      setSchoolsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  const selectedSchool = schools.find((s) => s.id === selectedId) || null;

  useEffect(() => {
    if (selectedSchool) setRateInput(selectedSchool.amount_per_student ? String(selectedSchool.amount_per_student) : "");
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const previewTotal = useMemo(() => {
    if (!selectedSchool) return 0;
    const rate = Number(rateInput) || 0;
    return rate * selectedSchool.studentCount;
  }, [rateInput, selectedSchool]);

  const platformTotal = useMemo(
    () => schools.filter((s) => s.status === "active").reduce((sum, s) => sum + s.studentCount * s.amount_per_student, 0),
    [schools]
  );

  async function handleSaveRate() {
    if (!selectedSchool) return;
    const rate = Number(rateInput);
    if (!Number.isFinite(rate) || rate < 0) {
      toast.error("Enter a valid non-negative amount");
      return;
    }
    setSavingRate(true);
    try {
      const res = await fetch(`/api/admin/schools/${selectedSchool.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_billing_rate", amount_per_student: rate }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast.success(`Rate saved for ${selectedSchool.name}`);
      setSchools((prev) => prev.map((s) => (s.id === selectedSchool.id ? { ...s, amount_per_student: rate } : s)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingRate(false);
    }
  }

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/admins");
    const json = await res.json();
    setAdmins(json.admins || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invite failed");
      toast.success(`Invite sent to ${email}`);
      setEmail("");
      setFullName("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(a: AdminRow) {
    if (!confirm(`Remove ${a.full_name || a.email} as an admin? They'll lose all platform access immediately.`)) return;
    setRemovingId(a.id);
    try {
      const res = await fetch(`/api/admin/admins/${a.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Remove failed");
      toast.success("Admin removed");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-[var(--text-dim)]">Manage who has Omni1OS platform admin access.</p>

      <div className="surface-card mt-6 p-5 text-xs text-[var(--text-dim)]">
        <p className="mb-1.5"><span className="font-medium text-[var(--text)]">Admin</span> — can invite other admins, approve/suspend schools. Cannot delete a school or remove other admins.</p>
        <p><span className="font-medium text-[var(--purple)]">Super admin</span> — everything an Admin can do, plus deleting schools and removing admins.</p>
      </div>

      <div className="surface-card mt-4 p-5">
        <div className="mb-1 flex items-center gap-2">
          <Calculator size={16} className="text-[var(--purple)]" />
          <h2 className="text-sm font-medium">Billing calculator</h2>
        </div>
        <p className="mb-4 text-[11px] text-[var(--text-faint)]">
          Set each school&apos;s termly per-student rate. This is what feeds the &quot;Omni1OS subscription
          revenue&quot; number on the Dashboard — <span className="font-data">student count × rate</span>, summed
          across every active school, each term.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-xs text-[var(--text-dim)]">
            School
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="site-input"
            >
              <option value="">{schoolsLoading ? "Loading…" : "Select a school"}</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentCount} student{s.studentCount === 1 ? "" : "s"})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--text-dim)] sm:w-48">
            Amount per student (₦, termly)
            <input
              type="number"
              min={0}
              step={50}
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              disabled={!selectedSchool}
              className="site-input"
              placeholder="0"
            />
          </label>
          <button
            onClick={handleSaveRate}
            disabled={!selectedSchool || savingRate}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--gradient-brand)" }}
          >
            {savingRate ? "Saving…" : "Save rate"}
          </button>
        </div>

        {selectedSchool && (
          <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--purple)]/30 bg-[var(--surface)] px-4 py-3 text-sm">
            <span className="font-data">{selectedSchool.studentCount}</span> students ×{" "}
            <span className="font-data">{formatNaira(Number(rateInput) || 0)}</span> ={" "}
            <strong className="text-[var(--purple)]">{formatNaira(previewTotal)}</strong> this term
          </div>
        )}

        {schools.length > 0 && (
          <div className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
            {schools.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 text-xs">
                <span className={s.status !== "active" ? "text-[var(--text-faint)]" : ""}>
                  {s.name}
                  {s.status !== "active" && <span className="ml-1.5 opacity-70">({s.status})</span>}
                </span>
                <span className="font-data text-[var(--text-dim)]">
                  {s.studentCount} × {formatNaira(s.amount_per_student)} ={" "}
                  <strong className={s.status === "active" ? "text-[var(--text)]" : "text-[var(--text-faint)]"}>
                    {formatNaira(s.studentCount * s.amount_per_student)}
                  </strong>
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="font-medium">Platform total this term</span>
              <strong className="text-[var(--purple)]">{formatNaira(platformTotal)}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="surface-card mt-4 p-5">
        <h2 className="mb-3 text-sm font-medium">Invite a new admin</h2>
        <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-xs text-[var(--text-dim)]">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="site-input"
              placeholder="Ada Lovelace"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs text-[var(--text-dim)]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="site-input"
              placeholder="ada@omni1os.com"
            />
          </label>
          <button
            type="submit"
            disabled={inviting}
            className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--gradient-brand)" }}
          >
            <UserPlus size={14} /> {inviting ? "Sending…" : "Invite"}
          </button>
        </form>
        <p className="mt-2 text-[11px] text-[var(--text-faint)]">
          They&apos;ll get an email to set a password. New admins are always created as a regular Admin —
          Super admin status can only be granted directly in the database.
        </p>
      </div>

      <div className="surface-card mt-4 divide-y divide-[var(--border)] p-0">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm">{a.full_name || a.email}</p>
              <p className="text-xs text-[var(--text-faint)]">{a.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {a.is_super_admin && (
                <span className="flex items-center gap-1 rounded-full border border-[var(--purple)]/40 px-2 py-0.5 text-[11px] text-[var(--purple)]">
                  <ShieldCheck size={12} /> Super admin
                </span>
              )}
              {me.is_super_admin && a.id !== me.id && (
                <button
                  title="Remove admin"
                  onClick={() => handleRemove(a)}
                  disabled={removingId === a.id}
                  className="rounded-md p-1.5 text-red-300 hover:bg-[var(--surface)] disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
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
        .site-input:focus { border-color: var(--purple); outline: none; }
      `}</style>
    </div>
  );
}

