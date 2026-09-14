"use client";
import { useEffect, useState } from "react";
import { UniCrest } from "@/components/brand";

export function StepProgrammes({
  track, universityIds, selected, onChange, onNext, onBack,
}: {
  track: string;
  universityIds: string[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/matcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          universityIds,
          useSpecialEntry: track === "special",
        }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
      setLoading(false);
    })();
  }, [track, universityIds]);

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else if (selected.length < 3) onChange([...selected, id]);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 5 of 6</p>
        <h1 className="mt-1 font-display text-3xl font-black text-navy-900">Your top programme matches</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Ranked by our Smart Matcher against your qualifications. Pick up to 3 across your chosen universities.
        </p>
      </header>

      {loading && <p className="text-sm text-ink-soft">Matching your profile…</p>}

      {!loading && results.length === 0 && (
        <p className="rounded-xl border border-dashed border-navy-900/20 bg-white p-10 text-center text-sm text-ink-soft">
          No matching programmes found for your selected universities and track.
        </p>
      )}

      <div className="space-y-4">
        {results.map((r) => {
          const on = selected.includes(r.programme.id);
          return (
            <article
              key={r.programme.id}
              className={`lift rounded-xl border-2 bg-white p-5 ${on ? "border-zim-green" : "border-navy-900/10"}`}
            >
              <div className="flex items-start gap-4">
                <UniCrest name={r.programme.university.name} hue={r.programme.university.hue} logoUrl={r.programme.university.logoUrl} className="h-12 w-12" />
                <div className="flex-1">
                  <h3 className="font-display text-lg font-extrabold text-navy-900">{r.programme.title}</h3>
                  <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">
                    {r.programme.university.name} · {r.programme.faculty}
                  </p>
                  <p className="mt-2 text-xs text-ink-soft">
                    Match score: <strong>{Math.round(r.score)}</strong> · {r.eligibility.eligible ? "Eligible ✓" : "May not qualify"}
                  </p>
                </div>
                <button
                  onClick={() => toggle(r.programme.id)}
                  disabled={!on && selected.length >= 3}
                  className={`rounded-lg px-4 py-2 text-xs font-extrabold uppercase ${
                    on ? "bg-zim-green text-white" : "bg-navy-100 text-navy-800 hover:bg-navy-200"
                  } disabled:opacity-40`}
                >
                  {on ? "✓ Selected" : "+ Select"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

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