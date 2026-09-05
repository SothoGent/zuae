import { db } from "@/db";
import { documents } from "@/db/schema";
import { errorResponse, HttpError, requireUser } from "@/lib/guard";
import { notify } from "@/lib/notify";
import { and, eq } from "drizzle-orm";

export const DOCUMENT_TYPES = ["national_id", "certificates", "passport_photo", "consent"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 8 * 1024 * 1024;

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select({
        id: documents.id,
        type: documents.type,
        fileName: documents.fileName,
        mimeType: documents.mimeType,
        size: documents.size,
        status: documents.status,
        note: documents.note,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(eq(documents.userId, user.id))
      .orderBy(documents.createdAt);
    return Response.json({ documents: rows });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    const type = String(form.get("type") ?? "");
    if (!(file instanceof File)) throw new HttpError(400, "No file provided.");
    if (!DOCUMENT_TYPES.includes(type as DocumentType)) throw new HttpError(400, "Unknown document type.");
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new HttpError(415, "Only PDF, JPEG or PNG files are accepted.");
    }
    if (file.size > MAX_BYTES) throw new HttpError(413, "File exceeds the 8 MB limit.");
    if (file.size === 0) throw new HttpError(400, "File is empty.");

    const data = Buffer.from(await file.arrayBuffer());
    const [row] = await db
      .insert(documents)
      .values({
        userId: user.id,
        type: type as DocumentType,
        fileName: file.name.slice(0, 180),
        mimeType: file.type,
        size: file.size,
        data,
        status: "pending",
      })
      .onConflictDoUpdate({
        target: [documents.userId, documents.type, documents.fileName],
        set: { mimeType: file.type, size: file.size, data, status: "pending", note: null, createdAt: new Date() },
      })
      .returning({ id: documents.id, type: documents.type, fileName: documents.fileName, status: documents.status, size: documents.size });
    await notify(user.id, {
      title: "Document uploaded",
      body: `“${row.fileName}” was stored in your private folder and is queued for verification by a ZUAE officer.`,
      kind: "info",
    });
    return Response.json({ document: row });
  } catch (e) {
    return errorResponse(e);
  }
}
