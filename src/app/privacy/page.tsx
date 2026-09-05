import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FlagStripe } from "@/components/brand";

export const metadata: Metadata = { title: "Privacy policy" };

const SECTIONS: [string, string[]][] = [
  ["1. Who we are", [
    "ZUAE (Zimbabwe University Admissions & Enrolment) operates this portal from Harare, Zimbabwe. This policy explains what we collect, why we collect it, and the rights you hold under the Cyber and Data Protection Act (Chapter 12:07).",
  ]],
  ["2. What we collect", [
    "Account data: email address and a salted, hashed password (never stored in plain text).",
    "Profile data you provide: full name, date of birth, nationality, contact numbers, current school, A-Level subjects and grades, preferred study level and career interests.",
    "Documents you upload: national ID/passport, certificates or transcripts, passport photo and (optionally) a guardian consent form. These are stored in a private per-student vault accessible only to you and verified ZUAE officers.",
    "Application and payment metadata: programmes applied to, statuses, Paynow transaction references and amounts. Card details never touch our servers — Paynow handles them.",
  ]],
  ["3. How we use it", [
    "To match you to programmes you qualify for, prepare and submit applications on your behalf, verify documents with institutions, process payments, and send you deadline and status notifications.",
    "AI career guidance uses your subjects, grades and questionnaire answers only to generate your personal suggestion, which is stored on your profile and never sold.",
  ]],
  ["4. Who we share it with", [
    "Only the universities or polytechnics you explicitly apply to receive the documents required for that application. Payment references are shared with Paynow for processing. We do not sell or rent student data, ever.",
  ]],
  ["5. Retention & security", [
    "Documents and profiles are retained while your account is active and for seven years afterwards for audit purposes, then deleted. Data is encrypted in transit (TLS) and at rest; access is role-restricted and logged.",
  ]],
  ["6. Your rights", [
    "You may access, correct, export or delete your personal data at any time from your dashboard or by emailing privacy@zuae.co.zw. Deleting your account removes documents within 30 days.",
  ]],
  ["7. Cookies & sessions", [
    "We use a single strictly-necessary session cookie to keep you signed in. There are no advertising or cross-site tracking cookies on this portal.",
  ]],
  ["8. Contact", [
    "Data Protection Officer, ZUAE, 2nd Floor Joina City, Harare · privacy@zuae.co.zw · +263 771 862 929.",
  ]],
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Trust & transparency</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-navy-900 sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-ink-soft">Last updated: January 2026 · Applies to zuae.co.zw and this portal.</p>
        <FlagStripe className="mt-8 h-1 w-40" />
        <div className="mt-10 space-y-9">
          {SECTIONS.map(([title, paras]) => (
            <section key={title}>
              <h2 className="font-display text-xl font-extrabold text-navy-900">{title}</h2>
              {paras.map((p) => (
                <p key={p.slice(0, 24)} className="mt-2.5 text-sm leading-relaxed text-ink-soft">{p}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
