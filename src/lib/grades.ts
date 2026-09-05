import type { Requirements, SubjectGrade } from "@/db/schema";

/** ZIMSEC A-Level grade points used by ZUAE eligibility screening. */
export const GRADE_POINTS: Record<string, number> = { A: 6, B: 5, C: 4, D: 3, E: 2 };
/** lower rank = better grade */
export const GRADE_RANK: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };

const ALIASES: Record<string, string> = {
  math: "Mathematics",
  maths: "Mathematics",
  mathematics: "Mathematics",
  puremath: "Mathematics",
  biology: "Biology",
  bio: "Biology",
  chemistry: "Chemistry",
  chem: "Chemistry",
  physics: "Physics",
  phys: "Physics",
  geography: "Geography",
  geo: "Geography",
  history: "History",
  literature: "Literature in English",
  literatureinenglish: "Literature in English",
  english: "English",
  economics: "Economics",
  econ: "Economics",
  businessstudies: "Business Studies",
  business: "Business Studies",
  commerce: "Business Studies",
  accounting: "Accounting",
  accountancy: "Accounting",
  computerscience: "Computer Science",
  computing: "Computer Science",
  ict: "Computer Science",
  agriculture: "Agriculture",
  agri: "Agriculture",
  art: "Art & Design",
  divinity: "Divinity",
  geographyandenvironment: "Geography",
  sports: "Sport Science",
  foodscience: "Food Science",
  nutrition: "Food Science",
};

export function normalizeSubject(raw: string): string {
  const key = raw.toLowerCase().replace(/[^a-z]/g, "");
  return ALIASES[key] ?? raw.trim();
}

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Geography",
  "History",
  "Literature in English",
  "English",
  "Economics",
  "Business Studies",
  "Accounting",
  "Computer Science",
  "Agriculture",
  "Art & Design",
  "Divinity",
  "Food Science",
  "Sport Science",
];

export function gradePoints(grade: string): number {
  return GRADE_POINTS[grade.toUpperCase()] ?? 0;
}

/** best-three-subject A-Level point total */
export function computePoints(subjects: SubjectGrade[]): number {
  return subjects
    .map((s) => gradePoints(s.grade))
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((a, b) => a + b, 0);
}

export type EligibilityResult = {
  eligible: boolean;
  points: number;
  reasons: string[];
};

export function checkEligibility(req: Requirements, subjects: SubjectGrade[]): EligibilityResult {
  const reasons: string[] = [];
  const points = computePoints(subjects);
  const norm = subjects.map((s) => ({ ...s, subject: normalizeSubject(s.subject) }));

  if (points < req.minPoints) {
    reasons.push(`Needs ${req.minPoints} points (best 3), you have ${points}`);
  }
  for (const r of req.required ?? []) {
    const have = norm.find((s) => s.subject === normalizeSubject(r.subject));
    if (!have) {
      reasons.push(`Requires ${r.subject} at ${r.minGrade} or better — subject not offered`);
    } else if ((GRADE_RANK[have.grade.toUpperCase()] ?? 9) > (GRADE_RANK[r.minGrade.toUpperCase()] ?? 0)) {
      reasons.push(`Requires ${r.subject} at ${r.minGrade} or better — you have ${have.grade}`);
    }
  }
  return { eligible: reasons.length === 0, points, reasons };
}

export const STATUS_LABEL: Record<string, string> = {
  draft: "Awaiting payment",
  submitted: "Submitted to ZUAE",
  under_review: "Under review",
  offer_received: "Offer received",
  enrolled: "Enrolled",
};

export const STATUS_TONE: Record<string, string> = {
  draft: "bg-stone-200 text-stone-700",
  submitted: "bg-sky-100 text-sky-800",
  under_review: "bg-amber-100 text-amber-800",
  offer_received: "bg-emerald-100 text-emerald-800",
  enrolled: "bg-green-600 text-white",
};
