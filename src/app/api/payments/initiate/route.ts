import { db } from "@/db";
import { applications, payments } from "@/db/schema";
import { errorResponse, HttpError, readJson, requireUser } from "@/lib/guard";
import { initiatePaynow, isPaynowConfigured } from "@/lib/paynow";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await readJson<{ applicationId?: string }>(req);
    if (!body.applicationId) throw new HttpError(400, "applicationId required.");
    const [app] = await db.select().from(applications).where(eq(applications.id, body.applicationId)).limit(1);
    if (!app || app.userId !== user.id) throw new HttpError(404, "Application not found.");
    if (app.paymentStatus === "paid") throw new HttpError(409, "This application is already paid.");

    const reference = `ZUAE-PN-${Math.floor(100000 + Math.random() * 899999)}`;
    const origin = req.headers.get("origin") ?? "https://zuae.co.zw";

    let pollUrl: string | null = null;
    let browserUrl: string | null = null;
    let mode: "live" | "demo" = "demo";

    if (isPaynowConfigured()) {
      const res = await initiatePaynow({
        reference,
        amount: app.totalAmount,
        email: user.email,
        info: `ZUAE ${app.packageType} application package`,
        returnUrl: `${origin}/dashboard/applications?payment=return`,
        resultUrl: `${origin}/api/payments/${""}result`,
      });
      if (res.ok) {
        mode = "live";
        browserUrl = res.browserUrl;
        pollUrl = res.pollUrl;
      }
    }

    const [payment] = await db
      .insert(payments)
      .values({
        userId: user.id,
        applicationId: app.id,
        amount: app.totalAmount,
        status: "pending",
        reference,
        pollUrl,
        browserUrl,
        payload: { mode, packageType: app.packageType },
      })
      .returning();
    await db.update(applications).set({ paymentStatus: "pending", updatedAt: new Date() }).where(eq(applications.id, app.id));

    return Response.json({
      mode,
      payment: { id: payment.id, reference: payment.reference, amount: payment.amount },
      browserUrl,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
