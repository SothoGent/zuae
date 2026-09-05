import { db } from "@/db";
import { notifications } from "@/db/schema";
import { errorResponse, readJson, requireUser } from "@/lib/guard";
import { desc, eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(40);
    return Response.json({ notifications: rows, unread: rows.filter((n) => !n.read).length });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await readJson<{ all?: boolean; ids?: string[] }>(req);
    if (body.all) {
      await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.id));
    } else if (Array.isArray(body.ids) && body.ids.length) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(inArray(notifications.id, body.ids.slice(0, 50)));
    }
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
