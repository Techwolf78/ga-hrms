import React, { useState, useEffect } from "react";
import { CalendarPlus, Calendar, Clock, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";

export interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyLeaveModal({ isOpen, onClose }: ApplyLeaveModalProps) {
  const { leaveTypes, employees, applyLeave, leaveRequests } = useHrms();
  const { user } = useAuth();

  const [employeeId, setEmployeeId] = useState(user?.employeeId || employees[0]?.id || "EMP-1001");
  const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0]?.id || "lt-cl");
  const [fromDate, setFromDate] = useState("2026-10-12");
  const [toDate, setToDate] = useState("2026-10-12");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<"MORNING" | "AFTERNOON">("AFTERNOON");
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedPolicy = leaveTypes.find((t) => t.id === leaveTypeId);

  // Compute taken leaves for this employee and type
  const usedDays = leaveRequests
    .filter((l) => l.employeeId === employeeId && l.leaveTypeId === leaveTypeId && l.status === "APPROVED")
    .reduce((sum, l) => sum + (l.days || 0), 0);

  const availableQuota = selectedPolicy ? Math.max(0, selectedPolicy.annualQuota - usedDays) : 0;

  // Calculate days difference
  const calculateDays = () => {
    if (isHalfDay) return 0.5;
    try {
      const d1 = new Date(fromDate);
      const d2 = new Date(toDate);
      if (d2 < d1) return 0;
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const daysCount = calculateDays();

  // Reset or adjust toDate if fromDate changes beyond it
  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setErrorMessage("");
    if (toDate < val) {
      setToDate(val);
    }
  };

  const handleToDateChange = (val: string) => {
    if (val < fromDate) {
      setErrorMessage("End date cannot be prior to the start date.");
    } else {
      setErrorMessage("");
    }
    setToDate(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage("Please state a brief reason for the leave application.");
      return;
    }
    if (toDate < fromDate) {
      setErrorMessage("End date cannot be before start date.");
      return;
    }

    applyLeave({
      employeeId,
      leaveTypeId,
      fromDate,
      toDate: isHalfDay ? fromDate : toDate,
      days: daysCount,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : undefined,
      reason: reason.trim(),
    });

    setReason("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      description="Submit a formal leave application for manager approval and roster scheduling."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Select
          label="Applying Employee"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          options={employees.map((e) => ({
            label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
            value: e.id,
          }))}
        />

        <div className="space-y-1.5">
          <Select
            label="Leave Category"
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            options={leaveTypes.map((t) => ({
              label: `${t.name} (${t.code}) - Quota: ${t.annualQuota} Days`,
              value: t.id,
            }))}
          />

          {/* Quota Balance Preview */}
          {selectedPolicy && (
            <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selectedPolicy.color }}
                />
                <span>Quota: {selectedPolicy.annualQuota} Days/Year</span>
              </span>
              <span className="font-semibold text-gray-900">
                {availableQuota} Days Remaining
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Start Date"
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={isHalfDay ? fromDate : toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            disabled={isHalfDay}
            required
          />
        </div>

        {/* Half Day Options */}
        <div className="p-3 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="halfDayToggle"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
              className="rounded border-gray-300 text-gray-950 focus:ring-gray-950/20 w-4 h-4 cursor-pointer accent-gray-950"
            />
            <label
              htmlFor="halfDayToggle"
              className="text-xs font-semibold text-gray-900 cursor-pointer select-none"
            >
              Half-Day Leave Request (0.5 Working Day)
            </label>
          </div>

          {isHalfDay && (
            <div className="flex items-center gap-3 pl-6 pt-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="halfDaySession"
                  checked={halfDaySession === "MORNING"}
                  onChange={() => setHalfDaySession("MORNING")}
                  className="accent-gray-950"
                />
                <span>Morning Session</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="halfDaySession"
                  checked={halfDaySession === "AFTERNOON"}
                  onChange={() => setHalfDaySession("AFTERNOON")}
                  className="accent-gray-950"
                />
                <span>Afternoon Session</span>
              </label>
            </div>
          )}
        </div>

        {/* Total Duration Banner */}
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">Total Requested Duration:</span>
          </div>
          <span className="font-bold text-xs text-gray-950 bg-white px-2.5 py-1 rounded-lg border border-gray-200/80 shadow-xs">
            {daysCount} {daysCount === 1 ? "Working Day" : "Working Days"}
          </span>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700">
            Reason / Purpose for Absence <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Attending family function at native place"
            rows={2}
            className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/5 transition-all resize-none"
            required
          />
        </div>

        <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
}
