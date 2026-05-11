import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { PREP_SYSTEM_PROMPT } from "@/lib/prompts";
import type { UserProfile, PrepResult, ApiError } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const profile: UserProfile = await req.json();

    const userMessage = `Patient profile:
Age: ${profile.age}
Sex: ${profile.sex}
Last bloodwork: ${profile.lastBloodwork}
Known conditions: ${profile.conditions.join(", ") || "none"}
Current symptoms: ${profile.symptoms.join(", ") || "none"}
Sleep quality: ${profile.sleepQuality}/5
Exercise: ${profile.exerciseFrequency}
Diet quality: ${profile.dietQuality}/5
Alcohol use: ${profile.alcoholUse}
Family history: ${profile.familyHistory.join(", ") || "none"}

Generate personalized blood test recommendations for this patient.`;

    const message = await getAnthropicClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: PREP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const result: PrepResult = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Prep API error:", err);
    const error: ApiError = {
      error: "Failed to generate recommendations. Please try again.",
      code: "API_ERROR",
    };
    return NextResponse.json(error, { status: 500 });
  }
}
