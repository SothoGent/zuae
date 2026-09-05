import Link from "next/link";
import { db } from "@/db";
import { applicationItems, applications, documents, notifications, profiles, programmes, universities } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, desc, asc, gte } from "drizzle-orm";
import { Reveal } from "@/components/motion";
import { IconArrow, IconCheck, IconClock, IconSpark, IconUpload } from "@/components/icons";
import { STATUS_LABEL, STATUS_TONE, computePoints } from "@/lib/grades";
import { formatDate, timeAgo } from "@/lib/utils";

const DOC_TYPES: { key: string; label: string; required: boolean }[] = [
  { key: "national_id", label: "National ID / Passport", required: true },
  { key: "certificates", label: "A-Level / O-Level certificates", required: true },
  { key: "passport_photo", label: "Passport-sized photo", required: true },
  { key: "consent", label: "Guardian consent form", required: false },
];

export default async function DashboardHome() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  const docs = await db.select().from(documents).where(eq(documents.userId, user.id));
  const apps = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, user.id))
    .orderBy(desc(applications.createdAt));
  const items = await db
    .select({
      id: applicationItems.id,
      applicationId: applicationItems.applicationId,
      status: applicationItems.status,
      title: programmes.title,
      uniName: universities.name,
    })
    .from(applicationItems)
    .innerJoin(programmes, eq(programmes.id, applicationItems.programmeId))
    .innerJoin(universities, eq(universities.id, programmes.universityId));
  const notes = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(4);
  const today = new Date().toISOString().slice(0, 10);
  const deadlines = await db
    .select({ title: programmes.title, deadline: programmes.deadline, uniName: universities.name })
    .from(programmes)
    .innerJoin(universities, eq(universities.id, programmes.universityId))
    .where(gte(programmes.deadline, today))
    .orderBy(asc(programmes.deadline))
    .limit(3);

  const myItems = items.filter((i) => apps.some((a) => a.id === i.applicationId));
  const completedDocs = DOC_TYPES.filter((t) => docs.some((d) => d.type === t.key)).length;
  const completeness = Math.round(
    ((profile?.fullName ? 1 : 0) +
      (profile?.dob ? 1 : 0) +
      (profile?.phone ? 1 : 0) +
      (profile?.subjects?.length ? 1 : 0) +
      (completedDocs >= 3 ? 1 : 0)) /
      5 *
      100,
  );
  const points = computePoints(profile?.subjects ?? []);

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Mhoro, {profile?.fullName?.split(" ")[0] ?? "student"}!</p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900 sm:text-4xl">Your admission journey</h1>
          </div>
          <Link href="/dashboard/matcher" className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-700">
            Run course matcher <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-3">
        <Reveal>
          <div className="h-full rounded-xl border border-navy-900/10 bg-white p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">Profile strength</h2>
              <span className="font-display text-3xl font-black text-navy-900">{completeness}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper-dark">
              <div className="h-full rounded-full bg-gradient-to-r from-navy-700 to-gold-400 transition-all duration-700" style={{ width: `${completeness}%` }} />
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">A-Level points (best 3)</dt><dd className="font-display font-extrabold text-navy-900">{points}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Study level</dt><dd className="font-bold capitalize text-ink">{profile?.studyLevel ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Nationality</dt><dd className="font-bold text-ink">{profile?.nationality ?? "—"}</dd></div>
            </dl>
            <Link href="/dashboard/profile" className="mt-4 inline-block text-xs font-extrabold tracking-wide text-navy-700 uppercase hover:underline">
              Complete profile →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="h-full rounded-xl border border-navy-900/10 bg-white p-6">
            <h2 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">Document vault</h2>
            <ul className="mt-4 space-y-2.5">
              {DOC_TYPES.map((t) => {
                const doc = docs.find((d) => d.type === t.key);
                return (
                  <li key={t.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-ink">
                      {doc ? <IconCheck className="h-4 w-4 text-zim-green" /> : <IconClock className="h-4 w-4 text-ink-soft/60" />}
                      {t.label}
                      {!t.required && <span className="text-[10px] font-bold text-ink-soft uppercase">optional</span>}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase ${
                        !doc ? "bg-paper-dark text-ink-soft" : doc.status === "verified" ? "bg-zim-green/15 text-zim-green" : doc.status === "rejected" ? "bg-zim-red/15 text-zim-red" : "bg-gold-400/20 text-gold-600"
                      }`}
                    >
                      {!doc ? "missing" : doc.status}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Link href="/dashboard/documents" className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold tracking-wide text-navy-700 uppercase hover:underline">
              <IconUpload className="h-4 w-4" /> Upload documents →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="h-full rounded-xl border border-navy-900/10 bg-navy-950 p-6 text-white">
            <h2 className="flex items-center gap-2 font-display text-sm font-extrabold tracking-widest text-gold-400 uppercase">
              <IconSpark className="h-4 w-4" /> AI guidance
            </h2>
            {profile?.aiSuggestion ? (
              <>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-navy-100">{profile.aiSuggestion.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {profile.aiSuggestion.fields.map((f) => (
                    <span key={f} className="rounded-md bg-gold-400/15 px-2 py-1 text-[11px] font-bold text-gold-300">{f}</span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-navy-200">
                Not sure what to study? Answer a 60-second questionnaire and let ZUAE's guidance engine map
                your subjects and interests to career fields.
              </p>
            )}
            <Link href="/dashboard/matcher" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-xs font-extrabold tracking-wide text-navy-950 uppercase transition hover:bg-gold-300">
              {profile?.aiSuggestion ? "Refresh guidance" : "Get guidance"} <IconArrow className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <div className="rounded-xl border border-navy-900/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">Active applications</h2>
              <Link href="/dashboard/applications" className="text-xs font-extrabold tracking-wide text-navy-700 uppercase hover:underline">View all →</Link>
            </div>
            {apps.length === 0 && (
              <p className="mt-6 rounded-lg border border-dashed border-navy-900/20 p-8 text-center text-sm text-ink-soft">
                No applications yet. Shortlist programmes in the matcher, then start an application package.
              </p>
            )}
            <ul className="mt-4 space-y-4">
              {apps.slice(0, 3).map((a) => (
                <li key={a.id} className="rounded-lg border border-navy-900/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-sm font-extrabold text-navy-900">
                      {a.packageType.toUpperCase()} package · USD {a.totalAmount}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase ${a.paymentStatus === "paid" ? "bg-zim-green/15 text-zim-green" : "bg-gold-400/20 text-gold-600"}`}>
                      {a.paymentStatus}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {myItems.filter((i) => i.applicationId === a.id).map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-ink">{i.title} <span className="text-ink-soft">· {i.uniName}</span></span>
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase ${STATUS_TONE[i.status]}`}>{STATUS_LABEL[i.status]}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="space-y-5">
          <Reveal delay={80}>
            <div className="rounded-xl border border-navy-900/10 bg-white p-6">
              <h2 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">Closing soon</h2>
              <ul className="mt-4 space-y-3">
                {deadlines.map((d) => (
                  <li key={`${d.uniName}-${d.title}`} className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-bold text-ink">{d.title}</p>
                      <p className="text-xs text-ink-soft">{d.uniName}</p>
                    </div>
                    <span className="shrink-0 font-display text-xs font-extrabold text-zim-red">{formatDate(d.deadline)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="rounded-xl border border-navy-900/10 bg-white p-6">
              <h2 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">Latest updates</h2>
              <ul className="mt-4 space-y-3">
                {notes.length === 0 && <li className="text-sm text-ink-soft">No updates yet.</li>}
                {notes.map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className="font-bold text-ink">{n.title}</p>
                    <p className="text-xs text-ink-soft">{timeAgo(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
