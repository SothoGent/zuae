"use client";
import { useEffect, useState } from "react";
import { UniCrest } from "@/components/brand";

export function StepUniversities({ selected, onChange, onNext, onBack }: {
  selected: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [unis, setUnis] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/universities").then(r => r.json()).then(d => setUnis(d.universities ?? []));
  }, []);

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else if (selected.length < 3) onChange([...selected, id]);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 4 of 6</p>
        <h1 className="mt-1 font-display text-3xl font-black text-navy-900">Choose your universities</h1>
        <p className="mt-2 text-sm text-ink-soft">Select up to 3. Each additional university after the first adds a small processing fee.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {unis.map((u) => {
          const on = selected.includes(u.id);
          return (
            <button
              key={u.id} onClick={() => toggle(u.id)}
              className={`rounded-xl border-2 p-5 text-left transition ${
                on ? "border-zim-green bg-zim-green/10" : "border-navy-900/10 bg-white hover:border-navy-600"
              }`}
            >
              <UniCrest name={u.name} hue={u.hue} logoUrl={u.logoUrl} className="h-12 w-12" />
              <h3 className="mt-3 font-display text-base font-extrabold text-navy-900">{u.name}</h3>
              <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">{u.type} · {u.city}</p>
            </button>
          );
        })}
      </div>

      <p className="text-sm font-semibold text-ink-soft">
        {selected.length} of 3 selected — extra universities cost USD 25 each on top of the base package.
      </p>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-navy-900/20 px-5 py-3 text-sm font-bold text-ink-soft hover:bg-paper">Back</button>
        <button
          disabled={selected.length === 0}
          onClick={onNext}
          className="rounded-lg bg-navy-800 px-6 py-3 font-display text-sm font-extrabold uppercase text-white hover:bg-navy-700 disabled:opacity-40"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}