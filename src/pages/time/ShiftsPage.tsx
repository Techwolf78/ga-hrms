import React, { useState } from "react";
import {
  CalendarRange,
  Clock,
  Plus,
  Users,
  Edit,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { Shift, Employee } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useToast } from "../../lib/toastContext";

export function ShiftsPage() {
  const { shifts, employees, designations, addShift, updateShift, updateEmployee } = useHrms();
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();

  const role = user?.role || "EMPLOYEE";
  const isAdmin = role === "SUPER_ADMIN" || role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  // Current employee & direct reports
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

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [reassigningEmployee, setReassigningEmployee] = useState<Employee | null>(null);
  const [selectedShiftForReassign, setSelectedShiftForReassign] = useState<string>(shifts[0]?.id || "");

  // Shift Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("18:30");
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [halfDayThresholdHours, setHalfDayThresholdHours] = useState(4.5);

  const handleCreate = () => {
    if (!name || !code) return;
    addShift({
      name,
      code: code.toUpperCase(),
      startTime,
      endTime,
      graceMinutes: Number(graceMinutes),
      halfDayThresholdHours: Number(halfDayThresholdHours),
      workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    });
    toastSuccess(`New shift policy "${name}" created.`);
    setName("");
    setCode("");
    setIsAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editingShift) return;
    updateShift(editingShift.id, {
      name,
      code: code.toUpperCase(),
      startTime,
      endTime,
      graceMinutes: Number(graceMinutes),
      halfDayThresholdHours: Number(halfDayThresholdHours),
    });
    toastSuccess(`Shift policy "${name}" updated.`);
    setEditingShift(null);
  };

  const handleReassignShift = () => {
    if (!reassigningEmployee || !selectedShiftForReassign) return;
    updateEmployee(reassigningEmployee.id, { shiftId: selectedShiftForReassign });
    const targetShift = shifts.find((s) => s.id === selectedShiftForReassign);
    toastSuccess(
      `Reassigned ${reassigningEmployee.firstName} ${reassigningEmployee.lastName} to ${targetShift?.name || "new shift"}.`
    );
    setReassigningEmployee(null);
  };

  const myShift = shifts.find((s) => s.id === currentEmployee?.shiftId) || shifts[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            {isAdmin && "Enterprise Shift Policies & Master Rostering"}
            {isManager && "Team Shift Scheduling & Rostering"}
            {isEmployee && "My Shift Schedule & Timing Rules"}
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5">
            {isAdmin &&
              "Configure global shift timings, grace period buffers, and half-day thresholds across all operating units."}
            {isManager &&
              "Manage roster assignments for your direct reports and inspect standard shift timing policies."}
            {isEmployee &&
              "Review your daily expected working hours, morning grace period allowance, and overtime parameters."}
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              setName("");
              setCode("");
              setIsAddOpen(true);
            }}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Shift Policy
          </Button>
        )}
      </div>

      {/* Employee Personal Active Shift Banner */}
      {isEmployee && myShift && (
        <div className="p-5 sm:p-6 rounded-3xl border border-[#DDE3EA] bg-white shadow-[0_2px_16px_rgba(3,45,66,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center font-bold text-lg shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F8476]">
                  Your Assigned Active Shift
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Active Today
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#1B2430] mt-0.5">
                {myShift.name} ({myShift.code})
              </h2>
              <p className="text-xs text-[#4B5D6B] mt-0.5 font-mono">
                Working Hours: {myShift.startTime} — {myShift.endTime} (IST)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs shrink-0 w-full sm:w-auto">
            <div className="p-3 bg-white rounded-lg border border-[#DDE3EA]">
              <span className="text-[#697586] block text-[11px]">Grace Buffer:</span>
              <span className="font-bold text-emerald-700">{myShift.graceMinutes} Minutes</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#DDE3EA]">
              <span className="text-[#697586] block text-[11px]">Half-Day Min:</span>
              <span className="font-bold text-[#1B2430]">{myShift.halfDayThresholdHours} Hours</span>
            </div>
          </div>
        </div>
      )}

      {/* Manager Direct Reports Shift Allocation Table */}
      {isManager && (
        <div className="bg-white rounded-xl border border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden space-y-3 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#DDE3EA]">
            <div>
              <h3 className="text-sm font-bold text-[#1B2430] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1F8476]" />
                <span>Direct Reports Shift Rostering ({directReports.length} Members)</span>
              </h3>
              <p className="text-xs text-[#697586] mt-0.5">
                Reassign shifts for rotational on-call coverage or client support schedules.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                  <th className="py-3 px-3">Team Member</th>
                  <th className="py-3 px-3">Designation</th>
                  <th className="py-3 px-3">Current Assigned Shift</th>
                  <th className="py-3 px-3">Standard Timings</th>
                  <th className="py-3 px-3">Grace Buffer</th>
                  <th className="py-3 px-3 text-right">Roster Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EA]">
                {directReports.map((dr) => {
                  const empShift = shifts.find((s) => s.id === dr.shiftId) || shifts[0];
                  const desig = designations.find((d) => d.id === dr.designationId);

                  return (
                    <tr key={dr.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {dr.avatar ? (
                            <img
                              src={dr.avatar}
                              alt={dr.firstName}
                              className="w-7 h-7 rounded-full object-cover border border-[#DDE3EA]"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#1F8476]/10 text-[#1F8476] font-bold text-xs flex items-center justify-center">
                              {dr.firstName[0]}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-[#1B2430]">
                              {dr.firstName} {dr.lastName}
                            </span>
                            <span className="text-[#697586] text-[11px] block">{dr.employeeCode}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-[#4B5D6B] font-medium">
                        {desig?.title || "Team Member"}
                      </td>

                      <td className="py-3 px-3">
                        <Badge
                          variant="neutral"
                          size="sm"
                          className="font-bold bg-[#1F8476]/10 text-[#1F8476] border border-[#1F8476]/30"
                        >
                          {empShift?.name} ({empShift?.code})
                        </Badge>
                      </td>

                      <td className="py-3 px-3 font-mono text-[#1B2430] font-semibold">
                        {empShift?.startTime} – {empShift?.endTime}
                      </td>

                      <td className="py-3 px-3 text-emerald-700 font-semibold">
                        {empShift?.graceMinutes} Mins
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Button
                          onClick={() => {
                            setReassigningEmployee(dr);
                            setSelectedShiftForReassign(dr.shiftId || shifts[0]?.id || "");
                          }}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 text-[#1F8476] hover:bg-[#1F8476]/5 border-[#1F8476]/30 font-semibold"
                          leftIcon={<ArrowRightLeft className="w-3 h-3" />}
                        >
                          Reassign
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Corporate Shift Policies Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#697586]">
            {isAdmin ? "Defined Shift Templates" : "Corporate Shift Policy Catalog"}
          </h3>
          <span className="text-xs text-[#697586] font-semibold">
            {shifts.length} Policies Configured
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shifts.map((shift) => {
            const assignedCount = employees.filter((e) => e.shiftId === shift.id).length;
            const isUserShift = currentEmployee?.shiftId === shift.id;

            return (
              <div
                key={shift.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
                  isUserShift
                    ? "border-[#1F8476] ring-2 ring-[#1F8476]/10"
                    : "border-[#DDE3EA] hover:border-[#b8c2cc]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#1B2430]">{shift.name}</h4>
                      <Badge variant="neutral" size="sm" className="mt-1 font-mono text-[10px]">
                        {shift.code}
                      </Badge>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingShift(shift);
                          setName(shift.name);
                          setCode(shift.code);
                          setStartTime(shift.startTime);
                          setEndTime(shift.endTime);
                          setGraceMinutes(shift.graceMinutes);
                          setHalfDayThresholdHours(shift.halfDayThresholdHours);
                        }}
                        className="p-1.5 text-[#697586] hover:text-[#1B2430] hover:bg-[#F7F9FB] rounded-lg transition-colors border border-[#DDE3EA]"
                        title="Edit Shift Policy"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="p-3 bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-center">
                    <span className="text-[11px] text-[#697586] font-medium">Standard Hours</span>
                    <p className="text-base font-bold text-[#1B2430] font-mono mt-0.5">
                      {shift.startTime} – {shift.endTime}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Grace Buffer:</span>
                      <span className="font-semibold text-emerald-700">
                        {shift.graceMinutes} Minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Half-Day Threshold:</span>
                      <span className="font-semibold text-[#1B2430]">
                        {shift.halfDayThresholdHours} Hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Rostered Staff:</span>
                      <span className="font-bold text-[#1B2430]">{assignedCount} Members</span>
                    </div>
                  </div>
                </div>

                {isUserShift && (
                  <div className="pt-2 border-t border-[#DDE3EA] flex items-center gap-1.5 text-[11px] font-bold text-[#1F8476]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Your Current Working Shift</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Shift Modal (Admin Only) */}
      {isAdmin && (
        <Modal
          isOpen={isAddOpen || !!editingShift}
          onClose={() => {
            setIsAddOpen(false);
            setEditingShift(null);
          }}
          title={editingShift ? "Edit Shift Policy" : "Create New Shift Policy"}
          description="Define shift parameters, start/end hours, and late punch grace periods."
        >
          <div className="space-y-4">
            <Input
              label="Shift Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Afternoon Support Shift"
              required
            />
            <Input
              label="Shift Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. AFT-01"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Shift Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <Input
                label="Shift End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Grace Minutes Buffer"
                type="number"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
              />
              <Input
                label="Half-Day Min Hours"
                type="number"
                value={halfDayThresholdHours}
                onChange={(e) => setHalfDayThresholdHours(Number(e.target.value))}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingShift(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
                onClick={editingShift ? handleUpdate : handleCreate}
              >
                Save Shift Policy
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reassign Shift Modal (Manager & Admin) */}
      {reassigningEmployee && (
        <Modal
          isOpen={!!reassigningEmployee}
          onClose={() => setReassigningEmployee(null)}
          title={`Reassign Shift — ${reassigningEmployee.firstName} ${reassigningEmployee.lastName}`}
          description={`Update shift schedule for ${reassigningEmployee.employeeCode}.`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-[#F7F9FB] rounded-lg border border-[#DDE3EA] text-xs space-y-1">
              <div>
                <span className="text-[#697586]">Staff Member: </span>
                <span className="font-bold text-[#1B2430]">
                  {reassigningEmployee.firstName} {reassigningEmployee.lastName} ({reassigningEmployee.employeeCode})
                </span>
              </div>
              <div>
                <span className="text-[#697586]">Designation: </span>
                <span className="font-semibold text-[#1B2430]">
                  {designations.find((d) => d.id === reassigningEmployee.designationId)?.title || "Staff"}
                </span>
              </div>
            </div>

            <Select
              label="Select New Shift Schedule"
              value={selectedShiftForReassign}
              onChange={(e) => setSelectedShiftForReassign(e.target.value)}
              options={shifts.map((s) => ({
                label: `${s.name} (${s.code}) — ${s.startTime} to ${s.endTime}`,
                value: s.id,
              }))}
            />

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Shift changes reflect immediately in biometric attendance tracking.</span>
            </div>

            <div className="pt-3 flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReassigningEmployee(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
                onClick={handleReassignShift}
              >
                Confirm Shift Roster
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}