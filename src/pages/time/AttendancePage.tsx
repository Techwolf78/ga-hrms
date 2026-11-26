import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ClockAlert,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  UserCheck,
  Sliders,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { AttendanceRecord } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { formatDate, formatTime } from "../../lib/utils";
import { AttendanceCorrectionModal } from "./AttendanceCorrectionModal";
import { EmployeeAttendanceView } from "./components/EmployeeAttendanceView";
import { ManagerAttendanceView } from "./components/ManagerAttendanceView";
import { AdminAttendanceView } from "./components/AdminAttendanceView";

export function AttendancePage() {
  const { employees, regularizations } = useHrms();
  const { user } = useAuth();

  const role = user?.role || "SUPER_ADMIN";

  // Resolved employee identity for the logged-in user:
  // Super Admin is purely a system administrator and is NEVER linked to an employee record.
  // Other roles (HR Admin, Manager, Employee) are employees of the organization.
  const currentUserEmployee = useMemo(() => {
    if (role === "SUPER_ADMIN" || !user?.employeeId) return null;
    return (
      employees.find(
        (e) => e.id === user?.employeeId || e.employeeCode === user?.employeeId
      ) || null
    );
  }, [employees, user?.employeeId, role]);

  const hasEmployeeRecord = Boolean(currentUserEmployee);

  // Main Navigation Tab: Super Admin always lands on ADMIN_MANAGEMENT; employees on MY_ATTENDANCE
  const [activeNavTab, setActiveNavTab] = useState<string>(() => {
    return role === "SUPER_ADMIN" ? "ADMIN_MANAGEMENT" : "MY_ATTENDANCE";
  });
  const [currentDate, setCurrentDate] = useState("2026-11-20");

  // Sensor punch timeline detail modal
  const [detailRecord, setDetailRecord] = useState<AttendanceRecord | null>(null);

  // Correction / Regularization modal
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [correctionRecord, setCorrectionRecord] = useState<AttendanceRecord | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [prefillEmployeeId, setPrefillEmployeeId] = useState<string | undefined>(undefined);

  // Compute pending regularizations count for badges
  const tenantPendingCount = useMemo(() => {
    return regularizations.filter((r) => r.status === "PENDING").length;
  }, [regularizations]);

  const teamPendingCount = useMemo(() => {
    if (!hasEmployeeRecord) return 0;
    const managerEmpId = currentUserEmployee?.id || user?.employeeId || "EMP-1003";
    const teamIds = employees
      .filter((e) => e.managerId === managerEmpId || e.departmentId === currentUserEmployee?.departmentId)
      .map((e) => e.id);
    return regularizations.filter(
      (r) => r.status === "PENDING" && teamIds.includes(r.employeeId)
    ).length;
  }, [regularizations, employees, currentUserEmployee, user?.employeeId, hasEmployeeRecord]);

  const myPendingCount = useMemo(() => {
    if (!hasEmployeeRecord) return 0;
    const myId = currentUserEmployee?.id || user?.employeeId;
    return regularizations.filter(
      (r) => (r.employeeId === myId || r.employeeId === currentUserEmployee?.employeeCode) && r.status === "PENDING"
    ).length;
  }, [regularizations, currentUserEmployee, user?.employeeId, hasEmployeeRecord]);

  // Dynamic Navigation Tabs per Role
  // Super Admin: System-wide oversight only (No personal attendance)
  // HR Admin / Manager / Employee: Personal attendance + role-authorized views
  const navTabs = useMemo(() => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          {
            id: "ADMIN_MANAGEMENT",
            label: "Attendance Management",
            icon: <Building2 className="w-3.5 h-3.5" />,
          },
          {
            id: "ADMIN_REGULARIZATIONS",
            label: "Regularization Requests",
            icon: <ClockAlert className="w-3.5 h-3.5" />,
            badge: tenantPendingCount > 0 ? tenantPendingCount : undefined,
            badgeVariant: "warning" as const,
          },
          {
            id: "ADMIN_POLICY",
            label: "Policy & Settings",
            icon: <Sliders className="w-3.5 h-3.5" />,
          },
        ];

      case "HR_ADMIN":
        return [
          {
            id: "MY_ATTENDANCE",
            label: "My Attendance",
            icon: <UserCheck className="w-3.5 h-3.5" />,
            badge: myPendingCount > 0 ? `${myPendingCount} req` : undefined,
            badgeVariant: "neutral" as const,
          },
          {
            id: "ADMIN_OPERATIONS",
            label: "Attendance Operations",
            icon: <Building2 className="w-3.5 h-3.5" />,
          },
          {
            id: "ADMIN_EXCEPTIONS",
            label: "Exceptions Queue",
            icon: <AlertTriangle className="w-3.5 h-3.5" />,
          },
          {
            id: "ADMIN_REGULARIZATIONS",
            label: "Regularization Approvals",
            icon: <ClockAlert className="w-3.5 h-3.5" />,
            badge: tenantPendingCount > 0 ? tenantPendingCount : undefined,
            badgeVariant: "warning" as const,
          },
        ];

      case "MANAGER":
        return [
          {
            id: "MY_ATTENDANCE",
            label: "My Attendance",
            icon: <UserCheck className="w-3.5 h-3.5" />,
            badge: myPendingCount > 0 ? `${myPendingCount} req` : undefined,
            badgeVariant: "neutral" as const,
          },
          {
            id: "MANAGER_TEAM",
            label: "My Team Attendance",
            icon: <Users className="w-3.5 h-3.5" />,
          },
          {
            id: "MANAGER_APPROVALS",
            label: "Pending Approvals",
            icon: <ClockAlert className="w-3.5 h-3.5" />,
            badge: teamPendingCount > 0 ? teamPendingCount : undefined,
            badgeVariant: "warning" as const,
          },
        ];

      case "EMPLOYEE":
      default:
        return [
          {
            id: "MY_ATTENDANCE",
            label: "My Attendance",
            icon: <UserCheck className="w-3.5 h-3.5" />,
          },
          {
            id: "EMPLOYEE_REQUESTS",
            label: "My Requests",
            icon: <ClockAlert className="w-3.5 h-3.5" />,
            badge: myPendingCount > 0 ? myPendingCount : undefined,
            badgeVariant: "neutral" as const,
          },
        ];
    }
  }, [role, myPendingCount, tenantPendingCount, teamPendingCount]);

  // Synchronize activeNavTab if active tab is not in available tabs
  useEffect(() => {
    if (!navTabs.some((t) => t.id === activeNavTab)) {
      setActiveNavTab(navTabs[0]?.id || "ADMIN_MANAGEMENT");
    }
  }, [navTabs, activeNavTab]);

  // Context Header Info
  const isPersonalView =
    (activeNavTab === "MY_ATTENDANCE" ||
      activeNavTab === "EMPLOYEE_REQUESTS") &&
    hasEmployeeRecord;

  const handleOpenCorrection = (record?: AttendanceRecord, date?: string) => {
    setCorrectionRecord(record || null);
    setPrefillDate(date || record?.date || currentDate);

    if (isPersonalView && currentUserEmployee) {
      // In personal view, always enforce current user's employee identity
      setPrefillEmployeeId(currentUserEmployee.id || user?.employeeId);
    } else {
      setPrefillEmployeeId(record?.employeeId);
    }

    setIsCorrectionOpen(true);
  };

  const pageSubtitle = useMemo(() => {
    if (role === "SUPER_ADMIN") {
      return "Organization-wide attendance oversight, shift allocations, and compliance policies.";
    }
    if (role === "HR_ADMIN") {
      return "Workforce attendance operations, exceptions queue, and regularizations.";
    }
    if (role === "MANAGER") {
      return "Team attendance tracking, shift schedules, and regularization approvals.";
    }
    return "Monthly attendance calendar, shift timings, and regularization requests.";
  }, [role]);

  return (
    <div className="space-y-4">
      {/* Page Header Card */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            Attendance
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5">
            {pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Date Selector for Admin and Manager Daily Registers */}
          {!isPersonalView && (
            <div className="flex items-center gap-1 bg-[#F7F9FB] px-2.5 py-1 rounded-full border border-[#DDE3EA] h-9">
              <button
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() - 1);
                  setCurrentDate(d.toISOString().split("T")[0]);
                }}
                className="p-1 rounded-full text-[#697586] hover:text-[#032D42] hover:bg-white transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-[#032D42] whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-[#1F8476]" />
                <span>{formatDate(currentDate)}</span>
              </div>

              <button
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() + 1);
                  setCurrentDate(d.toISOString().split("T")[0]);
                }}
                className="p-1 rounded-full text-[#697586] hover:text-[#032D42] hover:bg-white transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <Button
            onClick={() => handleOpenCorrection()}
            variant={isPersonalView ? "primary" : "outline"}
            size="md"
            leftIcon={<ClockAlert className="w-3.5 h-3.5" />}
          >
            {isPersonalView ? "Request Regularization" : "Manual Correction"}
          </Button>
        </div>
      </div>

      {/* Compact Pill Module Navigation Tabs */}
      <div className="inline-flex items-center p-1 bg-white rounded-full border border-[#DDE3EA] shadow-[0_2px_12px_rgba(3,45,66,0.03)] gap-1 overflow-x-auto scrollbar-none max-w-full">
        {navTabs.map((tab) => {
          const isActive = activeNavTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveNavTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              }`}
            >
              <span className={isActive ? "text-[#62D84E]" : "text-[#1F8476]"}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                    tab.badgeVariant === "warning"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-surface-bg text-text-secondary border border-surface-border"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* View Switcher based on active navigation tab */}
      {/* 1. Personal Attendance Experience (Available to HR Admin, Manager, and Employee) */}
      {activeNavTab === "MY_ATTENDANCE" && (
        <EmployeeAttendanceView
          employeeId={currentUserEmployee?.id || user?.employeeId}
          defaultSubTab="HISTORY"
          onOpenRegularizationModal={(date) =>
            handleOpenCorrection(undefined, date)
          }
          onOpenTimelineModal={(rec) => setDetailRecord(rec)}
        />
      )}

      {activeNavTab === "EMPLOYEE_REQUESTS" && (
        <EmployeeAttendanceView
          employeeId={currentUserEmployee?.id || user?.employeeId}
          defaultSubTab="REGULARIZATIONS"
          onOpenRegularizationModal={(date) =>
            handleOpenCorrection(undefined, date)
          }
          onOpenTimelineModal={(rec) => setDetailRecord(rec)}
        />
      )}

      {/* 2. Manager Views */}
      {activeNavTab === "MANAGER_TEAM" && (
        <ManagerAttendanceView
          currentDate={currentDate}
          defaultTab="REGISTER"
          onOpenTimelineModal={(rec) => setDetailRecord(rec)}
          onOpenCorrectionModal={(rec) => handleOpenCorrection(rec)}
        />
      )}

      {activeNavTab === "MANAGER_APPROVALS" && (
        <ManagerAttendanceView
          currentDate={currentDate}
          defaultTab="APPROVALS"
          onOpenTimelineModal={(rec) => setDetailRecord(rec)}
          onOpenCorrectionModal={(rec) => handleOpenCorrection(rec)}
        />
      )}

      {/* 3. Admin Views (Super Admin & HR Admin) */}
      {(activeNavTab === "ADMIN_MANAGEMENT" ||
        activeNavTab === "ADMIN_OPERATIONS") && (
        <AdminAttendanceView
          currentDate={currentDate}
          defaultTab="REGISTER"
          isSuperAdmin={role === "SUPER_ADMIN"}
          onOpenTimelineModal={(rec) => setDetailRecord(rec)}
          onOpenCorrectionModal={(rec) => handleOpenCorrection(rec)}
        />
      )}

      {activeNavTab === "ADMIN_EXCEPTIONS" && (
        <AdminAttendanceView
          currentDate={currentDate}
          defaultTab="EXCEPTIONS"
          isSuperAdmin={role === "SUPER_ADMIN"}
          onOpenTimelineModal={(rec) => setDetailRecord(rec)}
          onOpenCorrectionModal={(rec) => handleOpenCorrection(rec)}
        />
      )}

      {activeNavTab === "ADMIN_REGULARIZATIONS" && (
        <AdminAttendanceView
          currentDate={currentDate}
          defaultTab="REGULARIZATIONS"
          isSuperAdmin={role === "SUPER_ADMIN"}
          onOpenTimelineModal={(rec) => setDetailRecord(rec)}
          onOpenCorrectionModal={(rec) => handleOpenCorrection(rec)}
        />
      )}

      {activeNavTab === "ADMIN_POLICY" && (
        <AdminAttendanceView
          currentDate={currentDate}
          defaultTab="POLICY"
          isSuperAdmin={role === "SUPER_ADMIN"}
          onOpenTimelineModal={(rec) => setDetailRecord(rec)}
          onOpenCorrectionModal={(rec) => handleOpenCorrection(rec)}
        />
      )}

      {/* Raw Punch Sensor Timeline Modal (Reusable for all roles) */}
      <Modal
        isOpen={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        title="Biometric & Web Punch Timeline"
        description={`Raw sensor events recorded on ${formatDate(detailRecord?.date)}.`}
      >
        {detailRecord && (
          <div className="space-y-3">
            <div className="p-3 bg-surface-subtle rounded-card border border-surface-border flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-text-primary">
                  {
                    employees.find((e) => e.id === detailRecord.employeeId)
                      ?.firstName
                  }{" "}
                  {
                    employees.find((e) => e.id === detailRecord.employeeId)
                      ?.lastName
                  }
                </p>
                <p className="text-text-secondary text-[11px] mt-0.5">
                  Logged:{" "}
                  <strong className="text-text-primary font-mono">
                    {detailRecord.workingHours} hours
                  </strong>
                </p>
              </div>
              <Badge
                variant={
                  detailRecord.status === "PRESENT" ? "success" : "neutral"
                }
                size="sm"
              >
                {detailRecord.status}
              </Badge>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-2.5 block">
                Sensor Punch Events
              </span>

              {detailRecord.punches.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">
                  No sensor punches registered for this date.
                </p>
              ) : (
                <div className="space-y-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-border">
                  {detailRecord.punches.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-3 relative pl-6 text-xs"
                    >
                      <div
                        className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                          p.type === "IN" ? "bg-emerald-500" : "bg-gray-800"
                        }`}
                      />
                      <div className="flex-1 p-2.5 bg-surface-subtle/60 rounded-lg border border-surface-border flex items-center justify-between">
                        <div>
                          <p className="font-medium text-text-primary">
                            Punch {p.type} ·{" "}
                            <span className="font-mono tabular-nums">
                              {formatTime(p.time)}
                            </span>
                          </p>
                          <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {p.location || "Biometric Terminal"}
                          </p>
                        </div>
                        <Badge variant="neutral" size="sm">
                          {p.source.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Attendance Correction Modal (USD-06 / USD-07) */}
      <AttendanceCorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => {
          setIsCorrectionOpen(false);
          setCorrectionRecord(null);
          setPrefillDate(undefined);
          setPrefillEmployeeId(undefined);
        }}
        prefillDate={prefillDate || correctionRecord?.date || currentDate}
        prefillEmployeeId={prefillEmployeeId || correctionRecord?.employeeId}
        prefillCorrectionType={
          correctionRecord?.status === "ABSENT"
            ? "MISSING_BOTH"
            : !correctionRecord?.lastOut && correctionRecord?.firstIn
              ? "MISSING_OUT"
              : !correctionRecord?.firstIn && correctionRecord?.lastOut
                ? "MISSING_IN"
                : "INCORRECT_PUNCH"
        }
      />
    </div>
  );
}
