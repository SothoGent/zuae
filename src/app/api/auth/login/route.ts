import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/guard";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await readJson<{ email?: string; password?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    const token = await createSession(user.id);
    await setSessionCookie(token);
    return Response.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    return errorResponse(e);
  }
}
