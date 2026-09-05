import { db } from "@/db";
import { documents } from "@/db/schema";
import { errorResponse, HttpError, requireUser } from "@/lib/guard";
import { eq } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    if (!doc) throw new HttpError(404, "Document not found.");
    if (doc.userId !== user.id && user.role !== "admin") {
      throw new HttpError(403, "This document is private to its owner.");
    }
    const bytes = new Uint8Array(doc.data as unknown as ArrayBuffer);
    return new Response(bytes, {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
