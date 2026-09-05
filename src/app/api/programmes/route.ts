import { db } from "@/db";
import { programmes } from "@/db/schema";
import { errorResponse, HttpError } from "@/lib/guard";
import { and, asc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const universityId = new URL(req.url).searchParams.get("universityId");
    if (!universityId) throw new HttpError(400, "universityId is required.");
    const rows = await db
      .select({
        id: programmes.id,
        title: programmes.title,
        faculty: programmes.faculty,
        level: programmes.level,
        mode: programmes.mode,
        feesLocal: programmes.feesLocal,
        deadline: programmes.deadline,
        description: programmes.description,
      })
      .from(programmes)
      .where(and(eq(programmes.universityId, universityId), eq(programmes.active, true)))
      .orderBy(asc(programmes.title));
    return Response.json({ programmes: rows });
  } catch (e) {
    return errorResponse(e);
  }
}
