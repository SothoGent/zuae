"use client";

import { useEffect, useState } from "react";
import { UniCrest } from "./brand";

type University = {
  id: string;
  name: string;
  city: string;
  province: string;
  type: string;
  category: string;
  hue: number;
  logoUrl: string | null;
  blurb: string | null;
};

export function UniversitySelector({
  onSelect,
  onNext,
  onBack,
}: {
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/universities?active=true")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load universities.");
        return res.json();
      })
      .then((data) => setUniversities(data.universities ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const choose = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <section className="rounded-xl border border-navy-900/10 bg-white p-6">
      <h2 className="font-display text-xl font-black text-navy-900">Choose a university</h2>
      <p className="mt-1 text-sm text-ink-soft">Select one of our currently active partner institutions.</p>
      {loading && <p className="mt-6 text-sm font-semibold text-ink-soft">Loading universities...</p>}
      {error && <p className="mt-6 rounded-lg bg-zim-red/10 p-3 text-sm font-semibold text-zim-red">{error}</p>}
      {!loading && !error && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {universities.map((university) => (
            <button
              key={university.id}
              type="button"
              onClick={() => choose(university.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${selected === university.id ? "border-zim-green bg-zim-green/10" : "border-navy-900/10 hover:border-navy-600"}`}
            >
              <UniCrest name={university.name} hue={university.hue} logoUrl={university.logoUrl} className="h-14 w-14" />
              <p className="mt-3 font-display text-sm font-extrabold text-navy-900">{university.name}</p>
              <p className="mt-1 text-xs font-semibold text-ink-soft">{university.city}, {university.province}</p>
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-between gap-3">
        <button type="button" onClick={onBack} className="rounded-lg border border-navy-900/15 px-4 py-2 text-sm font-bold text-navy-900">Back</button>
        <button type="button" onClick={onNext} disabled={!selected} className="rounded-lg bg-navy-800 px-5 py-2 text-sm font-bold text-white disabled:opacity-40">Choose programmes</button>
      </div>
    </section>
  );
}
