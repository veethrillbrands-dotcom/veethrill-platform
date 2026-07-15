import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  accentColor?: string;
  icon?: React.ReactNode;
  sparkline?: number[];
  onClick?: () => void;
}

export function KPICard({ label, value, change, changeLabel, accentColor = "var(--gold)", icon, sparkline, onClick }: KPICardProps) {
  const isUp = (change ?? 0) >= 0;

  const toSvgPoints = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 80, h = 24;
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div
      onClick={onClick}
      className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden", onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all")}
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }} />

      {/* Icon */}
      {icon && (
        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center opacity-85"
          style={{ background: `${accentColor}18` }}>
          {icon}
        </div>
      )}

      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.5px] mb-2">{label}</div>
      <div className="text-[26px] font-black text-gray-900 leading-none mb-2">{value}</div>

      {(change !== undefined || changeLabel) && (
        <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full", isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
          {change !== undefined && (isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />)}
          {change !== undefined ? `${isUp ? "+" : ""}${change}%` : changeLabel}
        </span>
      )}

      {sparkline && sparkline.length > 1 && (
        <svg viewBox={`0 0 80 24`} width="80" height="24" className="mt-2.5" preserveAspectRatio="none">
          <polyline
            points={toSvgPoints(sparkline) + ` 80,24 0,24`}
            fill={`${accentColor}12`}
            stroke="none"
          />
          <polyline
            points={toSvgPoints(sparkline)}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
