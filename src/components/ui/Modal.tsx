import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  className?: string;
  bodyClassName?: string;
  containerClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  bodyClassName,
  containerClassName,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-5xl",
    "3xl": "max-w-6xl",
    "4xl": "max-w-7xl",
    full: "max-w-[96vw] w-[96vw]",
  };

  return createPortal(
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto", containerClassName)}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative w-full bg-white rounded-card shadow-elevated border border-surface-border overflow-hidden z-10 animate-scale-in my-8 flex flex-col max-h-[92vh]",
          sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b border-[#DDE3EA] flex items-start justify-between bg-[#F7F9FB] shrink-0">
            <div>
              {typeof title === "string" ? (
                <h3 className="text-lg font-semibold text-[#1B2430] tracking-tight">
                  {title}
                </h3>
              ) : (
                title
              )}
              {description && (
                <p className="text-xs text-[#697586] mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#697586] hover:text-[#1B2430] p-1.5 rounded-lg hover:bg-[#DDE3EA]/40 transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn("p-6 overflow-y-auto flex-1 min-h-0", bodyClassName)}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#DDE3EA] bg-[#F7F9FB] flex items-center justify-end gap-3 rounded-b-card shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
