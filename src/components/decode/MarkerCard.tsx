import type { LabMarker, MarkerStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  MarkerStatus,
  { dot: string; badge: string; label: string }
> = {
  normal: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700",
    label: "Normal",
  },
  borderline: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
    label: "Borderline",
  },
  flagged: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700",
    label: "Flagged",
  },
};

interface MarkerCardProps {
  marker: LabMarker;
}

export function MarkerCard({ marker }: MarkerCardProps) {
  const cfg = STATUS_CONFIG[marker.status];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${cfg.dot}`} />
          <span className="font-semibold text-gray-900 text-sm">{marker.name}</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <div className="ml-4.5 space-y-0.5 text-xs text-gray-500">
        <p>
          <span className="font-medium text-gray-700">
            {marker.value} {marker.unit}
          </span>
        </p>
        <p>Reference: {marker.referenceRange}</p>
      </div>

      <p className="ml-4.5 text-sm text-gray-600 leading-relaxed">{marker.plainEnglish}</p>
    </div>
  );
}
