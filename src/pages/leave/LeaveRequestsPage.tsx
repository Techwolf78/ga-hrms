import React, { useState, useMemo } from "react";
import {
  CalendarCheck2,
  Plus,
  CheckCircle2,
  XCircle,
  Filter,
  Calendar,
  Search,
  Clock,
  RotateCcw,
  Check,
  X,
  FileText,
  Users,
  ShieldCheck,
  Building2,
  User,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { formatDate } from "../../lib/utils";

export interface LeaveRequestsPageProps {
  onOpenApplyLeave?: () => void;
}

export function LeaveRequestsPage({ onOpenApplyLeave }: LeaveRequestsPageProps) {
  const { leaveRequests, leaveTypes, employees, departments, branches, approveLeave, rejectLeave } = useHrms();
  const { user } = useAuth();

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

  // Tab State for Manager (Team vs My Leaves)
  const [managerTab, setManagerTab] = useState<"TEAM" | "MY_LEAVES">("TEAM");

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Base Scoped Requests based on role
  const scopedRequests = useMemo(() => {
    if (isEmployee) {
      const targetEmpId = currentEmployee?.id || user?.employeeId || "EMP-1004";
      const targetEmpCode = currentEmployee?.employeeCode || "EMP-1004";
      return leaveRequests.filter((l) => l.employeeId === targetEmpId || l.employeeId === targetEmpCode);
    }
    if (isManager) {
      if (managerTab === "MY_LEAVES") {
        const targetEmpId = currentEmployee?.id || user?.employeeId || "EMP-1003";
        const targetEmpCode = currentEmployee?.employeeCode || "EMP-1003";
        return leaveRequests.filter((l) => l.employeeId === targetEmpId || l.employeeId === targetEmpCode);
      }
      return leaveRequests.filter((l) =>
        directReports.some((dr) => dr.id === l.employeeId || dr.employeeCode === l.employeeId)
      );
    }
    return leaveRequests;
  }, [isEmployee, isManager, managerTab, leaveRequests, currentEmployee, user?.employeeId, directReports]);

  // Counts for tabs/ribbon
  const pendingCount = scopedRequests.filter((l) => l.status === "PENDING").length;
  const approvedCount = scopedRequests.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = scopedRequests.filter((l) => l.status === "REJECTED").length;
  const totalApprovedDays = scopedRequests
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => sum + (l.days || 0), 0);

  // Filtered requests after applying search & dropdowns
  const filteredRequests = useMemo(() => {
    return scopedRequests.filter((req) => {
      const matchesStatus = selectedStatus === "ALL" || req.status === selectedStatus;
      const matchesType = selectedType === "ALL" || req.leaveTypeId === selectedType;

      const emp = employees.find((e) => e.id === req.employeeId || e.employeeCode === req.employeeId);
      const matchesDept = selectedDept === "ALL" || emp?.departmentId === selectedDept;

      if (!matchesStatus || !matchesType || !matchesDept) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const fullName = `${emp?.firstName || ""} ${emp?.lastName || ""}`.toLowerCase();
      const empCode = (emp?.employeeCode || "").toLowerCase();
      const reason = (req.reason || "").toLowerCase();

      return fullName.includes(q) || empCode.includes(q) || reason.includes(q);
    });
  }, [scopedRequests, selectedStatus, selectedType, selectedDept, searchQuery, employees]);

  const handleOpenReject = (id: string) => {
    setRejectingRequestId(id);
    setRejectionReason("Operational exigencies require roster coverage.");
  };

  const handleConfirmReject = () => {
    if (!rejectingRequestId) return;
    rejectLeave(rejectingRequestId, rejectionReason);
    setRejectingRequestId(null);
    setRejectionReason("");
  };

  const resetFilters = () => {
    setSelectedStatus("ALL");
    setSelectedType("ALL");
    setSelectedDept("ALL");
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PERSONA SCOPE                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight whitespace-nowrap">
            {isEmployee
              ? "My Leave Applications"
              : isManager
              ? managerTab === "TEAM"
                ? "Team Leave Requests"
                : "My Personal Leaves"
              : "Corporate Leave Register & Sanctions"}
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5 truncate hidden sm:block">
            {isEmployee
              ? "Track your submitted leave requests, approval progress, and manager remarks."
              : isManager
              ? "Review time-off applications from direct reports and balance weekly shift coverage."
              : "Pan-organization leave processing, policy enforcement, and statutory absence logs."}
          </p>
        </div>

        {onOpenApplyLeave && (
          <Button
            onClick={onOpenApplyLeave}
            variant="primary"
            size="sm"
            className="h-8 text-xs font-bold whitespace-nowrap px-3.5 bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs shrink-0"
            leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
          >
            Apply for Leave
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MANAGER DUAL TAB SWITCHER                                             */}
      {/* ========================================================================= */}
      {isManager && (
        <div className="border-b border-[#DDE3EA] flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setManagerTab("TEAM")}
            className={`pb-3 transition-colors flex items-center gap-2 ${
              managerTab === "TEAM"
                ? "text-[#1F8476] border-b-2 border-[#1F8476] font-bold"
                : "text-[#697586] hover:text-[#1B2430]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direct Reports Requests ({directReports.length} Members)</span>
          </button>

          <button
            onClick={() => setManagerTab("MY_LEAVES")}
            className={`pb-3 transition-colors flex items-center gap-2 ${
              managerTab === "MY_LEAVES"
                ? "text-[#1F8476] border-b-2 border-[#1F8476] font-bold"
                : "text-[#697586] hover:text-[#1B2430]"
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>My Own Leave History</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUMMARY METRICS RIBBON                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setSelectedStatus(selectedStatus === "PENDING" ? "ALL" : "PENDING")}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            selectedStatus === "PENDING"
              ? "bg-[#FEF7E0]/70 border-[#FEEFC3] ring-2 ring-[#E69F00]/20"
              : "bg-white border-[#DDE3EA] hover:border-[#80B6A1]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">
              {isEmployee ? "Pending Approval" : "Pending Signoff"}
            </span>
            <Clock className="w-4 h-4 text-[#E69F00]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold text-[#1B2430] bg-[#FEF7E0] border border-[#FEEFC3] px-1.5 py-0.5 rounded-full">
                {isEmployee ? "Awaiting Review" : "Action Required"}
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === "APPROVED" ? "ALL" : "APPROVED")}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            selectedStatus === "APPROVED"
              ? "bg-[#E6F4EA]/70 border-[#CEEAD6] ring-2 ring-[#188038]/20"
              : "bg-white border-[#DDE3EA] hover:border-[#80B6A1]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Approved Requests</span>
            <CheckCircle2 className="w-4 h-4 text-[#188038]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{approvedCount}</span>
            <span className="text-[10px] font-bold text-[#188038] bg-[#E6F4EA] border border-[#CEEAD6] px-1.5 py-0.5 rounded-full">
              Sanctioned
            </span>
          </div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === "REJECTED" ? "ALL" : "REJECTED")}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            selectedStatus === "REJECTED"
              ? "bg-[#FCE8E6]/70 border-[#FAD2CF] ring-2 ring-[#C62828]/20"
              : "bg-white border-[#DDE3EA] hover:border-[#80B6A1]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Rejected</span>
            <XCircle className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{rejectedCount}</span>
            <span className="text-[10px] font-medium text-[#697586]">Unapproved</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Approved Days</span>
            <Calendar className="w-4 h-4 text-[#1F8476]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{totalApprovedDays}</span>
            <span className="text-xs text-[#697586]">days taken</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FILTER TOOLBAR                                                        */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#DDE3EA] shadow-2xs flex items-center gap-3 flex-wrap justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#697586] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isEmployee
                ? "Search by reason or leave type..."
                : isManager
                ? "Search direct report name or reason..."
                : "Search employee name, code, or reason..."
            }
            className="w-full h-8.5 pl-9 pr-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] placeholder-[#697586] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8.5 px-2.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8.5 px-2.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
          >
            <option value="ALL">All Leave Categories</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>

          {/* Department Filter (Admin Only) */}
          {(isSuperAdmin || isHrAdmin) && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-8.5 px-2.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {(selectedStatus !== "ALL" || selectedType !== "ALL" || selectedDept !== "ALL" || searchQuery) && (
            <button
              onClick={resetFilters}
              className="h-8.5 px-2.5 text-xs text-[#697586] hover:text-[#1B2430] hover:bg-[#F7F9FB] rounded-lg flex items-center gap-1 transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. REQUESTS DATA TABLE                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                {!isEmployee && <th className="py-3 px-4">Employee</th>}
                <th className="py-3 px-4">Leave Category</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason / Purpose</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">
                  {isEmployee ? "Actions" : "Approval Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE3EA]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#697586]">
                    <div className="w-10 h-10 rounded-full bg-[#F7F9FB] flex items-center justify-center mx-auto mb-2 text-[#697586]">
                      <CalendarCheck2 className="w-5 h-5 text-[#1F8476]" />
                    </div>
                    <p className="text-sm font-semibold text-[#1B2430]">No Leave Applications Found</p>
                    <p className="text-xs text-[#697586] mt-1">
                      {isManager && managerTab === "TEAM"
                        ? "All direct report leave requests have been reviewed."
                        : "No requests match the selected status or filters."}
                    </p>
                    {(selectedStatus !== "ALL" || selectedType !== "ALL" || searchQuery) && (
                      <button
                        onClick={resetFilters}
                        className="mt-3 text-xs text-[#1F8476] hover:underline font-medium"
                      >
                        Clear active filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const emp = employees.find((e) => e.id === req.employeeId || e.employeeCode === req.employeeId);
                  const lt = leaveTypes.find((t) => t.id === req.leaveTypeId);

                  return (
                    <tr key={req.id} className="hover:bg-[#F7F9FB] transition-colors">
                      {/* Employee Column (Hidden on Employee View) */}
                      {!isEmployee && (
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
                              <span className="text-[11px] font-mono text-[#697586]">{emp?.employeeCode}</span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Leave Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: lt?.color || "#1F8476" }}
                          />
                          <span className="text-xs font-semibold text-[#1B2430]">
                            {lt?.name || "Leave"}
                          </span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#1B2430]">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span>{formatDate(req.fromDate)}</span>
                          {req.fromDate !== req.toDate && (
                            <>
                              <span className="text-[#697586]">→</span>
                              <span>{formatDate(req.toDate)}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-[#1B2430] bg-[#F0F4F8] border border-[#DDE3EA] px-2 py-0.5 rounded-md">
                          {req.days} {req.days === 1 ? "Day" : "Days"}
                          {req.isHalfDay && (
                            <span className="text-[10px] font-normal text-[#697586]">(Half)</span>
                          )}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-xs text-[#697586] max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </td>

                      {/* Applied Date */}
                      <td className="py-3.5 px-4 text-xs text-[#697586] whitespace-nowrap">
                        {req.appliedDate ? formatDate(req.appliedDate) : "—"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            req.status === "APPROVED"
                              ? "success"
                              : req.status === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                          dot
                        >
                          {req.status === "PENDING"
                            ? "Pending"
                            : req.status === "APPROVED"
                            ? "Approved"
                            : "Rejected"}
                        </Badge>
                      </td>

                      {/* Actions: Strictly Scoped per Role */}
                      <td className="py-3.5 px-4 text-right">
                        {/* 1. Admin & Manager Approval Actions */}
                        {!isEmployee && (isSuperAdmin || isHrAdmin || (isManager && managerTab === "TEAM")) ? (
                          req.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                onClick={() => approveLeave(req.id)}
                                variant="primary"
                                size="sm"
                                className="h-7 text-xs px-2.5 font-bold bg-[#1F8476] hover:bg-[#166C61] text-white rounded-lg shadow-xs"
                                leftIcon={<Check className="w-3.5 h-3.5" />}
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleOpenReject(req.id)}
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2 text-[#C62828] border-[#FAD2CF] hover:bg-[#FCE8E6] rounded-lg"
                                leftIcon={<X className="w-3.5 h-3.5" />}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#697586] italic">
                              {req.status === "APPROVED" ? "Sanctioned" : "Declined"}
                            </span>
                          )
                        ) : (
                          /* 2. Employee View: Status Info */
                          <span className="text-[11px] text-[#697586]">
                            {req.status === "PENDING" ? "Under Review" : "Processed"}
                          </span>
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

      {/* ========================================================================= */}
      {/* 6. REJECTION REASON MODAL                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!rejectingRequestId}
        onClose={() => setRejectingRequestId(null)}
        title="Decline Leave Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#697586]">
            Provide a clear remark or business reason for declining this request. This remark will be visible to the employee.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Reason for Declining
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#DDE3EA] bg-[#F7F9FB] text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              placeholder="e.g. Critical deployment window scheduled during requested dates..."
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDE3EA]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingRequestId(null)}
              className="text-xs border-[#DDE3EA]"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReject}
              className="text-xs bg-[#C62828] text-white hover:bg-rose-700"
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
