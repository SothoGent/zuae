"use client";

import { useState, useEffect } from "react";

const CHECKLIST_STEPS = [
  { id: "documents_received", label: "📄 Documents received", icon: "📄" },
  { id: "documents_verified", label: "✅ Documents verified", icon: "✅" },
  { id: "application_fee_paid", label: "💰 Application fee paid", icon: "💰" },
  { id: "application_submitted", label: "📤 Submitted to university", icon: "📤" },
  { id: "university_acknowledged", label: "📨 University acknowledged", icon: "📨" },
  { id: "under_review", label: "🔍 Under review", icon: "🔍" },
  { id: "offer_received", label: "🎉 Offer received", icon: "🎉" },
  { id: "enrolled", label: "🎓 Enrolled", icon: "🎓" },
];

export function AdminChecklist({ applicationItemId, onUpdate }: { applicationItemId: string; onUpdate?: () => void }) {
  const [items, setItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/checklist/${applicationItemId}`)
      .then(r => r.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, [applicationItemId]);

  const toggleStep = async (step: string) => {
    const res = await fetch(`/api/admin/checklist/${applicationItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step, completed: !items[step] }),
    });
    if (res.ok) {
      setItems({ ...items, [step]: !items[step] });
      onUpdate?.();
    }
  };

  if (loading) return <div>Loading checklist...</div>;

  return (
    <div className="rounded-xl border border-navy-900/10 bg-white p-6">
      <h3 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">
        Application Checklist
      </h3>
      <div className="mt-4 space-y-3">
        {CHECKLIST_STEPS.map((step) => (
          <label key={step.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-navy-900/10 p-3 transition hover:bg-navy-50">
            <input
              type="checkbox"
              checked={items[step.id] || false}
              onChange={() => toggleStep(step.id)}
              className="h-5 w-5 accent-navy-700"
            />
            <span className="text-sm font-semibold text-ink">{step.label}</span>
            {items[step.id] && (
              <span className="ml-auto text-xs font-bold text-zim-green">✓ Done</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}