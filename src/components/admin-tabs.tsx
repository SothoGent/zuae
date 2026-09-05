"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChart, IconDoc, IconCap, IconUsers } from "./icons";

const TABS = [
  { href: "/admin", label: "Reports", icon: IconChart, exact: true },
  { href: "/admin/students", label: "Students", icon: IconUsers },
  { href: "/admin/programmes", label: "Programmes", icon: IconCap },
  { href: "/admin/applications", label: "Applications", icon: IconDoc },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 overflow-x-auto px-2 py-2 md:px-0 md:py-0">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-bold transition md:my-2 ${
              active ? "bg-gold-400 text-navy-950" : "text-navy-100 hover:bg-white/10"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
