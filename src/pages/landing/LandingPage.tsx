import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Lock,
  Sun,
  CloudRain,
} from "lucide-react";
import { useAuth, DEMO_USERS } from "../../lib/authContext";
import { UserRole } from "../../types/hrms";
import { GaHrmsLogo } from "../../components/ui/GaHrmsLogo";
import { WaterRippleHero } from "../../components/ui/WaterRippleHero";

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();

  // Dynamic Scroll State for Glassmorphism Transparency
  const [scrolled, setScrolled] = useState(false);
  const [weather, setWeather] = useState<"SUNNY" | "RAINY">("SUNNY");

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
    <div className="relative min-h-screen bg-[#F7F8FA] text-[#111312] flex flex-col font-sans selection:bg-[#A3E635] selection:text-[#111312] overflow-x-hidden">
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
              "radial-gradient(circle at 40% 40%, rgba(163, 230, 53, 0.22) 0%, rgba(74, 222, 128, 0.12) 45%, rgba(163, 230, 53, 0) 70%)",
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
              "radial-gradient(circle at 50% 40%, rgba(190, 242, 100, 0.26) 0%, rgba(20, 184, 166, 0.16) 45%, rgba(190, 242, 100, 0) 70%)",
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
            backgroundImage: `linear-gradient(#111312 1px, transparent 1px), linear-gradient(to right, #111312 1px, transparent 1px)`,
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-[#A3E635] text-[#111312] hover:bg-[#BEF264] transition-all shadow-xs active:scale-95"
                  id="header-cta-dashboard"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#111312]" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[#111312] text-white hover:bg-[#232725] transition-all shadow-xs active:scale-95"
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
        {/* Modern Full-Bleed Hero Section with Interactive WebGL Water Reflection */}
        <section className="relative rounded-3xl overflow-hidden min-h-[520px] sm:min-h-[580px] flex flex-col justify-between p-6 sm:p-10 border border-white/70 ring-1 ring-[#111312]/10 shadow-[0_24px_64px_rgba(17,19,18,0.14)]">
          {/* Interactive WebGL Canvas (ripples strictly masked to the reflecting pool) */}
          <WaterRippleHero
            src={weather === "RAINY" ? "/brand/hero-bg-rainy.jpg" : "/brand/hero-bg.jpg"}
            alt="Gryphon Academy Campus"
            weatherMode={weather}
            className="absolute inset-0 w-full h-full"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/65 pointer-events-none"
          />

          {/* Top-Right Weather Toggle (Sunny / Rainy) */}
          <div className="relative z-10 flex justify-end pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center p-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-sm">
              <button
                type="button"
                onClick={() => setWeather("SUNNY")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  weather === "SUNNY"
                    ? "bg-[#A3E635] text-[#111312] shadow-xs"
                    : "text-white/80 hover:text-white"
                }`}
                title="Sunny Sky"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Sunny</span>
              </button>
              <button
                type="button"
                onClick={() => setWeather("RAINY")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  weather === "RAINY"
                    ? "bg-[#111312] text-[#A3E635] border border-white/15 shadow-xs"
                    : "text-white/80 hover:text-white"
                }`}
                title="Rainy Clouds & Raindrops"
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Rainy</span>
              </button>
            </div>
          </div>

          {/* Center: Oversized Editorial Typography */}
          <div className="relative z-10 my-auto py-8 pointer-events-none">
            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] tracking-tight leading-[0.95] uppercase select-none drop-shadow-[0_6px_28px_rgba(0,0,0,0.38)]">
              <span className="block font-light tracking-[0.12em] text-white/95">
                GA
              </span>
              <span className="block font-extrabold bg-gradient-to-r from-white via-white to-[#BEF264] bg-clip-text text-transparent">
                HRMS
              </span>
            </h1>
          </div>

          {/* Bottom Row: Tagline + CTA on Left, Glassmorphic Stats Bar on Right */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pointer-events-none">
            <div className="space-y-4 max-w-sm pointer-events-auto">
              <p className="text-sm sm:text-base text-white/90 font-normal leading-relaxed">
                Attendance check-ins, leave requests, monthly payslips, and
                workforce operations in one unified HRMS.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleLaunchRole("EMPLOYEE")}
                  className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#A3E635] text-[#111312] hover:bg-[#BEF264] shadow-[0_4px_16px_rgba(163,230,53,0.35)] transition-all active:scale-[0.98] inline-flex items-center gap-2"
                  id="hero-btn-primary"
                >
                  <span>Employee Portal</span>
                  <ArrowRight className="w-4 h-4 text-[#111312]" />
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
          </div>
        </section>

        {/* Services Grid - ServiceNow Enterprise Palette */}
        <section id="services" className="space-y-4">
          <div className="px-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#111312] tracking-tight">
              Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Time & Attendance */}
            <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] hover:border-[#111312]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-20 w-28 flex items-center justify-start transition-transform duration-300 group-hover:scale-105 origin-left">
                  <img
                    src="/illustrations/time-attendance.svg"
                    alt="Time & Attendance illustration"
                    className="h-full w-full object-contain object-left"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#111312] tracking-tight group-hover:text-[#111312] transition-colors">
                    Time &amp; Attendance
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68707D] leading-relaxed">
                    Clock-ins, shift schedules &amp; regularization.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#111312] hover:text-[#3F6212] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Open Attendance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Leave Management */}
            <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] hover:border-[#111312]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-20 w-28 flex items-center justify-start transition-transform duration-300 group-hover:scale-105 origin-left">
                  <img
                    src="/illustrations/leave-management.svg"
                    alt="Leave Management illustration"
                    className="h-full w-full object-contain object-left"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#111312] tracking-tight group-hover:text-[#111312] transition-colors">
                    Leave Management
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68707D] leading-relaxed">
                    Live leave balances &amp; one-click approvals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#111312] hover:text-[#3F6212] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Manage Leaves</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: Payroll & Payslips */}
            <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] hover:border-[#111312]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-20 w-28 flex items-center justify-start transition-transform duration-300 group-hover:scale-105 origin-left">
                  <img
                    src="/illustrations/payroll-payslips.svg"
                    alt="Payroll & Payslips illustration"
                    className="h-full w-full object-contain object-left"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#111312] tracking-tight group-hover:text-[#111312] transition-colors">
                    Payroll &amp; Payslips
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68707D] leading-relaxed">
                    Automated salary runs, tax &amp; PDF payslips.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#111312] hover:text-[#3F6212] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Payroll</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4: People & Onboarding */}
            <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] hover:border-[#111312]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-20 w-28 flex items-center justify-start transition-transform duration-300 group-hover:scale-105 origin-left">
                  <img
                    src="/illustrations/people-onboarding.svg"
                    alt="People & Onboarding illustration"
                    className="h-full w-full object-contain object-left"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#111312] tracking-tight group-hover:text-[#111312] transition-colors">
                    People &amp; Onboarding
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68707D] leading-relaxed">
                    Org directory, documents &amp; self-onboarding.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#111312] hover:text-[#3F6212] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Explore Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 5: Recruitment */}
            <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] hover:border-[#111312]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-20 w-28 flex items-center justify-start transition-transform duration-300 group-hover:scale-105 origin-left">
                  <img
                    src="/illustrations/recruitment.svg"
                    alt="Recruitment illustration"
                    className="h-full w-full object-contain object-left"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#111312] tracking-tight group-hover:text-[#111312] transition-colors">
                    Recruitment
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68707D] leading-relaxed">
                    Hiring pipelines, candidates &amp; offer tracking.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#111312] hover:text-[#3F6212] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Openings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 6: Goals & Appraisals */}
            <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 shadow-[0_2px_16px_rgba(17,19,18,0.03)] hover:shadow-[0_8px_24px_rgba(17,19,18,0.08)] hover:border-[#111312]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-20 w-28 flex items-center justify-start transition-transform duration-300 group-hover:scale-105 origin-left">
                  <img
                    src="/illustrations/goals-appraisals.svg"
                    alt="Goals & Appraisals illustration"
                    className="h-full w-full object-contain object-left"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#111312] tracking-tight group-hover:text-[#111312] transition-colors">
                    Goals &amp; Appraisals
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68707D] leading-relaxed">
                    Quarterly OKRs, reviews &amp; performance cycles.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole("EMPLOYEE")}
                className="text-xs font-semibold text-[#111312] hover:text-[#3F6212] flex items-center gap-1.5 pt-2 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Open Performance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-[#E6E8EC] bg-[#F7F8FA] py-6 text-xs text-[#68707D] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#68707D]">
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
