import { db } from "@/db";
import { documents } from "@/db/schema";
import { errorResponse, requireAdmin } from "@/lib/guard";
import { inArray } from "drizzle-orm";
import { Writable } from "stream";

// @ts-ignore archiver exposes a CommonJS callable export
const archiver = require("archiver");

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = (await req.json()) as { ids: string[] };

    if (!body.ids || body.ids.length === 0) {
      return Response.json({ error: "No document IDs provided." }, { status: 400 });
    }

    const docs = await db
      .select()
      .from(documents)
      .where(inArray(documents.id, body.ids));

    if (docs.length === 0) {
      return Response.json({ error: "No documents found." }, { status: 404 });
    }

    // Create a buffer to collect the zip data
    const buffers: Buffer[] = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        buffers.push(chunk);
        callback();
      },
    });

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(writable);

    // Add each document to the zip
    for (const doc of docs) {
      const data = doc.data as Buffer;
      archive.append(data, {
        name: `${doc.userId}_${doc.fileName}`,
      });
    }

    // Finalize the archive and wait for completion
    await new Promise<void>((resolve, reject) => {
      archive.on("finish", resolve);
      archive.on("error", reject);
      archive.finalize();
    });

    const zipBuffer = Buffer.concat(buffers);

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="zuae_documents.zip"`,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}