import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ApplyWizard } from "@/components/apply-wizard/apply-wizard";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Start an application" };
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return (
    <div>
      <Reveal>
        <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Application workspace</p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900">Build your application</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Move through six short stages to prepare your documents, find a fit, and pay for one complete application package.
        </p>
      </Reveal>
      <div className="mt-8">
        <ApplyWizard userId={user.id} />
      </div>
    </div>
  );
}
