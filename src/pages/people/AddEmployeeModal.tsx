import React, { useState } from "react";
import {
  User,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Coins,
  FileCheck2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { useHrms } from "../../lib/hrmsContext";
import { EmploymentStatus, EmploymentType, Gender } from "../../types/hrms";
import { formatINR } from "../../lib/utils";

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const { departments, designations, branches, employees, shifts, addEmployee, uploadDocument } = useHrms();
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [dob, setDob] = useState("1996-05-15");

  // Employment
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || "dept-eng");
  const [designationId, setDesignationId] = useState(designations[0]?.id || "desig-sr-sde");
  const [branchId, setBranchId] = useState(branches[0]?.id || "branch-pune");
  const [managerId, setManagerId] = useState(employees[0]?.id || "EMP-1001");
  const [joiningDate, setJoiningDate] = useState("2026-10-06");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULL_TIME");
  const [shiftId, setShiftId] = useState(shifts[0]?.id || "shift-gen");

  // Statutory
  const [pan, setPan] = useState("ABCDE1234F");
  const [aadhaar, setAadhaar] = useState("4512 7890 2345");
  const [uan, setUan] = useState("100912457899");
  const [esicNumber, setEsicNumber] = useState("3100456799");

  // Banking
  const [bankName, setBankName] = useState("HDFC Bank Ltd.");
  const [accountNumber, setAccountNumber] = useState("50100456789123");
  const [ifscCode, setIfscCode] = useState("HDFC0000052");
  const [accountHolderName, setAccountHolderName] = useState("");

  // Salary
  const [monthlyCtc, setMonthlyCtc] = useState(125000);

  // Documents
  const [uploadedDocName, setUploadedDocName] = useState("Offer_Letter_Signed.pdf");

  const resetForm = () => {
    setCurrentStep(1);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
  };

  const handleFinish = () => {
    if (!firstName || !lastName || !email) {
      alert("Please fill in basic personal information.");
      setCurrentStep(1);
      return;
    }

    const newEmp = addEmployee({
      employeeCode: "", // generated
      firstName,
      lastName,
      email,
      phone: phone || "+91 98200 00000",
      gender,
      dob,
      avatar:
        gender === "FEMALE"
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      departmentId,
      designationId,
      branchId,
      managerId,
      joiningDate,
      employmentType,
      status: "ACTIVE" as EmploymentStatus,
      shiftId,
      pan,
      aadhaar,
      uan,
      esicNumber,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName: accountHolderName || `${firstName} ${lastName}`,
      monthlyCtc: Number(monthlyCtc),
      annualCtc: Number(monthlyCtc) * 12,
    });

    if (uploadedDocName) {
      uploadDocument({
        employeeId: newEmp.id,
        title: "Signed Appointment & Offer Letter",
        category: "COMPANY_POLICY",
        fileSize: "1.4 MB",
        fileType: "PDF",
      });
    }

    resetForm();
    onClose();
  };

  const steps = [
    { num: 1, title: "Personal", icon: User },
    { num: 2, title: "Employment", icon: Briefcase },
    { num: 3, title: "Statutory", icon: ShieldCheck },
    { num: 4, title: "Banking", icon: CreditCard },
    { num: 5, title: "Salary", icon: Coins },
    { num: 6, title: "Finish", icon: FileCheck2 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Employee Onboarding Wizard"
      description="Enter employee details across statutory, banking, and compensation modules."
    >
      {/* Wizard Stepper Bar */}
      <div className="mb-6 pb-4 border-b border-surface-border">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-gray-950 text-white ring-4 ring-gray-900/10 shadow-sm"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold ${
                      isCurrent ? "text-gray-950" : "text-gray-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[280px]">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-sm font-semibold text-gray-950">Personal Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ramesh"
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Patil"
                required
              />
              <Input
                label="Work Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh.patil@ga-hrms.io"
                required
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98234 56789"
                required
              />
              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                options={[
                  { label: "Male", value: "MALE" },
                  { label: "Female", value: "FEMALE" },
                  { label: "Other", value: "OTHER" },
                ]}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Employment */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-sm font-semibold text-gray-950">Employment & Organization</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                options={departments.map((d) => ({ label: d.name, value: d.id }))}
              />
              <Select
                label="Designation"
                value={designationId}
                onChange={(e) => setDesignationId(e.target.value)}
                options={designations.map((des) => ({ label: des.title, value: des.id }))}
              />
              <Select
                label="Branch / Location"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                options={branches.map((b) => ({ label: b.name, value: b.id }))}
              />
              <Select
                label="Reporting Manager"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                options={employees.map((e) => ({
                  label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
                  value: e.id,
                }))}
              />
              <Input
                label="Joining Date"
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
              />
              <Select
                label="Assigned Shift"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                options={shifts.map((s) => ({
                  label: `${s.name} (${s.startTime} - ${s.endTime})`,
                  value: s.id,
                }))}
              />
            </div>
          </div>
        )}

        {/* Step 3: Statutory */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-sm font-semibold text-gray-950">Indian Statutory Compliance Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Permanent Account Number (PAN)"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                required
              />
              <Input
                label="Aadhaar Card Number"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                placeholder="4512 7890 2345"
                required
              />
              <Input
                label="Universal Account Number (EPFO UAN)"
                value={uan}
                onChange={(e) => setUan(e.target.value)}
                placeholder="100912457899"
                required
              />
              <Input
                label="ESIC IP Number"
                value={esicNumber}
                onChange={(e) => setEsicNumber(e.target.value)}
                placeholder="3100456799"
                required
              />
            </div>
          </div>
        )}

        {/* Step 4: Banking */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-sm font-semibold text-gray-950">Salary Disbursement Bank Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank Ltd."
                required
              />
              <Input
                label="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="50100456789123"
                required
              />
              <Input
                label="IFSC Code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="HDFC0000052"
                required
              />
              <Input
                label="Account Holder Name"
                value={accountHolderName || `${firstName} ${lastName}`}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Full Name as per Bank Passbook"
                required
              />
            </div>
          </div>
        )}

        {/* Step 5: Salary */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-sm font-semibold text-gray-950">Compensation & Salary Structure</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Gross CTC (INR)"
                type="number"
                value={monthlyCtc}
                onChange={(e) => setMonthlyCtc(Number(e.target.value))}
                required
              />
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-center">
                <span className="text-xs text-gray-500 font-medium">Annual CTC</span>
                <span className="text-xl font-bold text-gray-950">
                  {formatINR(monthlyCtc * 12)} / annum
                </span>
              </div>
            </div>

            {/* Calculated Breakdown Preview */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Automatic Salary Structure Breakdown
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-text-muted">Basic Salary (50%):</span>
                  <p className="font-bold text-text-primary">{formatINR(monthlyCtc * 0.5)}</p>
                </div>
                <div>
                  <span className="text-text-muted">HRA (25%):</span>
                  <p className="font-bold text-text-primary">{formatINR(monthlyCtc * 0.25)}</p>
                </div>
                <div>
                  <span className="text-text-muted">Special Allowance:</span>
                  <p className="font-bold text-text-primary">{formatINR(monthlyCtc * 0.25)}</p>
                </div>
                <div>
                  <span className="text-text-muted">EPF Deduction (12%):</span>
                  <p className="font-bold text-rose-600">₹1,800</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Finish */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-sm font-semibold text-gray-950">Review & Verification</h4>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Employee profile is ready for immediate enterprise activation!
              </div>
              <p className="text-emerald-800">
                Once saved, this employee will appear in the directory, attendance roster,
                payroll run batch, and organizational tree.
              </p>
            </div>

            <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-gray-700" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">Appointment Document</p>
                  <p className="text-[11px] text-text-muted">{uploadedDocName}</p>
                </div>
              </div>
              <Badge variant="success" size="sm">
                Ready to attach
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Navigation Footer */}
      <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep > 1) setCurrentStep(currentStep - 1);
            else onClose();
          }}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          {currentStep === 1 ? "Cancel" : "Previous"}
        </Button>

        {currentStep < 6 ? (
          <Button
            variant="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleFinish}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Finish & Activate Employee
          </Button>
        )}
      </div>
    </Modal>
  );
}
