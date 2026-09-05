import { db } from "@/db";
import { programmes, universities, type Requirements } from "@/db/schema";
import { errorResponse, HttpError, readJson, requireAdmin } from "@/lib/guard";
import { eq } from "drizzle-orm";

/** minimal RFC-4180-ish CSV parser */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const EXPECTED = [
  "university",
  "type",
  "city",
  "province",
  "faculty",
  "title",
  "level",
  "mode",
  "duration_months",
  "fees_local",
  "fees_international",
  "app_fee",
  "deadline",
  "min_points",
  "required_subjects",
  "description",
];

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await readJson<{ csv?: string }>(req);
    if (!body.csv || !body.csv.trim()) throw new HttpError(400, "Empty CSV payload.");
    const rows = parseCsv(body.csv);
    if (rows.length < 2) throw new HttpError(400, "CSV needs a header row and at least one record.");
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name);
    for (const need of ["university", "title", "faculty"]) {
      if (idx(need) === -1) throw new HttpError(400, `Missing required column “${need}”. Expected: ${EXPECTED.join(", ")}`);
    }
    let created = 0;
    const errors: string[] = [];
    for (let r = 1; r < rows.length; r++) {
      const get = (name: string) => {
        const i = idx(name);
        return i === -1 ? "" : (rows[r][i] ?? "").trim();
      };
      try {
        const uniName = get("university");
        let [uni] = await db.select().from(universities).where(eq(universities.name, uniName)).limit(1);
        if (!uni) {
          [uni] = await db
            .insert(universities)
            .values({
              name: uniName,
              type: get("type") === "private" ? "private" : "public",
              category: /poly/i.test(uniName) ? "polytechnic" : /institute|tech/i.test(uniName) ? "institute" : "university",
              city: get("city") || "Harare",
              province: get("province") || get("city") || "Harare",
              hue: Math.floor(Math.random() * 360),
            })
            .returning();
        }
        const required = get("required_subjects")
          .split(";")
          .filter(Boolean)
          .map((pair) => {
            const [subject, minGrade] = pair.split(":");
            return { subject: (subject ?? "").trim(), minGrade: (minGrade ?? "C").trim().toUpperCase() };
          })
          .filter((x) => x.subject);
        const requirements: Requirements = {
          minPoints: Number(get("min_points") || 8),
          required,
        };
        await db.insert(programmes).values({
          universityId: uni.id,
          faculty: get("faculty"),
          title: get("title"),
          level: (["undergraduate", "diploma", "certificate"].includes(get("level")) ? get("level") : "undergraduate") as "undergraduate",
          mode: (["full-time", "part-time", "block"].includes(get("mode")) ? get("mode") : "full-time") as "full-time",
          durationMonths: Number(get("duration_months") || 48),
          feesLocal: Number(get("fees_local") || 0),
          feesInternational: Number(get("fees_international") || 0),
          appFee: Number(get("app_fee") || 30),
          deadline: /^\d{4}-\d{2}-\d{2}$/.test(get("deadline")) ? get("deadline") : new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10),
          location: get("city") || uni.city,
          description: get("description") || null,
          requirements,
          sourceUrl: "csv-import",
        });
        created++;
      } catch (e) {
        errors.push(`Row ${r + 1}: ${e instanceof Error ? e.message : "invalid row"}`);
      }
    }
    return Response.json({ created, errors: errors.slice(0, 10) });
  } catch (e) {
    return errorResponse(e);
  }
}
