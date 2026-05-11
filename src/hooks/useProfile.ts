"use client";

import { useState, useEffect } from "react";
import { loadProfile, saveProfile, hasProfile } from "@/lib/session";
import type { UserProfile } from "@/lib/types";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const loaded = loadProfile();
    setProfile(loaded);
    setProfileExists(hasProfile());
  }, []);

  const updateProfile = (p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
    setProfileExists(true);
  };

  return { profile, profileExists, updateProfile };
}
