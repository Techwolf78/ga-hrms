import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { GlobalSearchModal } from "./GlobalSearchModal";

import { useHrms } from "../../lib/hrmsContext";
import { cn } from "../../lib/utils";
import { GaHrmsLogo } from "../ui/GaHrmsLogo";

export interface AppShellProps {
  onOpenAddEmployee?: () => void;
  onOpenApplyLeave?: () => void;
  onOpenAttendanceCorrection?: () => void;
}

export function AppShell({
  onOpenAddEmployee,
  onOpenApplyLeave,
  onOpenAttendanceCorrection,
}: AppShellProps) {
  const { settings } = useHrms();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-bg text-text-primary antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col min-w-0 min-h-screen bg-[#F7F8FA]">
        {/* Ambient Mesh Gradient & Technical Grid Overlay (Dashboard only) */}
        {isDashboard && (
          <div
            className="absolute top-0 inset-x-0 h-[560px] pointer-events-none overflow-hidden z-0"
            style={{ contain: "strict" }}
            aria-hidden="true"
          >
            {/* Signature Lime Glow (Top-Right) */}
            <div
              style={{
                position: "absolute",
                top: "-140px",
                right: "-60px",
                width: "620px",
                height: "480px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 50% 45%, rgba(163, 230, 53, 0.24) 0%, rgba(190, 242, 100, 0.12) 45%, rgba(163, 230, 53, 0) 72%)",
                filter: "blur(75px)",
                WebkitFilter: "blur(75px)",
                transform: "translate3d(0, 0, 0)",
              }}
            />
            {/* Soft Mint Glow (Top-Left) */}
            <div
              style={{
                position: "absolute",
                top: "-100px",
                left: "10%",
                width: "520px",
                height: "360px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(236, 252, 203, 0.75) 0%, rgba(163, 230, 53, 0.10) 50%, transparent 72%)",
                filter: "blur(60px)",
                WebkitFilter: "blur(60px)",
                transform: "translate3d(0, 0, 0)",
              }}
            />
          </div>
        )}

        <Topbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenSearch={() => setSearchModalOpen(true)}
          floatingPill
        />

        <main
          className={cn(
            "relative z-10 flex-1 w-full flex flex-col animate-fade-in transition-all duration-200",
            settings?.compactMode
              ? "p-1.5 sm:p-2"
              : "p-2 sm:p-3"
          )}
        >
          <div className="flex-1">
            <Outlet />
          </div>

          <footer className="mt-4 pt-2.5 pb-1 border-t border-[#DDE3EA]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#697586]">
            <GaHrmsLogo size="xs" variant="light" />
            <span>© 2026 GA-HRMS. All rights reserved.</span>
            <span>Baner, Pune 411045</span>
          </footer>
        </main>
      </div>

      {/* Global Command Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onOpenAddEmployee={onOpenAddEmployee}
        onOpenApplyLeave={onOpenApplyLeave}
        onOpenAttendanceCorrection={onOpenAttendanceCorrection}
      />
    </div>
  );
}
