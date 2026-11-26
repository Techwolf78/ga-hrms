import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Download,
  Plus,
  Eye,
  Trash2,
  Clock,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  Building2,
  X,
  Calculator,
  Mail,
  Send,
  FileCheck,
  FileWarning,
  Settings,
  ShieldCheck,
  Briefcase,
  User,
  LayoutGrid,
  List,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { useToast } from "../../lib/toastContext";
import { Employee, EmploymentStatus } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { exportToCsv } from "../../lib/utils";
import { CtcCalculatorModal } from "./CtcCalculatorModal";
import { DossierReviewDrawer } from "../../components/onboarding/DossierReviewDrawer";

export interface EmployeesPageProps {
  onOpenAddEmployee?: () => void;
}

type AccountTab = "ALL" | "DOCUMENT_PENDING" | "SEND_CREDENTIALS" | "MY_TEAM" | "DEPT_PEERS";

export function EmployeesPage({ onOpenAddEmployee }: EmployeesPageProps) {
  const {
    employees,
    departments,
    designations,
    branches,
    deleteEmployee,
    updateEmployee,
    documents,
    getCandidateDossier,
  } = useHrms();
  const { user } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();

  const role = user?.role || "EMPLOYEE";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isHrAdmin = role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  // Resolved current employee identity
  const currentEmployee = useMemo(() => {
    if (!user) return null;
    return (
      employees.find(
        (e) => e.id === user.employeeId || e.employeeCode === user.employeeId
      ) ||
      (isManager
        ? employees.find((e) => e.employeeCode === "EMP-1003") || employees[2]
        : isEmployee
        ? employees.find((e) => e.employeeCode === "EMP-1004") || employees[3]
        : null)
    );
  }, [employees, user, isManager, isEmployee]);

  // Direct reports & department peers for Manager scoping
  const directReports = useMemo(() => {
    if (!currentEmployee) return [];
    return employees.filter(
      (e) =>
        e.managerId === currentEmployee.id ||
        e.managerId === user?.employeeId ||
        (currentEmployee && e.departmentId === currentEmployee.departmentId && e.id !== currentEmployee.id)
    );
  }, [employees, currentEmployee, user?.employeeId]);

  const departmentPeers = useMemo(() => {
    if (!currentEmployee) return [];
    return employees.filter((e) => e.departmentId === currentEmployee.departmentId);
  }, [employees, currentEmployee]);

  // Tab State: Initialized based on role
  const [activeTab, setActiveTab] = useState<AccountTab>(() => {
    if (isManager) return "MY_TEAM";
    return "ALL";
  });

  // CTC Calculator Modal (Admin only)
  const [isCtcCalculatorOpen, setIsCtcCalculatorOpen] = useState(false);

  // Review Dossier Slide-over Drawer
  const [reviewingEmployee, setReviewingEmployee] = useState<Employee | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Pagination & View Mode
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");
  const pageSize = viewMode === "GRID" ? 9 : 8;

  // Delete modal state (Admin only)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Helper to check employee document completion status & stage
  const getEmployeeDocStatus = (emp: Employee) => {
    const empDocs = documents.filter((d) => d.employeeId === emp.id);
    const hasOnboardingData =
      emp.familyDetails || emp.educationDetails?.length || emp.workExperienceDetails?.length;

    let stage: "INVITED" | "IN_PROGRESS" | "SUBMITTED" | "VERIFIED" = "VERIFIED";
    if (emp.onboardingCompleted === false || emp.onboardingStatus === "INVITED") {
      stage = "INVITED";
    } else if (emp.onboardingStatus === "IN_PROGRESS") {
      stage = "IN_PROGRESS";
    } else if (emp.onboardingStatus === "SUBMITTED" || (!emp.onboardingCompleted && hasOnboardingData)) {
      stage = "SUBMITTED";
    }

    const isPending =
      stage !== "VERIFIED" || (empDocs.length < 2 && !hasOnboardingData && emp.status === "PROBATION");
    return {
      stage,
      isPending,
      count: empDocs.length + (hasOnboardingData ? 8 : 1),
      totalRequired: 14,
    };
  };

  const handleApproveOnboarding = (emp: Employee) => {
    updateEmployee(emp.id, {
      onboardingCompleted: true,
      onboardingStatus: "VERIFIED",
      status: "ACTIVE",
    });
    success(`Onboarding approved for ${emp.firstName} ${emp.lastName}. Status updated to Active.`);
  };

  // Base roster pool based on role
  const baseRoster = useMemo(() => {
    if (isManager) {
      if (activeTab === "DEPT_PEERS") return departmentPeers;
      return directReports;
    }
    return employees;
  }, [isManager, activeTab, departmentPeers, directReports, employees]);

  // Tab Counts for Admin
  const tabCounts = useMemo(() => {
    const docPending = employees.filter((e) => getEmployeeDocStatus(e).isPending).length;
    const sendCreds = employees.filter((e) => e.status === "ACTIVE" || e.status === "PROBATION").length;
    return {
      all: employees.length,
      docPending,
      sendCreds,
      myTeam: directReports.length,
      deptPeers: departmentPeers.length,
    };
  }, [employees, documents, directReports.length, departmentPeers.length]);

  // Quick Stats
  const stats = useMemo(() => {
    const total = baseRoster.length;
    const active = baseRoster.filter((e) => e.status === "ACTIVE").length;
    const probation = baseRoster.filter((e) => e.status === "PROBATION").length;
    const notice = baseRoster.filter((e) => e.status === "NOTICE_PERIOD").length;
    const deptsCount = departments.length;
    return { total, active, probation, notice, deptsCount };
  }, [baseRoster, departments]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return baseRoster.filter((emp) => {
      // Tab filter for admins
      if (isSuperAdmin || isHrAdmin) {
        const docStatus = getEmployeeDocStatus(emp);
        if (activeTab === "DOCUMENT_PENDING" && !docStatus.isPending) {
          return false;
        }
        if (activeTab === "SEND_CREDENTIALS" && emp.status !== "ACTIVE" && emp.status !== "PROBATION") {
          return false;
        }
      }

      const matchesSearch =
        searchQuery === "" ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === "ALL" || emp.departmentId === selectedDept;
      const matchesBranch = selectedBranch === "ALL" || emp.branchId === selectedBranch;
      const matchesStatus = selectedStatus === "ALL" || emp.status === selectedStatus;

      return matchesSearch && matchesDept && matchesBranch && matchesStatus;
    });
  }, [
    baseRoster,
    isSuperAdmin,
    isHrAdmin,
    activeTab,
    searchQuery,
    selectedDept,
    selectedBranch,
    selectedStatus,
    documents,
  ]);

  // Paginated records
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedDept !== "ALL" ||
    selectedBranch !== "ALL" ||
    selectedStatus !== "ALL" ||
    (isManager ? activeTab !== "MY_TEAM" : activeTab !== "ALL");

  const clearFilters = () => {
    setActiveTab(isManager ? "MY_TEAM" : "ALL");
    setSearchQuery("");
    setSelectedDept("ALL");
    setSelectedBranch("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  // Export Document Pending Report (Admin only)
  const handleExportPendingDocReport = () => {
    const pendingList = employees.filter((e) => getEmployeeDocStatus(e).isPending);
    const headers = [
      "Employee ID",
      "Full Name",
      "Email",
      "Department",
      "Designation",
      "Joining Date",
      "Pending Documents Count",
      "Status",
    ];

    const rows = pendingList.map((e) => {
      const dept = departments.find((d) => d.id === e.departmentId)?.name || e.departmentId;
      const desig = designations.find((d) => d.id === e.designationId)?.title || e.designationId;
      const docStat = getEmployeeDocStatus(e);
      return [
        e.employeeCode,
        `${e.firstName} ${e.lastName}`,
        e.email,
        dept,
        desig,
        e.joiningDate,
        `${docStat.totalRequired - docStat.count} documents pending`,
        e.status,
      ];
    });

    exportToCsv("GA_HRMS_Document_Pending_Report", headers, rows);
    success(`Exported Document Pending report with ${rows.length} records.`);
  };

  // Send Mail to All (Admin only)
  const handleSendMailToAll = () => {
    success(
      `Portal onboarding credentials & welcome guide successfully dispatched to ${tabCounts.sendCreds} active employees.`
    );
  };

  // Individual Send Credentials (Admin only)
  const handleSendSingleCredentials = (emp: Employee) => {
    info(
      `Onboarding access & login credentials emailed to ${emp.firstName} ${emp.lastName} (${emp.email}).`
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Employee ID",
      "Full Name",
      "Email",
      "Phone",
      "Department",
      "Designation",
      "Branch",
      "Joining Date",
      "Status",
    ];

    const rows = filteredEmployees.map((e) => {
      const dept = departments.find((d) => d.id === e.departmentId)?.name || e.departmentId;
      const desig = designations.find((d) => d.id === e.designationId)?.title || e.designationId;
      const branch = branches.find((b) => b.id === e.branchId)?.name || e.branchId;

      return [
        e.employeeCode,
        `${e.firstName} ${e.lastName}`,
        e.email,
        e.phone,
        dept,
        desig,
        branch,
        e.joiningDate,
        e.status,
      ];
    });

    const filename = isManager
      ? "GA_HRMS_Direct_Reports_Roster"
      : "GA_HRMS_Employees_Export";
    exportToCsv(filename, headers, rows);
    success(`Exported ${rows.length} employee records to CSV.`);
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success" size="sm" dot>Active</Badge>;
      case "PROBATION":
        return <Badge variant="warning" size="sm" dot>Probation</Badge>;
      case "NOTICE_PERIOD":
        return <Badge variant="danger" size="sm" dot>Notice</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PERSONA SCOPE                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 bg-white rounded-2xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] p-3.5 sm:p-4">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#111312] tracking-tight">
            {isManager
              ? "Team Directory"
              : isEmployee
              ? "Company Directory"
              : "Corporate Employee Directory"}
          </h1>
          {(isManager || isEmployee) && (
            <p className="text-xs sm:text-sm text-[#68707D] mt-0.5">
              {isManager
                ? "Direct reports, shift coverage, onboarding progress, and team contact profiles."
                : "Browse verified colleagues, reporting lines, departments, and communication channels."}
            </p>
          )}
        </div>

        {/* Action Buttons: Pill Capsules */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {(isSuperAdmin || isHrAdmin) && (
            <>
              <button
                type="button"
                onClick={handleExportPendingDocReport}
                className="h-9 px-3.5 text-xs font-medium text-[#111312] bg-white hover:bg-[#F7F8FA] border border-[#E6E8EC] hover:border-[#111312]/40 hover:text-[#111312] rounded-full inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
                title="Export CSV report of employees with pending compliance documents"
              >
                <FileWarning className="w-3.5 h-3.5 text-[#111312] shrink-0" />
                <span>Pending Docs</span>
              </button>

              <button
                type="button"
                onClick={handleSendMailToAll}
                className="h-9 px-3.5 text-xs font-medium text-[#111312] bg-white hover:bg-[#F7F8FA] border border-[#E6E8EC] hover:border-[#111312]/40 hover:text-[#111312] rounded-full inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
                title="Dispatch login credentials to active roster"
              >
                <Mail className="w-3.5 h-3.5 text-[#111312] shrink-0" />
                <span>Send Creds</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCtcCalculatorOpen(true)}
                className="h-9 px-3.5 text-xs font-medium text-[#111312] bg-white hover:bg-[#F7F8FA] border border-[#E6E8EC] hover:border-[#111312]/40 hover:text-[#111312] rounded-full inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
                title="Open CTC & Gross Salary Breakdown Calculator"
              >
                <Calculator className="w-3.5 h-3.5 text-[#111312] shrink-0" />
                <span>CTC Calc</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/onboarding-setup")}
                className="h-9 px-3.5 text-xs font-medium text-[#111312] bg-white hover:bg-[#F7F8FA] border border-[#E6E8EC] hover:border-[#111312]/40 hover:text-[#111312] rounded-full inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
                title="Configure Dynamic Onboarding Form, Fields & Document Requirements"
              >
                <Settings className="w-3.5 h-3.5 text-[#111312] shrink-0" />
                <span>Form Config</span>
              </button>
            </>
          )}

          {!isEmployee && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-9 px-3.5 text-xs font-medium text-[#111312] bg-white hover:bg-[#F7F8FA] border border-[#E6E8EC] hover:border-[#111312]/40 hover:text-[#111312] rounded-full inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
              title="Export roster to CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#111312] shrink-0" />
              <span>{isManager ? "Export Team" : "Export Roster"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NAVIGATION TABS (COMPACT PILL ROW)                                     */}
      {/* ========================================================================= */}
      {(isSuperAdmin || isHrAdmin) && (
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-0.5">
          <div className="inline-flex items-center p-1 bg-white rounded-full border border-[#E6E8EC] shadow-[0_2px_12px_rgba(17,19,18,0.03)] gap-1 shrink-0">
            <button
              onClick={() => {
                setActiveTab("ALL");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "ALL"
                  ? "bg-[#111312] text-white shadow-xs"
                  : "text-[#68707D] hover:text-[#111312] hover:bg-[#F7F8FA]"
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === "ALL" ? "text-[#A3E635]" : "text-[#111312]"}`} />
              <span>All Accounts</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "ALL" ? "bg-white/15 text-white" : "bg-[#ECFCCB] text-[#111312]"
                }`}
              >
                {tabCounts.all}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("DOCUMENT_PENDING");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "DOCUMENT_PENDING"
                  ? "bg-[#111312] text-white shadow-xs"
                  : "text-[#68707D] hover:text-[#111312] hover:bg-[#F7F8FA]"
              }`}
            >
              <FileWarning className={`w-3.5 h-3.5 ${activeTab === "DOCUMENT_PENDING" ? "text-[#A3E635]" : "text-[#111312]"}`} />
              <span>Document Pending</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "DOCUMENT_PENDING" ? "bg-white/15 text-white" : "bg-[#FEF7E0] text-[#E69F00]"
                }`}
              >
                {tabCounts.docPending}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("SEND_CREDENTIALS");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "SEND_CREDENTIALS"
                  ? "bg-[#111312] text-white shadow-xs"
                  : "text-[#68707D] hover:text-[#111312] hover:bg-[#F7F8FA]"
              }`}
            >
              <Send className={`w-3.5 h-3.5 ${activeTab === "SEND_CREDENTIALS" ? "text-[#A3E635]" : "text-[#111312]"}`} />
              <span>Send Credentials</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "SEND_CREDENTIALS" ? "bg-white/15 text-white" : "bg-[#ECFCCB] text-[#111312]"
                }`}
              >
                {tabCounts.sendCreds}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#C62828] hover:underline font-medium inline-flex items-center gap-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}

            {onOpenAddEmployee && (
              <Button
                onClick={onOpenAddEmployee}
                variant="primary"
                size="md"
                className="h-9 text-xs font-bold whitespace-nowrap px-4 bg-[#A3E635] hover:bg-[#BEF264] active:bg-[#BEF264] text-[#111312] rounded-full shadow-[0_4px_16px_rgba(163,230,53,0.35)] border-0"
                leftIcon={<Plus className="w-3.5 h-3.5 text-[#111312]" />}
              >
                Onboard Employee
              </Button>
            )}
          </div>
        </div>
      )}

      {isManager && (
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-0.5">
          <div className="inline-flex items-center p-1 bg-white rounded-full border border-[#E6E8EC] shadow-[0_2px_12px_rgba(17,19,18,0.03)] gap-1 shrink-0">
            <button
              onClick={() => {
                setActiveTab("MY_TEAM");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "MY_TEAM"
                  ? "bg-[#111312] text-white shadow-xs"
                  : "text-[#68707D] hover:text-[#111312] hover:bg-[#F7F8FA]"
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === "MY_TEAM" ? "text-[#A3E635]" : "text-[#111312]"}`} />
              <span>Direct Reports</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "MY_TEAM" ? "bg-white/15 text-white" : "bg-[#ECFCCB] text-[#111312]"
                }`}
              >
                {tabCounts.myTeam}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("DEPT_PEERS");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "DEPT_PEERS"
                  ? "bg-[#111312] text-white shadow-xs"
                  : "text-[#68707D] hover:text-[#111312] hover:bg-[#F7F8FA]"
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${activeTab === "DEPT_PEERS" ? "text-[#A3E635]" : "text-[#111312]"}`} />
              <span>Department Peers</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "DEPT_PEERS" ? "bg-white/15 text-white" : "bg-[#ECFCCB] text-[#111312]"
                }`}
              >
                {tabCounts.deptPeers}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#C62828] hover:underline font-medium inline-flex items-center gap-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}

            {onOpenAddEmployee && (
              <Button
                onClick={onOpenAddEmployee}
                variant="primary"
                size="md"
                className="h-9 text-xs font-bold whitespace-nowrap px-4 bg-[#A3E635] hover:bg-[#BEF264] active:bg-[#BEF264] text-[#111312] rounded-full shadow-[0_4px_16px_rgba(163,230,53,0.35)] border-0"
                leftIcon={<Plus className="w-3.5 h-3.5 text-[#111312]" />}
              >
                Onboard Employee
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. UNIFIED KPI STATS RIBBON (ADMIN & MANAGER ONLY)                        */}
      {/* ========================================================================= */}
      {!isEmployee && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="group bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:border-[#111312]/30 hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] transition-all duration-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#68707D] group-hover:text-[#111312] uppercase tracking-wider block truncate transition-colors">
                {isManager ? "Team Members" : "Total Roster"}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#111312] tracking-tight mt-0.5 block">
                {stats.total}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#ECFCCB] text-[#111312] border border-[#A3E635]/30 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-[#111312] group-hover:text-[#A3E635] group-hover:border-[#111312]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="group bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:border-[#111312]/30 hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] transition-all duration-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#68707D] group-hover:text-[#111312] uppercase tracking-wider block truncate transition-colors">
                Active Staff
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#111312] tracking-tight mt-0.5 block">
                {stats.active}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#ECFCCB] text-[#111312] border border-[#A3E635]/30 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-[#111312] group-hover:text-[#A3E635] group-hover:border-[#111312]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="group bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:border-[#111312]/30 hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] transition-all duration-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#68707D] group-hover:text-[#111312] uppercase tracking-wider block truncate transition-colors">
                In Probation
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#111312] tracking-tight mt-0.5 block">
                {stats.probation}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#ECFCCB] text-[#111312] border border-[#A3E635]/30 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-[#111312] group-hover:text-[#A3E635] group-hover:border-[#111312]">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="group bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:border-[#111312]/30 hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] transition-all duration-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#68707D] group-hover:text-[#111312] uppercase tracking-wider block truncate transition-colors">
                Departments
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#111312] tracking-tight mt-0.5 block">
                {stats.deptsCount}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#ECFCCB] text-[#111312] border border-[#A3E635]/30 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-[#111312] group-hover:text-[#A3E635] group-hover:border-[#111312]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SEARCH & FILTER TOOLBAR                                                */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] flex items-center gap-3 flex-wrap justify-between">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-3.5 h-3.5 text-[#68707D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              isManager
                ? "Search direct report by name, code, or email..."
                : isEmployee
                ? "Search colleague name or designation..."
                : "Search employee name, code, or email..."
            }
            className="w-full h-9 pl-9 pr-4 text-xs bg-[#F7F8FA] border border-[#E6E8EC] rounded-full text-[#111312] placeholder-[#68707D] focus:bg-white focus:outline-none focus:border-[#111312] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isManager && (
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3.5 text-xs bg-[#F7F8FA] border border-[#E6E8EC] rounded-full text-[#111312] focus:bg-white focus:outline-none focus:border-[#111312] transition-all"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-3.5 text-xs bg-[#F7F8FA] border border-[#E6E8EC] rounded-full text-[#111312] focus:bg-white focus:outline-none focus:border-[#111312] transition-all"
          >
            <option value="ALL">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {!isEmployee && (
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3.5 text-xs bg-[#F7F8FA] border border-[#E6E8EC] rounded-full text-[#111312] focus:bg-white focus:outline-none focus:border-[#111312] transition-all"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PROBATION">Probation</option>
              <option value="NOTICE_PERIOD">Notice Period</option>
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-9 px-3 text-xs text-[#68707D] hover:text-[#111312] hover:bg-[#F7F8FA] rounded-full inline-flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          {/* Table / Grid View Toggle */}
          <div className="inline-flex items-center p-0.5 bg-[#F7F8FA] border border-[#E6E8EC] rounded-full">
            <button
              type="button"
              onClick={() => {
                setViewMode("TABLE");
                setCurrentPage(1);
              }}
              className={`h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-medium transition-all ${
                viewMode === "TABLE"
                  ? "bg-[#111312] text-white shadow-xs"
                  : "text-[#68707D] hover:text-[#111312]"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("GRID");
                setCurrentPage(1);
              }}
              className={`h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-medium transition-all ${
                viewMode === "GRID"
                  ? "bg-[#111312] text-white shadow-xs"
                  : "text-[#68707D] hover:text-[#111312]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DIRECTORY DATA TABLE OR BENTO CARD GRID                                */}
      {/* ========================================================================= */}
      {viewMode === "GRID" ? (
        <div className="space-y-4">
          {paginatedEmployees.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E6E8EC] py-14 text-center text-[#68707D] text-xs">
              No employees matching the search and filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedEmployees.map((emp) => {
                const dept = departments.find((d) => d.id === emp.departmentId);
                const desig = designations.find((d) => d.id === emp.designationId);
                const branch = branches.find((b) => b.id === emp.branchId);
                return (
                  <div
                    key={emp.id}
                    onClick={() => navigate(`/people/employees/${emp.id}`)}
                    className="group bg-white rounded-3xl border border-[#E6E8EC] p-5 shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:border-[#A3E635]/70 hover:shadow-[0_8px_24px_rgba(17,19,18,0.06)] transition-all cursor-pointer flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={emp.avatar}
                          name={`${emp.firstName} ${emp.lastName}`}
                          size="md"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#111312] truncate">
                            {emp.firstName} {emp.lastName}
                          </h3>
                          <p className="text-xs text-[#68707D] truncate">
                            {desig?.title || "Staff Member"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(emp.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F0F2F5] text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#9AA2AF] block">
                          Department
                        </span>
                        <span className="font-medium text-[#111312] truncate block">
                          {dept?.name || "General"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#9AA2AF] block">
                          Branch
                        </span>
                        <span className="font-medium text-[#111312] truncate block">
                          {branch?.name || "Pune HQ"}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between pt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-mono text-[11px] font-semibold text-[#111312] bg-[#F7F8FA] border border-[#E6E8EC] px-2.5 py-0.5 rounded-full">
                        {emp.employeeCode}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/people/employees/${emp.id}`)}
                          className="px-3 py-1 rounded-full bg-[#111312] text-[#A3E635] text-[11px] font-semibold hover:bg-[#232725] transition-colors"
                        >
                          Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid Pagination Bar */}
          <div className="bg-white rounded-3xl border border-[#E6E8EC] px-5 py-3.5 flex items-center justify-between text-xs text-[#68707D]">
            <div>
              Showing{" "}
              <span className="font-semibold text-[#111312]">
                {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[#111312]">
                {Math.min(currentPage * pageSize, filteredEmployees.length)}
              </span>{" "}
              of <span className="font-semibold text-[#111312]">{filteredEmployees.length}</span> employees
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                className="rounded-full border-[#E6E8EC] text-[#111312] text-xs h-7 px-3"
              >
                Prev
              </Button>
              <span className="px-2 font-semibold text-[#111312]">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                className="rounded-full border-[#E6E8EC] text-[#111312] text-xs h-7 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
      <div className="bg-white rounded-3xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-[#F0F2F5] text-[11px] uppercase tracking-wider text-[#68707D] font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                {!isEmployee && <th className="py-3 px-4">Onboarding Docs</th>}
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-[#68707D] text-xs">
                    No employees matching the search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const dept = departments.find((d) => d.id === emp.departmentId);
                  const desig = designations.find((d) => d.id === emp.designationId);
                  const branch = branches.find((b) => b.id === emp.branchId);
                  const docStat = getEmployeeDocStatus(emp);

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#F7F8FA] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/people/employees/${emp.id}`)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={emp.avatar}
                            name={`${emp.firstName} ${emp.lastName}`}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-[#111312] group-hover:text-[#111312] transition-colors flex items-center gap-1.5">
                              <span>{emp.firstName} {emp.lastName}</span>
                              {emp.familyDetails && (
                                <span
                                  className="inline-block w-2 h-2 rounded-full bg-[#188038]"
                                  title="Full Profile Completed"
                                />
                              )}
                            </div>
                            <div className="text-[11px] text-[#68707D]">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-[#111312] bg-[#F7F8FA] border border-[#E6E8EC] px-2.5 py-0.5 rounded-full inline-block">
                          {emp.employeeCode}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 font-medium text-[#111312]">
                        {dept?.name || "General"}
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-4 text-[#68707D]">
                        {desig?.title || "Staff Member"}
                      </td>

                      {/* Onboarding Documents Status (Admin & Manager) */}
                      {!isEmployee && (
                        <td className="py-3 px-4">
                          {(() => {
                            const dossier = getCandidateDossier(emp.id);
                            if (dossier?.status === "SUBMITTED" || dossier?.status === "RESUBMITTED") {
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReviewingEmployee(emp);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFCCB] text-[#111312] border border-[#A3E635]/40 hover:bg-[#111312] hover:text-[#A3E635] transition-colors cursor-pointer"
                                  title="Candidate submitted onboarding dossier. Click to review."
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#111312] animate-pulse" />
                                  <span>Review Dossier</span>
                                </button>
                              );
                            }
                            if (dossier?.status === "APPROVED" || emp.onboardingCompleted) {
                              return (
                                <Badge variant="success" size="sm" dot>
                                  Verified
                                </Badge>
                              );
                            }
                            return (
                              <Badge variant="warning" size="sm" dot>
                                Docs Pending
                              </Badge>
                            );
                          })()}
                        </td>
                      )}

                      {/* Branch */}
                      <td className="py-3 px-4 text-[#68707D] text-[11px]">
                        {branch?.name || "Pune HQ"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{getStatusBadge(emp.status)}</td>

                      {/* Actions: Strictly Scoped per Role */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. View Profile (All Roles) */}
                          <button
                            onClick={() => navigate(`/people/employees/${emp.id}`)}
                            className="p-1.5 rounded-lg text-[#68707D] hover:text-[#1B2430] hover:bg-[#F0F4F8] transition-colors"
                            title="View Employee Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. Employee Role: Mail action */}
                          {isEmployee && (
                            <a
                              href={`mailto:${emp.email}`}
                              className="p-1.5 rounded-lg text-[#111312] hover:text-[#3F6212] hover:bg-[#ECFCCB] transition-colors"
                              title={`Email ${emp.firstName}`}
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}

                          {/* 3. Manager & Admin Actions: Jump to attendance & leaves */}
                          {!isEmployee && (
                            <>
                              <button
                                onClick={() => navigate(`/time/attendance?emp=${emp.id}`)}
                                className="p-1.5 rounded-lg text-[#68707D] hover:text-[#188038] hover:bg-[#E6F4EA] transition-colors"
                                title="View Attendance"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/leave/requests?emp=${emp.id}`)}
                                className="p-1.5 rounded-lg text-[#68707D] hover:text-[#111312] hover:bg-[#ECFCCB] transition-colors"
                                title="View Leaves"
                              >
                                <CalendarCheck2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* 4. Super Admin & HR Admin Exclusive Controls */}
                          {(isSuperAdmin || isHrAdmin) && (
                            <>
                              <button
                                onClick={() => setReviewingEmployee(emp)}
                                className="p-1.5 rounded-lg text-[#111312] hover:text-[#3F6212] hover:bg-[#ECFCCB] transition-colors"
                                title="Inspect Candidate Onboarding Dossier"
                              >
                                <FileCheck className="w-4 h-4" />
                              </button>

                              {docStat.isPending && (
                                <button
                                  onClick={() => handleApproveOnboarding(emp)}
                                  className="p-1.5 rounded-lg text-[#188038] hover:text-[#136c30] hover:bg-[#E6F4EA] transition-colors"
                                  title="Approve Onboarding & Activate Employee"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleSendSingleCredentials(emp)}
                                className="p-1.5 rounded-lg text-[#111312] hover:text-[#3F6212] hover:bg-[#ECFCCB] transition-colors"
                                title="Send Portal Credentials"
                              >
                                <Send className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setEmployeeToDelete(emp)}
                                className="p-1.5 rounded-lg text-[#68707D] hover:text-[#C62828] hover:bg-[#FCE8E6] transition-colors"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 border-t border-[#F0F2F5] bg-[#F7F8FA] flex items-center justify-between text-xs text-[#68707D]">
          <div>
            Showing{" "}
            <span className="font-semibold text-[#111312]">
              {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#111312]">
              {Math.min(currentPage * pageSize, filteredEmployees.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#111312]">
              {filteredEmployees.length}
            </span>{" "}
            employees
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              className="rounded-full border-[#E6E8EC] text-[#111312] text-xs h-7 px-3"
            >
              Prev
            </Button>

            <span className="px-2 font-semibold text-[#111312]">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              className="rounded-full border-[#E6E8EC] text-[#111312] text-xs h-7 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Delete Confirmation Dialog (Admin only) */}
      {(isSuperAdmin || isHrAdmin) && (
        <ConfirmDialog
          isOpen={!!employeeToDelete}
          onClose={() => setEmployeeToDelete(null)}
          onConfirm={() => {
            if (employeeToDelete) {
              deleteEmployee(employeeToDelete.id);
              setEmployeeToDelete(null);
            }
          }}
          title={`Delete Employee ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}?`}
          description="Deleting this employee will remove them from active HR rosters, attendance, and payroll processing. This action cannot be undone."
          confirmText="Delete Employee"
          variant="danger"
        />
      )}

      {/* Standalone CTC Calculator Modal (Admin only) */}
      {(isSuperAdmin || isHrAdmin) && (
        <CtcCalculatorModal
          isOpen={isCtcCalculatorOpen}
          onClose={() => setIsCtcCalculatorOpen(false)}
          initialGross={25000}
        />
      )}

      {/* HR Candidate Onboarding Dossier Slide-over Drawer */}
      <DossierReviewDrawer
        isOpen={Boolean(reviewingEmployee)}
        onClose={() => setReviewingEmployee(null)}
        employee={reviewingEmployee}
      />
    </div>
  );
}
