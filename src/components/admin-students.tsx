"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { computePoints } from "@/lib/grades";
import { formatDate } from "@/lib/utils";
import { IconSearch, IconUsers } from "./icons";

type Student = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  applicationCount: number;
  revenue: number;
  profile: {
    fullName: string | null;
    nationality: string | null;
    phone: string | null;
    currentSchool: string | null;
    studyLevel: string | null;
    subjects: { subject: string; grade: string }[] | null;
    interests: string[] | null;
  } | null;
};

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/students");
    if (res.ok) setStudents((await res.json()).students);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const hay = `${s.email} ${s.profile?.fullName ?? ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }),
    [students, q],
  );

  const setRole = async (id: string, role: string) => {
    await fetch("/api/admin/students", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, role }) });
    setMsg("Role updated.");
    load();
  };

  const remove = async (id: string) => {
    await fetch("/api/admin/students", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    setConfirmId(null);
    setMsg("Student account deleted.");
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-navy-900">Students</h1>
          <p className="mt-1 text-sm text-ink-soft">{students.length} registered · view, promote or remove accounts.</p>
        </div>
        <label className="relative">
          <IconSearch className="absolute top-2.5 left-3 h-4 w-4 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="w-64 rounded-lg border border-navy-900/15 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-navy-600" />
        </label>
      </div>
      {msg && <p className="mt-4 rounded-lg border border-zim-green/30 bg-zim-green/10 px-4 py-2 text-sm font-semibold text-zim-green">{msg}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-navy-900/10 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-navy-950 text-left text-xs font-extrabold tracking-widest text-white uppercase">
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Nationality · level</th>
              <th className="px-5 py-3">Points</th>
              <th className="px-5 py-3">Apps</th>
              <th className="px-5 py-3 text-right">Revenue</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <Fragment key={s.id}>
                <tr className="border-t border-navy-900/10 hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <button onClick={() => setOpen(open === s.id ? null : s.id)} className="text-left">
                      <p className="font-display font-extrabold text-navy-900">{s.profile?.fullName ?? "—"}</p>
                      <p className="text-xs text-ink-soft">{s.email} · joined {formatDate(s.createdAt.slice(0, 10))}</p>
                    </button>
                  </td>
                  <td className="px-5 py-3 font-semibold text-ink-soft">
                    {s.profile?.nationality ?? "—"} · <span className="capitalize">{s.profile?.studyLevel ?? "—"}</span>
                  </td>
                  <td className="px-5 py-3 font-display font-extrabold text-navy-800">{computePoints(s.profile?.subjects ?? [])}</td>
                  <td className="px-5 py-3 font-bold text-ink">{s.applicationCount}</td>
                  <td className="px-5 py-3 text-right font-display font-extrabold text-navy-900">USD {s.revenue}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRole(s.id, s.role === "admin" ? "student" : "admin")}
                        className="rounded-md bg-navy-100 px-2.5 py-1 text-[11px] font-extrabold text-navy-800 uppercase transition hover:bg-navy-200"
                      >
                        {s.role === "admin" ? "Demote" : "Make staff"}
                      </button>
                      {confirmId === s.id ? (
                        <button onClick={() => remove(s.id)} className="rounded-md bg-zim-red px-2.5 py-1 text-[11px] font-extrabold text-white uppercase">
                          Confirm delete
                        </button>
                      ) : (
                        <button onClick={() => setConfirmId(s.id)} className="rounded-md border border-navy-900/15 px-2.5 py-1 text-[11px] font-extrabold text-ink-soft uppercase transition hover:border-zim-red/50 hover:text-zim-red">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {open === s.id && (
                  <tr className="border-t border-navy-900/5 bg-paper/70">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="grid gap-4 text-xs sm:grid-cols-3">
                        <div>
                          <p className="font-extrabold tracking-wide text-ink-soft uppercase">Contact</p>
                          <p className="mt-1 text-ink">{s.profile?.phone ?? "—"} · {s.profile?.currentSchool ?? "school not set"}</p>
                        </div>
                        <div>
                          <p className="font-extrabold tracking-wide text-ink-soft uppercase">A-Level subjects</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {(s.profile?.subjects ?? []).map((sub) => (
                              <span key={sub.subject} className="rounded-md bg-navy-100 px-2 py-0.5 font-bold text-navy-800">
                                {sub.subject} {sub.grade}
                              </span>
                            ))}
                            {!(s.profile?.subjects ?? []).length && <span className="text-ink-soft">none recorded</span>}
                          </div>
                        </div>
                        <div>
                          <p className="font-extrabold tracking-wide text-ink-soft uppercase">Interests</p>
                          <p className="mt-1 text-ink">{(s.profile?.interests ?? []).join(", ") || "—"}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="flex items-center justify-center gap-2 p-10 text-sm text-ink-soft">
            <IconUsers className="h-5 w-5" /> No students match “{q}”.
          </p>
        )}
      </div>
    </div>
  );
}
