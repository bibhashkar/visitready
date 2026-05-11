"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, AlertCircle, CheckCircle2, FlaskConical } from "lucide-react";
import { BodyMap } from "@/components/decode/BodyMap";
import { MarkerCard } from "@/components/decode/MarkerCard";
import { DoctorQuestions } from "@/components/decode/DoctorQuestions";
import { Disclaimer } from "@/components/layout/Disclaimer";
import type { DecodeResult, BodySystem, MarkerStatus } from "@/lib/types";

const SYSTEM_LABELS: Record<BodySystem, string> = {
  cardiovascular: "Cardiovascular",
  metabolic: "Metabolic",
  liver: "Liver",
  kidney: "Kidney",
  blood: "Blood",
  thyroid: "Thyroid",
  vitamins: "Vitamins & Nutrients",
  other: "Other",
};

function worstStatus(statuses: MarkerStatus[]): MarkerStatus | null {
  if (statuses.includes("flagged")) return "flagged";
  if (statuses.includes("borderline")) return "borderline";
  if (statuses.includes("normal")) return "normal";
  return null;
}

interface StatCardProps {
  label: string;
  value: number;
  total?: number;
  icon: React.ReactNode;
  bg: string;
  valueColor: string;
  barColor?: string;
}

function StatCard({ label, value, total, icon, bg, valueColor, barColor }: StatCardProps) {
  const pct = total && total > 0 ? Math.round((value / total) * 100) : null;
  return (
    <div className={`rounded-2xl border border-transparent p-4 shadow-sm flex flex-col gap-2 ${bg}`}>
      <div className="flex items-center justify-between">
        {icon}
        {pct !== null && (
          <span className="text-xs font-medium" style={{ color: valueColor }}>
            {pct}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold`} style={{ color: valueColor }}>{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {pct !== null && barColor && (
        <div className="h-1 rounded-full bg-black/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      )}
    </div>
  );
}

export default function DecodeResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [activeSystem, setActiveSystem] = useState<BodySystem | undefined>();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("visitready_decode_result");
    if (!raw) {
      router.replace("/decode");
      return;
    }
    try {
      setResult(JSON.parse(raw) as DecodeResult);
    } catch {
      router.replace("/decode");
    }
  }, [router]);

  if (!result) return null;

  // Build system statuses map
  const ALL_SYSTEMS: BodySystem[] = [
    "cardiovascular",
    "metabolic",
    "liver",
    "kidney",
    "blood",
    "thyroid",
    "vitamins",
    "other",
  ];

  const systemStatuses = Object.fromEntries(
    ALL_SYSTEMS.map((sys) => {
      const systemMarkers = result.markers.filter((m) => m.system === sys);
      return [sys, worstStatus(systemMarkers.map((m) => m.status))];
    })
  ) as Record<BodySystem, MarkerStatus | null>;

  const groupedMarkers = ALL_SYSTEMS.map((sys) => ({
    system: sys,
    markers: result.markers.filter((m) => m.system === sys),
  })).filter((g) => g.markers.length > 0);

  const handleSystemClick = (system: BodySystem) => {
    setActiveSystem(system);
    const el = sectionRefs.current[system];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-600">
          Results Decoder
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Your lab results explained
        </h1>
        {result.contextUsed && (
          <span className="inline-block text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
            Personalized interpretation — based on your health profile
          </span>
        )}
      </div>

      {/* Missing tests banner */}
      {result.missingTests && result.missingTests.length > 0 && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-100 p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Tests from your profile not found in results:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {result.missingTests.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total markers"
          value={result.summary.totalMarkers}
          icon={<FlaskConical className="w-4 h-4 text-gray-400" />}
          bg="bg-white border-gray-100"
          valueColor="#111827"
        />
        <StatCard
          label="Flagged"
          value={result.summary.flagged}
          total={result.summary.totalMarkers}
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          bg="bg-red-50"
          valueColor="#dc2626"
          barColor="#dc2626"
        />
        <StatCard
          label="Borderline"
          value={result.summary.borderline}
          total={result.summary.totalMarkers}
          icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
          bg="bg-amber-50"
          valueColor="#d97706"
          barColor="#d97706"
        />
        <StatCard
          label="Normal"
          value={result.summary.normal}
          total={result.summary.totalMarkers}
          icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
          bg="bg-green-50"
          valueColor="#16a34a"
          barColor="#16a34a"
        />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Body map (sticky on desktop) */}
        <aside className="lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-20">
            <BodyMap
              systemStatuses={systemStatuses}
              onSystemClick={handleSystemClick}
              activeSystem={activeSystem}
            />
          </div>
        </aside>

        {/* Right: Marker cards */}
        <div className="flex-1 space-y-10">
          {groupedMarkers.map(({ system, markers }) => (
            <section
              key={system}
              ref={(el) => { sectionRefs.current[system] = el; }}
              className="space-y-3 scroll-mt-20"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  {SYSTEM_LABELS[system]}
                </h2>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              {markers.map((marker, i) => (
                <MarkerCard key={i} marker={marker} />
              ))}
            </section>
          ))}

          {/* Doctor questions */}
          <DoctorQuestions questions={result.doctorQuestions} />

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/prep"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-3 font-medium transition-colors text-sm"
            >
              Prepare for another visit →
            </Link>
            <Link
              href="/decode"
              className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 rounded-xl px-6 py-3 font-medium transition-colors text-sm text-gray-700"
            >
              Decode another report
            </Link>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
