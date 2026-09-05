"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckoutModal } from "./checkout-modal";
import { UniCrest } from "./brand";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/grades";
import { formatDateTime, formatDate } from "@/lib/utils";
import { IconWallet } from "./icons";

export type AppItem = {
  id: string;
  status: string;
  updatedAt: string;
  programme: {
    title: string;
    faculty: string;
    level: string;
    deadline: string;
    university: { name: string; city: string; hue: number; logoUrl: string | null };
  };
};
export type AppPayment = {
  id: string;
  reference: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
};
export type AppRow = {
  id: string;
  packageType: string;
  serviceFee: number;
  universityFees: number;
  totalAmount: number;
  paymentStatus: string;
  paymentRef: string | null;
  status: string;
  createdAt: string;
  items: AppItem[];
  payments: AppPayment[];
};

const RAIL_COLOR: Record<string, string> = {
  draft: "bg-stone-400",
  submitted: "bg-sky-500",
  under_review: "bg-amber-500",
  offer_received: "bg-emerald-500",
  enrolled: "bg-zim-green",
};

function ProgressBar({ steps, completed }: { steps: string[]; completed: number }) {
  const total = steps.length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs font-bold text-ink-soft">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-paper-dark">
        <div
          className="h-full rounded-full bg-linear-to-r from-navy-600 to-gold-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {steps.map((step, i) => (
          <span
            key={step}
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              i < completed ? "bg-zim-green/20 text-zim-green" : "bg-paper-dark text-ink-soft"
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

const PROGRESS_STEPS = ["Payment", "Submitted", "Under review", "Offer received", "Enrolled"];
const PROGRESS_STATUS_INDEX: Record<string, number> = {
  draft: 0,
  submitted: 2,
  under_review: 3,
  offer_received: 4,
  enrolled: 5,
};

export function ApplicationsClient({ applications }: { applications: AppRow[] }) {
  const router = useRouter();
  const [checkout, setCheckout] = useState<{ id: string; total: number; pkg: string } | null>(null);
  const allPayments = applications.flatMap((a) => a.payments);

  return (
    <div className="space-y-6">
      {applications.length === 0 && (
        <p className="rounded-xl border-2 border-dashed border-navy-900/15 bg-white/60 p-12 text-center text-sm text-ink-soft">
          No applications yet — build a shortlist in the matcher and start your first package.
        </p>
      )}

      {applications.map((a) => (
        <article key={a.id} className="overflow-hidden rounded-xl border border-navy-900/10 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-900/10 bg-paper px-6 py-4">
            <div>
              <p className="font-display text-lg font-black text-navy-900">
                {a.packageType.toUpperCase()} package
                <span className="ml-2 text-sm font-bold text-ink-soft">· {formatDate(a.createdAt.slice(0, 10))}</span>
              </p>
              <p className="text-xs font-semibold text-ink-soft">
                Service USD {a.serviceFee} + university fees USD {a.universityFees} ={" "}
                <strong className="text-navy-900">USD {a.totalAmount}</strong>
                {a.paymentRef && <> · receipt <code className="font-bold">{a.paymentRef}</code></>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase ${a.paymentStatus === "paid" ? "bg-zim-green/15 text-zim-green" : a.paymentStatus === "pending" ? "bg-gold-400/20 text-gold-600" : "bg-stone-200 text-stone-700"}`}>
                {a.paymentStatus}
              </span>
              {a.paymentStatus !== "paid" && (
                <button
                  onClick={() => setCheckout({ id: a.id, total: a.totalAmount, pkg: a.packageType })}
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-xs font-extrabold tracking-wide text-white uppercase transition hover:bg-navy-700"
                >
                  <IconWallet className="h-4 w-4" /> Pay now
                </button>
              )}
            </div>
          </header>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
            <ol className="relative space-y-5 border-l-2 border-navy-900/10 pl-6">
              {a.items.map((i) => (
                <li key={i.id} className="relative">
                  <span className={`absolute top-1 -left-[1.85rem] h-3.5 w-3.5 rounded-full border-4 border-white ${RAIL_COLOR[i.status] ?? "bg-stone-400"}`} />
                  <div className="flex flex-wrap items-center gap-3">
                    <UniCrest name={i.programme.university.name} hue={i.programme.university.hue} logoUrl={i.programme.university.logoUrl} className="h-8 w-8" />
                    <div className="min-w-0">
                      <p className="font-display text-sm font-extrabold text-navy-900">{i.programme.title}</p>
                      <p className="text-xs font-semibold text-ink-soft">
                        {i.programme.university.name} · {i.programme.university.city} · closes {formatDate(i.programme.deadline)}
                      </p>
                    </div>
                    <span className={`ml-auto rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase ${STATUS_TONE[i.status]}`}>
                      {STATUS_LABEL[i.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-ink-soft/80">Updated {formatDateTime(i.updatedAt)}</p>
                  <ProgressBar steps={PROGRESS_STEPS} completed={PROGRESS_STATUS_INDEX[i.status] ?? 0} />
                </li>
              ))}
            </ol>
            <aside className="rounded-lg bg-paper p-4">
              <h3 className="font-display text-xs font-extrabold tracking-widest text-ink-soft uppercase">What happens next</h3>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-soft">
                {a.paymentStatus !== "paid" ? (
                  <li>1. Complete Paynow payment to release this package to your ZUAE officer.</li>
                ) : (
                  <>
                    <li>1. Officer verifies your document vault (24–48 hrs).</li>
                    <li>2. Application submitted to the university registry.</li>
                    <li>3. Registry review — status updates appear here live.</li>
                    <li>4. Offer letter & enrolment support from ZUAE.</li>
                  </>
                )}
              </ul>
            </aside>
          </div>
        </article>
      ))}

      {allPayments.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-navy-900/10 bg-white">
          <h2 className="border-b border-navy-900/10 bg-paper px-6 py-4 font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">
            Payment history
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-extrabold tracking-wide text-ink-soft uppercase">
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {allPayments.map((p) => (
                <tr key={p.id} className="border-t border-navy-900/10">
                  <td className="px-6 py-3"><code className="font-bold text-navy-900">{p.reference}</code></td>
                  <td className="px-6 py-3 font-semibold text-ink-soft">Paynow</td>
                  <td className="px-6 py-3 text-ink-soft">{formatDateTime(p.paidAt ?? p.createdAt)}</td>
                  <td className="px-6 py-3 text-right font-display font-extrabold text-navy-900">USD {p.amount}</td>
                  <td className={`px-6 py-3 text-right font-extrabold uppercase ${p.status === "paid" ? "text-zim-green" : p.status === "failed" ? "text-zim-red" : "text-gold-600"}`}>
                    {p.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {checkout && (
        <CheckoutModal
          applicationId={checkout.id}
          amount={checkout.total}
          packageType={checkout.pkg}
          onClose={() => {
            setCheckout(null);
            router.refresh();
          }}
          onPaid={() => undefined}
        />
      )}
    </div>
  );
}
