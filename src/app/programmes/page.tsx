import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/db";
import { programmes, universities } from "@/db/schema";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UniCrest } from "@/components/brand";
import { Reveal } from "@/components/motion";
import { IconClock, IconSearch } from "@/components/icons";
import { asc, eq } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { PROVINCES } from "@/lib/matcher";

export const metadata: Metadata = { title: "Programme database" };
export const dynamic = "force-dynamic";

type Params = { q?: string; level?: string; province?: string; type?: string };

export default async function ProgrammesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  let rows: {
    programme: typeof programmes.$inferSelect;
    university: Pick<typeof universities.$inferSelect, "id" | "name" | "type" | "category" | "city" | "province" | "hue" | "logoUrl">;
  }[] = [];
  try {
    rows = await db
      .select({
        programme: programmes,
        university: {
          id: universities.id,
          name: universities.name,
          type: universities.type,
          category: universities.category,
          city: universities.city,
          province: universities.province,
          hue: universities.hue,
          logoUrl: universities.logoUrl,
        },
      })
      .from(programmes)
      .innerJoin(universities, eq(universities.id, programmes.universityId))
      .where(eq(programmes.active, true))
      .orderBy(asc(programmes.deadline));
  } catch (error) {
    console.error("Database error loading programmes:", error);
  }

  const filtered = rows.filter(({ programme: p, university: u }) => {
    if (sp.level && p.level !== sp.level) return false;
    if (sp.province && u.province !== sp.province) return false;
    if (sp.type && u.type !== sp.type) return false;
    if (q) {
      const hay = `${p.title} ${p.faculty} ${u.name} ${u.city}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const select =
    "rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-navy-600";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <header className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Verified catalogue</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-navy-900 sm:text-5xl">
            Every programme, every fee, every deadline — in one place.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {rows.length} programmes across {new Set(rows.map((r) => r.university.id)).size} institutions,
            maintained by ZUAE staff and synced with university registrars. Sign in to run the Smart
            Eligibility Matcher against your own results.
          </p>
        </header>

        <form className="mt-10 grid gap-3 rounded-xl border border-navy-900/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative lg:col-span-2">
            <IconSearch className="absolute top-2.5 left-3 h-5 w-5 text-ink-soft" />
            <input name="q" defaultValue={q} placeholder="Search programme, faculty or university…" className={`${select} w-full pl-10`} />
          </label>
          <select name="level" defaultValue={sp.level ?? ""} className={select}>
            <option value="">All study levels</option>
            <option value="undergraduate">Undergraduate degree</option>
            <option value="diploma">Diploma</option>
            <option value="certificate">Certificate</option>
          </select>
          <select name="province" defaultValue={sp.province ?? ""} className={select}>
            <option value="">All provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <select name="type" defaultValue={sp.type ?? ""} className={`${select} flex-1`}>
              <option value="">Public & private</option>
              <option value="public">Public only</option>
              <option value="private">Private only</option>
            </select>
            <button className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-700">
              Filter
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm font-semibold text-ink-soft">
          Showing <span className="font-display text-navy-900">{filtered.length}</span> of {rows.length} programmes
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ programme: p, university: u }, i) => (
            <Reveal key={p.id} delay={Math.min(i, 8) * 40}>
              <article className="lift flex h-full flex-col rounded-xl border border-navy-900/10 bg-white p-6">
                <div className="flex items-start gap-4">
                  <UniCrest name={u.name} hue={u.hue} logoUrl={u.logoUrl} className="h-12 w-12 shrink-0" />
                  <div>
                    <h2 className="font-display text-lg leading-tight font-extrabold text-navy-900">{p.title}</h2>
                    <p className="mt-1 text-xs font-bold tracking-wide text-ink-soft uppercase">
                      {u.name} · {u.city}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-soft">{p.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="font-semibold text-ink-soft">Local fee / yr</dt>
                    <dd className="font-display text-sm font-extrabold text-navy-900">USD {p.feesLocal.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-soft">International / yr</dt>
                    <dd className="font-display text-sm font-extrabold text-navy-900">USD {p.feesInternational.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-soft">Duration · mode</dt>
                    <dd className="font-bold text-ink">{p.durationMonths / 12} yrs · {p.mode}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-soft">Entry</dt>
                    <dd className="font-bold text-ink">{p.requirements.minPoints} pts A-Level</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.requirements.required.map((r) => (
                    <span key={r.subject} className="rounded-md bg-navy-50 px-2 py-1 text-[11px] font-bold text-navy-800">
                      {r.subject} ≥ {r.minGrade}
                    </span>
                  ))}
                  <span className="rounded-md bg-paper-dark px-2 py-1 text-[11px] font-bold text-ink-soft">{p.level}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zim-red">
                    <IconClock className="h-4 w-4" /> closes {formatDate(p.deadline)}
                  </span>
                  <Link href="/signup" className="text-xs font-extrabold tracking-wide text-navy-700 uppercase hover:underline">
                    Match me →
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-16 rounded-xl border border-dashed border-navy-900/20 bg-white p-12 text-center text-sm text-ink-soft">
            No programmes match those filters yet — try widening your search, or contact us and we'll source it.
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
