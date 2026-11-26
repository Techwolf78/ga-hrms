import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck2,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileText,
  Users,
  Building2,
  Check,
  Sparkles,
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
import { useAuth } from "../../lib/authContext";
import { KpiCard } from "../../components/ui/KpiCard";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { formatDate } from "../../lib/utils";

export interface LeaveOverviewPageProps {
  onOpenApplyLeave?: () => void;
}

export function LeaveOverviewPage({ onOpenApplyLeave }: LeaveOverviewPageProps) {
  const { leaveRequests, leaveTypes, employees, holidays } = useHrms();
  const { user } = useAuth();
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

  // Direct reports for Manager
  const directReports = useMemo(() => {
    if (!currentEmployee) return [];
    return employees.filter(
      (e) =>
        e.managerId === currentEmployee.id ||
        e.managerId === user?.employeeId ||
        (currentEmployee && e.departmentId === currentEmployee.departmentId && e.id !== currentEmployee.id)
    );
  }, [employees, currentEmployee, user?.employeeId]);

  // Personal leaves for Employee / Manager
  const myLeaves = useMemo(() => {
    const targetId = currentEmployee?.id || user?.employeeId || "EMP-1004";
    const targetCode = currentEmployee?.employeeCode || "EMP-1004";
    return leaveRequests.filter((l) => l.employeeId === targetId || l.employeeId === targetCode);
  }, [leaveRequests, currentEmployee, user?.employeeId]);

  // Upcoming team leaves for Manager (direct reports only)
  const teamUpcomingLeaves = useMemo(() => {
    return leaveRequests.filter(
      (l) =>
        directReports.some((dr) => dr.id === l.employeeId || dr.employeeCode === l.employeeId) &&
        l.status === "APPROVED" &&
        l.fromDate >= "2026-11-20"
    );
  }, [leaveRequests, directReports]);

  // Manager pending approvals count
  const managerPendingCount = useMemo(() => {
    return leaveRequests.filter(
      (l) => l.status === "PENDING" && directReports.some((dr) => dr.id === l.employeeId || dr.employeeCode === l.employeeId)
    ).length;
  }, [leaveRequests, directReports]);

  // Corporate stats for Admin
  const totalRequests = leaveRequests.length;
  const pendingRequests = leaveRequests.filter((l) => l.status === "PENDING").length;
  const approvedRequests = leaveRequests.filter((l) => l.status === "APPROVED").length;
  const rejectedRequests = leaveRequests.filter((l) => l.status === "REJECTED").length;

  // Chart data: Leave by type (Corporate)
  const leaveByTypeData = leaveTypes.map((type) => {
    const count = leaveRequests.filter((l) => l.leaveTypeId === type.id && l.status === "APPROVED").length;
    return {
      name: type.code,
      fullName: type.name,
      requests: count,
      quota: type.annualQuota,
      color: type.color,
    };
  });

  const upcomingLeavesCorporate = leaveRequests.filter(
    (l) => l.status === "APPROVED" && l.fromDate >= "2026-11-20"
  );

  // Compute personal balance quota
  const myBalances = useMemo(() => {
    const targetId = currentEmployee?.id || user?.employeeId || "EMP-1004";
    const targetCode = currentEmployee?.employeeCode || "EMP-1004";
    return leaveTypes.map((lt) => {
      const used = leaveRequests
        .filter((l) => (l.employeeId === targetId || l.employeeId === targetCode) && l.leaveTypeId === lt.id && l.status === "APPROVED")
        .reduce((sum, l) => sum + (l.days || 1), 0);
      const pending = leaveRequests
        .filter((l) => (l.employeeId === targetId || l.employeeId === targetCode) && l.leaveTypeId === lt.id && l.status === "PENDING")
        .reduce((sum, l) => sum + (l.days || 1), 0);
      const available = Math.max(0, lt.annualQuota - used);
      return {
        ...lt,
        allocated: lt.annualQuota,
        used,
        pending,
        available,
      };
    });
  }, [leaveTypes, leaveRequests, currentEmployee, user?.employeeId]);

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight whitespace-nowrap">
            {isEmployee
              ? "My Leave Balances & Entitlements"
              : isManager
              ? "Team Leave & Coverage Dashboard"
              : "Corporate Leave & Time-Off Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-[#697586] mt-0.5 truncate hidden sm:block">
            {isEmployee
              ? "Track your statutory casual, sick, and earned leave quotas, and submit time-off requests."
              : isManager
              ? "Monitor direct reports' scheduled absences, team shift coverage, and process leave requests."
              : "Monitor organizational leave utilization, pending approvals, and statutory quota balances across 4 branches."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto scrollbar-none shrink-0 py-0.5">
          {(isSuperAdmin || isHrAdmin) && (
            <Button
              onClick={() => navigate("/leave/policies")}
              variant="outline"
              size="sm"
              className="h-8 text-xs whitespace-nowrap px-2.5 sm:px-3 shrink-0 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430]"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#1F8476]" />}
            >
              Leave Policies
            </Button>
          )}

          <Button
            onClick={() => navigate("/leave/requests")}
            variant="outline"
            size="sm"
            className="h-8 text-xs whitespace-nowrap px-2.5 sm:px-3 shrink-0 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430]"
            leftIcon={<CalendarCheck2 className="w-3.5 h-3.5 text-[#1F8476]" />}
          >
            {isEmployee
              ? "My Leave Applications"
              : isManager
              ? `Team Requests (${managerPendingCount})`
              : "Review Requests"}
          </Button>

          {onOpenApplyLeave && (
            <Button
              onClick={onOpenApplyLeave}
              variant="primary"
              size="sm"
              className="h-8 text-xs font-bold whitespace-nowrap px-3 sm:px-3.5 bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs shrink-0"
              leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-white" />}
            >
              Apply for Leave
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIEW: EMPLOYEE SELF-SERVICE ("My Leave Balances")                      */}
      {/* ========================================================================= */}
      {isEmployee && (
        <div className="space-y-6">
          {/* A. Personal Leave Balance Cards */}
          <div>
            <h2 className="text-sm font-bold text-[#1B2430] uppercase tracking-wider mb-3">
              Statutory Leave Entitlements (FY 2026–27)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {myBalances.slice(0, 4).map((policy) => {
                const percentAvailable = Math.round((policy.available / policy.allocated) * 100);
                return (
                  <div
                    key={policy.id}
                    className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-xs hover:border-[#80B6A1] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: policy.color }}
                          />
                          <span className="font-bold text-xs text-[#1B2430]">{policy.code}</span>
                        </div>
                        <Badge variant="cyan" size="sm">
                          {policy.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>

                      <p className="text-xs font-semibold text-[#1B2430] mt-2 truncate">
                        {policy.name}
                      </p>

                      <div className="mt-3 flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-bold text-[#1B2430] font-mono">
                            {policy.available}
                          </span>
                          <span className="text-xs text-[#697586] ml-1">days left</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#1F8476]">
                          {percentAvailable}% available
                        </span>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-[#F0F4F8] mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percentAvailable}%`,
                            backgroundColor: policy.color || "#1F8476",
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#DDE3EA] flex items-center justify-between text-[11px] text-[#697586]">
                      <span>Used: <strong className="text-[#1B2430]">{policy.used}d</strong></span>
                      {policy.pending > 0 && (
                        <span className="text-[#E69F00] font-semibold">
                          Pending: {policy.pending}d
                        </span>
                      )}
                      <span>Quota: {policy.allocated}d</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. Two Column Grid: Personal Leave History + Official Holidays */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Personal Leave Requests (2 cols) */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>My Recent Leave Applications</CardTitle>
                    <p className="text-xs text-[#697586] mt-0.5">
                      Status of your submitted vacation, casual, and sick leave requests.
                    </p>
                  </div>
                  {onOpenApplyLeave && (
                    <Button
                      onClick={onOpenApplyLeave}
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#DDE3EA] hover:bg-[#F7F9FB]"
                    >
                      + New Request
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {myLeaves.length === 0 ? (
                    <div className="text-center py-12 text-[#697586]">
                      <CalendarCheck2 className="w-8 h-8 mx-auto text-[#1F8476] mb-2" />
                      <p className="font-semibold text-xs text-[#1B2430]">No Leave Applications Found</p>
                      <p className="text-[11px] text-[#697586] mt-0.5">
                        You have not submitted any time-off requests for this fiscal cycle.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                            <th className="pb-2.5">Category</th>
                            <th className="pb-2.5">Dates</th>
                            <th className="pb-2.5">Days</th>
                            <th className="pb-2.5">Reason</th>
                            <th className="pb-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DDE3EA]">
                          {myLeaves.map((l) => {
                            const lt = leaveTypes.find((t) => t.id === l.leaveTypeId);
                            return (
                              <tr key={l.id} className="hover:bg-[#F7F9FB] transition-colors">
                                <td className="py-2.5 font-semibold text-[#1B2430]">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: lt?.color || "#1F8476" }}
                                    />
                                    <span>{lt?.name || "Leave"}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 text-[#1B2430]">
                                  {formatDate(l.fromDate)}
                                  {l.fromDate !== l.toDate && ` → ${formatDate(l.toDate)}`}
                                </td>
                                <td className="py-2.5 font-bold text-[#1B2430]">{l.days}d</td>
                                <td className="py-2.5 text-[#697586] max-w-xs truncate" title={l.reason}>
                                  {l.reason}
                                </td>
                                <td className="py-2.5">
                                  <Badge
                                    variant={
                                      l.status === "APPROVED"
                                        ? "success"
                                        : l.status === "REJECTED"
                                        ? "danger"
                                        : "warning"
                                    }
                                    size="sm"
                                    dot
                                  >
                                    {l.status === "PENDING"
                                      ? "Pending"
                                      : l.status === "APPROVED"
                                      ? "Approved"
                                      : "Rejected"}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Official Holidays (1 col) */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1F8476]" />
                    <CardTitle>Upcoming Holidays</CardTitle>
                  </div>
                  <Badge variant="neutral" size="sm">
                    2026
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {holidays.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-xl border border-[#DDE3EA] bg-[#F7F9FB] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#1B2430]">{h.name}</p>
                        <p className="text-[11px] text-[#697586]">{formatDate(h.date)}</p>
                      </div>
                      <Badge variant={h.isOptional ? "warning" : "success"} size="sm">
                        {h.isOptional ? "Optional" : "Public"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: MANAGER ("Team Coverage & Leave Approvals")                      */}
      {/* ========================================================================= */}
      {isManager && (
        <div className="space-y-6">
          {/* Action Alert for Manager if Pending Requests */}
          {managerPendingCount > 0 && (
            <div className="bg-[#FEF7E0] border border-[#FEEFC3] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEEFC3] flex items-center justify-center text-[#E69F00] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1B2430]">
                    {managerPendingCount} Direct Report Leave Request{managerPendingCount > 1 ? "s" : ""} Awaiting Your Review
                  </p>
                  <p className="text-xs text-[#697586]">
                    Please process pending vacation applications to ensure roster continuity.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/leave/requests")}
                variant="primary"
                size="sm"
                className="bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl text-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Review Team Leaves
              </Button>
            </div>
          )}

          {/* Grid: Left Team Vacation Schedule (2 cols), Right Manager Personal Quota (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Vacations Schedule (2 cols) */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Team Upcoming Leaves &amp; Coverage</CardTitle>
                    <p className="text-xs text-[#697586] mt-0.5">
                      Direct reports scheduled on approved leave over the next 14 days.
                    </p>
                  </div>
                  <Badge variant="cyan" size="sm">
                    {teamUpcomingLeaves.length} Team Members
                  </Badge>
                </CardHeader>
                <CardContent>
                  {teamUpcomingLeaves.length === 0 ? (
                    <div className="text-center py-12 text-[#697586]">
                      <Users className="w-8 h-8 mx-auto text-[#1F8476] mb-2" />
                      <p className="font-semibold text-xs text-[#1B2430]">Full Team Coverage Active</p>
                      <p className="text-[11px] text-[#697586] mt-0.5">
                        None of your direct reports have scheduled absences in the next two weeks.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teamUpcomingLeaves.map((l) => {
                        const emp = employees.find((e) => e.id === l.employeeId);
                        const lt = leaveTypes.find((t) => t.id === l.leaveTypeId);
                        return (
                          <div
                            key={l.id}
                            className="p-3 bg-white rounded-xl border border-[#DDE3EA] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={emp?.avatar}
                                name={`${emp?.firstName} ${emp?.lastName}`}
                                size="sm"
                              />
                              <div>
                                <span className="font-semibold text-[#1B2430] block">
                                  {emp?.firstName} {emp?.lastName}
                                </span>
                                <span className="text-[11px] text-[#697586]">
                                  {formatDate(l.fromDate)} → {formatDate(l.toDate)} ({l.days} days)
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="success" size="sm">
                                {lt?.code || "Approved"}
                              </Badge>
                              <span className="text-[10px] text-[#697586] block mt-1 italic max-w-xs truncate">
                                "{l.reason}"
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Manager Personal Quotas (1 col) */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Personal Quotas</CardTitle>
                  {onOpenApplyLeave && (
                    <Button
                      onClick={onOpenApplyLeave}
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#DDE3EA]"
                    >
                      Apply
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {myBalances.slice(0, 3).map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 rounded-xl border border-[#DDE3EA] bg-[#F7F9FB] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#1B2430]">{policy.name}</p>
                        <p className="text-[11px] text-[#697586]">Used: {policy.used} / {policy.allocated}d</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-[#1B2430] font-mono">
                          {policy.available}
                        </span>
                        <span className="text-[10px] text-[#697586] block">days left</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: SUPER ADMIN & HR ADMIN ("Corporate Leave Overview")              */}
      {/* ========================================================================= */}
      {(isSuperAdmin || isHrAdmin) && (
        <div className="space-y-6">
          {/* Action Alert Banner for Pending Requests */}
          {pendingRequests > 0 && (
            <div className="bg-[#FEF7E0] border border-[#FEEFC3] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEEFC3] flex items-center justify-center text-[#E69F00] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1B2430]">
                    {pendingRequests} Leave Application{pendingRequests > 1 ? "s" : ""} Awaiting Review
                  </p>
                  <p className="text-xs text-[#697586]">
                    Action is required from HR and line managers before the upcoming payroll cut-off date.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/leave/requests")}
                variant="primary"
                size="sm"
                className="bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl text-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Process Approvals
              </Button>
            </div>
          )}

          {/* KPI Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Applications"
              value={totalRequests}
              icon={<CalendarCheck2 className="w-6 h-6 text-[#1B2430]" />}
              subtitle="Processed this fiscal year"
              accentColor="neutral"
            />

            <KpiCard
              label="Pending Approvals"
              value={pendingRequests}
              icon={<Clock className="w-6 h-6 text-[#E69F00]" />}
              trend={pendingRequests > 0 ? { value: "Action Required", isPositive: false } : undefined}
              subtitle="Awaiting manager signoff"
              accentColor="amber"
              onClick={() => navigate("/leave/requests")}
            />

            <KpiCard
              label="Approved Leaves"
              value={approvedRequests}
              icon={<CheckCircle2 className="w-6 h-6 text-[#188038]" />}
              trend={{
                value: `${totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 100}% Approved`,
                isPositive: true,
              }}
              subtitle="Reflected in biometric roster"
              accentColor="emerald"
            />

            <KpiCard
              label="Leave Utilization"
              value="24.8%"
              icon={<TrendingUp className="w-6 h-6 text-[#1F8476]" />}
              trend={{ value: "Healthy Rate", isPositive: true }}
              subtitle="Against annual employee quota"
              accentColor="indigo"
            />
          </div>

          {/* Visualizations & Upcoming Leaves Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Approved Leaves by Category & Quotas */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Approved Leaves by Category</CardTitle>
                    <p className="text-xs text-[#697586] mt-0.5">
                      Distribution of approved time-off across statutory Casual, Sick, and Privilege Leave quotas.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/leave/policies")}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#1F8476] hover:text-[#166C61]"
                  >
                    Policy Rules →
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leaveByTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDE3EA" />
                        <XAxis
                          dataKey="name"
                          stroke="#697586"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: "#DDE3EA" }}
                        />
                        <YAxis
                          stroke="#697586"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                          contentStyle={{
                            backgroundColor: "#1B2430",
                            borderColor: "#DDE3EA",
                            borderRadius: "12px",
                            color: "#FFFFFF",
                            fontSize: "12px",
                          }}
                          itemStyle={{ color: "#F8FAFC" }}
                          labelStyle={{ color: "#697586", fontWeight: 600, marginBottom: "4px" }}
                          formatter={(val, name, item) => [
                            `${val} Approved Requests`,
                            item.payload.fullName,
                          ]}
                        />
                        <Bar dataKey="requests" fill="#1F8476" radius={[6, 6, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-[#DDE3EA]">
                    {leaveByTypeData.slice(0, 4).map((lt) => (
                      <div
                        key={lt.name}
                        className="p-2.5 rounded-xl bg-[#F7F9FB] border border-[#DDE3EA] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lt.color }} />
                            <span className="font-semibold text-xs text-[#1B2430]">{lt.name}</span>
                          </div>
                          <span className="text-[11px] text-[#697586]">{lt.fullName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#1B2430]">{lt.requests}</span>
                          <span className="text-[10px] text-[#697586] block">appr.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statutory Quotas Snapshot */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Statutory Policy Quotas</CardTitle>
                    <p className="text-xs text-[#697586] mt-0.5">
                      Standard annual entitlements and monthly accrual rules per employee.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {leaveTypes.slice(0, 3).map((policy) => (
                      <div
                        key={policy.id}
                        className="p-3.5 rounded-xl border border-[#DDE3EA] bg-[#F7F9FB] flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: policy.color }} />
                            <span className="font-bold text-xs text-[#1B2430]">{policy.code}</span>
                          </div>
                          <Badge variant={policy.isPaid ? "success" : "neutral"} size="sm">
                            {policy.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>
                        <div className="text-xs text-[#1B2430] font-semibold truncate mb-2">{policy.name}</div>
                        <div className="flex items-baseline justify-between text-xs pt-2 border-t border-[#DDE3EA]">
                          <span className="text-[#697586]">Annual Quota:</span>
                          <span className="font-bold text-[#1B2430]">{policy.annualQuota} Days</span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs mt-1">
                          <span className="text-[#697586]">Monthly Accrual:</span>
                          <span className="font-medium text-[#1B2430]">+{policy.monthlyAccrual} / mo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Upcoming Leaves Feed & Guidelines */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle>Upcoming Org Leaves</CardTitle>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F0F4F8] text-[#1B2430]">
                      {upcomingLeavesCorporate.length} Planned
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingLeavesCorporate.length === 0 ? (
                    <div className="text-center py-10 px-4 text-[#697586]">
                      <Calendar className="w-8 h-8 mx-auto text-[#1F8476] mb-2" />
                      <p className="text-xs font-semibold text-[#1B2430]">No Upcoming Leaves</p>
                      <p className="text-[11px] text-[#697586] mt-0.5">
                        No approved leaves scheduled across the company in the next 14 days.
                      </p>
                    </div>
                  ) : (
                    upcomingLeavesCorporate.slice(0, 5).map((l) => {
                      const emp = employees.find((e) => e.id === l.employeeId);
                      const lt = leaveTypes.find((t) => t.id === l.leaveTypeId);

                      return (
                        <div
                          key={l.id}
                          className="p-3 bg-white rounded-xl border border-[#DDE3EA] space-y-2 hover:border-[#80B6A1] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={emp?.avatar}
                                name={`${emp?.firstName} ${emp?.lastName}`}
                                size="xs"
                              />
                              <div>
                                <span className="font-semibold text-xs text-[#1B2430] block">
                                  {emp?.firstName} {emp?.lastName}
                                </span>
                                <span className="text-[10px] text-[#697586] font-mono">
                                  {emp?.employeeCode}
                                </span>
                              </div>
                            </div>
                            <Badge variant="neutral" size="sm">
                              {lt?.code || "LV"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#DDE3EA]">
                            <div className="flex items-center gap-1 text-[#697586]">
                              <Calendar className="w-3 h-3 text-[#1F8476]" />
                              <span>{formatDate(l.fromDate)}</span>
                            </div>
                            <span className="font-semibold text-[#1B2430] bg-[#F7F9FB] px-2 py-0.5 rounded border border-[#DDE3EA]">
                              {l.days} {l.days === 1 ? "Day" : "Days"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Statutory Rules */}
              <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-[#F7F9FB] space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1F8476]" />
                  <span className="text-xs font-semibold text-[#1B2430]">Statutory Leave Rules</span>
                </div>
                <ul className="text-[11px] text-[#697586] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Casual Leave (CL) cannot be combined with Sick Leave (SL).</li>
                  <li>Medical certificate mandatory for Sick Leave exceeding 2 consecutive days.</li>
                  <li>Privilege Leave (PL) requires advance notice of at least 7 working days.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
