import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { MatcherApp } from "@/components/matcher-app";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Course matcher" };

export default async function MatcherPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  return (
    <div>
      <Reveal>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 2 · guidance & matching</p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900">Smart Eligibility Matcher</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Live screening against published entry requirements, fees and deadlines. Shortlist what you love,
          compare up to three side-by-side, then start an application package.
        </p>
      </Reveal>
      <div className="mt-8">
        <MatcherApp
          initialSubjects={profile?.subjects ?? []}
          initialInterests={profile?.interests ?? []}
          nationality={profile?.nationality ?? "Zimbabwean"}
          studyLevel={profile?.studyLevel ?? "undergraduate"}
          savedSuggestion={profile?.aiSuggestion ?? null}
        />
      </div>
    </div>
  );
}
