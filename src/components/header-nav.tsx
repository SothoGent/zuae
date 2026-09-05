"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { ZuaeCrest } from "./brand";
import { NotificationBell } from "./notification-bell";
import { IconArrow } from "./icons";

const LINKS = [
  { href: "/programmes", label: "Programmes" },
  { href: "/services", label: "Services & Fees" },
  { href: "/about", label: "About Us" },
  { href: "/terms", label: "Terms" },
];

export function HeaderNav({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dashHref = user?.role === "admin" ? "/admin" : "/dashboard";

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <ZuaeCrest className="h-10 w-10" />
          <span className="leading-none">
            <span className="block font-display text-xl font-black tracking-tight text-navy-900">ZUAE</span>
            <span className="block text-[10px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
              University Admissions & Enrolment
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                pathname === l.href ? "bg-navy-100 text-navy-800" : "text-ink-soft hover:bg-navy-50 hover:text-navy-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          {user && <NotificationBell />}
          {user ? (
            <>
              <Link
                href={dashHref}
                className="hidden items-center gap-2 rounded-md bg-navy-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-700 sm:inline-flex"
              >
                {user.role === "admin" ? "Admin console" : "My dashboard"}
                <IconArrow className="h-4 w-4" />
              </Link>
              <button
                onClick={signOut}
                className="rounded-md border border-navy-900/15 px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-zim-red/40 hover:text-zim-red"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-md px-3 py-2 text-sm font-bold text-navy-800 transition hover:bg-navy-50 sm:block">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-md bg-gold-400 px-4 py-2 text-sm font-extrabold text-navy-950 shadow-[0_6px_18px_-8px_rgba(247,198,0,0.9)] transition hover:bg-gold-300"
              >
                Apply now
                <IconArrow className="h-4 w-4" />
              </Link>
            </>
          )}
          <button
            className="rounded-md border border-navy-900/15 p-2 text-navy-800 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-navy-900/10 bg-paper px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-navy-50">
              {l.label}
            </Link>
          ))}
          {user && (
            <Link href={dashHref} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-bold text-navy-800 hover:bg-navy-50">
              {user.role === "admin" ? "Admin console" : "My dashboard"}
            </Link>
          )}
          {!user && (
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-bold text-navy-800 hover:bg-navy-50">
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
