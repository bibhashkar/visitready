import type { LabMarker, MarkerStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  MarkerStatus,
  { borderColor: string; bg: string; badge: string; label: string; valueColor: string }
> = {
  normal: {
    borderColor: "#16a34a",
    bg: "#f0fdf4",
    badge: "bg-green-100 text-green-700",
    label: "Normal",
    valueColor: "#15803d",
  },
  borderline: {
    borderColor: "#d97706",
    bg: "#fffbeb",
    badge: "bg-amber-100 text-amber-700",
    label: "Borderline",
    valueColor: "#b45309",
  },
  flagged: {
    borderColor: "#dc2626",
    bg: "#fef2f2",
    badge: "bg-red-100 text-red-700",
    label: "Flagged",
    valueColor: "#b91c1c",
  },
};

interface MarkerCardProps {
  marker: LabMarker;
}

export function MarkerCard({ marker }: MarkerCardProps) {
  const cfg = STATUS_CONFIG[marker.status];

  return (
    <div
      className="rounded-2xl border border-transparent shadow-sm overflow-hidden"
      style={{ backgroundColor: cfg.bg, borderLeftColor: cfg.borderColor, borderLeftWidth: 4 }}
    >
      <div className="px-5 py-4 space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-gray-900 text-sm">{marker.name}</span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* Value row */}
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold" style={{ color: cfg.valueColor }}>
            {marker.value}
          </span>
          <span className="text-sm text-gray-500">{marker.unit}</span>
          <span className="text-xs text-gray-400 ml-auto">
            Ref: {marker.referenceRange}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-black/5" />

        {/* Plain English */}
        <p className="text-sm text-gray-700 leading-relaxed">{marker.plainEnglish}</p>
      </div>
    </div>
  );
}
