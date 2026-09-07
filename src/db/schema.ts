import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  customType,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** node-postgres maps Buffer <-> bytea natively */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Buffer) {
    return value;
  },
  fromDriver(value: Buffer) {
    return value;
  },
});

/* ---------- shared jsonb shapes ---------- */
export type SubjectGrade = { subject: string; grade: string };
export type SubjectRequirement = { subject: string; minGrade: string };
export type Requirement = SubjectRequirement;
export type Qualification = {
  type: string;
  name: string;
  institution: string;
  year: string;
  grade: string;
};
export type AlternativeEntry = {
  qualification: string;
  grade: string;
  field: string;
};
export type Requirements = {
  minPoints: number;
  required: SubjectRequirement[];
  alternativeEntries?: AlternativeEntry[];
};
export type VerificationDoc = { name: string; url?: string; verifiedAt?: string };
export type AiCareer = { title: string; field: string; why: string };
export type AiSuggestion = {
  summary: string;
  careers: AiCareer[];
  fields: string[];
  model: string;
  createdAt: string;
};

/* ---------- auth ---------- */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  dob: date("dob"),
  nationality: text("nationality").notNull().default("Zimbabwean"),
  phone: text("phone"),
  altContact: text("alt_contact"),
  currentSchool: text("current_school"),
  studyLevel: text("study_level", {
    enum: ["undergraduate", "diploma", "certificate"],
  })
    .notNull()
    .default("undergraduate"),
  subjects: jsonb("subjects").$type<SubjectGrade[]>().notNull().default([]),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),
  qualifications: jsonb("qualifications").$type<Qualification[]>().default([]),
  aiSuggestion: jsonb("ai_suggestion").$type<AiSuggestion | null>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- documents (Supabase-Storage-style private per-user blobs) ---------- */
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["national_id", "certificates", "passport_photo", "consent"],
    }).notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    data: bytea("data").notNull(),
    status: text("status", { enum: ["pending", "verified", "rejected"] })
      .notNull()
      .default("pending"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("documents_user_type_file_idx").on(t.userId, t.type, t.fileName)],
);

/* ---------- catalogue ---------- */
export const universities = pgTable("universities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  type: text("type", { enum: ["public", "private"] }).notNull().default("public"),
  category: text("category", {
    enum: ["university", "polytechnic", "institute"],
  })
    .notNull()
    .default("university"),
  city: text("city").notNull(),
  province: text("province").notNull(),
  website: text("website"),
  email: text("email"),
  phone: text("phone"),
  blurb: text("blurb"),
  logoUrl: text("logo_url"),
  verified: boolean("verified").default(false),
  verificationDate: date("verification_date"),
  partnerSince: date("partner_since"),
  contactPerson: text("contact_person"),
  verificationDocuments: jsonb("verification_documents").$type<VerificationDoc[]>().default([]),
  hue: integer("hue").notNull().default(215,
  ),
});

export const programmes = pgTable("programmes", {
  id: uuid("id").primaryKey().defaultRandom(),
  universityId: uuid("university_id")
    .notNull()
    .references(() => universities.id, { onDelete: "cascade" }),
  faculty: text("faculty").notNull(),
  title: text("title").notNull(),
  level: text("level", { enum: ["undergraduate", "diploma", "certificate"] })
    .notNull()
    .default("undergraduate"),
  mode: text("mode", { enum: ["full-time", "part-time", "block"] })
    .notNull()
    .default("full-time"),
  durationMonths: integer("duration_months").notNull().default(48),
  feesLocal: integer("fees_local").notNull().default(0),
  feesInternational: integer("fees_international").notNull().default(0),
  appFee: integer("app_fee").notNull().default(30),
  deadline: date("deadline").notNull(),
  location: text("location").notNull(),
  intake: text("intake").notNull().default("February & August"),
  description: text("description"),
  requirements: jsonb("requirements").$type<Requirements>().notNull(),
  active: boolean("active").notNull().default(true),
  /* future: scheduled scraping support */
  sourceUrl: text("source_url"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- student journey ---------- */
export const shortlistItems = pgTable(
  "shortlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    programmeId: uuid("programme_id")
      .notNull()
      .references(() => programmes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("shortlist_user_programme_idx").on(t.userId, t.programmeId)],
);

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  packageType: text("package_type", {
    enum: ["basic", "premium", "international"],
  })
    .notNull()
    .default("basic"),
  serviceFee: integer("service_fee").notNull().default(100),
  universityFees: integer("university_fees").notNull().default(0),
  totalAmount: integer("total_amount").notNull().default(100),
  paymentStatus: text("payment_status", { enum: ["unpaid", "pending", "paid"] })
    .notNull()
    .default("unpaid"),
  paymentRef: text("payment_ref"),
  status: text("status", {
    enum: ["draft", "submitted", "under_review", "offer_received", "enrolled"],
  })
    .notNull()
    .default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const applicationItems = pgTable("application_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  programmeId: uuid("programme_id")
    .notNull()
    .references(() => programmes.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["draft", "submitted", "under_review", "offer_received", "enrolled"],
  })
    .notNull()
    .default("draft"),
  internalNotes: text("internal_notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationItemId: uuid("application_item_id")
    .notNull()
    .references(() => applicationItems.id, { onDelete: "cascade" }),
  step: text("step", {
    enum: [
      "documents_received",
      "documents_verified",
      "application_fee_paid",
      "application_submitted",
      "university_acknowledged",
      "under_review",
      "offer_received",
      "enrolled",
    ],
  }).notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  notes: text("notes"),
  updatedBy: uuid("updated_by").references(() => users.id),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  method: text("method").notNull().default("paynow"),
  status: text("status", { enum: ["pending", "paid", "failed", "cancelled"] })
    .notNull()
    .default("pending"),
  reference: text("reference").notNull(),
  pollUrl: text("poll_url"),
  browserUrl: text("browser_url"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind", { enum: ["info", "success", "warning", "deadline"] })
    .notNull()
    .default("info"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiSessions = pgTable("ai_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  result: jsonb("result").$type<AiSuggestion>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
