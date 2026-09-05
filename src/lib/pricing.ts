export type PackageType = "basic" | "premium" | "international";

export const PACKAGES: Record<
  PackageType,
  { label: string; maxUnis: number; tagline: string; perks: string[] }
> = {
  basic: {
    label: "Basic",
    maxUnis: 1,
    tagline: "One university, fully handled",
    perks: [
      "Application to 1 university or polytechnic",
      "Document check & preparation",
      "Submission tracked by a ZUAE officer",
    ],
  },
  premium: {
    label: "Premium",
    maxUnis: 3,
    tagline: "Up to three universities in one package",
    perks: [
      "Applications to up to 3 institutions",
      "Priority document verification",
      "Dedicated admissions officer",
      "Interview & offer-letter guidance",
    ],
  },
  international: {
    label: "International",
    maxUnis: 3,
    tagline: "For students applying from abroad",
    perks: [
      "Up to 3 institutions + visa support letter",
      "Certified document handling",
      "Arrival, accommodation & registration briefing",
      "Dedicated international student officer",
    ],
  },
};

/**
 * Service fee schedule (per application package):
 *  - Local students: Basic USD 100 · Premium USD 100 + USD 25 per extra university
 *  - International students / International package: USD 200 (visa support included)
 * University application fees are added on top, per selected programme.
 */
export function serviceFeeFor(
  pkg: PackageType,
  isInternationalStudent: boolean,
  unis: number,
): number {
  if (pkg === "international") return 200;
  const base = isInternationalStudent ? 200 : 100;
  if (pkg === "premium") return base + 25 * Math.max(0, unis - 1);
  return base;
}
