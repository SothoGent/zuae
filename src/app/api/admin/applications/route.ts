import { db } from "@/db";
import {
  applicationItems,
  applications,
  payments,
  profiles,
  programmes,
  universities,
  users,
} from "@/db/schema";
import { errorResponse, HttpError, readJson, requireAdmin } from "@/lib/guard";
import { notify } from "@/lib/notify";
import { desc, eq } from "drizzle-orm";

const STATUSES = ["draft", "submitted", "under_review", "offer_received", "enrolled"] as const;

export async function GET() {
  try {
    await requireAdmin();
    const apps = await db
      .select({
        id: applications.id,
        userId: applications.userId,
        packageType: applications.packageType,
        serviceFee: applications.serviceFee,
        universityFees: applications.universityFees,
        totalAmount: applications.totalAmount,
        paymentStatus: applications.paymentStatus,
        paymentRef: applications.paymentRef,
        status: applications.status,
        createdAt: applications.createdAt,
        studentEmail: users.email,
        studentName: profiles.fullName,
        nationality: profiles.nationality,
      })
      .from(applications)
      .innerJoin(users, eq(users.id, applications.userId))
      .leftJoin(profiles, eq(profiles.userId, applications.userId))
      .orderBy(desc(applications.createdAt));
    const items = await db
      .select({
        id: applicationItems.id,
        applicationId: applicationItems.applicationId,
        status: applicationItems.status,
        internalNotes: applicationItems.internalNotes,
        updatedAt: applicationItems.updatedAt,
        programmeTitle: programmes.title,
        programmeFaculty: programmes.faculty,
        programmeId: programmes.id,
        universityName: universities.name,
        universityId: universities.id,
      })
      .from(applicationItems)
      .innerJoin(programmes, eq(programmes.id, applicationItems.programmeId))
      .innerJoin(universities, eq(universities.id, programmes.universityId));
    const pays = await db.select().from(payments);
    return Response.json({
      applications: apps.map((a) => ({
        ...a,
        items: items.filter((i) => i.applicationId === a.id),
        payments: pays.filter((p) => p.applicationId === a.id),
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await readJson<{
      itemId?: string;
      applicationId?: string;
      status?: string;
      internalNotes?: string;
    }>(req);

    if (body.itemId) {
      if (!body.status || !STATUSES.includes(body.status as (typeof STATUSES)[number])) {
        throw new HttpError(400, "Invalid status.");
      }
      const [item] = await db
        .update(applicationItems)
        .set({
          status: body.status as (typeof STATUSES)[number],
          internalNotes: body.internalNotes !== undefined ? body.internalNotes : undefined,
          updatedAt: new Date(),
        })
        .where(eq(applicationItems.id, body.itemId))
        .returning();
      if (!item) throw new HttpError(404, "Application item not found.");
      const [app] = await db.select().from(applications).where(eq(applications.id, item.applicationId)).limit(1);
      const [prog] = await db.select({ title: programmes.title }).from(programmes).where(eq(programmes.id, item.programmeId)).limit(1);
      if (app) {
        await db.update(applications).set({ status: body.status as (typeof STATUSES)[number], updatedAt: new Date() }).where(eq(applications.id, app.id));
        await notify(app.userId, {
          title: "Application status updated",
          body: `${prog?.title ?? "Your programme"} is now “${body.status.replace(/_/g, " ")}”. Your ZUAE officer will contact you with next steps.`,
          kind: body.status === "offer_received" || body.status === "enrolled" ? "success" : "info",
        });
      }
      return Response.json({ ok: true, item });
    }

    if (body.applicationId && body.status && STATUSES.includes(body.status as (typeof STATUSES)[number])) {
      await db
        .update(applications)
        .set({ status: body.status as (typeof STATUSES)[number], updatedAt: new Date() })
        .where(eq(applications.id, body.applicationId));
      return Response.json({ ok: true });
    }
    throw new HttpError(400, "Provide itemId or applicationId with a valid status.");
  } catch (e) {
    return errorResponse(e);
  }
}
