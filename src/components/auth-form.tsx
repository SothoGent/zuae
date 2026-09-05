"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrow } from "./icons";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please retry.");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20";

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft uppercase">Full name</span>
          <input className={field} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tariro Moyo" required />
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft uppercase">Email</span>
        <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft uppercase">Password</span>
        <input
          className={field}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "Minimum 8 characters" : "••••••••"}
          required
        />
      </label>
      {error && (
        <p className="rounded-lg border border-zim-red/30 bg-zim-red/10 px-4 py-2.5 text-sm font-semibold text-zim-red">{error}</p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-800 px-5 py-3 font-display text-sm font-extrabold tracking-wide text-white uppercase transition hover:bg-navy-700 disabled:opacity-60"
      >
        {busy ? "Please wait…" : mode === "signup" ? "Create my account" : "Sign in"}
        <IconArrow className="h-4 w-4" />
      </button>
      {mode === "login" && (
        <p className="text-center text-xs text-ink-soft">
          Demo accounts — student: <code className="font-semibold">student@zuae.demo / Student@2025</code> · staff:{" "}
          <code className="font-semibold">admin@zuae.co.zw / Admin@2025</code>
        </p>
      )}
    </form>
  );
}
