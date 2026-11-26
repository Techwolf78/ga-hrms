import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  CalendarCheck2,
  Receipt,
  Laptop,
  Users,
  Award,
  ArrowRight,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useAuth, DEMO_USERS } from "../../lib/authContext";
import { UserRole } from "../../types/hrms";
import { GaHrmsLogo } from "../../components/ui/GaHrmsLogo";

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();

  // Dynamic Scroll State for Glassmorphism Transparency
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLaunchRole = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    login(demo.email, role);
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-[#F7F9FB] text-[#032D42] flex flex-col font-sans selection:bg-[#62D84E] selection:text-[#032D42] overflow-x-hidden">
      {/* Ambient Mesh Gradient Glow (ServiceNow Aesthetic - Electric Lime & Enterprise Teal) */}
      <div
        className="absolute top-0 inset-x-0 h-[720px] pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* ServiceNow Signature Electric Lime Orb on the upper left */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-40px",
            width: "680px",
            height: "580px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 40%, rgba(98, 216, 78, 0.22) 0%, rgba(74, 222, 128, 0.12) 45%, rgba(98, 216, 78, 0) 70%)",
            filter: "blur(65px)",
            WebkitFilter: "blur(65px)",
            transform: "translate3d(0, 0, 0)",
          }}
        />

        {/* ServiceNow Enterprise Deep Teal & Luminous Cyan Orb on the upper right */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-20px",
            width: "720px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 40%, rgba(31, 132, 118, 0.26) 0%, rgba(20, 184, 166, 0.16) 45%, rgba(31, 132, 118, 0) 70%)",
            filter: "blur(70px)",
            WebkitFilter: "blur(70px)",
            transform: "translate3d(0, 0, 0)",
          }}
        />

        {/* ServiceNow Soft Mint & Sage Center Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "25%",
            width: "550px",
            height: "360px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(233, 245, 243, 0.85) 0%, rgba(128, 182, 161, 0.25) 50%, transparent 70%)",
            filter: "blur(50px)",
            WebkitFilter: "blur(50px)",
            transform: "translate3d(0, 0, 0)",
          }}
        />

        {/* Subtle Enterprise Technical Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#032D42 1px, transparent 1px), linear-gradient(to right, #032D42 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at 50% 30%, black 35%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 30%, black 35%, transparent 75%)",
          }}
        />
      </div>

      {/* Floating Detached Pill Navbar with Dynamic Mirror Glassmorphism Reflection */}
      <div className="sticky top-4 z-50 w-full px-4 sm:px-6 pointer-events-none flex flex-col items-center">
        <header
          className={`pointer-events-auto relative w-full max-w-5xl rounded-full border transition-colors duration-200 overflow-hidden ${
            scrolled
              ? "bg-white/80 backdrop-blur-md border-white/60 shadow-[0_8px_24px_0_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-black/[0.03]"
              : "bg-white/90 backdrop-blur-md border-white/80 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/[0.04]"
          }`}
        >
          {/* Optical Top Mirror Highlight (Glass Bevel Reflection) */}
          <div className="absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          <div className="px-5 sm:px-7 h-14 sm:h-15 flex items-center justify-between gap-4">
            {/* Brand Identity - Minimalist & Bold */}
            <Link
              to="/"
              className="flex items-center gap-2 select-none group shrink-0"
              id="header-brand-logo"
            >
              <GaHrmsLogo size="sm" variant="light" />
            </Link>

            {/* Center: Clean Negative Breathing Room */}
            <div className="flex-1" />

            {/* Right: Only Sign In Button (ServiceNow Pill Style) */}
            <div className="flex items-center shrink-0">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-[#62D84E] text-[#032D42] hover:bg-[#50C838] transition-all shadow-xs active:scale-95"
                  id="header-cta-dashboard"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#032D42]" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[#032D42] text-white hover:bg-[#08405C] transition-all shadow-xs active:scale-95"
                  id="header-btn-login"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </Link>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Area - ServiceNow Minimalist Enterprise Workspace */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
        {/* Modern Full-Bleed Hero Section */}
        <section className="relative rounded-3xl overflow-hidden min-h-[520px] sm:min-h-[580px] flex flex-col justify-between p-6 sm:p-10 border border-white/70 ring-1 ring-[#032D42]/10 shadow-[0_24px_64px_rgba(3,45,66,0.14)]">
          {/* Background Image & Subtle Dark Scrim */}
          <img
            src="/brand/hero-bg.jpg"
            alt="Gryphon Academy Campus"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70"
          />

          {/* Top Spacer */}
          <div className="relative z-10" />

          {/* Center: Oversized Editorial Typography */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] tracking-tight leading-[0.95] uppercase select-none drop-shadow-[0_6px_28px_rgba(0,0,0,0.38)]">
              <span className="block font-light tracking-[0.12em] text-white/95">
                GA
              </span>
              <span className="block font-extrabold bg-gradient-to-r from-white via-white to-[#A7F3D0] bg-clip-text text-transparent">
                HRMS
              </span>
            </h1>
          </div>

          {/* Bottom Row: Tagline + CTA on Left, Glassmorphic Stats Bar on Right */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-sm">
              <p className="text-sm sm:text-base text-white/90 font-normal leading-relaxed">
                Attendance check-ins, leave requests, monthly payslips, and
                workforce operations in one unified HRMS.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleLaunchRole("EMPLOYEE")}
                  className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#62D84E] text-[#032D42] hover:bg-[#50C838] shadow-[0_4px_16px_rgba(98,216,78,0.35)] transition-all active:scale-[0.98] inline-flex items-center gap-2"
                  id="hero-btn-primary"
                >
                  <span>Employee Portal</span>
                  <ArrowRight className="w-4 h-4 text-[#032D42]" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white/15 backdrop-blur-md text-white border border-white/30 hover:bg-white/25 transition-all active:scale-[0.98] inline-flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-white/80" />
                  <span>Sign In</span>
                </button>
              </div>
            </div>

            {/* Glassmorphic Stats Bar */}
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-6 py-4 grid grid-cols-3 gap-6 sm:gap-10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">100%</div>
                <div className="text-[11px] text-white/80 mt-0.5">Payroll accuracy</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">24/7</div>
                <div className="text-[11px] text-white/80 mt-0.5">Self-service portal</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">99.9%</div>
                <div className="text-[11px] text-white/80 mt-0.5">Attendance uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid - ServiceNow Enterprise Palette */}
        <section id="services" className="space-y-4">
          <div className="px-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
              Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Attendance */}
            <div className="bg-white border border-[#DDE3EA] rounded-3xl p-6 shadow-[0_2px_16px_rgba(3,45,66,0.03)] hover:shadow-[0_8px_24px_rgba(3,45,66,0.08)] hover:border-[#1F8476]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[#032D42] group-hover:text-[#62D84E] shadow-2xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#032D42] tracking-tight group-hover:text-[#1F8476] transition-colors">
                    Time &amp; Attendance
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B5D6B] leading-relaxed">
                    Daily clock-in/out tracking, shift hours, and missed punch
                    regularization with supervisor endorsement.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Attendance Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Leaves */}
            <div className="bg-white border border-[#DDE3EA] rounded-3xl p-6 shadow-[0_2px_16px_rgba(3,45,66,0.03)] hover:shadow-[0_8px_24px_rgba(3,45,66,0.08)] hover:border-[#1F8476]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[#032D42] group-hover:text-[#62D84E] shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#032D42] tracking-tight group-hover:text-[#1F8476] transition-colors">
                    Leave Management
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B5D6B] leading-relaxed">
                    Live balances for Paid, Casual, and Sick leaves. Submit
                    time-off requests and track manager sanction.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Apply for Leave</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: Payslips */}
            <div className="bg-white border border-[#DDE3EA] rounded-3xl p-6 shadow-[0_2px_16px_rgba(3,45,66,0.03)] hover:shadow-[0_8px_24px_rgba(3,45,66,0.08)] hover:border-[#1F8476]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[#032D42] group-hover:text-[#62D84E] shadow-2xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#032D42] tracking-tight group-hover:text-[#1F8476] transition-colors">
                    Payslips &amp; Tax Documents
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B5D6B] leading-relaxed">
                    Download monthly PDF salary statements, review UAN statutory
                    deductions, and access annual tax summaries.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Download Payslips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4: Assets */}
            <div className="bg-white border border-[#DDE3EA] rounded-3xl p-6 shadow-[0_2px_16px_rgba(3,45,66,0.03)] hover:shadow-[0_8px_24px_rgba(3,45,66,0.08)] hover:border-[#1F8476]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[#032D42] group-hover:text-[#62D84E] shadow-2xs">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#032D42] tracking-tight group-hover:text-[#1F8476] transition-colors">
                    Hardware &amp; Workstations
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B5D6B] leading-relaxed">
                    Review assigned laptop models, serial numbers, warranty
                    terms, and submit IT equipment repair requests.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Assigned Assets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 5: Directory */}
            <div className="bg-white border border-[#DDE3EA] rounded-3xl p-6 shadow-[0_2px_16px_rgba(3,45,66,0.03)] hover:shadow-[0_8px_24px_rgba(3,45,66,0.08)] hover:border-[#1F8476]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[#032D42] group-hover:text-[#62D84E] shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#032D42] tracking-tight group-hover:text-[#1F8476] transition-colors">
                    Colleague Directory
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B5D6B] leading-relaxed">
                    Look up teammates, designations, reporting leads, and branch
                    locations while personal data remains protected.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Search Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 6: Performance */}
            <div className="bg-white border border-[#DDE3EA] rounded-3xl p-6 shadow-[0_2px_16px_rgba(3,45,66,0.03)] hover:shadow-[0_8px_24px_rgba(3,45,66,0.08)] hover:border-[#1F8476]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[#032D42] group-hover:text-[#62D84E] shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#032D42] tracking-tight group-hover:text-[#1F8476] transition-colors">
                    Goals &amp; Appraisals
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B5D6B] leading-relaxed">
                    Track quarterly OKRs, log key results progress, and submit
                    self-reviews during performance appraisal cycles.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Open Goals Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-[#DDE3EA] bg-[#F7F9FB] py-6 text-xs text-[#697586] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#697586]">
          <div className="flex items-center gap-2">
            <GaHrmsLogo size="xs" variant="light" />
            <span>
              © {new Date().getFullYear()} GA-HRMS. All rights reserved.
            </span>
          </div>
          <div>
            <span>Baner, Pune 411045</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
