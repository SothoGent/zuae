"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconWallet, IconX } from "./icons";

type Props = {
  applicationId: string;
  amount: number;
  packageType: string;
  onClose: () => void;
  onPaid: (reference: string) => void;
};

export function CheckoutModal({ applicationId, amount, packageType, onClose, onPaid }: Props) {
  const [stage, setStage] = useState<"init" | "demo" | "live" | "processing" | "paid" | "failed">("init");
  const [payment, setPayment] = useState<{ id: string; reference: string } | null>(null);
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "Could not start payment.");
        setStage("failed");
        return;
      }
      setPayment(data.payment);
      if (data.mode === "live" && data.browserUrl) {
        setBrowserUrl(data.browserUrl);
        setStage("live");
      } else {
        setStage("demo");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const confirm = async (outcome: "paid" | "failed") => {
    if (!payment) return;
    setStage("processing");
    const res = await fetch(`/api/payments/${payment.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    const data = await res.json();
    if (data.status === "paid") {
      setStage("paid");
      onPaid(payment.reference);
    } else {
      setStage("failed");
      setError(outcome === "failed" ? "Payment cancelled or declined on Paynow." : "Payment still pending.");
    }
  };

  const checkLive = async () => {
    if (!payment) return;
    setStage("processing");
    const res = await fetch(`/api/payments/${payment.id}/confirm`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await res.json();
    if (data.status === "paid") {
      setStage("paid");
      onPaid(payment.reference);
    } else if (data.status === "failed") {
      setStage("failed");
      setError("Paynow reports this transaction as failed.");
    } else {
      setStage("live");
      setError("Not paid yet — complete payment in the Paynow tab, then check again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-navy-950 px-6 py-4">
          <span className="flex items-center gap-2 font-display text-sm font-extrabold tracking-widest text-gold-400 uppercase">
            <IconWallet className="h-5 w-5" /> Paynow checkout
          </span>
          <button onClick={onClose} className="text-navy-200 transition hover:text-white" aria-label="Close checkout">
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {stage === "init" && <p className="py-8 text-center text-sm font-semibold text-ink-soft">Contacting Paynow…</p>}

          {(stage === "demo" || stage === "live") && payment && (
            <>
              <div className="rounded-xl border border-navy-900/10 bg-paper p-5 text-center">
                <p className="text-xs font-bold tracking-widest text-ink-soft uppercase">Amount due</p>
                <p className="mt-1 font-display text-4xl font-black text-navy-900">USD {amount.toLocaleString()}</p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">
                  {packageType.toUpperCase()} package · Ref <code className="font-bold">{payment.reference}</code>
                </p>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-bold text-ink-soft">
                {["Ecocash", "OneMoney", "Telecash", "Visa", "Mastercard", "ZIPIT"].map((m) => (
                  <span key={m} className="rounded-md border border-navy-900/15 px-2.5 py-1">{m}</span>
                ))}
              </div>
              {stage === "live" && browserUrl && (
                <a href={browserUrl} target="_blank" rel="noreferrer" className="mt-5 block rounded-lg bg-zim-green px-5 py-3 text-center font-display text-sm font-extrabold tracking-wide text-white uppercase transition hover:brightness-110">
                  Continue to Paynow →
                </a>
              )}
              {stage === "live" ? (
                <button onClick={checkLive} className="mt-3 w-full rounded-lg border border-navy-900/20 px-5 py-3 font-display text-sm font-extrabold tracking-wide text-navy-800 uppercase transition hover:bg-navy-50">
                  I've paid — check status
                </button>
              ) : (
                <>
                  <button onClick={() => confirm("paid")} className="mt-5 w-full rounded-lg bg-zim-green px-5 py-3 font-display text-sm font-extrabold tracking-wide text-white uppercase transition hover:brightness-110">
                    Pay USD {amount.toLocaleString()}
                  </button>
                  <button onClick={() => confirm("failed")} className="mt-2 w-full rounded-lg border border-navy-900/20 px-5 py-2.5 text-xs font-bold text-ink-soft transition hover:border-zim-red/40 hover:text-zim-red">
                    Simulate failed / cancelled payment
                  </button>
                  <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-soft">
                    Sandbox mode: Paynow keys are not configured on this deployment, so the hosted checkout is
                    simulated. With <code>PAYNOW_INTEGRATION_ID</code> set, students are redirected to the real
                    Paynow page and status is polled automatically.
                  </p>
                </>
              )}
              {error && <p className="mt-3 rounded-md border border-gold-500/40 bg-gold-400/10 px-3 py-2 text-xs font-bold text-gold-600">{error}</p>}
            </>
          )}

          {stage === "processing" && (
            <div className="py-10 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-navy-700" />
              <p className="mt-4 text-sm font-semibold text-ink-soft">Confirming with Paynow…</p>
            </div>
          )}

          {stage === "paid" && payment && (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zim-green/15 text-zim-green">
                <IconCheck className="h-8 w-8" />
              </span>
              <h3 className="mt-4 font-display text-2xl font-black text-navy-900">Payment received!</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Receipt <code className="font-bold">{payment.reference}</code> · USD {amount.toLocaleString()}.
                Your application is now <strong>submitted</strong> and a ZUAE officer is on it.
              </p>
              <button onClick={onClose} className="mt-6 rounded-lg bg-navy-800 px-6 py-3 font-display text-sm font-extrabold tracking-wide text-white uppercase transition hover:bg-navy-700">
                Track my application
              </button>
            </div>
          )}

          {stage === "failed" && (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zim-red/15 text-zim-red">
                <IconX className="h-8 w-8" />
              </span>
              <h3 className="mt-4 font-display text-xl font-black text-navy-900">Payment not completed</h3>
              <p className="mt-2 text-sm text-ink-soft">{error || "You can retry anytime — your application is saved as a draft."}</p>
              <button onClick={onClose} className="mt-6 rounded-lg border border-navy-900/20 px-6 py-3 font-display text-sm font-extrabold tracking-wide text-navy-800 uppercase transition hover:bg-navy-50">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
