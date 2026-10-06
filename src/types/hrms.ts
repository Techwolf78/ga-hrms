export type UserRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  employeeId?: string;
  designation?: string;
  department?: string;
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  cin: string;
  gstin: string;
  pan: string;
  logo: string;
  website: string;
  phone: string;
  email: string;
  headquarters: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  headCount: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headEmployeeId: string;
  headName: string;
  budget: number;
  openPositions: number;
  description: string;
}

export interface Designation {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  level: string;
  minCtc: number;
  maxCtc: number;
}

export type EmploymentStatus = 'ACTIVE' | 'PROBATION' | 'NOTICE_PERIOD' | 'RESIGNED' | 'TERMINATED';
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'INTERN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  dob: string;
  avatar: string;
  
  // Employment
  departmentId: string;
  designationId: string;
  branchId: string;
  managerId?: string;
  joiningDate: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  shiftId: string;
  
  // Statutory (Indian Compliance)
  pan: string;
  aadhaar: string;
  uan: string;
  esicNumber: string;
  
  // Banking
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  
  // Compensation summary
  monthlyCtc: number;
  annualCtc: number;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'WEEK_OFF';

export interface PunchLog {
  id: string;
  time: string;
  type: 'IN' | 'OUT';
  source: 'WEB' | 'BIOMETRIC_DEVICE' | 'MOBILE_GPS';
  location?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  firstIn: string | null; // HH:mm
  lastOut: string | null; // HH:mm
  workingHours: number; // in hours, e.g. 8.5
  lateMinutes: number;
  status: AttendanceStatus;
  punches: PunchLog[];
  regularizationId?: string;
}

export interface AttendanceRegularization {
  id: string;
  employeeId: string;
  date: string;
  missingPunchType: 'IN' | 'OUT' | 'BOTH';
  requestedTime: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  appliedDate: string;
  comments?: string;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string; // "09:30"
  endTime: string;   // "18:30"
  graceMinutes: number; // e.g. 15
  halfDayThresholdHours: number; // e.g. 4.5
  workDays: string[]; // ["Monday", "Tuesday", ...]
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  annualQuota: number;
  monthlyAccrual: number;
  carryForwardMax: number;
  isEncashable: boolean;
  isPaid: boolean;
  color: string;
  description: string;
}

export interface LeaveBalance {
  leaveTypeId: string;
  allocated: number;
  used: number;
  pending: number;
  available: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  days: number;
  isHalfDay: boolean;
  halfDaySession?: 'MORNING' | 'AFTERNOON';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
  isOptional: boolean;
  applicableBranchIds: string[];
}

export interface SalaryStructure {
  employeeId: string;
  monthlyCtc: number;
  annualCtc: number;
  // Earnings
  basic: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  medicalAllowance: number;
  bonus: number;
  // Deductions
  pfEmployee: number; // 12% of basic
  esicEmployee: number; // 0.75% of gross (if <= 21,000)
  professionalTax: number; // INR 200 state slab
  tdsMonthly: number;
  otherDeductions: number;
}

export interface PayrollRecord {
  id: string;
  month: string; // "2026-10"
  monthName: string; // "October 2026"
  employeeId: string;
  workingDaysInMonth: number;
  presentDays: number;
  paidLeaveDays: number;
  lopDays: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  pfDeduction: number;
  esicDeduction: number;
  ptDeduction: number;
  tdsDeduction: number;
  lopDeduction: number;
  status: 'DRAFT' | 'PROCESSED' | 'LOCKED';
  processedDate?: string;
  paymentMode: 'BANK_TRANSFER' | 'CHEQUE';
  transactionRef?: string;
}

export interface Payslip {
  id: string;
  payrollRecordId: string;
  employeeId: string;
  month: string;
  year: number;
  issueDate: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  title: string;
  category: 'IDENTITY' | 'ACADEMIC' | 'EXPERIENCE' | 'PAYROLL' | 'COMPANY_POLICY';
  fileSize: string;
  uploadDate: string;
  fileType: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'leave' | 'attendance' | 'payroll' | 'employee' | 'system';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'SETTINGS' | 'SYSTEM' | 'DEPARTMENT';
  recordId?: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface CompanySettings {
  companyName: string;
  legalEntityName: string;
  cin: string;
  gstin: string;
  pan: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  workingDaysPerWeek: number;
  dailyStandardHours: number;
  gracePeriodMinutes: number;
  payrollCycleDay: number;
  epfEnabled: boolean;
  esicEnabled: boolean;
  ptEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
}
