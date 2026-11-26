import React, { useState } from "react";
import {
  Briefcase,
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  ChevronRight,
  MoreVertical,
  Award,
  Sparkles,
  Gift,
  Share2,
  FileText,
  UserCheck,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { cn } from "../../lib/utils";
import { Candidate, CandidateStage, JobPosting, JobType } from "../../types/hrms";
import { useToast } from "../../lib/toastContext";

const STAGES: { key: CandidateStage; label: string; color: string }[] = [
  { key: "SOURCED", label: "Sourced", color: "bg-gray-100 text-[#4B5D6B] border-[#DDE3EA]" },
  { key: "SCREENING", label: "Screening", color: "bg-[#1F8476]/10 text-[#1F8476] border-[#1F8476]/30" },
  { key: "INTERVIEW", label: "Interview", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "OFFER", label: "Offer Sent", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "HIRED", label: "Hired", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

export function RecruitmentPage() {
  const { jobs, candidates, departments, employees, addJob, updateJobStatus, addCandidate, updateCandidateStage } = useHrms();
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();

  const role = user?.role || "EMPLOYEE";
  const isAdmin = role === "SUPER_ADMIN" || role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  const currentEmployee =
    employees.find(
      (e) => e.id === user?.employeeId || e.employeeCode === user?.employeeId
    ) ||
    employees.find((e) => e.email === user?.email) ||
    employees[0];

  // For Manager: default to their department
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(() => {
    if (isManager && currentEmployee?.departmentId) {
      return currentEmployee.departmentId;
    }
    return "ALL";
  });

  const [activeTab, setActiveTab] = useState<string>(isEmployee ? "jobs" : "pipeline");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // New Job Form
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDeptId, setNewJobDeptId] = useState(
    isManager && currentEmployee?.departmentId ? currentEmployee.departmentId : departments[0]?.id || ""
  );
  const [newJobLocation, setNewJobLocation] = useState("Pune (Hybrid)");
  const [newJobType, setNewJobType] = useState<JobType>("FULL_TIME");
  const [newJobExperience, setNewJobExperience] = useState("3 - 6 Years");
  const [newJobSalary, setNewJobSalary] = useState("₹15,00,000 - ₹22,00,000");
  const [newJobOpenings, setNewJobOpenings] = useState(1);
  const [newJobDescription, setNewJobDescription] = useState("");

  // New Candidate Form / Referral Form
  const [newCandName, setNewCandName] = useState("");
  const [newCandEmail, setNewCandEmail] = useState("");
  const [newCandPhone, setNewCandPhone] = useState("");
  const [newCandJobId, setNewCandJobId] = useState(jobs[0]?.id || "");
  const [newCandCompany, setNewCandCompany] = useState("");
  const [newCandDesignation, setNewCandDesignation] = useState("");
  const [newCandExp, setNewCandExp] = useState(4);
  const [newCandCtc, setNewCandCtc] = useState(1800000);
  const [newCandNotes, setNewCandNotes] = useState("");

  // Candidate evaluation notes
  const [evalNotes, setEvalNotes] = useState("");
  const [evalRating, setEvalRating] = useState(4.5);

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesQuery =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === "ALL" || j.departmentId === selectedDeptFilter;
    return matchesQuery && matchesDept;
  });

  // Scoped candidate pipeline
  const filteredCandidates = candidates.filter((c) => {
    const targetJob = jobs.find((j) => j.id === c.jobId);
    if (selectedDeptFilter !== "ALL" && targetJob?.departmentId !== selectedDeptFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        (c.currentCompany || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Metrics
  const activeJobsCount = jobs.filter((j) => j.status === "OPEN").length;
  const inInterviewCount = filteredCandidates.filter((c) => c.stage === "INTERVIEW").length;
  const offersCount = filteredCandidates.filter((c) => c.stage === "OFFER").length;
  const hiredCount = filteredCandidates.filter((c) => c.stage === "HIRED").length;

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;
    const dept = departments.find((d) => d.id === newJobDeptId);
    addJob({
      title: newJobTitle.trim(),
      departmentId: newJobDeptId,
      departmentName: dept?.name || "General",
      location: newJobLocation,
      type: newJobType,
      experience: newJobExperience,
      salaryRange: newJobSalary,
      openingsCount: Number(newJobOpenings) || 1,
      status: "OPEN",
      description: newJobDescription || "Exciting role at GA-HRMS.",
      requirements: ["Strong domain expertise", "Good communication skills"],
    });
    toastSuccess(
      isManager
        ? `Requisition for "${newJobTitle}" submitted for HR approval.`
        : `Requisition "${newJobTitle}" published to career portal.`
    );
    setIsPostJobModalOpen(false);
    setNewJobTitle("");
    setNewJobDescription("");
  };

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName.trim()) return;
    const targetJob = jobs.find((j) => j.id === newCandJobId);
    addCandidate({
      jobId: newCandJobId,
      jobTitle: targetJob?.title || "Role",
      fullName: newCandName.trim(),
      email: newCandEmail.trim() || `${newCandName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: newCandPhone.trim() || "+91 98000 00000",
      currentCompany: newCandCompany || "Previous Org",
      currentDesignation: newCandDesignation || "Engineer",
      experienceYears: Number(newCandExp) || 3,
      expectedCtc: Number(newCandCtc) || 1500000,
      stage: "SOURCED",
      rating: 4.5,
      notes: isEmployee
        ? `Employee Referral by ${currentEmployee.firstName} ${currentEmployee.lastName} (${currentEmployee.employeeCode}). ${newCandNotes}`
        : newCandNotes || "Screening profile review.",
    });
    toastSuccess(
      isEmployee
        ? `Referral for ${newCandName} submitted! You are eligible for the ₹50,000 referral bonus.`
        : `Candidate ${newCandName} added to talent pipeline.`
    );
    setIsAddCandidateModalOpen(false);
    setNewCandName("");
    setNewCandEmail("");
    setNewCandCompany("");
    setNewCandNotes("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            {isAdmin && "Corporate Recruitment & Talent Acquisition (ATS)"}
            {isManager && "Team Hiring Pipeline & Candidate Assessments"}
            {isEmployee && "Internal Careers & Employee Referral Program"}
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5D6B] mt-1">
            {isAdmin &&
              "Manage pan-organization hiring requisitions, candidate evaluation pipelines, and offer sanctions."}
            {isManager &&
              "Review applicants for your department, advance candidates across interview rounds, and request new roles."}
            {isEmployee &&
              "Explore open positions across all campuses, apply for internal mobility, or refer top talent for rewards."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsAddCandidateModalOpen(true)}
            leftIcon={isEmployee ? <Gift className="w-3.5 h-3.5 text-[#1F8476]" /> : <UserPlus className="w-3.5 h-3.5 text-[#1F8476]" />}
          >
            {isEmployee ? "Refer a Candidate" : "Add Candidate"}
          </Button>

          {!isEmployee && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsPostJobModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {isManager ? "Request Requisition" : "Post New Job"}
            </Button>
          )}
        </div>
      </div>

      {/* Employee Referral Banner */}
      {isEmployee && (
        <div className="p-4 sm:p-5 rounded-xl border border-[#1F8476]/30 bg-[#1F8476]/5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1F8476] text-white flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F8476]">
                  Employee Referral Program 2026
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ₹50,000 Reward / Hire
                </span>
              </div>
              <p className="text-xs text-[#4B5D6B] mt-0.5">
                Know someone great? Refer talented peers for open positions. Bonus is disbursed upon successful 90-day probation completion.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddCandidateModalOpen(true)}
            variant="primary"
            size="sm"
            className="h-8 text-xs bg-[#1F8476] text-white font-bold shrink-0"
          >
            Submit a Referral
          </Button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border bg-white border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Open Requisitions</span>
            <Briefcase className="w-4 h-4 text-[#1F8476]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{activeJobsCount}</span>
            <span className="text-[11px] text-[#697586]">roles active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">
              {isEmployee ? "Company Headcount Growth" : "Active In-Pipeline"}
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{filteredCandidates.length}</span>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
              applicants
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">In Active Interviews</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{inInterviewCount}</span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold">
              evaluations
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#697586]">Offers & Hires (Q3)</span>
            <CheckCircle2 className="w-4 h-4 text-[#62D84E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2430]">{offersCount + hiredCount}</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
              confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 border-b border-[#DDE3EA]">
        {!isEmployee && (
          <button
            type="button"
            onClick={() => setActiveTab("pipeline")}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px",
              activeTab === "pipeline"
                ? "border-[#1F8476] text-[#1F8476]"
                : "border-transparent text-[#697586] hover:text-[#1B2430]"
            )}
          >
            <span>Candidate Evaluation Pipeline</span>
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                activeTab === "pipeline"
                  ? "bg-[#1F8476] text-white"
                  : "bg-[#DDE3EA] text-[#4B5D6B]"
              )}
            >
              {filteredCandidates.length}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px",
            activeTab === "jobs"
              ? "border-[#1F8476] text-[#1F8476]"
              : "border-transparent text-[#697586] hover:text-[#1B2430]"
          )}
        >
          <span>{isEmployee ? "Open Career Opportunities" : "Job Openings & Requisitions"}</span>
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
              activeTab === "jobs"
                ? "bg-[#1F8476] text-white"
                : "bg-[#DDE3EA] text-[#4B5D6B]"
            )}
          >
            {filteredJobs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Candidate Pipeline Board (Manager & Admin only) */}
      {!isEmployee && activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DDE3EA]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">
                Department Scope:
              </span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg text-[#1B2430] focus:outline-none focus:border-[#1F8476]"
              >
                <option value="ALL">All Departments (Org Wide)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {isManager && d.id === currentEmployee?.departmentId ? "(Your Team)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#697586] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by name, role, org..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg text-[#1B2430] placeholder-[#697586] focus:bg-white focus:outline-none focus:border-[#1F8476]"
              />
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
            {STAGES.map((col) => {
              const colCandidates = filteredCandidates.filter((c) => c.stage === col.key);
              return (
                <div
                  key={col.key}
                  className="bg-[#F7F9FB] rounded-xl p-3 border border-[#DDE3EA] flex flex-col min-w-[220px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#DDE3EA]">
                    <span className="text-xs font-bold text-[#1B2430] tracking-wide">
                      {col.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.color}`}>
                      {colCandidates.length}
                    </span>
                  </div>

                  {/* Candidate Cards */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[560px] pr-0.5">
                    {colCandidates.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#697586] italic">
                        No candidates in {col.label}
                      </div>
                    ) : (
                      colCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => {
                            setSelectedCandidate(cand);
                            setEvalNotes(cand.notes || "");
                            setEvalRating(cand.rating || 4.5);
                          }}
                          className="p-3 bg-white rounded-xl border border-[#DDE3EA] hover:border-[#1F8476] hover:shadow-md cursor-pointer transition-all group text-left"
                        >
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <h4 className="text-xs font-bold text-[#1B2430] group-hover:text-[#1F8476] transition-colors">
                              {cand.fullName}
                            </h4>
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 shrink-0">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              {cand.rating}
                            </span>
                          </div>

                          <p className="text-[11px] font-medium text-[#4B5D6B] truncate mb-1.5">
                            {cand.jobTitle}
                          </p>

                          <div className="text-[10px] text-[#697586] space-y-0.5 mb-2">
                            <div className="truncate">🏢 {cand.currentCompany || "N/A"}</div>
                            <div>⏳ {cand.experienceYears} yrs experience</div>
                          </div>

                          <div className="pt-2 border-t border-[#DDE3EA] flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-[#1B2430]">
                              ₹{(cand.expectedCtc / 100000).toFixed(1)}L CTC
                            </span>
                            <span className="text-[#1F8476] font-semibold group-hover:underline inline-flex items-center gap-0.5">
                              Assess <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Job Requisitions */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-xl border border-[#DDE3EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE3EA]">
            <div>
              <h3 className="text-sm font-bold text-[#1B2430]">
                {isEmployee ? "Available Job Openings" : "Open Requisitions & Roles"}
              </h3>
              <p className="text-xs text-[#697586] mt-0.5">
                {isEmployee
                  ? "Refer talented professionals in your network or explore internal transfer pathways."
                  : "Active hiring requisitions tracked across all business departments."}
              </p>
            </div>

            {/* Search & Dept Filters */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#697586]" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg focus:outline-none focus:border-[#1F8476] w-48 text-[#1B2430]"
                />
              </div>

              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-lg focus:outline-none text-[#1B2430]"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[#697586] font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Location & Type</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Salary Range</th>
                  <th className="py-3 px-4 text-center">Applicants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EA]">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1B2430]">
                      {job.title}
                      <div className="text-[10px] text-[#697586] font-normal">
                        Posted on {job.postedDate} • {job.openingsCount} {job.openingsCount === 1 ? "opening" : "openings"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#4B5D6B]">{job.departmentName}</td>
                    <td className="py-3.5 px-4 text-[#4B5D6B]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#1F8476]" />
                        {job.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#4B5D6B]">{job.experience}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1B2430]">{job.salaryRange}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-[#1F8476] bg-[#1F8476]/10 px-2.5 py-0.5 rounded-full border border-[#1F8476]/30">
                        {job.applicantsCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={job.status === "OPEN" ? "success" : "warning"}
                        size="sm"
                        dot
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isEmployee ? (
                        <Button
                          onClick={() => {
                            setNewCandJobId(job.id);
                            setIsAddCandidateModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 text-[#1F8476] hover:bg-[#1F8476]/5 border-[#1F8476]/30 font-semibold"
                          leftIcon={<Share2 className="w-3 h-3" />}
                        >
                          Refer
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin && (
                            <button
                              onClick={() =>
                                updateJobStatus(job.id, job.status === "OPEN" ? "ON_HOLD" : "OPEN")
                              }
                              className="px-2 py-1 text-[11px] font-semibold text-[#4B5D6B] hover:bg-gray-100 rounded border border-[#DDE3EA]"
                            >
                              {job.status === "OPEN" ? "Hold" : "Activate"}
                            </button>
                          )}
                          <Button
                            onClick={() => {
                              setNewCandJobId(job.id);
                              setIsAddCandidateModalOpen(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2 text-[#1F8476] hover:bg-[#1F8476]/5 border-[#1F8476]/30 font-semibold"
                          >
                            + Candidate
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Post New Job / Request Requisition */}
      <Modal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        title={isManager ? "Request New Team Requisition" : "Post New Job Requisition"}
        description={
          isManager
            ? "Submit a hiring requisition for your department to HR Operations."
            : "Publish an authorized hiring opening across candidate portals."
        }
        size="lg"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <Input
            label="Job Title"
            placeholder="e.g. Senior Cloud Security Architect"
            value={newJobTitle}
            onChange={(e) => setNewJobTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              value={newJobDeptId}
              onChange={(e) => setNewJobDeptId(e.target.value)}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />

            <Select
              label="Employment Type"
              value={newJobType}
              onChange={(e) => setNewJobType(e.target.value as JobType)}
              options={[
                { value: "FULL_TIME", label: "Full Time (Permanent)" },
                { value: "CONTRACT", label: "Contractual / Specialist" },
                { value: "HYBRID", label: "Hybrid" },
                { value: "REMOTE", label: "Remote" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Location"
              placeholder="e.g. Pune HQ (Hybrid)"
              value={newJobLocation}
              onChange={(e) => setNewJobLocation(e.target.value)}
            />
            <Input
              label="Experience Required"
              placeholder="e.g. 5 - 8 Years"
              value={newJobExperience}
              onChange={(e) => setNewJobExperience(e.target.value)}
            />
            <Input
              label="Openings Count"
              type="number"
              min={1}
              value={newJobOpenings}
              onChange={(e) => setNewJobOpenings(Number(e.target.value))}
            />
          </div>

          <Input
            label="Budgeted Salary Range"
            placeholder="e.g. ₹22,00,000 - ₹30,00,000"
            value={newJobSalary}
            onChange={(e) => setNewJobSalary(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Role Scope & Business Justification
            </label>
            <textarea
              rows={3}
              placeholder="Describe core duties and expected qualifications..."
              value={newJobDescription}
              onChange={(e) => setNewJobDescription(e.target.value)}
              className="w-full text-xs p-2.5 border border-[#DDE3EA] rounded-lg focus:outline-none focus:border-[#1F8476] text-[#1B2430]"
            />
          </div>

          <div className="pt-3 border-t border-[#DDE3EA] flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              size="sm"
              onClick={() => setIsPostJobModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              size="sm"
              className="bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
            >
              {isManager ? "Submit Requisition Request" : "Publish Requisition"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Add Candidate / Submit Referral */}
      <Modal
        isOpen={isAddCandidateModalOpen}
        onClose={() => setIsAddCandidateModalOpen(false)}
        title={isEmployee ? "Submit Candidate Referral" : "Add Candidate to Talent Pipeline"}
        description={
          isEmployee
            ? "Submit a colleague or peer for consideration. ₹50,000 bonus upon hire!"
            : "Manually input candidate credentials into active ATS stage."
        }
        size="md"
      >
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <Input
            label="Candidate Full Name"
            placeholder="e.g. Rahul Verma"
            value={newCandName}
            onChange={(e) => setNewCandName(e.target.value)}
            required
          />

          <Select
            label="Position Applied / Referred For"
            value={newCandJobId}
            onChange={(e) => setNewCandJobId(e.target.value)}
            options={jobs.map((j) => ({ value: j.id, label: `${j.title} (${j.departmentName})` }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              placeholder="rahul.v@example.com"
              value={newCandEmail}
              onChange={(e) => setNewCandEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="+91 98000 00000"
              value={newCandPhone}
              onChange={(e) => setNewCandPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Current Company"
              placeholder="e.g. Cognizant / TCS"
              value={newCandCompany}
              onChange={(e) => setNewCandCompany(e.target.value)}
            />
            <Input
              label="Current Designation"
              placeholder="e.g. Lead Engineer"
              value={newCandDesignation}
              onChange={(e) => setNewCandDesignation(e.target.value)}
            />
          </div>

          {!isEmployee && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Total Experience (Years)"
                type="number"
                step="0.5"
                value={newCandExp}
                onChange={(e) => setNewCandExp(Number(e.target.value))}
              />
              <Input
                label="Expected CTC (₹)"
                type="number"
                step="50000"
                value={newCandCtc}
                onChange={(e) => setNewCandCtc(Number(e.target.value))}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              {isEmployee ? "Referral Notes / Why recommend this person?" : "Initial Assessment Notes"}
            </label>
            <textarea
              rows={2}
              placeholder="Highlight technical skills or key accomplishments..."
              value={newCandNotes}
              onChange={(e) => setNewCandNotes(e.target.value)}
              className="w-full text-xs p-2.5 border border-[#DDE3EA] rounded-lg focus:outline-none focus:border-[#1F8476] text-[#1B2430]"
            />
          </div>

          <div className="pt-3 border-t border-[#DDE3EA] flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              size="sm"
              onClick={() => setIsAddCandidateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              size="sm"
              className="bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
            >
              {isEmployee ? "Submit Referral" : "Add to Pipeline"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Candidate Detail & Stage Advance (Manager & Admin) */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={`Candidate Dossier: ${selectedCandidate.fullName}`}
          description={`Evaluation for ${selectedCandidate.jobTitle}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1B2430]">{selectedCandidate.fullName}</h4>
                  <p className="text-xs text-[#1F8476] font-medium">{selectedCandidate.jobTitle}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {selectedCandidate.rating} / 5.0
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#4B5D6B] pt-2 border-t border-[#DDE3EA]">
                <div>🏢 Org: <span className="font-semibold text-[#1B2430]">{selectedCandidate.currentCompany || "N/A"}</span></div>
                <div>⏳ Exp: <span className="font-semibold text-[#1B2430]">{selectedCandidate.experienceYears} Years</span></div>
                <div>✉️ {selectedCandidate.email}</div>
                <div>📞 {selectedCandidate.phone}</div>
                <div className="col-span-2">
                  💰 Expected CTC: <span className="font-bold text-[#1B2430]">₹{(selectedCandidate.expectedCtc / 100000).toFixed(1)} Lakhs</span>
                </div>
              </div>
            </div>

            {selectedCandidate.notes && (
              <div>
                <label className="text-xs font-bold text-[#1B2430]">Interview & Evaluation Notes:</label>
                <p className="text-xs text-[#4B5D6B] p-2.5 bg-[#F7F9FB] rounded-lg mt-1 border border-[#DDE3EA] italic">
                  "{selectedCandidate.notes}"
                </p>
              </div>
            )}

            {/* Advance Stage Control */}
            <div>
              <label className="text-xs font-bold text-[#1B2430] block mb-1.5">
                Advance Pipeline Stage:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {STAGES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      updateCandidateStage(selectedCandidate.id, s.key);
                      setSelectedCandidate({ ...selectedCandidate, stage: s.key });
                      toastSuccess(`Advanced ${selectedCandidate.fullName} to "${s.label}".`);
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all ${
                      selectedCandidate.stage === s.key
                        ? "bg-[#1F8476] text-white border-[#1F8476] shadow-xs"
                        : "bg-white hover:bg-gray-50 text-[#4B5D6B] border-[#DDE3EA]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#DDE3EA] flex justify-end">
              <Button
                variant="primary"
                size="sm"
                className="bg-[#1F8476] hover:bg-[#16665b] text-white font-bold"
                onClick={() => setSelectedCandidate(null)}
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}