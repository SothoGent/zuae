import crypto from "crypto";

/**
 * Paynow Zimbabwe (https://paynow.co.zw) web integration.
 * Docs: https://developers.paynow.co.zw/docs/initiate_transaction.html
 * When PAYNOW_INTEGRATION_ID / PAYNOW_AUTH_KEY are not configured the app
 * runs in clearly-labelled DEMO mode with a simulated hosted checkout.
 */
const BASE = "https://www.paynow.co.zw";

export function isPaynowConfigured(): boolean {
  return Boolean(process.env.PAYNOW_INTEGRATION_ID && process.env.PAYNOW_AUTH_KEY);
}

function makeHash(values: string[], authKey: string): string {
  return crypto.createHash("sha512").update(values.join("") + authKey, "utf8").digest("hex");
}

export type InitiateResult =
  | { ok: true; browserUrl: string; pollUrl: string; raw: Record<string, string> }
  | { ok: false; error: string };

export async function initiatePaynow(opts: {
  reference: string;
  amount: number;
  email: string;
  info: string;
  returnUrl: string;
  resultUrl: string;
}): Promise<InitiateResult> {
  const id = process.env.PAYNOW_INTEGRATION_ID;
  const authKey = process.env.PAYNOW_AUTH_KEY;
  if (!id || !authKey) return { ok: false, error: "Paynow not configured" };
  const amount = opts.amount.toFixed(2);
  const hash = makeHash(
    [id, opts.reference, amount, opts.info, "Paid", opts.returnUrl, opts.resultUrl],
    authKey,
  );
  const body = new URLSearchParams({
    id,
    reference: opts.reference,
    amount,
    additionalInfo: opts.info,
    statusMessage: "Paid",
    returnUrl: opts.returnUrl,
    resultUrl: opts.resultUrl,
    authKey,
    hash,
  });
  try {
    const res = await fetch(`${BASE}/interface/initiatetransaction`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const text = await res.text();
    const parsed = Object.fromEntries(new URLSearchParams(text).entries());
    if ((parsed.status ?? "").toLowerCase() !== "ok" || !parsed.browserurl) {
      return { ok: false, error: parsed.error ?? text.slice(0, 200) };
    }
    return { ok: true, browserUrl: parsed.browserurl, pollUrl: parsed.pollurl, raw: parsed };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Paynow unreachable" };
  }
}

export async function pollPaynow(pollUrl: string): Promise<"paid" | "pending" | "failed"> {
  try {
    const res = await fetch(pollUrl);
    const text = await res.text();
    const parsed = Object.fromEntries(new URLSearchParams(text).entries());
    const s = (parsed.status ?? "").toLowerCase();
    if (s === "paid") return "paid";
    if (["failed", "cancelled", "error"].includes(s)) return "failed";
    return "pending";
  } catch {
    return "pending";
  }
}
