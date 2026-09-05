import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminTabs } from "@/components/admin-tabs";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";
import { ZuaeCrest } from "@/components/brand";
import { FlagStripe } from "@/components/brand";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-navy-900/10 bg-navy-950 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <ZuaeCrest className="h-9 w-9" />
            <span className="leading-none">
              <span className="block font-display text-lg font-black">ZUAE Admin</span>
              <span className="block text-[10px] font-semibold tracking-[0.16em] text-navy-200 uppercase">Operations console</span>
            </span>
          </Link>
          <nav className="ml-6 hidden md:block">
            <AdminTabs />
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <span className="hidden rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold sm:block">{user.email}</span>
            <SignOutButton className="border-white/20 text-white hover:border-gold-400/60 hover:text-gold-300" />
          </div>
        </div>
        <div className="md:hidden">
          <AdminTabs />
        </div>
        <FlagStripe className="h-1 w-full" />
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
