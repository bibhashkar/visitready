"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadPrepResult, loadProfile } from "@/lib/session";
import { PanelResults } from "@/components/prep/PanelResults";
import { Disclaimer } from "@/components/layout/Disclaimer";
import type { PrepResult, UserProfile } from "@/lib/types";

export default function PrepResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<PrepResult | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const r = loadPrepResult();
    if (!r) {
      router.replace("/prep");
      return;
    }
    setResult(r);
    setProfile(loadProfile());
  }, [router]);

  if (!result) return null;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-10">
      <div className="mb-8 space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-teal-600">
          Pre-Visit Prep · Results
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Your personalized panel
        </h1>
        {profile && (
          <p className="text-sm text-gray-500">
            Based on your profile — age {profile.age}, {profile.sex}
          </p>
        )}
      </div>

      <PanelResults result={result} />
      <Disclaimer />
    </div>
  );
}
