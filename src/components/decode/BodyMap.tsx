"use client";

import type { BodySystem, MarkerStatus } from "@/lib/types";

function systemColor(status: MarkerStatus | null): string {
  if (status === "flagged") return "#dc2626";
  if (status === "borderline") return "#d97706";
  if (status === "normal") return "#16a34a";
  return "#94a3b8";
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
  onClick: (s: BodySystem) => void;
  label: string;
  children: React.ReactNode;
}

function Organ({ system, status, active, onClick, label, children }: OrganProps) {
  const color = systemColor(status);
  return (
    <g
      onClick={() => onClick(system)}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={`${label} — ${status ?? "no data"}`}
    >
      <title>{label}: {status ?? "no data"}</title>
      <g
        fill={color}
        fillOpacity={active ? 0.35 : 0.15}
        stroke={color}
        strokeWidth={active ? 2.5 : 1.8}
        style={{ transition: "fill-opacity 0.15s, stroke-width 0.15s" }}
      >
        {children}
      </g>
    </g>
  );
}

export function BodyMap({ systemStatuses, onSystemClick, activeSystem }: BodyMapProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <svg
        viewBox="0 0 200 370"
        width="190"
        height="352"
        aria-label="Interactive body map"
      >
        <defs>
          <filter id="organ-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Body silhouette ── */}
        {/* Head */}
        <ellipse cx="100" cy="36" rx="26" ry="30"
          fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* Neck — overlaps head bottom + torso top to hide seam */}
        <rect x="89" y="62" width="22" height="20" rx="3"
          fill="#f1f5f9" />
        {/* Torso */}
        <path d="M58,76 Q57,72 64,70 L136,70 Q143,72 142,76 L145,190 Q145,196 138,196 L62,196 Q55,196 55,190 Z"
          fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* Left arm */}
        <path d="M55,82 Q44,84 40,92 L34,172 Q33,178 38,179 L54,179 Q58,179 58,174 L60,96 Z"
          fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* Right arm */}
        <path d="M145,82 Q156,84 160,92 L166,172 Q167,178 162,179 L146,179 Q142,179 142,174 L140,96 Z"
          fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* Hips — overlaps torso bottom */}
        <path d="M58,186 L142,186 L148,212 Q149,218 143,218 L57,218 Q51,218 52,212 Z"
          fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* Left leg */}
        <path d="M57,214 L98,214 L96,355 Q96,361 90,361 L63,361 Q57,361 57,355 Z"
          fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* Right leg */}
        <path d="M102,214 L143,214 L143,355 Q143,361 137,361 L110,361 Q104,361 102,355 Z"
          fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />

        {/* ── Organ indicators ── */}

        {/* Thyroid — neck */}
        <Organ system="thyroid" status={systemStatuses.thyroid}
          active={activeSystem === "thyroid"} onClick={onSystemClick} label="Thyroid">
          <ellipse cx="100" cy="74" rx="11" ry="7" />
        </Organ>

        {/* Cardiovascular — left chest */}
        <Organ system="cardiovascular" status={systemStatuses.cardiovascular}
          active={activeSystem === "cardiovascular"} onClick={onSystemClick} label="Cardiovascular">
          <circle cx="86" cy="110" r="13" />
        </Organ>

        {/* Liver — right upper abdomen */}
        <Organ system="liver" status={systemStatuses.liver}
          active={activeSystem === "liver"} onClick={onSystemClick} label="Liver">
          <ellipse cx="116" cy="124" rx="13" ry="10" />
        </Organ>

        {/* Metabolic — centre abdomen */}
        <Organ system="metabolic" status={systemStatuses.metabolic}
          active={activeSystem === "metabolic"} onClick={onSystemClick} label="Metabolic">
          <ellipse cx="96" cy="152" rx="14" ry="10" />
        </Organ>

        {/* Kidneys — flanks */}
        <Organ system="kidney" status={systemStatuses.kidney}
          active={activeSystem === "kidney"} onClick={onSystemClick} label="Kidneys">
          <ellipse cx="74" cy="158" rx="9" ry="12" />
          <ellipse cx="120" cy="158" rx="9" ry="12" />
        </Organ>

        {/* Blood — full-torso subtle tint strip */}
        <Organ system="blood" status={systemStatuses.blood}
          active={activeSystem === "blood"} onClick={onSystemClick} label="Blood">
          <rect x="58" y="76" width="84" height="112" rx="8" fillOpacity={0.08} strokeWidth={0} />
          {/* small bone-marrow indicator dot */}
          <circle cx="78" cy="260" r="8" />
          <circle cx="122" cy="260" r="8" />
        </Organ>
      </svg>

      {/* Vitamins — pill below body */}
      <button
        type="button"
        onClick={() => onSystemClick("vitamins")}
        className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border-2 transition-all"
        style={{
          borderColor: systemColor(systemStatuses.vitamins),
          color: systemColor(systemStatuses.vitamins),
          backgroundColor: systemStatuses.vitamins
            ? systemColor(systemStatuses.vitamins) + "18"
            : "#f8fafc",
          outline: activeSystem === "vitamins" ? `2px solid ${systemColor(systemStatuses.vitamins)}` : "none",
          outlineOffset: "2px",
        }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: systemColor(systemStatuses.vitamins) }} />
        Vitamins &amp; Nutrients
      </button>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        {(["normal", "borderline", "flagged"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 capitalize">
            <span className="w-2.5 h-2.5 rounded-full border-2"
              style={{ borderColor: systemColor(s), backgroundColor: systemColor(s) + "33" }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
