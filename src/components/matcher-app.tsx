"use client";

import { useEffect, useMemo, useState } from "react";
import type { AiSuggestion, Qualification, SubjectGrade } from "@/db/schema";
import { GRADE_POINTS, SUBJECT_OPTIONS, computePoints } from "@/lib/grades";
import { CAREER_FIELDS, PROVINCES, type MatchResult } from "@/lib/matcher";
import { INTEREST_OPTIONS, STRENGTH_OPTIONS } from "@/lib/ai";
import { UniCrest } from "./brand";
import { Countdown } from "./motion";
import { IconCheck, IconClock, IconSpark, IconX } from "./icons";
import { formatDate, formatUSD } from "@/lib/utils";

type Props = {
  initialSubjects: SubjectGrade[];
  initialQualifications: Qualification[];
  initialInterests: string[];
  nationality: string;
  studyLevel: string;
  savedSuggestion: AiSuggestion | null;
};

export function MatcherApp({ initialSubjects, initialQualifications, initialInterests, nationality, studyLevel, savedSuggestion }: Props) {
  const [subjects, setSubjects] = useState<SubjectGrade[]>(
    initialSubjects.length ? initialSubjects : [{ subject: "", grade: "C" }],
  );
  const [qualifications] = useState<Qualification[]>(initialQualifications);
  const [field, setField] = useState("not-sure");
  const [budget, setBudget] = useState(3000);
  const [noBudget, setNoBudget] = useState(false);
  const [province, setProvince] = useState("");
  const [uniType, setUniType] = useState("");
  const [level, setLevel] = useState(studyLevel);
  const [intl, setIntl] = useState(nationality.toLowerCase() !== "zimbabwean");
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState<AiSuggestion | null>(savedSuggestion);
  const [ai, setAi] = useState({ interests: initialInterests, strengths: [] as string[], workStyle: "team", budget: "1500-2500", notes: "" });

  useEffect(() => {
    fetch("/api/shortlist")
      .then((r) => r.json())
      .then((d) => setShortlist(new Set((d.shortlist ?? []).map((s: { programme: { id: string } }) => s.programme.id))))
      .catch(() => undefined);
  }, []);

  const points = useMemo(() => computePoints(subjects.filter((s) => s.subject)), [subjects]);

  const run = async (overrideField?: string) => {
    setLoading(true);
    const res = await fetch("/api/matcher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjects: subjects.filter((s) => s.subject),
        qualifications,
        field: overrideField ?? field,
        budgetMax: noBudget ? null : budget,
        province,
        uniType,
        level,
        international: intl,
      }),
    });
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  };

  const toggleShortlist = async (id: string) => {
    const has = shortlist.has(id);
    const next = new Set(shortlist);
    if (has) next.delete(id);
    else next.add(id);
    setShortlist(next);
    await fetch("/api/shortlist", {
      method: has ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programmeId: id }),
    });
  };

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-3)));

  const submitAi = async () => {
    setAiBusy(true);
    const res = await fetch("/api/ai/guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ai, subjects: subjects.filter((s) => s.subject) }),
    });
    const data = await res.json();
    setAiBusy(false);
    if (res.ok) {
      setAiResult(data.result);
    }
  };

  const compared = (results ?? []).filter((r) => compare.includes(r.programme.id));
  const suggestion = aiResult;

  const select = "w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-navy-600";

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      {/* ------------ criteria panel ------------ */}
      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-xl border border-navy-900/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-navy-900">My results</h2>
            <span className="rounded-md bg-navy-800 px-2.5 py-1 font-display text-xs font-extrabold text-gold-400">{points} pts</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {subjects.map((s, i) => (
              <div key={i} className="flex gap-2">
                <select className={select} value={s.subject} onChange={(e) => setSubjects((a) => a.map((x, j) => (j === i ? { ...x, subject: e.target.value } : x)))}>
                  <option value="">Subject…</option>
                  {SUBJECT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <select className={`${select} w-20`} value={s.grade} onChange={(e) => setSubjects((a) => a.map((x, j) => (j === i ? { ...x, grade: e.target.value } : x)))}>
                  {Object.keys(GRADE_POINTS).map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <button onClick={() => setSubjects((a) => a.filter((_, j) => j !== i))} className="px-2 text-ink-soft hover:text-zim-red" aria-label="Remove">
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => setSubjects((a) => [...a, { subject: "", grade: "C" }])} className="text-xs font-extrabold tracking-wide text-navy-700 uppercase hover:underline">
              + Add subject
            </button>
          </div>

          <div className="mt-5 space-y-3.5 border-t border-navy-900/10 pt-5">
            <label className="block">
              <span className="mb-1 block text-xs font-bold tracking-wide text-ink-soft uppercase">Desired career field</span>
              <select className={select} value={field} onChange={(e) => setField(e.target.value)}>
                <option value="not-sure">Not sure yet — show everything</option>
                {CAREER_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 flex justify-between text-xs font-bold tracking-wide text-ink-soft uppercase">
                <span>Yearly budget</span>
                <span className="text-navy-800">{noBudget ? "No limit" : formatUSD(budget)}</span>
              </span>
              <input type="range" min={500} max={8000} step={250} value={budget} disabled={noBudget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
              <label className="mt-1 flex items-center gap-2 text-xs font-semibold text-ink-soft">
                <input type="checkbox" checked={noBudget} onChange={(e) => setNoBudget(e.target.checked)} className="accent-navy-700" /> No budget limit
              </label>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select className={select} value={province} onChange={(e) => setProvince(e.target.value)}>
                <option value="">Any province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className={select} value={uniType} onChange={(e) => setUniType(e.target.value)}>
                <option value="">Public & private</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <select className={select} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Any level</option>
                <option value="undergraduate">Degree</option>
                <option value="diploma">Diploma</option>
                <option value="certificate">Certificate</option>
              </select>
              <label className="flex items-center gap-2 rounded-lg border border-navy-900/15 px-3 py-2 text-xs font-bold text-ink-soft">
                <input type="checkbox" checked={intl} onChange={(e) => setIntl(e.target.checked)} className="accent-navy-700" />
                International fees
              </label>
            </div>
          </div>

          <button onClick={() => run()} disabled={loading} className="mt-5 w-full rounded-lg bg-navy-800 px-5 py-3 font-display text-sm font-extrabold tracking-wide text-white uppercase transition hover:bg-navy-700 disabled:opacity-60">
            {loading ? "Matching…" : "Match my courses"}
          </button>
          <button onClick={() => setAiOpen(true)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gold-400 bg-gold-400/10 px-5 py-2.5 font-display text-sm font-extrabold tracking-wide text-gold-600 uppercase transition hover:bg-gold-400/20">
            <IconSpark className="h-4 w-4" /> Not sure? AI guidance
          </button>
        </div>

        {suggestion && (
          <div className="rounded-xl border border-gold-400/50 bg-gold-400/10 p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-extrabold tracking-widest text-gold-600 uppercase">
              <IconSpark className="h-4 w-4" /> Your guidance profile
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink">{suggestion.summary}</p>
            <div className="mt-3 space-y-2">
              {suggestion.careers.slice(0, 4).map((c) => (
                <div key={c.title} className="rounded-lg bg-white/80 p-3">
                  <p className="text-sm font-extrabold text-navy-900">{c.title}</p>
                  <p className="text-[11px] font-bold tracking-wide text-gold-600 uppercase">{c.field}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">{c.why}</p>
                </div>
              ))}
            </div>
            {suggestion.fields[0] && (
              <button
                onClick={() => {
                  setField(suggestion.fields[0]);
                  run(suggestion.fields[0]);
                }}
                className="mt-3 w-full rounded-lg bg-navy-800 px-4 py-2.5 text-xs font-extrabold tracking-wide text-white uppercase transition hover:bg-navy-700"
              >
                Browse {suggestion.fields[0]} programmes
              </button>
            )}
          </div>
        )}
      </aside>

      {/* ------------ results ------------ */}
      <section>
        {!results && (
          <div className="flex h-full min-h-[24rem] flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-900/15 bg-white/60 p-10 text-center">
            <IconSpark className="h-10 w-10 text-gold-500" />
            <h2 className="mt-4 font-display text-2xl font-black text-navy-900">Smart Eligibility Matcher</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              Set your subjects and preferences, then match against every verified programme in Zimbabwe.
              Green means you meet the published entry requirements today.
            </p>
          </div>
        )}
        {results && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink-soft">
                <span className="font-display text-lg font-black text-navy-900">{results.length}</span> programmes match your filters ·{" "}
                <span className="font-display text-lg font-black text-zim-green">{results.filter((r) => r.eligibility.eligible).length}</span> eligible
              </p>
              {compare.length >= 2 && (
                <a href="#compare" className="rounded-lg bg-navy-800 px-4 py-2 text-xs font-extrabold tracking-wide text-white uppercase">
                  Compare {compare.length} →
                </a>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {results.map((r) => {
                const p = r.programme;
                const inList = shortlist.has(p.id);
                return (
                  <article key={p.id} className={`lift rounded-xl border bg-white p-5 ${r.eligibility.eligible ? "border-zim-green/40" : "border-navy-900/10"}`}>
                    <div className="flex flex-wrap items-start gap-4">
                      <UniCrest name={p.university.name} hue={p.university.hue} logoUrl={p.university.logoUrl} className="h-12 w-12 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg leading-tight font-extrabold text-navy-900">{p.title}</h3>
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase ${r.eligibility.eligible ? "bg-zim-green/15 text-zim-green" : "bg-zim-red/10 text-zim-red"}`}>
                            {r.eligibility.eligible ? `Eligible · ${r.eligibility.points} pts` : "Not eligible"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-bold tracking-wide text-ink-soft uppercase">
                          {p.university.name} · {p.university.city} · {p.faculty}
                        </p>
                        {!r.eligibility.eligible && (
                          <ul className="mt-2 space-y-1">
                            {r.eligibility.reasons.map((reason) => (
                              <li key={reason} className="text-xs font-semibold text-zim-red">· {reason}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-black text-navy-900">{formatUSD(intl ? p.feesInternational : p.feesLocal)}</p>
                        <p className="text-[11px] font-semibold text-ink-soft">per year · {intl ? "international" : "local"}</p>
                        <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-bold text-zim-red"><IconClock className="h-3.5 w-3.5" /> {formatDate(p.deadline)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy-900/5 pt-4">
                      <button
                        onClick={() => toggleShortlist(p.id)}
                        className={`rounded-lg px-4 py-2 text-xs font-extrabold tracking-wide uppercase transition ${
                          inList ? "bg-zim-green text-white" : "bg-navy-100 text-navy-800 hover:bg-navy-200"
                        }`}
                      >
                        {inList ? "✓ Shortlisted" : "+ Shortlist"}
                      </button>
                      <button
                        onClick={() => toggleCompare(p.id)}
                        className={`rounded-lg border px-4 py-2 text-xs font-extrabold tracking-wide uppercase transition ${
                          compare.includes(p.id) ? "border-navy-800 bg-navy-800 text-white" : "border-navy-900/15 text-ink-soft hover:border-navy-600"
                        }`}
                      >
                        Compare
                      </button>
                      <span className="ml-auto text-[11px] font-semibold text-ink-soft">
                        {p.durationMonths / 12} yrs · {p.mode} · app fee USD {p.appFee}
                      </span>
                    </div>
                  </article>
                );
              })}
              {results.length === 0 && (
                <p className="rounded-xl border border-dashed border-navy-900/20 bg-white p-10 text-center text-sm text-ink-soft">
                  Nothing matches those constraints. Raise the budget, widen the province, or ask the AI guidance for alternative fields.
                </p>
              )}
            </div>

            {compared.length >= 2 && (
              <div id="compare" className="mt-10 overflow-x-auto rounded-xl border border-navy-900/10 bg-white">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-navy-950 text-left text-white">
                      <th className="px-4 py-3 font-display text-xs font-extrabold tracking-widest uppercase">Compare</th>
                      {compared.map((c) => (
                        <th key={c.programme.id} className="px-4 py-3">
                          <p className="font-display text-sm font-extrabold">{c.programme.title}</p>
                          <p className="text-[11px] font-semibold text-navy-200">{c.programme.university.name}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Annual fee", (c: MatchResult) => formatUSD(intl ? c.programme.feesInternational : c.programme.feesLocal)],
                      ["Application fee", (c: MatchResult) => `USD ${c.programme.appFee}`],
                      ["Entry points", (c: MatchResult) => `${c.programme.requirements.minPoints} pts (you: ${c.eligibility.points})`],
                      ["Eligible now", (c: MatchResult) => (c.eligibility.eligible ? "Yes" : "No")],
                      ["Duration", (c: MatchResult) => `${c.programme.durationMonths / 12} years ${c.programme.mode}`],
                      ["Deadline", (c: MatchResult) => formatDate(c.programme.deadline)],
                      ["Location", (c: MatchResult) => `${c.programme.location}, ${c.programme.university.province}`],
                    ].map(([label, fn]) => (
                      <tr key={label as string} className="border-t border-navy-900/10">
                        <td className="px-4 py-2.5 font-bold text-ink-soft">{label as string}</td>
                        {compared.map((c) => (
                          <td key={c.programme.id} className="px-4 py-2.5 font-semibold text-ink">{(fn as (c: MatchResult) => string)(c)}</td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-t border-navy-900/10 bg-paper">
                      <td className="px-4 py-3" />
                      {compared.map((c) => (
                        <td key={c.programme.id} className="px-4 py-3">
                          <Countdown date={c.programme.deadline} className="[&_.font-display]:text-sm" />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* ------------ AI modal ------------ */}
      {aiOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-display text-2xl font-black text-navy-900">
                  <IconSpark className="h-6 w-6 text-gold-500" /> AI career guidance
                </h3>
                <p className="mt-1 text-sm text-ink-soft">60 seconds. Answers are saved to your profile.</p>
              </div>
              <button onClick={() => setAiOpen(false)} className="text-ink-soft hover:text-zim-red" aria-label="Close"><IconX className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft uppercase">What pulls your attention?</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((o) => {
                    const on = ai.interests.includes(o.id);
                    return (
                      <button key={o.id} onClick={() => setAi((a) => ({ ...a, interests: on ? a.interests.filter((x) => x !== o.id) : [...a.interests, o.id] }))}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${on ? "border-navy-800 bg-navy-800 text-white" : "border-navy-900/15 text-ink-soft hover:border-navy-600"}`}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft uppercase">Your natural strengths</p>
                <div className="flex flex-wrap gap-2">
                  {STRENGTH_OPTIONS.map((s) => {
                    const on = ai.strengths.includes(s);
                    return (
                      <button key={s} onClick={() => setAi((a) => ({ ...a, strengths: on ? a.strengths.filter((x) => x !== s) : [...a.strengths, s] }))}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${on ? "border-gold-500 bg-gold-400 text-navy-950" : "border-navy-900/15 text-ink-soft hover:border-gold-500"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold tracking-wide text-ink-soft uppercase">Work style</span>
                  <select className={select} value={ai.workStyle} onChange={(e) => setAi((a) => ({ ...a, workStyle: e.target.value }))}>
                    <option value="team">Team & people</option>
                    <option value="solo">Independent deep work</option>
                    <option value="field">Outdoors / field work</option>
                    <option value="studio">Studio / hands-on</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold tracking-wide text-ink-soft uppercase">Budget band</span>
                  <select className={select} value={ai.budget} onChange={(e) => setAi((a) => ({ ...a, budget: e.target.value }))}>
                    <option value="under-1500">Under USD 1,500 / yr</option>
                    <option value="1500-2500">USD 1,500 – 2,500</option>
                    <option value="2500-4000">USD 2,500 – 4,000</option>
                    <option value="4000+">USD 4,000+</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-bold tracking-wide text-ink-soft uppercase">Anything else? (optional)</span>
                <textarea className={`${select} min-h-20`} value={ai.notes} onChange={(e) => setAi((a) => ({ ...a, notes: e.target.value }))} placeholder="e.g. I want to stay near Gweru, my uncle is a nurse…" />
              </label>
              <button onClick={submitAi} disabled={aiBusy} className="w-full rounded-lg bg-gold-400 px-5 py-3 font-display text-sm font-extrabold tracking-wide text-navy-950 uppercase transition hover:bg-gold-300 disabled:opacity-60">
                {aiBusy ? "Thinking…" : "Generate my guidance"}
              </button>
              {aiBusy && (
                <p className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-soft">
                  <IconCheck className="h-3.5 w-3.5 text-zim-green" /> reading your {points}-point profile…
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
