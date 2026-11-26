import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  accentColor?: "purple" | "cyan" | "emerald" | "amber" | "rose" | "blue" | "neutral" | "indigo";
  onClick?: () => void;
  className?: string;
}

export function KpiCard({
  label,
  value,
  icon,
  trend,
  subtitle,
  onClick,
  className,
}: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-white rounded-3xl border border-[#E6E8EC] p-3.5 sm:p-4 shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:border-[#A3E635]/60 hover:shadow-[0_8px_24px_rgba(17,19,18,0.06)] transition-[border-color,box-shadow] duration-150",
        onClick && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#68707D] group-hover:text-[#111312] transition-colors">
            {label}
          </p>
          <div className="text-2xl sm:text-[26px] font-bold text-[#111312] tracking-tight leading-tight">
            {value}
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#ECFCCB] text-[#3F6212] border border-[#D9F99D] flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-[#111312] group-hover:text-[#A3E635] group-hover:border-[#111312]">
          {icon}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 pt-3 border-t border-[#EDF1F6] flex items-center justify-between gap-2 text-xs text-[#4B5D6B]">
          {trend && (
            <div className="flex items-center gap-1.5 font-medium shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold",
                  trend.isPositive
                    ? "bg-[#E6F4EA] text-[#188038]"
                    : "bg-[#FCE8E6] text-[#C62828]"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {trend.value}
              </span>
              {trend.label && <span className="text-[#697586] text-[11px] hidden sm:inline">{trend.label}</span>}
            </div>
          )}
          {subtitle && (
            <span
              className="text-[#697586] truncate text-[11px] sm:text-xs text-right ml-auto"
              title={subtitle}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
