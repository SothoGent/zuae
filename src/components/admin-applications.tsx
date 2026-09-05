"use client";

import { useEffect, useMemo, useState } from "react";
import { STATUS_LABEL } from "@/lib/grades";
import { formatDateTime } from "@/lib/utils";

type Item = {
  id: string;
  status: string;
  internalNotes: string | null;
  updatedAt: string;
  programmeTitle: string;
  programmeFaculty: string;
  programmeId: string;
  universityName: string;
  universityId: string;
};
type App = {
  id: string;
  userId: string;
  packageType: string;
  totalAmount: number;
  paymentStatus: string;
  paymentRef: string | null;
  status: string;
  createdAt: string;
  studentEmail: string;
  studentName: string | null;
  nationality: string | null;
  items: Item[];
  payments: { id: string; reference: string; amount: number; status: string }[];
};

type Doc = {
  id: string;
  fileName: string;
  status: string;
};

const STATUSES = ["draft", "submitted", "under_review", "offer_received", "enrolled"];

function DocumentDownload({ applicationId }: { applicationId: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      const res = await fetch(`/api/admin/applications/${applicationId}/documents`);
      if (res.ok) setDocs((await res.json()).documents ?? []);
    };
    fetchDocs().catch(() => undefined);
  }, [applicationId]);

  const downloadSelected = async () => {
    if (selected.length === 0) return;
    const res = await fetch("/api/admin/documents/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application_${applicationId}_documents.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 rounded-lg border border-navy-900/10 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-ink">Documents</h4>
        {selected.length > 0 && (
          <button
            onClick={downloadSelected}
            className="rounded-md bg-navy-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-700"
          >
            Download {selected.length} files
          </button>
        )}
      </div>
      <div className="mt-2 space-y-1">
        {docs.map((doc) => (
          <label key={doc.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(doc.id)}
              onChange={(e) => {
                if (e.target.checked) setSelected([...selected, doc.id]);
                else setSelected(selected.filter((id) => id !== doc.id));
              }}
              className="accent-navy-700"
            />
            <span className="text-ink-soft">{doc.fileName}</span>
            <span className={`ml-auto text-xs font-bold ${doc.status === "verified" ? "text-zim-green" : "text-gold-600"}`}>
              {doc.status}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function AdminApplications() {
  const [apps, setApps] = useState<App[]>([]);
  const [status, setStatus] = useState("");
  const [uni, setUni] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/applications");
    if (res.ok) setApps((await res.json()).applications);
  };
  useEffect(() => {
    load();
  }, []);

  const universities = useMemo(() => {
    const map = new Map<string, string>();
    apps.forEach((a) => a.items.forEach((i) => map.set(i.universityId, i.universityName)));
    return [...map.entries()];
  }, [apps]);

  const filtered = apps.filter((a) => {
    if (status && a.status !== status) return false;
    if (uni && !a.items.some((i) => i.universityId === uni)) return false;
    const day = a.createdAt.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (q && !`${a.studentName ?? ""} ${a.studentEmail}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const saveItem = async (item: Item, newStatus: string) => {
    const res = await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, status: newStatus, internalNotes: notes[item.id] ?? item.internalNotes ?? "" }),
    });
    if (res.ok) {
      setMsg(`Updated ${item.programmeTitle} → ${STATUS_LABEL[newStatus]}. Student notified.`);
      load();
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black tracking-tight text-navy-900">Applications</h1>
      <p className="mt-1 text-sm text-ink-soft">{apps.length} packages · update statuses, add internal notes, student is notified automatically.</p>
      {msg && <p className="mt-4 rounded-lg border border-zim-green/30 bg-zim-green/10 px-4 py-2 text-sm font-semibold text-zim-green">{msg}</p>}

      <div className="mt-5 grid gap-3 rounded-xl border border-navy-900/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student…" className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-600" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm font-semibold outline-none focus:border-navy-600">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select value={uni} onChange={(e) => setUni(e.target.value)} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm font-semibold outline-none focus:border-navy-600">
          <option value="">All universities</option>
          {universities.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs font-bold text-ink-soft">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-navy-900/15 px-2 py-1.5 text-sm" /></label>
        <label className="flex items-center gap-2 text-xs font-bold text-ink-soft">To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-navy-900/15 px-2 py-1.5 text-sm" /></label>
      </div>

      <div className="mt-5 space-y-5">
        {filtered.map((a) => (
          <article key={a.id} className="overflow-hidden rounded-xl border border-navy-900/10 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-900/10 bg-paper px-5 py-3.5">
              <div>
                <p className="font-display font-extrabold text-navy-900">
                  {a.studentName ?? a.studentEmail}
                  <span className="ml-2 text-xs font-semibold text-ink-soft">{a.studentEmail} · {a.nationality ?? "—"}</span>
                </p>
                <p className="text-xs font-semibold text-ink-soft">
                  {a.packageType.toUpperCase()} · USD {a.totalAmount} · {a.paymentStatus}
                  {a.paymentRef && <> · {a.paymentRef}</>} · {formatDateTime(a.createdAt)}
                </p>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase ${a.paymentStatus === "paid" ? "bg-zim-green/15 text-zim-green" : "bg-gold-400/20 text-gold-600"}`}>
                {STATUS_LABEL[a.status]}
              </span>
            </header>
            <div className="divide-y divide-navy-900/5">
              {a.items.map((i) => (
                <div key={i.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-display text-sm font-extrabold text-navy-900">{i.programmeTitle}</p>
                    <p className="text-xs font-semibold text-ink-soft">{i.universityName} · {i.programmeFaculty} · current: {STATUS_LABEL[i.status]}</p>
                    <textarea
                      defaultValue={i.internalNotes ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [i.id]: e.target.value }))}
                      placeholder="Internal notes (visible to ZUAE staff only)…"
                      className="mt-2 min-h-14 w-full rounded-lg border border-navy-900/15 bg-paper/60 px-3 py-2 text-xs outline-none focus:border-navy-600"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <select defaultValue={i.status} onChange={(e) => saveItem(i, e.target.value)} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm font-bold outline-none focus:border-navy-600">
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <DocumentDownload applicationId={a.id} />
            </div>
          </article>
        ))}
        {filtered.length === 0 && <p className="rounded-xl border-2 border-dashed border-navy-900/15 bg-white/60 p-12 text-center text-sm text-ink-soft">No applications match the current filters.</p>}
      </div>
    </div>
  );
}
