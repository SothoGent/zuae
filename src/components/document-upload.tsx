"use client";

import { useState } from "react";

export function DocumentUpload({ onComplete }: { userId: string; onComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("file", file);
    form.set("type", "certificates");
    const res = await fetch("/api/documents", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not upload document.");
      return;
    }
    onComplete();
  };

  return (
    <section className="rounded-xl border border-navy-900/10 bg-white p-6">
      <h2 className="font-display text-xl font-black text-navy-900">Upload your documents</h2>
      <p className="mt-1 text-sm text-ink-soft">Add a certificate or results document for your application.</p>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-5 block w-full rounded-lg border border-navy-900/15 p-3 text-sm" />
      <button type="button" onClick={upload} disabled={!file || busy} className="mt-5 rounded-lg bg-navy-800 px-5 py-2 text-sm font-bold text-white disabled:opacity-40">
        {busy ? "Uploading..." : "Continue"}
      </button>
      {error && <p className="mt-4 rounded-lg bg-zim-red/10 p-3 text-sm font-semibold text-zim-red">{error}</p>}
    </section>
  );
}
