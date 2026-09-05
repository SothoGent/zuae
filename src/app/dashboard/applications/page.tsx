import { db } from "@/db";
import { applicationItems, applications, payments, programmes, universities } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ApplicationsClient, type AppRow } from "@/components/applications-client";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Applications & payments" };

export default async function ApplicationsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const apps = await db.select().from(applications).where(eq(applications.userId, user.id)).orderBy(desc(applications.createdAt));
  const items = await db
    .select({
      id: applicationItems.id,
      applicationId: applicationItems.applicationId,
      status: applicationItems.status,
      updatedAt: applicationItems.updatedAt,
      programme: {
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

  const rows: AppRow[] = apps.map((a) => ({
    id: a.id,
    packageType: a.packageType,
    serviceFee: a.serviceFee,
    universityFees: a.universityFees,
    totalAmount: a.totalAmount,
    paymentStatus: a.paymentStatus,
    paymentRef: a.paymentRef,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    items: items
      .filter((i) => i.applicationId === a.id)
      .map((i) => ({
        id: i.id,
        status: i.status,
        updatedAt: i.updatedAt.toISOString(),
        programme: { ...i.programme, deadline: i.programme.deadline, university: { name: i.uniName, city: i.uniCity, hue: i.uniHue, logoUrl: i.uniLogoUrl } },
      })),
    payments: pays
      .filter((p) => p.applicationId === a.id)
      .map((p) => ({
        id: p.id,
        reference: p.reference,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        paidAt: p.paidAt ? p.paidAt.toISOString() : null,
      })),
  }));

  return (
    <div>
      <Reveal>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Steps 4–5 · tracking & enrolment</p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900">Applications & payments</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Live status from our officers and the registries: documents verified → submitted → under review →
          offer → enrolled. Pay any outstanding package right here.
        </p>
      </Reveal>
      <div className="mt-8">
        <ApplicationsClient applications={rows} />
      </div>
    </div>
  );
}
