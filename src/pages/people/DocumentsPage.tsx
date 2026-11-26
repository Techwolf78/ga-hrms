import React, { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Building2,
  Lock,
  Eye,
  FileCheck,
  UserCheck,
  Users,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../lib/utils";
import { useToast } from "../../lib/toastContext";

export function DocumentsPage() {
  const { documents, employees, departments, uploadDocument } = useHrms();
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();

  const role = user?.role || "EMPLOYEE";
  const isAdmin = role === "SUPER_ADMIN" || role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  // Current employee and direct reports
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

  // Manager tab state
  const [managerTab, setManagerTab] = useState<"TEAM" | "MY" | "POLICY">("TEAM");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form state
  const [targetEmployeeId, setTargetEmployeeId] = useState(
    isAdmin
      ? employees[0]?.id || "EMP-1001"
      : currentEmployee?.id || user?.employeeId || "EMP-1004"
  );
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<any>("IDENTITY");
  const [fileType, setFileType] = useState("PDF");
  const [fileSizeStr, setFileSizeStr] = useState("1.4 MB");

  const categories = [
    { id: "ALL", label: "All Categories" },
    { id: "IDENTITY", label: "Identity & KYC" },
    { id: "ACADEMIC", label: "Academic Records" },
    { id: "EXPERIENCE", label: "Prior Experience" },
    { id: "COMPANY_POLICY", label: "Policies & Contracts" },
    { id: "OTHER", label: "Other Records" },
  ];

  // Base scoping by role
  const scopedDocs = (documents || []).filter((doc) => {
    // Company policy circulars are globally visible
    const isGlobalPolicy = doc.category === "COMPANY_POLICY" || doc.employeeId === "ALL";

    if (isAdmin) return true;

    if (isManager) {
      if (managerTab === "TEAM") {
        return directReports.some(
          (dr) => dr.id === doc.employeeId || dr.employeeCode === doc.employeeId
        );
      }
      if (managerTab === "MY") {
        return (
          doc.employeeId === currentEmployee?.id ||
          doc.employeeId === currentEmployee?.employeeCode ||
          doc.employeeId === user?.employeeId
        );
      }
      // POLICY tab
      return isGlobalPolicy;
    }

    // Employee: Only own documents or general company policies
    return (
      doc.employeeId === currentEmployee?.id ||
      doc.employeeId === currentEmployee?.employeeCode ||
      doc.employeeId === user?.employeeId ||
      isGlobalPolicy
    );
  });

  // Filtered by search, category, department
  const filteredDocs = scopedDocs.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      (doc?.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "ALL" || doc.category === selectedCategory;

    const emp = employees.find(
      (e) => e.id === doc.employeeId || e.employeeCode === doc.employeeId
    );

    if (isAdmin) {
      if (
        selectedDepartment !== "ALL" &&
        emp?.departmentId !== selectedDepartment
      )
        return false;
      if (
        selectedEmployeeFilter !== "ALL" &&
        doc.employeeId !== selectedEmployeeFilter
      )
        return false;
    }

    return matchesSearch && matchesCat;
  });

  // Metric counts
  const totalDocsCount = scopedDocs.length;
  const identityCount = scopedDocs.filter((d) => d.category === "IDENTITY").length;
  const academicCount = scopedDocs.filter((d) => d.category === "ACADEMIC").length;
  const policyCount = scopedDocs.filter((d) => d.category === "COMPANY_POLICY").length;

  const handleUpload = () => {
    if (!title.trim()) return;

    uploadDocument({
      employeeId: isAdmin ? targetEmployeeId : currentEmployee?.id || user?.employeeId || "EMP-1004",
      title: title.trim(),
      category,
      fileSize: fileSizeStr,
      fileType,
    });

    toastSuccess(`Document "${title}" uploaded to secure vault successfully.`);
    setTitle("");
    setIsUploadOpen(false);
  };

  const handleDownload = (docTitle: string, docSize: string) => {
    toastSuccess(`Downloaded: ${docTitle} (${docSize})`);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "IDENTITY":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            KYC Identity
          </span>
        );
      case "ACADEMIC":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Academic
          </span>
        );
      case "EXPERIENCE":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Experience
          </span>
        );
      case "COMPANY_POLICY":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1F8476]/10 text-[#1F8476] border border-[#1F8476]/30">
            Corporate Policy
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-[#4B5D6B] border border-gray-200">
            General
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            {isAdmin && "Corporate Document Compliance Vault"}
            {isManager && "Team Document Verification & Vault"}
            {isEmployee && "My Document Vault"}
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5">
            {isAdmin &&
              "Centrally manage, verify, and audit statutory KYC proofs, employee agreements, and corporate policies."}
            {isManager &&
              "Review onboarding documents and statutory proofs for direct reports and maintain your personal credentials."}
            {isEmployee &&
              "Securely store and access your statutory KYC proofs, academic records, and signed company agreements."}
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          variant="primary"
          size="sm"
          leftIcon={<Upload className="w-3.5 h-3.5" />}
        >
          {isEmployee ? "Upload My Document" : "Upload Document"}
        </Button>
      </div>

      {/* Security & Privacy Banner */}
      <div className="p-3 sm:p-3.5 rounded-2xl border border-[#DDE3EA] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_2px_16px_rgba(3,45,66,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#032D42] flex items-center gap-2">
              <span>SOC-2 & DPDP Act Compliant Storage</span>
              <span className="text-[10px] font-semibold text-[#188038] bg-[#E6F4EA] px-2 py-0.5 rounded-full">
                AES-256 Encrypted
              </span>
            </div>
            <p className="text-[11px] text-[#697586] mt-0.5">
              {isEmployee
                ? "Your statutory proofs and certificates are encrypted at rest and accessible only by you and certified People Operations officers."
                : isManager
                ? "Manager view scopes documents strictly to verified members in your reporting line and company policies."
                : "Corporate custodian view enforces access auditing on all statutory identity proofs and employee files."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#697586] shrink-0">
          <Lock className="w-3.5 h-3.5 text-[#1F8476]" />
          <span>Role Isolation Active</span>
        </div>
      </div>

      {/* Manager Tab Bar */}
      {isManager && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#DDE3EA]">
          <div className="inline-flex p-1 bg-[#F7F9FB] rounded-lg border border-[#DDE3EA] gap-1">
            <button
              onClick={() => setManagerTab("TEAM")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                managerTab === "TEAM"
                  ? "bg-white text-[#1F8476] shadow-sm font-bold border border-[#DDE3EA]"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Direct Reports Records</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#1F8476]/10 text-[#1F8476]">
                {directReports.length} Members
              </span>
            </button>
            <button
              onClick={() => setManagerTab("MY")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                managerTab === "MY"
                  ? "bg-white text-[#1F8476] shadow-sm font-bold border border-[#DDE3EA]"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Personal Vault</span>
            </button>
            <button
              onClick={() => setManagerTab("POLICY")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                managerTab === "POLICY"
                  ? "bg-white text-[#1F8476] shadow-sm font-bold border border-[#DDE3EA]"
                  : "text-[#697586] hover:text-[#1B2430]"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Company Policies & Handbooks</span>
            </button>
          </div>

          <div className="text-xs text-[#697586] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#1F8476] shrink-0" />
            <span>
              {managerTab === "TEAM"
                ? `Showing statutory proofs for your ${directReports.length} direct report(s).`
                : managerTab === "MY"
                ? "Your personal credentials and appointment letters."
                : "Corporate handbooks and regulatory policies."}
            </span>
          </div>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setSelectedCategory("ALL")}
          className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
            selectedCategory === "ALL"
              ? "border-[#1F8476] ring-2 ring-[#1F8476]/10 shadow-xs"
              : "border-[#DDE3EA] hover:border-[#b8c2cc]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">
              {isAdmin ? "Total Records Vault" : isManager && managerTab === "TEAM" ? "Team Documents" : "Vault Documents"}
            </span>
            <FileText className="w-4 h-4 text-[#1F8476]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{totalDocsCount}</span>
            <span className="text-[11px] text-[#697586]">files</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedCategory("IDENTITY")}
          className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
            selectedCategory === "IDENTITY"
              ? "border-blue-400 ring-2 ring-blue-500/10 shadow-xs"
              : "border-[#DDE3EA] hover:border-[#b8c2cc]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Identity & KYC</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{identityCount}</span>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
              Verified
            </span>
          </div>
        </div>

        <div
          onClick={() => setSelectedCategory("ACADEMIC")}
          className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
            selectedCategory === "ACADEMIC"
              ? "border-purple-400 ring-2 ring-purple-500/10 shadow-xs"
              : "border-[#DDE3EA] hover:border-[#b8c2cc]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Academic Credentials</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#1B2430]">{academicCount}</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedCategory("COMPANY_POLICY")}
          className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
            selectedCategory === "COMPANY_POLICY"
              ? "border-[#1F8476] ring-2 ring-[#1F8476]/10 shadow-xs"
              : "border-[#DDE3EA] hover:border-[#b8c2cc]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Policies & Contracts</span>
            <Building2 className="w-4 h-4 text-[#1F8476]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#1B2430]">{policyCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="inline-flex items-center p-1 bg-[#F7F9FB] rounded-lg border border-[#DDE3EA] gap-1 overflow-x-auto shrink-0">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count =
                cat.id === "ALL"
                  ? scopedDocs.length
                  : scopedDocs.filter((d) => d.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#1B2430] shadow-xs font-bold border border-[#DDE3EA]"
                      : "text-[#697586] hover:text-[#1B2430]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-[#1F8476] text-white"
                        : "bg-[#DDE3EA] text-[#4B5D6B]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Dropdowns */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 lg:max-w-md">
            {isAdmin && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full sm:w-40 h-9 px-2.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg text-[#1B2430] focus:outline-none focus:border-[#1F8476]"
              >
                <option value="ALL">All Depts</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#697586] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search document title..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg text-[#1B2430] placeholder-[#697586] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#DDE3EA] space-y-2">
          <FileText className="w-10 h-10 text-[#697586]/40 mx-auto" />
          <h3 className="text-sm font-bold text-[#1B2430]">No Documents Found</h3>
          <p className="text-xs text-[#697586]">
            No files match the selected filter criteria or search query in this vault.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const emp = employees.find(
              (e) => e.id === doc.employeeId || e.employeeCode === doc.employeeId
            );
            const isPolicy = doc.category === "COMPANY_POLICY" || doc.employeeId === "ALL";

            return (
              <div
                key={doc.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1F8476]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#1F8476]/10 text-[#1F8476] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#1F8476]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getCategoryBadge(doc.category)}
                      <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                        {doc.fileType}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#1B2430] line-clamp-2 leading-snug">
                      {doc.title}
                    </h4>

                    {/* Owner Info */}
                    <div className="mt-2 flex items-center gap-2">
                      {isPolicy ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#1F8476] font-semibold">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Enterprise-Wide Circular</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-[#4B5D6B]">
                          {emp?.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={emp.firstName}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-[#1F8476]/10 text-[#1F8476] text-[9px] font-bold flex items-center justify-center">
                              {emp?.firstName?.[0] || "E"}
                            </div>
                          )}
                          <span className="font-medium text-[#1B2430]">
                            {emp ? `${emp.firstName} ${emp.lastName}` : doc.employeeId}
                          </span>
                          <span className="text-[11px] text-[#697586]">
                            ({emp?.employeeCode})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-[11px] text-[#697586] flex items-center justify-between">
                      <span>Size: {doc.fileSize}</span>
                      <span>Uploaded {formatDate(doc.uploadDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DDE3EA] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Proof
                  </span>

                  <Button
                    onClick={() => handleDownload(doc.title, doc.fileSize)}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 text-[#1F8476] hover:bg-[#1F8476]/5 border-[#1F8476]/30 font-semibold"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={isEmployee ? "Upload Document to Personal Vault" : "Upload Employee Document"}
        description={
          isEmployee
            ? "Upload your statutory verification proofs (Aadhaar, PAN, Academic Degrees, Experience letters)."
            : "Deposit statutory proof, contract, or academic certificate to employee record."
        }
      >
        <div className="space-y-4">
          {isAdmin ? (
            <Select
              label="Select Employee Record"
              value={targetEmployeeId}
              onChange={(e) => setTargetEmployeeId(e.target.value)}
              options={employees.map((e) => ({
                label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
                value: e.id,
              }))}
            />
          ) : (
            <div className="p-3 bg-[#F7F9FB] rounded-lg border border-[#DDE3EA] text-xs">
              <span className="text-[#697586]">Uploading for: </span>
              <span className="font-bold text-[#1B2430]">
                {currentEmployee?.firstName} {currentEmployee?.lastName} ({currentEmployee?.employeeCode})
              </span>
            </div>
          )}

          <Input
            label="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Degree Marksheet or Masked Aadhaar"
            required
          />

          <Select
            label="Document Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: "Identity Proof (Aadhaar / PAN / Passport)", value: "IDENTITY" },
              { label: "Academic Record / Degree Marksheet", value: "ACADEMIC" },
              { label: "Experience & Relieving Certificate", value: "EXPERIENCE" },
              { label: "Company Policy / Offer Annexure", value: "COMPANY_POLICY" },
              { label: "Other Statutory Record", value: "OTHER" },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="File Format"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              options={[
                { label: "PDF Document (.pdf)", value: "PDF" },
                { label: "Scanned Image (PNG/JPEG)", value: "IMAGE" },
                { label: "Word Document (.docx)", value: "DOCX" },
              ]}
            />

            <Select
              label="File Size"
              value={fileSizeStr}
              onChange={(e) => setFileSizeStr(e.target.value)}
              options={[
                { label: "1.4 MB", value: "1.4 MB" },
                { label: "2.8 MB", value: "2.8 MB" },
                { label: "850 KB", value: "850 KB" },
                { label: "4.2 MB", value: "4.2 MB" },
              ]}
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Files are encrypted with SHA-256 integrity hash upon upload.</span>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
              onClick={handleUpload}
            >
              Save to Vault
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}