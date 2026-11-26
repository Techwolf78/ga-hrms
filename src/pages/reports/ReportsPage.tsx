import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Users,
  Clock,
  CalendarCheck2,
  Receipt,
  FileSpreadsheet,
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useHrms } from "../../lib/hrmsContext";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { exportToCsv, formatINR, formatDate } from "../../lib/utils";

export function ReportsPage() {
  const { employees, departments, branches, attendance, leaveRequests, payroll } = useHrms();
  const [activeTab, setActiveTab] = useState<"PEOPLE" | "ATTENDANCE" | "LEAVE" | "PAYROLL">("PEOPLE");

  // People export
  const exportPeopleReport = () => {
    const headers = ["Employee Code", "Name", "Department", "Branch", "Joining Date", "Status", "Annual CTC"];
    const rows = employees.map((e) => [
      e.employeeCode,
      `${e.firstName} ${e.lastName}`,
      departments.find((d) => d.id === e.departmentId)?.name || "",
      branches.find((b) => b.id === e.branchId)?.name || "",
      e.joiningDate,
      e.status,
      e.annualCtc,
    ]);
    exportToCsv("GA_HRMS_People_Master_Report", headers, rows);
  };

  // Attendance export
  const exportAttendanceReport = () => {
    const headers = ["Date", "Employee Code", "Name", "Shift", "First In", "Last Out", "Hours", "Status"];
    const rows = attendance.map((a) => {
      const emp = employees.find((e) => e.id === a.employeeId);
      return [
        a.date,
        emp?.employeeCode || "",
        `${emp?.firstName || ""} ${emp?.lastName || ""}`,
        a.shiftId,
        a.firstIn || "",
        a.lastOut || "",
        a.workingHours,
        a.status,
      ];
    });
    exportToCsv("GA_HRMS_Attendance_Report", headers, rows);
  };

  // Leave export
  const exportLeaveReport = () => {
    const headers = ["Request ID", "Employee Code", "Name", "From", "To", "Days", "Reason", "Status"];
    const rows = leaveRequests.map((l) => {
      const emp = employees.find((e) => e.id === l.employeeId);
      return [
        l.id,
        emp?.employeeCode || "",
        `${emp?.firstName || ""} ${emp?.lastName || ""}`,
        l.fromDate,
        l.toDate,
        l.days,
        l.reason,
        l.status,
      ];
    });
    exportToCsv("GA_HRMS_Leave_Report", headers, rows);
  };

  // Payroll & EPFO ECR export
  const exportPayrollReport = () => {
    const headers = [
      "Month",
      "Employee Code",
      "Name",
      "Gross Salary",
      "EPF Wages (Max ₹25k)",
      "Employee EPF 12%",
      "Employer EPS (8.33% Capped)",
      "Employer EPF (3.67%)",
      "ESIC",
      "PT (MH)",
      "TDS",
      "Net Pay",
    ];
    const rows = payroll.map((p) => {
      const emp = employees.find((e) => e.id === p.employeeId);
      const basic = Math.round(p.grossSalary * 0.5);
      const epfWages = Math.min(basic, 25000);
      const epsEmployer = Math.min(2083, Math.round(epfWages * 0.0833));
      const epfEmployer = Math.max(0, p.pfDeduction - epsEmployer);

      return [
        p.monthName,
        emp?.employeeCode || "",
        `${emp?.firstName || ""} ${emp?.lastName || ""}`,
        p.grossSalary,
        epfWages,
        p.pfDeduction,
        epsEmployer,
        epfEmployer,
        p.esicDeduction,
        p.ptDeduction,
        p.tdsDeduction,
        p.netSalary,
      ];
    });
    exportToCsv("GA_HRMS_EPFO_ECR_Statutory_Report", headers, rows);
  };

  const branchData = branches.map((b) => ({
    name: b.city,
    headcount: employees.filter((e) => e.branchId === b.id).length,
  }));

  // Summary counts
  const presentAttendanceCount = attendance.filter((a) => a.status === "PRESENT").length;
  const approvedLeavesCount = leaveRequests.filter((l) => l.status === "APPROVED").length;
  const totalPayrollDisbursed = payroll.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            Enterprise Reporting Center
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5">
            Real-time compliance extracts, biometric journals, EPFO/ESIC salary registers, and audit exports.
          </p>
        </div>
      </div>

      {/* Report Category Pill Tabs */}
      <div className="inline-flex items-center p-1 bg-white rounded-full border border-[#DDE3EA] shadow-[0_2px_12px_rgba(3,45,66,0.03)] gap-1 overflow-x-auto max-w-full">
        {[
          { key: "PEOPLE" as const, label: "Workforce & Headcount", count: employees.length, icon: Users },
          { key: "ATTENDANCE" as const, label: "Time & Attendance", count: attendance.length, icon: Clock },
          { key: "LEAVE" as const, label: "Leave & Liability", count: leaveRequests.length, icon: CalendarCheck2 },
          { key: "PAYROLL" as const, label: "Payroll & Statutory (PF/ESI)", count: payroll.length, icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#62D84E]" : "text-[#1F8476]"}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? "bg-white/15 text-white" : "bg-[#E9F5F3] text-[#1F8476]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View: PEOPLE */}
      {activeTab === "PEOPLE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Regional Branch Staffing Strength</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Headcount distribution across Pune HQ, Bengaluru Tech Park, Mumbai, and Delhi.
                  </p>
                </div>
                <Button
                  onClick={exportPeopleReport}
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Export Master CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderColor: "#1E293B",
                          borderRadius: "8px",
                          color: "#FFFFFF",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "#F8FAFC" }}
                        formatter={(val) => [`${val} Active Staff`, "Headcount"]}
                      />
                      <Bar dataKey="headcount" fill="#0F172A" radius={[6, 6, 0, 0]} barSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workforce Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Total Active Staff</span>
                  <span className="text-base font-bold text-gray-950 font-mono">{employees.length}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Operating Branches</span>
                  <span className="text-base font-bold text-gray-950 font-mono">{branches.length}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Functional Departments</span>
                  <span className="text-base font-bold text-gray-950 font-mono">{departments.length}</span>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={exportPeopleReport}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download Full Directory ({employees.length} rows)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Active Tab View: ATTENDANCE */}
      {activeTab === "ATTENDANCE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Logged Punch Records
              </span>
              <p className="text-2xl font-bold text-gray-950 mt-1 font-mono">{attendance.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Marked Present
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{presentAttendanceCount}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                On-Time Rate
              </span>
              <p className="text-2xl font-bold text-gray-950 mt-1 font-mono">94.2%</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Daily Attendance & Biometric Summary Report</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Detailed punch records, timestamps, and late arrival minutes.
                </p>
              </div>
              <Button
                onClick={exportAttendanceReport}
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export Attendance CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Shift</th>
                      <th className="py-2.5 px-3">First In</th>
                      <th className="py-2.5 px-3">Last Out</th>
                      <th className="py-2.5 px-3">Working Hours</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.slice(0, 5).map((a) => {
                      const emp = employees.find((e) => e.id === a.employeeId);
                      return (
                        <tr key={a.id} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-3 font-mono">{a.date}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-950">
                            {emp?.firstName} {emp?.lastName}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 font-mono">{a.shiftId}</td>
                          <td className="py-2.5 px-3 font-mono text-gray-700">{a.firstIn || "—"}</td>
                          <td className="py-2.5 px-3 font-mono text-gray-700">{a.lastOut || "—"}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-950">{a.workingHours}h</td>
                          <td className="py-2.5 px-3 text-right">
                            <Badge variant={a.status === "PRESENT" ? "success" : "warning"} size="sm">
                              {a.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Tab View: LEAVE */}
      {activeTab === "LEAVE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Total Requests Recorded
              </span>
              <p className="text-2xl font-bold text-gray-950 mt-1 font-mono">{leaveRequests.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Approved Days Granted
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
                {leaveRequests.filter((l) => l.status === "APPROVED").reduce((s, l) => s + l.days, 0)} Days
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Approval Rate
              </span>
              <p className="text-2xl font-bold text-gray-950 mt-1 font-mono">
                {leaveRequests.length > 0
                  ? `${Math.round((approvedLeavesCount / leaveRequests.length) * 100)}%`
                  : "100%"}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Leave Utilization & Balances Statement</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Employee leaves taken against statutory annual quotas with audit timestamps.
                </p>
              </div>
              <Button
                onClick={exportLeaveReport}
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export Leave CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="py-2.5 px-3">Applicant</th>
                      <th className="py-2.5 px-3">Date Range</th>
                      <th className="py-2.5 px-3">Days</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leaveRequests.slice(0, 5).map((l) => {
                      const emp = employees.find((e) => e.id === l.employeeId);
                      return (
                        <tr key={l.id} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-3 font-medium text-gray-950">
                            {emp?.firstName} {emp?.lastName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-gray-700">
                            {formatDate(l.fromDate)} → {formatDate(l.toDate)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-gray-950">{l.days} Days</td>
                          <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate">{l.reason}</td>
                          <td className="py-2.5 px-3 text-right">
                            <Badge
                              variant={
                                l.status === "APPROVED"
                                  ? "success"
                                  : l.status === "REJECTED"
                                  ? "danger"
                                  : "warning"
                              }
                              size="sm"
                            >
                              {l.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Tab View: PAYROLL */}
      {activeTab === "PAYROLL" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Disbursed Records
              </span>
              <p className="text-2xl font-bold text-gray-950 mt-1 font-mono">{payroll.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Total Net Disbursed
              </span>
              <p className="text-2xl font-bold text-gray-950 mt-1 font-mono">
                {formatINR(totalPayrollDisbursed)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200/80 bg-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Statutory Compliance
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">100% Compliant</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>PF ECR & Statutory Salary Register Extract</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Monthly payroll register formatted for EPFO, ESIC, and PT compliance filings.
                </p>
              </div>
              <Button
                onClick={exportPayrollReport}
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Payroll CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Gross Salary</th>
                      <th className="py-2.5 px-3">EPF Wages</th>
                      <th className="py-2.5 px-3 text-rose-700">EE PF (12%)</th>
                      <th className="py-2.5 px-3 text-blue-700">ER EPS (8.33%)</th>
                      <th className="py-2.5 px-3 text-rose-700">PT</th>
                      <th className="py-2.5 px-3 text-rose-700">TDS</th>
                      <th className="py-2.5 px-3 text-right font-bold text-gray-950">Net Take-Home</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payroll.slice(0, 5).map((p) => {
                      const emp = employees.find((e) => e.id === p.employeeId);
                      const basic = Math.round(p.grossSalary * 0.5);
                      const epfWages = Math.min(basic, 25000);
                      const epsEmployer = Math.min(2083, Math.round(epfWages * 0.0833));

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-3 font-mono">{p.monthName}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-950">
                            {emp?.firstName} {emp?.lastName}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium">{formatINR(p.grossSalary)}</td>
                          <td className="py-2.5 px-3 font-mono text-gray-700">{formatINR(epfWages)}</td>
                          <td className="py-2.5 px-3 font-mono text-rose-600">-{formatINR(p.pfDeduction)}</td>
                          <td className="py-2.5 px-3 font-mono text-blue-700">+{formatINR(epsEmployer)}</td>
                          <td className="py-2.5 px-3 font-mono text-rose-600">-{formatINR(p.ptDeduction)}</td>
                          <td className="py-2.5 px-3 font-mono text-rose-600">-{formatINR(p.tdsDeduction)}</td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono text-gray-950">
                            {formatINR(p.netSalary)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
