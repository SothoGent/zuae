"use client";
import { useState } from "react";
import type { ApplicationTrack } from "@/db/schema";

const TRACKS: { id: ApplicationTrack; title: string; desc: string; icon: string }[] = [
  { id: "regular", title: "Regular Entry", desc: "For school leavers with A-Level results.", icon: "🎓" },
  { id: "special", title: "Special Entry", desc: "For holders of a National Diploma progressing to a degree.", icon: "📜" },
  { id: "graduate", title: "Graduate Programme", desc: "For degree holders (2.1 or better) applying for Masters.", icon: "🏆" },
];

export function StepTrack({ onSelect }: { onSelect: (t: ApplicationTrack) => void }) {
  const [picked, setPicked] = useState<ApplicationTrack | null>(null);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 1 of 6</p>
        <h1 className="mt-1 font-display text-3xl font-black text-navy-900">Which path fits you?</h1>
        <p className="mt-2 text-sm text-ink-soft">We'll show you the exact documents and programmes based on your selection.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setPicked(t.id)}
            className={`rounded-2xl border-2 p-6 text-left transition ${
              picked === t.id ? "border-gold-400 bg-gold-400/10" : "border-navy-900/10 bg-white hover:border-navy-600"
            }`}
          >
            <span className="text-3xl">{t.icon}</span>
            <h3 className="mt-3 font-display text-lg font-black text-navy-900">{t.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          disabled={!picked}
          onClick={() => picked && onSelect(picked)}
          className="rounded-lg bg-navy-800 px-6 py-3 font-display text-sm font-extrabold uppercase text-white transition hover:bg-navy-700 disabled:opacity-40"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}