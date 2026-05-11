import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { DECODE_SYSTEM_PROMPT, buildContextualDecodePrompt } from "@/lib/prompts";
import type { UserProfile, DecodeResult, ApiError } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { labText, profile }: { labText: string; profile?: UserProfile } =
      await req.json();

    if (!labText || labText.trim().length < 20) {
      const error: ApiError = {
        error: "Please paste your lab report text.",
        code: "VALIDATION_ERROR",
      };
      return NextResponse.json(error, { status: 400 });
    }

    const systemPrompt = profile
      ? buildContextualDecodePrompt(profile)
      : DECODE_SYSTEM_PROMPT;

    const message = await getAnthropicClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: labText }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = raw.replace(/```json|```/g, "").trim();
    console.log("Raw AI response:", raw);
    console.log("Cleaned AI response:", clean);
    const result: DecodeResult = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Decode API error:", err);
    const error: ApiError = {
      error: "Failed to decode lab report. Please try again.",
      code: "API_ERROR",
    };
    return NextResponse.json(error, { status: 500 });
  }
}
