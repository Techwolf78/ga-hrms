import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "deep" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1F8476]/30 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-10",
      lg: "text-base px-6 py-2.5 gap-2.5 h-12 font-semibold",
    };

    const variantStyles = {
      primary:
        "bg-[#A3E635] text-[#111312] font-bold hover:bg-[#BEF264] active:bg-[#BEF264] shadow-[0_4px_16px_rgba(163,230,53,0.35)]",
      secondary:
        "bg-[#111312] text-white hover:bg-[#232725] active:bg-[#232725] shadow-xs",
      deep:
        "bg-[#0D0F0E] text-white hover:bg-[#1A1D1B] shadow-xs",
      outline:
        "border border-[#E6E8EC] bg-white text-[#111312] hover:bg-[#F7F8FA] hover:border-[#A3E635]/60 hover:text-[#111312]",
      ghost:
        "text-[#111312] hover:bg-[#ECFCCB]/60 hover:text-[#111312]",
      danger:
        "bg-[#E11D48] text-white hover:bg-[#BE123C] shadow-xs",
      success:
        "bg-[#15803D] text-white hover:bg-[#166534] shadow-xs",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
