import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildBusinessContext } from "@/lib/ai-context";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured — add ANTHROPIC_API_KEY to env" }, { status: 503 });
  }

  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  const systemPrompt = await buildBusinessContext();

  // Convert frontend message format to Anthropic format
  const anthropicMessages = messages.map((m: { role: string; text: string }) => ({
    role: m.role === "user" ? "user" as const : "assistant" as const,
    content: m.text,
  }));

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const text = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("");

    return NextResponse.json({ text });
  } catch (err: unknown) {
    console.error("AI chat error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
