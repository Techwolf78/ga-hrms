import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "lg",
}: DrawerProps) {
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

  const widthClasses = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={cn(
            "w-screen bg-white shadow-2xl border-l border-[#DDE3EA] flex flex-col animate-slide-right",
            widthClasses[width],
          )}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#DDE3EA] flex items-center justify-between bg-[#F7F9FB]">
            <div>
              {typeof title === "string" ? (
                <h3 className="text-lg font-semibold text-[#1B2430] tracking-tight">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-xs text-[#697586] mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#697586] hover:text-[#1B2430] p-2 rounded-lg hover:bg-[#DDE3EA]/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-[#DDE3EA] bg-[#F7F9FB] flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
