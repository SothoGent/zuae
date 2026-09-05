import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { FlagStripe, ZuaeCrest } from "@/components/brand";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col">
        <div className="dot-grid absolute inset-0" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <ZuaeCrest className="h-12 w-12" />
          <span className="font-display text-2xl font-black">ZUAE</span>
        </div>
        <div className="relative mt-auto">
          <h1 className="font-display text-4xl leading-tight font-black">
            Your dream university is <span className="text-gold-400">closer than you think</span>.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-navy-200">
            Create your free account to unlock AI career guidance, the Smart Eligibility Matcher, a private
            document vault and Paynow-secured applications.
          </p>
          <ol className="mt-8 space-y-2.5 text-sm text-navy-100">
            <li><strong className="text-gold-400">1.</strong> Profile & A-Level results</li>
            <li><strong className="text-gold-400">2.</strong> Match, shortlist & upload documents</li>
            <li><strong className="text-gold-400">3.</strong> Pay with Paynow — we submit & track</li>
          </ol>
        </div>
        <FlagStripe className="relative mt-12 h-1.5 w-full" />
      </aside>
      <section className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-md">
          <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Free forever for students</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-navy-900">Create your account</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-navy-700 hover:underline">
              Sign in instead
            </Link>
          </p>
          <div className="mt-8 rounded-2xl border border-navy-900/10 bg-white p-7 shadow-sm">
            <AuthForm mode="signup" />
          </div>
        </div>
      </section>
    </main>
  );
}
