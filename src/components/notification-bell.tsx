"use client";

import { useEffect, useRef, useState } from "react";
import { timeAgo } from "@/lib/utils";
import { IconBell } from "./icons";

type N = { id: string; title: string; body: string; kind: string; read: boolean; createdAt: string };

const KIND_DOT: Record<string, string> = {
  info: "bg-navy-600",
  success: "bg-zim-green",
  warning: "bg-zim-red",
  deadline: "bg-gold-500",
};

export function NotificationBell() {
  const [items, setItems] = useState<N[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      /* offline */
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md border border-navy-900/15 p-2 text-navy-800 transition hover:bg-navy-50"
        aria-label={`Notifications (${unread} unread)`}
      >
        <IconBell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zim-red px-1 font-display text-[10px] font-extrabold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-xl border border-navy-900/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-navy-900/10 px-4 py-2.5">
            <span className="font-display text-sm font-extrabold text-navy-900">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-bold text-navy-700 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-soft">No notifications yet.</p>}
            {items.map((n) => (
              <div key={n.id} className={`flex gap-3 border-b border-navy-900/5 px-4 py-3 ${n.read ? "" : "bg-gold-400/10"}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KIND_DOT[n.kind] ?? "bg-navy-600"}`} />
                <div>
                  <p className="text-sm font-bold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{n.body}</p>
                  <p className="mt-1 text-[10px] font-semibold tracking-wide text-ink-soft/70 uppercase">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
