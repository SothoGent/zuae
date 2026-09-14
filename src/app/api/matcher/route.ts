import { db } from "@/db";
import { programmes, universities } from "@/db/schema";
import { errorResponse, readJson } from "@/lib/guard";
import { matchProgrammes, type MatchCriteria } from "@/lib/matcher";
import { eq } from "drizzle-orm";

type MatcherRequest = Partial<MatchCriteria> & {
  track?: "regular" | "special" | "graduate";
  universityIds?: string[];
  useSpecialEntry?: boolean;
};

export async function POST(req: Request) {
  try {
    const body = await readJson<MatcherRequest>(req);
    let rows = await db
      .select({
        id: programmes.id,
        faculty: programmes.faculty,
        title: programmes.title,
        level: programmes.level,
        mode: programmes.mode,
        durationMonths: programmes.durationMonths,
        feesLocal: programmes.feesLocal,
        feesInternational: programmes.feesInternational,
        appFee: programmes.appFee,
        deadline: programmes.deadline,
        location: programmes.location,
        intake: programmes.intake,
        description: programmes.description,
        requirements: programmes.requirements,
        university: {
          id: universities.id,
          name: universities.name,
          type: universities.type,
          category: universities.category,
          city: universities.city,
          province: universities.province,
          hue: universities.hue,
          logoUrl: universities.logoUrl,
        },
      })
      .from(programmes)
      .innerJoin(universities, eq(universities.id, programmes.universityId))
      .where(eq(programmes.active, true));

    if (body.universityIds?.length) {
      rows = rows.filter((row) => body.universityIds!.includes(row.university.id));
    }
    if (body.track === "graduate") {
      rows = rows.filter((row) => (row.level as string) === "postgraduate");
    }
    if (body.track === "regular") {
      rows = rows.filter((row) => row.level === "undergraduate");
    }

    const criteria: MatchCriteria = {
      subjects: body.useSpecialEntry ? [] : Array.isArray(body.subjects) ? body.subjects : [],
      qualifications: Array.isArray(body.qualifications) ? body.qualifications : [],
      field: body.field ?? "not-sure",
      budgetMax: typeof body.budgetMax === "number" ? body.budgetMax : null,
      province: body.province ?? "",
      uniType: body.uniType ?? "",
      level: body.level ?? "",
      international: Boolean(body.international),
    };
    const results = matchProgrammes(rows, criteria);
    return Response.json({
      total: results.length,
      eligible: results.filter((r) => r.eligibility.eligible).length,
      results: results.slice(0, 40),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
