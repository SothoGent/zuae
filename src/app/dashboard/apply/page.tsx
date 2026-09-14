import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ApplyWizard } from "@/components/apply-wizard/apply-wizard";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Start an application" };
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  return (
    <div>
      <Reveal>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 3 · application & payment</p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900">Start an application package</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Choose your track, upload documents, select up to three universities, and let our matcher recommend your best programmes.
        </p>
      </Reveal>
      <div className="mt-8">
        <ApplyWizard nationality={profile?.nationality ?? "Zimbabwean"} />
      </div>
    </div>
  );
}
