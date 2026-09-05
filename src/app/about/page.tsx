import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FlagStripe, ZimcheBadge, ZuaeCrest } from "@/components/brand";
import { Reveal } from "@/components/motion";
import { IconCap, IconCompass, IconHandshake, IconShield } from "@/components/icons";

export const metadata: Metadata = { title: "About us" };

const VALUES = [
  { icon: IconCompass, title: "Expert guidance", body: "Counsellors who know every registrar, deadline and bursary route in the country — backed by AI matching." },
  { icon: IconShield, title: "Integrity first", body: "Verified data, published fees, no hidden charges, no false promises. If a programme isn't ZIMCHE-recognised, we say so." },
  { icon: IconHandshake, title: "Student-centred", body: "We answer on WhatsApp, in person at Joina City, or by email — in Shona, Ndebele or English." },
  { icon: IconCap, title: "Access for all", body: "Polytechnic certificates to doctoral pathways; local and international students pay transparent, published rates." },
];

const TIMELINE = [
  { year: "2023", text: "ZUAE founded in Harare by admissions officers and teachers tired of seeing bright students miss deadlines." },
  { year: "2024", text: "First 600 students placed across UZ, NUST, MSU and the polytechnics; partner network grows to 8 institutions." },
  { year: "2025", text: "Paynow integration launches — students pay application packages from their phones in minutes." },
  { year: "2026", text: "The ZUAE digital portal opens: AI career guidance, Smart Matcher, private document vault and live application tracking." },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-navy-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <ZuaeCrest className="float-slow h-16 w-16" />
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-gold-400 uppercase">About us</p>
                <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
                  Your future. Our mission.
                </h1>
              </div>
            </div>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-200">
              ZUAE (Zimbabwe University Admissions & Enrolment) is a student-focused organisation dedicated
              to assisting local and international students with seamless admission and enrolment into
              recognised colleges and universities across Zimbabwe.
            </p>
          </div>
          <FlagStripe className="mt-12 h-1.5 w-full" />
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border-l-8 border-zim-green bg-white p-8 shadow-sm">
              <h2 className="font-display text-2xl font-black text-navy-900">Our mission</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                To make university admission simple, accessible and stress-free for every student by
                providing <strong className="text-ink">expert guidance</strong>, accurate information and{" "}
                <strong className="text-ink">personalised support</strong> every step of the way.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-2xl border-l-8 border-gold-400 bg-white p-8 shadow-sm">
              <h2 className="font-display text-2xl font-black text-navy-900">Our vision</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                A Zimbabwe where no talented student is left behind because of paperwork, distance or
                information gaps — where every A-Level result finds its rightful lecture hall.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-3xl font-black tracking-tight text-navy-900">What we stand for</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 70}>
                <div className="lift h-full rounded-xl border border-navy-900/10 bg-white p-6">
                  <v.icon className="h-7 w-7 text-navy-700" />
                  <h3 className="mt-3 font-display text-lg font-extrabold text-navy-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-paper-dark py-16">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-3xl font-black tracking-tight text-navy-900">Our story</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                From a two-desk office to a national digital platform — ZUAE grows whenever a student who
                "missed the deadline" gets a second chance.
              </p>
              <div className="mt-8">
                <ZimcheBadge />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                Registration: ZUAE operates as a registered private voluntary organisation under Zimbabwean
                law. Our registration certificate and ZIMCHE verification references for each partner
                institution are available for inspection at our Harare office and are displayed here once
                issued.
              </p>
            </div>
            <ol className="relative space-y-8 border-l-2 border-navy-900/15 pl-8">
              {TIMELINE.map((t, i) => (
                <Reveal key={t.year} delay={i * 80}>
                  <li className="relative">
                    <span className="absolute top-1 -left-[2.42rem] h-4 w-4 rounded-full border-4 border-paper-dark bg-navy-700" />
                    <p className="font-display text-xl font-black text-gold-600">{t.year}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink">{t.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
