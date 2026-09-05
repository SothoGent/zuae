import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashNav } from "@/components/dash-nav";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";
import { ZuaeCrest } from "@/components/brand";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="border-b border-navy-900/10 bg-navy-950 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <ZuaeCrest className="h-9 w-9" />
          <div className="leading-none">
            <p className="font-display text-lg font-black">ZUAE</p>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-navy-200 uppercase">Student portal</p>
          </div>
        </div>
        <DashNav role={user.role} />
        <div className="hidden px-5 py-6 text-xs text-navy-200 lg:block">
          <p className="font-bold text-gold-400">Need help?</p>
          <p className="mt-1">+263 771 862 929</p>
          <p>info@zuae.co.zw</p>
          <Link href="/" className="mt-3 inline-block font-semibold text-navy-100 underline underline-offset-4 hover:text-gold-300">
            ← Back to public site
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-navy-900/10 bg-paper/90 px-4 backdrop-blur sm:px-8">
          <p className="font-display text-sm font-extrabold tracking-widest text-ink-soft uppercase">
            {user.role === "admin" ? "Staff account" : "My admission journey"}
          </p>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="hidden rounded-md bg-navy-100 px-3 py-1.5 text-xs font-bold text-navy-800 sm:block">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
