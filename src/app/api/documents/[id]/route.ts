import { db } from "@/db";
import { documents } from "@/db/schema";
import { errorResponse, HttpError, readJson, requireUser } from "@/lib/guard";
import { notify } from "@/lib/notify";
import { and, eq } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    if (!doc) throw new HttpError(404, "Document not found.");
    if (doc.userId !== user.id && user.role !== "admin") throw new HttpError(403, "Not your document.");
    await db.delete(documents).where(eq(documents.id, id));
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

/** admin verification */
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    if (user.role !== "admin") throw new HttpError(403, "Administrator access required.");
    const { id } = await ctx.params;
    const body = await readJson<{ status?: string; note?: string }>(req);
    if (!body.status || !["pending", "verified", "rejected"].includes(body.status)) {
      throw new HttpError(400, "Invalid status.");
    }
    const [doc] = await db
      .update(documents)
      .set({ status: body.status as "pending" | "verified" | "rejected", note: body.note ?? null })
      .where(eq(documents.id, id))
      .returning();
    if (!doc) throw new HttpError(404, "Document not found.");
    await notify(doc.userId, {
      title: body.status === "verified" ? "Document verified ✓".replace(" ✓", "") : body.status === "rejected" ? "Document rejected" : "Document re-queued",
      body:
        body.status === "verified"
          ? `“${doc.fileName}” passed ZUAE verification.`
          : body.status === "rejected"
            ? `“${doc.fileName}” was rejected.${body.note ? ` Reason: ${body.note}` : ""} Please upload a clearer copy.`
            : `“${doc.fileName}” is queued for verification again.`,
      kind: body.status === "verified" ? "success" : body.status === "rejected" ? "warning" : "info",
    });
    return Response.json({ document: { id: doc.id, status: doc.status, note: doc.note } });
  } catch (e) {
    return errorResponse(e);
  }
}
