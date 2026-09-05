"use client";

import { useEffect, useState } from "react";

 type Programme = {
  id: string;
  title: string;
  faculty: string;
  level: string;
  mode: string;
  feesLocal: number;
  deadline: string;
  description: string | null;
};

export function ProgrammeSelector({
  universityId,
  maxSelections,
  onSelect,
  onNext,
  onBack,
}: {
  universityId: string;
  maxSelections: number;
  onSelect: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelected([]);
    onSelect([]);
    setLoading(true);
    fetch(`/api/programmes?universityId=${encodeURIComponent(universityId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load programmes.");
        return res.json();
      })
      .then((data) => setProgrammes(data.programmes ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [onSelect, universityId]);

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((selectedId) => selectedId !== id)
      : selected.length < maxSelections
        ? [...selected, id]
        : selected;
    setSelected(next);
    onSelect(next);
  };

  return (
    <section className="rounded-xl border border-navy-900/10 bg-white p-6">
      <h2 className="font-display text-xl font-black text-navy-900">Choose programmes</h2>
      <p className="mt-1 text-sm text-ink-soft">Select up to {maxSelections} programmes from this university.</p>
      {loading && <p className="mt-6 text-sm font-semibold text-ink-soft">Loading programmes...</p>}
      {error && <p className="mt-6 rounded-lg bg-zim-red/10 p-3 text-sm font-semibold text-zim-red">{error}</p>}
      {!loading && !error && (
        <div className="mt-5 space-y-3">
          {programmes.map((programme) => {
            const isSelected = selected.includes(programme.id);
            const disabled = !isSelected && selected.length >= maxSelections;
            return (
              <button
                key={programme.id}
                type="button"
                onClick={() => toggle(programme.id)}
                disabled={disabled}
                className={`flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition ${isSelected ? "border-zim-green bg-zim-green/10" : "border-navy-900/10 hover:border-navy-600"} ${disabled ? "opacity-45" : ""}`}
              >
                <span className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 ${isSelected ? "border-zim-green bg-zim-green" : "border-navy-900/25"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-extrabold text-navy-900">{programme.title}</span>
                  <span className="mt-1 block text-xs font-semibold text-ink-soft">{programme.faculty} · {programme.level} · {programme.mode}</span>
                  {programme.description && <span className="mt-2 block text-xs leading-relaxed text-ink-soft">{programme.description}</span>}
                </span>
                <span className="shrink-0 text-right text-xs font-bold text-navy-900">USD {programme.feesLocal}</span>
              </button>
            );
          })}
          {programmes.length === 0 && <p className="text-sm text-ink-soft">No active programmes are available.</p>}
        </div>
      )}
      <div className="mt-6 flex justify-between gap-3">
        <button type="button" onClick={onBack} className="rounded-lg border border-navy-900/15 px-4 py-2 text-sm font-bold text-navy-900">Back</button>
        <button type="button" onClick={onNext} disabled={selected.length === 0} className="rounded-lg bg-navy-800 px-5 py-2 text-sm font-bold text-white disabled:opacity-40">Review application</button>
      </div>
    </section>
  );
}
