import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#1B2430] uppercase tracking-wider mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#C62828] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#697586] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-10 px-3 py-2 bg-white border border-[#DDE3EA] rounded-input text-sm text-[#1B2430] placeholder:text-[#697586] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1F8476]/20 focus:border-[#1F8476] disabled:bg-[#F7F9FB] disabled:cursor-not-allowed",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-[#C62828] focus:ring-[#C62828]/20 focus:border-[#C62828]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#697586] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#C62828] mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#697586] mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
