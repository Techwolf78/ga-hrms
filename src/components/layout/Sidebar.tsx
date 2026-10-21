import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Network,
  FileText,
  Clock,
  ClockAlert,
  CalendarDays,
  CalendarCheck2,
  CalendarRange,
  FileCheck,
  ShieldCheck,
  WalletCards,
  Coins,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  UserCheck,
  UserPlus,
  Settings,
  Bell,
  ScrollText,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Laptop,
  Target,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../lib/authContext";
import { useHrms } from "../../lib/hrmsContext";
import { GaHrmsLogo } from "../ui/GaHrmsLogo";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: string[];
}

interface NavGroup {
  group: string;
  collapsible?: boolean;
  items: NavItem[];
}

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const STORAGE_KEY = "ga_hrms_sidebar_expanded_groups";
const DEFAULT_EXPANDED_GROUPS = ["Overview", "People", "Time", "Leave"];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { leaveRequests, regularizations, notifications, company } = useHrms();

  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_EXPANDED_GROUPS;
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const isExpanded = prev.includes(groupName);
      const updated = isExpanded
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const pendingLeavesCount = leaveRequests.filter((l) => l.status === "PENDING").length;
  const pendingRegsCount = regularizations.filter((r) => r.status === "PENDING").length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const role = user?.role || "SUPER_ADMIN";

  const navigationGroups: NavGroup[] = [
    {
      group: "Overview",
      collapsible: false,
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "People",
      items: [
        { label: "Employees", path: "/people/employees", icon: Users, roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"] },
        { label: "Departments", path: "/people/departments", icon: Building2, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        { label: "Designations", path: "/people/designations", icon: Briefcase, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        { label: "Organization", path: "/people/organization", icon: Network, roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"] },
        { label: "Documents", path: "/people/documents", icon: FileText, roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"] },
      ],
    },
    {
      group: "Time",
      items: [
        { label: "Attendance", path: "/time/attendance", icon: Clock },
        {
          label: "Regularization",
          path: "/time/regularization",
          icon: ClockAlert,
          roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
          badge: pendingRegsCount > 0 ? pendingRegsCount : undefined,
        },
        { label: "Shifts", path: "/time/shifts", icon: CalendarRange, roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"] },
        { label: "Holidays", path: "/time/holidays", icon: CalendarDays },
      ],
    },
    {
      group: "Leave",
      items: [
        { label: "Leave Overview", path: "/leave/overview", icon: CalendarCheck2 },
        {
          label: "Leave Requests",
          path: "/leave/requests",
          icon: FileCheck,
          roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
          badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
        },
        { label: "Leave Policies", path: "/leave/policies", icon: ShieldCheck, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
      ],
    },
    {
      group: "Payroll",
      items: [
        { label: "Payroll Dashboard", path: "/payroll/dashboard", icon: WalletCards, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        { label: "Salary Structures", path: "/payroll/salary-structures", icon: Coins, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        { label: "Payroll Runs", path: "/payroll/runs", icon: Receipt, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        { label: "Payslips", path: "/payroll/payslips", icon: FileSpreadsheet },
      ],
    },
    {
      group: "Reports",
      items: [
        { label: "Reports Center", path: "/reports", icon: BarChart3, roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"] },
      ],
    },
    {
      group: "Administration",
      items: [
        { label: "Users & Roles", path: "/admin/users-roles", icon: UserCheck, roles: ["SUPER_ADMIN"] },
        { label: "Onboarding Config", path: "/admin/onboarding-setup", icon: UserPlus, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        { label: "Company Settings", path: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        {
          label: "Notifications",
          path: "/admin/notifications",
          icon: Bell,
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
        },
        { label: "Audit Logs", path: "/admin/audit-logs", icon: ScrollText, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
      ],
    },
    {
      group: "More Modules",
      items: [
        { label: "Recruitment & ATS", path: "/recruitment", icon: Briefcase, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        { label: "Asset & IT", path: "/assets", icon: Laptop, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
        { label: "Performance & OKRs", path: "/performance", icon: Target, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
      ],
    },
  ];

  // Auto-expand group when current route changes
  useEffect(() => {
    const activeGroup = navigationGroups.find((g) =>
      g.items.some(
        (item) =>
          location.pathname === item.path ||
          (item.path !== "/dashboard" && location.pathname.startsWith(item.path))
      )
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.group)) {
      setExpandedGroups((prev) => {
        const next = [...prev, activeGroup.group];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  }, [location.pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-950 text-gray-400 border-r border-gray-900 select-none">
      {/* Brand Header */}
      <div
        className={cn(
          "h-14 flex items-center border-b border-gray-900 shrink-0 bg-gray-950 transition-all",
          collapsed ? "justify-center px-1" : "justify-between px-3"
        )}
      >
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <NavLink to="/dashboard" className="flex items-center group">
                <GaHrmsLogo size="sm" variant="dark" iconOnly={false} />
              </NavLink>
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Company Selector Widget */}
      {!collapsed && (
        <div className="px-2.5 py-2.5 border-b border-gray-900 bg-gray-950">
          <div className="px-2.5 py-1.5 rounded-lg bg-gray-900/90 border border-gray-800 flex items-center justify-between gap-2 text-xs">
            <div className="truncate">
              <p className="font-semibold text-white truncate leading-tight">
                {company.name || "Gryphon Technologies"}
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {company.headquarters ? "Pune HQ (4 Branches)" : "Enterprise Tenant"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3">
        {navigationGroups.map((group, groupIdx) => {
          // Filter items based on user role
          const visibleItems = group.items.filter(
            (item) => !item.roles || item.roles.includes(role)
          );

          if (visibleItems.length === 0) return null;

          const isCollapsible = group.collapsible !== false;
          const isExpanded = collapsed || !isCollapsible || expandedGroups.includes(group.group);
          const groupBadgeCount = visibleItems.reduce((acc, item) => acc + (item.badge || 0), 0);

          return (
            <div key={group.group} className="space-y-1">
              {/* Divider between sections in compact icon mode */}
              {collapsed && groupIdx > 0 && (
                <div className="w-8 h-px bg-gray-900 mx-auto my-1.5" />
              )}

              {/* Group Header in full sidebar mode */}
              {!collapsed && (
                isCollapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 hover:bg-gray-900/60 transition-colors group/header focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-700"
                    aria-expanded={isExpanded}
                  >
                    <span className="truncate">{group.group}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {!isExpanded && groupBadgeCount > 0 && (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {groupBadgeCount}
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-gray-500 group-hover/header:text-gray-300 transition-transform duration-200",
                          isExpanded ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </div>
                  </button>
                ) : (
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {group.group}
                  </p>
                )
              )}

              {/* Collapsible child list */}
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-in-out",
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                )}
              >
                <div className="min-h-0 overflow-hidden space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                          isActive
                            ? "bg-white/10 text-white shadow-2xs font-semibold"
                            : "text-gray-400 hover:bg-gray-900 hover:text-white"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform duration-150",
                            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                          )}
                        />

                        {!collapsed && <span className="truncate flex-1">{item.label}</span>}

                        {!collapsed && item.badge !== undefined && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto shrink-0",
                              isActive
                                ? "bg-white text-gray-950"
                                : "bg-gray-800 text-gray-200"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {collapsed && item.badge !== undefined && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Status Bar at Bottom */}
      <div className="p-2.5 border-t border-gray-900 bg-gray-950 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={user?.avatar || "/avatars/superman.jpg"}
              alt={user?.name || "User"}
              className="w-8 h-8 rounded-full object-cover border border-gray-800"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-gray-950" />
          </div>

          {!collapsed && (
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider mt-0.5">
                {user?.role.replace("_", " ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
