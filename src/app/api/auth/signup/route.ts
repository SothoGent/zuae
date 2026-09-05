import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/guard";
import { notify } from "@/lib/notify";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await readJson<{ email?: string; password?: string; fullName?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const fullName = (body.fullName ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (fullName.length < 3) {
      return Response.json({ error: "Enter your full name." }, { status: 400 });
    }
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash: await hashPassword(password), role: "student" })
      .returning({ id: users.id, email: users.email, role: users.role });
    await db.insert(profiles).values({ userId: user.id, fullName });
    const token = await createSession(user.id);
    await setSessionCookie(token);
    await notify(user.id, {
      title: "Karikoga! Welcome to ZUAE",
      body: "Your student account is live. Complete your profile and upload documents to unlock the Course Matcher and applications.",
      kind: "success",
    });
    return Response.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    return errorResponse(e);
  }
}
