import type { SubjectGrade } from "@/db/schema";
import { checkEligibility, normalizeSubject, type EligibilityResult } from "./grades";

export type MatchProgramme = {
  id: string;
  faculty: string;
  title: string;
  level: string;
  mode: string;
  durationMonths: number;
  feesLocal: number;
  feesInternational: number;
  appFee: number;
  deadline: string;
  location: string;
  intake: string;
  description: string | null;
  requirements: { minPoints: number; required: { subject: string; minGrade: string }[] };
  university: {
    id: string;
    name: string;
    type: string;
    category: string;
    city: string;
    province: string;
    hue: number;
    logoUrl: string | null;
  };
};

export type MatchCriteria = {
  subjects: SubjectGrade[];
  field: string; // career field or "not-sure"
  budgetMax: number | null;
  province: string; // "" = anywhere
  uniType: string; // "" | public | private
  level: string; // "" | undergraduate | diploma | certificate
  international: boolean;
};

export type MatchResult = {
  programme: MatchProgramme;
  eligibility: EligibilityResult;
  score: number;
};

const FIELD_KEYWORDS: Record<string, string[]> = {
  "Health & Medicine": ["health", "medicine", "nursing", "medical", "pharmacy", "physiology"],
  "Engineering & Built Environment": ["engineering", "civil", "mechanical", "electrical", "construction", "architecture", "mechatronic", "surveying"],
  "ICT & Computing": ["computer", "informatics", "software", "information", "data", "cyber", "network"],
  "Business & Commerce": ["business", "commerce", "accounting", "finance", "marketing", "management", "banking", "entrepreneur"],
  "Science & Technology": ["science", "biotechnology", "chemistry", "physics", "biological", "applied", "food", "forensic"],
  "Agriculture & Environment": ["agriculture", "agricultural", "horticulture", "wildlife", "environment", "animal", "land"],
  "Education & Humanities": ["education", "teaching", "arts", "humanities", "language", "literature", "history", "religion", "social"],
  "Law & Governance": ["law", "legal", "governance", "public", "politics", "administration"],
  "Creative & Media": ["media", "design", "creative", "film", "music", "journalism", "communication"],
};

export function fieldMatchesProgramme(field: string, p: MatchProgramme): boolean {
  const keywords = FIELD_KEYWORDS[field];
  if (!keywords) return true;
  const haystack = `${p.faculty} ${p.title} ${p.description ?? ""}`.toLowerCase();
  return keywords.some((k) => haystack.includes(k));
}

export function matchProgrammes(all: MatchProgramme[], c: MatchCriteria): MatchResult[] {
  const results: MatchResult[] = [];
  for (const p of all) {
    const eligibility = checkEligibility(p.requirements, c.subjects);
    const fee = c.international ? p.feesInternational : p.feesLocal;
    if (c.budgetMax !== null && fee > c.budgetMax) continue;
    if (c.province && p.university.province !== c.province) continue;
    if (c.uniType && p.university.type !== c.uniType) continue;
    if (c.level && p.level !== c.level) continue;
    if (c.field && c.field !== "not-sure" && !fieldMatchesProgramme(c.field, p)) continue;

    let score = eligibility.points * 10;
    if (eligibility.eligible) score += 500;
    score -= Math.max(0, fee - (c.budgetMax ?? fee)) / 100;
    if (c.field && c.field !== "not-sure" && fieldMatchesProgramme(c.field, p)) score += 120;
    // normalise subject overlap bonus
    const reqNames = (p.requirements.required ?? []).map((r) => normalizeSubject(r.subject));
    const haveNames = c.subjects.map((s) => normalizeSubject(s.subject));
    score += reqNames.filter((n) => haveNames.includes(n)).length * 25;

    results.push({ programme: p, eligibility, score });
  }
  return results.sort((a, b) => b.score - a.score);
}

export const PROVINCES = [
  "Harare",
  "Bulawayo",
  "Manicaland",
  "Mashonaland Central",
  "Mashonaland East",
  "Mashonaland West",
  "Midlands",
  "Masvingo",
  "Matabeleland North",
  "Matabeleland South",
];

export const CAREER_FIELDS = Object.keys(FIELD_KEYWORDS);
