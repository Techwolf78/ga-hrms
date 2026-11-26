import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  Clock,
  LogOut,
  User,
  Shield,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Monitor,
} from "lucide-react";
import { useAuth } from "../../lib/authContext";
import { useHrms } from "../../lib/hrmsContext";
import { UserRole } from "../../types/hrms";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { GaHrmsLogo } from "../ui/GaHrmsLogo";

export interface TopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  floatingPill?: boolean;
}

export function Topbar({ onOpenMobileSidebar, onOpenSearch, floatingPill = false }: TopbarProps) {
  const { user, logout, switchRole, switchPersona } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    attendance,
    punchAttendance,
    resetAllData,
    settings,
    updateSettings,
  } = useHrms();
  const navigate = useNavigate();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!floatingPill) return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [floatingPill]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Today's attendance status for current logged in user
  const todayStr = "2026-11-20";
  const userTodayAttendance = attendance.find(
    (a) => a.employeeId === user?.employeeId && a.date === todayStr
  );
  const isPunchedIn = !!userTodayAttendance?.firstIn && !userTodayAttendance?.lastOut;

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const handlePunchToggle = () => {
    if (!user?.employeeId) return;
    if (isPunchedIn) {
      punchAttendance(user.employeeId, "OUT");
    } else {
      punchAttendance(user.employeeId, "IN");
    }
  };

  const rolesList: { key: string; label: string; desc: string; isNewHire?: boolean }[] = [
    { key: "SUPER_ADMIN", label: "Super Admin", desc: "Full platform & organization access" },
    { key: "HR_ADMIN", label: "HR Admin", desc: "People, payroll, leave & policy control" },
    { key: "MANAGER", label: "Manager", desc: "Team attendance, leaves & regularizations" },
    { key: "EMPLOYEE", label: "Employee", desc: "Self-service portal, leaves, payslips" },
    { key: "NEW_HIRE", label: "New Hire", desc: "Pending self-onboarding submission", isNewHire: true },
  ];

  return (
    <div
      className={cn(
        floatingPill
          ? "sticky top-2 z-30 px-2 sm:px-3 pt-2 mb-1 pointer-events-none"
          : "sticky top-0 z-20"
      )}
    >
      <header
        className={cn(
          "relative h-12 flex items-center justify-between gap-3 select-none transition-colors duration-200",
          floatingPill
            ? cn(
                "pointer-events-auto rounded-full border px-3 sm:px-4",
                scrolled
                  ? "bg-white/80 backdrop-blur-md border-white/60 shadow-[0_8px_24px_0_rgba(3,45,66,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-black/[0.03]"
                  : "bg-white/90 backdrop-blur-md border-white/80 shadow-[0_6px_20px_-4px_rgba(3,45,66,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/[0.04]"
              )
            : "bg-white border-b border-[#DDE3EA] px-4 sm:px-6"
        )}
      >
        {floatingPill && (
          <div className="absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
        )}
      {/* Left: Mobile hamburger + Global Search Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xs">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-[#697586] hover:text-[#1F8476] hover:bg-[#E9F5F3] rounded-lg transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="md:hidden shrink-0">
          <GaHrmsLogo size="xs" variant="light" />
        </div>

        {/* Mobile Search Icon Trigger */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 text-[#697586] hover:text-[#1F8476] hover:bg-[#E9F5F3] rounded-lg transition-colors"
          aria-label="Open search"
          title="Search anything..."
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Desktop / Tablet Global Search Input Button */}
        <button
          onClick={onOpenSearch}
          aria-label="Search anything"
          className={cn(
            "hidden sm:flex w-full items-center justify-between px-3.5 py-1.5 bg-[#F7F9FB] border border-[#DDE3EA] text-xs text-[#697586] hover:border-[#80B6A1] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F8476]/10 focus:border-[#1F8476] transition-all shadow-xs group",
            floatingPill ? "rounded-full" : "rounded-input"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#80B6A1] group-hover:text-[#1F8476] transition-colors" />
            <span className="truncate">Search anything...</span>
          </div>
          <kbd className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#697586] bg-white border border-[#DDE3EA] px-2 py-0.5 rounded shadow-2xs">
            {typeof window !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
              ? "⌘ K"
              : "Ctrl K"}
          </kbd>
        </button>
      </div>

      {/* Right: Quick Punch, Role Switcher, Notifications, User Menu */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Punch-In / Punch-Out Widget */}
        {user?.employeeId && (
          <button
            onClick={handlePunchToggle}
            className={cn(
              "hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold border transition-all duration-150",
              floatingPill ? "rounded-full" : "rounded-lg",
              isPunchedIn
                ? "bg-[#ECFCCB] border-[#D9F99D] text-[#3F6212] hover:bg-[#FFE4E6] hover:border-[#FECDD3] hover:text-[#E11D48]"
                : floatingPill
                ? "bg-[#A3E635] text-[#111312] font-bold border-[#A3E635] hover:bg-[#BEF264] shadow-[0_4px_16px_rgba(163,230,53,0.35)]"
                : "bg-[#111312] text-white border-[#111312] hover:bg-[#232725] shadow-xs"
            )}
            title={isPunchedIn ? "Click to Punch-Out" : "Click to Punch-In"}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isPunchedIn
                ? `In: ${userTodayAttendance?.firstIn} (Click to Out)`
                : "Web Punch In"}
            </span>
          </button>
        )}

        {/* Monitor Density Switcher */}
        <button
          onClick={() => updateSettings({ compactMode: !settings.compactMode })}
          className={cn(
            "hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
            settings?.compactMode
              ? "bg-[#1F8476] text-white border-[#1F8476] shadow-xs"
              : "bg-[#F0F4F8] text-[#1B2430] border-[#DDE3EA] hover:bg-[#E9F5F3] hover:text-[#1F8476]"
          )}
          title={
            settings?.compactMode
              ? "Current: Compact Monitor Mode (Click for Comfortable View)"
              : "Current: Comfortable View (Click for Compact Monitor Mode)"
          }
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{settings?.compactMode ? "Compact" : "Comfortable"}</span>
        </button>

        {/* Fast Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F0F4F8] hover:bg-[#E9F5F3] text-[#1B2430] border border-[#DDE3EA] hover:border-[#80B6A1] transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#1F8476]" />
            <span>Role: {user?.role.replace("_", " ")}</span>
            <ChevronDown className="w-3 h-3 text-[#697586]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-[#DDE3EA] p-2 z-50 animate-scale-in">
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#697586]">
                Switch Interactive Role
              </p>
              <div className="space-y-1">
                {rolesList.map((r) => {
                  const isCurrent = r.isNewHire
                    ? user?.employeeId === "EMP-1033"
                    : user?.role === r.key && user?.employeeId !== "EMP-1033";

                  return (
                    <button
                      key={r.key}
                      onClick={() => {
                        if (r.isNewHire) {
                          switchPersona("NEW_HIRE");
                          setShowRoleMenu(false);
                          navigate("/onboarding");
                        } else {
                          switchRole(r.key as UserRole);
                          setShowRoleMenu(false);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                        isCurrent
                          ? "bg-[#1F8476] text-white font-semibold"
                          : r.isNewHire
                          ? "bg-[#FEF7E0] hover:bg-[#FEEFC3] text-[#B06000] font-medium border border-[#FEEFC3]"
                          : "hover:bg-[#E9F5F3] hover:text-[#1F8476] text-[#1B2430]"
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>{r.label}</span>
                        {r.isNewHire && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                            Pending
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isCurrent ? "text-emerald-100" : "text-[#697586]"
                        }`}
                      >
                        {r.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 text-[#697586] hover:text-[#1F8476] hover:bg-[#E9F5F3] rounded-lg relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#62D84E] ring-2 ring-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-card shadow-elevated border border-[#DDE3EA] overflow-hidden z-50 animate-scale-in">
              <div className="px-4 py-3 border-b border-[#DDE3EA] flex items-center justify-between bg-[#F7F9FB]">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[#1B2430]">Notifications</h4>
                  {unreadNotifs.length > 0 && (
                    <span className="text-[10px] font-bold bg-[#E9F5F3] text-[#1F8476] border border-[#CEEAD6] px-2 py-0.5 rounded-full">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#1F8476] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#DDE3EA]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#697586]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.link) navigate(notif.link);
                        setShowNotifMenu(false);
                      }}
                      className={`p-3.5 hover:bg-[#F7F9FB] cursor-pointer transition-colors text-left ${
                        !notif.isRead ? "bg-[#E9F5F3]/40 font-medium" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[#1B2430]">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-[#697586] shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[#697586] mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-[#F7F9FB] border-t border-[#DDE3EA] text-center">
                <button
                  onClick={() => {
                    navigate("/admin/notifications");
                    setShowNotifMenu(false);
                  }}
                  className="text-xs font-semibold text-[#1F8476] hover:underline inline-flex items-center gap-1"
                >
                  View all notifications <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#1F8476]/20 transition-all"
          >
            <img
              src={user?.avatar || "/avatars/superman.jpg"}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-[#DDE3EA]"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-card shadow-elevated border border-[#DDE3EA] p-2 z-50 animate-scale-in">
              <div className="px-3 py-2 border-b border-[#DDE3EA] mb-1">
                <p className="text-xs font-semibold text-[#1B2430] truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-[#697586] truncate mt-0.5">
                  {user?.email}
                </p>
                <span className="inline-block text-[10px] uppercase font-bold text-[#1F8476] bg-[#E9F5F3] px-2 py-0.5 rounded mt-1.5 border border-[#CEEAD6]">
                  {user?.role.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-0.5">
                {user?.employeeId && (
                  <button
                    onClick={() => {
                      navigate(`/people/employees/${user.employeeId}`);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#1B2430] hover:bg-[#E9F5F3] hover:text-[#1F8476] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#80B6A1]" />
                    <span>My Profile</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    navigate("/admin/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#1B2430] hover:bg-[#E9F5F3] hover:text-[#1F8476] transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#80B6A1]" />
                  <span>Company Settings</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Reset all LocalStorage data to fresh demo state?")) {
                      resetAllData();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#B06000] hover:bg-[#FEF7E0] transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-[#E69F00]" />
                  <span>Reset Demo Data</span>
                </button>

                <div className="my-1 border-t border-[#DDE3EA]" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#C62828] hover:bg-[#FCE8E6] transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#C62828]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </header>
    </div>
  );
}
