import React from "react";
import { cn } from "../../lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "group bg-white rounded-3xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:border-[#A3E635]/60 hover:shadow-[0_8px_24px_rgba(17,19,18,0.06)] transition-[border-color,box-shadow] duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-4 py-3 border-b border-[#EDF1F6] flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-[#032D42] tracking-tight group-hover:text-[#1F8476] transition-colors", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-[#4B5D6B] mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-4 py-2.5 border-t border-[#EDF1F6] flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}
