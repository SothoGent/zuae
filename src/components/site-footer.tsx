import Link from "next/link";
import { FlagStripe, ZimcheBadge, ZuaeCrest } from "./brand";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy-950 text-navy-100">
      <FlagStripe className="h-1.5 w-full" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <ZuaeCrest className="h-11 w-11" />
            <span className="font-display text-2xl font-black text-white">ZUAE</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy-200">
            Zimbabwe University Admissions & Enrolment — guiding you, connecting you, empowering you into
            ZIMCHE-recognised colleges and universities across Zimbabwe.
          </p>
          <p className="mt-4 text-xs text-navy-200/70">
            Registered private voluntary organisation · PVO registration with the Department of Social
            Development (certificate displayed on issue). · ZIMCHE verification available for every partner
            institution.
          </p>
        </div>
        <div>
          <h3 className="font-display text-sm font-extrabold tracking-widest text-gold-400 uppercase">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/programmes", "Programme database"],
              ["/services", "Services & fees"],
              ["/about", "About ZUAE"],
              ["/signup", "Create student account"],
              ["/login", "Student & staff sign in"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-gold-300">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-extrabold tracking-widest text-gold-400 uppercase">Legal & trust</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/privacy" className="transition hover:text-gold-300">Privacy Policy</Link></li>
            <li><Link href="/terms" className="transition hover:text-gold-300">Terms & Conditions</Link></li>
            <li>
              <a href="https://www.zimche.ac.zw" target="_blank" rel="noreferrer noopener" className="transition hover:text-gold-300">
                ZIMCHE regulator ↗
              </a>
            </li>
            <li>
              <a href="https://www.paynow.co.zw" target="_blank" rel="noreferrer noopener" className="transition hover:text-gold-300">
                Paynow payments ↗
              </a>
            </li>
          </ul>
          <div className="mt-5">
            <ZimcheBadge className="!border-zim-green/50 !bg-zim-green/15 [&_span:first-child]:!text-green-300 [&_.text-ink-soft]:!text-navy-200" />
          </div>
        </div>
        <div>
          <h3 className="font-display text-sm font-extrabold tracking-widest text-gold-400 uppercase">Contact us</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="font-display text-lg font-extrabold text-white">+263 771 862 929</li>
            <li>info@zuae.co.zw</li>
            <li>www.zuae.co.zw</li>
            <li>2nd Floor, Joina City, Harare CBD, Zimbabwe</li>
          </ul>
          <p className="mt-4 text-xs text-navy-200/70">
            Office hours: Mon–Fri 08:00–17:00 CAT · Sat 09:00–13:00
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-navy-200/70">
        © {new Date().getFullYear()} ZUAE — Zimbabwe University Admissions & Enrolment. Your future starts today.
      </div>
    </footer>
  );
}
