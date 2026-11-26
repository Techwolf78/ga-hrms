import React from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  showBack = false,
  onBack,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("mb-6 space-y-2", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#697586] mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-[#1F8476] transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#697586] font-medium">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#697586]" />
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="p-2 -ml-2 rounded-lg text-[#697586] hover:text-[#1B2430] hover:bg-[#DDE3EA]/40 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2430] tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-[#697586] mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
