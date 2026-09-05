import { db } from "@/db";
import { programmes, universities, type Requirements } from "@/db/schema";
import { errorResponse, HttpError, readJson, requireAdmin } from "@/lib/guard";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
    const [progs, unis] = await Promise.all([
      db.select().from(programmes).orderBy(asc(programmes.title)),
      db.select().from(universities).orderBy(asc(universities.name)),
    ]);
    return Response.json({ programmes: progs, universities: unis });
  } catch (e) {
    return errorResponse(e);
  }
}

type Body = {
  id?: string;
  universityId?: string;
  faculty?: string;
  title?: string;
  level?: string;
  mode?: string;
  durationMonths?: number;
  feesLocal?: number;
  feesInternational?: number;
  appFee?: number;
  deadline?: string;
  location?: string;
  intake?: string;
  description?: string;
  requirements?: Requirements;
  active?: boolean;
  sourceUrl?: string;
};

function clean(body: Body): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const str = (k: keyof Body) => (typeof body[k] === "string" ? (body[k] as string) : undefined);
  const num = (k: keyof Body) => (typeof body[k] === "number" ? (body[k] as number) : undefined);
  for (const k of ["universityId", "faculty", "title", "location", "intake", "description", "sourceUrl", "deadline"] as const) {
    const v = str(k);
    if (v !== undefined) out[k] = v;
  }
  for (const k of ["durationMonths", "feesLocal", "feesInternational", "appFee"] as const) {
    const v = num(k);
    if (v !== undefined) out[k] = v;
  }
  if (str("level")) out.level = str("level");
  if (str("mode")) out.mode = str("mode");
  if (typeof body.active === "boolean") out.active = body.active;
  if (body.requirements && typeof body.requirements.minPoints === "number") out.requirements = body.requirements;
  return out;
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await readJson<Body>(req);
    if (!body.universityId || !body.title || !body.faculty) throw new HttpError(400, "University, faculty and title are required.");
    const [row] = await db.insert(programmes).values(clean(body) as typeof programmes.$inferInsert).returning();
    return Response.json({ programme: row });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await readJson<Body>(req);
    if (!body.id) throw new HttpError(400, "id required.");
    const { id, ...rest } = body;
    const [row] = await db.update(programmes).set(clean(rest)).where(eq(programmes.id, id)).returning();
    if (!row) throw new HttpError(404, "Programme not found.");
    return Response.json({ programme: row });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const body = await readJson<{ id?: string }>(req);
    if (!body.id) throw new HttpError(400, "id required.");
    await db.delete(programmes).where(eq(programmes.id, body.id));
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
