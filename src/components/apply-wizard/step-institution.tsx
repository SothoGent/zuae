"use client";
import { useState } from "react";

export function StepInstitution({ onNext, onBack }: {
  onNext: (institution: string) => void;
  onBack: () => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 3 of 6</p>
        <h1 className="mt-1 font-display text-3xl font-black text-navy-900">Where did you study?</h1>
        <p className="mt-2 text-sm text-ink-soft">Enter the name of the school, college or university you attended most recently.</p>
      </header>
      <input
        className="w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 text-sm outline-none focus:border-navy-600"
        placeholder="e.g., St. Augustine's High School, Harare Polytechnic…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-navy-900/20 px-5 py-3 text-sm font-bold text-ink-soft hover:bg-paper">Back</button>
        <button
          disabled={value.trim().length < 3}
          onClick={() => onNext(value.trim())}
          className="rounded-lg bg-navy-800 px-6 py-3 font-display text-sm font-extrabold uppercase text-white hover:bg-navy-700 disabled:opacity-40"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}