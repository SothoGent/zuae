import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FlagStripe } from "@/components/brand";

export const metadata: Metadata = { title: "Terms & conditions" };

const SECTIONS: [string, string[]][] = [
  ["1. The agreement", [
    "By creating a ZUAE student account you accept these terms. ZUAE provides admissions guidance, document preparation, application submission and enrolment support services; we are not a university and do not award qualifications.",
  ]],
  ["2. Accounts", [
    "You must provide truthful information and keep your credentials confidential. One account per student. ZUAE may suspend accounts used to submit fraudulent documents.",
  ]],
  ["3. Applications & outcomes", [
    "Eligibility results from the Smart Matcher and AI guidance are advisory. Final admission decisions rest solely with each university or polytechnic. ZUAE does not guarantee admission, but we do guarantee that a complete, verified application reaches the registry before the deadline.",
  ]],
  ["4. Fees & refunds", [
    "Service fees (USD 100 local Basic / Premium from USD 100 / USD 200 International) are payable per package via Paynow before submission. University application fees are charged at cost. Service fees are refundable in full if ZUAE fails to submit a paid application before its published deadline; otherwise they are non-refundable once submission has occurred. University fees follow each institution's own refund policy.",
  ]],
  ["5. Documents", [
    "You warrant that every document uploaded is authentic. Submitting falsified certificates is a criminal offence in Zimbabwe and results in immediate termination and reporting to the institution concerned.",
  ]],
  ["6. Payments", [
    "Payments are processed by Paynow (Pvt) Ltd. ZUAE stores only transaction references and statuses. Failed transactions release the application back to draft so you can retry.",
  ]],
  ["7. Acceptable use", [
    "You may not scrape, resell or mirror the programme database, attempt to access other students' document vaults, or use the AI guidance tool for unlawful purposes.",
  ]],
  ["8. Liability", [
    "ZUAE's aggregate liability is limited to the service fees paid for the affected package. Nothing in these terms limits liability for fraud or wilful misconduct.",
  ]],
  ["9. Governing law", [
    "These terms are governed by the laws of Zimbabwe; disputes fall under the jurisdiction of the Harare courts.",
  ]],
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Trust & transparency</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-navy-900 sm:text-5xl">Terms & Conditions</h1>
        <p className="mt-3 text-sm text-ink-soft">Effective January 2026 · ZUAE (PVO registration displayed on issue).</p>
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
