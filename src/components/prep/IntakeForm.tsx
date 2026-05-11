"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveProfile, savePrepResult } from "@/lib/session";
import type { UserProfile, PrepResult } from "@/lib/types";
import { Loader2 } from "lucide-react";

const CONDITIONS = [
  "Diabetes/pre-diabetes",
  "High blood pressure",
  "Thyroid disorder",
  "Heart disease",
  "Anemia",
  "Kidney disease",
  "Liver disease",
  "None of the above",
];

const SYMPTOMS = [
  "Fatigue/low energy",
  "Brain fog",
  "Unexplained weight change",
  "Hair loss",
  "Frequent illness",
  "Joint/muscle pain",
  "Mood changes",
  "None",
];

const FAMILY_HISTORY = [
  "Heart disease",
  "Diabetes",
  "Cancer (any)",
  "Thyroid disorder",
  "Stroke",
  "None of the above",
];

const EXERCISE_OPTIONS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light (1-2x/week)" },
  { value: "moderate", label: "Moderate (3-4x/week)" },
  { value: "active", label: "Active (5+/week)" },
] as const;

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-700">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function IntakeForm() {
  const router = useRouter();

  const [age, setAge] = useState("");
  const [sex, setSex] = useState<UserProfile["sex"] | "">("");
  const [lastBloodwork, setLastBloodwork] = useState<
    UserProfile["lastBloodwork"] | ""
  >("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [exerciseFrequency, setExerciseFrequency] = useState<
    UserProfile["exerciseFrequency"] | ""
  >("");
  const [dietQuality, setDietQuality] = useState(3);
  const [alcoholUse, setAlcoholUse] = useState<UserProfile["alcoholUse"] | "">(
    ""
  );
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      setError("Please enter a valid age between 18 and 120.");
      return;
    }
    if (!sex) { setError("Please select a biological sex."); return; }
    if (!lastBloodwork) { setError("Please select your last bloodwork date."); return; }
    if (!exerciseFrequency) { setError("Please select your exercise frequency."); return; }
    if (!alcoholUse) { setError("Please select your alcohol use."); return; }

    const profile: UserProfile = {
      age: ageNum,
      sex,
      lastBloodwork,
      conditions: conditions.filter((c) => c !== "None of the above"),
      symptoms: symptoms.filter((s) => s !== "None"),
      sleepQuality,
      exerciseFrequency,
      dietQuality,
      alcoholUse,
      familyHistory: familyHistory.filter((f) => f !== "None of the above"),
    };

    setLoading(true);
    try {
      saveProfile(profile);
      const res = await fetch("/api/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("API error");

      const result: PrepResult = await res.json();
      savePrepResult(result);
      router.push("/prep/results");
    } catch {
      setError("Failed to generate recommendations. Please try again.");
      setLoading(false);
    }
  };

  const sliderLabel = (v: number) =>
    ["", "Poor", "Fair", "Average", "Good", "Excellent"][v] ?? "";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      {/* Age */}
      <div className="space-y-1.5">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          min={18}
          max={120}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g. 34"
          className="rounded-xl border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 w-40"
          required
        />
      </div>

      {/* Sex */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Biological sex</legend>
        <div className="flex gap-4">
          {(["male", "female", "other"] as const).map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
              <input
                type="radio"
                name="sex"
                value={s}
                checked={sex === s}
                onChange={() => setSex(s)}
                className="text-teal-600 focus:ring-teal-500"
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Last bloodwork */}
      <div className="space-y-1.5">
        <Label>Last bloodwork</Label>
        <Select value={lastBloodwork} onValueChange={(v) => setLastBloodwork(v as UserProfile["lastBloodwork"])}>
          <SelectTrigger className="rounded-xl w-64">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Never</SelectItem>
            <SelectItem value="over_2_years">Over 2 years ago</SelectItem>
            <SelectItem value="1_2_years">1–2 years ago</SelectItem>
            <SelectItem value="within_year">Within the past year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditions */}
      <CheckboxGroup
        label="Known conditions (select all that apply)"
        options={CONDITIONS}
        selected={conditions}
        onChange={setConditions}
      />

      {/* Symptoms */}
      <CheckboxGroup
        label="Current symptoms (select all that apply)"
        options={SYMPTOMS}
        selected={symptoms}
        onChange={setSymptoms}
      />

      {/* Sleep quality */}
      <div className="space-y-2">
        <Label>
          Sleep quality —{" "}
          <span className="font-normal text-teal-600">{sliderLabel(sleepQuality)}</span>
        </Label>
        <Slider
          min={1}
          max={5}
          step={1}
          value={[sleepQuality]}
          onValueChange={(v) => setSleepQuality(Array.isArray(v) ? v[0] : v)}
          className="max-w-xs"
        />
        <div className="flex justify-between text-xs text-gray-400 max-w-xs">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Exercise frequency */}
      <div className="space-y-2">
        <Label>Exercise frequency</Label>
        <div className="flex flex-wrap gap-2">
          {EXERCISE_OPTIONS.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => setExerciseFrequency(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                exerciseFrequency === value
                  ? "bg-teal-600 text-white border-teal-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Diet quality */}
      <div className="space-y-2">
        <Label>
          Diet quality —{" "}
          <span className="font-normal text-teal-600">{sliderLabel(dietQuality)}</span>
        </Label>
        <Slider
          min={1}
          max={5}
          step={1}
          value={[dietQuality]}
          onValueChange={(v) => setDietQuality(Array.isArray(v) ? v[0] : v)}
          className="max-w-xs"
        />
        <div className="flex justify-between text-xs text-gray-400 max-w-xs">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Alcohol use */}
      <div className="space-y-1.5">
        <Label>Alcohol use</Label>
        <Select value={alcoholUse} onValueChange={(v) => setAlcoholUse(v as UserProfile["alcoholUse"])}>
          <SelectTrigger className="rounded-xl w-64">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="occasional">Occasional (weekends)</SelectItem>
            <SelectItem value="regular">Regular (few times/week)</SelectItem>
            <SelectItem value="heavy">Heavy (daily)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Family history */}
      <CheckboxGroup
        label="Family history (select all that apply)"
        options={FAMILY_HISTORY}
        selected={familyHistory}
        onChange={setFamilyHistory}
      />

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
            Analyzing your profile…
          </span>
        ) : (
          "Generate My Recommendations →"
        )}
      </Button>
    </form>
  );
}
