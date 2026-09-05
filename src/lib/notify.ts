import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function notify(
  userId: string,
  n: { title: string; body: string; kind?: "info" | "success" | "warning" | "deadline" },
): Promise<void> {
  await db.insert(notifications).values({
    userId,
    title: n.title,
    body: n.body,
    kind: n.kind ?? "info",
  });
}
