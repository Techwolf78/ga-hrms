import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CalendarCheck2,
  WalletCards,
  UserPlus,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
  CheckCircle2,
  CalendarPlus,
  Receipt,
  Building2,
  ShieldCheck,
  Calendar,
  Briefcase,
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
} from "recharts";
import { useAuth } from "../../lib/authContext";
import { useHrms } from "../../lib/hrmsContext";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { formatCompactINR, formatDate, cn } from "../../lib/utils";

export interface DashboardPageProps {
  onOpenAddEmployee?: () => void;
  onOpenApplyLeave?: () => void;
}

const CARD_SURFACE =
  "group bg-white/95 backdrop-blur-md border border-[#E6E8EC] rounded-3xl shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:border-[#A3E635]/60 hover:shadow-[0_8px_24px_rgba(17,19,18,0.06)] transition-all duration-200";

const ICON_BOX =
  "w-11 h-11 rounded-2xl bg-[#ECFCCB] text-[#3F6212] border border-[#D9F99D] flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-[#111312] group-hover:text-[#A3E635] group-hover:border-[#111312]";

const PRIMARY_PILL =
  "rounded-full bg-[#A3E635] hover:bg-[#BEF264] active:bg-[#BEF264] text-[#111312] font-bold shadow-[0_4px_16px_rgba(163,230,53,0.35)] border-0";

const DARK_PILL =
  "rounded-full bg-[#111312] hover:bg-[#232725] active:bg-[#232725] text-white font-semibold border-0";

const OUTLINE_PILL =
  "rounded-full bg-white border border-[#E6E8EC] text-[#111312] hover:bg-[#F7F8FA] hover:border-[#A3E635]/60 font-medium";

interface BentoKpiProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  onClick?: () => void;
}

function BentoKpi({
  label,
  value,
  icon,
  trend,
  subtitle,
  onClick,
}: BentoKpiProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        CARD_SURFACE,
        "p-5",
        onClick && "cursor-pointer active:scale-[0.99]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#68707D] group-hover:text-[#111312] transition-colors">
            {label}
          </p>
          <div className="text-2xl sm:text-[28px] font-bold text-[#111312] tracking-tight leading-tight">
            {value}
          </div>
        </div>
        <div className={ICON_BOX}>{icon}</div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 pt-3 border-t border-[#F0F2F5] flex items-center justify-between gap-2 text-xs text-[#68707D]">
          {trend && (
            <div className="flex items-center gap-1.5 font-medium shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                  trend.isPositive
                    ? "bg-[#ECFCCB] text-[#3F6212]"
                    : "bg-[#FFE4E6] text-[#E11D48]",
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-[11px] text-[#9AA2AF]">
                  {trend.label}
                </span>
              )}
            </div>
          )}
          {subtitle && (
            <span className="truncate text-[11px] text-[#68707D] ml-auto">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardPage({
  onOpenAddEmployee,
  onOpenApplyLeave,
}: DashboardPageProps) {
  const { user } = useAuth();
  const {
    employees,
    attendance,
    leaveRequests,
    departments,
    payroll,
    regularizations,
    holidays,
    approveLeave,
    rejectLeave,
    approveRegularization,
    rejectRegularization,
    punchAttendance,
    settings,
  } = useHrms();
  const navigate = useNavigate();
  const isCompact = !!settings?.compactMode;

  const role = user?.role || "EMPLOYEE";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isHrAdmin = role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";
  const isSuperOrHr = isSuperAdmin || isHrAdmin;

  const currentUserEmployee = employees.find(
    (e) => e.id === user?.employeeId || e.employeeCode === user?.employeeId,
  );

  const todayStr = "2026-11-20";
  const userTodayAttendance = attendance.find(
    (a) =>
      a.employeeId === (user?.employeeId || currentUserEmployee?.id) &&
      a.date === todayStr,
  );
  const isPunchedIn =
    !!userTodayAttendance?.firstIn && !userTodayAttendance?.lastOut;

  // Employee scope
  const myLeaves = leaveRequests.filter(
    (l) =>
      l.employeeId ===
      (user?.employeeId || currentUserEmployee?.id || "EMP-1004"),
  );
  const myRecentAttendance = attendance
    .filter(
      (a) =>
        a.employeeId ===
        (user?.employeeId || currentUserEmployee?.id || "EMP-1004"),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Manager scope
  const myTeamEmployees = employees.filter((e) => {
    if (isSuperOrHr) return true;
    if (isManager) {
      return (
        e.managerId === user?.employeeId ||
        e.managerId === currentUserEmployee?.id ||
        (currentUserEmployee?.departmentId &&
          e.departmentId === currentUserEmployee.departmentId &&
          e.id !== currentUserEmployee.id)
      );
    }
    return false;
  });

  const teamTodayAttendance = attendance.filter(
    (a) =>
      a.date === todayStr && myTeamEmployees.some((e) => e.id === a.employeeId),
  );
  const teamPresentCount = teamTodayAttendance.filter(
    (a) =>
      a.status === "PRESENT" || a.status === "LATE" || a.status === "HALF_DAY",
  ).length;
  const teamLateCount = teamTodayAttendance.filter(
    (a) => a.status === "LATE",
  ).length;
  const teamOnLeaveCount = teamTodayAttendance.filter(
    (a) => a.status === "LEAVE",
  ).length;
  const teamPendingLeaves = leaveRequests.filter(
    (l) =>
      l.status === "PENDING" &&
      myTeamEmployees.some((e) => e.id === l.employeeId),
  );
  const teamPendingRegs = regularizations.filter(
    (r) =>
      r.status === "PENDING" &&
      myTeamEmployees.some((e) => e.id === r.employeeId),
  );

  // Org scope
  const totalEmployees = employees.length;
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter(
    (a) =>
      a.status === "PRESENT" || a.status === "LATE" || a.status === "HALF_DAY",
  ).length;
  const onLeaveCount = todayAttendance.filter(
    (a) => a.status === "LEAVE",
  ).length;
  const lateCount = todayAttendance.filter((a) => a.status === "LATE").length;
  const absentCount = todayAttendance.filter(
    (a) => a.status === "ABSENT",
  ).length;
  const halfDayCount = todayAttendance.filter(
    (a) => a.status === "HALF_DAY",
  ).length;

  const attendanceRate =
    totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;
  const pendingLeaves = leaveRequests.filter((l) => l.status === "PENDING");
  const pendingRegs = regularizations.filter((r) => r.status === "PENDING");
  const totalPendingCount = isManager
    ? teamPendingLeaves.length + teamPendingRegs.length
    : pendingLeaves.length + pendingRegs.length;

  const latestPayroll = payroll.filter((p) => p.month === "2026-10");
  const totalDisbursed = latestPayroll.reduce((sum, p) => sum + p.netSalary, 0);

  const last7Dates = Array.from(new Set(attendance.map((a) => a.date)))
    .filter((d) => d <= todayStr)
    .sort()
    .slice(-7);

  const last7DaysAttendance = (last7Dates.length > 0 ? last7Dates : [todayStr]).map((dateStr) => {
    const dayRecords = attendance.filter((a) => a.date === dateStr);
    const dayPresent = dayRecords.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE" || a.status === "HALF_DAY"
    ).length;
    const rate = totalEmployees > 0 ? Math.round((dayPresent / totalEmployees) * 100) : 0;
    const [, m, d] = dateStr.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const label = `${Number(d)} ${monthNames[Number(m) - 1] || m}`;
    return {
      day: label,
      turnout: rate,
      present: dayPresent,
    };
  });

  const attendanceDonutData = [
    {
      name: "Present (On-time)",
      value: Math.max(0, presentCount - lateCount - halfDayCount),
      color: "#111312",
    },
    { name: "Late Arrival", value: lateCount, color: "#F59E0B" },
    { name: "Half Day", value: halfDayCount, color: "#BEF264" },
    { name: "Approved Leave", value: onLeaveCount, color: "#A3E635" },
    { name: "Absent", value: absentCount, color: "#E11D48" },
  ];

  const teamDonutData = [
    {
      name: "Present (On-time)",
      value: Math.max(0, teamPresentCount - teamLateCount),
      color: "#111312",
    },
    { name: "Late Arrival", value: teamLateCount, color: "#F59E0B" },
    { name: "Approved Leave", value: teamOnLeaveCount, color: "#A3E635" },
    {
      name: "Absent / Away",
      value: Math.max(
        0,
        myTeamEmployees.length - teamPresentCount - teamOnLeaveCount,
      ),
      color: "#E11D48",
    },
  ];

  const departmentData = departments.map((d) => ({
    name: d.code,
    fullName: d.name,
    employees: employees.filter((e) => e.departmentId === d.id).length,
  }));

  const upcomingHolidays = holidays.slice(0, 3);

  // Combined pending queue (org or team)
  const queueLeaves = isManager ? teamPendingLeaves : pendingLeaves;
  const queueRegs = isManager ? teamPendingRegs : pendingRegs;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--mouse-x",
      `${e.clientX - rect.left}px`,
    );
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "relative transition-all duration-200",
        isCompact ? "space-y-4" : "space-y-5",
      )}
    >
      {/* Subtle mouse-tracking lime glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), rgba(163, 230, 53, 0.08), rgba(190, 242, 100, 0.03) 35%, transparent 65%)",
        }}
      />

      {/* 1. CLEAN HRMS WELCOME HEADER */}
      <div
        className={cn(
          "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-md rounded-3xl border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)] transition-all",
          isCompact ? "p-4" : "p-5 sm:p-6",
        )}
      >
        <div>
          <p className="text-xs font-medium text-[#68707D] flex items-center gap-2">
            <span>Friday, 20 November 2026</span>
            <span className="w-1 h-1 rounded-full bg-[#9AA2AF]" />
            <span className="inline-flex items-center gap-1.5 text-[#3F6212] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
              {isEmployee
                ? isPunchedIn
                  ? `Checked in at ${userTodayAttendance?.firstIn}`
                  : "Not punched in yet"
                : `${attendanceRate}% Turnout · ${totalPendingCount} Pending Approvals`}
            </span>
          </p>
          <h1
            className={cn(
              "mt-1 font-light text-[#111312] tracking-tight",
              isCompact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
            )}
          >
            Good morning,{" "}
            <span className="font-semibold">{user?.name.split(" ")[0]}</span>
          </h1>
        </div>

        {/* Role-Specific Pill Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isSuperAdmin && (
            <>
              <Button
                onClick={() => navigate("/admin/users-roles")}
                variant="outline"
                size="md"
                className={OUTLINE_PILL}
                leftIcon={<ShieldCheck className="w-4 h-4 text-[#111312]" />}
              >
                Access & Roles
              </Button>
              <Button
                onClick={() => navigate("/admin/settings")}
                variant="primary"
                size="md"
                className={PRIMARY_PILL}
                leftIcon={<Building2 className="w-4 h-4 text-[#111312]" />}
              >
                Company Settings
              </Button>
            </>
          )}

          {isHrAdmin && (
            <>
              {onOpenApplyLeave && (
                <Button
                  onClick={onOpenApplyLeave}
                  variant="outline"
                  size="md"
                  className={OUTLINE_PILL}
                  leftIcon={<CalendarPlus className="w-4 h-4 text-[#111312]" />}
                >
                  Apply Leave
                </Button>
              )}
              <Button
                onClick={() => navigate("/payroll/runs")}
                variant="deep"
                size="md"
                className={DARK_PILL}
                leftIcon={<Receipt className="w-4 h-4 text-white" />}
              >
                Run Payroll
              </Button>
              {onOpenAddEmployee && (
                <Button
                  onClick={onOpenAddEmployee}
                  variant="primary"
                  size="md"
                  className={PRIMARY_PILL}
                  leftIcon={<UserPlus className="w-4 h-4 text-[#111312]" />}
                >
                  Add Employee
                </Button>
              )}
            </>
          )}

          {isManager && (
            <>
              {onOpenApplyLeave && (
                <Button
                  onClick={onOpenApplyLeave}
                  variant="outline"
                  size="md"
                  className={OUTLINE_PILL}
                  leftIcon={<CalendarPlus className="w-4 h-4 text-[#111312]" />}
                >
                  Apply Leave
                </Button>
              )}
              <Button
                onClick={() => navigate("/leave/requests")}
                variant="primary"
                size="md"
                className={PRIMARY_PILL}
                leftIcon={<FileCheck className="w-4 h-4 text-[#111312]" />}
              >
                Review Approvals ({totalPendingCount})
              </Button>
            </>
          )}

          {isEmployee && (
            <>
              {user?.employeeId && (
                <Button
                  onClick={() =>
                    punchAttendance(
                      user.employeeId!,
                      isPunchedIn ? "OUT" : "IN",
                    )
                  }
                  variant="outline"
                  size="md"
                  className={OUTLINE_PILL}
                  leftIcon={<Clock className="w-4 h-4 text-[#111312]" />}
                >
                  {isPunchedIn ? "Punch Out" : "Punch In"}
                </Button>
              )}
              <Button
                onClick={() => navigate("/payroll/payslips")}
                variant="outline"
                size="md"
                className={OUTLINE_PILL}
                leftIcon={<WalletCards className="w-4 h-4 text-[#111312]" />}
              >
                My Payslips
              </Button>
              {onOpenApplyLeave && (
                <Button
                  onClick={onOpenApplyLeave}
                  variant="primary"
                  size="md"
                  className={PRIMARY_PILL}
                  leftIcon={<CalendarPlus className="w-4 h-4 text-[#111312]" />}
                >
                  Apply for Leave
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. PRIMARY KPI ROW */}
      <div
        className={cn(
          "relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          isCompact ? "gap-3.5" : "gap-5",
        )}
      >
        {isSuperOrHr && (
          <>
            <BentoKpi
              label="Total Workforce"
              value={totalEmployees}
              icon={<Users className="w-5 h-5" />}
              trend={{ value: "+4.2%", isPositive: true, label: "vs last mo" }}
              subtitle="Pune HQ + 4 branches"
              onClick={() => navigate("/people/employees")}
            />
            <BentoKpi
              label="Org Turnout Today"
              value={`${attendanceRate}%`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              trend={{
                value: `${presentCount} present`,
                isPositive: attendanceRate >= 85,
              }}
              subtitle={`${onLeaveCount} on leave · ${lateCount} late`}
              onClick={() => navigate("/time/attendance")}
            />
            <BentoKpi
              label="Pending Approvals"
              value={totalPendingCount}
              icon={<CalendarCheck2 className="w-5 h-5" />}
              trend={{
                value: `${pendingLeaves.length} leave · ${pendingRegs.length} punch`,
                isPositive: totalPendingCount === 0,
              }}
              subtitle="Action required"
              onClick={() => navigate("/leave/requests")}
            />
            <BentoKpi
              label={isSuperAdmin ? "Payroll Disbursed" : "Monthly Payroll"}
              value={formatCompactINR(totalDisbursed)}
              icon={<WalletCards className="w-5 h-5" />}
              trend={{ value: "Oct locked", isPositive: true }}
              subtitle={`${latestPayroll.length} payslips`}
              onClick={() => navigate("/payroll/dashboard")}
            />
          </>
        )}

        {isManager && (
          <>
            <BentoKpi
              label="My Direct Team"
              value={myTeamEmployees.length}
              icon={<Users className="w-5 h-5" />}
              trend={{
                value: `${teamPresentCount} in today`,
                isPositive: true,
              }}
              subtitle="Active members"
              onClick={() => navigate("/people/employees")}
            />
            <BentoKpi
              label="Team Turnout"
              value={`${myTeamEmployees.length > 0 ? Math.round((teamPresentCount / myTeamEmployees.length) * 100) : 0}%`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              trend={{
                value: `${teamLateCount} late`,
                isPositive: teamLateCount === 0,
              }}
              subtitle={`${teamOnLeaveCount} on leave`}
              onClick={() => navigate("/time/attendance")}
            />
            <BentoKpi
              label="Team Approvals"
              value={totalPendingCount}
              icon={<FileCheck className="w-5 h-5" />}
              trend={{
                value: `${teamPendingLeaves.length} leave`,
                isPositive: totalPendingCount === 0,
              }}
              subtitle={`${teamPendingRegs.length} regularizations`}
              onClick={() => navigate("/leave/requests")}
            />
            <BentoKpi
              label="My Leave Requests"
              value={myLeaves.length}
              icon={<Calendar className="w-5 h-5" />}
              trend={{
                value: `${myLeaves.filter((l) => l.status === "APPROVED").length} approved`,
                isPositive: true,
              }}
              subtitle="Current cycle"
              onClick={() => navigate("/leave/overview")}
            />
          </>
        )}

        {isEmployee && (
          <>
            <BentoKpi
              label="Today's Status"
              value={
                isPunchedIn
                  ? "Punched In"
                  : userTodayAttendance?.status || "Not In"
              }
              icon={<Clock className="w-5 h-5" />}
              trend={{
                value: userTodayAttendance?.firstIn
                  ? `In: ${userTodayAttendance.firstIn}`
                  : "No punch",
                isPositive: !!userTodayAttendance?.firstIn,
              }}
              subtitle={
                userTodayAttendance?.lastOut
                  ? `Out: ${userTodayAttendance.lastOut}`
                  : "Shift 09:30 AM"
              }
              onClick={() => navigate("/time/attendance")}
            />
            <BentoKpi
              label="Leave Balance"
              value="14 Days"
              icon={<CalendarCheck2 className="w-5 h-5" />}
              trend={{ value: "CL + PL", isPositive: true }}
              subtitle={`${myLeaves.filter((l) => l.status === "PENDING").length} pending`}
              onClick={() => navigate("/leave/overview")}
            />
            <BentoKpi
              label="Latest Net Pay"
              value={formatCompactINR(
                payroll.find((p) => p.employeeId === currentUserEmployee?.id)
                  ?.netSalary || 85000,
              )}
              icon={<WalletCards className="w-5 h-5" />}
              trend={{ value: "Oct 2026", isPositive: true }}
              subtitle="Credited"
              onClick={() => navigate("/payroll/payslips")}
            />
            <BentoKpi
              label="Department"
              value={
                departments.find(
                  (d) => d.id === currentUserEmployee?.departmentId,
                )?.code || "ENG"
              }
              icon={<Briefcase className="w-5 h-5" />}
              subtitle={user?.designation || "Team Member"}
              onClick={() => navigate("/people/organization")}
            />
          </>
        )}
      </div>

      {/* 3. MAIN BENTO WORKSPACE GRID */}
      {!isEmployee ? (
        <div
          className={cn(
            "relative z-10 grid grid-cols-1 lg:grid-cols-12",
            isCompact ? "gap-3.5" : "gap-5",
          )}
        >
          {/* Left 8 Columns: Growth & Department Analytics */}
          <div
            className={cn(
              "lg:col-span-8 flex flex-col",
              isCompact ? "gap-3.5" : "gap-5",
            )}
          >
            {isSuperOrHr && (
              <Card className={CARD_SURFACE}>
                <CardHeader className="border-b border-[#F0F2F5]">
                  <div>
                    <CardTitle className="text-[#111312]">
                      7-Day Attendance Trend
                    </CardTitle>
                    <p className="text-xs text-[#68707D] mt-0.5">
                      Daily workforce turnout % across the last 7 recorded days
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/time/attendance")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#111312] hover:text-[#3F6212] transition-colors"
                  >
                    Attendance Log <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={last7DaysAttendance}
                        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="attendanceLime"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#A3E635"
                              stopOpacity={0.45}
                            />
                            <stop
                              offset="95%"
                              stopColor="#A3E635"
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#68707D", fontSize: 12 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#68707D", fontSize: 12 }}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, "Turnout"]}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "1px solid #E6E8EC",
                            boxShadow: "0 8px 24px rgba(17,19,18,0.08)",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="turnout"
                          stroke="#111312"
                          strokeWidth={2.5}
                          fill="url(#attendanceLime)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {isManager && (
              <Card className={CARD_SURFACE}>
                <CardHeader className="border-b border-[#F0F2F5]">
                  <div>
                    <CardTitle className="text-[#111312]">
                      My Team Roster Today
                    </CardTitle>
                    <p className="text-xs text-[#68707D] mt-0.5">
                      Live attendance status for your {myTeamEmployees.length} direct reports
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/time/attendance")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#111312] hover:text-[#3F6212] transition-colors"
                  >
                    Team Attendance <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </CardHeader>
                <CardContent className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {myTeamEmployees.slice(0, 6).map((member) => {
                    const att = teamTodayAttendance.find((a) => a.employeeId === member.id);
                    const statusLabel = att?.firstIn
                      ? `In ${att.firstIn}`
                      : att?.status || "Not In";
                    const isIn = att?.status === "PRESENT" || att?.status === "LATE" || att?.status === "HALF_DAY";
                    return (
                      <div
                        key={member.id}
                        onClick={() => navigate(`/people/employees/${member.id}`)}
                        className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC] hover:border-[#A3E635]/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            src={member.avatar}
                            name={`${member.firstName} ${member.lastName}`}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#111312] truncate">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-[11px] text-[#68707D] truncate">
                              {member.workMode || "ON_SITE"} · {member.employeeCode}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isIn ? "lime" : "neutral"} size="sm">
                          {statusLabel}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <Card className={CARD_SURFACE}>
              <CardHeader className="border-b border-[#F0F2F5]">
                <div>
                  <CardTitle className="text-[#111312]">
                    Department Headcount Distribution
                  </CardTitle>
                  <p className="text-xs text-[#68707D] mt-0.5">
                    Staffing levels across active operational units
                  </p>
                </div>
                <button
                  onClick={() => navigate("/people/departments")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#111312] hover:text-[#3F6212] transition-colors"
                >
                  View Depts <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: -10, bottom: 0 }}
                    >
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#68707D", fontSize: 12 }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#111312",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "#F7F8FA" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid #E6E8EC",
                          boxShadow: "0 8px 24px rgba(17,19,18,0.08)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="employees"
                        fill="#111312"
                        radius={[0, 10, 10, 0]}
                        barSize={18}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* HRMS Quick Operations Strip (light outer container, dark inner cards) */}
            {(isSuperOrHr || isManager) && (
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#E6E8EC] shadow-[0_2px_16px_rgba(17,19,18,0.03)]">
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111312]">Operations Command</h3>
                    <p className="text-[11px] text-[#68707D]">Jump directly to active HR workflows</p>
                  </div>
                  <button
                    onClick={() => navigate(isManager ? "/time/regularization" : "/admin/audit-logs")}
                    className="px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#E6E8EC] text-[11px] font-medium text-[#111312] hover:border-[#A3E635] transition-colors"
                  >
                    {isManager ? "Punch Approvals ›" : "Audit Trail ›"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(isManager
                    ? [
                        {
                          title: "Team Leaves",
                          value: `${teamPendingLeaves.length} pending`,
                          sub: "Review leave queue",
                          path: "/leave/requests",
                          highlight: true,
                        },
                        {
                          title: "Punch Requests",
                          value: `${teamPendingRegs.length} waiting`,
                          sub: "Regularize attendance",
                          path: "/time/regularization",
                          highlight: false,
                        },
                        {
                          title: "Team Roster",
                          value: `${teamPresentCount}/${myTeamEmployees.length} active`,
                          sub: "Shift & presence log",
                          path: "/time/shifts",
                          highlight: false,
                        },
                      ]
                    : [
                        {
                          title: "Onboarding",
                          value: `${employees.filter((e) => e.onboardingCompleted === false).length} in progress`,
                          sub: "Verify new hire dossiers",
                          path: "/admin/onboarding-setup",
                          highlight: true,
                        },
                        {
                          title: "Payroll Cycle",
                          value: formatCompactINR(totalDisbursed),
                          sub: `${latestPayroll.length} payslips locked`,
                          path: "/payroll/dashboard",
                          highlight: false,
                        },
                        {
                          title: "Shift Coverage",
                          value: `${presentCount}/${totalEmployees} active`,
                          sub: "View roster & punches",
                          path: "/time/shifts",
                          highlight: false,
                        },
                      ]
                  ).map((op) => (
                    <div
                      key={op.title}
                      onClick={() => navigate(op.path)}
                      className={cn(
                        "rounded-2xl p-3.5 border cursor-pointer transition-all flex flex-col justify-between group",
                        op.highlight
                          ? "bg-gradient-to-b from-[#1E2712] to-[#0D0F0E] border-[#A3E635]/50 hover:border-[#A3E635]"
                          : "bg-[#0D0F0E] border-[#1F2421] hover:border-[#A3E635]/40"
                      )}
                    >
                      <div>
                        <p className="text-[11px] font-medium text-white/60">{op.title}</p>
                        <p className="text-base font-semibold text-white mt-0.5">{op.value}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-white/50 truncate">{op.sub}</span>
                        <span
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5",
                            op.highlight ? "bg-[#A3E635] text-[#111312]" : "bg-white/10 text-white"
                          )}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Columns: Attendance Donut + Pending Approvals + Upcoming Holidays */}
          <div
            className={cn(
              "lg:col-span-4 flex flex-col",
              isCompact ? "gap-3.5" : "gap-5",
            )}
          >
            <Card className={CARD_SURFACE}>
              <CardHeader className="border-b border-[#F0F2F5]">
                <div>
                  <CardTitle className="text-[#111312]">
                    Today's Attendance
                  </CardTitle>
                  <p className="text-xs text-[#68707D] mt-0.5">
                    {isManager
                      ? "Team presence breakdown"
                      : "Live workforce status"}
                  </p>
                </div>
                <Badge variant="lime" size="sm">
                  {attendanceRate}%
                </Badge>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={isManager ? teamDonutData : attendanceDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(isManager ? teamDonutData : attendanceDonutData).map(
                          (entry, idx) => (
                            <Cell key={idx} fill={entry.color} stroke="none" />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {(isManager ? teamDonutData : attendanceDonutData).map(
                    (item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-2 text-[#68707D]">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </span>
                        <span className="font-semibold text-[#111312]">
                          {item.value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Approvals Queue */}
            <Card className={CARD_SURFACE}>
              <CardHeader className="border-b border-[#F0F2F5]">
                <div>
                  <CardTitle className="text-[#111312]">
                    Pending Approvals
                  </CardTitle>
                  <p className="text-xs text-[#68707D] mt-0.5">
                    {totalPendingCount} items awaiting review
                  </p>
                </div>
                <button
                  onClick={() => navigate("/leave/requests")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#111312] hover:text-[#3F6212] transition-colors"
                >
                  Queue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </CardHeader>
              <CardContent className="pt-3 space-y-2.5">
                {totalPendingCount === 0 ? (
                  <div className="py-6 text-center text-xs text-[#68707D]">
                    All caught up! No pending requests.
                  </div>
                ) : (
                  <>
                    {queueLeaves.slice(0, 3).map((leave) => {
                      const emp = employees.find(
                        (e) => e.id === leave.employeeId,
                      );
                      return (
                        <div
                          key={leave.id}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC]"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#111312] truncate">
                              {emp ? `${emp.firstName} ${emp.lastName}` : leave.employeeId}
                            </p>
                            <p className="text-[11px] text-[#68707D] truncate">
                              {leave.days}d {leave.leaveTypeId.replace("lt-", "").toUpperCase()} · {leave.fromDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => approveLeave(leave.id)}
                              className="px-2.5 py-1 rounded-full bg-[#A3E635] hover:bg-[#BEF264] text-[#111312] text-[11px] font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectLeave(leave.id)}
                              className="px-2.5 py-1 rounded-full bg-white border border-[#E6E8EC] hover:border-[#E11D48] hover:text-[#E11D48] text-[#68707D] text-[11px] font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {queueRegs.slice(0, 2).map((reg) => {
                      const emp = employees.find(
                        (e) => e.id === reg.employeeId,
                      );
                      return (
                        <div
                          key={reg.id}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#ECFCCB]/40 border border-[#D9F99D]"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#111312] truncate">
                              {emp ? `${emp.firstName} ${emp.lastName}` : reg.employeeId}
                            </p>
                            <p className="text-[11px] text-[#68707D] truncate">
                              Punch {reg.missingPunchType} · {reg.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => approveRegularization(reg.id)}
                              className="px-2.5 py-1 rounded-full bg-[#111312] hover:bg-[#232725] text-[#A3E635] text-[11px] font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectRegularization(reg.id)}
                              className="px-2.5 py-1 rounded-full bg-white border border-[#E6E8EC] hover:border-[#E11D48] hover:text-[#E11D48] text-[#68707D] text-[11px] font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Holidays */}
            <Card className={CARD_SURFACE}>
              <CardHeader className="border-b border-[#F0F2F5]">
                <CardTitle className="text-[#111312] text-sm">
                  Upcoming Holidays
                </CardTitle>
                <button
                  onClick={() => navigate("/time/holidays")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#111312] hover:text-[#3F6212] transition-colors"
                >
                  Calendar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                {upcomingHolidays.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between px-3 py-2 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC] text-xs"
                  >
                    <span className="font-medium text-[#111312] truncate">
                      {h.name}
                    </span>
                    <span className="text-[11px] font-semibold text-[#3F6212] bg-[#ECFCCB] px-2 py-0.5 rounded-full shrink-0">
                      {formatDate(h.date)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* EMPLOYEE SELF-SERVICE BENTO */
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className={cn(CARD_SURFACE, "lg:col-span-7")}>
            <CardHeader className="border-b border-[#F0F2F5]">
              <CardTitle className="text-[#111312]">
                Recent Attendance
              </CardTitle>
              <button
                onClick={() => navigate("/time/attendance")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#111312] hover:text-[#3F6212]"
              >
                Full Log <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>
            <CardContent className="pt-3 space-y-2.5">
              {myRecentAttendance.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC]"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#111312]">
                      {formatDate(att.date)}
                    </p>
                    <p className="text-[11px] text-[#68707D]">
                      In: {att.firstIn || "—"} · Out: {att.lastOut || "—"}
                    </p>
                  </div>
                  <Badge
                    variant={att.status === "PRESENT" ? "lime" : "neutral"}
                    size="sm"
                  >
                    {att.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={cn(CARD_SURFACE, "lg:col-span-5")}>
            <CardHeader className="border-b border-[#F0F2F5]">
              <CardTitle className="text-[#111312]">
                Upcoming Holidays
              </CardTitle>
              <button
                onClick={() => navigate("/time/holidays")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#111312] hover:text-[#3F6212]"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>
            <CardContent className="pt-3 space-y-2.5">
              {upcomingHolidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC]"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={h.name} size="sm" />
                    <span className="text-xs font-semibold text-[#111312]">
                      {h.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#3F6212] bg-[#ECFCCB] px-2.5 py-0.5 rounded-full">
                    {formatDate(h.date)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
