import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "purple"
    | "cyan"
    | "neutral"
    | "outline"
    | "lime"
    | "remediated";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1 font-medium",
  };

  const variantStyles = {
    default: "bg-[#F0F4F8] text-[#4B5D6B] border border-[#DDE3EA]",
    success: "bg-[#E6F4EA] text-[#188038] border border-[#CEEAD6] font-semibold",
    remediated: "bg-[#E6F4EA] text-[#188038] border border-[#CEEAD6] font-bold tracking-wider uppercase text-[10px]",
    lime: "bg-[#ECFCCB] text-[#3F6212] border border-[#D9F99D] font-bold",
    warning: "bg-[#FEF7E0] text-[#1B2430] border border-[#FEEFC3] font-medium", // Dark text on warning
    danger: "bg-[#FCE8E6] text-[#C62828] border border-[#FAD2CF] font-medium",
    purple: "bg-[#EDE7F6] text-[#5E35B1] border border-[#D1C4E9] font-medium",
    cyan: "bg-[#E0F2F1] text-[#1F8476] border border-[#B2DFDB] font-medium",
    neutral: "bg-[#F7F9FB] text-[#697586] border border-[#DDE3EA]",
    outline: "bg-transparent text-[#1B2430] border border-[#DDE3EA]",
  };

  const dotColors = {
    default: "bg-[#80B6A1]",
    success: "bg-[#188038]",
    remediated: "bg-[#188038]",
    lime: "bg-[#62D84E]",
    warning: "bg-[#E69F00]",
    danger: "bg-[#C62828]",
    purple: "bg-[#5E35B1]",
    cyan: "bg-[#1F8476]",
    neutral: "bg-[#697586]",
    outline: "bg-[#80B6A1]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
}
