import { db } from "@/db";
import { applications, payments, profiles, users } from "@/db/schema";
import { errorResponse, HttpError, readJson, requireAdmin } from "@/lib/guard";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
    const [studentRows, profileRows, appRows, payRows] = await Promise.all([
      db.select({ id: users.id, email: users.email, role: users.role, createdAt: users.createdAt }).from(users).where(eq(users.role, "student")),
      db.select().from(profiles),
      db.select({ userId: applications.userId, id: applications.id, status: applications.status }).from(applications),
      db.select({ userId: payments.userId, amount: payments.amount, status: payments.status }).from(payments),
    ]);
    const students = studentRows.map((s) => {
      const profile = profileRows.find((p) => p.userId === s.id) ?? null;
      const apps = appRows.filter((a) => a.userId === s.id);
      const revenue = payRows.filter((p) => p.userId === s.id && p.status === "paid").reduce((x, p) => x + p.amount, 0);
      return { ...s, profile, applicationCount: apps.length, revenue };
    });
    return Response.json({ students });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await readJson<Record<string, unknown>>(req);
    const userId = typeof body.userId === "string" ? body.userId : null;
    if (!userId) throw new HttpError(400, "userId required.");
    if (typeof body.role === "string" && ["student", "admin"].includes(body.role)) {
      await db.update(users).set({ role: body.role as "student" | "admin" }).where(eq(users.id, userId));
    }
    const patch: Record<string, unknown> = {};
    for (const k of ["fullName", "dob", "nationality", "phone", "altContact", "currentSchool"] as const) {
      if (typeof body[k] === "string") patch[k] = body[k];
    }
    if (typeof body.studyLevel === "string") patch.studyLevel = body.studyLevel;
    if (Array.isArray(body.subjects)) patch.subjects = body.subjects;
    if (Object.keys(patch).length) {
      patch.updatedAt = new Date();
      await db.update(profiles).set(patch).where(eq(profiles.userId, userId));
    }
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const body = await readJson<{ userId?: string }>(req);
    if (!body.userId) throw new HttpError(400, "userId required.");
    await db.delete(users).where(eq(users.id, body.userId));
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
