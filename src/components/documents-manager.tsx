"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconCheck, IconClock, IconUpload, IconX } from "./icons";
import { formatDateTime } from "@/lib/utils";

type Doc = {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: string;
  note: string | null;
  createdAt: string;
};

const TYPES = [
  { key: "national_id", label: "National ID / Passport", hint: "Certified copy, PDF or photo", required: true },
  { key: "certificates", label: "A-Level / O-Level certificates", hint: "Transcripts accepted · upload each certificate", required: true },
  { key: "passport_photo", label: "Passport-sized photo", hint: "JPEG/PNG, plain background", required: true },
  { key: "consent", label: "Parent / guardian consent", hint: "Optional · required for applicants under 18", required: false },
];

export function DocumentsManager() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (res.ok) setDocs((await res.json()).documents);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const upload = (type: string, file: File) => {
    const key = `${type}:${file.name}`;
    setErrors((e) => ({ ...e, [type]: "" }));
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    setProgress((p) => ({ ...p, [key]: 2 }));
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress((p) => ({ ...p, [key]: Math.round((ev.loaded / ev.total) * 100) }));
    };
    xhr.onload = () => {
      setProgress((p) => ({ ...p, [key]: 100 }));
      if (xhr.status >= 200 && xhr.status < 300) {
        setTimeout(() => setProgress((p) => {
          const { [key]: _drop, ...rest } = p;
          return rest;
        }), 600);
        load();
      } else {
        let msg = "Upload failed.";
        try {
          msg = JSON.parse(xhr.responseText).error ?? msg;
        } catch { /* ignore */ }
        setErrors((e) => ({ ...e, [type]: msg }));
        setProgress((p) => {
          const { [key]: _drop, ...rest } = p;
          return rest;
        });
      }
    };
    xhr.onerror = () => {
      setErrors((e) => ({ ...e, [type]: "Network error during upload." }));
      setProgress((p) => {
        const { [key]: _drop, ...rest } = p;
        return rest;
      });
    };
    xhr.open("POST", "/api/documents");
    xhr.send(fd);
  };

  const remove = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {TYPES.map((t) => {
        const mine = docs.filter((d) => d.type === t.key);
        const uploading = Object.entries(progress).filter(([k]) => k.startsWith(`${t.key}:`));
        return (
          <section key={t.key} className="rounded-xl border border-navy-900/10 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-extrabold text-navy-900">
                  {t.label}{" "}
                  {!t.required && <span className="ml-1 rounded bg-paper-dark px-1.5 py-0.5 text-[10px] font-bold text-ink-soft uppercase">optional</span>}
                </h2>
                <p className="mt-1 text-xs text-ink-soft">{t.hint}</p>
              </div>
              <span className={`rounded-md px-2 py-1 text-[11px] font-extrabold uppercase ${mine.length ? "bg-zim-green/15 text-zim-green" : "bg-paper-dark text-ink-soft"}`}>
                {mine.length ? `${mine.length} file${mine.length > 1 ? "s" : ""}` : "none yet"}
              </span>
            </div>

            <label
              className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-navy-900/20 bg-paper/60 px-4 py-6 text-center transition hover:border-navy-600 hover:bg-navy-50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) upload(t.key, f);
              }}
            >
              <IconUpload className="h-6 w-6 text-navy-700" />
              <span className="text-sm font-bold text-navy-800">Drop file or click to browse</span>
              <span className="text-[11px] text-ink-soft">PDF, JPEG or PNG · max 8 MB · stored in your private vault</span>
              <input
                ref={(el) => {
                  inputs.current[t.key] = el;
                }}
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(t.key, f);
                  e.target.value = "";
                }}
              />
            </label>

            {uploading.map(([k, pct]) => (
              <div key={k} className="mt-3">
                <div className="flex justify-between text-xs font-bold text-ink-soft">
                  <span className="truncate">{k.split(":")[1]}</span>
                  <span>{pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-dark">
                  <div className="h-full rounded-full bg-navy-700 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            {errors[t.key] && <p className="mt-3 rounded-md border border-zim-red/30 bg-zim-red/10 px-3 py-2 text-xs font-bold text-zim-red">{errors[t.key]}</p>}

            <ul className="mt-4 space-y-2">
              {mine.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-navy-900/10 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{d.fileName}</p>
                    <p className="text-[11px] text-ink-soft">
                      {(d.size / 1024).toFixed(0)} KB · {formatDateTime(d.createdAt)}
                      {d.note ? ` · ${d.note}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-extrabold uppercase ${
                        d.status === "verified" ? "bg-zim-green/15 text-zim-green" : d.status === "rejected" ? "bg-zim-red/15 text-zim-red" : "bg-gold-400/20 text-gold-600"
                      }`}
                    >
                      {d.status === "verified" ? <IconCheck className="h-3 w-3" /> : <IconClock className="h-3 w-3" />}
                      {d.status}
                    </span>
                    <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noreferrer" className="text-xs font-extrabold text-navy-700 uppercase hover:underline">
                      View
                    </a>
                    <button onClick={() => remove(d.id)} className="text-ink-soft transition hover:text-zim-red" aria-label={`Delete ${d.fileName}`}>
                      <IconX className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
