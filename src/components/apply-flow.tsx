"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PACKAGES, serviceFeeFor, type PackageType } from "@/lib/pricing";
import { CheckoutModal } from "./checkout-modal";
import { UniCrest } from "./brand";
import { IconArrow, IconCheck } from "./icons";
import { formatDate, formatUSD } from "@/lib/utils";

type ShortItem = {
  id: string;
  programme: {
    id: string;
    title: string;
    faculty: string;
    level: string;
    feesLocal: number;
    feesInternational: number;
    appFee: number;
    deadline: string;
    university: { name: string; city: string; type: string; hue: number; logoUrl: string | null };
  };
};

export function ApplyFlow({ nationality }: { nationality: string }) {
  const [items, setItems] = useState<ShortItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [pkg, setPkg] = useState<PackageType>("basic");
  const [checkout, setCheckout] = useState<{ id: string; total: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isIntl = nationality.toLowerCase() !== "zimbabwean";

  useEffect(() => {
    fetch("/api/shortlist")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.shortlist ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const chosen = items.filter((i) => selected.includes(i.programme.id));
  const max = PACKAGES[pkg].maxUnis;
  const serviceFee = serviceFeeFor(pkg, isIntl, Math.max(1, chosen.length));
  const uniFees = chosen.reduce((s, i) => s + i.programme.appFee, 0);
  const total = useMemo(() => serviceFee + uniFees, [serviceFee, uniFees]);

  const toggle = (id: string) =>
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= max) return s;
      return [...s, id];
    });

  const submit = async () => {
    setError("");
    setBusy(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programmeIds: selected, packageType: pkg }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create application.");
      return;
    }
    setCheckout({ id: data.application.id, total: data.application.totalAmount });
  };

  if (loaded && items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-navy-900/15 bg-white/60 p-14 text-center">
        <h2 className="font-display text-2xl font-black text-navy-900">Your shortlist is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Run the Smart Matcher, tap “+ Shortlist” on the programmes you want, then come back here to bundle
          them into one paid application package.
        </p>
        <Link href="/dashboard/matcher" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-6 py-3 font-display text-sm font-extrabold tracking-wide text-white uppercase transition hover:bg-navy-700">
          Open course matcher <IconArrow className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <h2 className="font-display text-lg font-extrabold text-navy-900">1 · Choose programmes from your shortlist</h2>
        {items.map((i) => {
          const on = selected.includes(i.programme.id);
          const disabled = !on && selected.length >= max;
          return (
            <button
              key={i.id}
              onClick={() => toggle(i.programme.id)}
              disabled={disabled}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                on ? "border-zim-green bg-zim-green/10" : disabled ? "border-navy-900/10 bg-white opacity-45" : "border-navy-900/10 bg-white hover:border-navy-600"
              }`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${on ? "border-zim-green bg-zim-green text-white" : "border-navy-900/25"}`}>
                {on && <IconCheck className="h-4 w-4" />}
              </span>
              <UniCrest name={i.programme.university.name} hue={i.programme.university.hue} logoUrl={i.programme.university.logoUrl} className="h-10 w-10 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-extrabold text-navy-900">{i.programme.title}</span>
                <span className="block text-xs font-semibold text-ink-soft">
                  {i.programme.university.name} · {i.programme.university.city} · closes {formatDate(i.programme.deadline)}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-sm font-black text-navy-900">USD {i.programme.appFee}</span>
                <span className="block text-[10px] font-bold text-ink-soft uppercase">uni app fee</span>
              </span>
            </button>
          );
        })}

        <h2 className="pt-4 font-display text-lg font-extrabold text-navy-900">2 · Pick your package</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(Object.keys(PACKAGES) as PackageType[]).map((key) => {
            const p = PACKAGES[key];
            const on = pkg === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setPkg(key);
                  setSelected((s) => s.slice(0, p.maxUnis));
                }}
                className={`rounded-xl border-2 p-5 text-left transition ${on ? "border-gold-400 bg-gold-400/10" : "border-navy-900/10 bg-white hover:border-navy-600"}`}
              >
                <p className="font-display text-lg font-black text-navy-900">{p.label}</p>
                <p className="text-xs font-semibold text-ink-soft">{p.tagline}</p>
                <p className="mt-3 font-display text-2xl font-black text-navy-900">
                  {formatUSD(serviceFeeFor(key, isIntl, Math.max(1, chosen.length)))}
                </p>
                <ul className="mt-3 space-y-1 text-[11px] font-semibold text-ink-soft">
                  {p.perks.slice(0, 3).map((perk) => (
                    <li key={perk}>· {perk}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-xl border border-navy-900/10 bg-navy-950 p-6 text-white">
          <h2 className="font-display text-sm font-extrabold tracking-widest text-gold-400 uppercase">3 · Invoice preview</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex justify-between gap-3">
              <span className="text-navy-200">{PACKAGES[pkg].label} service fee {isIntl && pkg !== "international" ? "(international)" : ""}</span>
              <span className="font-display font-extrabold">{formatUSD(serviceFee)}</span>
            </li>
            {chosen.map((c) => (
              <li key={c.programme.id} className="flex justify-between gap-3">
                <span className="truncate text-navy-200">{c.programme.university.name} application fee</span>
                <span className="font-display font-extrabold">{formatUSD(c.programme.appFee)}</span>
              </li>
            ))}
            {chosen.length === 0 && <li className="text-navy-200">Select at least one programme…</li>}
          </ul>
          <div className="mt-4 flex justify-between border-t border-white/15 pt-4">
            <span className="font-display text-sm font-extrabold tracking-widest uppercase">Total due</span>
            <span className="font-display text-2xl font-black text-gold-400">{formatUSD(total)}</span>
          </div>
          <button
            onClick={submit}
            disabled={busy || chosen.length === 0}
            className="mt-5 w-full rounded-lg bg-gold-400 px-5 py-3 font-display text-sm font-extrabold tracking-wide text-navy-950 uppercase transition hover:bg-gold-300 disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create & pay with Paynow"}
          </button>
          {error && <p className="mt-3 rounded-md border border-zim-red/40 bg-zim-red/15 px-3 py-2 text-xs font-bold text-red-200">{error}</p>}
          <p className="mt-3 text-[11px] leading-relaxed text-navy-200">
            Paynow accepts Ecocash, OneMoney, Telecash, Visa, Mastercard and ZIPIT. Your application is held
            as a draft until payment confirms — then a ZUAE officer submits it for you.
          </p>
        </div>
      </aside>

      {checkout && (
        <CheckoutModal
          applicationId={checkout.id}
          amount={checkout.total}
          packageType={pkg}
          onClose={() => {
            setCheckout(null);
            setSelected([]);
          }}
          onPaid={() => undefined}
        />
      )}
    </div>
  );
}
