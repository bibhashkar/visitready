// ── Mode 1 Types ──────────────────────────────────────────────

export interface UserProfile {
  age: number;
  sex: "male" | "female" | "other";
  lastBloodwork: "never" | "over_2_years" | "1_2_years" | "within_year";
  conditions: string[];
  symptoms: string[];
  sleepQuality: number;
  exerciseFrequency: "sedentary" | "light" | "moderate" | "active";
  dietQuality: number;
  alcoholUse: "none" | "occasional" | "regular" | "heavy";
  familyHistory: string[];
}

export interface RecommendedPanel {
  name: string;
  priority: "essential" | "recommended" | "optional";
  reason: string;
  fasting: boolean;
  system: BodySystem;
}

export interface PrepResult {
  panels: RecommendedPanel[];
  prepInstructions: string[];
  doctorQuestions: string[];
  summary: string;
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
  plainEnglish: string;
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
  contextUsed: boolean;
  missingTests?: string[];
}

// ── Shared ────────────────────────────────────────────────────

export type ApiError = {
  error: string;
  code: "PARSE_ERROR" | "API_ERROR" | "VALIDATION_ERROR";
};
