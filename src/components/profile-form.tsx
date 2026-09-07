"use client";

import { useState } from "react";
import type { Qualification, SubjectGrade } from "@/db/schema";
import { SUBJECT_OPTIONS, GRADE_POINTS } from "@/lib/grades";
import { INTEREST_OPTIONS } from "@/lib/ai";
import { IconCheck, IconX } from "./icons";

type Profile = {
  fullName: string | null;
  dob: string | null;
  nationality: string | null;
  phone: string | null;
  altContact: string | null;
  currentSchool: string | null;
  studyLevel: string;
  subjects: SubjectGrade[];
  interests: string[];
  qualifications: Qualification[] | null;
};

export function ProfileForm({ initial }: { initial: Profile | null }) {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? "",
    dob: initial?.dob ?? "",
    nationality: initial?.nationality ?? "Zimbabwean",
    phone: initial?.phone ?? "",
    altContact: initial?.altContact ?? "",
    currentSchool: initial?.currentSchool ?? "",
    studyLevel: initial?.studyLevel ?? "undergraduate",
  });
  const [subjects, setSubjects] = useState<SubjectGrade[]>(
    initial?.subjects?.length ? initial.subjects : [{ subject: "", grade: "C" }],
  );
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? []);
  const [qualifications, setQualifications] = useState<Qualification[]>(initial?.qualifications ?? []);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const addQualification = () => {
    setQualifications([...qualifications, { type: "", name: "", institution: "", year: "", grade: "" }]);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const updateQualification = (index: number, key: keyof Qualification, value: string) => {
    const updated = [...qualifications];
    updated[index] = { ...updated[index], [key]: value };
    setQualifications(updated);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, subjects: subjects.filter((s) => s.subject), interests, qualifications }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not save.");
      return;
    }
    setSaved(true);
  };

  const field = "w-full rounded-lg border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20";
  const label = "mb-1.5 block text-xs font-bold tracking-wide text-ink-soft uppercase";

  return (
    <form onSubmit={save} className="space-y-8">
      <section className="rounded-xl border border-navy-900/10 bg-white p-6">
        <h2 className="font-display text-lg font-extrabold text-navy-900">Personal details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label><span className={label}>Full name</span><input className={field} value={form.fullName} onChange={set("fullName")} required /></label>
          <label><span className={label}>Date of birth</span><input className={field} type="date" value={form.dob} onChange={set("dob")} /></label>
          <label><span className={label}>Nationality</span><input className={field} value={form.nationality} onChange={set("nationality")} placeholder="Zimbabwean" /></label>
          <label><span className={label}>Phone / WhatsApp</span><input className={field} value={form.phone} onChange={set("phone")} placeholder="+263 77 …" /></label>
          <label><span className={label}>Alternative contact</span><input className={field} value={form.altContact} onChange={set("altContact")} placeholder="Parent / guardian number" /></label>
          <label><span className={label}>Current school</span><input className={field} value={form.currentSchool} onChange={set("currentSchool")} /></label>
          <label>
            <span className={label}>Preferred study level</span>
            <select className={field} value={form.studyLevel} onChange={set("studyLevel")}>
              <option value="undergraduate">Undergraduate degree</option>
              <option value="diploma">Diploma</option>
              <option value="certificate">Certificate</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-navy-900/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-navy-900">A-Level subjects & grades</h2>
          <button
            type="button"
            onClick={() => setSubjects((s) => [...s, { subject: "", grade: "C" }])}
            className="rounded-md bg-navy-100 px-3 py-1.5 text-xs font-extrabold text-navy-800 uppercase transition hover:bg-navy-200"
          >
            + Add subject
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-soft">Points scale: A=6 · B=5 · C=4 · D=3 · E=2 (best three subjects count).</p>
        <div className="mt-4 space-y-3">
          {subjects.map((s, i) => (
            <div key={i} className="flex gap-3">
              <select
                className={`${field} flex-1`}
                value={s.subject}
                onChange={(e) => setSubjects((arr) => arr.map((x, j) => (j === i ? { ...x, subject: e.target.value } : x)))}
              >
                <option value="">Select subject…</option>
                {SUBJECT_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <select
                className={`${field} w-28`}
                value={s.grade}
                onChange={(e) => setSubjects((arr) => arr.map((x, j) => (j === i ? { ...x, grade: e.target.value } : x)))}
              >
                {Object.keys(GRADE_POINTS).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSubjects((arr) => arr.filter((_, j) => j !== i))}
                className="rounded-md border border-navy-900/15 px-3 text-ink-soft transition hover:border-zim-red/40 hover:text-zim-red"
                aria-label="Remove subject"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-navy-900/10 bg-white p-6">
        <h2 className="font-display text-lg font-extrabold text-navy-900">Interests (feeds AI guidance)</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((o) => {
            const on = interests.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setInterests((arr) => (on ? arr.filter((x) => x !== o.id) : [...arr, o.id]))}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  on ? "border-navy-800 bg-navy-800 text-white" : "border-navy-900/15 bg-white text-ink-soft hover:border-navy-600"
                }`}
              >
                {on && <IconCheck className="mr-1.5 inline h-3.5 w-3.5" />}
                {o.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-navy-900/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-navy-900">Qualifications (Diploma / Certificate)</h2>
          <button
            type="button"
            onClick={addQualification}
            className="rounded-md bg-navy-100 px-3 py-1.5 text-xs font-extrabold text-navy-800 uppercase transition hover:bg-navy-200"
          >
            + Add qualification
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-soft">If you have a diploma or certificate, add it here for special entry consideration.</p>
        <div className="mt-4 space-y-4">
          {qualifications.map((q, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-3 rounded-lg border border-navy-900/10 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <input className={field} placeholder="Type (e.g., Diploma)" value={q.type} onChange={(e) => updateQualification(idx, "type", e.target.value)} />
              <input className={field} placeholder="Name (e.g., Accounting)" value={q.name} onChange={(e) => updateQualification(idx, "name", e.target.value)} />
              <input className={field} placeholder="Institution" value={q.institution} onChange={(e) => updateQualification(idx, "institution", e.target.value)} />
              <div className="flex gap-2">
                <input className={`${field} w-1/2`} placeholder="Year" value={q.year} onChange={(e) => updateQualification(idx, "year", e.target.value)} />
                <select className={`${field} w-1/2`} value={q.grade} onChange={(e) => updateQualification(idx, "grade", e.target.value)}>
                  <option value="">Grade</option>
                  <option value="Distinction">Distinction</option>
                  <option value="Merit">Merit</option>
                  <option value="Pass">Pass</option>
                </select>
                <button type="button" onClick={() => removeQualification(idx)} className="rounded-md border border-navy-900/15 px-3 text-ink-soft hover:border-zim-red/40 hover:text-zim-red" aria-label="Remove qualification">
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="rounded-lg border border-zim-red/30 bg-zim-red/10 px-4 py-2.5 text-sm font-semibold text-zim-red">{error}</p>}
      {saved && <p className="rounded-lg border border-zim-green/30 bg-zim-green/10 px-4 py-2.5 text-sm font-semibold text-zim-green">Profile saved — your matcher results will use these details.</p>}
      <button type="submit" className="rounded-lg bg-navy-800 px-6 py-3 font-display text-sm font-extrabold tracking-wide text-white uppercase transition hover:bg-navy-700">
        Save profile
      </button>
    </form>
  );
}
