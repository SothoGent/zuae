import { db } from "@/db";
import { applicationItems, applications, payments } from "@/db/schema";
import { errorResponse, HttpError, readJson, requireUser } from "@/lib/guard";
import { notify } from "@/lib/notify";
import { pollPaynow } from "@/lib/paynow";
import { eq } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const [payment] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (!payment || payment.userId !== user.id) throw new HttpError(404, "Payment not found.");
    if (payment.status === "paid") {
      return Response.json({ status: "paid", payment });
    }

    let outcome: "paid" | "failed" | "pending";
    if (payment.pollUrl) {
      outcome = await pollPaynow(payment.pollUrl);
    } else {
      const body = await readJson<{ outcome?: string }>(req).catch(() => ({ outcome: undefined }));
      outcome = body.outcome === "failed" ? "failed" : body.outcome === "pending" ? "pending" : "paid";
    }

    if (outcome === "pending") return Response.json({ status: "pending", payment });

    if (outcome === "failed") {
      await db.update(payments).set({ status: "failed" }).where(eq(payments.id, id));
      await db.update(applications).set({ paymentStatus: "unpaid", updatedAt: new Date() }).where(eq(applications.id, payment.applicationId));
      await notify(user.id, {
        title: "Payment not completed",
        body: `Paynow transaction ${payment.reference} was not completed. You can retry payment from your dashboard — your application is saved.`,
        kind: "warning",
      });
      return Response.json({ status: "failed", payment: { ...payment, status: "failed" } });
    }

    const [paid] = await db
      .update(payments)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    await db
      .update(applications)
      .set({ paymentStatus: "paid", paymentRef: payment.reference, status: "submitted", updatedAt: new Date() })
      .where(eq(applications.id, payment.applicationId));
    await db
      .update(applicationItems)
      .set({ status: "submitted", updatedAt: new Date() })
      .where(eq(applicationItems.applicationId, payment.applicationId));
    await notify(user.id, {
      title: "Payment received — application submitted",
      body: `Paynow confirmed ${payment.reference}. A ZUAE officer will verify your documents and submit your application to the university.`,
      kind: "success",
    });
    return Response.json({ status: "paid", payment: paid });
  } catch (e) {
    return errorResponse(e);
  }
}
