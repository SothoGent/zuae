import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/profile-form";
import { Reveal } from "@/components/motion";

export const metadata = { title: "My profile" };

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 1 of the journey</p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900">My profile & results</h1>
        <p className="mt-2 text-sm text-ink-soft">
          These details drive eligibility screening, fee quoting (local vs international) and AI guidance.
        </p>
      </Reveal>
      <div className="mt-8">
        <ProfileForm initial={profile} />
      </div>
    </div>
  );
}
