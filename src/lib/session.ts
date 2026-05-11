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
