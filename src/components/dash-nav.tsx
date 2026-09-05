"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCap, IconChart, IconCompass, IconDoc, IconUpload, IconUsers, IconWallet } from "./icons";

type DashLink = { href: string; label: string; icon: (p: { className?: string }) => React.ReactElement; exact?: boolean };

const STUDENT_LINKS: DashLink[] = [
  { href: "/dashboard", label: "Overview", icon: IconCap, exact: true },
  { href: "/dashboard/profile", label: "My profile & results", icon: IconUsers },
  { href: "/dashboard/documents", label: "Document vault", icon: IconUpload },
  { href: "/dashboard/matcher", label: "Course matcher & AI guidance", icon: IconCompass },
  { href: "/dashboard/apply", label: "Start an application", icon: IconDoc },
  { href: "/dashboard/applications", label: "Applications & payments", icon: IconWallet },
];

const ADMIN_LINK: DashLink = { href: "/admin", label: "Admin console", icon: IconChart };

export function DashNav({ role }: { role: string }) {
  const pathname = usePathname();
  const links = role === "admin" ? [...STUDENT_LINKS, ADMIN_LINK] : STUDENT_LINKS;
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 py-4 lg:flex-col lg:overflow-visible">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
              active ? "bg-gold-400 text-navy-950" : "text-navy-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <l.icon className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
