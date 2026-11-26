import React, { useState, useEffect, useMemo } from "react";
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
  Wallet,
  FolderOpen,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../lib/authContext";
import { useHrms } from "../../lib/hrmsContext";
import { GaHrmsLogo } from "../ui/GaHrmsLogo";
import { UserRole } from "../../types/hrms";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
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
const ALL_GROUPS = [
  "Overview",
  "People & Talent",
  "People & Organization",
  "Team Management",
  "My Workspace",
  "Time & Attendance",
  "Leave Management",
  "Payroll & Compensation",
  "Finance & Claims",
  "Compensation & Reviews",
  "Operations & Assets",
  "Career & Assets",
  "Company & Self-Service",
  "Company",
  "Administration",
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { leaveRequests, regularizations, notifications, company, employees } = useHrms();

  const role: UserRole = user?.role || "EMPLOYEE";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isHrAdmin = role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

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
    return ALL_GROUPS;
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

  // Find direct reports for Manager
  const directReports = useMemo(() => {
    if (!user) return [];
    const currentEmp = employees.find(
      (e) => e.id === user.employeeId || e.employeeCode === user.employeeId
    );
    return employees.filter(
      (e) =>
        e.managerId === user.employeeId ||
        (currentEmp && e.managerId === currentEmp.id) ||
        (role === "MANAGER" && currentEmp && e.departmentId === currentEmp.departmentId && e.id !== currentEmp.id)
    );
  }, [employees, user, role]);

  // Compute Role-Aware Pending Approval Badges
  const allPendingLeaves = leaveRequests.filter((l) => l.status === "PENDING").length;
  const allPendingRegs = regularizations.filter((r) => r.status === "PENDING").length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const managerPendingLeaves = leaveRequests.filter(
    (l) => l.status === "PENDING" && directReports.some((dr) => dr.id === l.employeeId || dr.employeeCode === l.employeeId)
  ).length;

  const managerPendingRegs = regularizations.filter(
    (r) => r.status === "PENDING" && directReports.some((dr) => dr.id === r.employeeId || dr.employeeCode === r.employeeId)
  ).length;

  const employeePendingLeaves = leaveRequests.filter(
    (l) => l.status === "PENDING" && (l.employeeId === user?.employeeId || l.employeeId === "EMP-1004")
  ).length;

  const employeePendingRegs = regularizations.filter(
    (r) => r.status === "PENDING" && (r.employeeId === user?.employeeId || r.employeeId === "EMP-1004")
  ).length;

  // =========================================================================
  // ROLE-TAILORED DYNAMIC SIDEBAR ARCHITECTURE
  // =========================================================================
  const navigationGroups = useMemo<NavGroup[]>(() => {
    // -----------------------------------------------------------------------
    // A. EMPLOYEE NAVIGATION (100% Self-Service, Zero Admin Noise)
    // -----------------------------------------------------------------------
    if (isEmployee) {
      return [
        {
          group: "Overview",
          collapsible: false,
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          ],
        },
        {
          group: "My Workspace",
          collapsible: true,
          items: [
            { label: "My Attendance", path: "/time/attendance", icon: Clock },
            { label: "My Leave Balances", path: "/leave/overview", icon: CalendarRange },
            {
              label: "My Leave Requests",
              path: "/leave/requests",
              icon: FileCheck,
              badge: employeePendingLeaves > 0 ? employeePendingLeaves : undefined,
            },
            {
              label: "My Regularizations",
              path: "/time/regularization",
              icon: ClockAlert,
              badge: employeePendingRegs > 0 ? employeePendingRegs : undefined,
            },
            { label: "Holiday Calendar", path: "/time/holidays", icon: CalendarCheck2 },
          ],
        },
        {
          group: "Finance & Claims",
          collapsible: true,
          items: [
            { label: "My Payslips", path: "/payroll/payslips", icon: FileSpreadsheet },
          ],
        },
        {
          group: "Career & Assets",
          collapsible: true,
          items: [
            { label: "My Goals & Reviews", path: "/performance", icon: Target },
            { label: "My Allocated Assets", path: "/assets", icon: Laptop },
            { label: "Careers & Referrals", path: "/recruitment", icon: Briefcase },
            { label: "Document Vault", path: "/people/documents", icon: FileText },
            { label: "Self Onboarding", path: "/onboarding", icon: UserCheck },
          ],
        },
        {
          group: "Company",
          collapsible: true,
          items: [
            { label: "Organization Tree", path: "/people/organization", icon: Network },
            {
              label: "Notifications",
              path: "/admin/notifications",
              icon: Bell,
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
            },
          ],
        },
      ];
    }

    // -----------------------------------------------------------------------
    // B. MANAGER NAVIGATION (Team Supervision + Self-Service, No Admin Clutter)
    // -----------------------------------------------------------------------
    if (isManager) {
      return [
        {
          group: "Overview",
          collapsible: false,
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          ],
        },
        {
          group: "Team Management",
          collapsible: true,
          items: [
            { label: "Team Directory", path: "/people/employees", icon: Users },
            { label: "Team Attendance", path: "/time/attendance", icon: Clock },
            {
              label: "Punch Approvals",
              path: "/time/regularization",
              icon: ClockAlert,
              badge: managerPendingRegs > 0 ? managerPendingRegs : undefined,
            },
            {
              label: "Team Leave Requests",
              path: "/leave/requests",
              icon: FileCheck,
              badge: managerPendingLeaves > 0 ? managerPendingLeaves : undefined,
            },
            { label: "Shift Scheduling", path: "/time/shifts", icon: CalendarDays },
            { label: "Team Hiring & ATS", path: "/recruitment", icon: Briefcase },
          ],
        },
        {
          group: "Compensation & Reviews",
          collapsible: true,
          items: [
            { label: "Team & My Payslips", path: "/payroll/payslips", icon: FileSpreadsheet },
            { label: "Team OKRs & Reviews", path: "/performance", icon: Target },
            { label: "Team Assets", path: "/assets", icon: Laptop },
          ],
        },
        {
          group: "Company & Self-Service",
          collapsible: true,
          items: [
            { label: "My Leave Balances", path: "/leave/overview", icon: CalendarRange },
            { label: "Organization Tree", path: "/people/organization", icon: Network },
            { label: "Document Vault", path: "/people/documents", icon: FileText },
            { label: "Holiday Calendar", path: "/time/holidays", icon: CalendarCheck2 },
            {
              label: "Notifications",
              path: "/admin/notifications",
              icon: Bell,
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
            },
          ],
        },
      ];
    }

    // -----------------------------------------------------------------------
    // C. HR ADMIN NAVIGATION (Workforce Operations, Indian Statutory Payroll)
    // -----------------------------------------------------------------------
    if (isHrAdmin) {
      return [
        {
          group: "Overview",
          collapsible: false,
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          ],
        },
        {
          group: "People & Talent",
          collapsible: true,
          items: [
            { label: "Employee Directory", path: "/people/employees", icon: Users },
            { label: "Onboarding Setup", path: "/admin/onboarding-setup", icon: UserPlus },
            { label: "Recruitment & ATS", path: "/recruitment", icon: Briefcase },
            { label: "Departments", path: "/people/departments", icon: Building2 },
            { label: "Designations", path: "/people/designations", icon: Network },
            { label: "Organization Tree", path: "/people/organization", icon: Network },
            { label: "Document Vault", path: "/people/documents", icon: FileText },
          ],
        },
        {
          group: "Time & Attendance",
          collapsible: true,
          items: [
            { label: "Daily Attendance", path: "/time/attendance", icon: Clock },
            {
              label: "Punch Approvals",
              path: "/time/regularization",
              icon: ClockAlert,
              badge: allPendingRegs > 0 ? allPendingRegs : undefined,
            },
            { label: "Shift Scheduling", path: "/time/shifts", icon: CalendarDays },
            { label: "Holiday Calendar", path: "/time/holidays", icon: CalendarCheck2 },
          ],
        },
        {
          group: "Leave Management",
          collapsible: true,
          items: [
            { label: "Leave Balances", path: "/leave/overview", icon: CalendarRange },
            {
              label: "Leave Requests",
              path: "/leave/requests",
              icon: FileCheck,
              badge: allPendingLeaves > 0 ? allPendingLeaves : undefined,
            },
            { label: "Leave Policies", path: "/leave/policies", icon: ShieldCheck },
          ],
        },
        {
          group: "Payroll & Compensation",
          collapsible: true,
          items: [
            { label: "Payroll Overview", path: "/payroll/dashboard", icon: WalletCards },
            { label: "Salary Slabs", path: "/payroll/salary-structures", icon: Coins },
            { label: "Execute Pay Run", path: "/payroll/runs", icon: Receipt },
            { label: "Corporate Payslips", path: "/payroll/payslips", icon: FileSpreadsheet },
          ],
        },
        {
          group: "Operations & Assets",
          collapsible: true,
          items: [
            { label: "Company Assets", path: "/assets", icon: Laptop },
            { label: "Performance & OKRs", path: "/performance", icon: Target },
            { label: "Compliance Reports", path: "/reports", icon: BarChart3 },
          ],
        },
        {
          group: "Administration",
          collapsible: true,
          items: [
            { label: "Activity Stream", path: "/admin/audit-logs", icon: ScrollText },
            {
              label: "Notifications",
              path: "/admin/notifications",
              icon: Bell,
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
            },
            { label: "System Settings", path: "/admin/settings", icon: Settings },
          ],
        },
      ];
    }

    // -----------------------------------------------------------------------
    // D. SUPER ADMIN NAVIGATION (Full Organization Governance & Security)
    // -----------------------------------------------------------------------
    return [
      {
        group: "Overview",
        collapsible: false,
        items: [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        ],
      },
      {
        group: "People & Talent",
        collapsible: true,
        items: [
          { label: "Employee Directory", path: "/people/employees", icon: Users },
          { label: "Onboarding Setup", path: "/admin/onboarding-setup", icon: UserPlus },
          { label: "Recruitment & ATS", path: "/recruitment", icon: Briefcase },
          { label: "Departments", path: "/people/departments", icon: Building2 },
          { label: "Designations", path: "/people/designations", icon: Network },
          { label: "Organization Tree", path: "/people/organization", icon: Network },
          { label: "Document Vault", path: "/people/documents", icon: FileText },
        ],
      },
      {
        group: "Time & Attendance",
        collapsible: true,
        items: [
          { label: "Daily Attendance", path: "/time/attendance", icon: Clock },
          {
            label: "Punch Approvals",
            path: "/time/regularization",
            icon: ClockAlert,
            badge: allPendingRegs > 0 ? allPendingRegs : undefined,
          },
          { label: "Shift Scheduling", path: "/time/shifts", icon: CalendarDays },
          { label: "Holiday Calendar", path: "/time/holidays", icon: CalendarCheck2 },
        ],
      },
      {
        group: "Leave Management",
        collapsible: true,
        items: [
          { label: "Leave Balances", path: "/leave/overview", icon: CalendarRange },
          {
            label: "Leave Requests",
            path: "/leave/requests",
            icon: FileCheck,
            badge: allPendingLeaves > 0 ? allPendingLeaves : undefined,
          },
          { label: "Leave Policies", path: "/leave/policies", icon: ShieldCheck },
        ],
      },
      {
        group: "Payroll & Compensation",
        collapsible: true,
        items: [
          { label: "Payroll Overview", path: "/payroll/dashboard", icon: WalletCards },
          { label: "Salary Slabs", path: "/payroll/salary-structures", icon: Coins },
          { label: "Execute Pay Run", path: "/payroll/runs", icon: Receipt },
          { label: "Corporate Payslips", path: "/payroll/payslips", icon: FileSpreadsheet },
        ],
      },
      {
        group: "Operations & Assets",
        collapsible: true,
        items: [
          { label: "Company Assets", path: "/assets", icon: Laptop },
          { label: "Performance & OKRs", path: "/performance", icon: Target },
          { label: "Compliance Reports", path: "/reports", icon: BarChart3 },
        ],
      },
      {
        group: "Administration",
        collapsible: true,
        items: [
          { label: "Activity Stream", path: "/admin/audit-logs", icon: ScrollText },
          { label: "Access & Roles", path: "/admin/users-roles", icon: ShieldCheck },
          {
            label: "Notifications",
            path: "/admin/notifications",
            icon: Bell,
            badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
          },
          { label: "System Settings", path: "/admin/settings", icon: Settings },
        ],
      },
    ];
  }, [
    isEmployee,
    isManager,
    isHrAdmin,
    employeePendingRegs,
    managerPendingRegs,
    managerPendingLeaves,
    allPendingRegs,
    allPendingLeaves,
    unreadNotifsCount,
  ]);

  // Keep active route's group open automatically
  useEffect(() => {
    const activeGroup = navigationGroups.find((g) =>
      g.items.some(
        (i) =>
          location.pathname === i.path ||
          (i.path !== "/dashboard" && location.pathname.startsWith(i.path))
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
  }, [location.pathname, navigationGroups]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-[#697586] border-r border-[#DDE3EA] select-none">
      {/* Brand Header */}
      <div
        className={cn(
          "flex items-center border-b border-[#DDE3EA] shrink-0 bg-white transition-all",
          collapsed ? "flex-col justify-center gap-1.5 py-2.5 px-1" : "h-14 justify-between px-3"
        )}
      >
        <GaHrmsLogo size="sm" iconOnly={collapsed} />
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-[#697586] hover:text-[#1F8476] hover:bg-[#E9F5F3] transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-3.5 h-3.5" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Company Selector Widget */}
      {!collapsed && (
        <div className="px-2.5 py-2.5 border-b border-[#DDE3EA] bg-[#F7F9FB]">
          <div className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DDE3EA] flex items-center justify-between gap-2 text-xs shadow-2xs">
            <div className="truncate">
              <p className="font-semibold text-[#1B2430] truncate leading-tight">
                {company.name || "Gryphon Technologies"}
              </p>
              <p className="text-[11px] text-[#697586] truncate mt-0.5">
                {company.headquarters ? "Pune HQ (4 Branches)" : "In-House Workplace"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#80B6A1] shrink-0" />
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3">
        {navigationGroups.map((group, groupIdx) => {
          const visibleItems = group.items;

          if (visibleItems.length === 0) return null;

          const isCollapsible = group.collapsible !== false;
          const isExpanded = collapsed || !isCollapsible || expandedGroups.includes(group.group);
          const groupBadgeCount = visibleItems.reduce((acc, item) => acc + (item.badge || 0), 0);

          return (
            <div key={group.group} className="space-y-1">
              {/* Divider in compact mode */}
              {collapsed && groupIdx > 0 && (
                <div className="w-8 h-px bg-[#DDE3EA] mx-auto my-1.5" />
              )}

              {/* Group Header */}
              {!collapsed && (
                isCollapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-[#697586] hover:text-[#1B2430] hover:bg-[#F0F4F8] transition-colors group/header focus:outline-none"
                    aria-expanded={isExpanded}
                  >
                    <span className="truncate">{group.group}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {!isExpanded && groupBadgeCount > 0 && (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-[#FEF7E0] text-[#1B2430] border border-[#FEEFC3]">
                          {groupBadgeCount}
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-[#697586] group-hover/header:text-[#1B2430] transition-transform duration-200",
                          isExpanded ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </div>
                  </button>
                ) : (
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#697586]">
                    {group.group}
                  </p>
                )
              )}

              {/* Collapsible list */}
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
                        key={item.path + item.label}
                        to={item.path}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-full text-[13px] font-medium transition-all duration-150 group relative",
                          isActive
                            ? "bg-[#111312] text-white font-semibold shadow-sm"
                            : "text-[#68707D] hover:bg-[#F1F3F5] hover:text-[#111312]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform duration-150",
                            isActive ? "text-[#A3E635]" : "text-[#68707D] group-hover:text-[#111312]"
                          )}
                        />

                        {!collapsed && <span className="truncate flex-1">{item.label}</span>}

                        {isActive && !collapsed && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] shrink-0 mr-1" />
                        )}

                        {!collapsed && item.badge !== undefined && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto shrink-0",
                              isActive
                                ? "bg-[#A3E635] text-[#111312]"
                                : "bg-[#F1F3F5] text-[#68707D] border border-[#E6E8EC]"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {collapsed && item.badge !== undefined && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A3E635]" />
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
      <div className="p-2.5 border-t border-[#DDE3EA] bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={user?.avatar || "/avatars/superman.jpg"}
              alt={user?.name || "User"}
              className="w-8 h-8 rounded-full object-cover border border-[#DDE3EA]"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#62D84E] ring-2 ring-white" />
          </div>

          {!collapsed && (
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-[#1B2430] truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-[10px] text-[#697586] truncate uppercase tracking-wider mt-0.5">
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
      <aside
        className={cn(
          "hidden md:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

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
