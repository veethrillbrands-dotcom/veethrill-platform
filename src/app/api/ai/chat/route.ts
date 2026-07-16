import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildBusinessContext } from "@/lib/ai-context";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "AI not configured — add GROQ_API_KEY to env" }, { status: 503 });
  }

  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  const systemPrompt = await buildBusinessContext();

  const groqMessages = messages.map((m: { role: string; text: string }) => ({
    role: m.role === "user" ? "user" as const : "assistant" as const,
    content: m.text,
  }));

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...groqMessages,
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ text });
  } catch (err: unknown) {
    console.error("AI chat error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
