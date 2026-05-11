"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, FlaskConical } from "lucide-react";
import { hasProfile, loadProfile } from "@/lib/session";
import type { DecodeResult } from "@/lib/types";

const SAMPLE_LAB_REPORT = `PATIENT: Test User, M  DOB: 1990-03-14
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
Ferritin      22     ng/mL       [24 - 336]     LOW`;

interface LabInputProps {
  useContext: boolean | null;
  onContextChoice: (choice: boolean) => void;
}

export function LabInput({ useContext, onContextChoice }: LabInputProps) {
  const router = useRouter();
  const [labText, setLabText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profileExists = hasProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (labText.trim().length < 50) {
      setError("Please paste at least 50 characters of your lab report.");
      return;
    }

    setLoading(true);
    try {
      const finalProfile =
        useContext === true ? loadProfile() ?? undefined : undefined;

      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labText, profile: finalProfile }),
      });

      if (!res.ok) throw new Error("API error");

      const result: DecodeResult = await res.json();
      sessionStorage.setItem("visitready_decode_result", JSON.stringify(result));
      router.push("/decode/results");
    } catch {
      setError("Failed to decode lab report. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile context banner */}
      {profileExists && useContext === null && (
        <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5 space-y-3">
          <p className="text-sm text-teal-800 font-medium">
            We have your health profile from your pre-visit prep. Use it for a more
            personalized interpretation?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onContextChoice(true)}
              className="text-sm px-4 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
            >
              Use my profile
            </button>
            <button
              type="button"
              onClick={() => onContextChoice(false)}
              className="text-sm px-4 py-2 rounded-xl border border-teal-200 text-teal-700 font-medium hover:bg-teal-50 transition-colors"
            >
              Skip — decode without context
            </button>
          </div>
        </div>
      )}

      {useContext === true && (
        <div className="rounded-xl bg-teal-50 border border-teal-100 px-4 py-2.5 text-sm text-teal-700 font-medium">
          Using your health profile for personalized interpretation
        </div>
      )}

      {/* Textarea */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="labText">
          Paste your lab report
        </label>
        <p className="text-xs text-gray-400">
          Copy the text from your patient portal (MyChart, LabCorp, Quest, etc.)
        </p>
        <textarea
          id="labText"
          value={labText}
          onChange={(e) => setLabText(e.target.value)}
          rows={14}
          placeholder={`PATIENT: Jane Doe\nGlucose: 112 mg/dL [70-99] HIGH\nHemoglobin: 14.2 g/dL [12.0-16.0] NORMAL\n…`}
          className="w-full rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 p-4 text-sm font-mono text-gray-700 resize-y outline-none transition-shadow"
        />
        <p className="text-xs text-gray-400 text-right">{labText.length} characters</p>
      </div>

      {/* Sample button */}
      <button
        type="button"
        onClick={() => setLabText(SAMPLE_LAB_REPORT)}
        className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
      >
        <FlaskConical className="w-4 h-4" />
        Use sample report
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-3 font-medium w-full sm:w-auto"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Reading your report…
          </span>
        ) : (
          "Decode My Results →"
        )}
      </Button>
    </form>
  );
}
