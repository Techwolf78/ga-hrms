import { AttendanceRecord, AttendanceStatus, PunchLog } from "../types/hrms";

/**
 * November 2026 (30 Days) Attendance Template
 * November 1, 2026 is a Sunday.
 * Holidays:
 * - 2026-11-08 (Sun): Diwali (Deepavali Laxmi Pujan)
 * - 2026-11-09 (Mon): Diwali (Balipratipada)
 * - 2026-11-24 (Tue): Guru Nanak Jayanti
 * Saturdays & Sundays: Weekly Offs (Nov 1, 7, 8, 14, 15, 21, 22, 28, 29)
 * Today is November 20, 2026 (Friday)
 */

interface DaySchedule {
  day: number; // 1 to 30
  date: string; // "2026-11-01"
  dayOfWeek: string;
  status: AttendanceStatus;
  firstIn: string | null;
  lastOut: string | null;
  workingHours: number;
  lateMinutes: number;
  inSource?: PunchLog["source"];
  inLocation?: string;
  outSource?: PunchLog["source"];
  outLocation?: string;
  regularizationId?: string;
}

const NOVEMBER_2026_DAYS: DaySchedule[] = [
  {
    day: 1,
    date: "2026-11-01",
    dayOfWeek: "Sunday",
    status: "WEEK_OFF",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 2,
    date: "2026-11-02",
    dayOfWeek: "Monday",
    status: "PRESENT",
    firstIn: "09:15",
    lastOut: "18:30",
    workingHours: 9.25,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 3,
    date: "2026-11-03",
    dayOfWeek: "Tuesday",
    status: "PRESENT",
    firstIn: "09:20",
    lastOut: "18:40",
    workingHours: 9.33,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Check-In",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 4,
    date: "2026-11-04",
    dayOfWeek: "Wednesday",
    status: "PRESENT",
    firstIn: "09:12",
    lastOut: "18:25",
    workingHours: 9.22,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "BIOMETRIC_DEVICE",
    outLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
  },
  {
    day: 5,
    date: "2026-11-05",
    dayOfWeek: "Thursday",
    status: "PRESENT",
    firstIn: "09:25",
    lastOut: "18:35",
    workingHours: 9.17,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Check-In",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 6,
    date: "2026-11-06",
    dayOfWeek: "Friday",
    status: "LATE",
    firstIn: "10:15",
    lastOut: "18:45",
    workingHours: 8.5,
    lateMinutes: 30, // 30 mins after 09:45 grace
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
    regularizationId: "reg-001",
  },
  {
    day: 7,
    date: "2026-11-07",
    dayOfWeek: "Saturday",
    status: "WEEK_OFF",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 8,
    date: "2026-11-08",
    dayOfWeek: "Sunday",
    status: "HOLIDAY",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 9,
    date: "2026-11-09",
    dayOfWeek: "Monday",
    status: "HOLIDAY",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 10,
    date: "2026-11-10",
    dayOfWeek: "Tuesday",
    status: "PRESENT",
    firstIn: "09:18",
    lastOut: "18:30",
    workingHours: 9.2,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Check-In",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 11,
    date: "2026-11-11",
    dayOfWeek: "Wednesday",
    status: "PRESENT",
    firstIn: "09:22",
    lastOut: "18:45",
    workingHours: 9.38,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 12,
    date: "2026-11-12",
    dayOfWeek: "Thursday",
    status: "PRESENT",
    firstIn: "09:15",
    lastOut: "18:30",
    workingHours: 9.25,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Check-In",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 13,
    date: "2026-11-13",
    dayOfWeek: "Friday",
    status: "HALF_DAY",
    firstIn: "09:15",
    lastOut: "14:00",
    workingHours: 4.75,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 14,
    date: "2026-11-14",
    dayOfWeek: "Saturday",
    status: "WEEK_OFF",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 15,
    date: "2026-11-15",
    dayOfWeek: "Sunday",
    status: "WEEK_OFF",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 16,
    date: "2026-11-16",
    dayOfWeek: "Monday",
    status: "PRESENT",
    firstIn: "09:20",
    lastOut: "18:40",
    workingHours: 9.33,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 17,
    date: "2026-11-17",
    dayOfWeek: "Tuesday",
    status: "PRESENT",
    firstIn: "09:14",
    lastOut: "18:28",
    workingHours: 9.23,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Check-In",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 18,
    date: "2026-11-18",
    dayOfWeek: "Wednesday",
    status: "PRESENT",
    firstIn: "09:25",
    lastOut: "18:35",
    workingHours: 9.17,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 19,
    date: "2026-11-19",
    dayOfWeek: "Thursday",
    status: "PRESENT",
    firstIn: "09:12",
    lastOut: "18:25",
    workingHours: 9.22,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Check-In",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 20,
    date: "2026-11-20",
    dayOfWeek: "Friday",
    status: "PRESENT",
    firstIn: "09:18",
    lastOut: null, // Currently in progress today
    workingHours: 8.2,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Self Punch",
  },
  {
    day: 21,
    date: "2026-11-21",
    dayOfWeek: "Saturday",
    status: "WEEK_OFF",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 22,
    date: "2026-11-22",
    dayOfWeek: "Sunday",
    status: "WEEK_OFF",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 23,
    date: "2026-11-23",
    dayOfWeek: "Monday",
    status: "PRESENT",
    firstIn: "09:15",
    lastOut: "18:30",
    workingHours: 9.25,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 24,
    date: "2026-11-24",
    dayOfWeek: "Tuesday",
    status: "HOLIDAY",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 25,
    date: "2026-11-25",
    dayOfWeek: "Wednesday",
    status: "PRESENT",
    firstIn: "09:20",
    lastOut: "18:35",
    workingHours: 9.25,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Check-In",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 26,
    date: "2026-11-26",
    dayOfWeek: "Thursday",
    status: "PRESENT",
    firstIn: "09:15",
    lastOut: "18:30",
    workingHours: 9.25,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 27,
    date: "2026-11-27",
    dayOfWeek: "Friday",
    status: "PRESENT",
    firstIn: "09:22",
    lastOut: "18:40",
    workingHours: 9.3,
    lateMinutes: 0,
    inSource: "WEB",
    inLocation: "Web Portal Check-In",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
  {
    day: 28,
    date: "2026-11-28",
    dayOfWeek: "Saturday",
    status: "WEEK_OFF",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 29,
    date: "2026-11-29",
    dayOfWeek: "Sunday",
    status: "WEEK_OFF",
    firstIn: null,
    lastOut: null,
    workingHours: 0,
    lateMinutes: 0,
  },
  {
    day: 30,
    date: "2026-11-30",
    dayOfWeek: "Monday",
    status: "PRESENT",
    firstIn: "09:18",
    lastOut: "18:30",
    workingHours: 9.2,
    lateMinutes: 0,
    inSource: "BIOMETRIC_DEVICE",
    inLocation: "Pune Hinjawadi Gate 1 (eSSL Device)",
    outSource: "WEB",
    outLocation: "Web Portal Punch-Out",
  },
];

/**
 * Generates 30 full days of attendance records for November 2026 for a given employee.
 * Optionally integrates any live existing records (e.g. today's live punches on 2026-11-20).
 */
export function generate30DaysEmployeeAttendance(
  employeeId: string,
  shiftId: string = "shift-gen",
  existingRecords: AttendanceRecord[] = []
): AttendanceRecord[] {
  const existingMap = new Map<string, AttendanceRecord>();
  for (const rec of existingRecords) {
    if (rec.employeeId === employeeId) {
      existingMap.set(rec.date, rec);
    }
  }

  return NOVEMBER_2026_DAYS.map((dayPlan) => {
    // If there is an existing live record for today (2026-11-20) or this date, use it
    if (existingMap.has(dayPlan.date)) {
      return existingMap.get(dayPlan.date)!;
    }

    const punches: PunchLog[] = [];
    if (dayPlan.firstIn) {
      punches.push({
        id: `p-${employeeId}-${dayPlan.day}-in`,
        time: dayPlan.firstIn,
        type: "IN",
        source: dayPlan.inSource || "BIOMETRIC_DEVICE",
        location: dayPlan.inLocation || "Pune Hinjawadi Gate 1 (eSSL Device)",
      });
    }

    if (dayPlan.lastOut) {
      punches.push({
        id: `p-${employeeId}-${dayPlan.day}-out`,
        time: dayPlan.lastOut,
        type: "OUT",
        source: dayPlan.outSource || "WEB",
        location: dayPlan.outLocation || "Web Portal Punch-Out",
      });
    }

    return {
      id: `att-${dayPlan.date}-${employeeId}`,
      employeeId,
      date: dayPlan.date,
      shiftId,
      firstIn: dayPlan.firstIn,
      lastOut: dayPlan.lastOut,
      workingHours: dayPlan.workingHours,
      lateMinutes: dayPlan.lateMinutes,
      status: dayPlan.status,
      punches,
      regularizationId: dayPlan.regularizationId,
    };
  });
}

// Backward compatibility alias
export const generate31DaysEmployeeAttendance = generate30DaysEmployeeAttendance;
