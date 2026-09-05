import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { programmes, universities } from "@/db/schema";
import { FlagStripe, UniCrest, ZimcheBadge } from "@/components/brand";
import { Countdown, CountUp, Reveal, ScrambleWords, Ticker } from "@/components/motion";
import {
  IconArrow,
  IconCap,
  IconCompass,
  IconDoc,
  IconHandshake,
  IconPlane,
  IconShield,
  IconSpark,
} from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { eq, gte, asc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";

const SERVICES = [
  { icon: IconCompass, title: "Course & University Guidance", body: "AI-assisted career guidance plus human counselling to help you choose the right course and university that fits your grades, budget and goals." },
  { icon: IconDoc, title: "Admission Assistance", body: "Step-by-step support with applications, entry requirements, document checklists and deadlines — nothing missed, nothing rejected." },
  { icon: IconShield, title: "Document Check & Preparation", body: "We verify your IDs, certificates and photos before submission so universities receive a clean, complete pack the first time." },
  { icon: IconPlane, title: "International & Local Student Support", body: "Visa support letters, arrival briefings and accommodation guidance for international students; local students get campus onboarding." },
  { icon: IconHandshake, title: "Enrolment & Registration Support", body: "From offer letter to final registration we walk with you, so you don't miss a single step of matriculation." },
];

const STEPS = [
  { n: "01", title: "Consultation", body: "Create your free student profile. Tell us your A-Level subjects, grades, budget and dreams — or let our AI guidance interview you." },
  { n: "02", title: "Guidance", body: "The Smart Matcher screens every verified programme in Zimbabwe against your results and returns a shortlist you genuinely qualify for." },
  { n: "03", title: "Application", body: "Pick up to three institutions, upload documents once, and pay securely with Paynow. One package, every application." },
  { n: "04", title: "Admission", body: "A ZUAE officer submits and tracks your file with the registry. You watch every status change live: verified, submitted, offer." },
  { n: "05", title: "Enrolment", body: "Offer letter in hand? We handle registration checklists, fee schedules and orientation so day one feels like home." },
];

export default async function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const [unis, upcoming] = await Promise.all([
    db.select().from(universities),
    db
      .select({
        title: programmes.title,
        deadline: programmes.deadline,
        uniName: universities.name,
      })
      .from(programmes)
      .innerJoin(universities, eq(universities.id, programmes.universityId))
      .where(gte(programmes.deadline, today))
      .orderBy(asc(programmes.deadline))
      .limit(4),
  ]);
  const next = upcoming[0];

  return (
    <>
      <SiteHeader />
      <main>
        {/* ============ HERO ============ */}
        <section className="relative min-h-[80vh] overflow-hidden bg-navy-950 text-white">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-bg.jpg"
              alt="Students beginning their university journey"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-navy-950/55" />
          </div>
          <div className="dot-grid absolute inset-0 z-0" aria-hidden="true" />
          <div className="absolute -top-40 -right-40 h-136 w-136 rounded-full bg-navy-700/40 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
            <div className="glass-panel rounded-2xl p-8 md:p-12">
              <p className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-gold-300 uppercase">
                <span className="pulse-dot h-2 w-2 rounded-full bg-zim-green" />
                2026/27 intakes now open
              </p>
              <h1 className="mt-6 font-display text-[clamp(4rem,12vw,9rem)] leading-[0.85] font-black tracking-tighter text-white">
                ZUAE
              </h1>
              <div className="sweep-bar mt-2 h-2 w-56 bg-gold-400" />
              <p className="mt-5 max-w-xl font-display text-xl leading-snug font-extrabold text-gold-300 sm:text-2xl">
                Zimbabwe University Admissions & Enrolment —{" "}
                <span className="text-white">
                  <ScrambleWords
                    words={["your future, our mission.", "one portal, every campus.", "grades in, offer out.", "guiding. connecting. empowering."]}
                  />
                </span>
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-200">
                From A-Level results to registration day: AI career guidance, verified programme data from
                Zimbabwe's universities and polytechnics, document verification and Paynow-secured
                applications — in one student journey.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3.5 font-display text-sm font-extrabold tracking-wide text-navy-950 uppercase transition hover:bg-gold-300"
                >
                  Start my application <IconArrow className="h-4 w-4" />
                </Link>
                <Link
                  href="/programmes"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 font-display text-sm font-extrabold tracking-wide text-white uppercase transition hover:border-gold-400 hover:text-gold-300"
                >
                  Browse programmes
                </Link>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {[
                  { v: unis.length, s: "", l: "Partner institutions" },
                  { v: 34, s: "+", l: "Verified programmes" },
                  { v: 2400, s: "+", l: "Students guided" },
                ].map((st) => (
                  <div key={st.l}>
                    <dt className="font-display text-3xl font-black text-gold-400">
                      <CountUp to={st.v} suffix={st.s} />
                    </dt>
                    <dd className="mt-1 text-xs font-semibold tracking-wide text-navy-200 uppercase">{st.l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* admissions board */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gold-400/15 blur-xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-navy-900/80 backdrop-blur">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <span className="font-display text-sm font-extrabold tracking-widest text-gold-400 uppercase">
                    Admissions board
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-bold text-navy-200">
                    <span className="pulse-dot h-2 w-2 rounded-full bg-zim-green" /> LIVE
                  </span>
                </div>
                {next && (
                  <div className="border-b border-white/10 px-6 py-5">
                    <p className="text-xs font-bold tracking-widest text-navy-200 uppercase">Next closing deadline</p>
                    <p className="mt-1 font-display text-lg font-extrabold text-white">{next.title}</p>
                    <p className="text-sm text-navy-200">{next.uniName} · {formatDate(next.deadline)}</p>
                    <Countdown date={next.deadline} className="mt-4" />
                  </div>
                )}
                <ul className="divide-y divide-white/10">
                  {upcoming.slice(1).map((u) => (
                    <li key={`${u.uniName}-${u.title}`} className="flex items-center justify-between gap-4 px-6 py-3.5">
                      <div>
                        <p className="text-sm font-bold text-white">{u.title}</p>
                        <p className="text-xs text-navy-200">{u.uniName}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-white/10 px-2.5 py-1 font-display text-xs font-extrabold text-gold-300">
                        {formatDate(u.deadline)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="bg-gold-400 px-6 py-3 text-center font-display text-xs font-extrabold tracking-widest text-navy-950 uppercase">
                  Opening doors to Zimbabwe's top universities
                </div>
              </div>
            </div>
          </div>
          <FlagStripe className="h-1.5 w-full" />
          <Ticker items={unis.map((u) => u.name)} className="border-y border-white/10 bg-navy-900 text-navy-100" />
        </section>

        {/* ============ SERVICES ============ */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Our services</p>
                <h2 className="mt-2 max-w-xl font-display text-4xl font-black tracking-tight text-navy-900 sm:text-5xl">
                  Everything between your results and your registration.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
                Five services, one mission: to make university admission simple, accessible and stress-free
                for every student — local or international.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <article className="lift group h-full rounded-xl border border-navy-900/10 bg-white p-6">
                  <span className="inline-flex rounded-lg bg-navy-800 p-3 text-gold-400 transition group-hover:bg-gold-400 group-hover:text-navy-900">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-base leading-tight font-extrabold text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ PROCESS (sticky two-column) ============ */}
        <section className="bg-navy-950 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-bold tracking-[0.25em] text-gold-400 uppercase">Our simple process</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">
                Five steps from “I'm not sure” to “I'm enrolled”.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-navy-200">
                The same journey thousands of Zimbabwean students have trusted — now fully digital, tracked
                in real time, and secured by Paynow at checkout.
              </p>
              <div className="mt-8 flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 p-5">
                <IconSpark className="h-8 w-8 shrink-0 text-gold-400" />
                <p className="text-sm text-navy-100">
                  Not sure what to study? Our <strong className="text-gold-300">AI career guidance</strong> interviews
                  you about subjects, interests and budget, then hands you a personalised field shortlist.
                </p>
              </div>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 font-display text-sm font-extrabold tracking-wide text-navy-950 uppercase transition hover:bg-gold-300"
              >
                Begin step one <IconArrow className="h-4 w-4" />
              </Link>
            </div>
            <ol className="space-y-5">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 70}>
                  <li className="group relative overflow-hidden rounded-xl border border-white/10 bg-navy-900/70 p-7 transition hover:border-gold-400/50">
                    <span className="absolute -top-6 -right-3 font-display text-[7rem] font-black text-white/5 transition group-hover:text-gold-400/10">
                      {s.n}
                    </span>
                    <p className="font-display text-xs font-extrabold tracking-[0.3em] text-gold-400 uppercase">Step {s.n}</p>
                    <h3 className="mt-2 font-display text-2xl font-extrabold">{s.title}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-navy-200">{s.body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ PARTNERS + TRUST ============ */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">We connect you to</p>
                <h2 className="mt-2 font-display text-4xl font-black tracking-tight text-navy-900">
                  Leading universities & polytechnics in Zimbabwe
                </h2>
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {unis.slice(0, 12).map((u, i) => (
                    <Reveal key={u.id} delay={i * 50}>
                      <Link
                        href={`/programmes?q=${encodeURIComponent(u.name)}`}
                        className="lift flex h-full flex-col items-center gap-3 rounded-xl border border-navy-900/10 bg-white p-4 text-center"
                      >
                        <UniCrest name={u.name} hue={u.hue} logoUrl={u.logoUrl} className="h-14 w-14" />
                        <span className="text-xs leading-tight font-bold text-navy-900">{u.name}</span>
                        <span className="text-[10px] font-semibold tracking-wide text-ink-soft uppercase">
                          {u.type} · {u.city}
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-navy-900/10 bg-white p-8">
                <h3 className="font-display text-2xl font-black text-navy-900">Why choose ZUAE?</h3>
                <ul className="mt-5 space-y-3.5 text-sm text-ink">
                  {[
                    "Reliable, up-to-date programme & fee information verified with registrars",
                    "Experienced and friendly support team in Harare CBD",
                    "Transparent, affordable service fees — published in full",
                    "Committed to your academic success beyond admission",
                    "Private per-student document vault, never shared without consent",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-zim-green" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12.5l5 5L20 6.5" />
                      </svg>
                      <span className="leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <ZimcheBadge />
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-lg bg-paper px-4 py-3 text-xs text-ink-soft">
                  <IconCap className="h-6 w-6 shrink-0 text-navy-700" />
                  Payments processed by Paynow Zimbabwe — Ecocash, Visa, Mastercard & ZIPIT.
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ============ CTA ============ */}
        <section className="relative overflow-hidden bg-gold-400">
          <div className="dot-grid-dark absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-16 sm:px-6">
            <div>
              <h2 className="font-display text-4xl font-black tracking-tight text-navy-950 sm:text-5xl">
                Your future starts today.
              </h2>
              <p className="mt-3 max-w-lg font-display text-lg font-bold text-navy-900">
                Your dream university is closer than you think. We'll get you there!
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-lg bg-navy-950 px-7 py-4 font-display text-sm font-extrabold tracking-wide text-gold-400 uppercase transition hover:bg-navy-800">
                Create free account
              </Link>
              <a href="tel:+263771862929" className="rounded-lg border-2 border-navy-950 px-7 py-4 font-display text-sm font-extrabold tracking-wide text-navy-950 uppercase transition hover:bg-navy-950 hover:text-gold-400">
                +263 771 862 929
              </a>
            </div>
          </div>
          <FlagStripe className="h-1.5 w-full" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
