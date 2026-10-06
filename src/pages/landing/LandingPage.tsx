import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  Users,
  Coins,
  Clock,
  Calendar,
  ChevronDown,
  Lock,
  Receipt,
  Scale,
  Fingerprint,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { useAuth, DEMO_USERS } from "../../lib/authContext";
import { UserRole } from "../../types/hrms";
import { formatINR } from "../../lib/utils";
import { GaHrmsLogo } from "../../components/ui/GaHrmsLogo";

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();

  // Interactive Live Salary Simulator State (Hero feature)
  const [calcGross, setCalcGross] = useState<number>(65000);
  const [capPfCeiling, setCapPfCeiling] = useState<boolean>(true);
  const [calcState, setCalcState] = useState<"MH" | "KA" | "DL">("MH");

  // Interactive Persona Cockpit State
  const [activePersona, setActivePersona] = useState<UserRole>("HR_ADMIN");

  // Punch Simulator State
  const [punchState, setPunchState] = useState<"OUT" | "IN">("IN");
  const [punchTime, setPunchTime] = useState<string>("09:14 AM");

  // FAQ Accordion - all closed by default
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Calculations for Statutory Engine Simulator
  const basicSalary = Math.round(calcGross * 0.5);
  const hra = Math.round(basicSalary * 0.4);
  const specialAllowance = Math.max(0, calcGross - basicSalary - hra);

  // PF Calculation: 12% of basic. If capped, cap basic at 15,000 -> max 1,800
  const pfApplicableWage = capPfCeiling ? Math.min(basicSalary, 15000) : basicSalary;
  const employeePf = Math.round(pfApplicableWage * 0.12);

  // ESIC: Applicable only if gross <= 21,000
  const isEsicApplicable = calcGross <= 21000;
  const employeeEsic = isEsicApplicable ? Math.round(calcGross * 0.0075) : 0;

  // Professional Tax: standard slabs (e.g. MH = 200, DL = 0, KA = 200)
  const pt = calcState === "DL" ? 0 : 200;

  // Estimated TDS (simple progressive approximation)
  const annualized = calcGross * 12;
  let estimatedTds = 0;
  if (annualized > 700000) {
    estimatedTds = Math.round(((annualized - 700000) * 0.1) / 12);
  }

  const totalDeductions = employeePf + employeeEsic + pt + estimatedTds;
  const netTakeHome = Math.max(0, calcGross - totalDeductions);

  const handleLaunchRole = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    login(demo.email, role);
    navigate("/dashboard");
  };

  const personas = [
    {
      role: "SUPER_ADMIN" as UserRole,
      title: "Super Admin",
      pill: "Enterprise Governance",
      headline: "Multi-branch rule enforcement & statutory toggles",
      description:
        "Define company-wide statutory rules (PF wage ceilings, ESIC eligibility, grace period thresholds), manage administrative credentials, and inspect immutable audit logs with real-time actor and IP tracking.",
      highlights: [
        "Global statutory toggles (EPF, ESIC, PT, TDS)",
        "Granular Role-Based Access Control (RBAC)",
        "System-wide immutable audit trail",
        "Company legal entity profile & branch configurations",
      ],
      badge: "Governance Cockpit",
      actionLabel: "Launch as Super Admin",
    },
    {
      role: "HR_ADMIN" as UserRole,
      title: "HR Manager",
      pill: "Daily Operations",
      headline: "1-Click multi-tier payroll & employee directory",
      description:
        "Manage the complete employee lifecycle from digital onboarding to final settlement. Automatically reconcile biometric attendance, resolve loss-of-pay (LOP) deductions, and disburse payslips in under 3 minutes.",
      highlights: [
        "360° Employee directory & KYC document vault",
        "Biometric attendance regularizations & shift rosters",
        "Automated LOP sync with monthly payroll runs",
        "Encrypted PDF payslip batch generation",
      ],
      badge: "Operations Command",
      actionLabel: "Launch as HR Manager",
    },
    {
      role: "MANAGER" as UserRole,
      title: "Team Manager",
      pill: "Team Leadership",
      headline: "Rapid team approvals & roster oversight",
      description:
        "Department heads get clear visibility into who is in the office, who is working remotely, and who is on leave. Approve leave requests and overtime adjustments with a single click.",
      highlights: [
        "Real-time department attendance & shift roster view",
        "Multi-tier leave application approval hierarchy",
        "Attendance regularization review & endorsement",
        "Department headcount & skill profile view",
      ],
      badge: "Supervisor Hub",
      actionLabel: "Launch as Team Manager",
    },
    {
      role: "EMPLOYEE" as UserRole,
      title: "Employee (ESS)",
      pill: "Self-Service",
      headline: "Frictionless web punch, leaves & payslip vault",
      description:
        "Empower employees with self-service capabilities. Mark daily attendance with geo/timestamp verification, track leave quota balances in real-time, and download confidential tax-ready payslips.",
      highlights: [
        "Web punch-in / punch-out with timestamp logs",
        "Live leave balance tracker & holiday calendar",
        "Confidential payslip viewer & PDF download",
        "Personal profile & document upload vault",
      ],
      badge: "Employee Self-Service",
      actionLabel: "Launch as Employee",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 selection:bg-gray-950 selection:text-white flex flex-col font-sans">
      {/* Minimalist Crisp Header (Stripe / Apple style) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <GaHrmsLogo size="md" variant="light" />
          </Link>

          {/* Nav Links: Sentence-case, generous breathing room */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-600">
            <a href="#simulator" className="hover:text-gray-950 transition-colors">
              Simulator
            </a>
            <a href="#pipeline" className="hover:text-gray-950 transition-colors">
              Payroll Pipeline
            </a>
            <a href="#cockpit" className="hover:text-gray-950 transition-colors">
              Role Personas
            </a>
            <a href="#matrix" className="hover:text-gray-950 transition-colors">
              Compliance
            </a>
            <a href="#faqs" className="hover:text-gray-950 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Actions: Subtle Sign In + Sleek Pill CTA */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-gray-950 text-white hover:bg-black transition-all shadow-2xs"
                id="header-cta-dashboard"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] font-medium text-gray-600 hover:text-gray-950 transition-colors px-2 py-1"
                  id="header-btn-login"
                >
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={() => handleLaunchRole("HR_ADMIN")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-gray-950 text-white hover:bg-black hover:shadow-xs transition-all active:scale-[0.98]"
                  id="header-btn-launch"
                >
                  <span>Live Demo</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden border-b border-gray-200/70 bg-white">
        {/* Subtle engineering grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#F1F3F5_1px,transparent_1px),linear-gradient(to_bottom,#F1F3F5_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Editorial Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Category indicator pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-gray-900">
                  Statutory Payroll & People OS
                </span>
                <span className="text-gray-300">/</span>
                <span className="text-xs text-gray-500 font-normal">Built for India</span>
              </div>

              {/* Bold Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.1]">
                The payroll engine you don’t have to audit twice.
              </h1>

              {/* Detailed Subtitle */}
              <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed font-normal">
                Replace fragmented spreadsheets and disconnected biometric devices. GA-HRMS unifies
                multi-tier attendance normalization, PF 12% statutory caps, ESIC eligibility, and
                monthly payslip dispatch in a single deterministic pipeline.
              </p>

              {/* Persona Quick Action Bar */}
              <div className="pt-2 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Select a live demo persona to test:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { role: "SUPER_ADMIN" as UserRole, label: "Super Admin", sub: "Governance" },
                    { role: "HR_ADMIN" as UserRole, label: "HR Manager", sub: "Operations" },
                    { role: "MANAGER" as UserRole, label: "Team Lead", sub: "Approvals" },
                    { role: "EMPLOYEE" as UserRole, label: "Employee", sub: "Self-Service" },
                  ].map((btn) => (
                    <button
                      key={btn.role}
                      type="button"
                      onClick={() => handleLaunchRole(btn.role)}
                      className="p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-900 hover:shadow-xs text-left transition-all group flex flex-col justify-between"
                    >
                      <span className="text-[11px] text-gray-500 font-normal">{btn.sub}</span>
                      <span className="text-xs font-bold text-gray-900 group-hover:text-black flex items-center justify-between mt-1">
                        {btn.label} <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification checklist badges */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  EPF 12% Wage Ceiling Logic
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  Auto ESIC ₹21,000 Threshold
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  LOP Leave Synchronization
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  Zero-Config Local Sandbox
                </span>
              </div>
            </div>

            {/* Right Column: Live Interactive Indian Statutory Simulator */}
            <div id="simulator" className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 space-y-6 relative overflow-hidden">
                {/* Simulator Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-950">
                        Indian Statutory Calculator
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Live Deterministic Engine
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    REAL-TIME
                  </span>
                </div>

                {/* Gross Salary Interactive Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-800">
                      Monthly Gross CTC / Salary
                    </label>
                    <span className="text-base font-extrabold text-gray-950 font-mono">
                      {formatINR(calcGross)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={12000}
                    max={250000}
                    step={1000}
                    value={calcGross}
                    onChange={(e) => setCalcGross(Number(e.target.value))}
                    className="w-full accent-gray-950 cursor-pointer h-2 bg-gray-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>₹12,000 (ESIC)</span>
                    <span>₹65,000 (Mid-level)</span>
                    <span>₹2,50,000 (Executive)</span>
                  </div>
                </div>

                {/* State & PF Rule Toggles */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 block mb-1">
                      Professional Tax State
                    </label>
                    <select
                      value={calcState}
                      onChange={(e) => setCalcState(e.target.value as "MH" | "KA" | "DL")}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-gray-950 text-gray-900"
                    >
                      <option value="MH">Maharashtra (₹200)</option>
                      <option value="KA">Karnataka (₹200)</option>
                      <option value="DL">Delhi (₹0 Exempt)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-gray-600 block mb-1">
                      EPF Statutory Ceiling
                    </label>
                    <button
                      type="button"
                      onClick={() => setCapPfCeiling(!capPfCeiling)}
                      className={`w-full text-xs font-semibold border rounded-lg px-2.5 py-2 transition-all text-left flex items-center justify-between ${
                        capPfCeiling
                          ? "bg-gray-100 border-gray-300 text-gray-950"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                    >
                      <span>{capPfCeiling ? "Cap ₹15k Basic" : "Actual 12%"}</span>
                      <span className="text-[10px] font-bold text-gray-700">
                        {capPfCeiling ? "₹1,800 max" : "Full"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Breakdown Table */}
                <div className="space-y-2 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/70 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-600">Basic + DA (50%)</span>
                    <span className="font-mono font-semibold text-gray-900">{formatINR(basicSalary)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-600">HRA Allowance (40%)</span>
                    <span className="font-mono font-semibold text-gray-900">{formatINR(hra)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-600">Special Allowance</span>
                    <span className="font-mono font-semibold text-gray-900">{formatINR(specialAllowance)}</span>
                  </div>

                  {/* Deductions */}
                  <div className="pt-1.5 space-y-1">
                    <div className="flex justify-between text-rose-700">
                      <span>Employee EPF (12%)</span>
                      <span className="font-mono font-semibold">- {formatINR(employeePf)}</span>
                    </div>
                    <div className="flex justify-between text-rose-700">
                      <span>
                        ESIC (0.75%){" "}
                        {!isEsicApplicable && (
                          <span className="text-[10px] text-gray-500">(Exempt &gt; ₹21k)</span>
                        )}
                      </span>
                      <span className="font-mono font-semibold">- {formatINR(employeeEsic)}</span>
                    </div>
                    <div className="flex justify-between text-rose-700">
                      <span>Professional Tax (PT)</span>
                      <span className="font-mono font-semibold">- {formatINR(pt)}</span>
                    </div>
                    {estimatedTds > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Estimated TDS (Income Tax)</span>
                        <span className="font-mono font-semibold">- {formatINR(estimatedTds)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Net Take-Home Highlight Card: Sleek Charcoal/Black Card */}
                <div className="p-4 rounded-xl bg-gray-950 text-white flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      Monthly In-Hand (Net Pay)
                    </p>
                    <p className="text-2xl font-black text-white font-mono mt-0.5">
                      {formatINR(netTakeHome)}
                    </p>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => handleLaunchRole("HR_ADMIN")}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-950 hover:bg-gray-100 transition-colors shadow-2xs"
                    >
                      Run Payroll Cycle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: End-to-End Execution Pipeline */}
      <section id="pipeline" className="py-16 sm:py-20 bg-[#FAFAFA] border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 text-gray-900 text-xs font-medium border border-gray-200">
              System Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
              A deterministic 4-stage pipeline from biometric punch to statutory payout.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Most HR platforms treat attendance and payroll as separate databases. In GA-HRMS,
              every biometric log, leave approval, and shift rule feeds directly into the monthly payroll engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Biometric & Attendance Normalization",
                tag: "Real-Time Ingestion",
                icon: Fingerprint,
                desc: "Face/fingerprint logs sync through webhook pushes. Shifts with 15m grace periods and late penalties are applied automatically.",
                bullet: "Grace period & overtime math",
              },
              {
                step: "02",
                title: "Leave Hierarchy & LOP Sync",
                tag: "Multi-Tier Approval",
                icon: Calendar,
                desc: "Sandwich leave policies, unapproved absences, and exhausted quota days automatically calculate daily Loss-Of-Pay deductions.",
                bullet: "Instant supervisor endorsement",
              },
              {
                step: "03",
                title: "Statutory Indian Deductions",
                tag: "Automated Compliance",
                icon: Scale,
                desc: "Deterministic rules calculate EPF (with ₹15k cap), ESIC gross wage verification, State PT slabs, and Regime-based TDS.",
                bullet: "Zero-Excel formula errors",
              },
              {
                step: "04",
                title: "1-Click Disbursal & Payslip Vault",
                tag: "Batch Dispatch",
                icon: Receipt,
                desc: "Audit approval locks the payroll run. Employees instantly receive confidential, digitally formatted payslips in their ESS vault.",
                bullet: "Bank payout text & Form 16 ready",
              },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-gray-200 bg-white flex flex-col justify-between hover:border-gray-900 hover:shadow-xs transition-all duration-200 space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-gray-950">
                        {p.step}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 font-medium">
                        {p.tag}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-950">{p.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100 text-[11px] font-medium text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.bullet}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: The Interactive Persona Cockpit */}
      <section id="cockpit" className="py-16 sm:py-20 bg-white border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Multi-Role Governance
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                Built for everyone from C-suite to new hires.
              </h2>
              <p className="text-sm text-gray-600">
                Select a persona to explore the dedicated controls and workflows configured for that user.
              </p>
            </div>

            {/* Persona Switcher Tabs - Minimalist Slate Pills */}
            <div className="flex flex-wrap p-1.5 bg-gray-100 rounded-xl gap-1 border border-gray-200/60">
              {personas.map((p) => {
                const isSelected = activePersona === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => setActivePersona(p.role)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-gray-950 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-950 hover:bg-white/60"
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Persona Showcase Frame */}
          {(() => {
            const current = personas.find((p) => p.role === activePersona) || personas[0];
            return (
              <div className="bg-[#FAFAFA] rounded-3xl border border-gray-200 shadow-xs p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Persona Details */}
                <div className="lg:col-span-6 space-y-6 text-left">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {current.pill}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
                      {current.headline}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed pt-1">
                      {current.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {current.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-gray-800">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleLaunchRole(current.role)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-950 text-white hover:bg-black transition-all shadow-xs active:scale-[0.98]"
                    >
                      <span>{current.actionLabel}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-xs text-gray-500 font-medium">
                      Instant 1-click sandbox access
                    </span>
                  </div>
                </div>

                {/* Right Persona Live Mockup Box */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-gray-900">
                        {current.badge}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-normal">
                      {DEMO_USERS[current.role].email}
                    </span>
                  </div>

                  {/* Contextual preview widget based on persona */}
                  {current.role === "EMPLOYEE" ? (
                    <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">Daily Attendance Web Punch</p>
                          <p className="text-[11px] text-gray-500">Shift: General (09:00 - 18:00)</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          punchState === "IN" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-700"
                        }`}>
                          {punchState === "IN" ? "Currently Clocked In" : "Clocked Out"}
                        </span>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-900" />
                          <div>
                            <p className="text-xs font-mono font-bold text-gray-950">First In: {punchTime}</p>
                            <p className="text-[10px] text-emerald-700 font-medium">Within 15m Grace Period</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (punchState === "IN") {
                              setPunchState("OUT");
                            } else {
                              setPunchState("IN");
                              setPunchTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gray-950 text-white hover:bg-black transition-colors shadow-2xs"
                        >
                          {punchState === "IN" ? "Punch Out" : "Punch In"}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                          <p className="text-gray-500 text-[10px]">Paid Leave</p>
                          <p className="font-bold text-gray-950 text-sm">14 Days</p>
                        </div>
                        <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                          <p className="text-gray-500 text-[10px]">Casual Leave</p>
                          <p className="font-bold text-gray-950 text-sm">6 Days</p>
                        </div>
                        <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                          <p className="text-gray-500 text-[10px]">Sick Leave</p>
                          <p className="font-bold text-gray-950 text-sm">8 Days</p>
                        </div>
                      </div>
                    </div>
                  ) : current.role === "MANAGER" ? (
                    <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-950">Pending Team Requests (Engineering)</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          1 ACTION REQUIRED
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between shadow-2xs">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-gray-900">Rahul Sharma (Frontend SDE-II)</p>
                          <p className="text-[11px] text-gray-600">Casual Leave • Oct 14 - Oct 15 (2 days)</p>
                          <p className="text-[10px] text-gray-400 italic">"Attending family wedding"</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => alert("Simulated: Approved Rahul's leave")}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-gray-200 rounded-xl text-xs flex justify-between items-center text-gray-800">
                        <span>Team Today: 18 / 19 Present (94.7%)</span>
                        <span className="font-bold text-gray-950">View Shift Grid →</span>
                      </div>
                    </div>
                  ) : current.role === "HR_ADMIN" ? (
                    <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-950">Monthly Payroll Run Status</p>
                          <p className="text-[11px] text-gray-500">Cycle: September 2026 (30 Days)</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          READY TO DISBURSE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white border border-gray-200 rounded-xl">
                          <p className="text-[10px] text-gray-500">Headcount In Run</p>
                          <p className="text-base font-black text-gray-950">148 Employees</p>
                        </div>
                        <div className="p-3 bg-white border border-gray-200 rounded-xl">
                          <p className="text-[10px] text-gray-500">Net Disbursal Total</p>
                          <p className="text-base font-black text-emerald-700">₹ 84,32,500</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                        <span>0 Statutory Mismatches Detected</span>
                        <span className="font-bold">PF / ESIC Reconciled ✓</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-950">Global Statutory & Organization Toggles</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
                          <span className="text-gray-700">EPF 12% Ceiling Cap Enforced</span>
                          <span className="font-mono font-bold text-emerald-600">ENABLED</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
                          <span className="text-gray-700">ESIC Gross Threshold (₹21k)</span>
                          <span className="font-mono font-bold text-emerald-600">AUTO-APPLY</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
                          <span className="text-gray-700">Audit Trail IP & Actor Logging</span>
                          <span className="font-mono font-bold text-gray-700">IMMUTABLE</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-gray-400">
                      Full working prototype running locally in browser memory.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Section 4: Indian Statutory Compliance Matrix */}
      <section id="matrix" className="py-16 sm:py-20 bg-[#FAFAFA] border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Legal Rulebook
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
              Pre-wired for the complexities of Indian labor laws.
            </h2>
            <p className="text-sm text-gray-600">
              Statutory calculation guidelines vary across central schemes and individual states.
              GA-HRMS codifies every statutory rule into bulletproof logic.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                  <th className="p-4">Statutory Scheme</th>
                  <th className="p-4">Governing Mandate</th>
                  <th className="p-4">Calculation Formula</th>
                  <th className="p-4">Statutory Ceiling / Exemption</th>
                  <th className="p-4">GA-HRMS Engine Automation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 font-bold text-gray-950">Employee Provident Fund (EPF)</td>
                  <td className="p-4 text-gray-600">Employees' Provident Funds Act, 1952</td>
                  <td className="p-4 font-mono text-gray-800">12% Employee + 12% Employer on Basic + DA</td>
                  <td className="p-4 text-gray-600">Capped at ₹15,000 monthly wage ceiling (₹1,800/mo cap toggle)</td>
                  <td className="p-4 font-semibold text-emerald-700">Auto-capped or actual wage option</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 font-bold text-gray-950">Employee State Insurance (ESIC)</td>
                  <td className="p-4 text-gray-600">ESI Act, 1948</td>
                  <td className="p-4 font-mono text-gray-800">0.75% Employee + 3.25% Employer on Gross Wage</td>
                  <td className="p-4 text-gray-600">Applicable only if Gross Salary is &lt;= ₹21,000/mo</td>
                  <td className="p-4 font-semibold text-emerald-700">Automatic cutoff switch</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 font-bold text-gray-950">Professional Tax (PT)</td>
                  <td className="p-4 text-gray-600">State Municipal Acts (MH, KA, TS, TN)</td>
                  <td className="p-4 font-mono text-gray-800">State-wise tiered slabs (e.g., ₹200/mo in MH)</td>
                  <td className="p-4 text-gray-600">Exempt in states like Delhi, Haryana; variable in others</td>
                  <td className="p-4 font-semibold text-emerald-700">Branch address-based auto selection</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 font-bold text-gray-950">TDS on Salaries</td>
                  <td className="p-4 text-gray-600">Income Tax Act, 1961 (Sec 192)</td>
                  <td className="p-4 font-mono text-gray-800">Progressive tax slabs (New vs Old regime)</td>
                  <td className="p-4 text-gray-600">Rebate u/s 87A up to ₹7,00,000 in New Tax Regime</td>
                  <td className="p-4 font-semibold text-emerald-700">Form 16 readiness & monthly deduction</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 font-bold text-gray-950">Loss of Pay (LOP)</td>
                  <td className="p-4 text-gray-600">Factories Act & Model Standing Orders</td>
                  <td className="p-4 font-mono text-gray-800">Gross / Working Days * Unapproved Absent Days</td>
                  <td className="p-4 text-gray-600">Linked to biometric punch & unapproved leave balance</td>
                  <td className="p-4 font-semibold text-emerald-700">1-click sync into monthly run</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5: FAQs */}
      <section id="faqs" className="py-16 bg-white border-b border-gray-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Clear Answers
            </span>
            <h2 className="text-3xl font-black text-gray-950 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does the live demo work without requiring a signup or backend?",
                a: "GA-HRMS comes with an embedded, complete in-browser persistence layer using LocalStorage. We pre-populate realistic corporate records (148 employees, departments, historical attendance, and payroll records) across 4 role personas. Any modifications you make (adding an employee, approving leaves, running payroll) are preserved safely in your browser.",
              },
              {
                q: "Can I customize the salary component structure for our organization?",
                a: "Yes. The Payroll module includes customizable salary templates where you can configure Basic, HRA, Dearness Allowance, Special Allowances, and custom reimbursement heads alongside statutory EPF and ESIC rules.",
              },
              {
                q: "How does GA-HRMS handle biometric punch regularization?",
                a: "Employees can submit regularization requests directly through their ESS portal specifying the date, missing punch time, and reason (e.g. client visit or biometric scanner failure). Managers receive immediate notifications to approve or decline the adjustment.",
              },
              {
                q: "Are payslips compliant with Indian corporate requirements?",
                a: "Yes. Generated payslips feature company logo, PAN, TAN, employee UAN, PF number, ESIC IP number, bank account details, and a clear side-by-side breakdown of earnings and statutory deductions.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-900">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-gray-900" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: Launch CTA Banner with High-Contrast Minimalist Buttons */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gray-950 p-8 sm:p-12 text-white text-center space-y-6 shadow-sm relative overflow-hidden border border-gray-800">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
            100% Client-Side Sandbox Ready
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight text-white">
            Take full control of your workforce & payroll operations today.
          </h2>

          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            Instant operational access. Explore the Super Admin governance hub, HR manager payroll runs, or the employee self-service portal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {/* Primary Action: High-Contrast Crisp White Pill */}
            <button
              type="button"
              onClick={() => handleLaunchRole("SUPER_ADMIN")}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-bold text-gray-950 bg-white hover:bg-gray-100 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              id="cta-bottom-superadmin"
            >
              <span>Enter as Super Admin (Full Access)</span>
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>

            {/* Secondary Action: Translucent Frosted Glass Pill */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all shadow-2xs flex items-center justify-center gap-2"
              id="cta-bottom-login"
            >
              <span>Go to Login Page</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer: Structured & Professional */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-10 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <Link to="/" className="inline-flex items-center group">
                <GaHrmsLogo size="md" variant="light" showSubtitle subtitleText="Enterprise OS" />
              </Link>
              <p className="text-gray-500 text-xs max-w-sm leading-relaxed">
                The modern standard for enterprise workforce management, biometric attendance,
                and Indian statutory payroll automation.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-900">Platform Modules</p>
              <ul className="space-y-1.5 text-gray-600">
                <li><Link to="/login" className="hover:text-gray-950">Employee Directory (360°)</Link></li>
                <li><Link to="/login" className="hover:text-gray-950">Biometric Attendance & Shifts</Link></li>
                <li><Link to="/login" className="hover:text-gray-950">Multi-Tier Leave Hierarchy</Link></li>
                <li><Link to="/login" className="hover:text-gray-950">Indian Statutory Payroll (PF/ESIC)</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-900">Compliance & Security</p>
              <ul className="space-y-1.5 text-gray-600">
                <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-600" /> ISO 27001 Ready</li>
                <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-600" /> SOC-2 Type II Certified</li>
                <li className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-emerald-600" /> Indian IT Act 2000 Compliant</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} GA Enterprise Workforce Solutions. All rights reserved.</p>
            <p className="text-gray-400">Built for Indian Enterprises • Deterministic Payroll Engine</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
