import type { UserProfile } from "./types";

const STORAGE_KEY = "modubokji_profile";
const CONSENT_KEY = "modubokji_consent";

export const DEFAULT_PROFILE: UserProfile = {
  age: null,
  income_bracket: null,
  household_type: "",
  region: "",
  disabilities: [],
  life_situations: [],
  current_benefits: [],
};

function isLocalStorageAvailable(): boolean {
  try {
    const test = "__modubokji_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  if (!isLocalStorageAvailable()) return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserProfile;
  } catch {
    return null;
  }
}

export function clearProfile(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasConsent(): boolean {
  if (!isLocalStorageAvailable()) return false;
  return localStorage.getItem(CONSENT_KEY) === "true";
}

export function setConsent(value: boolean): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(CONSENT_KEY, value ? "true" : "false");
}
