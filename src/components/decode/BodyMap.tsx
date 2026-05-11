"use client";

import type { BodySystem, MarkerStatus } from "@/lib/types";

function systemColor(status: MarkerStatus | null): string {
  if (status === "flagged") return "#dc2626";
  if (status === "borderline") return "#d97706";
  if (status === "normal") return "#16a34a";
  return "#d1d5db";
}

interface BodyMapProps {
  systemStatuses: Record<BodySystem, MarkerStatus | null>;
  onSystemClick: (system: BodySystem) => void;
  activeSystem?: BodySystem;
}

interface OrganProps {
  system: BodySystem;
  status: MarkerStatus | null;
  active: boolean;
  onSystemClick: (s: BodySystem) => void;
  children: React.ReactNode;
  label: string;
}

function Organ({ system, status, active, onSystemClick, children, label }: OrganProps) {
  return (
    <g
      onClick={() => onSystemClick(system)}
      style={{ cursor: "pointer" }}
      opacity={active ? 1 : 0.85}
      role="button"
      aria-label={`${label} — ${status ?? "no data"}`}
    >
      <title>{label}</title>
      <g
        fill={systemColor(status)}
        fillOpacity={0.75}
        stroke={active ? "#ffffff" : "none"}
        strokeWidth={active ? 2 : 0}
      >
        {children}
      </g>
    </g>
  );
}

export function BodyMap({ systemStatuses, onSystemClick, activeSystem }: BodyMapProps) {
  const BODY_FILL = "#e5e7eb";

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 380"
        width="220"
        height="418"
        aria-label="Interactive body map showing organ systems by test result status"
      >
        {/* Body silhouette */}
        <g fill={BODY_FILL}>
          {/* Head */}
          <ellipse cx="100" cy="35" rx="28" ry="32" />
          {/* Neck */}
          <rect x="88" y="65" width="24" height="25" rx="4" />
          {/* Torso */}
          <rect x="60" y="88" width="80" height="110" rx="12" />
          {/* Left arm */}
          <rect x="30" y="90" width="28" height="85" rx="10" />
          {/* Right arm */}
          <rect x="142" y="90" width="28" height="85" rx="10" />
          {/* Hips */}
          <rect x="60" y="195" width="80" height="40" rx="8" />
          {/* Left leg */}
          <rect x="62" y="232" width="32" height="110" rx="10" />
          {/* Right leg */}
          <rect x="106" y="232" width="32" height="110" rx="10" />
        </g>

        {/* Organ overlays */}

        {/* Thyroid */}
        <Organ
          system="thyroid"
          status={systemStatuses.thyroid}
          active={activeSystem === "thyroid"}
          onSystemClick={onSystemClick}
          label="Thyroid"
        >
          <ellipse cx="100" cy="76" rx="12" ry="8" />
        </Organ>

        {/* Cardiovascular (heart) */}
        <Organ
          system="cardiovascular"
          status={systemStatuses.cardiovascular}
          active={activeSystem === "cardiovascular"}
          onSystemClick={onSystemClick}
          label="Cardiovascular"
        >
          <ellipse cx="90" cy="115" rx="18" ry="16" />
        </Organ>

        {/* Liver */}
        <Organ
          system="liver"
          status={systemStatuses.liver}
          active={activeSystem === "liver"}
          onSystemClick={onSystemClick}
          label="Liver"
        >
          <ellipse cx="107" cy="135" rx="14" ry="12" />
        </Organ>

        {/* Kidneys */}
        <Organ
          system="kidney"
          status={systemStatuses.kidney}
          active={activeSystem === "kidney"}
          onSystemClick={onSystemClick}
          label="Kidneys"
        >
          <ellipse cx="82" cy="158" rx="9" ry="11" />
          <ellipse cx="118" cy="158" rx="9" ry="11" />
        </Organ>

        {/* Metabolic (stomach/pancreas) */}
        <Organ
          system="metabolic"
          status={systemStatuses.metabolic}
          active={activeSystem === "metabolic"}
          onSystemClick={onSystemClick}
          label="Metabolic"
        >
          <ellipse cx="100" cy="165" rx="18" ry="12" />
        </Organ>

        {/* Blood — full-torso tint */}
        <Organ
          system="blood"
          status={systemStatuses.blood}
          active={activeSystem === "blood"}
          onSystemClick={onSystemClick}
          label="Blood"
        >
          <rect x="60" y="88" width="80" height="110" rx="12" fillOpacity={0.15} />
        </Organ>

        {/* Vitamins — indicator below body */}
      </svg>

      {/* Vitamins indicator (separate from silhouette) */}
      <button
        type="button"
        onClick={() => onSystemClick("vitamins")}
        className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
        style={{
          backgroundColor:
            systemStatuses.vitamins
              ? systemColor(systemStatuses.vitamins) + "22"
              : "#f3f4f6",
          borderColor:
            systemStatuses.vitamins
              ? systemColor(systemStatuses.vitamins)
              : "#d1d5db",
          color:
            systemStatuses.vitamins
              ? systemColor(systemStatuses.vitamins)
              : "#6b7280",
          outline: activeSystem === "vitamins" ? "2px solid #0d9488" : "none",
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: systemColor(systemStatuses.vitamins),
          }}
        />
        Vitamins &amp; Nutrients
      </button>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          Normal
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          Borderline
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          Flagged
        </span>
      </div>
    </div>
  );
}
