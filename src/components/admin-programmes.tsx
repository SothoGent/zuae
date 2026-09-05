"use client";

import { useEffect, useMemo, useState } from "react";
import type { Requirements } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { IconSearch, IconUpload, IconX } from "./icons";

type Programme = {
  id: string;
  universityId: string;
  faculty: string;
  title: string;
  level: string;
  mode: string;
  durationMonths: number;
  feesLocal: number;
  feesInternational: number;
  appFee: number;
  deadline: string;
  location: string;
  intake: string;
  description: string | null;
  requirements: Requirements;
  active: boolean;
};
type Uni = { id: string; name: string; city: string; hue: number };

const EMPTY = {
  universityId: "",
  faculty: "",
  title: "",
  level: "undergraduate",
  mode: "full-time",
  durationMonths: 48,
  feesLocal: 1500,
  feesInternational: 2500,
  appFee: 30,
  deadline: "",
  location: "",
  intake: "February & August",
  description: "",
  minPoints: 8,
  required: [] as { subject: string; minGrade: string }[],
  active: true,
};

const CSV_TEMPLATE = `university,type,city,province,faculty,title,level,mode,duration_months,fees_local,fees_international,app_fee,deadline,min_points,required_subjects,description
Example State University,public,Harare,Harare,Science,BSc Example Science,undergraduate,full-time,48,1800,3000,35,2026-11-30,10,Mathematics:C;Physics:D,An example programme row`;

export function AdminProgrammes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [unis, setUnis] = useState<Uni[]>([]);
  const [q, setQ] = useState("");
  const [uniFilter, setUniFilter] = useState("");
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [csvResult, setCsvResult] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/programmes");
    if (res.ok) {
      const d = await res.json();
      setProgrammes(d.programmes);
      setUnis(d.universities);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      programmes.filter((p) => {
        if (uniFilter && p.universityId !== uniFilter) return false;
        const uni = unis.find((u) => u.id === p.universityId);
        return `${p.title} ${p.faculty} ${uni?.name ?? ""}`.toLowerCase().includes(q.toLowerCase());
      }),
    [programmes, unis, q, uniFilter],
  );

  const save = async () => {
    if (!editing) return;
    const body = {
      ...editing,
      requirements: { minPoints: editing.minPoints, required: editing.required.filter((r) => r.subject) },
      description: editing.description || null,
    };
    const res = await fetch("/api/admin/programmes", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { id: editingId, ...body } : body),
    });
    if (res.ok) {
      setMsg(editingId ? "Programme updated." : "Programme created.");
      setEditing(null);
      setEditingId(null);
      load();
    } else {
      setMsg((await res.json()).error ?? "Save failed.");
    }
  };

  const remove = async (id: string) => {
    await fetch("/api/admin/programmes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setConfirmId(null);
    setMsg("Programme deleted.");
    load();
  };

  const importCsv = async () => {
    const res = await fetch("/api/admin/programmes/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const d = await res.json();
    setCsvResult(res.ok ? `Imported ${d.created} programmes.${d.errors?.length ? ` Errors: ${d.errors.join(" | ")}` : ""}` : d.error);
    if (res.ok) load();
  };

  const field = "w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-navy-600";
  const label = "mb-1 block text-[11px] font-extrabold tracking-wide text-ink-soft uppercase";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-navy-900">Programme database</h1>
          <p className="mt-1 text-sm text-ink-soft">{programmes.length} programmes · CRUD + CSV bulk import (scraping-ready schema).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCsvOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-navy-900/20 bg-white px-4 py-2 text-sm font-bold text-navy-800 transition hover:bg-navy-50">
            <IconUpload className="h-4 w-4" /> CSV import
          </button>
          <button
            onClick={() => {
              setEditing({ ...EMPTY, universityId: unis[0]?.id ?? "", deadline: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) });
              setEditingId(null);
            }}
            className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-700"
          >
            + New programme
          </button>
        </div>
      </div>
      {msg && <p className="mt-4 rounded-lg border border-zim-green/30 bg-zim-green/10 px-4 py-2 text-sm font-semibold text-zim-green">{msg}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <label className="relative flex-1 min-w-52">
          <IconSearch className="absolute top-2.5 left-3 h-4 w-4 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, faculty, university…" className={`${field} pl-9`} />
        </label>
        <select value={uniFilter} onChange={(e) => setUniFilter(e.target.value)} className={`${field} w-64`}>
          <option value="">All institutions</option>
          {unis.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-navy-900/10 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="bg-navy-950 text-left text-xs font-extrabold tracking-widest text-white uppercase">
              <th className="px-5 py-3">Programme</th>
              <th className="px-5 py-3">Institution</th>
              <th className="px-5 py-3">Level · mode</th>
              <th className="px-5 py-3 text-right">Fees L / I</th>
              <th className="px-5 py-3">Deadline</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const uni = unis.find((u) => u.id === p.universityId);
              return (
                <tr key={p.id} className={`border-t border-navy-900/10 ${p.active ? "" : "opacity-50"}`}>
                  <td className="px-5 py-3">
                    <p className="font-display font-extrabold text-navy-900">{p.title}</p>
                    <p className="text-xs text-ink-soft">{p.faculty} · {p.requirements.minPoints} pts entry</p>
                  </td>
                  <td className="px-5 py-3 font-semibold text-ink-soft">{uni?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.level} · {p.mode}</td>
                  <td className="px-5 py-3 text-right font-display font-extrabold text-navy-900">{p.feesLocal} / {p.feesInternational}</td>
                  <td className="px-5 py-3 text-ink-soft">{formatDate(p.deadline)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(p.id);
                          setEditing({
                            universityId: p.universityId,
                            faculty: p.faculty,
                            title: p.title,
                            level: p.level,
                            mode: p.mode,
                            durationMonths: p.durationMonths,
                            feesLocal: p.feesLocal,
                            feesInternational: p.feesInternational,
                            appFee: p.appFee,
                            deadline: p.deadline,
                            location: p.location,
                            intake: p.intake,
                            description: p.description ?? "",
                            minPoints: p.requirements.minPoints,
                            required: p.requirements.required ?? [],
                            active: p.active,
                          });
                        }}
                        className="rounded-md bg-navy-100 px-2.5 py-1 text-[11px] font-extrabold text-navy-800 uppercase hover:bg-navy-200"
                      >
                        Edit
                      </button>
                      {confirmId === p.id ? (
                        <button onClick={() => remove(p.id)} className="rounded-md bg-zim-red px-2.5 py-1 text-[11px] font-extrabold text-white uppercase">Confirm</button>
                      ) : (
                        <button onClick={() => setConfirmId(p.id)} className="rounded-md border border-navy-900/15 px-2.5 py-1 text-[11px] font-extrabold text-ink-soft uppercase hover:border-zim-red/50 hover:text-zim-red">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------- edit / create modal ---------- */}
      {editing && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-black text-navy-900">{editingId ? "Edit programme" : "New programme"}</h2>
              <button onClick={() => setEditing(null)} className="text-ink-soft hover:text-zim-red" aria-label="Close"><IconX className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className={label}>Institution</span>
                <select className={field} value={editing.universityId} onChange={(e) => setEditing({ ...editing, universityId: e.target.value })}>
                  {unis.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </label>
              <label><span className={label}>Faculty</span><input className={field} value={editing.faculty} onChange={(e) => setEditing({ ...editing, faculty: e.target.value })} /></label>
              <label><span className={label}>Title</span><input className={field} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
              <label><span className={label}>Level</span>
                <select className={field} value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })}>
                  <option value="undergraduate">Undergraduate</option><option value="diploma">Diploma</option><option value="certificate">Certificate</option>
                </select>
              </label>
              <label><span className={label}>Mode</span>
                <select className={field} value={editing.mode} onChange={(e) => setEditing({ ...editing, mode: e.target.value })}>
                  <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="block">Block</option>
                </select>
              </label>
              <label><span className={label}>Duration (months)</span><input type="number" className={field} value={editing.durationMonths} onChange={(e) => setEditing({ ...editing, durationMonths: Number(e.target.value) })} /></label>
              <label><span className={label}>Deadline</span><input type="date" className={field} value={editing.deadline} onChange={(e) => setEditing({ ...editing, deadline: e.target.value })} /></label>
              <label><span className={label}>Local fee / yr</span><input type="number" className={field} value={editing.feesLocal} onChange={(e) => setEditing({ ...editing, feesLocal: Number(e.target.value) })} /></label>
              <label><span className={label}>International fee / yr</span><input type="number" className={field} value={editing.feesInternational} onChange={(e) => setEditing({ ...editing, feesInternational: Number(e.target.value) })} /></label>
              <label><span className={label}>Application fee</span><input type="number" className={field} value={editing.appFee} onChange={(e) => setEditing({ ...editing, appFee: Number(e.target.value) })} /></label>
              <label><span className={label}>Min A-Level points</span><input type="number" className={field} value={editing.minPoints} onChange={(e) => setEditing({ ...editing, minPoints: Number(e.target.value) })} /></label>
              <label className="sm:col-span-2"><span className={label}>Location</span><input className={field} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></label>
              <label className="sm:col-span-2"><span className={label}>Description</span><textarea className={`${field} min-h-16`} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
            </div>
            <div className="mt-4">
              <span className={label}>Required subjects (subject : min grade)</span>
              <div className="space-y-2">
                {editing.required.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input className={field} placeholder="Mathematics" value={r.subject} onChange={(e) => setEditing({ ...editing, required: editing.required.map((x, j) => (j === i ? { ...x, subject: e.target.value } : x)) })} />
                    <select className={`${field} w-20`} value={r.minGrade} onChange={(e) => setEditing({ ...editing, required: editing.required.map((x, j) => (j === i ? { ...x, minGrade: e.target.value } : x)) })}>
                      {["A", "B", "C", "D", "E"].map((g) => <option key={g}>{g}</option>)}
                    </select>
                    <button onClick={() => setEditing({ ...editing, required: editing.required.filter((_, j) => j !== i) })} className="px-2 text-ink-soft hover:text-zim-red" aria-label="Remove requirement"><IconX className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={() => setEditing({ ...editing, required: [...editing.required, { subject: "", minGrade: "C" }] })} className="text-xs font-extrabold text-navy-700 uppercase hover:underline">+ Add requirement</button>
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm font-bold text-ink">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="accent-navy-700" /> Active (visible to students)
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-navy-900/20 px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-paper">Cancel</button>
              <button onClick={save} className="rounded-lg bg-navy-800 px-6 py-2.5 text-sm font-extrabold text-white hover:bg-navy-700">Save programme</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- CSV modal ---------- */}
      {csvOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-black text-navy-900">Bulk CSV import</h2>
              <button onClick={() => setCsvOpen(false)} className="text-ink-soft hover:text-zim-red" aria-label="Close"><IconX className="h-5 w-5" /></button>
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Paste CSV with header: <code className="text-xs font-bold">university,type,city,province,faculty,title,level,mode,duration_months,fees_local,fees_international,app_fee,deadline,min_points,required_subjects,description</code>.
              Unknown universities are created automatically. <code>required_subjects</code> uses <code>Mathematics:C;Physics:D</code>.
            </p>
            <button
              onClick={() => {
                const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "zuae-programmes-template.csv";
                a.click();
              }}
              className="mt-3 text-xs font-extrabold text-navy-700 uppercase hover:underline"
            >
              Download template
            </button>
            <textarea className={`${field} mt-3 min-h-44 font-mono text-xs`} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={CSV_TEMPLATE} />
            {csvResult && <p className="mt-3 rounded-md border border-navy-900/15 bg-paper px-3 py-2 text-xs font-bold text-ink">{csvResult}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setCsvOpen(false)} className="rounded-lg border border-navy-900/20 px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-paper">Close</button>
              <button onClick={importCsv} className="rounded-lg bg-gold-400 px-6 py-2.5 text-sm font-extrabold text-navy-950 hover:bg-gold-300">Import rows</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
