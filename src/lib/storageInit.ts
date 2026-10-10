import { storage, STORAGE_KEYS } from "./storage";
import {
  initialCompany,
  initialBranches,
  initialDepartments,
  initialDesignations,
  initialShifts,
  initialLeaveTypes,
  initialHolidays,
  initialEmployees,
  initialSalaryStructures,
  initialAttendanceRecords,
  initialRegularizations,
  initialLeaveRequests,
  initialPayrollRecords,
  initialPayslips,
  initialDocuments,
  initialNotifications,
  initialAuditLogs,
  initialSettings,
  initialJobs,
  initialCandidates,
  initialAssets,
  initialGoals,
  initialAppraisals,
} from "./seedData";
import { CurrentUser } from "../types/hrms";

export const DEFAULT_USER: CurrentUser = {
  id: "EMP-1001",
  name: "Ajay Pawar",
  email: "ajay.pawar@ga-hrms.io",
  role: "SUPER_ADMIN",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  employeeId: "EMP-1001",
  designation: "Vice President of Engineering",
  department: "Engineering & Cloud Platforms",
};

export function initializeHrmsStorage(forceReset = false) {
  const isInitialized = storage.get<boolean>(STORAGE_KEYS.INITIALIZED, false);

  if (!isInitialized || forceReset) {
    storage.set(STORAGE_KEYS.COMPANY, initialCompany);
    storage.set(STORAGE_KEYS.USER, DEFAULT_USER);
    storage.set(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    storage.set(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    storage.set(STORAGE_KEYS.DESIGNATIONS, initialDesignations);
    storage.set(STORAGE_KEYS.BRANCHES, initialBranches);
    storage.set(STORAGE_KEYS.ATTENDANCE, initialAttendanceRecords);
    storage.set(STORAGE_KEYS.REGULARIZATIONS, initialRegularizations);
    storage.set(STORAGE_KEYS.LEAVE_TYPES, initialLeaveTypes);
    storage.set(STORAGE_KEYS.LEAVE_REQUESTS, initialLeaveRequests);
    storage.set(STORAGE_KEYS.HOLIDAYS, initialHolidays);
    storage.set(STORAGE_KEYS.SHIFTS, initialShifts);
    storage.set(STORAGE_KEYS.SALARY_STRUCTURES, initialSalaryStructures);
    storage.set(STORAGE_KEYS.PAYROLL, initialPayrollRecords);
    storage.set(STORAGE_KEYS.PAYSLIPS, initialPayslips);
    storage.set(STORAGE_KEYS.DOCUMENTS, initialDocuments);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    storage.set(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    storage.set(STORAGE_KEYS.SETTINGS, initialSettings);
    storage.set(STORAGE_KEYS.JOBS, initialJobs);
    storage.set(STORAGE_KEYS.CANDIDATES, initialCandidates);
    storage.set(STORAGE_KEYS.ASSETS, initialAssets);
    storage.set(STORAGE_KEYS.GOALS, initialGoals);
    storage.set(STORAGE_KEYS.APPRAISALS, initialAppraisals);
    storage.set(STORAGE_KEYS.INITIALIZED, true);
    console.log("✅ GA-HRMS LocalStorage successfully initialized with enterprise demo dataset.");
  } else {
    // Migration guard: ensure new modules exist if user already had previous storage
    if (!storage.get(STORAGE_KEYS.JOBS, null)) storage.set(STORAGE_KEYS.JOBS, initialJobs);
    if (!storage.get(STORAGE_KEYS.CANDIDATES, null)) storage.set(STORAGE_KEYS.CANDIDATES, initialCandidates);
    if (!storage.get(STORAGE_KEYS.ASSETS, null)) storage.set(STORAGE_KEYS.ASSETS, initialAssets);
    if (!storage.get(STORAGE_KEYS.GOALS, null)) storage.set(STORAGE_KEYS.GOALS, initialGoals);
    if (!storage.get(STORAGE_KEYS.APPRAISALS, null)) storage.set(STORAGE_KEYS.APPRAISALS, initialAppraisals);
  }
}
