# VisitReady — Claude Code Build Instructions

## Project Overview

VisitReady is a health literacy web app with two modes:

- **Mode 1 — Pre-Visit Prep**: User answers 10 questions about their age, symptoms,
  lifestyle, and history. Claude Haiku generates a personalized blood test panel
  recommendation with priority tiers and doctor questions.

- **Mode 2 — Results Decoder**: User pastes their lab report text. Claude Haiku
  parses every marker, classifies status (normal/borderline/flagged), returns
  plain-English explanations, and renders an interactive SVG body map with
  color-coded organ systems. If Mode 1 profile exists in session, Mode 2 uses
  it for personalized, context-aware interpretation.

**Tagline:** Know what to ask before you walk in. Understand what came back.

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui ·
Anthropic SDK (claude-haiku-4-5-20251001) · Vercel

---

## Absolute Rules

- NEVER expose ANTHROPIC_API_KEY on the client. All Claude API calls go through
  Next.js API routes (`/api/prep` and `/api/decode`).
- NEVER store real user health data beyond the browser session.
- ALWAYS show the medical disclaimer on any page that displays health information.
- Use TypeScript strict mode throughout. No `any` types.
- Use the App Router exclusively. No Pages Router.
- Every Claude API call must have a try/catch with a user-facing error state.

---

## Project Structure

```
visitready/
├── CLAUDE.md
├── .env.local                  # ANTHROPIC_API_KEY (never commit)
├── .env.example                # Template with placeholder
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout with fonts + metadata
    │   ├── page.tsx             # Landing page
    │   ├── globals.css          # Tailwind base + custom CSS vars
    │   ├── prep/
    │   │   ├── page.tsx         # Mode 1: intake form
    │   │   └── results/
    │   │       └── page.tsx     # Mode 1: panel recommendations
    │   ├── decode/
    │   │   ├── page.tsx         # Mode 2: lab text input
    │   │   └── results/
    │   │       └── page.tsx     # Mode 2: body map + cards
    │   └── api/
    │       ├── prep/
    │       │   └── route.ts     # POST handler — Mode 1
    │       └── decode/
    │           └── route.ts     # POST handler — Mode 2
    ├── components/
    │   ├── ui/                  # shadcn/ui base components
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   └── Disclaimer.tsx
    │   ├── prep/
    │   │   ├── IntakeForm.tsx
    │   │   └── PanelResults.tsx
    │   └── decode/
    │       ├── LabInput.tsx
    │       ├── BodyMap.tsx
    │       ├── MarkerCard.tsx
    │       └── DoctorQuestions.tsx
    ├── lib/
    │   ├── anthropic.ts         # Anthropic client singleton
    │   ├── prompts.ts           # All Claude system prompts
    │   ├── session.ts           # Session storage helpers
    │   └── types.ts             # All TypeScript interfaces
    └── hooks/
        └── useProfile.ts        # Hook for reading/writing profile
```

---

## Environment Setup

**`.env.example`** (commit this):
```
ANTHROPIC_API_KEY=your_api_key_here
```

**`.env.local`** (never commit — add to .gitignore):
```
ANTHROPIC_API_KEY=sk-ant-...
```

In Vercel dashboard → Project Settings → Environment Variables → add
`ANTHROPIC_API_KEY` for Production, Preview, and Development.

---

## TypeScript Types (`src/lib/types.ts`)

```typescript
// ── Mode 1 Types ──────────────────────────────────────────────

export interface UserProfile {
  age: number;
  sex: "male" | "female" | "other";
  lastBloodwork: "never" | "over_2_years" | "1_2_years" | "within_year";
  conditions: string[];        // e.g. ["diabetes", "hypertension"]
  symptoms: string[];          // e.g. ["fatigue", "brain_fog"]
  sleepQuality: number;        // 1–5
  exerciseFrequency: "sedentary" | "light" | "moderate" | "active";
  dietQuality: number;         // 1–5
  alcoholUse: "none" | "occasional" | "regular" | "heavy";
  familyHistory: string[];     // e.g. ["heart_disease", "diabetes"]
}

export interface RecommendedPanel {
  name: string;
  priority: "essential" | "recommended" | "optional";
  reason: string;              // Why it's relevant to THIS user
  fasting: boolean;
  system: BodySystem;
}

export interface PrepResult {
  panels: RecommendedPanel[];
  prepInstructions: string[];
  doctorQuestions: string[];
  summary: string;             // 1-sentence summary of risk profile
}

// ── Mode 2 Types ──────────────────────────────────────────────

export type BodySystem =
  | "cardiovascular"
  | "metabolic"
  | "liver"
  | "kidney"
  | "blood"
  | "thyroid"
  | "vitamins"
  | "other";

export type MarkerStatus = "normal" | "borderline" | "flagged";

export interface LabMarker {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: MarkerStatus;
  system: BodySystem;
  plainEnglish: string;        // 1–2 sentences, zero jargon
  severity: "none" | "mild" | "moderate" | "high";
}

export interface DecodeResult {
  markers: LabMarker[];
  summary: {
    totalMarkers: number;
    flagged: number;
    borderline: number;
    normal: number;
    systemsAffected: BodySystem[];
  };
  doctorQuestions: string[];
  contextUsed: boolean;        // true if Mode 1 profile was sent
  missingTests?: string[];     // tests recommended in Mode 1 not in results
}

// ── Shared ────────────────────────────────────────────────────

export type ApiError = {
  error: string;
  code: "PARSE_ERROR" | "API_ERROR" | "VALIDATION_ERROR";
};
```

---

## Claude API Prompts (`src/lib/prompts.ts`)

```typescript
export const PREP_SYSTEM_PROMPT = `
You are a health literacy assistant helping patients prepare for a doctor visit.
Given a patient profile, recommend which blood tests they should request.
Return ONLY valid JSON — no markdown, no preamble, no explanation.

Return exactly this shape:
{
  "panels": [
    {
      "name": "string — full test name",
      "priority": "essential" | "recommended" | "optional",
      "reason": "string — 1-2 sentences specific to THIS patient's profile",
      "fasting": boolean,
      "system": "cardiovascular"|"metabolic"|"liver"|"kidney"|"blood"|"thyroid"|"vitamins"|"other"
    }
  ],
  "prepInstructions": ["string", ...],
  "doctorQuestions": ["string — specific question to ask the doctor", ...],
  "summary": "string — 1 sentence summarizing their risk profile"
}

Rules:
- Essential: directly indicated by their symptoms or risk factors
- Recommended: good to add given age/history/lifestyle
- Optional: worth discussing with doctor
- doctorQuestions: 4–6 questions, specific to their profile, not generic
- Never diagnose. Never recommend treatment. Be factual and empowering.
- prepInstructions: practical day-of advice (fasting, exercise, medications)
`.trim();

export const DECODE_SYSTEM_PROMPT = `
You are a health literacy assistant that parses blood test reports.
Given raw lab report text, extract every marker and return ONLY valid JSON.
No markdown, no preamble, no explanation — raw JSON only.

Return exactly this shape:
{
  "markers": [
    {
      "name": "string",
      "value": number or string,
      "unit": "string",
      "referenceRange": "string",
      "status": "normal" | "borderline" | "flagged",
      "system": "cardiovascular"|"metabolic"|"liver"|"kidney"|"blood"|"thyroid"|"vitamins"|"other",
      "plainEnglish": "string — 1-2 sentences, zero jargon, patient-friendly",
      "severity": "none" | "mild" | "moderate" | "high"
    }
  ],
  "summary": {
    "totalMarkers": number,
    "flagged": number,
    "borderline": number,
    "normal": number,
    "systemsAffected": ["system", ...]
  },
  "doctorQuestions": ["string", ...],
  "contextUsed": false,
  "missingTests": []
}

Status rules:
- normal: within reference range
- borderline: slightly outside range or at boundary
- flagged: clearly outside range, clinically notable

Use standard clinical reference ranges if report omits them.
doctorQuestions: 4–6 questions specific to the flagged/borderline values only.
Never diagnose. Never recommend treatment. Be factual and calm.
`.trim();

export function buildContextualDecodePrompt(profile: UserProfile): string {
  return `
You are a health literacy assistant that parses blood test reports.
Given raw lab report text AND the patient's health profile, return ONLY valid JSON.
No markdown, no preamble, no explanation — raw JSON only.

PATIENT CONTEXT (from pre-visit profile):
- Age: ${profile.age}, Sex: ${profile.sex}
- Reported symptoms: ${profile.symptoms.join(", ") || "none"}
- Known conditions: ${profile.conditions.join(", ") || "none"}
- Family history: ${profile.familyHistory.join(", ") || "none"}
- Lifestyle: exercise=${profile.exerciseFrequency}, sleep=${profile.sleepQuality}/5, diet=${profile.dietQuality}/5
- Alcohol: ${profile.alcoholUse}

Use this context to:
1. Connect findings to reported symptoms where relevant
2. Adjust risk language based on family history
3. Flag if important tests from their profile are missing

Return exactly this shape:
{
  "markers": [...],
  "summary": {...},
  "doctorQuestions": [...],
  "contextUsed": true,
  "missingTests": ["test name if it was important for their profile but absent"]
}

Same field rules as standard decode. Be factual and calm. Never diagnose.
`.trim();
}
```

---

## API Routes

### `src/app/api/prep/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
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

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
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
```

### `src/app/api/decode/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
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

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: labText }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = raw.replace(/```json|```/g, "").trim();
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
```

---

## Session Storage (`src/lib/session.ts`)

```typescript
import type { UserProfile, PrepResult } from "./types";

const PROFILE_KEY = "visitready_profile";
const PREP_RESULT_KEY = "visitready_prep_result";

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function savePrepResult(result: PrepResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PREP_RESULT_KEY, JSON.stringify(result));
}

export function loadPrepResult(): PrepResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PREP_RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PrepResult;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(PREP_RESULT_KEY);
}

export function hasProfile(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PROFILE_KEY) !== null;
}
```

---

## Anthropic Client (`src/lib/anthropic.ts`)

```typescript
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

---

## Design System

### Colors (add to `tailwind.config.ts`)
```typescript
colors: {
  brand: {
    50:  "#f0fdfa",
    100: "#ccfbf1",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    900: "#134e4a",
  },
  status: {
    normal:     "#16a34a",  // green-600
    borderline: "#d97706",  // amber-600
    flagged:    "#dc2626",  // red-600
    normalBg:   "#f0fdf4",  // green-50
    borderlineBg: "#fffbeb",// amber-50
    flaggedBg:  "#fef2f2",  // red-50
  }
}
```

### Typography
- Headings: `font-semibold tracking-tight`
- Body: `text-gray-700 leading-relaxed`
- Muted: `text-gray-500 text-sm`
- Brand gradient text: `bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent`

### Component Patterns
- Cards: `rounded-2xl border border-gray-100 bg-white p-6 shadow-sm`
- Buttons primary: `bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-3 font-medium transition-colors`
- Buttons outline: `border border-gray-200 hover:bg-gray-50 rounded-xl px-6 py-3 font-medium transition-colors`
- Status pill: `text-xs font-medium px-2.5 py-1 rounded-full`
- Input: `rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100`

---

## Page Specifications

### Landing Page (`src/app/page.tsx`)

Layout: centered, max-w-4xl, full viewport height

Top section:
- Small badge: "Health Innovation · AI-Powered"
- H1: "Know what to ask. Understand what came back."
- Subtext: "VisitReady helps you prepare for your next doctor visit — and decode your results after."
- Two large cards side by side (or stacked mobile):

Card 1 — Pre-Visit Prep:
- Icon: calendar or stethoscope (Lucide)
- Title: "Preparing for a visit"
- Body: "Answer 10 questions. Get a personalized test checklist and doctor questions."
- CTA button: "Get My Panel Recommendations →"
- Links to `/prep`

Card 2 — Results Decoder:
- Icon: activity/chart
- Title: "Got results back?"
- Body: "Paste your lab report. Understand every marker in plain English."
- CTA button: "Decode My Results →"
- Links to `/decode`

Bottom: small disclaimer text

### Intake Form (`src/app/prep/page.tsx`)

Header: "Build your panel — step 1 of 1"
Progress indicator at top

Form fields (all required except conditions/symptoms/family history):
1. Age: `<input type="number" min="18" max="120">`
2. Biological sex: radio group (Male / Female / Other)
3. Last bloodwork: select dropdown
4. Known conditions: checkbox grid
   - Options: Diabetes/pre-diabetes, High blood pressure, Thyroid disorder,
     Heart disease, Anemia, Kidney disease, Liver disease, None of the above
5. Current symptoms: checkbox grid
   - Options: Fatigue/low energy, Brain fog, Unexplained weight change,
     Hair loss, Frequent illness, Joint/muscle pain, Mood changes, None
6. Sleep quality: slider 1–5 (labels: Poor → Excellent)
7. Exercise frequency: segmented control
   - Sedentary / Light (1-2x/week) / Moderate (3-4x/week) / Active (5+/week)
8. Diet quality: slider 1–5 (labels: Poor → Excellent)
9. Alcohol use: select dropdown
   - None / Occasional (weekends) / Regular (few times/week) / Heavy (daily)
10. Family history: checkbox grid
    - Options: Heart disease, Diabetes, Cancer (any), Thyroid disorder,
      Stroke, None of the above

Submit button: "Generate My Recommendations →"

On submit:
1. Validate all required fields
2. Save profile to sessionStorage via `saveProfile()`
3. POST to `/api/prep` with profile
4. Show loading state (spinner + "Analyzing your profile...")
5. On success: save result with `savePrepResult()`, navigate to `/prep/results`
6. On error: show error toast, stay on form

### Prep Results (`src/app/prep/results/page.tsx`)

If no result in session → redirect to `/prep`

Header section:
- "Your personalized panel" heading
- Profile summary badge (age, sex)
- Context banner if session has profile: "Based on your profile"
- The `summary` field from PrepResult in a highlighted card

Three-tier panel display:
- Essential panels: teal accent, "Request these — high priority"
- Recommended panels: blue accent, "Good to add while you're there"
- Optional panels: gray accent, "Discuss with your doctor"

Each panel card shows:
- Panel name (bold)
- Priority badge
- Reason (italic, personalized text from Claude)
- Fasting chip: "Requires fasting" or "No fasting needed"

Prep instructions section:
- Checklist of day-of instructions

Doctor Questions section:
- Each question in a styled card with quote styling
- "Copy all questions" button → copies to clipboard

Two action buttons at bottom:
- "Got my results back? Decode them →" → navigates to `/decode`
  (passes profile context automatically via session)
- "Start over" → clears session, back to `/`

Medical disclaimer

### Lab Input (`src/app/decode/page.tsx`)

Check for profile in session → show context banner if found:
"We have your health profile from your pre-visit prep. We'll use it for a
 more personalized interpretation."
[Use profile] [Skip — decode without context]

Main area:
- H2: "Paste your lab report"
- Body text: "Copy the text from your patient portal (MyChart, LabCorp, Quest, etc.)"
- Large textarea (min 200px height)
- Placeholder: sample lab text snippet showing format
- Character counter
- CTA: "Decode My Results →"

Sample data button: "Use sample report" → fills textarea with synthetic data

On submit:
1. Validate minimum 50 characters
2. Read profile from session if user chose to use context
3. POST to `/api/decode` with `{ labText, profile? }`
4. Show loading state (spinner + "Reading your report...")
5. On success: store result in state, navigate to `/decode/results`
6. On error: show error message in page

### Results Decoder (`src/app/decode/results/page.tsx`)

This is the hero page. Layout: two-column on desktop (body map left, cards right),
single column on mobile.

LEFT COLUMN — Body Map (BodyMap component):
- SVG body silhouette, centered, ~280px wide
- 7 clickable organ regions, each colored by worst status of its system:
  - thyroid: neck ellipse
  - cardiovascular: chest/heart area
  - liver: right upper abdomen
  - kidney: flanks/lower back
  - metabolic: center abdomen
  - blood: represented as bone marrow region (upper femur area) or full-body tint
  - vitamins: shown as separate small indicator panel below body
- Color coding:
  - All normal → green fill
  - Any borderline → amber fill
  - Any flagged → red fill
  - No data → gray fill
- Clicking a region scrolls to that system's card group on the right
- Legend below SVG: green=normal, amber=borderline, red=flagged
- Context badge if profile was used: "Personalized interpretation"
- Missing tests banner if any (from `missingTests` array)

RIGHT COLUMN — Results:

Summary stats row (4 metric cards):
- Total markers, Flagged (red), Borderline (amber), Normal (green)

Marker cards grouped by system:
- Each system gets a section header
- Each marker gets a MarkerCard:
  - Status dot (colored)
  - Marker name
  - Your value + unit
  - Reference range
  - Status badge (Normal/Borderline/Flagged)
  - Plain English explanation

Doctor Questions section (same component as prep results)

If contextUsed=true: show personalized insight banner

Two action buttons:
- "Prepare for another visit →" → `/prep`
- "Decode another report" → `/decode`

Medical disclaimer (sticky at bottom or in footer)

---

## BodyMap SVG Component (`src/components/decode/BodyMap.tsx`)

Build as a React SVG component. Props:
```typescript
interface BodyMapProps {
  systemStatuses: Record<BodySystem, MarkerStatus | null>;
  onSystemClick: (system: BodySystem) => void;
  activeSystem?: BodySystem;
}
```

Color logic:
```typescript
function systemColor(status: MarkerStatus | null): string {
  if (status === "flagged")    return "#dc2626"; // red
  if (status === "borderline") return "#d97706"; // amber
  if (status === "normal")     return "#16a34a"; // green
  return "#d1d5db"; // gray (no data)
}
```

SVG anatomy (viewBox="0 0 200 380"):
- Head: ellipse cx=100 cy=35 rx=28 ry=32
- Neck: rect x=88 y=65 w=24 h=25 rx=4
- Torso: rect x=60 y=88 w=80 h=110 rx=12
- Left arm: rect x=30 y=90 w=28 h=85 rx=10
- Right arm: rect x=142 y=90 w=28 h=85 rx=10
- Hips: rect x=60 y=195 w=80 h=40 rx=8
- Left leg: rect x=62 y=232 w=32 h=110 rx=10
- Right leg: rect x=106 y=232 w=32 h=110 rx=10

Organ overlays (on top of body, semi-transparent fill):
- Thyroid: ellipse cx=100 cy=76 rx=12 ry=8, fill=systemColor("thyroid")
- Cardiovascular (heart): ellipse cx=90 cy=115 rx=18 ry=16
- Liver: ellipse cx=107 cy=135 rx=14 ry=12
- Kidney (pair): ellipse cx=82 cy=158 rx=9 ry=11 + ellipse cx=118 cy=158 rx=9 ry=11
- Metabolic (stomach/pancreas): ellipse cx=100 cy=165 rx=18 ry=12
- Blood (general): apply a 0.15 opacity tint to entire torso

Each organ `<g>` group:
- `onClick={() => onSystemClick(system)}`
- `cursor="pointer"`
- hover: use CSS `opacity: 0.8` on hover via className
- active system gets a 2px white stroke ring

---

## MarkerCard Component (`src/components/decode/MarkerCard.tsx`)

Props:
```typescript
interface MarkerCardProps {
  marker: LabMarker;
}
```

Layout:
```
┌─────────────────────────────────────────────┐
│ ● STATUS_DOT  MARKER NAME        [BADGE]    │
│              Your value: X unit             │
│              Reference: range               │
│              Plain English explanation text │
└─────────────────────────────────────────────┘
```

Status dot colors: green/amber/red
Badge: "Normal" / "Borderline" / "Flagged" pill
Plain English: `text-sm text-gray-600 mt-2 leading-relaxed`

---

## DoctorQuestions Component (`src/components/decode/DoctorQuestions.tsx`)

Shared between prep results and decode results.

Props:
```typescript
interface DoctorQuestionsProps {
  questions: string[];
  title?: string;
}
```

Layout:
- Section title (default: "Questions to ask your doctor")
- Each question in a card with left teal border accent
- Quote icon (Lucide `Quote`)
- Copy All button at top right → copies all questions as numbered list

---

## Disclaimer Component (`src/components/layout/Disclaimer.tsx`)

```
⚠️ VisitReady is an educational tool, not a medical device. It does not
diagnose, treat, or replace advice from a licensed healthcare provider.
Always discuss your results with your doctor.
```

Style: `text-xs text-gray-400 text-center mt-8 px-4`

---

## Header Component (`src/components/layout/Header.tsx`)

- Logo: "VisitReady" with teal dot or pulse icon
- Nav links (desktop): Home / Prep / Decode
- Mobile: hamburger menu
- Sticky top, white bg, subtle border bottom

---

## Build Order for Claude Code

Execute in this exact order:

1. `npx create-next-app@latest visitready --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
2. Install dependencies:
   ```bash
   npm install @anthropic-ai/sdk lucide-react
   npx shadcn@latest init
   npx shadcn@latest add button card badge input textarea select label slider
   ```
3. Create `.env.local` with API key
4. Create `src/lib/types.ts`
5. Create `src/lib/anthropic.ts`
6. Create `src/lib/prompts.ts`
7. Create `src/lib/session.ts`
8. Create `tailwind.config.ts` with custom colors
9. Create `src/app/globals.css`
10. Create `src/components/layout/Header.tsx`
11. Create `src/components/layout/Disclaimer.tsx`
12. Create `src/app/layout.tsx`
13. Create `src/app/page.tsx` (landing)
14. Create `src/app/api/prep/route.ts`
15. Create `src/app/api/decode/route.ts`
16. Create `src/components/prep/IntakeForm.tsx`
17. Create `src/app/prep/page.tsx`
18. Create `src/components/prep/PanelResults.tsx`
19. Create `src/app/prep/results/page.tsx`
20. Create `src/components/decode/BodyMap.tsx`
21. Create `src/components/decode/MarkerCard.tsx`
22. Create `src/components/decode/DoctorQuestions.tsx`
23. Create `src/components/decode/LabInput.tsx`
24. Create `src/app/decode/page.tsx`
25. Create `src/app/decode/results/page.tsx`
26. Create `README.md`
27. Run `npm run dev` and verify all routes load
28. Test Mode 1 full flow with sample profile
29. Test Mode 2 with sample lab report text
30. Test Mode 2 with profile context (Path A)
31. Fix any TypeScript errors
32. Run `npm run build` — must have zero errors before done

---

## README.md Structure

The README must include (for hackathon submission):
1. Project name + tagline
2. Problem being solved
3. Innovation approach (the pre-visit angle + profile-context decode)
4. Tech stack list
5. Architecture overview (brief)
6. Setup instructions (clone → env → npm install → dev)
7. How to use (Mode 1 flow, Mode 2 flow, Path A flow)
8. Scalability potential
9. Future roadmap
10. Medical disclaimer

---

## Sample Lab Report (for testing Mode 2)

Use this as the default text in the Lab Input textarea placeholder / "Use sample" button:

```
PATIENT: Test User, M  DOB: 1990-03-14
ORDERING PHYSICIAN: Dr. Sarah Nguyen
SPECIMEN COLLECTED: 2026-04-28   REPORTED: 2026-04-29

=== COMPLETE BLOOD COUNT (CBC) ===
WBC           7.2    x10^3/uL    [4.0 - 11.0]   NORMAL
RBC           4.85   x10^6/uL    [4.20 - 5.80]  NORMAL
Hemoglobin    14.2   g/dL        [13.5 - 17.5]  NORMAL
Hematocrit    42.1   %           [38.8 - 50.0]  NORMAL
Platelets     210    x10^3/uL    [150 - 400]    NORMAL

=== COMPREHENSIVE METABOLIC PANEL ===
Glucose       112    mg/dL       [70 - 99]      HIGH
Creatinine    0.95   mg/dL       [0.74 - 1.35]  NORMAL
BUN           18     mg/dL       [7 - 25]       NORMAL
eGFR          88     mL/min      [>60]          NORMAL
ALT           52     U/L         [7 - 40]       HIGH
AST           31     U/L         [10 - 40]      NORMAL
Bilirubin     0.7    mg/dL       [0.2 - 1.2]    NORMAL

=== LIPID PANEL ===
Total Cholesterol   218    mg/dL    [<200]        BORDERLINE HIGH
LDL Cholesterol     145    mg/dL    [<100]        HIGH
HDL Cholesterol     48     mg/dL    [>40]         NORMAL
Triglycerides       172    mg/dL    [<150]        BORDERLINE HIGH

=== THYROID ===
TSH           2.1    uIU/mL      [0.4 - 4.0]    NORMAL

=== VITAMINS ===
Vitamin D     18     ng/mL       [30 - 100]     LOW
Vitamin B12   410    pg/mL       [200 - 900]    NORMAL
Ferritin      22     ng/mL       [24 - 336]     LOW
```

---

## Submission Checklist (complete before May 14, 5pm EDT)

- [ ] App deployed and live on Vercel
- [ ] All three paths work (Mode 1, Mode 2 standalone, Mode 2 with context)
- [ ] Mobile responsive
- [ ] Medical disclaimer visible on all health pages
- [ ] GitHub repo public with complete README
- [ ] Demo video recorded (2–3 min, shows both modes)
- [ ] Devpost project page filled out (problem, approach, tech stack, live link, video, repo)
- [ ] ANTHROPIC_API_KEY set in Vercel environment variables
