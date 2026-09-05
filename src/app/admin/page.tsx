import { db } from "@/db";
import { applicationItems, applications, payments, programmes, universities, users } from "@/db/schema";
import { Reveal } from "@/components/motion";
import { IconCap, IconChart, IconUsers, IconWallet } from "@/components/icons";
import { eq } from "drizzle-orm";

export const metadata = { title: "Admin reports" };

export default async function AdminHome() {
  const [students, apps, pays, items, unis, progs] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.role, "student")),
    db.select().from(applications),
    db.select().from(payments),
    db
      .select({ applicationId: applicationItems.applicationId, programmeId: applicationItems.programmeId, status: applicationItems.status })
      .from(applicationItems),
    db.select().from(universities),
    db.select({ id: programmes.id }).from(programmes),
  ]);

  const paid = pays.filter((p) => p.status === "paid");
  const revenue = paid.reduce((s, p) => s + p.amount, 0);

  const progUni = new Map<string, string>();
  const progRows = await db.select({ id: programmes.id, universityId: programmes.universityId }).from(programmes);
  progRows.forEach((p) => progUni.set(p.id, p.universityId));
  const uniCounts = new Map<string, number>();
  for (const i of items) {
    const uid = progUni.get(i.programmeId);
    if (uid) uniCounts.set(uid, (uniCounts.get(uid) ?? 0) + 1);
  }
  const perUniFinal = unis
    .map((u) => ({ name: u.name, hue: u.hue, count: uniCounts.get(u.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const statusBuckets = ["draft", "submitted", "under_review", "offer_received", "enrolled"].map((s) => ({
    status: s,
    count: items.filter((i) => i.status === s).length,
  }));

  const months: { key: string; label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    months.push({
      key,
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      total: paid.filter((p) => (p.paidAt ?? p.createdAt).toISOString().slice(0, 7) === key).reduce((s, p) => s + p.amount, 0),
    });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const maxUni = Math.max(1, ...perUniFinal.map((u) => u.count));

  const stats = [
    { icon: IconUsers, label: "Registered students", value: students.length },
    { icon: IconCap, label: "Application packages", value: apps.length },
    { icon: IconWallet, label: "Revenue (paid, USD)", value: revenue },
    { icon: IconChart, label: "Programme items in flight", value: items.length },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="font-display text-3xl font-black tracking-tight text-navy-900">Operations reports</h1>
        <p className="mt-1 text-sm text-ink-soft">Live figures across students, applications and Paynow revenue.</p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <div className="lift rounded-xl border border-navy-900/10 bg-white p-5">
              <s.icon className="h-6 w-6 text-navy-700" />
              <p className="mt-3 font-display text-3xl font-black text-navy-900">{s.value.toLocaleString()}</p>
              <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-xl border border-navy-900/10 bg-white p-6">
            <h2 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">Applications per university</h2>
            <ul className="mt-5 space-y-3">
              {perUniFinal.map((u) => (
                <li key={u.name}>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="truncate text-ink">{u.name}</span>
                    <span className="text-navy-800">{u.count}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-paper-dark">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(u.count / maxUni) * 100}%`, backgroundColor: `hsl(${u.hue} 62% 42%)` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="rounded-xl border border-navy-900/10 bg-white p-6">
            <h2 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">Paynow revenue · last 6 months (USD)</h2>
            <div className="mt-6 flex h-44 items-end gap-3">
              {months.map((m) => (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-display text-xs font-extrabold text-navy-900">{m.total || ""}</span>
                  <div className="flex w-full flex-1 items-end rounded-t-md bg-paper-dark">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-navy-800 to-navy-600 transition-all duration-700" style={{ height: `${(m.total / maxMonth) * 100}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-ink-soft uppercase">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="rounded-xl border border-navy-900/10 bg-white p-6">
          <h2 className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">Pipeline by status</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            {statusBuckets.map((b) => (
              <div key={b.status} className="rounded-lg bg-paper p-4 text-center">
                <p className="font-display text-2xl font-black text-navy-900">{b.count}</p>
                <p className="mt-1 text-[11px] font-extrabold tracking-wide text-ink-soft uppercase">{b.status.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
