import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

try {
  const result = await db.execute(sql`SELECT 1`);
  console.log("✅ Connection successful:", result);
} catch (e) {
  console.error("❌ Connection failed:", e.message);
}