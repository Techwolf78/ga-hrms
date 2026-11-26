import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Coins,
  FileText,
  CalendarCheck2,
  Receipt,
  Download,
  Upload,
  Edit,
  CheckCircle2,
  Lock,
  EyeOff,
  AlertTriangle,
  Info,
  UserCheck,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Tabs, TabList, TabTrigger, TabContent } from "../../components/ui/Tabs";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { formatDate, formatINR, formatTime } from "../../lib/utils";
import { useToast } from "../../lib/toastContext";

export function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();

  const {
    employees,
    departments,
    designations,
    branches,
    shifts,
    attendance,
    leaveRequests,
    leaveTypes,
    salaryStructures,
    payroll,
    documents,
    auditLogs,
    updateEmployee,
    uploadDocument,
  } = useHrms();

  const employee = employees.find((e) => e.id === id || e.employeeCode === id) || employees[0];
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit form state
  const [editPhone, setEditPhone] = useState(employee?.phone || "");
  const [editEmail, setEditEmail] = useState(employee?.email || "");
  const [editCtc, setEditCtc] = useState(employee?.monthlyCtc || 100000);

  if (!employee) {
    return (
      <div className="py-12 text-center bg-white rounded-xl border border-[#DDE3EA]">
        <p className="text-sm text-[#697586]">Employee record not found.</p>
        <Button
          onClick={() => navigate("/people/employees")}
          className="mt-4 bg-[#1F8476] hover:bg-[#16665b] text-white"
        >
          Back to Directory
        </Button>
      </div>
    );
  }

  // Role and relationship permissions
  const viewerRole = user?.role || "EMPLOYEE";
  const isAdmin = viewerRole === "SUPER_ADMIN" || viewerRole === "HR_ADMIN";
  const isManager = viewerRole === "MANAGER";
  const isSelf =
    user?.employeeId === employee.id ||
    user?.employeeId === employee.employeeCode;

  // Check if viewer is manager of target employee
  const currentEmployee = employees.find(
    (e) => e.id === user?.employeeId || e.employeeCode === user?.employeeId
  );
  const isManagerOfTarget =
    isManager &&
    (employee.managerId === currentEmployee?.id ||
      employee.managerId === user?.employeeId ||
      (currentEmployee &&
        employee.departmentId === currentEmployee.departmentId &&
        !isSelf));

  // Access rights
  const canViewFinancials = isAdmin || isSelf;
  const canViewStatutoryIds = isAdmin || isSelf;
  const canViewPersonalDossier = isAdmin || isSelf || isManagerOfTarget;
  const canViewAttendanceLeaves = isAdmin || isSelf || isManagerOfTarget;
  const canViewDocuments = isAdmin || isSelf || isManagerOfTarget;
  const canViewActivity = isAdmin || isSelf || isManagerOfTarget;
  const canEdit = isAdmin || isSelf;

  const dept = departments.find((d) => d.id === employee.departmentId);
  const desig = designations.find((d) => d.id === employee.designationId);
  const branch = branches.find((b) => b.id === employee.branchId);
  const shift = shifts.find((s) => s.id === employee.shiftId);
  const manager = employees.find((e) => e.id === employee.managerId);
  const salary = salaryStructures.find((s) => s.employeeId === employee.id || s.employeeId === employee.employeeCode);

  // Employee-specific records
  const empAttendance = attendance.filter(
    (a) => a.employeeId === employee.id || a.employeeId === employee.employeeCode
  );
  const empLeaves = leaveRequests.filter(
    (l) => l.employeeId === employee.id || l.employeeId === employee.employeeCode
  );
  const empPayroll = payroll.filter(
    (p) => p.employeeId === employee.id || p.employeeId === employee.employeeCode
  );
  const empDocs = documents.filter(
    (d) => d.employeeId === employee.id || d.employeeId === employee.employeeCode
  );
  const empLogs = auditLogs.filter(
    (l) =>
      l.details.includes(employee.id) ||
      l.details.includes(employee.employeeCode) ||
      l.userId === employee.id
  );

  const handleSaveProfile = () => {
    updateEmployee(employee.id, {
      phone: editPhone,
      email: editEmail,
      ...(isAdmin ? { monthlyCtc: Number(editCtc), annualCtc: Number(editCtc) * 12 } : {}),
    });
    toastSuccess("Employee profile updated successfully.");
    setIsEditOpen(false);
  };

  // Helper for masking confidential identifiers
  const maskString = (str?: string, visibleChars = 4) => {
    if (!str) return "••••••••";
    if (str.length <= visibleChars) return "••••";
    return `•••• •••• ${str.slice(-visibleChars)}`;
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/people/employees")}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DDE3EA] text-xs font-semibold text-[#032D42] hover:border-[#1F8476]/40 hover:text-[#1F8476] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#1F8476]" />
          <span>Back to Employee Directory</span>
        </button>
      </div>

      {/* Privacy Guard Notice for Colleague View */}
      {!isSelf && !isAdmin && !isManagerOfTarget && (
        <div className="p-4 bg-[#FEF7E0]/70 border border-[#FEEFC3] rounded-3xl flex items-center gap-3 text-xs text-[#032D42]">
          <Lock className="w-4 h-4 text-[#E69F00] shrink-0" />
          <span>
            <strong>Colleague Directory Privacy Guard:</strong> Sensitive financial compensation, statutory ID proofs, personal home addresses, and leave histories are confidential and hidden in this view.
          </span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              {employee.avatar ? (
                <img
                  src={employee.avatar}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#DDE3EA] shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#1F8476]/10 text-[#1F8476] flex items-center justify-center font-bold text-2xl border-2 border-[#DDE3EA]">
                  {employee.firstName?.[0]}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  employee.status === "ACTIVE" ? "bg-[#62D84E]" : "bg-amber-400"
                }`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1B2430] tracking-tight">
                  {employee.firstName} {employee.lastName}
                </h1>
                <Badge
                  variant="neutral"
                  size="sm"
                  className="font-mono bg-gray-100 text-[#4B5D6B]"
                >
                  {employee.employeeCode}
                </Badge>
                <Badge
                  variant={employee.status === "ACTIVE" ? "success" : "warning"}
                  size="sm"
                  dot
                >
                  {employee.status}
                </Badge>
              </div>

              <p className="text-sm font-semibold text-[#1F8476]">
                {desig?.title || "Senior Staff Member"}
              </p>

              <div className="flex items-center gap-4 text-xs text-[#697586] flex-wrap pt-1">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#1F8476]" />
                  {dept?.name || "Engineering"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1F8476]" />
                  {branch?.city || "Pune HQ"} ({branch?.code || "PN-01"})
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1F8476]" />
                  Joined {formatDate(employee.joiningDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {canEdit && (
              <Button
                onClick={() => {
                  setEditPhone(employee.phone);
                  setEditEmail(employee.email);
                  setEditCtc(employee.monthlyCtc);
                  setIsEditOpen(true);
                }}
                variant="outline"
                size="sm"
                className="h-9 text-xs px-3.5 border-[#DDE3EA] hover:border-[#1F8476] font-semibold text-[#1B2430]"
                leftIcon={<Edit className="w-3.5 h-3.5 text-[#1F8476]" />}
              >
                {isAdmin ? "Edit HR Record" : "Edit My Contact"}
              </Button>
            )}

            {canViewFinancials && (
              <Button
                onClick={() => navigate(`/payroll/payslips?emp=${employee.id}`)}
                variant="primary"
                size="sm"
                className="h-9 text-xs px-3.5 bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
                leftIcon={<Receipt className="w-3.5 h-3.5" />}
              >
                {isSelf ? "My Payslips" : "View Payslips"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="overview">
        <TabList className="bg-white px-4 rounded-t-xl border border-b-0 border-[#DDE3EA]">
          <TabTrigger value="overview">Overview</TabTrigger>
          <TabTrigger value="employment">Employment</TabTrigger>

          {canViewPersonalDossier && <TabTrigger value="personal">Personal</TabTrigger>}

          {canViewAttendanceLeaves && (
            <TabTrigger value="attendance" badge={empAttendance.length}>
              Attendance
            </TabTrigger>
          )}

          {canViewAttendanceLeaves && (
            <TabTrigger value="leave" badge={empLeaves.length}>
              Leave
            </TabTrigger>
          )}

          {canViewFinancials && <TabTrigger value="payroll">Payroll</TabTrigger>}

          {canViewDocuments && (
            <TabTrigger value="documents" badge={empDocs.length}>
              Documents
            </TabTrigger>
          )}

          {canViewActivity && <TabTrigger value="activity">Activity</TabTrigger>}
        </TabList>

        <div className="bg-white rounded-b-xl border border-[#DDE3EA] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          {/* TAB 1: OVERVIEW */}
          <TabContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Contact card */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3">
                    Contact & Communication
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[#697586]">Corporate Email:</span>
                      <p className="font-semibold text-[#1B2430] mt-0.5">{employee.email}</p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Mobile Number:</span>
                      <p className="font-semibold text-[#1B2430] mt-0.5">
                        {canViewPersonalDossier ? employee.phone : `+91 ••••• ••${employee.phone.slice(-3)}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Reporting Manager:</span>
                      <p className="font-semibold text-[#1B2430] mt-0.5">
                        {manager ? `${manager.firstName} ${manager.lastName}` : "Executive Board"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Assigned Shift:</span>
                      <p className="font-semibold text-[#1B2430] mt-0.5">
                        {shift?.name} ({shift?.startTime} - {shift?.endTime})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statutory IDs (Protected) */}
                <div className="pt-4 border-t border-[#DDE3EA]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3 flex items-center justify-between">
                    <span>Statutory Identification</span>
                    {!canViewStatutoryIds && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-1 font-semibold">
                        <Lock className="w-2.5 h-2.5" /> Confidential
                      </span>
                    )}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Income Tax PAN:</span>
                      <span className="font-mono font-semibold text-[#1B2430]">
                        {canViewStatutoryIds ? employee.pan : "••••••412E"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Aadhaar Card:</span>
                      <span className="font-mono font-semibold text-[#1B2430]">
                        {canViewStatutoryIds ? employee.aadhaar : maskString(employee.aadhaar, 4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">EPFO UAN:</span>
                      <span className="font-mono font-semibold text-[#1B2430]">
                        {canViewStatutoryIds ? employee.uan : "••••••••8912"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Attendance & Leave Overview (or Role Overview for Colleague) */}
              <div className="space-y-6">
                {canViewAttendanceLeaves ? (
                  <>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3">
                        Attendance This Month
                      </h4>
                      <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[#697586]">Present Days:</span>
                          <span className="font-bold text-emerald-600">
                            {empAttendance.filter((a) => a.status === "PRESENT").length || 21} Days
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#697586]">Late Arrivals:</span>
                          <span className="font-bold text-amber-600">
                            {empAttendance.filter((a) => a.status === "LATE").length || 1}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#697586]">Approved Leaves:</span>
                          <span className="font-bold text-[#1F8476]">
                            {empAttendance.filter((a) => a.status === "LEAVE").length || 1} Days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3">
                        Leave Balances
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-3 bg-[#1F8476]/5 rounded-xl border border-[#1F8476]/20">
                          <span className="text-[11px] text-[#1F8476] font-semibold">Casual Leave</span>
                          <p className="text-lg font-bold text-[#1F8476] mt-1">9.0 / 12</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                          <span className="text-[11px] text-emerald-800 font-semibold">Sick Leave</span>
                          <p className="text-lg font-bold text-emerald-700 mt-1">11.0 / 12</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3">
                      Professional Competencies
                    </h4>
                    <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] space-y-3 text-xs">
                      <p className="text-[#4B5D6B] leading-relaxed">
                        Member of the {dept?.name || "Engineering"} organization at {branch?.name || "Pune HQ"}.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#DDE3EA] text-[11px] font-medium text-[#1B2430]">
                          React / TypeScript
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#DDE3EA] text-[11px] font-medium text-[#1B2430]">
                          Cloud Architecture
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#DDE3EA] text-[11px] font-medium text-[#1B2430]">
                          System Reliability
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 3: Payroll Summary (Protected) or Role Highlights */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3 flex items-center justify-between">
                    <span>Salary & Compensation</span>
                    {!canViewFinancials && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-1 font-semibold">
                        <Lock className="w-2.5 h-2.5" /> Confidential
                      </span>
                    )}
                  </h4>

                  {canViewFinancials ? (
                    <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] space-y-3">
                      <div>
                        <span className="text-[11px] text-[#697586] font-medium">Monthly CTC</span>
                        <p className="text-xl font-bold text-[#1B2430]">
                          {formatINR(employee.monthlyCtc)}
                        </p>
                      </div>
                      <div className="flex justify-between text-xs pt-2 border-t border-[#DDE3EA]">
                        <span className="text-[#697586]">Annual CTC:</span>
                        <span className="font-semibold text-[#1B2430]">
                          {formatINR(employee.annualCtc)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#697586]">Disbursement Bank:</span>
                        <span className="font-semibold text-[#1B2430]">{employee.bankName}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#697586]">Account Number:</span>
                        <span className="font-mono text-[#1B2430]">{employee.accountNumber}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] text-center space-y-2">
                      <Lock className="w-8 h-8 text-[#697586]/40 mx-auto" />
                      <p className="text-xs font-bold text-[#1B2430]">Financial Record Confidential</p>
                      <p className="text-[11px] text-[#697586]">
                        Compensation details are strictly restricted to the employee and authorized HR officers.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-2">
                    Key Milestones
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-[#F7F9FB] rounded-lg border border-[#DDE3EA] flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-[#1B2430]">Onboarding Dossier Verified</p>
                        <p className="text-[11px] text-[#697586]">Compliance check completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabContent>

          {/* TAB 2: EMPLOYMENT */}
          <TabContent value="employment">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-[#697586]">Employee Code</span>
                <p className="text-sm font-semibold text-[#1B2430] mt-1 font-mono">{employee.employeeCode}</p>
              </div>
              <div>
                <span className="text-[#697586]">Joining Date</span>
                <p className="text-sm font-semibold text-[#1B2430] mt-1">{formatDate(employee.joiningDate)}</p>
              </div>
              <div>
                <span className="text-[#697586]">Department</span>
                <p className="text-sm font-semibold text-[#1B2430] mt-1">{dept?.name}</p>
              </div>
              <div>
                <span className="text-[#697586]">Designation</span>
                <p className="text-sm font-semibold text-[#1B2430] mt-1">{desig?.title}</p>
              </div>
              <div>
                <span className="text-[#697586]">Employment Type</span>
                <p className="text-sm font-semibold text-[#1B2430] mt-1">{employee.employmentType}</p>
              </div>
              <div>
                <span className="text-[#697586]">Branch Office</span>
                <p className="text-sm font-semibold text-[#1B2430] mt-1">{branch?.name}</p>
              </div>
            </div>
          </TabContent>

          {/* TAB 3: PERSONAL (Protected) */}
          {canViewPersonalDossier && (
            <TabContent value="personal">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3">
                    Basic Personal Dossier
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[#697586]">Full Name</span>
                      <p className="text-sm font-semibold text-[#1B2430] mt-1">
                        {employee.firstName} {employee.middleName ? `${employee.middleName} ` : ""}{employee.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Gender</span>
                      <p className="text-sm font-semibold text-[#1B2430] mt-1">{employee.gender}</p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Date of Birth</span>
                      <p className="text-sm font-semibold text-[#1B2430] mt-1">{formatDate(employee.dob)}</p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Blood Group</span>
                      <p className="text-sm font-semibold text-[#1B2430] mt-1">{employee.bloodGroup || "O+"}</p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Personal Email</span>
                      <p className="text-sm font-semibold text-[#1B2430] mt-1">{employee.personalEmail || employee.email}</p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Contact Phone</span>
                      <p className="text-sm font-semibold text-[#1B2430] mt-1">{employee.phone}</p>
                    </div>
                    <div>
                      <span className="text-[#697586]">Emergency Contact</span>
                      <p className="text-sm font-semibold text-[#1B2430] mt-1">
                        {employee.emergencyContactName ? `${employee.emergencyContactName} (${employee.emergencyContactRelation || "Family"})` : employee.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Residential Addresses */}
                <div className="pt-4 border-t border-[#DDE3EA]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3">
                    Residential Addresses
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA]">
                      <span className="font-bold text-[#1B2430] block mb-1">Present Residential Address</span>
                      <p className="text-[#4B5D6B]">{employee.presentAddress || "Flat 402, Green Meadows, Baner Road"}</p>
                      <p className="text-[#697586] text-[11px] mt-0.5">
                        {employee.presentCity || "Pune"}, {employee.presentState || "Maharashtra"} - {employee.presentPincode || "411045"}
                      </p>
                    </div>
                    <div className="p-3.5 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA]">
                      <span className="font-bold text-[#1B2430] block mb-1">Permanent Hometown Address</span>
                      <p className="text-[#4B5D6B]">{employee.permanentAddress || employee.presentAddress || "Flat 402, Green Meadows, Baner Road"}</p>
                      <p className="text-[#697586] text-[11px] mt-0.5">
                        {employee.permanentCity || employee.presentCity || "Pune"}, {employee.permanentState || employee.presentState || "Maharashtra"} - {employee.permanentPincode || employee.presentPincode || "411045"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Educational Qualifications */}
                {employee.educationDetails && employee.educationDetails.length > 0 && (
                  <div className="pt-4 border-t border-[#DDE3EA]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#697586] mb-3">
                      Educational Qualifications
                    </h4>
                    <div className="border border-[#DDE3EA] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[#697586] font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Qualification</th>
                            <th className="py-2.5 px-3">Institute / University</th>
                            <th className="py-2.5 px-3">Specialization</th>
                            <th className="py-2.5 px-3">Year</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DDE3EA]">
                          {employee.educationDetails.map((edu) => (
                            <tr key={edu.id} className="hover:bg-[#F7F9FB]/60">
                              <td className="py-2 px-3 font-semibold text-[#1B2430]">{edu.educationClass}</td>
                              <td className="py-2 px-3 text-[#4B5D6B]">{edu.schoolUniversity}</td>
                              <td className="py-2 px-3 text-[#697586]">{edu.boardStudyField}</td>
                              <td className="py-2 px-3 text-[#697586]">{edu.year}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </TabContent>
          )}

          {/* TAB 4: ATTENDANCE */}
          {canViewAttendanceLeaves && (
            <TabContent value="attendance">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#1B2430]">Attendance Logs</h4>
                <div className="overflow-x-auto border border-[#DDE3EA] rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] font-semibold text-[#697586]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">First In</th>
                        <th className="py-2.5 px-3">Last Out</th>
                        <th className="py-2.5 px-3">Hours Logged</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE3EA]">
                      {empAttendance.map((a) => (
                        <tr key={a.id} className="hover:bg-[#F7F9FB]/60">
                          <td className="py-2.5 px-3 font-medium text-[#1B2430]">{formatDate(a.date)}</td>
                          <td className="py-2.5 px-3">{formatTime(a.firstIn)}</td>
                          <td className="py-2.5 px-3">{formatTime(a.lastOut)}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#1B2430]">{a.workingHours} hrs</td>
                          <td className="py-2.5 px-3">
                            <Badge
                              variant={a.status === "PRESENT" ? "success" : a.status === "LATE" ? "warning" : "neutral"}
                              size="sm"
                            >
                              {a.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabContent>
          )}

          {/* TAB 5: LEAVE */}
          {canViewAttendanceLeaves && (
            <TabContent value="leave">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#1B2430]">Leave Applications</h4>
                {empLeaves.length === 0 ? (
                  <p className="text-xs text-[#697586]">No leave requests recorded for this employee.</p>
                ) : (
                  <div className="divide-y divide-[#DDE3EA] border border-[#DDE3EA] rounded-xl p-3 bg-[#F7F9FB]/40">
                    {empLeaves.map((l) => {
                      const lt = leaveTypes.find((t) => t.id === l.leaveTypeId);
                      return (
                        <div key={l.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-[#1B2430]">
                              {lt?.name} ({l.days} Days)
                            </p>
                            <p className="text-[#697586] mt-0.5">
                              {formatDate(l.fromDate)} to {formatDate(l.toDate)} • {l.reason}
                            </p>
                          </div>
                          <Badge variant={l.status === "APPROVED" ? "success" : "warning"} size="sm">
                            {l.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabContent>
          )}

          {/* TAB 6: PAYROLL (Restricted to Self & Admin) */}
          {canViewFinancials && (
            <TabContent value="payroll">
              <div className="space-y-6">
                <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#697586] font-medium">Monthly Compensation Structure</span>
                    <p className="text-2xl font-bold text-[#1B2430] mt-0.5">
                      {formatINR(employee.monthlyCtc)} / month
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/payroll/payslips?emp=${employee.id}`)}
                    variant="primary"
                    size="sm"
                    className="bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
                  >
                    View All Payslips
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Earnings */}
                  <div className="p-4 border border-[#DDE3EA] rounded-xl space-y-2.5 bg-white">
                    <h5 className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">
                      Earnings Breakdown
                    </h5>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Basic Salary (50%):</span>
                      <span className="font-semibold text-[#1B2430]">
                        {formatINR(salary?.basic || employee.monthlyCtc * 0.5)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">House Rent Allowance (HRA):</span>
                      <span className="font-semibold text-[#1B2430]">
                        {formatINR(salary?.hra || employee.monthlyCtc * 0.25)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Special Allowance:</span>
                      <span className="font-semibold text-[#1B2430]">
                        {formatINR(salary?.specialAllowance || employee.monthlyCtc * 0.25)}
                      </span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="p-4 border border-[#DDE3EA] rounded-xl space-y-2.5 bg-white">
                    <h5 className="font-bold text-rose-700 uppercase tracking-wider text-[11px]">
                      Statutory Deductions
                    </h5>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Employee PF (12%):</span>
                      <span className="font-semibold text-rose-600">
                        {formatINR(salary?.pfEmployee || 3000)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Professional Tax (PT):</span>
                      <span className="font-semibold text-rose-600">
                        {formatINR(salary?.professionalTax || 200)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#697586]">Estimated Monthly TDS:</span>
                      <span className="font-semibold text-rose-600">
                        {formatINR(salary?.tdsMonthly || 8500)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabContent>
          )}

          {/* TAB 7: DOCUMENTS */}
          {canViewDocuments && (
            <TabContent value="documents">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1B2430]">Employee Document Vault</h4>
                  <Button
                    onClick={() => {
                      uploadDocument({
                        employeeId: employee.id,
                        title: "Statutory Verification Copy",
                        category: "IDENTITY",
                        fileSize: "640 KB",
                        fileType: "PDF",
                      });
                      toastSuccess("Document deposited to vault.");
                    }}
                    variant="outline"
                    size="sm"
                    className="border-[#DDE3EA] hover:border-[#1F8476] text-xs font-semibold"
                    leftIcon={<Upload className="w-3.5 h-3.5 text-[#1F8476]" />}
                  >
                    Upload Document
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {empDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#1F8476]" />
                        <div>
                          <p className="text-xs font-semibold text-[#1B2430]">{doc.title}</p>
                          <p className="text-[10px] text-[#697586]">
                            {doc.category} • {doc.fileSize} • {formatDate(doc.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-[#1F8476] hover:bg-[#1F8476]/10"
                        onClick={() => toastSuccess(`Downloaded: ${doc.title}`)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabContent>
          )}

          {/* TAB 8: ACTIVITY */}
          {canViewActivity && (
            <TabContent value="activity">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1B2430]">
                  Audit Trail for {employee.firstName}
                </h4>
                {empLogs.length === 0 ? (
                  <p className="text-xs text-[#697586]">No specific audit logs recorded.</p>
                ) : (
                  empLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-[#F7F9FB] rounded-lg border border-[#DDE3EA] text-xs flex justify-between"
                    >
                      <div>
                        <span className="font-semibold text-[#1B2430]">{log.action}</span>
                        <p className="text-[#4B5D6B] mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-[11px] text-[#697586] shrink-0">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TabContent>
          )}
        </div>
      </Tabs>

      {/* Edit Profile Modal */}
      {canEdit && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Profile — ${employee.firstName} ${employee.lastName}`}
          description={
            isAdmin
              ? "Update master employee contact and CTC parameters."
              : "Update your personal communication contacts."
          }
        >
          <div className="space-y-4">
            <Input
              label="Work Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              disabled={!isAdmin}
            />
            <Input
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
            {isAdmin && (
              <Input
                label="Monthly CTC (INR)"
                type="number"
                value={editCtc}
                onChange={(e) => setEditCtc(Number(e.target.value))}
              />
            )}
            <div className="pt-4 flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}