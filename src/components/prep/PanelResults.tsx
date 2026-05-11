"use client";

import Link from "next/link";
import { Check, Utensils, Coffee } from "lucide-react";
import { DoctorQuestions } from "@/components/decode/DoctorQuestions";
import { clearSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import type { PrepResult, RecommendedPanel } from "@/lib/types";

const PRIORITY_CONFIG = {
  essential: {
    label: "Essential",
    description: "Request these — high priority",
    accent: "border-l-teal-500 bg-teal-50/30",
    badge: "bg-teal-100 text-teal-800",
  },
  recommended: {
    label: "Recommended",
    description: "Good to add while you're there",
    accent: "border-l-blue-500 bg-blue-50/30",
    badge: "bg-blue-100 text-blue-800",
  },
  optional: {
    label: "Optional",
    description: "Discuss with your doctor",
    accent: "border-l-gray-400 bg-gray-50/30",
    badge: "bg-gray-100 text-gray-700",
  },
} as const;

function PanelCard({ panel }: { panel: RecommendedPanel }) {
  const cfg = PRIORITY_CONFIG[panel.priority];
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm border-l-4 ${cfg.accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-gray-900 text-sm">{panel.name}</p>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.badge}`}
        >
          {cfg.label}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-gray-500 italic leading-relaxed">
        {panel.reason}
      </p>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
        {panel.fasting ? (
          <>
            <Utensils className="w-3.5 h-3.5" />
            Requires fasting
          </>
        ) : (
          <>
            <Coffee className="w-3.5 h-3.5" />
            No fasting needed
          </>
        )}
      </div>
    </div>
  );
}

function PanelTier({
  priority,
  panels,
}: {
  priority: "essential" | "recommended" | "optional";
  panels: RecommendedPanel[];
}) {
  const cfg = PRIORITY_CONFIG[priority];
  if (panels.length === 0) return null;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{cfg.label} tests</h2>
        <p className="text-xs text-gray-500">{cfg.description}</p>
      </div>
      <div className="space-y-3">
        {panels.map((p, i) => (
          <PanelCard key={i} panel={p} />
        ))}
      </div>
    </section>
  );
}

interface PanelResultsProps {
  result: PrepResult;
}

export function PanelResults({ result }: PanelResultsProps) {
  const router = useRouter();

  const essential = result.panels.filter((p) => p.priority === "essential");
  const recommended = result.panels.filter((p) => p.priority === "recommended");
  const optional = result.panels.filter((p) => p.priority === "optional");

  const handleStartOver = () => {
    clearSession();
    router.push("/");
  };

  return (
    <div className="space-y-10">
      {/* Summary */}
      <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5">
        <p className="text-sm font-medium text-teal-800 leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Panels by tier */}
      <PanelTier priority="essential" panels={essential} />
      <PanelTier priority="recommended" panels={recommended} />
      <PanelTier priority="optional" panels={optional} />

      {/* Prep instructions */}
      {result.prepInstructions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Day-of instructions</h2>
          <ul className="space-y-2">
            {result.prepInstructions.map((inst, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                {inst}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Doctor questions */}
      <DoctorQuestions questions={result.doctorQuestions} />

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/decode"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-3 font-medium transition-colors text-sm"
        >
          Got my results back? Decode them →
        </Link>
        <button
          onClick={handleStartOver}
          className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 rounded-xl px-6 py-3 font-medium transition-colors text-sm text-gray-700"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
