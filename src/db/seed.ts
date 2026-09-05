/* Seed: ZUAE catalogue + demo accounts. Run: npx tsx src/db/seed.ts */
import "dotenv/config";
import { db } from "./index";
import {
  users,
  profiles,
  universities,
  programmes,
  applications,
  applicationItems,
  payments,
  notifications,
  type Requirements,
} from "./schema";
import { hashPassword } from "../lib/auth";

const d = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

type UniSeed = {
  name: string;
  type: "public" | "private";
  category: "university" | "polytechnic" | "institute";
  city: string;
  province: string;
  website: string;
  email: string;
  phone: string;
  blurb: string;
  hue: number;
};

const UNIS: UniSeed[] = [
  { name: "University of Zimbabwe", type: "public", category: "university", city: "Harare", province: "Harare", website: "https://www.uz.ac.zw", email: "admissions@uz.ac.zw", phone: "+263 242 303 211", blurb: "Zimbabwe's flagship university, founded 1952, with the widest faculty range in the country.", hue: 215 },
  { name: "National University of Science & Technology", type: "public", category: "university", city: "Bulawayo", province: "Bulawayo", website: "https://www.nust.ac.zw", email: "admissions@nust.ac.zw", phone: "+263 292 282 842", blurb: "The national centre of excellence for engineering, technology and applied science.", hue: 350 },
  { name: "Midlands State University", type: "public", category: "university", city: "Gweru", province: "Midlands", website: "https://www.msu.ac.zw", email: "admissions@msu.ac.zw", phone: "+263 542 255 233", blurb: "Large multi-campus university known for commerce, medicine and media programmes.", hue: 160 },
  { name: "Bindura University of Science Education", type: "public", category: "university", city: "Bindura", province: "Mashonaland Central", website: "https://www.buse.ac.zw", email: "registry@buse.ac.zw", phone: "+263 752 211 626", blurb: "Science education, agriculture and environmental sciences specialist institution.", hue: 95 },
  { name: "Great Zimbabwe University", type: "public", category: "university", city: "Masvingo", province: "Masvingo", website: "https://www.gzu.ac.zw", email: "admissions@gzu.ac.zw", phone: "+263 392 262 091", blurb: "Innovation-driven university beside the historic Great Zimbabwe monument.", hue: 25 },
  { name: "Harare Institute of Technology", type: "public", category: "institute", city: "Harare", province: "Harare", website: "https://www.hit.ac.zw", email: "admissions@hit.ac.zw", phone: "+263 242 375 187", blurb: "Technology university focused on industrialisation, mechatronics and design.", hue: 265 },
  { name: "Chinhoyi University of Technology", type: "public", category: "university", city: "Chinhoyi", province: "Mashonaland West", website: "https://www.cut.ac.zw", email: "admissions@cut.ac.zw", phone: "+263 672 122 643", blurb: "Applied sciences, food technology and hospitality programmes with industry placements.", hue: 190 },
  { name: "Lupane State University", type: "public", category: "university", city: "Lupane", province: "Matabeleland North", website: "https://www.lsu.ac.zw", email: "admissions@lsu.ac.zw", phone: "+263 292 811 083", blurb: "Wildlife, ecology and development studies hub for the Matabeleland region.", hue: 45 },
  { name: "Africa University", type: "private", category: "university", city: "Mutare", province: "Manicaland", website: "https://www.africau.edu", email: "admissions@africau.edu", phone: "+263 202 066 101", blurb: "Pan-African private university on a 1,000-acre campus in Mutare.", hue: 285 },
  { name: "Women's University in Africa", type: "private", category: "university", city: "Harare", province: "Harare", website: "https://www.wua.ac.zw", email: "admissions@wua.ac.zw", phone: "+263 242 794 305", blurb: "Private university championing gender-inclusive higher education.", hue: 330 },
  { name: "Harare Polytechnic", type: "public", category: "polytechnic", city: "Harare", province: "Harare", website: "https://www.hararepolytechnic.ac.zw", email: "registrar@hararepoly.ac.zw", phone: "+263 242 792 502", blurb: "Zimbabwe's largest polytechnic — diplomas and certificates with industry attachment.", hue: 205 },
  { name: "Bulawayo Polytechnic", type: "public", category: "polytechnic", city: "Bulawayo", province: "Bulawayo", website: "https://www.bulawayopolytechnic.ac.zw", email: "registrar@bulpoly.ac.zw", phone: "+263 292 262 913", blurb: "Engineering and built-environment diplomas trusted by industry since 1927.", hue: 15 },
];

type ProgSeed = [
  uni: string,
  faculty: string,
  title: string,
  level: "undergraduate" | "diploma" | "certificate",
  mode: "full-time" | "part-time" | "block",
  months: number,
  feesL: number,
  feesI: number,
  appFee: number,
  deadlineDays: number,
  req: Requirements,
  desc: string,
];

const PROGS: ProgSeed[] = [
  ["University of Zimbabwe", "Medicine & Health Sciences", "MBChB Medicine & Surgery", "undergraduate", "full-time", 72, 6500, 9800, 50, 38, { minPoints: 15, required: [{ subject: "Biology", minGrade: "C" }, { subject: "Chemistry", minGrade: "C" }] }, "Zimbabwe's premier medical degree with clinical training at Parirenyatwa Hospital."],
  ["University of Zimbabwe", "Law", "LLB Bachelor of Laws", "undergraduate", "full-time", 48, 2200, 3500, 40, 52, { minPoints: 10, required: [{ subject: "English", minGrade: "D" }] }, "Professional law degree leading to admission as a legal practitioner."],
  ["University of Zimbabwe", "Science", "BSc Honours Computer Science", "undergraduate", "full-time", 48, 2000, 3200, 35, 66, { minPoints: 10, required: [{ subject: "Mathematics", minGrade: "C" }] }, "Algorithms, systems and software with an industrial attachment year."],
  ["University of Zimbabwe", "Economics & Business", "BA Honours Economics", "undergraduate", "full-time", 48, 1800, 3000, 35, 66, { minPoints: 9, required: [{ subject: "Mathematics", minGrade: "D" }] }, "Quantitative economics, policy and finance for public and private sectors."],
  ["National University of Science & Technology", "Civil Engineering", "BEng Honours Civil Engineering", "undergraduate", "full-time", 48, 2600, 4000, 45, 44, { minPoints: 12, required: [{ subject: "Mathematics", minGrade: "C" }, { subject: "Physics", minGrade: "C" }] }, "Structures, geotechnics and transportation engineering with EA accreditation path."],
  ["National University of Science & Technology", "Chemical Engineering", "BEng Honours Chemical Engineering", "undergraduate", "full-time", 48, 2600, 4000, 45, 44, { minPoints: 12, required: [{ subject: "Mathematics", minGrade: "C" }, { subject: "Chemistry", minGrade: "C" }] }, "Process engineering for minerals, food and pharmaceutical industries."],
  ["National University of Science & Technology", "Applied Sciences", "BSc Honours Computer Science", "undergraduate", "full-time", 48, 2300, 3600, 40, 58, { minPoints: 10, required: [{ subject: "Mathematics", minGrade: "C" }] }, "Software, AI and networks from Zimbabwe's technology flagship."],
  ["National University of Science & Technology", "Architecture & Built Environment", "BSc Architectural Studies", "undergraduate", "full-time", 60, 2500, 3800, 40, 58, { minPoints: 9, required: [{ subject: "Mathematics", minGrade: "D" }] }, "Design studio-based architecture degree with professional portfolio."],
  ["Midlands State University", "Medicine & Health Sciences", "BSc Honours Nursing", "undergraduate", "full-time", 48, 2400, 3600, 40, 30, { minPoints: 10, required: [{ subject: "Biology", minGrade: "C" }] }, "Registered-nurse qualification with clinical placement across Midlands province."],
  ["Midlands State University", "Commerce", "BCom Honours Accounting", "undergraduate", "full-time", 48, 1700, 2800, 35, 72, { minPoints: 9, required: [{ subject: "Mathematics", minGrade: "D" }] }, "ICAZ-accredited accounting degree with audit and taxation streams."],
  ["Midlands State University", "Social Sciences", "BA Honours Media & Society Studies", "undergraduate", "full-time", 48, 1500, 2500, 30, 72, { minPoints: 8, required: [{ subject: "English", minGrade: "D" }] }, "Broadcasting, journalism and digital media with campus studio practice."],
  ["Bindura University of Science Education", "Agriculture & Environment", "BSc Honours Agriculture", "undergraduate", "full-time", 48, 1600, 2600, 30, 80, { minPoints: 8, required: [{ subject: "Biology", minGrade: "D" }] }, "Crop, livestock and agribusiness science with farm-based attachment."],
  ["Bindura University of Science Education", "Science Education", "BEd Science Education", "undergraduate", "full-time", 48, 1400, 2400, 30, 80, { minPoints: 8, required: [{ subject: "Mathematics", minGrade: "D" }] }, "Train as a secondary school science teacher with ministry placement."],
  ["Great Zimbabwe University", "Commerce", "BCom Honours Business Administration", "undergraduate", "full-time", 48, 1600, 2600, 30, 90, { minPoints: 8, required: [] }, "Management, strategy and entrepreneurship for the modern enterprise."],
  ["Great Zimbabwe University", "Science & Technology", "BSc Honours Biotechnology", "undergraduate", "full-time", 48, 1900, 3000, 35, 90, { minPoints: 10, required: [{ subject: "Biology", minGrade: "C" }, { subject: "Chemistry", minGrade: "C" }] }, "Molecular biology, genomics and industrial bioprocessing."],
  ["Great Zimbabwe University", "Social Sciences", "BA Honours Peace & Governance Studies", "undergraduate", "full-time", 48, 1400, 2300, 30, 90, { minPoints: 7, required: [] }, "Policy, governance and conflict resolution for public-sector careers."],
  ["Harare Institute of Technology", "Engineering & Technology", "BTech Mechatronic Engineering", "undergraduate", "full-time", 48, 2400, 3600, 40, 48, { minPoints: 11, required: [{ subject: "Mathematics", minGrade: "C" }, { subject: "Physics", minGrade: "C" }] }, "Robotics, automation and control systems with maker-lab culture."],
  ["Harare Institute of Technology", "Engineering & Technology", "BTech Industrial & Manufacturing Engineering", "undergraduate", "full-time", 48, 2400, 3600, 40, 48, { minPoints: 11, required: [{ subject: "Mathematics", minGrade: "C" }, { subject: "Physics", minGrade: "D" }] }, "Production systems, CAD/CAM and industrial innovation."],
  ["Harare Institute of Technology", "Information Technology", "BSc Honours Information Technology", "undergraduate", "full-time", 48, 2100, 3300, 35, 62, { minPoints: 9, required: [{ subject: "Mathematics", minGrade: "D" }] }, "Applied computing, networks and enterprise systems."],
  ["Chinhoyi University of Technology", "Applied Sciences", "BSc Food Science & Technology", "undergraduate", "full-time", 48, 1700, 2700, 30, 76, { minPoints: 9, required: [{ subject: "Chemistry", minGrade: "D" }] }, "Food processing, safety and quality for Zimbabwe's agro-industry."],
  ["Chinhoyi University of Technology", "Agriculture", "BSc Horticulture", "undergraduate", "full-time", 48, 1500, 2400, 30, 76, { minPoints: 8, required: [{ subject: "Biology", minGrade: "D" }] }, "Commercial horticulture, floriculture and post-harvest science."],
  ["Chinhoyi University of Technology", "Hospitality", "BTech Hospitality & Tourism Management", "undergraduate", "block", 48, 1500, 2400, 30, 76, { minPoints: 7, required: [] }, "Hotel, tourism and events management with industry blocks."],
  ["Lupane State University", "Wildlife & Ecology", "BSc Honours Wildlife Management & Ecology", "undergraduate", "full-time", 48, 1500, 2400, 30, 84, { minPoints: 8, required: [{ subject: "Biology", minGrade: "D" }] }, "Conservation science near Hwange National Park."],
  ["Lupane State University", "Development Studies", "BCom Honours Development Economics", "undergraduate", "full-time", 48, 1300, 2200, 30, 84, { minPoints: 7, required: [] }, "Economics for NGOs, government and development finance."],
  ["Africa University", "Agriculture & Natural Resources", "BSc Honours Agribusiness Management", "undergraduate", "full-time", 48, 2800, 4200, 40, 68, { minPoints: 8, required: [] }, "Commercial agriculture management on a working university farm."],
  ["Africa University", "Social Sciences", "BSc Honours Psychology", "undergraduate", "full-time", 48, 2700, 4100, 40, 68, { minPoints: 8, required: [] }, "Clinical, developmental and organisational psychology foundations."],
  ["Women's University in Africa", "Social Sciences", "BSc Honours Psychology & Counselling", "undergraduate", "full-time", 48, 2600, 4000, 35, 95, { minPoints: 8, required: [] }, "Counselling psychology with supervised practicum."],
  ["Women's University in Africa", "Management", "BCom Honours Human Resources Management", "undergraduate", "block", 48, 2500, 3800, 35, 95, { minPoints: 8, required: [] }, "People management, labour law and organisational development."],
  ["Harare Polytechnic", "Commerce", "Diploma in Accountancy", "diploma", "full-time", 36, 900, 1600, 20, 55, { minPoints: 6, required: [{ subject: "Mathematics", minGrade: "D" }] }, "LCCI-aligned accountancy diploma with industrial attachment."],
  ["Harare Polytechnic", "Applied Sciences", "Diploma in Information Technology", "diploma", "full-time", 36, 950, 1700, 20, 55, { minPoints: 6, required: [{ subject: "Mathematics", minGrade: "D" }] }, "Practical computing, networking and web development diploma."],
  ["Harare Polytechnic", "Commerce", "Certificate in Business Management", "certificate", "part-time", 24, 500, 900, 15, 100, { minPoints: 4, required: [] }, "Entry-level business certificate for school leavers and entrepreneurs."],
  ["Bulawayo Polytechnic", "Built Environment", "Diploma in Civil Engineering", "diploma", "full-time", 36, 900, 1600, 20, 60, { minPoints: 6, required: [{ subject: "Mathematics", minGrade: "D" }] }, "Site-ready civil engineering technologist training."],
  ["Bulawayo Polytechnic", "Engineering", "Diploma in Electrical & Electronics Engineering", "diploma", "full-time", 36, 950, 1700, 20, 60, { minPoints: 6, required: [{ subject: "Mathematics", minGrade: "D" }] }, "Power and electronics technologist diploma with ZESA placements."],
  ["Bulawayo Polytechnic", "Engineering", "Certificate in Welding & Fabrication", "certificate", "full-time", 24, 450, 800, 15, 100, { minPoints: 4, required: [] }, "Trade certificate with workshop-intensive training."],
];

async function main() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded — skipping.");
    return;
  }

  console.log("Seeding ZUAE…");
  const uniIds: Record<string, string> = {};
  for (const u of UNIS) {
    const [row] = await db.insert(universities).values(u).returning({ id: universities.id });
    uniIds[u.name] = row.id;
  }

  for (const p of PROGS) {
    await db.insert(programmes).values({
      universityId: uniIds[p[0]],
      faculty: p[1],
      title: p[2],
      level: p[3],
      mode: p[4],
      durationMonths: p[5],
      feesLocal: p[6],
      feesInternational: p[7],
      appFee: p[8],
      deadline: d(p[9]),
      location: UNIS.find((u) => u.name === p[0])!.city,
      description: p[11],
      requirements: p[10],
    });
  }

  const adminHash = await hashPassword("Admin@2025");
  const [admin] = await db
    .insert(users)
    .values({ email: "admin@zuae.co.zw", passwordHash: adminHash, role: "admin" })
    .returning({ id: users.id });
  await db.insert(profiles).values({
    userId: admin.id,
    fullName: "ZUAE Admissions Office",
    nationality: "Zimbabwean",
    phone: "+263 771 862 929",
  });

  const stuHash = await hashPassword("Student@2025");
  const [stu] = await db
    .insert(users)
    .values({ email: "student@zuae.demo", passwordHash: stuHash, role: "student" })
    .returning({ id: users.id });
  await db.insert(profiles).values({
    userId: stu.id,
    fullName: "Tariro Moyo",
    dob: "2006-04-12",
    nationality: "Zimbabwean",
    phone: "+263 77 234 5678",
    currentSchool: "St. Augustine's High School, Masvingo",
    studyLevel: "undergraduate",
    subjects: [
      { subject: "Mathematics", grade: "B" },
      { subject: "Physics", grade: "C" },
      { subject: "Chemistry", grade: "C" },
    ],
    interests: ["technology", "research"],
  });

  // one live application for the demo student (paid, under review)
  const nustCs = await db.select().from(programmes).limit(40);
  const target = nustCs.find((p) => p.title.includes("Computer Science") && p.faculty === "Applied Sciences");
  const hit = nustCs.find((p) => p.title.includes("Information Technology"));
  if (target && hit) {
    const [app] = await db
      .insert(applications)
      .values({
        userId: stu.id,
        packageType: "premium",
        serviceFee: 125,
        universityFees: target.appFee + hit.appFee,
        totalAmount: 125 + target.appFee + hit.appFee,
        paymentStatus: "paid",
        paymentRef: "ZUAE-PN-100235",
        status: "under_review",
      })
      .returning({ id: applications.id });
    await db.insert(applicationItems).values([
      { applicationId: app.id, programmeId: target.id, status: "under_review", internalNotes: "Transcript verified by ZUAE office. Awaiting NUST registry response." },
      { applicationId: app.id, programmeId: hit.id, status: "submitted" },
    ]);
    await db.insert(payments).values({
      userId: stu.id,
      applicationId: app.id,
      amount: 125 + target.appFee + hit.appFee,
      status: "paid",
      reference: "ZUAE-PN-100235",
      method: "paynow",
      paidAt: new Date(Date.now() - 6 * 86_400_000),
    });
    await db.insert(notifications).values([
      { userId: stu.id, title: "Payment received", body: `Paynow payment ZUAE-PN-100235 confirmed. Your application package is now being processed.`, kind: "success" },
      { userId: stu.id, title: "Application under review", body: "NUST BSc Computer Science moved to “Under review” — a ZUAE officer is liaising with the registry.", kind: "info" },
      { userId: stu.id, title: "Deadline reminder", body: "MSU BSc Honours Nursing closes in 30 days. Complete your document checklist to apply.", kind: "deadline" },
    ]);
  }

  console.log("Seed complete:", UNIS.length, "universities,", PROGS.length, "programmes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
