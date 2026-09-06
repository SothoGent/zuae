import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SimpleApplyFlow } from "@/components/simple-apply-flow";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Start an application" };
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return (
    <div>
      <Reveal>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 3 · application & payment</p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900">Start an application package</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Bundle up to three universities into one package. Service fee from USD 100 (local) / USD 200
          (international, visa support included) plus university application fees at cost.
        </p>
      </Reveal>
      <div className="mt-8">
        <SimpleApplyFlow userId={user.id} />
      </div>
    </div>
  );
}
