import React, { useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  CalendarX2,
  ClockAlert,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Radio,
  MapPin,
  Fingerprint,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { AttendanceRecord, AttendanceStatus } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Modal } from "../../components/ui/Modal";
import { formatTime, formatDate } from "../../lib/utils";

export function AttendancePage() {
  const { attendance, employees, departments, branches, shifts, punchAttendance } = useHrms();
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState("2026-10-06");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [detailRecord, setDetailRecord] = useState<AttendanceRecord | null>(null);

  // Filter records for this date
  const recordsForDate = attendance.filter((a) => a.date === currentDate);

  const filteredRecords = recordsForDate.filter((record) => {
    const emp = employees.find((e) => e.id === record.employeeId);
    if (!emp) return false;

    const matchesDept = selectedDept === "ALL" || emp.departmentId === selectedDept;
    const matchesBranch = selectedBranch === "ALL" || emp.branchId === selectedBranch;
    const matchesStatus = selectedStatus === "ALL" || record.status === selectedStatus;

    return matchesDept && matchesBranch && matchesStatus;
  });

  // Today's summary counts
  const presentCount = recordsForDate.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE" || a.status === "HALF_DAY"
  ).length;
  const lateCount = recordsForDate.filter((a) => a.status === "LATE").length;
  const absentCount = recordsForDate.filter((a) => a.status === "ABSENT").length;
  const halfDayCount = recordsForDate.filter((a) => a.status === "HALF_DAY").length;
  const leaveCount = recordsForDate.filter((a) => a.status === "LEAVE").length;

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return <Badge variant="success" size="sm" dot>Present</Badge>;
      case "LATE":
        return <Badge variant="warning" size="sm" dot>Late</Badge>;
      case "HALF_DAY":
        return <Badge variant="neutral" size="sm" dot>Half Day</Badge>;
      case "ABSENT":
        return <Badge variant="danger" size="sm" dot>Absent</Badge>;
      case "LEAVE":
        return <Badge variant="neutral" size="sm" dot>On Leave</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
            Time & Attendance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Biometric punch normalization, GPS web check-in, and working hours analytics.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-card border border-surface-border shadow-xs">
          <button
            onClick={() => setCurrentDate("2026-10-05")}
            className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2 text-xs font-semibold text-gray-900">
            <Calendar className="w-3.5 h-3.5 text-gray-700" />
            <span>{formatDate(currentDate)}</span>
          </div>

          <button
            onClick={() => setCurrentDate("2026-10-06")}
            className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-card border border-surface-border shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-emerald-700">Present</span>
          <p className="text-2xl font-bold text-gray-950 mt-0.5">{presentCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-card border border-surface-border shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-amber-700">Late Arrival</span>
          <p className="text-2xl font-bold text-gray-950 mt-0.5">{lateCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-card border border-surface-border shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-indigo-700">Half Day</span>
          <p className="text-2xl font-bold text-gray-950 mt-0.5">{halfDayCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-card border border-surface-border shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-rose-700">Absent</span>
          <p className="text-2xl font-bold text-gray-950 mt-0.5">{absentCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-card border border-surface-border shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase text-blue-700">On Leave</span>
          <p className="text-2xl font-bold text-gray-950 mt-0.5">{leaveCount}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-card border border-surface-border shadow-card flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Records:</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 px-2.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/5 transition-all"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="h-9 px-2.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/5 transition-all"
          >
            <option value="ALL">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-2.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/5 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late Arrival</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ABSENT">Absent</option>
            <option value="LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      {/* Daily Attendance Sheet */}
      <div className="bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">First In</th>
                <th className="py-3.5 px-4">Last Out</th>
                <th className="py-3.5 px-4">Logged Hours</th>
                <th className="py-3.5 px-4">Late Buffer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Punch Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400 text-sm">
                    No attendance logs found for selected parameters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const emp = employees.find((e) => e.id === rec.employeeId);
                  const shift = shifts.find((s) => s.id === rec.shiftId);

                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={emp?.avatar}
                            name={`${emp?.firstName} ${emp?.lastName}`}
                            size="sm"
                          />
                          <div>
                            <span className="font-semibold text-gray-950">
                              {emp?.firstName} {emp?.lastName}
                            </span>
                            <span className="text-xs text-gray-500 block">
                              {emp?.employeeCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-600">
                        {shift?.name || "General Shift"}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-semibold text-emerald-700">
                        {formatTime(rec.firstIn)}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-900">
                        {formatTime(rec.lastOut)}
                      </td>

                      <td className="py-3 px-4 font-bold text-gray-950 text-xs">
                        {rec.workingHours ? `${rec.workingHours} hrs` : "--"}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        {rec.lateMinutes > 0 ? (
                          <span className="font-semibold text-rose-600">
                            +{rec.lateMinutes} mins
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">On-time</span>
                        )}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(rec.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => setDetailRecord(rec)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Timeline
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

      {/* Punch Timeline Modal */}
      <Modal
        isOpen={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        title="Biometric & Web Punch Timeline"
        description={`Detailed biometric sensor events recorded on ${formatDate(detailRecord?.date)}.`}
      >
        {detailRecord && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-950">
                  {employees.find((e) => e.id === detailRecord.employeeId)?.firstName}{" "}
                  {employees.find((e) => e.id === detailRecord.employeeId)?.lastName}
                </p>
                <p className="text-[11px] text-gray-500">
                  Total Logged: {detailRecord.workingHours} hours
                </p>
              </div>
              {getStatusBadge(detailRecord.status)}
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                Raw Biometric Sensor Events
              </h5>

              {detailRecord.punches.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">
                  No sensor punches registered for this date.
                </p>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {detailRecord.punches.map((p) => (
                    <div key={p.id} className="flex items-start gap-4 relative pl-7 text-xs">
                      <div
                        className={`absolute left-2 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          p.type === "IN" ? "bg-emerald-500" : "bg-gray-900"
                        }`}
                      />
                      <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-950">
                            Punch {p.type} • {formatTime(p.time)}
                          </p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {p.location || "Biometric Terminal"}
                          </p>
                        </div>
                        <Badge variant="neutral" size="sm">
                          {p.source.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
