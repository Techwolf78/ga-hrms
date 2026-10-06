import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CalendarCheck2,
  AlertTriangle,
  WalletCards,
  UserPlus,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  CalendarPlus,
  Receipt,
  Building2,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "../../lib/authContext";
import { useHrms } from "../../lib/hrmsContext";
import { KpiCard } from "../../components/ui/KpiCard";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatCompactINR, formatINR, cn } from "../../lib/utils";

export interface DashboardPageProps {
  onOpenAddEmployee?: () => void;
  onOpenApplyLeave?: () => void;
}

export function DashboardPage({ onOpenAddEmployee, onOpenApplyLeave }: DashboardPageProps) {
  const { user } = useAuth();
  const {
    employees,
    attendance,
    leaveRequests,
    departments,
    payroll,
    regularizations,
    auditLogs,
    approveLeave,
    approveRegularization,
    settings,
  } = useHrms();
  const navigate = useNavigate();
  const isCompact = !!settings?.compactMode;

  const isSuperOrHr = user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN";
  const isManager = user?.role === "MANAGER";
  const isEmployee = user?.role === "EMPLOYEE";
  const myLeaves = leaveRequests.filter((l) => l.employeeId === (user?.employeeId || "EMP-1004"));

  // Metrics calculation
  const totalEmployees = employees.length;
  const todayStr = "2026-10-06";
  const todayAttendance = attendance.filter((a) => a.date === todayStr);

  const presentCount = todayAttendance.filter((a) => a.status === "PRESENT" || a.status === "LATE" || a.status === "HALF_DAY").length;
  const onLeaveCount = todayAttendance.filter((a) => a.status === "LEAVE").length;
  const lateCount = todayAttendance.filter((a) => a.status === "LATE").length;
  const absentCount = todayAttendance.filter((a) => a.status === "ABSENT").length;
  const halfDayCount = todayAttendance.filter((a) => a.status === "HALF_DAY").length;

  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  const pendingLeaves = leaveRequests.filter((l) => l.status === "PENDING");
  const pendingRegs = regularizations.filter((r) => r.status === "PENDING");

  // Total payroll for latest processed month
  const latestPayroll = payroll.filter((p) => p.month === "2026-09");
  const totalDisbursed = latestPayroll.reduce((sum, p) => sum + p.netSalary, 0);

  // Workforce Headcount Chart Data (Past 6 months trend)
  const headcountData = [
    { month: "May", headcount: 22, payroll: 2900000 },
    { month: "Jun", headcount: 25, payroll: 3300000 },
    { month: "Jul", headcount: 27, payroll: 3600000 },
    { month: "Aug", headcount: 29, payroll: 3950000 },
    { month: "Sep", headcount: 31, payroll: 4300000 },
    { month: "Oct", headcount: totalEmployees, payroll: totalDisbursed || 4500000 },
  ];

  // Attendance Donut Data
  const attendanceDonutData = [
    { name: "Present (On-time)", value: Math.max(0, presentCount - lateCount - halfDayCount), color: "#10B981" },
    { name: "Late Arrival", value: lateCount, color: "#F59E0B" },
    { name: "Half Day", value: halfDayCount, color: "#8B5CF6" },
    { name: "Approved Leave", value: onLeaveCount, color: "#6366F1" },
    { name: "Absent", value: absentCount, color: "#EF4444" },
  ];

  // Department distribution
  const departmentData = departments.map((d) => {
    const deptEmployees = employees.filter((e) => e.departmentId === d.id);
    return {
      name: d.code,
      fullName: d.name,
      employees: deptEmployees.length,
      budget: Math.round(d.budget / 1000000), // in Millions
    };
  });

  return (
    <div className={cn("transition-all duration-200", isCompact ? "space-y-4" : "space-y-6")}>
      {/* Top Welcome Header */}
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-card border border-surface-border shadow-card transition-all",
          isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6"
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={cn(
                "font-bold text-gray-950 tracking-tight",
                isCompact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
              )}
            >
              Good morning, {user?.name.split(" ")[0]} 👋
            </h1>
            <Badge variant="default" size="sm">
              {user?.role.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Here's what's happening across your organization today, 06 Oct 2026.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenApplyLeave && (
            <Button
              onClick={onOpenApplyLeave}
              variant="outline"
              size="md"
              leftIcon={<CalendarPlus className="w-4 h-4 text-emerald-600" />}
            >
              Apply Leave
            </Button>
          )}

          {isSuperOrHr && onOpenAddEmployee && (
            <Button
              onClick={onOpenAddEmployee}
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Employee
            </Button>
          )}

          {isSuperOrHr && (
            <Button
              onClick={() => navigate("/payroll/runs")}
              variant="deep"
              size="md"
              leftIcon={<Receipt className="w-4 h-4" />}
            >
              Run Payroll
            </Button>
          )}
        </div>
      </div>

      {/* Primary KPI Cards Grid (4 Top Pillars) */}
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all", isCompact ? "gap-3" : "gap-4")}>
        <KpiCard
          label="Total Workforce"
          value={totalEmployees}
          icon={<Users className="w-6 h-6 text-gray-700" />}
          trend={{ value: "+4.2%", isPositive: true, label: "vs last month" }}
          subtitle="Across 4 Pan-India branches"
          accentColor="neutral"
          onClick={isEmployee ? undefined : () => navigate("/people/employees")}
        />

        <KpiCard
          label="Present Today"
          value={presentCount}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          trend={{ value: `${attendanceRate}%`, isPositive: attendanceRate >= 90, label: "Turnout" }}
          subtitle={`${Math.max(0, presentCount - lateCount)} on-time punches`}
          accentColor="emerald"
          onClick={() => navigate("/time/attendance")}
        />

        <KpiCard
          label="On Leave Today"
          value={onLeaveCount}
          icon={<CalendarCheck2 className="w-6 h-6 text-indigo-600" />}
          trend={{ value: `${pendingLeaves.length} pending`, isPositive: false }}
          subtitle="Planned leave absences"
          accentColor="indigo"
          onClick={() => navigate(isEmployee ? "/leave/overview" : "/leave/requests")}
        />

        <KpiCard
          label="Late Arrival"
          value={lateCount}
          icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
          trend={{ value: "> 15m grace", isPositive: false }}
          subtitle={`${pendingRegs.length} regularizations req`}
          accentColor="amber"
          onClick={() => navigate(isEmployee ? "/time/attendance" : "/time/regularization")}
        />
      </div>

      {/* Secondary KPI Cards Grid (Financials & Operational Telemetry) */}
      {isEmployee ? (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all", isCompact ? "gap-3" : "gap-4")}>
          <KpiCard
            label="My Designation"
            value={user?.designation?.split(" ")[0] || "Engineer"}
            icon={<Building2 className="w-6 h-6 text-indigo-600" />}
            subtitle={user?.department || "Engineering"}
            accentColor="indigo"
          />

          <KpiCard
            label="My Available Leave"
            value="18.5 Days"
            icon={<CalendarCheck2 className="w-6 h-6 text-emerald-600" />}
            subtitle="Casual + Sick + Privilege"
            accentColor="emerald"
            onClick={() => navigate("/leave/overview")}
          />

          <KpiCard
            label="My Latest Payslip"
            value="Sep 2026"
            icon={<WalletCards className="w-6 h-6 text-gray-700" />}
            subtitle="Processed & Ready"
            accentColor="neutral"
            onClick={() => navigate("/payroll/payslips")}
          />

          <KpiCard
            label="Attendance Status"
            value="On Time"
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            subtitle="Biometric Verified"
            accentColor="emerald"
            onClick={() => navigate("/time/attendance")}
          />
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all", isCompact ? "gap-3" : "gap-4")}>
          <KpiCard
            label="Monthly Payroll Disbursed"
            value={formatCompactINR(totalDisbursed || 4520000)}
            icon={<WalletCards className="w-6 h-6 text-gray-700" />}
            trend={{ value: "100%", isPositive: true, label: "September locked" }}
            subtitle="32 net salary transactions"
            accentColor="neutral"
            onClick={isSuperOrHr ? () => navigate("/payroll/dashboard") : undefined}
          />

          <KpiCard
            label="Open Leave Approvals"
            value={pendingLeaves.length}
            icon={<FileCheck className="w-6 h-6 text-rose-600" />}
            trend={{ value: pendingLeaves.length > 0 ? "Action Req" : "Clear", isPositive: pendingLeaves.length === 0 }}
            subtitle="Requires HR / Manager signoff"
            accentColor="rose"
            onClick={() => navigate("/leave/requests")}
          />

          <KpiCard
            label="Active Departments"
            value={departments.length}
            icon={<Building2 className="w-6 h-6 text-blue-600" />}
            trend={{ value: "11 Openings", isPositive: true }}
            subtitle="Engineering is largest unit"
            accentColor="blue"
            onClick={isSuperOrHr ? () => navigate("/people/departments") : undefined}
          />

          <KpiCard
            label="Compliance Status"
            value="100%"
            icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
            trend={{ value: "PF/ESI/PT", isPositive: true }}
            subtitle="Zero statutory non-compliances"
            accentColor="emerald"
            onClick={isSuperOrHr ? () => navigate("/payroll/salary-structures") : undefined}
          />
        </div>
      )}

      {/* Visualizations Section: Headcount Trend & Attendance Donut */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 transition-all", isCompact ? "gap-4" : "gap-6")}>
        {/* Workforce Growth Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Workforce Headcount & Payroll Trend</CardTitle>
              <p className="text-xs text-text-secondary mt-0.5">
                Headcount growth and monthly compensation trend across H1/H2 2026.
              </p>
            </div>
            <Badge variant="default" size="sm">
              FY 2026-27
            </Badge>
          </CardHeader>
          <CardContent>
            <div className={cn("w-full transition-all", isCompact ? "h-60" : "h-72")}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountData}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="headcount"
                    stroke="#0F172A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#purpleGrad)"
                    name="Active Employees"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Donut (1 col) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today's Attendance</CardTitle>
              <p className="text-xs text-text-secondary mt-0.5">Real-time punch distribution</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {attendanceRate}% Present
            </span>
          </CardHeader>
          <CardContent>
            <div className={cn("w-full transition-all", isCompact ? "h-44" : "h-52")}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendanceDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend list */}
            <div className="space-y-1.5 mt-2 pt-2 border-t border-surface-border text-xs">
              {attendanceDonutData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Visualizations: Department Distribution */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 transition-all", isCompact ? "gap-4" : "gap-6")}>
        {/* Department Distribution (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Department Headcount Distribution</CardTitle>
              <p className="text-xs text-text-secondary mt-0.5">
                Staffing levels across active operational units.
              </p>
            </div>
            <Button
              onClick={() => navigate("/people/departments")}
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View Depts
            </Button>
          </CardHeader>
          <CardContent>
            <div className={cn("w-full transition-all", isCompact ? "h-52" : "h-60")}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} width={70} />
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${val} Employees (${item.payload.fullName})`,
                      "Headcount",
                    ]}
                  />
                  <Bar dataKey="employees" fill="#0F172A" radius={[0, 8, 8, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions Card (1 col) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{isEmployee ? "My Leave Applications" : "Pending Actions"}</CardTitle>
              {!isEmployee && (pendingLeaves.length > 0 || pendingRegs.length > 0) && (
                <span className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                  {pendingLeaves.length + pendingRegs.length}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEmployee ? (
              myLeaves.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  No active leave requests.
                </div>
              ) : (
                myLeaves.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <p className="text-xs font-semibold text-gray-950 truncate">
                        {req.days} Day Leave ({req.fromDate})
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{req.reason}</p>
                    </div>
                    <Badge
                      variant={
                        req.status === "APPROVED"
                          ? "success"
                          : req.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                    >
                      {req.status === "PENDING" ? "Review" : req.status}
                    </Badge>
                  </div>
                ))
              )
            ) : pendingLeaves.length === 0 && pendingRegs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All pending approvals are clear!
              </div>
            ) : (
              <>
                {pendingLeaves.map((req) => {
                  const emp = employees.find((e) => e.id === req.employeeId);
                  return (
                    <div
                      key={req.id}
                      className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-950 truncate">
                          {emp?.firstName} {emp?.lastName}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {req.days} Day Leave ({req.fromDate})
                        </p>
                      </div>
                      <Button
                        onClick={() => approveLeave(req.id)}
                        variant="primary"
                        size="sm"
                        className="text-[11px] h-7 px-2.5"
                      >
                        Approve
                      </Button>
                    </div>
                  );
                })}

                {pendingRegs.map((reg) => {
                  const emp = employees.find((e) => e.id === reg.employeeId);
                  return (
                    <div
                      key={reg.id}
                      className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <p className="text-xs font-semibold text-amber-950 truncate">
                          {emp?.firstName} {emp?.lastName}
                        </p>
                        <p className="text-[11px] text-gray-600 truncate">
                          Regularize {reg.missingPunchType} ({reg.date})
                        </p>
                      </div>
                      <Button
                        onClick={() => approveRegularization(reg.id)}
                        variant="primary"
                        size="sm"
                        className="text-[11px] h-7 px-2.5"
                      >
                        Approve
                      </Button>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline or Self-Service Portal for Employees */}
      {isEmployee ? (
        <Card>
          <CardHeader>
            <CardTitle>Employee Self-Service Quick Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigate("/time/attendance")}
                className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-950">Clock Attendance</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Review web punches, daily shift hours, and biometric sensor sync.
                </p>
              </button>

              <button
                onClick={() => navigate("/payroll/payslips")}
                className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <WalletCards className="w-4 h-4 text-gray-900" />
                  <span className="text-xs font-bold text-gray-950">Download Payslips</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Access monthly salary slips with EPF and tax deduction breakdowns.
                </p>
              </button>

              <button
                onClick={() => navigate("/time/holidays")}
                className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-gray-950">Company Holidays</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  View upcoming statutory holidays, festival breaks, and optional leaves.
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Recent HR Activity & Audit Trail</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time chronological events recorded in system audit log.
                </p>
              </div>
              {isSuperOrHr && (
                <Button
                  onClick={() => navigate("/admin/audit-logs")}
                  variant="outline"
                  size="sm"
                >
                  View Full Audit Log
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-gray-950 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-950">{log.action}</span>
                      <Badge variant="neutral" size="sm">
                        {log.module}
                      </Badge>
                      <span className="text-gray-400 text-[11px]">
                        by {log.userName}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
