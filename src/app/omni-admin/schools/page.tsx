"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Check, X, Ban, Play, Trash2, ExternalLink, Eye } from "lucide-react";
import { useAdmin } from "../AdminContext";

type SchoolRow = {
  id: string;
  name: string;
  slug: string;
  school_code: string | null;
  contact_email: string;
  contact_phone: string;
  status: "pending" | "active" | "suspended" | "deactivated" | "rejected";
  logo_url: string | null;
  created_at: string;
  studentCount: number;
  feesProcessed: number;
  paystack: { enabled: boolean; verified: boolean };
};

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-300 border-amber-300/30 bg-amber-300/10",
  active: "text-emerald-300 border-emerald-300/30 bg-emerald-300/10",
  suspended: "text-orange-300 border-orange-300/30 bg-orange-300/10",
  deactivated: "text-red-300 border-red-300/30 bg-red-300/10",
  rejected: "text-red-300 border-red-300/30 bg-red-300/10",
};

type SchoolDetail = {
  school: {
    id: string; name: string; slug: string; school_code: string | null;
    contact_email: string; contact_phone: string; address: string | null;
    logo_url: string | null; status: string; created_at: string; approved_at: string | null;
  };
  settings: {
    school_name: string | null; school_code: string | null; school_email: string | null;
    school_phone1: string | null; school_phone2: string | null; school_address: string | null;
    head_teacher_name: string | null; school_motto: string | null; logo_url: string | null;
  } | null;
};

export default function SchoolsPage() {
  return (
    <Suspense fallback={null}>
      <SchoolsPageInner />
    </Suspense>
  );
}

function SchoolsPageInner() {
  const params = useSearchParams();
  const admin = useAdmin();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(params.get("filter") || "all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewData, setViewData] = useState<SchoolDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  async function openView(id: string) {
    setViewId(id);
    setViewLoading(true);
    setViewData(null);
    try {
      const res = await fetch(`/api/admin/schools/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load school");
      setViewData(json);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load school");
      setViewId(null);
    } finally {
      setViewLoading(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/schools");
    const json = await res.json();
    setSchools(json.schools || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(id: string, action: string, reason?: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/schools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed");
      toast.success("Updated");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"? This deletes ALL of their data — students, staff, payments, everything. This cannot be undone.`)) {
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/schools/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      toast.success("School deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = filter === "all" ? schools : schools.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Schools</h1>
          <p className="mt-1 text-sm text-[var(--text-dim)]">Every school registered on Omni1OS.</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {["all", "pending", "active", "suspended", "deactivated", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
              filter === f ? "border-[var(--purple)] text-[var(--text)]" : "border-[var(--border)] text-[var(--text-dim)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs text-[var(--text-dim)]">
              <th className="px-4 py-3 font-normal">School</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Students</th>
              <th className="px-4 py-3 font-normal">Fees processed</th>
              <th className="px-4 py-3 font-normal">Paystack</th>
              <th className="px-4 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-dim)]">
                  No schools in this view yet.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-[var(--surface-2)]" />
                    )}
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="font-data text-[11px] text-[var(--text-faint)]">{s.school_code || s.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${STATUS_STYLES[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="font-data px-4 py-3">{s.studentCount}</td>
                <td className="font-data px-4 py-3">₦{s.feesProcessed.toLocaleString("en-NG")}</td>
                <td className="px-4 py-3 text-xs">
                  {s.paystack.verified ? (
                    <span className="text-emerald-300">Connected</span>
                  ) : s.paystack.enabled ? (
                    <span className="text-amber-300">Pending verification</span>
                  ) : (
                    <span className="text-[var(--text-faint)]">Not connected</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <ActionBtn title="View" onClick={() => openView(s.id)} busy={false} icon={Eye} />
                    {s.status === "pending" && (
                      <>
                        <ActionBtn
                          title="Approve"
                          onClick={() => runAction(s.id, "approve")}
                          busy={busyId === s.id}
                          icon={Check}
                        />
                        <ActionBtn
                          title="Reject"
                          onClick={() => {
                            const reason = prompt("Reason for rejecting (optional)") || undefined;
                            runAction(s.id, "reject", reason);
                          }}
                          busy={busyId === s.id}
                          icon={X}
                        />
                      </>
                    )}
                    {s.status === "active" && (
                      <ActionBtn title="Deactivate" onClick={() => runAction(s.id, "deactivate")} busy={busyId === s.id} icon={Ban} />
                    )}
                    {(s.status === "deactivated" || s.status === "suspended") && (
                      <ActionBtn title="Reactivate" onClick={() => runAction(s.id, "activate")} busy={busyId === s.id} icon={Play} />
                    )}
                    {admin.is_super_admin && (
                      <ActionBtn title="Delete" onClick={() => handleDelete(s.id, s.name)} busy={busyId === s.id} icon={Trash2} danger />
                    )}
                    <a
                      href={`mailto:${s.contact_email}`}
                      title="Email contact"
                      className="rounded-md p-1.5 text-[var(--text-dim)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewId(null)}
        >
          <div
            className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {viewLoading && <p className="py-8 text-center text-sm text-[var(--text-dim)]">Loading…</p>}

            {!viewLoading && viewData && (
              <>
                <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                  {(viewData.settings?.logo_url || viewData.school.logo_url) ? (
                    <img
                      src={viewData.settings?.logo_url || viewData.school.logo_url || ""}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-[var(--surface-2)]" />
                  )}
                  <div>
                    <p className="font-display text-lg font-semibold">{viewData.school.name}</p>
                    <p className="font-data text-[11px] text-[var(--text-faint)]">
                      {viewData.settings?.school_code || viewData.school.school_code || viewData.school.slug}
                    </p>
                  </div>
                </div>

                {!viewData.settings ? (
                  <p className="mt-4 text-sm text-[var(--text-dim)]">
                    This school hasn&apos;t completed onboarding yet — details below reflect the initial
                    registration only, not their live School Info settings.
                  </p>
                ) : null}

                <div className="mt-4 space-y-3">
                  <DetailRow label="School Name" value={viewData.settings?.school_name || viewData.school.name} />
                  <DetailRow label="School Code" value={viewData.settings?.school_code || viewData.school.school_code} />
                  <DetailRow label="Email" value={viewData.settings?.school_email || viewData.school.contact_email} />
                  <DetailRow label="Phone 1" value={viewData.settings?.school_phone1 || viewData.school.contact_phone} />
                  <DetailRow label="Phone 2" value={viewData.settings?.school_phone2} />
                  <DetailRow label="Address" value={viewData.settings?.school_address || viewData.school.address} />
                  <DetailRow label="Head Teacher" value={viewData.settings?.head_teacher_name} />
                  <DetailRow label="Motto" value={viewData.settings?.school_motto} />
                </div>
              </>
            )}

            <button
              onClick={() => setViewId(null)}
              className="mt-6 w-full rounded-md border border-[var(--border)] py-2 text-sm text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-[var(--text-dim)]">{label}</span>
      <span className="text-right font-medium text-[var(--text)]">{value || "—"}</span>
    </div>
  );
}

function ActionBtn({
  title,
  onClick,
  busy,
  icon: Icon,
  danger,
}: {
  title: string;
  onClick: () => void;
  busy: boolean;
  icon: React.ElementType;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={busy}
      className={`rounded-md p-1.5 hover:bg-[var(--surface)] disabled:opacity-40 ${
        danger ? "text-red-300" : "text-[var(--text-dim)] hover:text-[var(--text)]"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}
