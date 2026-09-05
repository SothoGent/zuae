import { db } from "@/db";
import { programmes, universities } from "@/db/schema";
import { errorResponse } from "@/lib/guard";
import { and, asc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const activeOnly = new URL(req.url).searchParams.get("active") === "true";
    const rows = await db
      .selectDistinct({
        id: universities.id,
        name: universities.name,
        city: universities.city,
        province: universities.province,
        type: universities.type,
        category: universities.category,
        hue: universities.hue,
        blurb: universities.blurb,
        logoUrl: universities.logoUrl,
      })
      .from(universities)
      .innerJoin(programmes, eq(programmes.universityId, universities.id))
      .where(activeOnly ? eq(programmes.active, true) : undefined)
      .orderBy(asc(universities.name))
      .limit(activeOnly ? 3 : 100);
    return Response.json({ universities: rows });
  } catch (e) {
    return errorResponse(e);
  }
}
