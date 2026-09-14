import { GoogleGenerativeAI } from "@google/generative-ai";
import { errorResponse, readJson, requireUser } from "@/lib/guard";

const SYSTEM_PROMPT = `You are ZUAE's student assistant for Zimbabwe University Admissions & Enrolment.
Help students understand the ZUAE process, careers, programme choices, fees and deadlines.
Keep replies short (2–4 sentences), friendly, and specific to Zimbabwean universities (UZ, NUST, MSU, etc.).
If asked about a specific application, tell them to visit their dashboard.`;

export async function POST(req: Request) {
  try {
    await requireUser();
    const { messages } = await readJson<{ messages: { role: string; content: string }[] }>(req);
    const key = process.env.GEMINI_API_KEY;
    if (!key) return Response.json({ reply: "AI is not configured. Please try later." });

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I'll help students with ZUAE questions and career guidance." }] },
        ...messages.slice(0, -1).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      ],
    });
    const last = messages[messages.length - 1].content;
    const result = await chat.sendMessage(last);
    return Response.json({ reply: result.response.text() });
  } catch (e) {
    return errorResponse(e);
  }
}