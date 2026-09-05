import { db } from "@/db";
import { profiles, users, type SubjectGrade } from "@/db/schema";
import { errorResponse, readJson, requireUser } from "@/lib/guard";
import { GRADE_POINTS } from "@/lib/grades";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireUser();
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    return Response.json({ email: user.email, role: user.role, profile: profile ?? null });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await readJson<Record<string, unknown>>(req);
    const allowed: Record<string, unknown> = {};
    const str = (k: string) => typeof body[k] === "string" ? (body[k] as string).slice(0, 160) : undefined;
    for (const k of ["fullName", "dob", "nationality", "phone", "altContact", "currentSchool"] as const) {
      const v = str(k);
      if (v !== undefined) allowed[k] = v;
    }
    if (typeof body.studyLevel === "string" && ["undergraduate", "diploma", "certificate"].includes(body.studyLevel)) {
      allowed.studyLevel = body.studyLevel;
    }
    if (Array.isArray(body.subjects)) {
      const subjects: SubjectGrade[] = (body.subjects as { subject?: string; grade?: string }[])
        .filter((s) => s && typeof s.subject === "string" && s.subject.trim())
        .slice(0, 8)
        .map((s) => ({
          subject: (s.subject as string).slice(0, 60),
          grade: GRADE_POINTS[(s.grade ?? "").toUpperCase()] ? (s.grade as string).toUpperCase() : "E",
        }));
      allowed.subjects = subjects;
    }
    if (Array.isArray(body.interests)) {
      allowed.interests = (body.interests as string[]).filter((i) => typeof i === "string").slice(0, 12);
    }
    allowed.updatedAt = new Date();
    const [profile] = await db
      .update(profiles)
      .set(allowed)
      .where(eq(profiles.userId, user.id))
      .returning();
    return Response.json({ profile });
  } catch (e) {
    return errorResponse(e);
  }
}
