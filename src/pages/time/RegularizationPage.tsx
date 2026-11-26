import React, { useState } from "react";
import {
  ClockAlert,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Filter,
  Search,
  Users,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Check,
  X,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../lib/utils";
import { AttendanceCorrectionModal } from "./AttendanceCorrectionModal";

export function RegularizationPage() {
  const {
    regularizations,
    employees,
    departments,
    designations,
    branches,
    approveRegularization,
    rejectRegularization,
  } = useHrms();
  const { user } = useAuth();

  const role = user?.role || "EMPLOYEE";
  const isAdmin = role === "SUPER_ADMIN" || role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  // Current employee and direct reports resolution
  const currentEmployee =
    employees.find(
      (e) => e.id === user?.employeeId || e.employeeCode === user?.employeeId
    ) ||
    employees.find((e) => e.email === user?.email) ||
    employees[0];

  const directReports = employees.filter(
    (e) =>
      e.managerId === currentEmployee?.id ||
      e.managerId === user?.employeeId ||
      (currentEmployee &&
        e.departmentId === currentEmployee.departmentId &&
        e.id !== currentEmployee.id)
  );

  // Manager dual-tab state
  const [managerTab, setManagerTab] = useState<"TEAM" | "MY">("TEAM");

  // Filter states
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Base dataset scoped by role
  const scopedRequests = regularizations.filter((reg) => {
    if (isAdmin) return true;

    if (isManager) {
      if (managerTab === "TEAM") {
        return directReports.some(
          (dr) => dr.id === reg.employeeId || dr.employeeCode === reg.employeeId
        );
      } else {
        // Manager's own requests
        return (
          reg.employeeId === currentEmployee?.id ||
          reg.employeeId === currentEmployee?.employeeCode ||
          reg.employeeId === user?.employeeId
        );
      }
    }

    // Employee: strictly personal requests
    return (
      reg.employeeId === currentEmployee?.id ||
      reg.employeeId === currentEmployee?.employeeCode ||
      reg.employeeId === user?.employeeId
    );
  });

  // Calculate counts based on scoped dataset
  const pendingCount = scopedRequests.filter((r) => r.status === "PENDING").length;
  const approvedCount = scopedRequests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = scopedRequests.filter((r) => r.status === "REJECTED").length;

  // Filter requests by status, department, branch, and search query
  const filteredRequests = scopedRequests.filter((reg) => {
    if (selectedStatus !== "ALL" && reg.status !== selectedStatus) return false;

    const emp = employees.find(
      (e) => e.id === reg.employeeId || e.employeeCode === reg.employeeId
    );

    if (isAdmin) {
      if (selectedDepartment !== "ALL" && emp?.departmentId !== selectedDepartment)
        return false;
      if (selectedBranch !== "ALL" && emp?.branchId !== selectedBranch)
        return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : "";
      const code = emp?.employeeCode?.toLowerCase() || "";
      const reason = (reg.reason || "").toLowerCase();
      const dateStr = reg.date.toLowerCase();
      if (!name.includes(q) && !code.includes(q) && !reason.includes(q) && !dateStr.includes(q))
        return false;
    }

    return true;
  });

  // Determine canApprove for a given item
  const canApprove = (reg: (typeof regularizations)[0]) => {
    if (isAdmin) return true;
    if (isManager && managerTab === "TEAM") {
      // Manager can approve direct report requests
      return directReports.some(
        (dr) => dr.id === reg.employeeId || dr.employeeCode === reg.employeeId
      );
    }
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            {isAdmin && "Corporate Punch Regularization Register"}
            {isManager && "Team Attendance & Regularization Approvals"}
            {isEmployee && "My Punch Regularizations"}
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5">
            {isAdmin &&
              "Pan-organization punch dispute sanctions, biometric anomaly reconciliation, and audit logs."}
            {isManager &&
              "Review missed punch regularizations for direct reports and submit your personal correction requests."}
            {isEmployee &&
              "Submit and track corrections for missed punches, biometric glitches, or outdoor client duty."}
          </p>
        </div>

        <Button
          onClick={() => setIsApplyOpen(true)}
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Request Regularization
        </Button>
      </div>

      {/* Role Banner / Context */}
      {isManager && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          {/* Dual Tab Switcher */}
          <div className="inline-flex p-1 bg-[#F7F9FB] rounded-lg border border-[#DDE3EA] gap-1">
            <button
              onClick={() => setManagerTab("TEAM")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                managerTab === "TEAM"
                  ? "bg-white text-[#1F8476] shadow-sm font-bold border border-[#DDE3EA]"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Direct Reports Requests</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#1F8476]/10 text-[#1F8476]">
                {directReports.length} Members
              </span>
            </button>
            <button
              onClick={() => setManagerTab("MY")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                managerTab === "MY"
                  ? "bg-white text-[#1F8476] shadow-sm font-bold border border-[#DDE3EA]"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Own Regularizations</span>
            </button>
          </div>

          <div className="text-xs text-[#697586] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#1F8476] shrink-0" />
            <span>
              {managerTab === "TEAM"
                ? `You have manager approval authority over ${directReports.length} direct report(s).`
                : "Your personal punch regularizations require HR Ops sanction."}
            </span>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setSelectedStatus(selectedStatus === "PENDING" ? "ALL" : "PENDING")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "PENDING"
              ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/10 shadow-xs"
              : "bg-white border-[#DDE3EA] hover:border-[#b8c2cc]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">
              {isAdmin ? "Org Pending Review" : isManager && managerTab === "TEAM" ? "Team Approvals Req." : "My Pending Requests"}
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                Action Req.
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === "APPROVED" ? "ALL" : "APPROVED")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "APPROVED"
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs"
              : "bg-white border-[#DDE3EA] hover:border-[#b8c2cc]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Approved Punches</span>
            <CheckCircle2 className="w-4 h-4 text-[#62D84E]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#1B2430]">{approvedCount}</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === "REJECTED" ? "ALL" : "REJECTED")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "REJECTED"
              ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/10 shadow-xs"
              : "bg-white border-[#DDE3EA] hover:border-[#b8c2cc]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Disallowed / Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#1B2430]">{rejectedCount}</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedStatus("ALL")}
          className={`p-4 rounded-xl border bg-white border-[#DDE3EA] hover:border-[#b8c2cc] cursor-pointer transition-all ${
            selectedStatus === "ALL" ? "ring-2 ring-[#1F8476]/10" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">
              {isAdmin ? "Total Pan-Org Log" : isManager && managerTab === "TEAM" ? "Team Requests" : "My Total Submitted"}
            </span>
            <ClockAlert className="w-4 h-4 text-[#1F8476]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{scopedRequests.length}</span>
            <span className="text-[11px] text-[#697586]">records</span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tab Segmented Control */}
          <div className="inline-flex items-center p-1 bg-[#F7F9FB] rounded-lg border border-[#DDE3EA] gap-1 shrink-0 overflow-x-auto">
            {[
              { id: "ALL", label: "All Requests", count: scopedRequests.length },
              { id: "PENDING", label: "Pending", count: pendingCount },
              { id: "APPROVED", label: "Approved", count: approvedCount },
              { id: "REJECTED", label: "Rejected", count: rejectedCount },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#1B2430] shadow-xs font-bold border border-[#DDE3EA]"
                      : "text-[#697586] hover:text-[#1B2430]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-[#1F8476] text-white"
                        : "bg-[#DDE3EA] text-[#4B5D6B]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Org Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 lg:max-w-xl">
            {isAdmin && (
              <>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full sm:w-40 h-9 px-2.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg text-[#1B2430] focus:outline-none focus:border-[#1F8476]"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full sm:w-36 h-9 px-2.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg text-[#1B2430] focus:outline-none focus:border-[#1F8476]"
                >
                  <option value="ALL">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.city} ({b.code})
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#697586]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee, date, or reason..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg text-[#1B2430] placeholder-[#697586] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                {(!isEmployee && !(isManager && managerTab === "MY")) && (
                  <th className="py-3.5 px-4">Employee</th>
                )}
                <th className="py-3.5 px-4">Attendance Date</th>
                <th className="py-3.5 px-4">Correction Type</th>
                <th className="py-3.5 px-4">Requested Punch Time</th>
                <th className="py-3.5 px-4">Reason / Justification</th>
                <th className="py-3.5 px-4">Sanction Status</th>
                <th className="py-3.5 px-4 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE3EA]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={!isEmployee && !(isManager && managerTab === "MY") ? 7 : 6}
                    className="py-14 text-center text-[#697586] text-sm"
                  >
                    <ClockAlert className="w-8 h-8 text-[#697586]/40 mx-auto mb-2" />
                    No attendance regularization requests found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((reg) => {
                  const emp = employees.find(
                    (e) => e.id === reg.employeeId || e.employeeCode === reg.employeeId
                  );
                  const isApprovable = canApprove(reg);

                  return (
                    <tr key={reg.id} className="hover:bg-[#F7F9FB]/70 transition-colors">
                      {(!isEmployee && !(isManager && managerTab === "MY")) && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {emp?.avatar ? (
                              <img
                                src={emp.avatar}
                                alt={emp.firstName}
                                className="w-7 h-7 rounded-full object-cover border border-[#DDE3EA]"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#1F8476]/10 text-[#1F8476] flex items-center justify-center font-bold text-xs">
                                {emp?.firstName?.[0] || reg.employeeId[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-[#1B2430]">
                                {emp ? `${emp.firstName} ${emp.lastName}` : reg.employeeId}
                              </div>
                              <div className="text-[11px] text-[#697586]">
                                {emp?.employeeCode} • {designations.find((d) => d.id === emp?.designationId)?.title || "Staff Member"}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="py-3 px-4 text-xs font-medium text-[#1B2430]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#697586]" />
                          <span>{formatDate(reg.date)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="neutral"
                          size="sm"
                          className="font-semibold bg-gray-100 text-[#4B5D6B]"
                        >
                          {reg.missingPunchType === "BOTH"
                            ? "Full Day Missed"
                            : `${reg.missingPunchType} Punch`}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#1B2430]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#1F8476]" />
                          <span>{reg.requestedTime}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-[#4B5D6B] max-w-xs">
                        <p className="truncate" title={reg.reason}>
                          {reg.reason}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            reg.status === "APPROVED"
                              ? "success"
                              : reg.status === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                          dot
                        >
                          {reg.status === "PENDING"
                            ? isEmployee || (isManager && managerTab === "MY")
                              ? "Under Review"
                              : "Action Required"
                            : reg.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {reg.status === "PENDING" ? (
                          isApprovable ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                onClick={() => approveRegularization(reg.id)}
                                variant="primary"
                                size="sm"
                                className="h-7 text-xs px-2.5 font-bold bg-[#1F8476] hover:bg-[#16665b] text-white"
                                leftIcon={<Check className="w-3 h-3" />}
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => rejectRegularization(reg.id)}
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2 text-rose-600 hover:bg-rose-50 border-rose-200"
                                leftIcon={<X className="w-3 h-3" />}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-[#697586] italic">
                              {isManager && managerTab === "MY"
                                ? "Awaiting HR Sanction"
                                : "Awaiting Manager Review"}
                            </span>
                          )
                        ) : (
                          <div className="text-xs text-[#697586]">
                            {reg.approvedBy ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                {reg.approvedBy}
                              </span>
                            ) : (
                              <span>Sanction Processed</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Correction Modal */}
      <AttendanceCorrectionModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        prefillEmployeeId={
          isEmployee || (isManager && managerTab === "MY")
            ? currentEmployee?.id || user?.employeeId
            : undefined
        }
      />
    </div>
  );
}