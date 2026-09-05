"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewSubmit({
  universityId,
  programmeIds,
  onBack,
  onComplete,
}: {
  universityId: string;
  programmeIds: string[];
  onBack: () => void;
  onComplete: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        universityId,
        programmeIds,
        packageType: programmeIds.length > 1 ? "premium" : "basic",
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create application.");
      return;
    }
    onComplete();
    router.push("/dashboard/applications");
  };

  return (
    <section className="rounded-xl border border-navy-900/10 bg-white p-6">
      <h2 className="font-display text-xl font-black text-navy-900">Review and submit</h2>
      <p className="mt-1 text-sm text-ink-soft">You have selected {programmeIds.length} programme{programmeIds.length === 1 ? "" : "s"}.</p>
      <div className="mt-5 rounded-lg bg-paper p-4 text-sm text-ink-soft">
        Your application package will be created as a draft. A ZUAE officer will review your documents and guide you through payment and submission.
      </div>
      <div className="mt-6 flex justify-between gap-3">
        <button type="button" onClick={onBack} className="rounded-lg border border-navy-900/15 px-4 py-2 text-sm font-bold text-navy-900">Back</button>
        <button type="button" onClick={submit} disabled={busy || programmeIds.length === 0} className="rounded-lg bg-gold-400 px-5 py-2 text-sm font-bold text-navy-950 disabled:opacity-40">
          {busy ? "Creating..." : "Create application package"}
        </button>
      </div>
      {error && <p className="mt-4 rounded-lg bg-zim-red/10 p-3 text-sm font-semibold text-zim-red">{error}</p>}
    </section>
  );
}
