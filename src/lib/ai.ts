// src/lib/ai.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { AiSuggestion, SubjectGrade } from "@/db/schema";
import { computePoints } from "./grades";

export type GuidanceAnswers = {
  interests: string[];
  strengths: string[];
  workStyle: string;
  budget: string;
  notes: string;
  subjects: SubjectGrade[];
};

export const INTEREST_OPTIONS = [
  { id: "technology", label: "Technology & computers" },
  { id: "health", label: "Health & caring for people" },
  { id: "business", label: "Business & money" },
  { id: "community", label: "Community & helping others" },
  { id: "environment", label: "Environment & outdoors" },
  { id: "creative", label: "Creative arts & media" },
  { id: "research", label: "Research & discovery" },
  { id: "building", label: "Building & making things" },
];

export const STRENGTH_OPTIONS = [
  "Problem solving",
  "Writing & communication",
  "Numbers & analysis",
  "Working with people",
  "Practical hands-on work",
  "Memory & detail",
];

// Structured output schema for Gemini
const careerGuidanceSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING, description: "Overall guidance summary" },
    careers: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Career title" },
          field: { type: SchemaType.STRING, description: "Career field" },
          why: { type: SchemaType.STRING, description: "Reason why this career fits" },
          recommendedProgrammes: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Example degree or programme names"
          }
        }
      }
    },
    fields: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Recommended career fields"
    }
  }
} as const;

export async function generateGuidance(answers: GuidanceAnswers): Promise<AiSuggestion> {
  const environment = Reflect.get(globalThis.process, "env") as Record<string, string | undefined> | undefined;
  const key = environment?.GEMINI_API_KEY;
  
  if (key) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
          responseSchema: careerGuidanceSchema
        }
      });

      const points = computePoints(answers.subjects);
      const subjectNames = answers.subjects.map(s => `${s.subject} (${s.grade})`).join(", ");

      const prompt = `
You are a career guidance counselor for Zimbabwean university applicants.
Analyze the student profile and provide personalized career guidance.

Student Profile:
- A-Level Subjects & Grades: ${subjectNames}
- Total A-Level Points (best 3): ${points}
- Career Interests: ${answers.interests.length ? answers.interests.join(", ") : "Not specified"}
- Strengths: ${answers.strengths.length ? answers.strengths.join(", ") : "Not specified"}
- Work Style Preference: ${answers.workStyle}
- Budget: ${answers.budget}
- Additional Notes: ${answers.notes || "None"}

Respond with:
1. A brief summary (2-3 sentences) of the student's profile and recommended direction.
2. 3-5 career suggestions with reasoning.
3. Recommended career fields.

Keep responses practical for Zimbabwe's higher education and job market.
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText) as Partial<AiSuggestion>;

      if (parsed.summary && Array.isArray(parsed.careers)) {
        return {
          summary: parsed.summary,
          careers: parsed.careers.slice(0, 6).map(c => ({
            title: c.title || "Unknown career",
            field: c.field || "General",
            why: c.why || "Recommended based on your profile"
          })),
          fields: (parsed.fields ?? []).slice(0, 3),
          model: "gemini-2.0-flash-exp",
          createdAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fall through to heuristic engine
    }
  }

  // Fallback: use the heuristic engine if Gemini fails or isn't configured
  return heuristicGuidance(answers);
}

export function heuristicGuidance(answers: GuidanceAnswers): AiSuggestion {
  const interests = new Set(answers.interests.map((interest) => interest.toLowerCase()));
  const subjects = new Set(answers.subjects.map((subject) => subject.subject.toLowerCase()));
  const careers: AiSuggestion["careers"] = [];

  const addCareer = (title: string, field: string, why: string) => {
    if (!careers.some((career) => career.title === title)) careers.push({ title, field, why });
  };

  if (interests.has("technology") || subjects.has("computer science") || subjects.has("mathematics")) {
    addCareer("Software Developer", "Technology", "Your interest in technology and analytical subjects can translate into software and digital work.");
    addCareer("Data Analyst", "Technology & analytics", "Mathematics and problem-solving strengths are useful for turning data into decisions.");
  }
  if (interests.has("health") || subjects.has("biology")) {
    addCareer("Health Sciences Professional", "Health sciences", "Biology and an interest in caring for people provide a useful foundation for health-related study.");
    addCareer("Laboratory Scientist", "Health sciences & research", "Your science interests could suit practical diagnostic and research work.");
  }
  if (interests.has("business") || subjects.has("economics") || subjects.has("business studies") || subjects.has("accounting")) {
    addCareer("Business Analyst", "Business & finance", "Business, economics, or accounting interests can lead to roles that improve organisational decisions.");
    addCareer("Entrepreneur", "Business & enterprise", "Your interest in business can be developed through enterprise, finance, and management training.");
  }
  if (interests.has("environment") || subjects.has("geography") || subjects.has("agriculture")) {
    addCareer("Environmental Scientist", "Environment & natural resources", "Geography, agriculture, and environmental interests support work focused on sustainable development.");
  }
  if (interests.has("creative") || subjects.has("art & design") || subjects.has("literature in english")) {
    addCareer("Communications Specialist", "Creative media & communications", "Writing and creative interests can support clear, engaging communication across media and organisations.");
  }
  if (interests.has("building") || subjects.has("physics")) {
    addCareer("Engineering Professional", "Engineering & technology", "Physics and practical interests are a strong starting point for designing and building useful systems.");
  }
  if (!careers.length) {
    addCareer("Teacher", "Education & community", "Your profile can be developed through a people-focused field with broad opportunities in Zimbabwe.");
    addCareer("Research Assistant", "Research & analysis", "A research path can help you explore your strengths while building practical subject expertise.");
  }

  const fields = [...new Set(careers.map((career) => career.field))].slice(0, 3);
  return {
    summary: `Based on your interests and subjects, you may be well suited to ${fields.join(", ")}. Explore programmes that match your strongest subjects and preferred way of working.`,
    careers: careers.slice(0, 5),
    fields,
    model: "heuristic",
    createdAt: new Date().toISOString(),
  };
}