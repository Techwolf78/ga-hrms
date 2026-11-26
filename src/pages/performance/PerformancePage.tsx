import React, { useState, useMemo } from "react";
import {
  Target,
  TrendingUp,
  Award,
  Star,
  Plus,
  CheckCircle2,
  Clock,
  User,
  Users,
  Building2,
  Calendar,
  Filter,
  MessageSquare,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Edit2,
  Check,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { useToast } from "../../lib/toastContext";
import { KpiCard } from "../../components/ui/KpiCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { PerformanceGoal, AppraisalReview, GoalPriority } from "../../types/hrms";
import { formatDate, cn } from "../../lib/utils";

export function PerformancePage() {
  const {
    performanceGoals,
    appraisalReviews,
    departments,
    employees,
    addGoal,
    updateGoalProgress,
    submitAppraisalReview,
  } = useHrms();
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();

  const role = user?.role || "EMPLOYEE";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isHrAdmin = role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  // Resolved current employee identity
  const currentEmployee = useMemo(() => {
    if (!user) return null;
    return (
      employees.find(
        (e) => e.id === user.employeeId || e.employeeCode === user.employeeId
      ) ||
      (isManager
        ? employees.find((e) => e.employeeCode === "EMP-1003") || employees[2]
        : isEmployee
        ? employees.find((e) => e.employeeCode === "EMP-1004") || employees[3]
        : null)
    );
  }, [employees, user, isManager, isEmployee]);

  // Direct reports for Manager
  const directReports = useMemo(() => {
    if (!currentEmployee) return [];
    return employees.filter(
      (e) =>
        e.managerId === currentEmployee.id ||
        e.managerId === user?.employeeId ||
        (currentEmployee && e.departmentId === currentEmployee.departmentId && e.id !== currentEmployee.id)
    );
  }, [employees, currentEmployee, user?.employeeId]);

  // Scoped Goals
  const myGoals = useMemo(() => {
    const targetId = currentEmployee?.id || user?.employeeId || "EMP-1004";
    const targetCode = currentEmployee?.employeeCode || "EMP-1004";
    return performanceGoals.filter(
      (g) => g.ownerEmployeeId === targetId || g.ownerEmployeeId === targetCode
    );
  }, [performanceGoals, currentEmployee, user?.employeeId]);

  const teamGoals = useMemo(() => {
    return performanceGoals.filter((g) =>
      directReports.some(
        (dr) => dr.id === g.ownerEmployeeId || dr.employeeCode === g.ownerEmployeeId
      ) ||
      g.ownerEmployeeId === currentEmployee?.id ||
      g.ownerEmployeeId === currentEmployee?.employeeCode
    );
  }, [performanceGoals, directReports, currentEmployee]);

  // Scoped Appraisals
  const myAppraisal = useMemo(() => {
    const targetId = currentEmployee?.id || user?.employeeId || "EMP-1004";
    const targetCode = currentEmployee?.employeeCode || "EMP-1004";
    return appraisalReviews.find(
      (r) => r.employeeId === targetId || r.employeeId === targetCode
    ) || null;
  }, [appraisalReviews, currentEmployee, user?.employeeId]);

  const teamAppraisals = useMemo(() => {
    return appraisalReviews.filter((r) =>
      directReports.some((dr) => dr.id === r.employeeId || dr.employeeCode === r.employeeId)
    );
  }, [appraisalReviews, directReports]);

  // Tabs State
  const [activeTab, setActiveTab] = useState<string>(isEmployee ? "my_okrs" : "okrs");
  const [selectedQuarter, setSelectedQuarter] = useState("Q3 2026");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

  // Modals State
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [selectedReviewForRating, setSelectedReviewForRating] = useState<AppraisalReview | null>(null);
  const [ratingInput, setRatingInput] = useState(4.5);
  const [feedbackInput, setFeedbackInput] = useState("");

  // Self Evaluation Modal State (for Employee)
  const [isSelfEvalModalOpen, setIsSelfEvalModalOpen] = useState(false);
  const [selfRatingInput, setSelfRatingInput] = useState(4.5);
  const [selfNotesInput, setSelfNotesInput] = useState("");

  // New Goal Form State
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDeptId, setNewGoalDeptId] = useState(departments[0]?.id || "dept-eng");
  const [newGoalOwnerId, setNewGoalOwnerId] = useState(
    isEmployee ? currentEmployee?.id || "EMP-1004" : employees[0]?.id || "EMP-1001"
  );
  const [newGoalPriority, setNewGoalPriority] = useState<GoalPriority>("HIGH");
  const [newGoalDueDate, setNewGoalDueDate] = useState("2026-12-15");
  const [kr1Title, setKr1Title] = useState("");
  const [kr2Title, setKr2Title] = useState("");

  // Metrics
  const totalGoals = performanceGoals.length;
  const avgProgress =
    totalGoals > 0
      ? Math.round(performanceGoals.reduce((sum, g) => sum + g.progressPercent, 0) / totalGoals)
      : 0;
  const completedReviews = appraisalReviews.filter((r) => r.status === "COMPLETED").length;
  const topPerformers = appraisalReviews.filter((r) => r.managerRating >= 4.5).length;

  const myAvgProgress =
    myGoals.length > 0
      ? Math.round(myGoals.reduce((sum, g) => sum + g.progressPercent, 0) / myGoals.length)
      : 0;

  const teamPendingReviews = teamAppraisals.filter((r) => r.status === "PENDING_MANAGER").length;

  // Handlers
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const dept = departments.find((d) => d.id === newGoalDeptId);
    const assignedOwnerId = isEmployee
      ? currentEmployee?.id || "EMP-1004"
      : newGoalOwnerId;
    const emp = employees.find(
      (e) => e.id === assignedOwnerId || e.employeeCode === assignedOwnerId
    );

    addGoal({
      title: newGoalTitle.trim(),
      quarter: selectedQuarter,
      departmentId: newGoalDeptId,
      departmentName: dept?.name || "Engineering & Cloud Platforms",
      ownerEmployeeId: assignedOwnerId,
      ownerName: emp ? `${emp.firstName} ${emp.lastName}` : "Team Lead",
      ownerAvatar:
        emp?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      priority: newGoalPriority,
      status: "IN_PROGRESS",
      progressPercent: 10,
      dueDate: newGoalDueDate,
      keyResults: [
        {
          id: `kr-${Date.now()}-1`,
          title: kr1Title.trim() || "Milestone 1 Core Deliverable",
          target: 100,
          current: 10,
          unit: "%",
        },
        ...(kr2Title.trim()
          ? [
              {
                id: `kr-${Date.now()}-2`,
                title: kr2Title.trim(),
                target: 100,
                current: 5,
                unit: "%",
              },
            ]
          : []),
      ],
    });

    toastSuccess(`Objective "${newGoalTitle.trim()}" created successfully.`);
    setIsAddGoalModalOpen(false);
    setNewGoalTitle("");
    setKr1Title("");
    setKr2Title("");
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForRating) return;

    submitAppraisalReview(selectedReviewForRating.id, Number(ratingInput), feedbackInput);
    toastSuccess(`Appraisal evaluation saved for ${selectedReviewForRating.employeeName}.`);
    setSelectedReviewForRating(null);
    setFeedbackInput("");
  };

  const handleSelfEvalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toastSuccess(
      `Self-assessment submitted (${selfRatingInput}★). Routed to line manager for calibration.`
    );
    setIsSelfEvalModalOpen(false);
    setSelfNotesInput("");
  };

  const openRatingModal = (review: AppraisalReview) => {
    setSelectedReviewForRating(review);
    setRatingInput(review.managerRating || 4.5);
    setFeedbackInput(review.feedback || "");
  };

  // Filtered Goals for Admin
  const filteredGoals = useMemo(() => {
    return performanceGoals.filter((g) => {
      const matchesQuarter = !selectedQuarter || g.quarter === selectedQuarter;
      const matchesDept = selectedDeptFilter === "ALL" || g.departmentId === selectedDeptFilter;
      return matchesQuarter && matchesDept;
    });
  }, [performanceGoals, selectedQuarter, selectedDeptFilter]);

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PERSONA TITLE                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight whitespace-nowrap">
            {isEmployee
              ? "My Goals & Performance Review"
              : isManager
              ? "Team OKRs & Performance Reviews"
              : "Enterprise Performance & 360 Appraisals"}
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5 truncate hidden sm:block">
            {isEmployee
              ? "Track your quarterly professional objectives, measurable key results, and 360 appraisal review."
              : isManager
              ? "Oversee direct report deliverables, align departmental OKRs, and conduct annual appraisal calibrations."
              : "Pan-organization goal alignment, departmental OKR tracking, and enterprise appraisal calibration across 4 branches."}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isEmployee && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSelfEvalModalOpen(true)}
              leftIcon={<Star className="w-3.5 h-3.5 text-[#1F8476]" />}
            >
              Update Self-Assessment
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (isEmployee) {
                setNewGoalOwnerId(currentEmployee?.id || "EMP-1004");
              }
              setIsAddGoalModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            {isEmployee ? "New Personal OKR" : isManager ? "Set Team Objective" : "New Objective / OKR"}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPACT PILL TABS                                                     */}
      {/* ========================================================================= */}
      <div className="inline-flex items-center p-1 bg-white rounded-full border border-[#DDE3EA] shadow-[0_2px_12px_rgba(3,45,66,0.03)] gap-1 overflow-x-auto max-w-full">
        {/* A. Employee Tabs */}
        {isEmployee && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("my_okrs")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === "my_okrs"
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              )}
            >
              <Target className={cn("w-3.5 h-3.5", activeTab === "my_okrs" ? "text-[#62D84E]" : "text-[#1F8476]")} />
              <span>My Objectives &amp; OKRs</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === "my_okrs" ? "bg-white/15 text-white" : "bg-[#E9F5F3] text-[#1F8476]"
                )}
              >
                {myGoals.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("my_appraisal")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === "my_appraisal"
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              )}
            >
              <Award className={cn("w-3.5 h-3.5", activeTab === "my_appraisal" ? "text-[#62D84E]" : "text-[#1F8476]")} />
              <span>My Appraisal &amp; 360 Feedback</span>
              {myAppraisal && (
                <span className="text-[10px] font-bold bg-[#E6F4EA] text-[#188038] px-1.5 py-0.5 rounded-full">
                  {myAppraisal.managerRating}★
                </span>
              )}
            </button>
          </>
        )}

        {/* B. Manager Tabs */}
        {isManager && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("okrs")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === "okrs"
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              )}
            >
              <Target className={cn("w-3.5 h-3.5", activeTab === "okrs" ? "text-[#62D84E]" : "text-[#1F8476]")} />
              <span>Team &amp; Department OKRs</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === "okrs" ? "bg-white/15 text-white" : "bg-[#E9F5F3] text-[#1F8476]"
                )}
              >
                {teamGoals.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("team_appraisals")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === "team_appraisals"
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              )}
            >
              <Users className={cn("w-3.5 h-3.5", activeTab === "team_appraisals" ? "text-[#62D84E]" : "text-[#1F8476]")} />
              <span>Direct Reports Appraisals</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === "team_appraisals" ? "bg-white/15 text-white" : "bg-[#E9F5F3] text-[#1F8476]"
                )}
              >
                {teamAppraisals.length}
              </span>
              {teamPendingReviews > 0 && (
                <span className="text-[10px] font-bold bg-[#FEF7E0] text-[#E69F00] px-1.5 py-0.5 rounded-full">
                  {teamPendingReviews} Action
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("my_appraisal")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === "my_appraisal"
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              )}
            >
              <Award className={cn("w-3.5 h-3.5", activeTab === "my_appraisal" ? "text-[#62D84E]" : "text-[#1F8476]")} />
              <span>My Manager Review</span>
            </button>
          </>
        )}

        {/* C. Admin Tabs */}
        {(isSuperAdmin || isHrAdmin) && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("okrs")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === "okrs"
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              )}
            >
              <Target className={cn("w-3.5 h-3.5", activeTab === "okrs" ? "text-[#62D84E]" : "text-[#1F8476]")} />
              <span>Enterprise Objectives &amp; OKRs</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === "okrs" ? "bg-white/15 text-white" : "bg-[#E9F5F3] text-[#1F8476]"
                )}
              >
                {performanceGoals.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("appraisals")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === "appraisals"
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              )}
            >
              <Award className={cn("w-3.5 h-3.5", activeTab === "appraisals" ? "text-[#62D84E]" : "text-[#1F8476]")} />
              <span>360° Appraisal Calibration Matrix</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === "appraisals" ? "bg-white/15 text-white" : "bg-[#E9F5F3] text-[#1F8476]"
                )}
              >
                {appraisalReviews.length}
              </span>
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. KPI METRIC STRIP (Scoped per Role)                                    */}
      {/* ========================================================================= */}
      {isEmployee ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="My Active Objectives"
            value={myGoals.length}
            trend={{ value: `${myGoals.length}`, label: "tracked for Q3", isPositive: true }}
            icon={<Target className="w-5 h-5 text-[#1B2430]" />}
            accentColor="neutral"
          />
          <KpiCard
            label="My Completion Velocity"
            value={`${myAvgProgress}%`}
            trend={{ value: `${myAvgProgress}%`, label: "progress", isPositive: true }}
            icon={<TrendingUp className="w-5 h-5 text-[#1F8476]" />}
            accentColor="indigo"
          />
          <KpiCard
            label="360 Appraisal Rating"
            value={myAppraisal ? `${myAppraisal.managerRating} / 5.0` : "Pending"}
            trend={{ value: "Manager Score", label: myAppraisal?.cycle || "FY 2026", isPositive: true }}
            icon={<Star className="w-5 h-5 text-[#188038]" />}
            accentColor="emerald"
          />
        </div>
      ) : isManager ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            label="Direct Reports"
            value={directReports.length}
            trend={{ value: `${directReports.length}`, label: "engineers", isPositive: true }}
            icon={<Users className="w-5 h-5 text-[#1B2430]" />}
            accentColor="neutral"
          />
          <KpiCard
            label="Team Goals Tracked"
            value={teamGoals.length}
            trend={{ value: "Active", label: selectedQuarter, isPositive: true }}
            icon={<Target className="w-5 h-5 text-[#1F8476]" />}
            accentColor="indigo"
          />
          <KpiCard
            label="Appraisals Pending Review"
            value={teamPendingReviews}
            trend={teamPendingReviews > 0 ? { value: "Action Required", label: "grade reports", isPositive: false } : undefined}
            icon={<Clock className="w-5 h-5 text-[#E69F00]" />}
            accentColor="amber"
          />
          <KpiCard
            label="Team High Performers"
            value={teamAppraisals.filter((r) => r.managerRating >= 4.5).length}
            trend={{ value: "Top Band", label: "★ 4.5+", isPositive: true }}
            icon={<Award className="w-5 h-5 text-[#188038]" />}
            accentColor="emerald"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Enterprise Objectives"
            value={totalGoals}
            trend={{ value: `${totalGoals}`, label: "pan-org Q3", isPositive: true }}
            icon={<Target className="w-5 h-5 text-[#1B2430]" />}
            accentColor="neutral"
          />
          <KpiCard
            label="Average Goal Velocity"
            value={`${avgProgress}%`}
            trend={{ value: `${avgProgress}%`, label: "completion rate", isPositive: true }}
            icon={<TrendingUp className="w-5 h-5 text-[#1F8476]" />}
            accentColor="indigo"
          />
          <KpiCard
            label="Appraisals Calibrated"
            value={`${completedReviews} / ${appraisalReviews.length}`}
            trend={{ value: `${completedReviews}`, label: "completed", isPositive: true }}
            icon={<CheckCircle2 className="w-5 h-5 text-[#188038]" />}
            accentColor="emerald"
          />
          <KpiCard
            label="Top Performer Band"
            value={topPerformers}
            trend={{ value: `${topPerformers}`, label: "★ 4.5+ Rating", isPositive: true }}
            icon={<Award className="w-5 h-5 text-[#E69F00]" />}
            accentColor="amber"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW CONTENT                                                          */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: OKRs (Filtered by Role: Employee personal vs Manager team vs Admin)   */}
      {/* ------------------------------------------------------------------------- */}
      {(activeTab === "okrs" || activeTab === "my_okrs") && (
        <div className="space-y-4">
          {/* Controls toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE3EA] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">
                {isEmployee ? "My Personal Key Deliverables" : isManager ? "Team Objectives & Key Results" : "Pan-Organization Objectives"}
              </span>
              <span className="text-xs text-[#697586] hidden sm:inline">
                • Interactive progress updates &amp; measurable Key Results (KRs)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(isSuperAdmin || isHrAdmin) && (
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl font-semibold text-[#1B2430] focus:outline-none focus:border-[#1F8476]"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl font-semibold text-[#1B2430] focus:outline-none focus:border-[#1F8476]"
              >
                <option value="Q3 2026">Cycle: Q3 2026 (Active)</option>
                <option value="Q4 2026">Cycle: Q4 2026 (Upcoming)</option>
                <option value="Q2 2026">Cycle: Q2 2026 (Archived)</option>
              </select>
            </div>
          </div>

          {/* Goals List */}
          <div className="grid grid-cols-1 gap-4">
            {(isEmployee ? myGoals : isManager ? teamGoals : filteredGoals).length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs">
                <Target className="w-10 h-10 mx-auto text-[#1F8476] mb-3" />
                <h3 className="text-sm font-bold text-[#1B2430]">No Active Objectives Found</h3>
                <p className="text-xs text-[#697586] mt-1 max-w-sm mx-auto">
                  {isEmployee
                    ? "You haven't defined personal quarterly goals yet. Click 'New Personal OKR' to add your first milestone."
                    : "No objectives recorded for this cycle. Click 'Set Objective' to create a team deliverable."}
                </p>
              </div>
            ) : (
              (isEmployee ? myGoals : isManager ? teamGoals : filteredGoals).map((goal) => (
                <div
                  key={goal.id}
                  className="p-5 bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs hover:border-[#80B6A1] transition-all space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0F4F8] text-[#4B5D6B] border border-[#DDE3EA]">
                          {goal.departmentName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            goal.priority === "CRITICAL"
                              ? "bg-[#FCE8E6] text-[#C62828] border-[#FAD2CF]"
                              : goal.priority === "HIGH"
                              ? "bg-[#FEF7E0] text-[#1B2430] border-[#FEEFC3]"
                              : "bg-[#EBF7F5] text-[#1F8476] border-[#80B6A1]"
                          }`}
                        >
                          {goal.priority} PRIORITY
                        </span>
                        <span className="text-xs text-[#697586]">Due {formatDate(goal.dueDate)}</span>
                      </div>

                      <h3 className="text-sm font-bold text-[#1B2430]">{goal.title}</h3>
                    </div>

                    {/* Owner Badge */}
                    <div className="flex items-center gap-2.5 shrink-0 bg-[#F7F9FB] px-3 py-1.5 rounded-xl border border-[#DDE3EA]">
                      <img
                        src={goal.ownerAvatar}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <div className="text-xs font-semibold text-[#1B2430]">{goal.ownerName}</div>
                        <div className="text-[10px] text-[#697586]">Owner</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Quick Controls */}
                  <div className="space-y-1.5 pt-2 border-t border-[#DDE3EA]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#697586]">Deliverable Completion</span>
                      <span className="font-mono font-bold text-[#1B2430]">{goal.progressPercent}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#F0F4F8] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          goal.progressPercent >= 80
                            ? "bg-[#188038]"
                            : goal.progressPercent >= 50
                            ? "bg-[#1F8476]"
                            : "bg-[#E69F00]"
                        }`}
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>

                    {/* Quick Update Controls (For Owner, Manager, or Admin) */}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <span className="text-[10px] text-[#697586] mr-1">Adjust progress:</span>
                      <button
                        onClick={() => updateGoalProgress(goal.id, goal.progressPercent - 10)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-[#F0F4F8] hover:bg-[#DDE3EA] text-[#1B2430] rounded-lg border border-[#DDE3EA] transition-colors"
                      >
                        -10%
                      </button>
                      <button
                        onClick={() => updateGoalProgress(goal.id, goal.progressPercent + 10)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-[#EBF7F5] hover:bg-[#d5eee9] text-[#1F8476] rounded-lg border border-[#80B6A1] transition-colors"
                      >
                        +10%
                      </button>
                      <button
                        onClick={() => updateGoalProgress(goal.id, 100)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-[#E6F4EA] hover:bg-[#d0edd8] text-[#188038] rounded-lg border border-[#CEEAD6] transition-colors"
                      >
                        Mark 100%
                      </button>
                    </div>
                  </div>

                  {/* Key Results Breakdown */}
                  {goal.keyResults && goal.keyResults.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#DDE3EA]">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#697586]">
                        Measurable Key Results (KRs)
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {goal.keyResults.map((kr) => (
                          <div
                            key={kr.id}
                            className="p-2.5 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] text-xs flex items-center justify-between"
                          >
                            <span className="text-[#1B2430] font-medium truncate pr-2">
                              {kr.title}
                            </span>
                            <span className="font-mono font-bold text-[#1F8476] shrink-0">
                              {kr.current} / {kr.target} {kr.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: MY APPRAISAL (Employee Self-View & 360 Feedback)                      */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === "my_appraisal" && (
        <div className="space-y-6">
          {myAppraisal ? (
            <div className="bg-white rounded-2xl border border-[#DDE3EA] p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE3EA]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#1B2430]">
                      {myAppraisal.cycle}
                    </h2>
                    <Badge variant={myAppraisal.status === "COMPLETED" ? "success" : "warning"} size="sm">
                      {myAppraisal.status === "COMPLETED" ? "Evaluation Finalized" : "Pending Calibration"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#697586] mt-0.5">
                    Evaluated by: <strong className="text-[#1B2430]">{myAppraisal.reviewerName}</strong> • Date: {myAppraisal.submittedDate ? formatDate(myAppraisal.submittedDate) : "Current"}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelfEvalModalOpen(true)}
                  className="text-xs border-[#DDE3EA] hover:bg-[#F7F9FB] rounded-xl"
                  leftIcon={<Edit2 className="w-3.5 h-3.5 text-[#1F8476]" />}
                >
                  Edit Self Rating
                </Button>
              </div>

              {/* Rating Scorecards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F7F9FB] rounded-2xl border border-[#DDE3EA]">
                  <span className="text-xs font-semibold text-[#697586] block">Your Self-Evaluation</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-3xl font-bold text-[#1B2430] font-mono">
                      {myAppraisal.selfRating}
                    </span>
                    <div className="flex text-[#E69F00]">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i <= Math.round(myAppraisal.selfRating) ? "fill-[#E69F00]" : "text-[#DDE3EA]"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#697586] block mt-1">Submitted in self-appraisal dossier</span>
                </div>

                <div className="p-4 bg-[#EBF7F5] rounded-2xl border border-[#80B6A1]">
                  <span className="text-xs font-semibold text-[#1F8476] block">Manager Calibration Rating</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-3xl font-bold text-[#1F8476] font-mono">
                      {myAppraisal.managerRating > 0 ? myAppraisal.managerRating : "In Review"}
                    </span>
                    {myAppraisal.managerRating > 0 && (
                      <div className="flex text-[#188038]">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i <= Math.round(myAppraisal.managerRating) ? "fill-[#188038]" : "text-[#DDE3EA]"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-[#1F8476] block mt-1">
                    Calibrated by {myAppraisal.reviewerName}
                  </span>
                </div>
              </div>

              {/* Manager Feedback */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2430]">
                  Manager Review Feedback &amp; Development Goals
                </h4>
                <div className="p-4 bg-[#F7F9FB] rounded-2xl border border-[#DDE3EA] text-xs text-[#1B2430] leading-relaxed">
                  <p className="italic">
                    "{myAppraisal.feedback || "Your manager has not yet published written feedback remarks."}"
                  </p>
                </div>
              </div>

              {/* Career Path Next Steps */}
              <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF7F5] flex items-center justify-center text-[#1F8476]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1B2430]">Promotion &amp; Career Trajectory</h5>
                    <p className="text-[11px] text-[#697586]">
                      High rating band (≥ 4.5★) qualifies for bi-annual compensation revision &amp; senior leadership track.
                    </p>
                  </div>
                </div>
                <Badge variant="cyan" size="sm">
                  Eligible for Increment
                </Badge>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs">
              <Award className="w-10 h-10 mx-auto text-[#1F8476] mb-3" />
              <h3 className="text-sm font-bold text-[#1B2430]">No Appraisal Record On File</h3>
              <p className="text-xs text-[#697586] mt-1 max-w-sm mx-auto">
                The Annual Appraisal cycle for your profile has not commenced or is being provisioned by People Operations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: TEAM APPRAISALS (Manager Scoped Review & Rating of Direct Reports)    */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === "team_appraisals" && (
        <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#DDE3EA] flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#1B2430]">Direct Reports Performance Appraisals</h2>
              <p className="text-xs text-[#697586]">
                Review self-assessments, assign 1.0 to 5.0 star calibration ratings, and provide development feedback.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F0F4F8] border border-[#DDE3EA] text-[#1B2430]">
              Cycle: Annual Review 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                  <th className="py-3 px-4">Direct Report Member</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4 text-center">Self Rating</th>
                  <th className="py-3 px-4 text-center">Manager Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Feedback Summary</th>
                  <th className="py-3 px-4 text-right">Evaluation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EA]">
                {teamAppraisals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#697586]">
                      <Users className="w-8 h-8 mx-auto text-[#1F8476] mb-2" />
                      <p className="text-xs font-semibold text-[#1B2430]">No Direct Report Appraisals Found</p>
                      <p className="text-[11px] text-[#697586] mt-0.5">
                        Your direct reports' appraisal records will appear here once self-assessments are initiated.
                      </p>
                    </td>
                  </tr>
                ) : (
                  teamAppraisals.map((review) => (
                    <tr key={review.id} className="hover:bg-[#F7F9FB] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#1B2430]">
                        {review.employeeName}
                        <div className="text-[11px] font-mono text-[#697586] font-normal">
                          {review.employeeId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#697586]">{review.employeeDesignation}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-[#E69F00] bg-[#FEF7E0] px-2 py-0.5 rounded-md border border-[#FEEFC3]">
                          <Star className="w-3 h-3 fill-[#E69F00]" />
                          {review.selfRating}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {review.managerRating > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#188038] bg-[#E6F4EA] px-2 py-0.5 rounded-md border border-[#CEEAD6]">
                            <Star className="w-3 h-3 fill-[#188038]" />
                            {review.managerRating}
                          </span>
                        ) : (
                          <span className="text-[#E69F00] font-semibold text-[11px] bg-[#FEF7E0] px-2 py-0.5 rounded-md border border-[#FEEFC3]">
                            Pending Signoff
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={review.status === "COMPLETED" ? "success" : "warning"}
                          size="sm"
                        >
                          {review.status === "COMPLETED" ? "Completed" : "Awaiting Review"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#697586] max-w-xs truncate" title={review.feedback}>
                        {review.feedback || "Awaiting calibration review"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => openRatingModal(review)}
                          variant={review.status === "COMPLETED" ? "outline" : "primary"}
                          size="sm"
                          className={cn(
                            "h-7 text-xs font-semibold px-2.5 rounded-lg",
                            review.status === "COMPLETED"
                              ? "border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430]"
                              : "bg-[#1F8476] hover:bg-[#166C61] text-white shadow-2xs"
                          )}
                        >
                          {review.status === "COMPLETED" ? "Edit Rating" : "Evaluate & Rate"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB: ADMIN APPRAISAL CALIBRATION MATRIX                                   */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === "appraisals" && (
        <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#DDE3EA] flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#1B2430]">
                360° Appraisal Calibration Matrix &amp; Reviews
              </h2>
              <p className="text-xs text-[#697586]">
                Pan-organization reviews, manager rating scores, and talent band calibrations.
              </p>
            </div>
            <span className="text-xs font-semibold bg-[#F0F4F8] px-3 py-1 rounded-full border border-[#DDE3EA] text-[#1B2430]">
              Cycle: Annual Appraisal 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4 text-center">Self Rating</th>
                  <th className="py-3 px-4 text-center">Manager Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Feedback Summary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EA]">
                {appraisalReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#F7F9FB] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1B2430]">
                      {review.employeeName}
                      <div className="text-[10px] text-[#697586] font-normal">
                        {review.employeeDesignation}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#697586]">{review.department}</td>
                    <td className="py-3.5 px-4 text-[#1B2430] font-medium">{review.reviewerName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-[#E69F00] bg-[#FEF7E0] px-2 py-0.5 rounded border border-[#FEEFC3]">
                        <Star className="w-3 h-3 fill-[#E69F00]" />
                        {review.selfRating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {review.managerRating > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#188038] bg-[#E6F4EA] px-2 py-0.5 rounded border border-[#CEEAD6]">
                          <Star className="w-3 h-3 fill-[#188038]" />
                          {review.managerRating}
                        </span>
                      ) : (
                        <span className="text-[#697586] text-[11px] italic">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={review.status === "COMPLETED" ? "success" : "warning"}
                        size="sm"
                      >
                        {review.status === "COMPLETED" ? "Completed" : "In Review"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-[#697586] max-w-xs truncate" title={review.feedback}>
                      {review.feedback || "Awaiting calibration review"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => openRatingModal(review)}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430] rounded-lg"
                      >
                        {review.status === "COMPLETED" ? "Edit Rating" : "Calibrate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS & DIALOGS                                                       */}
      {/* ========================================================================= */}

      {/* MODAL 1: Create Objective / OKR */}
      <Modal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        title={isEmployee ? "Create Personal Objective (OKR)" : "Create New Objective (OKR)"}
        size="lg"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Objective Statement"
            placeholder="e.g. Architect & Ship Real-Time Biometric Punch Sync Engine"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department"
              value={newGoalDeptId}
              onChange={(e) => setNewGoalDeptId(e.target.value)}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />

            {!isEmployee ? (
              <Select
                label="Goal Owner"
                value={newGoalOwnerId}
                onChange={(e) => setNewGoalOwnerId(e.target.value)}
                options={
                  isManager
                    ? [
                        { value: currentEmployee?.id || "EMP-1003", label: `${currentEmployee?.firstName || "Rajesh"} ${currentEmployee?.lastName || "Kulkarni"} (Me)` },
                        ...directReports.map((dr) => ({
                          value: dr.id,
                          label: `${dr.firstName} ${dr.lastName} (${dr.employeeCode})`,
                        })),
                      ]
                    : employees.map((e) => ({
                        value: e.id,
                        label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
                      }))
                }
              />
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#1B2430] mb-1">Goal Owner</label>
                <div className="w-full h-9 px-3 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] flex items-center font-medium">
                  {currentEmployee?.firstName} {currentEmployee?.lastName} ({currentEmployee?.employeeCode})
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={newGoalPriority}
              onChange={(e) => setNewGoalPriority(e.target.value as GoalPriority)}
              options={[
                { value: "CRITICAL", label: "Critical" },
                { value: "HIGH", label: "High" },
                { value: "MEDIUM", label: "Medium" },
                { value: "LOW", label: "Low" },
              ]}
            />
            <Input
              label="Target Due Date"
              type="date"
              value={newGoalDueDate}
              onChange={(e) => setNewGoalDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#DDE3EA]">
            <label className="block text-xs font-bold text-[#1B2430]">
              Measurable Key Results (KRs)
            </label>
            <Input
              label="Key Result 1 (Required)"
              placeholder="e.g. Implement WebWorker offline queue with IndexedDB persistence"
              value={kr1Title}
              onChange={(e) => setKr1Title(e.target.value)}
              required
            />
            <Input
              label="Key Result 2 (Optional)"
              placeholder="e.g. Achieve 100% test coverage on biometric sync serializer"
              value={kr2Title}
              onChange={(e) => setKr2Title(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-[#DDE3EA] flex justify-end gap-2.5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsAddGoalModalOpen(false)}
              className="text-xs border-[#DDE3EA] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="text-xs bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
            >
              Save Objective
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Manager / Admin Evaluate Appraisal */}
      {selectedReviewForRating && (
        <Modal
          isOpen={!!selectedReviewForRating}
          onClose={() => setSelectedReviewForRating(null)}
          title={`Appraisal Evaluation: ${selectedReviewForRating.employeeName}`}
          size="md"
        >
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] text-xs space-y-1">
              <div>
                <span className="text-[#697586]">Employee: </span>
                <span className="font-bold text-[#1B2430]">{selectedReviewForRating.employeeName}</span> (
                {selectedReviewForRating.employeeDesignation})
              </div>
              <div>
                <span className="text-[#697586]">Department: </span>
                <span className="font-semibold text-[#1B2430]">{selectedReviewForRating.department}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[#697586]">Self Evaluation: </span>
                <span className="font-bold text-[#E69F00] flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-[#E69F00]" />
                  {selectedReviewForRating.selfRating} / 5.0
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2430] mb-1">
                Manager Rating Score (1.0 to 5.0 Stars)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={ratingInput}
                onChange={(e) => setRatingInput(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-[#DDE3EA] rounded-xl font-bold text-[#1B2430] focus:outline-none focus:border-[#1F8476]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2430] mb-1">
                Manager Performance Feedback &amp; Development Areas
              </label>
              <textarea
                rows={4}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Highlight key achievements, code quality, sprint ownership, and promotion readiness..."
                className="w-full text-xs p-2.5 border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:outline-none focus:border-[#1F8476] transition-all"
                required
              />
            </div>

            <div className="pt-3 border-t border-[#DDE3EA] flex justify-end gap-2.5">
              <Button
                variant="outline"
                type="button"
                onClick={() => setSelectedReviewForRating(null)}
                className="text-xs border-[#DDE3EA] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="text-xs bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
              >
                Finalize Appraisal
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Employee Self-Assessment */}
      <Modal
        isOpen={isSelfEvalModalOpen}
        onClose={() => setIsSelfEvalModalOpen(false)}
        title="Update Self-Appraisal Score &amp; Reflection"
        size="md"
      >
        <form onSubmit={handleSelfEvalSubmit} className="space-y-4">
          <p className="text-xs text-[#697586]">
            Submit your self-assessment score and key quarterly achievements for manager calibration.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Self Evaluation Score (1.0 to 5.0 Stars)
            </label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              value={selfRatingInput}
              onChange={(e) => setSelfRatingInput(Number(e.target.value))}
              className="w-full text-xs p-2.5 border border-[#DDE3EA] rounded-xl font-bold text-[#1B2430] focus:outline-none focus:border-[#1F8476]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Self-Reflection &amp; Key Highlights
            </label>
            <textarea
              rows={4}
              value={selfNotesInput}
              onChange={(e) => setSelfNotesInput(e.target.value)}
              placeholder="Highlight major project milestones delivered, technical challenges resolved, and goals achieved..."
              className="w-full text-xs p-2.5 border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:outline-none focus:border-[#1F8476] transition-all"
              required
            />
          </div>

          <div className="pt-3 border-t border-[#DDE3EA] flex justify-end gap-2.5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsSelfEvalModalOpen(false)}
              className="text-xs border-[#DDE3EA] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="text-xs bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
            >
              Submit Reflection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
