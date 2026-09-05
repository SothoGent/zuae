"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrow } from "./icons";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={signOut}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-md border border-navy-900/15 px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-zim-red/40 hover:text-zim-red disabled:opacity-50 ${className}`}
    >
      {loading ? "Signing out..." : "Sign out"}
      <IconArrow className="h-4 w-4" />
    </button>
  );
}
