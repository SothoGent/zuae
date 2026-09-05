import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FlagStripe } from "@/components/brand";
import { Reveal } from "@/components/motion";
import { IconCheck, IconDoc, IconPlane, IconShield, IconWallet } from "@/components/icons";
import { PACKAGES } from "@/lib/pricing";

export const metadata: Metadata = { title: "Services & fees" };

const FEE_ROWS = [
  ["Basic package — 1 university (local student)", "USD 100"],
  ["Premium package — up to 3 universities (local student)", "USD 100 + USD 25 per extra university"],
  ["International package — up to 3 universities + visa support", "USD 200"],
  ["International student surcharge (Basic/Premium)", "USD 200 base rate applies"],
  ["University application fees", "Charged per university at cost (USD 15–50, shown before you pay)"],
  ["Document verification & storage", "Free"],
  ["AI career guidance & Smart Matcher", "Free"],
  ["Re-submission of a rejected document", "Free"],
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-navy-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="text-xs font-bold tracking-[0.25em] text-gold-400 uppercase">Services & fees</p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-black tracking-tight sm:text-5xl">
              Transparent fees. No surprises at the registry.
            </h1>
            <p className="mt-4 max-w-2xl text-navy-200">
              One service fee per application package, plus university application fees shown item-by-item
              before checkout. Everything below is the complete price list — printed here because trust is
              our product.
            </p>
          </div>
          <FlagStripe className="mt-12 h-1.5 w-full" />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {(Object.keys(PACKAGES) as (keyof typeof PACKAGES)[]).map((key, i) => {
              const p = PACKAGES[key];
              const price = key === "basic" ? 100 : key === "premium" ? 100 : 200;
              const highlight = key === "premium";
              return (
                <Reveal key={key} delay={i * 90}>
                  <article
                    className={`lift relative flex h-full flex-col rounded-2xl border p-8 ${
                      highlight ? "border-gold-400 bg-navy-950 text-white shadow-xl" : "border-navy-900/10 bg-white"
                    }`}
                  >
                    {highlight && (
                      <span className="absolute -top-3 left-8 rounded-full bg-gold-400 px-3 py-1 font-display text-[11px] font-extrabold tracking-widest text-navy-950 uppercase">
                        Most chosen
                      </span>
                    )}
                    <h2 className={`font-display text-2xl font-black ${highlight ? "text-gold-400" : "text-navy-900"}`}>
                      {p.label}
                    </h2>
                    <p className={`mt-1 text-sm ${highlight ? "text-navy-200" : "text-ink-soft"}`}>{p.tagline}</p>
                    <p className="mt-6">
                      <span className={`font-display text-5xl font-black ${highlight ? "text-white" : "text-navy-900"}`}>
                        ${price}
                      </span>
                      <span className={`ml-2 text-sm font-semibold ${highlight ? "text-navy-200" : "text-ink-soft"}`}>
                        {key === "premium" ? "+ $25 / extra uni" : "per package"}
                      </span>
                    </p>
                    <ul className="mt-6 space-y-2.5 text-sm">
                      {p.perks.map((perk) => (
                        <li key={perk} className="flex gap-2.5">
                          <IconCheck className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-gold-400" : "text-zim-green"}`} />
                          <span className={highlight ? "text-navy-100" : "text-ink"}>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/signup"
                      className={`mt-8 inline-flex justify-center rounded-lg px-5 py-3 font-display text-sm font-extrabold tracking-wide uppercase transition ${
                        highlight ? "bg-gold-400 text-navy-950 hover:bg-gold-300" : "bg-navy-800 text-white hover:bg-navy-700"
                      }`}
                    >
                      Choose {p.label}
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <div className="mt-14 overflow-hidden rounded-2xl border border-navy-900/10 bg-white">
              <div className="flex items-center gap-3 border-b border-navy-900/10 bg-paper px-6 py-4">
                <IconWallet className="h-6 w-6 text-navy-700" />
                <h2 className="font-display text-xl font-black text-navy-900">Complete fee schedule</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {FEE_ROWS.map(([item, fee], i) => (
                    <tr key={item} className={i % 2 ? "bg-paper/60" : ""}>
                      <td className="px-6 py-3.5 font-semibold text-ink">{item}</td>
                      <td className="px-6 py-3.5 text-right font-display font-extrabold whitespace-nowrap text-navy-900">{fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-navy-900/10 bg-paper px-6 py-4 text-xs leading-relaxed text-ink-soft">
                Payments are processed by <strong>Paynow Zimbabwe</strong> (Ecocash, OneMoney, Telecash, Visa,
                Mastercard, ZIPIT). University application fees are paid at cost and itemised on your invoice
                before you confirm. ZUAE never asks for cash payments to personal numbers.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              { icon: IconDoc, t: "Document preparation", b: "Certified checks of IDs, certificates and passport photos against each university's checklist." },
              { icon: IconPlane, t: "Visa & arrival support", b: "Support letters, proof-of-funds guidance and airport-to-residence briefings for international students." },
              { icon: IconShield, t: "Post-offer support", b: "Registration checklists, fee schedule decoding and accommodation advice after your offer letter lands." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 80}>
                <div className="lift h-full rounded-xl border border-navy-900/10 bg-white p-6">
                  <c.icon className="h-7 w-7 text-zim-green" />
                  <h3 className="mt-3 font-display text-lg font-extrabold text-navy-900">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
