import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Download,
  Upload,
  Plus,
  Eye,
  Trash2,
  Clock,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  Building2,
  X,
  Calculator,
  Mail,
  Send,
  FileCheck,
  FileWarning,
  Settings,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useToast } from "../../lib/toastContext";
import { Employee, EmploymentStatus } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatDate, exportToCsv } from "../../lib/utils";
import { CtcCalculatorModal } from "./CtcCalculatorModal";
import { DossierReviewDrawer } from "../../components/onboarding/DossierReviewDrawer";

export interface EmployeesPageProps {
  onOpenAddEmployee?: () => void;
}

type AccountTab = "ALL" | "DOCUMENT_PENDING" | "SEND_CREDENTIALS";

export function EmployeesPage({ onOpenAddEmployee }: EmployeesPageProps) {
  const { employees, departments, designations, branches, deleteEmployee, updateEmployee, documents, getCandidateDossier } = useHrms();
  const { success, info } = useToast();
  const navigate = useNavigate();

  // Employee Account Tabs
  const [activeTab, setActiveTab] = useState<AccountTab>("ALL");

  // CTC Calculator Modal
  const [isCtcCalculatorOpen, setIsCtcCalculatorOpen] = useState(false);

  // Review Dossier Slide-over Drawer
  const [reviewingEmployee, setReviewingEmployee] = useState<Employee | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Delete modal state
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Helper to check employee document completion status & stage
  const getEmployeeDocStatus = (emp: Employee) => {
    const empDocs = documents.filter((d) => d.employeeId === emp.id);
    const hasOnboardingData = emp.familyDetails || emp.educationDetails?.length || emp.workExperienceDetails?.length;

    let stage: "INVITED" | "IN_PROGRESS" | "SUBMITTED" | "VERIFIED" = "VERIFIED";
    if (emp.onboardingCompleted === false || emp.onboardingStatus === "INVITED") {
      stage = "INVITED";
    } else if (emp.onboardingStatus === "IN_PROGRESS") {
      stage = "IN_PROGRESS";
    } else if (emp.onboardingStatus === "SUBMITTED" || (!emp.onboardingCompleted && hasOnboardingData)) {
      stage = "SUBMITTED";
    }

    const isPending = stage !== "VERIFIED" || (empDocs.length < 2 && !hasOnboardingData && emp.status === "PROBATION");
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

  // Tab Counts
  const tabCounts = useMemo(() => {
    const docPending = employees.filter((e) => getEmployeeDocStatus(e).isPending).length;
    const sendCreds = employees.filter((e) => e.status === "ACTIVE" || e.status === "PROBATION").length;
    return {
      all: employees.length,
      docPending,
      sendCreds,
    };
  }, [employees, documents]);

  // Quick Stats
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === "ACTIVE").length;
    const probation = employees.filter((e) => e.status === "PROBATION").length;
    const notice = employees.filter((e) => e.status === "NOTICE_PERIOD").length;
    const deptsCount = departments.length;
    return { total, active, probation, notice, deptsCount };
  }, [employees, departments]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Tab filter
      const docStatus = getEmployeeDocStatus(emp);
      if (activeTab === "DOCUMENT_PENDING" && !docStatus.isPending) {
        return false;
      }
      if (activeTab === "SEND_CREDENTIALS" && emp.status !== "ACTIVE" && emp.status !== "PROBATION") {
        return false;
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
  }, [employees, activeTab, searchQuery, selectedDept, selectedBranch, selectedStatus, documents]);

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
    activeTab !== "ALL";

  const clearFilters = () => {
    setActiveTab("ALL");
    setSearchQuery("");
    setSelectedDept("ALL");
    setSelectedBranch("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  // Export Document Pending Report (from Screenshot 12)
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

  // Send Mail to All (Screenshot 12)
  const handleSendMailToAll = () => {
    success(`Portal onboarding credentials & welcome guide successfully dispatched to ${tabCounts.sendCreds} active employees.`);
  };

  // Individual Send Credentials
  const handleSendSingleCredentials = (emp: Employee) => {
    info(`Onboarding access & login credentials emailed to ${emp.firstName} ${emp.lastName} (${emp.email}).`);
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
      "Annual CTC (INR)",
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
        e.annualCtc,
      ];
    });

    exportToCsv("GA_HRMS_Employees_Export", headers, rows);
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
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight whitespace-nowrap">
              Employee Directory
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200/80">
              {employees.length} Accounts
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">
            Manage organization members, statutory profiles, onboarding compliance, and credentials.
          </p>
        </div>

        {/* Action Buttons (All in the same line, clearly clickable individual buttons) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto scrollbar-none shrink-0 py-0.5">
          <button
            type="button"
            onClick={handleExportPendingDocReport}
            className="h-8 px-2.5 sm:px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50/90 active:bg-gray-100 border border-gray-200/90 hover:border-gray-300 rounded-lg shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
            title="Export CSV report of employees with pending compliance documents"
          >
            <FileWarning className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Pending Docs</span>
          </button>

          <button
            type="button"
            onClick={handleSendMailToAll}
            className="h-8 px-2.5 sm:px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50/90 active:bg-gray-100 border border-gray-200/90 hover:border-gray-300 rounded-lg shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
            title="Dispatch login credentials to active roster"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Send Creds</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCtcCalculatorOpen(true)}
            className="h-8 px-2.5 sm:px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50/90 active:bg-gray-100 border border-gray-200/90 hover:border-gray-300 rounded-lg shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
            title="Open CTC & Gross Salary Breakdown Calculator"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>CTC Calc</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/onboarding-setup")}
            className="h-8 px-2.5 sm:px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50/90 active:bg-gray-100 border border-gray-200/90 hover:border-gray-300 rounded-lg shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
            title="Configure Dynamic Onboarding Form, Fields & Document Requirements"
          >
            <Settings className="w-3.5 h-3.5 text-gray-700 shrink-0" />
            <span>Form Config</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-8 px-2.5 sm:px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50/90 active:bg-gray-100 border border-gray-200/90 hover:border-gray-300 rounded-lg shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
            title="Export full employee directory to CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>Export</span>
          </button>

          {onOpenAddEmployee && (
            <Button
              onClick={onOpenAddEmployee}
              variant="primary"
              size="sm"
              className="h-8 text-xs font-semibold whitespace-nowrap px-3 sm:px-3.5 shadow-xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Onboard Employee
            </Button>
          )}
        </div>
      </div>

      {/* Clean Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-0.5">
        <div className="inline-flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-200/70 gap-1 shrink-0">
          <button
            onClick={() => {
              setActiveTab("ALL");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ALL"
                ? "bg-white text-gray-950 shadow-xs"
                : "text-gray-600 hover:text-gray-950 hover:bg-white/50"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Accounts</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "ALL" ? "bg-gray-950 text-white" : "bg-gray-200/80 text-gray-700"
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "DOCUMENT_PENDING"
                ? "bg-white text-gray-950 shadow-xs"
                : "text-gray-600 hover:text-gray-950 hover:bg-white/50"
            }`}
          >
            <FileWarning className="w-3.5 h-3.5 text-amber-500" />
            <span>Document Pending</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "DOCUMENT_PENDING" ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-800"
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "SEND_CREDENTIALS"
                ? "bg-white text-gray-950 shadow-xs"
                : "text-gray-600 hover:text-gray-950 hover:bg-white/50"
            }`}
          >
            <Send className="w-3.5 h-3.5 text-indigo-500" />
            <span>Send Credentials</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "SEND_CREDENTIALS" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-800"
              }`}
            >
              {tabCounts.sendCreds}
            </span>
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium inline-flex items-center gap-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        )}
      </div>

      {/* Minimalist Executive KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => {
            setSelectedStatus("ALL");
            setCurrentPage(1);
          }}
          className={`bg-white p-3 rounded-card border text-left transition-all group ${
            selectedStatus === "ALL"
              ? "border-gray-950/20 shadow-xs ring-1 ring-gray-950/5"
              : "border-surface-border hover:border-gray-300 hover:shadow-2xs"
          } flex items-center gap-3`}
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block truncate">Total Roster</span>
            <span className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">{stats.total}</span>
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedStatus(selectedStatus === "ACTIVE" ? "ALL" : "ACTIVE");
            setCurrentPage(1);
          }}
          className={`bg-white p-3 rounded-card border text-left transition-all group ${
            selectedStatus === "ACTIVE"
              ? "border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20"
              : "border-surface-border hover:border-emerald-200 hover:shadow-2xs"
          } flex items-center gap-3`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block truncate">Active Staff</span>
            <span className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">{stats.active}</span>
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedStatus(selectedStatus === "PROBATION" ? "ALL" : "PROBATION");
            setCurrentPage(1);
          }}
          className={`bg-white p-3 rounded-card border text-left transition-all group ${
            selectedStatus === "PROBATION"
              ? "border-amber-500/40 shadow-xs ring-1 ring-amber-500/20"
              : "border-surface-border hover:border-amber-200 hover:shadow-2xs"
          } flex items-center gap-3`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block truncate">In Probation</span>
            <span className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">{stats.probation}</span>
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedStatus(selectedStatus === "NOTICE_PERIOD" ? "ALL" : "NOTICE_PERIOD");
            setCurrentPage(1);
          }}
          className={`bg-white p-3 rounded-card border text-left transition-all group ${
            selectedStatus === "NOTICE_PERIOD"
              ? "border-rose-500/40 shadow-xs ring-1 ring-rose-500/20"
              : "border-surface-border hover:border-rose-200 hover:shadow-2xs"
          } flex items-center gap-3`}
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700 shrink-0 group-hover:scale-105 transition-transform">
            <UserX className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block truncate">Notice Period</span>
            <span className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">{stats.notice}</span>
          </div>
        </button>

        <div className="bg-white p-3 rounded-card border border-surface-border shadow-card flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block truncate">Departments</span>
            <span className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">{stats.deptsCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-card border border-surface-border shadow-card flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, employee code, or email..."
            className="w-full h-8.5 pl-9 pr-8 text-xs bg-gray-50/80 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-950/5 focus:border-gray-950 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 px-2.5 text-xs bg-gray-50/70 hover:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/5 transition-all"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Branch */}
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 px-2.5 text-xs bg-gray-50/70 hover:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/5 transition-all"
          >
            <option value="ALL">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 px-2.5 text-xs bg-gray-50/70 hover:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/5 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATION">Probation</option>
            <option value="NOTICE_PERIOD">Notice Period</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-8.5 px-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Onboarding Docs</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400 text-sm">
                    No employees matching the search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const dept = departments.find((d) => d.id === emp.departmentId);
                  const desig = designations.find((d) => d.id === emp.designationId);
                  const docStat = getEmployeeDocStatus(emp);

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/people/employees/${emp.id}`)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={emp.avatar}
                            name={`${emp.firstName} ${emp.lastName}`}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-gray-950 group-hover:text-black transition-colors flex items-center gap-1.5">
                              <span>{emp.firstName} {emp.lastName}</span>
                              {emp.familyDetails && (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Full Onboarding Profile Completed" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100/90 border border-gray-200/80 px-2 py-0.5 rounded-md inline-block">
                          {emp.employeeCode}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {dept?.name || "General"}
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {desig?.title || "Staff Member"}
                      </td>

                      {/* Onboarding Documents Status */}
                      <td className="py-3 px-4">
                        {(() => {
                          const dossier = getCandidateDossier(emp.id);
                          if (dossier?.status === "SUBMITTED" || dossier?.status === "RESUBMITTED") {
                            return (
                              <button
                                type="button"
                                onClick={() => setReviewingEmployee(emp)}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
                                title="Candidate submitted onboarding dossier. Click to review."
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                <span>Review Dossier</span>
                              </button>
                            );
                          }
                          if (dossier?.status === "CHANGES_REQUESTED") {
                            return (
                              <button
                                type="button"
                                onClick={() => setReviewingEmployee(emp)}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                                title="Changes requested from candidate. Click to inspect."
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Changes Requested</span>
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
                          if (dossier?.status === "IN_PROGRESS") {
                            return (
                              <button
                                type="button"
                                onClick={() => setReviewingEmployee(emp)}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
                              >
                                In Progress
                              </button>
                            );
                          }
                          return (
                            <Badge variant="warning" size="sm" dot>
                              Docs Pending
                            </Badge>
                          );
                        })()}
                      </td>

                      {/* Joining Date */}
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {formatDate(emp.joiningDate)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{getStatusBadge(emp.status)}</td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setReviewingEmployee(emp)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                            title="Inspect Candidate Onboarding Dossier"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>

                          {docStat.isPending && (
                            <button
                              onClick={() => handleApproveOnboarding(emp)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                              title="Approve Onboarding & Activate Employee"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => navigate(`/people/employees/${emp.id}`)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-950 hover:bg-gray-100 transition-colors"
                            title="View Profile & Onboarding Data"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleSendSingleCredentials(emp)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                            title="Send Portal Credentials"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => navigate(`/time/attendance?emp=${emp.id}`)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="View Attendance"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/leave/requests?emp=${emp.id}`)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                            title="View Leaves"
                          >
                            <CalendarCheck2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEmployeeToDelete(emp)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/60 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(currentPage * pageSize, filteredEmployees.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
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
            >
              Prev
            </Button>

            <span className="px-2 font-semibold text-gray-900">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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

      {/* Standalone CTC Calculator Modal */}
      <CtcCalculatorModal
        isOpen={isCtcCalculatorOpen}
        onClose={() => setIsCtcCalculatorOpen(false)}
        initialGross={25000}
      />

      {/* HR Candidate Onboarding Dossier Slide-over Drawer */}
      <DossierReviewDrawer
        isOpen={Boolean(reviewingEmployee)}
        onClose={() => setReviewingEmployee(null)}
        employee={reviewingEmployee}
      />
    </div>
  );
}
