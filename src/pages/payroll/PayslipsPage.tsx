import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Eye,
  Download,
  Printer,
  Search,
  RotateCcw,
  Receipt,
  CheckCircle2,
  Building2,
  Wallet,
  Landmark,
  ShieldCheck,
  FileCheck,
  FileText,
  Calendar,
  Users,
  Lock,
  ArrowUpRight,
  CreditCard,
  Percent,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { PayrollRecord } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { PayslipModal } from "./PayslipModal";
import { formatINR, exportToCsv, formatDate } from "../../lib/utils";

export function PayslipsPage() {
  const { payroll, employees, departments, designations, branches, salaryStructures } = useHrms();
  const { user } = useAuth();

  const role = user?.role || "EMPLOYEE";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isHrAdmin = role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  // Resolved current employee identity
  const currentEmployee = useMemo(() => {
    if (isSuperAdmin && !user?.employeeId) return null;
    return (
      employees.find(
        (e) => e.id === user?.employeeId || e.employeeCode === user?.employeeId
      ) ||
      (isEmployee
        ? employees.find((e) => e.employeeCode === "EMP-1004") || employees[3]
        : isManager
        ? employees.find((e) => e.employeeCode === "EMP-1003") || employees[2]
        : isHrAdmin
        ? employees.find((e) => e.employeeCode === "EMP-1002") || employees[1]
        : null)
    );
  }, [employees, user?.employeeId, role, isSuperAdmin, isEmployee, isManager, isHrAdmin]);

  // Tab State: Manager & HR Admin can switch views
  const [activeTab, setActiveTab] = useState<"CORPORATE_REGISTER" | "MY_PAYSLIPS" | "TEAM_COMPENSATION">(() => {
    if (isSuperAdmin || isHrAdmin) return "CORPORATE_REGISTER";
    return "MY_PAYSLIPS";
  });

  // Modal State for viewing/printing a payslip
  const [viewingRecord, setViewingRecord] = useState<PayrollRecord | null>(null);

  // Corporate Filters
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // =========================================================================
  // 1. DATA COMPUTATION - CORPORATE REGISTER (Super Admin / HR Admin)
  // =========================================================================
  const filteredCorporatePayroll = useMemo(() => {
    return payroll.filter((p) => {
      const emp = employees.find((e) => e.id === p.employeeId);
      if (!emp) return false;

      const matchesMonth = selectedMonth === "ALL" || p.month === selectedMonth;
      const matchesDept = selectedDept === "ALL" || emp.departmentId === selectedDept;
      const matchesBranch = selectedBranch === "ALL" || emp.branchId === selectedBranch;
      const matchesSearch =
        searchQuery === "" ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesMonth && matchesDept && matchesBranch && matchesSearch;
    });
  }, [payroll, employees, selectedMonth, selectedDept, selectedBranch, searchQuery]);

  const totalGrossDisbursed = filteredCorporatePayroll.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalDeductionsDisbursed = filteredCorporatePayroll.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalNetDisbursed = filteredCorporatePayroll.reduce((sum, p) => sum + p.netSalary, 0);

  // Export full bank NEFT disbursal register
  const handleExportCSV = () => {
    const headers = [
      "Pay Period",
      "Employee Code",
      "Employee Name",
      "Department",
      "Branch",
      "Bank Name",
      "Account Number",
      "IFSC Code",
      "Gross Salary (INR)",
      "Total Deductions (INR)",
      "Net Take-Home (INR)",
      "Payment Mode",
      "Disbursement Status",
    ];

    const rows = filteredCorporatePayroll.map((p) => {
      const emp = employees.find((e) => e.id === p.employeeId);
      const dept = departments.find((d) => d.id === emp?.departmentId);
      const branch = branches.find((b) => b.id === emp?.branchId);
      return [
        p.monthName,
        emp?.employeeCode || p.employeeId,
        `${emp?.firstName || ""} ${emp?.lastName || ""}`,
        dept?.name || "N/A",
        branch?.name || "N/A",
        emp?.bankName || "HDFC Bank",
        emp?.accountNumber || "987654321012",
        emp?.ifscCode || "HDFC0001234",
        p.grossSalary,
        p.totalDeductions,
        p.netSalary,
        p.paymentMode,
        p.status,
      ];
    });

    exportToCsv("GA_HRMS_Corporate_Salary_Register", headers, rows);
  };

  const resetFilters = () => {
    setSelectedMonth("ALL");
    setSelectedDept("ALL");
    setSelectedBranch("ALL");
    setSearchQuery("");
  };

  // =========================================================================
  // 2. DATA COMPUTATION - MANAGER TEAM COMPENSATION
  // =========================================================================
  const directReports = useMemo(() => {
    if (!currentEmployee) return [];
    return employees.filter(
      (e) =>
        e.managerId === currentEmployee.id ||
        e.managerId === user?.employeeId ||
        (e.departmentId === currentEmployee.departmentId && e.id !== currentEmployee.id)
    );
  }, [employees, currentEmployee, user?.employeeId]);

  const teamPayroll = useMemo(() => {
    return payroll.filter((p) => {
      const isTeam = directReports.some((dr) => dr.id === p.employeeId);
      if (!isTeam) return false;
      const matchesMonth = selectedMonth === "ALL" || p.month === selectedMonth;
      const matchesSearch =
        searchQuery === "" ||
        employees.find((e) => e.id === p.employeeId)?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employees.find((e) => e.id === p.employeeId)?.lastName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  }, [payroll, directReports, selectedMonth, searchQuery, employees]);

  const totalTeamGross = teamPayroll.reduce((sum, p) => sum + p.grossSalary, 0);

  // =========================================================================
  // 3. DATA COMPUTATION - EMPLOYEE / PERSONAL PAYSLIPS
  // =========================================================================
  const myPayrollRecords = useMemo(() => {
    const targetEmpId = currentEmployee?.id || user?.employeeId || "EMP-1004";
    const records = payroll.filter((p) => p.employeeId === targetEmpId);
    if (records.length > 0) return records;
    // Fallback demo slips for Ananya Iyer or current user
    return payroll.slice(0, 3).map((p) => ({
      ...p,
      employeeId: targetEmpId,
    }));
  }, [payroll, currentEmployee?.id, user?.employeeId]);

  const latestSlip = myPayrollRecords[0] || payroll[0];
  const ytdGross = myPayrollRecords.reduce((sum, p) => sum + p.grossSalary, 0);
  const ytdDeductions = myPayrollRecords.reduce((sum, p) => sum + p.totalDeductions, 0);
  const ytdNet = myPayrollRecords.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            {isEmployee || activeTab === "MY_PAYSLIPS"
              ? "My Salary Slips & Tax Documents"
              : activeTab === "TEAM_COMPENSATION"
              ? "Team Compensation & Disbursals"
              : "Corporate Salary Register & Disbursal Console"}
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5D6B] mt-1">
            {isEmployee || activeTab === "MY_PAYSLIPS"
              ? "Confidential monthly salary slips, statutory Form 16, and EPF/tax deductions."
              : activeTab === "TEAM_COMPENSATION"
              ? "Direct reports' monthly compensation releases, salary bands, and payslip delivery status."
              : "Pan-organization salary register, statutory deductions audit, and bank NEFT payment exports."}
          </p>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-2">
          {(isSuperAdmin || (isHrAdmin && activeTab === "CORPORATE_REGISTER")) && (
            <Button
              onClick={handleExportCSV}
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-white" />}
              className="bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
            >
              Export Bank NEFT (CSV)
            </Button>
          )}

          {(isEmployee || activeTab === "MY_PAYSLIPS") && latestSlip && (
            <Button
              onClick={() => setViewingRecord(latestSlip)}
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4 text-white" />}
              className="bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
            >
              Print Latest Slip
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROLE TABS (FOR MANAGER AND HR ADMIN)                                  */}
      {/* ========================================================================= */}
      {(isManager || isHrAdmin) && (
        <div className="border-b border-[#DDE3EA] flex gap-6 text-xs font-semibold">
          {isHrAdmin && (
            <button
              onClick={() => setActiveTab("CORPORATE_REGISTER")}
              className={`pb-3 transition-colors flex items-center gap-2 ${
                activeTab === "CORPORATE_REGISTER"
                  ? "text-[#1F8476] border-b-2 border-[#1F8476] font-bold"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Corporate Salary Register</span>
            </button>
          )}

          {isManager && (
            <button
              onClick={() => setActiveTab("MY_PAYSLIPS")}
              className={`pb-3 transition-colors flex items-center gap-2 ${
                activeTab === "MY_PAYSLIPS"
                  ? "text-[#1F8476] border-b-2 border-[#1F8476] font-bold"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>My Payslips</span>
            </button>
          )}

          {isManager && (
            <button
              onClick={() => setActiveTab("TEAM_COMPENSATION")}
              className={`pb-3 transition-colors flex items-center gap-2 ${
                activeTab === "TEAM_COMPENSATION"
                  ? "text-[#1F8476] border-b-2 border-[#1F8476] font-bold"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Direct Reports Compensation ({directReports.length})</span>
            </button>
          )}

          {isHrAdmin && (
            <button
              onClick={() => setActiveTab("MY_PAYSLIPS")}
              className={`pb-3 transition-colors flex items-center gap-2 ${
                activeTab === "MY_PAYSLIPS"
                  ? "text-[#1F8476] border-b-2 border-[#1F8476] font-bold"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>My Personal Payslips</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: EMPLOYEE & "MY PAYSLIPS"                                        */}
      {/* ========================================================================= */}
      {(isEmployee || activeTab === "MY_PAYSLIPS") && (
        <div className="space-y-6">
          {/* A. Personal Telemetry KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Latest Take-Home */}
            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                  Latest Take-Home Pay
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#E6F4EA] text-[#188038] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1B2430] mt-2 font-mono">
                {formatINR(latestSlip?.netSalary || 68500)}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#188038]" />
                <span className="text-[11px] text-[#188038] font-medium">
                  {latestSlip?.monthName || "November 2026"} • Disbursed
                </span>
              </div>
            </div>

            {/* Card 2: YTD Fiscal Earnings */}
            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                  YTD Gross Earnings
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#E0F2F1] text-[#1F8476] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1B2430] mt-2 font-mono">
                {formatINR(ytdGross || 624000)}
              </p>
              <p className="text-[11px] text-[#697586] mt-2">
                FY 2026–27 Cumulative Disbursal
              </p>
            </div>

            {/* Card 3: Statutory Deductions YTD */}
            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                  Total Deductions YTD
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#FCE8E6] text-[#C62828] flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1B2430] mt-2 font-mono">
                {formatINR(ytdDeductions || 76000)}
              </p>
              <p className="text-[11px] text-[#697586] mt-2">
                EPF, ESIC, PT & Monthly TDS
              </p>
            </div>

            {/* Card 4: Tax Regime & Compliance */}
            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                  Tax Compliance
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#FEF7E0] text-[#1B2430] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#E69F00]" />
                </span>
              </div>
              <p className="text-sm font-bold text-[#1B2430] mt-2 font-mono">
                PAN: {currentEmployee?.pan || "ABCDE1234F"}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#697586]">
                <span>New Regime (Sec 115BAC)</span>
                <Badge variant="cyan" size="sm">Active</Badge>
              </div>
            </div>
          </div>

          {/* B. Personal Payslips History Table */}
          <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DDE3EA] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1B2430] text-sm">Monthly Payslip Archive</h3>
                <p className="text-xs text-[#697586] mt-0.5">
                  Official payslips with statutory tax breakdowns and transaction receipts.
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                {myPayrollRecords.length} Statements
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                    <th className="py-3 px-4">Pay Period</th>
                    <th className="py-3 px-4">Gross Earnings</th>
                    <th className="py-3 px-4 text-[#C62828]">Total Deductions</th>
                    <th className="py-3 px-4 font-bold text-[#1B2430]">Net Take-Home</th>
                    <th className="py-3 px-4">Disbursement Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EA]">
                  {myPayrollRecords.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F7F9FB] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#1B2430]">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-[#1F8476]" />
                          <span>{p.monthName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#1B2430] font-mono">
                        {formatINR(p.grossSalary)}
                      </td>
                      <td className="py-3.5 px-4 text-[#C62828] font-medium font-mono">
                        -{formatINR(p.totalDeductions)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1B2430] text-sm font-mono">
                        {formatINR(p.netSalary)}
                      </td>
                      <td className="py-3.5 px-4 text-[#697586]">
                        <div className="flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-[#4B5D6B]" />
                          <span>NEFT Bank Transfer</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="success" size="sm" dot>
                          {p.status === "PROCESSED" ? "PAID" : p.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => setViewingRecord(p)}
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5 text-[#1F8476]" />}
                          className="h-7 text-xs px-2.5 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430]"
                        >
                          View Payslip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* C. Tax Documents & Statutory Compliance Cards */}
          <div>
            <h3 className="text-sm font-bold text-[#1B2430] mb-3">Statutory Compliance & Tax Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2F1] text-[#1F8476] flex items-center justify-center mb-3">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1B2430]">Form 16 (Part A & B)</h4>
                  <p className="text-[11px] text-[#697586] mt-1">
                    Annual TDS certificate issued by GA Enterprise for FY 2025–26.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5 text-[#697586]" />}
                  className="mt-4 w-full text-xs border-[#DDE3EA] hover:bg-[#F7F9FB]"
                  onClick={() => alert("Downloading Form 16 (Part A & B)...")}
                >
                  Download Form 16
                </Button>
              </div>

              <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] text-[#188038] flex items-center justify-center mb-3">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1B2430]">EPF Passbook Statement</h4>
                  <p className="text-[11px] text-[#697586] mt-1">
                    UAN: {currentEmployee?.uan || "101234567890"} • EPFO Portal Sync Active.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowUpRight className="w-3.5 h-3.5 text-[#697586]" />}
                  className="mt-4 w-full text-xs border-[#DDE3EA] hover:bg-[#F7F9FB]"
                  onClick={() => window.open("https://unifiedportal-mem.epfindia.gov.in/memberinterface/", "_blank")}
                >
                  Open EPFO Portal
                </Button>
              </div>

              <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#FEF7E0] text-[#E69F00] flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1B2430]">IT Investment Proofs</h4>
                  <p className="text-[11px] text-[#697586] mt-1">
                    Section 80C, 80D, and HRA proof submission verified by HR.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#188038] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                  <Badge variant="success" size="sm">
                    Approved
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: MANAGER TEAM COMPENSATION                                       */}
      {/* ========================================================================= */}
      {isManager && activeTab === "TEAM_COMPENSATION" && (
        <div className="space-y-6">
          {/* Team Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                Direct Reports Managed
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1B2430]">{directReports.length}</span>
                <span className="text-xs text-[#697586]">team members</span>
              </div>
              <p className="text-[11px] text-[#188038] mt-2 font-medium">
                100% Assigned to your engineering hierarchy
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                Monthly Team Payroll
              </span>
              <p className="text-2xl font-bold text-[#1B2430] mt-2 font-mono">
                {formatINR(totalTeamGross)}
              </p>
              <p className="text-[11px] text-[#697586] mt-2">
                Active headcount compensation for November 2026
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                Payslip Release Status
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#188038]">
                  {teamPayroll.length} / {directReports.length}
                </span>
                <span className="text-xs text-[#697586]">disbursed</span>
              </div>
              <p className="text-[11px] text-[#188038] mt-2 font-medium">
                All team payslips released and accessible
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#DDE3EA] shadow-xs flex items-center gap-3 flex-wrap justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#697586] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search direct report by name..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] placeholder-[#697586] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 px-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              >
                <option value="ALL">All Pay Months</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
              </select>

              {(selectedMonth !== "ALL" || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="h-9 px-2.5 text-xs text-[#697586] hover:text-[#1B2430] hover:bg-[#F7F9FB] rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Direct Reports Table */}
          <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                    <th className="py-3 px-4">Direct Report</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Pay Period</th>
                    <th className="py-3 px-4">Gross Compensation</th>
                    <th className="py-3 px-4 font-bold text-[#1B2430]">Net Disbursed</th>
                    <th className="py-3 px-4">Payslip Release</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EA]">
                  {teamPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#697586]">
                        No direct report payroll records found.
                      </td>
                    </tr>
                  ) : (
                    teamPayroll.map((p) => {
                      const emp = employees.find((e) => e.id === p.employeeId);
                      const desig = designations.find((d) => d.id === emp?.designationId);
                      return (
                        <tr key={p.id} className="hover:bg-[#F7F9FB] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={emp?.avatar}
                                name={`${emp?.firstName} ${emp?.lastName}`}
                                size="xs"
                              />
                              <div>
                                <span className="font-semibold text-[#1B2430] block text-xs">
                                  {emp?.firstName} {emp?.lastName}
                                </span>
                                <span className="text-[11px] text-[#697586] font-mono">
                                  {emp?.employeeCode}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-[#1B2430]">
                            {desig?.title || "Engineer"}
                          </td>

                          <td className="py-3.5 px-4 font-medium text-[#1B2430]">
                            {p.monthName}
                          </td>

                          <td className="py-3.5 px-4 font-medium text-[#1B2430] font-mono">
                            {formatINR(p.grossSalary)}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-[#1B2430] font-mono">
                            {formatINR(p.netSalary)}
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge variant="success" size="sm" dot>
                              Disbursed
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Button
                              onClick={() => setViewingRecord(p)}
                              variant="outline"
                              size="sm"
                              leftIcon={<Eye className="w-3.5 h-3.5 text-[#1F8476]" />}
                              className="h-7 text-xs px-2.5 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430]"
                            >
                              View Slip
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW: CORPORATE REGISTER (SUPER ADMIN & HR ADMIN)                     */}
      {/* ========================================================================= */}
      {(isSuperAdmin || (isHrAdmin && activeTab === "CORPORATE_REGISTER")) && (
        <div className="space-y-6">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                Total Slips Generated
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1B2430]">{filteredCorporatePayroll.length}</span>
                <span className="text-xs text-[#697586]">records</span>
              </div>
              <p className="text-[11px] text-[#188038] mt-2 font-medium">Across all 4 company branches</p>
            </div>

            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                Gross Disbursed
              </span>
              <p className="text-2xl font-bold text-[#1B2430] mt-1 font-mono">
                {formatINR(totalGrossDisbursed)}
              </p>
              <p className="text-[11px] text-[#697586] mt-2">Before statutory deductions</p>
            </div>

            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                Statutory Deductions
              </span>
              <p className="text-2xl font-bold text-[#C62828] mt-1 font-mono">
                {formatINR(totalDeductionsDisbursed)}
              </p>
              <p className="text-[11px] text-[#697586] mt-2">EPF, ESIC, PT & TDS withheld</p>
            </div>

            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#697586]">
                Net Take-Home Disbursed
              </span>
              <p className="text-2xl font-bold text-[#188038] mt-1 font-mono">
                {formatINR(totalNetDisbursed)}
              </p>
              <p className="text-[11px] text-[#697586] mt-2">Credited via bank NEFT transfers</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#DDE3EA] shadow-xs flex items-center gap-3 flex-wrap justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#697586] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee name or code..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] placeholder-[#697586] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 px-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              >
                <option value="ALL">All Pay Months</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
              </select>

              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="h-9 px-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 px-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {(selectedMonth !== "ALL" || selectedDept !== "ALL" || selectedBranch !== "ALL" || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="h-9 px-2.5 text-xs text-[#697586] hover:text-[#1B2430] hover:bg-[#F7F9FB] rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Payslips Table */}
          <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Branch & Dept</th>
                    <th className="py-3 px-4">Pay Period</th>
                    <th className="py-3 px-4">Gross Earnings</th>
                    <th className="py-3 px-4 text-[#C62828]">Deductions</th>
                    <th className="py-3 px-4 font-bold text-[#1B2430]">Net Take-Home</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EA]">
                  {filteredCorporatePayroll.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="w-10 h-10 rounded-full bg-[#F7F9FB] flex items-center justify-center mx-auto mb-2 text-[#697586]">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-[#1B2430]">No Payslips Found</p>
                        <p className="text-xs text-[#697586] mt-1">
                          No records match the selected month, branch, department, or search filters.
                        </p>
                        {(selectedMonth !== "ALL" || selectedDept !== "ALL" || selectedBranch !== "ALL" || searchQuery) && (
                          <button
                            onClick={resetFilters}
                            className="mt-3 text-xs text-[#1F8476] hover:underline font-medium"
                          >
                            Reset active filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredCorporatePayroll.map((p) => {
                      const emp = employees.find((e) => e.id === p.employeeId);
                      const dept = departments.find((d) => d.id === emp?.departmentId);
                      const branch = branches.find((b) => b.id === emp?.branchId);
                      return (
                        <tr key={p.id} className="hover:bg-[#F7F9FB] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={emp?.avatar}
                                name={`${emp?.firstName} ${emp?.lastName}`}
                                size="xs"
                              />
                              <div>
                                <span className="font-semibold text-[#1B2430] block text-xs">
                                  {emp?.firstName} {emp?.lastName}
                                </span>
                                <span className="text-[11px] text-[#697586] font-mono">{emp?.employeeCode}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-[#697586]">
                            <span className="text-[#1B2430] font-medium block">{dept?.name || "Operations"}</span>
                            <span className="text-[10px] text-[#697586]">{branch?.name || "Pune HQ"}</span>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-[#1B2430]">
                            {p.monthName}
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-[#1B2430] font-mono">
                            {formatINR(p.grossSalary)}
                          </td>

                          <td className="py-3.5 px-4 text-[#C62828] font-semibold font-mono">
                            -{formatINR(p.totalDeductions)}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-[#1B2430] font-mono">
                            {formatINR(p.netSalary)}
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge variant="success" size="sm" dot>
                              {p.status === "PROCESSED" ? "PAID" : p.status}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Button
                              onClick={() => setViewingRecord(p)}
                              variant="outline"
                              size="sm"
                              leftIcon={<Eye className="w-3.5 h-3.5 text-[#1F8476]" />}
                              className="h-7 text-xs px-2.5 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430]"
                            >
                              View Payslip
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: DETAILED PAYSLIP PREVIEW & PDF DOWNLOAD                        */}
      {/* ========================================================================= */}
      <PayslipModal
        isOpen={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        payrollRecord={viewingRecord}
      />
    </div>
  );
}
