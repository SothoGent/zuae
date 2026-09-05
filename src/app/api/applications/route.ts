import { db } from "@/db";
import {
  applicationItems,
  applications,
  payments,
  profiles,
  programmes,
  universities,
} from "@/db/schema";
import { errorResponse, HttpError, readJson, requireUser } from "@/lib/guard";
import { notify } from "@/lib/notify";
import { PACKAGES, serviceFeeFor, type PackageType } from "@/lib/pricing";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireUser();
    const apps = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, user.id))
      .orderBy(asc(applications.createdAt));
    const items = await db
      .select({
        id: applicationItems.id,
        applicationId: applicationItems.applicationId,
        status: applicationItems.status,
        updatedAt: applicationItems.updatedAt,
        programme: {
          id: programmes.id,
          title: programmes.title,
          faculty: programmes.faculty,
          level: programmes.level,
          deadline: programmes.deadline,
        },
        uniName: universities.name,
        uniCity: universities.city,
        uniHue: universities.hue,
        uniLogoUrl: universities.logoUrl,
      })
      .from(applicationItems)
      .innerJoin(programmes, eq(programmes.id, applicationItems.programmeId))
      .innerJoin(universities, eq(universities.id, programmes.universityId));
    const pays = await db.select().from(payments).where(eq(payments.userId, user.id));
    const mine = apps.filter((a) => a.userId === user.id);
    return Response.json({
      applications: mine.map((a) => ({
        ...a,
        items: items
          .filter((i) => i.applicationId === a.id)
          .map((i) => ({
            id: i.id,
            status: i.status,
            updatedAt: i.updatedAt,
            programme: { ...i.programme, university: { name: i.uniName, city: i.uniCity, hue: i.uniHue, logoUrl: i.uniLogoUrl } },
          })),
        payments: pays.filter((p) => p.applicationId === a.id),
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await readJson<{ programmeIds?: string[]; packageType?: PackageType }>(req);
    const ids = [...new Set(body.programmeIds ?? [])];
    const pkg = body.packageType ?? "basic";
    if (!PACKAGES[pkg]) throw new HttpError(400, "Unknown package.");
    if (ids.length === 0) throw new HttpError(400, "Select at least one programme.");
    if (ids.length > PACKAGES[pkg].maxUnis) {
      throw new HttpError(400, `The ${PACKAGES[pkg].label} package covers up to ${PACKAGES[pkg].maxUnis} universit${PACKAGES[pkg].maxUnis === 1 ? "y" : "ies"}.`);
    }
    const progs = await db.select().from(programmes).where(eq(programmes.active, true));
    const chosen = progs.filter((p) => ids.includes(p.id));
    if (chosen.length !== ids.length) throw new HttpError(404, "One or more programmes no longer exist.");

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    const isIntl = (profile?.nationality ?? "Zimbabwean").toLowerCase() !== "zimbabwean";
    const serviceFee = serviceFeeFor(pkg, isIntl, chosen.length);
    const universityFees = chosen.reduce((sum, p) => sum + p.appFee, 0);
    const total = serviceFee + universityFees;

    const [app] = await db
      .insert(applications)
      .values({
        userId: user.id,
        packageType: pkg,
        serviceFee,
        universityFees,
        totalAmount: total,
        paymentStatus: "unpaid",
        status: "draft",
      })
      .returning();
    await db.insert(applicationItems).values(chosen.map((p) => ({ applicationId: app.id, programmeId: p.id, status: "draft" as const })));
    await notify(user.id, {
      title: "Application package created",
      body: `${PACKAGES[pkg].label} package with ${chosen.length} programme${chosen.length > 1 ? "s" : ""} — ${total} USD payable via Paynow to submit.`,
      kind: "info",
    });
    return Response.json({ application: app });
  } catch (e) {
    return errorResponse(e);
  }
}
