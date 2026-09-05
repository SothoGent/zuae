import { db } from "@/db";
import { documents } from "@/db/schema";
import { requireAdmin } from "@/lib/guard";
import { eq, inArray } from "drizzle-orm";
import archiver from "archiver";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json() as { ids: string[] };
    
    const docs = await db.select()
      .from(documents)
      .where(inArray(documents.id, body.ids));

    // Create zip
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = new ReadableStream({
      start(controller) {
        docs.forEach((doc) => {
          const data = doc.data as Buffer;
          archive.append(data, { name: `${doc.userId}_${doc.fileName}` });
        });
        archive.finalize();
        archive.pipe(controller as any);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="zuae_documents.zip"',
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}