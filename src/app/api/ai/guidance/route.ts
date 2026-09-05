import { db } from "@/db";
import { aiSessions, profiles } from "@/db/schema";
import { generateGuidance, type GuidanceAnswers } from "@/lib/ai";
import { errorResponse, readJson, requireUser } from "@/lib/guard";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await readJson<Partial<GuidanceAnswers>>(req);
    const answers: GuidanceAnswers = {
      interests: Array.isArray(body.interests) ? body.interests.slice(0, 10) : [],
      strengths: Array.isArray(body.strengths) ? body.strengths.slice(0, 8) : [],
      workStyle: typeof body.workStyle === "string" ? body.workStyle : "",
      budget: typeof body.budget === "string" ? body.budget : "",
      notes: typeof body.notes === "string" ? body.notes.slice(0, 600) : "",
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
    };
    const result = await generateGuidance(answers);
    await db.insert(aiSessions).values({ userId: user.id, answers, result });
    await db.update(profiles).set({ aiSuggestion: result, updatedAt: new Date() }).where(eq(profiles.userId, user.id));
    return Response.json({ result });
  } catch (e) {
    return errorResponse(e);
  }
}
