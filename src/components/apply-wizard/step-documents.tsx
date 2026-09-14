"use client";
import { useState } from "react";
import { DOCUMENT_CHECKLISTS } from "@/lib/document-checklist";
import type { ApplicationTrack } from "@/db/schema";
import { IconUpload, IconCheck } from "@/components/icons";

export function StepDocuments({ track, onNext, onBack }: {
  track: ApplicationTrack;
  onNext: () => void;
  onBack: () => void;
}) {
  const specs = DOCUMENT_CHECKLISTS[track];
  const [uploaded, setUploaded] = useState<Record<string, string>>({});

  const handleUpload = async (key: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", key);
    const res = await fetch("/api/documents", { method: "POST", body: fd });
    if (res.ok) setUploaded((u) => ({ ...u, [key]: file.name }));
  };

  const requiredDone = specs.filter(s => s.required).every(s => uploaded[s.key]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 2 of 6</p>
        <h1 className="mt-1 font-display text-3xl font-black text-navy-900">Upload your documents</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {track === "regular" && "Please upload certified copies of your ID, O-Level and A-Level results, plus a white-background passport photo."}
          {track === "special" && "Please upload your ID, National Diploma, and a white-background passport photo."}
          {track === "graduate" && "Please upload your ID, degree certificate (2.1 or better), and a white-background passport photo."}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {specs.map((s) => (
          <div key={s.key} className="rounded-xl border border-navy-900/10 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-extrabold text-navy-900">{s.label}</h3>
                <p className="mt-0.5 text-xs text-ink-soft">{s.hint}</p>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                uploaded[s.key] ? "bg-zim-green/15 text-zim-green" : s.required ? "bg-gold-400/20 text-gold-600" : "bg-paper-dark text-ink-soft"
              }`}>
                {uploaded[s.key] ? "✓ Ready" : s.required ? "Required" : "Optional"}
              </span>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-900/20 px-4 py-4 text-sm font-bold text-navy-800 hover:border-navy-600">
              <IconUpload className="h-4 w-4" />
              {uploaded[s.key] ? `Replace (${uploaded[s.key]})` : "Choose file"}
              <input
                type="file" className="hidden"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => e.target.files?.[0] && handleUpload(s.key, e.target.files[0])}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-navy-900/20 px-5 py-3 text-sm font-bold text-ink-soft hover:bg-paper">Back</button>
        <button
          disabled={!requiredDone} onClick={onNext}
          className="rounded-lg bg-navy-800 px-6 py-3 font-display text-sm font-extrabold uppercase text-white transition hover:bg-navy-700 disabled:opacity-40"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}