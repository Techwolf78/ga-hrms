import React, { useState } from "react";
import {
  ClockAlert,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Filter,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { formatDate } from "../../lib/utils";

export function RegularizationPage() {
  const { regularizations, employees, applyRegularization, approveRegularization, rejectRegularization } = useHrms();
  const { user } = useAuth();

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(user?.employeeId || employees[0]?.id || "EMP-1001");
  const [date, setDate] = useState("2026-10-05");
  const [missingPunchType, setMissingPunchType] = useState<"IN" | "OUT" | "BOTH">("OUT");
  const [requestedTime, setRequestedTime] = useState("18:30");
  const [reason, setReason] = useState("");

  const handleApply = () => {
    if (!reason) return;
    applyRegularization({
      employeeId,
      date,
      missingPunchType,
      requestedTime,
      reason,
    });
    setReason("");
    setIsApplyOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
            Attendance Regularization
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Resolve missed punches, hardware failures, or outdoor duty with manager approval.
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

      {/* Requests Table */}
      <div className="bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Attendance Date</th>
                <th className="py-3.5 px-4">Missing Punch</th>
                <th className="py-3.5 px-4">Requested Time</th>
                <th className="py-3.5 px-4">Reason / Justification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {regularizations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-400 text-sm">
                    No regularization requests pending.
                  </td>
                </tr>
              ) : (
                regularizations.map((reg) => {
                  const emp = employees.find((e) => e.id === reg.employeeId);
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-950">
                          {emp ? `${emp.firstName} ${emp.lastName}` : reg.employeeId}
                        </div>
                        <div className="text-xs text-gray-500">{emp?.employeeCode}</div>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-gray-900">
                        {formatDate(reg.date)}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="neutral" size="sm">
                          {reg.missingPunchType} Punch
                        </Badge>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-900">
                        {reg.requestedTime}
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">
                        {reg.reason}
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
                          {reg.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {reg.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => approveRegularization(reg.id)}
                              variant="success"
                              size="sm"
                              className="h-8 text-xs px-2.5"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => rejectRegularization(reg.id)}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs px-2.5 text-rose-600 hover:bg-rose-50 border-rose-200"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {reg.approvedBy ? `Reviewed by ${reg.approvedBy}` : "Completed"}
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

      {/* Apply Regularization Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Submit Attendance Regularization Request"
        description="Provide details for missed punches or biometric reader discrepancies."
      >
        <div className="space-y-4">
          <Select
            label="Employee"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            options={employees.map((e) => ({
              label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
              value: e.id,
            }))}
          />

          <Input
            label="Attendance Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Select
            label="Missing Punch Type"
            value={missingPunchType}
            onChange={(e) => setMissingPunchType(e.target.value as any)}
            options={[
              { label: "Missing Punch Out", value: "OUT" },
              { label: "Missing Punch In", value: "IN" },
              { label: "Both In and Out", value: "BOTH" },
            ]}
          />

          <Input
            label="Actual In/Out Time"
            type="time"
            value={requestedTime}
            onChange={(e) => setRequestedTime(e.target.value)}
            required
          />

          <Input
            label="Reason / Explanation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Device was offline / Client site visit"
            required
          />

          <div className="pt-4 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setIsApplyOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
