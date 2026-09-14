"use client";
import { useState } from "react";
import { CheckoutModal } from "@/components/checkout-modal";

export function StepReview({ track, universityIds, programmeIds, nationality, onBack }: any) {
  const [checkout, setCheckout] = useState<{ id: string; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const isIntl = nationality.toLowerCase() !== "zimbabwean";
  const extraUnis = Math.max(0, universityIds.length - 1);
  const serviceFee = (track === "graduate" ? 150 : 100) + (isIntl ? 100 : 0) + extraUnis * 25;

  const submit = async () => {
    setBusy(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programmeIds, packageType: universityIds.length > 1 ? "premium" : "basic", track }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) setCheckout({ id: data.application.id, total: data.application.totalAmount });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 6 of 6</p>
        <h1 className="mt-1 font-display text-3xl font-black text-navy-900">Review & pay</h1>
      </header>

      <div className="rounded-xl border border-navy-900/10 bg-white p-6">
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between"><span>Track</span><strong className="capitalize">{track}</strong></li>
          <li className="flex justify-between"><span>Universities</span><strong>{universityIds.length}</strong></li>
          <li className="flex justify-between"><span>Programmes</span><strong>{programmeIds.length}</strong></li>
          <li className="flex justify-between border-t border-navy-900/10 pt-3"><span>Service fee</span><strong>USD {serviceFee}</strong></li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-navy-900/20 px-5 py-3 text-sm font-bold text-ink-soft hover:bg-paper">Back</button>
        <button
          disabled={busy}
          onClick={submit}
          className="rounded-lg bg-gold-400 px-6 py-3 font-display text-sm font-extrabold uppercase text-navy-950 hover:bg-gold-300 disabled:opacity-40"
        >
          {busy ? "Creating…" : "Create & pay with Paynow"}
        </button>
      </div>

      {checkout && (
        <CheckoutModal
          applicationId={checkout.id}
          amount={checkout.total}
          packageType="basic"
          onClose={() => setCheckout(null)}
          onPaid={() => {}}
        />
      )}
    </div>
  );
}