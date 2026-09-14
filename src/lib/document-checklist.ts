import type { ApplicationTrack } from "@/db/schema";

export type DocumentSpec = {
  key: string;
  label: string;
  hint: string;
  required: boolean;
};

export const DOCUMENT_CHECKLISTS: Record<ApplicationTrack, DocumentSpec[]> = {
  regular: [
    { key: "national_id", label: "National ID or Passport", hint: "Certified copy", required: true },
    { key: "o_level_zimsec", label: "O-Level Results (ZIMSEC)", hint: "Certified copy", required: true },
    { key: "o_level_cambridge", label: "O-Level Results (Cambridge)", hint: "Certified copy - optional", required: false },
    { key: "a_level_zimsec", label: "A-Level Results (ZIMSEC)", hint: "Certified copy", required: true },
    { key: "a_level_cambridge", label: "A-Level Results (Cambridge)", hint: "Certified copy - optional", required: false },
    { key: "passport_photo", label: "Passport Photo", hint: "White background", required: true },
  ],
  special: [
    { key: "national_id", label: "National ID or Passport", hint: "Certified copy", required: true },
    { key: "national_diploma", label: "National Diploma", hint: "Certified copy", required: true },
    { key: "passport_photo", label: "Passport Photo", hint: "White background", required: true },
  ],
  graduate: [
    { key: "national_id", label: "National ID or Passport", hint: "Certified copy", required: true },
    { key: "degree_certificate", label: "Degree Certificate (2.1 or better)", hint: "Certified copy", required: true },
    { key: "passport_photo", label: "Passport Photo", hint: "White background", required: true },
  ],
};
