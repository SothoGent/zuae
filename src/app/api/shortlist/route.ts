import { db } from "@/db";
import { programmes, shortlistItems, universities } from "@/db/schema";
import { errorResponse, HttpError, readJson, requireUser } from "@/lib/guard";
import { and, eq } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select({
        id: shortlistItems.id,
        createdAt: shortlistItems.createdAt,
        programme: {
          id: programmes.id,
          title: programmes.title,
          faculty: programmes.faculty,
          level: programmes.level,
          feesLocal: programmes.feesLocal,
          feesInternational: programmes.feesInternational,
          appFee: programmes.appFee,
          deadline: programmes.deadline,
          requirements: programmes.requirements,
        },
        uniName: universities.name,
        uniCity: universities.city,
        uniType: universities.type,
        uniHue: universities.hue,
        uniLogoUrl: universities.logoUrl,
      })
      .from(shortlistItems)
      .innerJoin(programmes, eq(programmes.id, shortlistItems.programmeId))
      .innerJoin(universities, eq(universities.id, programmes.universityId))
      .where(eq(shortlistItems.userId, user.id));
    return Response.json({
      shortlist: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        programme: { ...r.programme, university: { name: r.uniName, city: r.uniCity, type: r.uniType, hue: r.uniHue, logoUrl: r.uniLogoUrl } },
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await readJson<{ programmeId?: string }>(req);
    if (!body.programmeId) throw new HttpError(400, "programmeId required.");
    await db
      .insert(shortlistItems)
      .values({ userId: user.id, programmeId: body.programmeId })
      .onConflictDoNothing();
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const body = await readJson<{ programmeId?: string }>(req);
    if (!body.programmeId) throw new HttpError(400, "programmeId required.");
    await db
      .delete(shortlistItems)
      .where(and(eq(shortlistItems.userId, user.id), eq(shortlistItems.programmeId, body.programmeId)));
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
