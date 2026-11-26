import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth, DEMO_USERS, DEMO_PERSONAS } from "../../lib/authContext";
import { UserRole } from "../../types/hrms";
import { Input } from "../../components/ui/Input";
import { GaHrmsLogo } from "../../components/ui/GaHrmsLogo";
import { sendResetPassword } from "../../lib/firebase/auth";

export function LoginPage() {
  const [email, setEmail] = useState("ajay.pawar@ga-hrms.io");
  const [password, setPassword] = useState("Password@123");
  const [selectedRole, setSelectedRole] = useState<string>("SUPER_ADMIN");
  const [rememberMe, setRememberMe] = useState(true);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const { loginWithEmailPassword, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearError();
    setResetMessage(null);
    try {
      await loginWithEmailPassword(email, password);
      if (email === "ramesh.patil@ga-hrms.io") {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch {
      // Error handled by AuthContext
    }
  };

  const handleSelectPersona = (personaKey: string) => {
    setSelectedRole(personaKey);
    clearError();
    setResetMessage(null);

    let targetEmail = "admin@ga-hrms.io";
    if (personaKey === "NEW_HIRE") {
      targetEmail = DEMO_PERSONAS.NEW_HIRE.email;
    } else if (DEMO_USERS[personaKey as UserRole]) {
      targetEmail = DEMO_USERS[personaKey as UserRole].email;
    }
    setEmail(targetEmail);
    setPassword("Password@123");
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your work email address first.");
      return;
    }
    try {
      await sendResetPassword(email);
      setResetMessage(`Password reset link sent to ${email}`);
    } catch (err: any) {
      alert(err.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F9FB] text-[#032D42] flex flex-col font-sans selection:bg-[#62D84E] selection:text-[#032D42] overflow-x-hidden">
      {/* Fresh, Calm Ambient Mesh Gradient (ServiceNow Palette - Soft Mint, Calming Teal & Airy Lime) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* Soft Ethereal Mint-White Backlight directly behind the center card */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) translate3d(0, 0, 0)",
            width: "820px",
            height: "680px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(233, 245, 243, 0.95) 0%, rgba(204, 251, 241, 0.35) 45%, transparent 70%)",
            filter: "blur(75px)",
            WebkitFilter: "blur(75px)",
          }}
        />

        {/* Airy Spring Lime Sunlight on Top-Right */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "660px",
            height: "560px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 40%, rgba(98, 216, 78, 0.22) 0%, rgba(167, 243, 208, 0.20) 45%, transparent 70%)",
            filter: "blur(80px)",
            WebkitFilter: "blur(80px)",
            transform: "translate3d(0, 0, 0)",
          }}
        />

        {/* Calming Enterprise Teal & Cyan Pool on Bottom-Left */}
        <div
          style={{
            position: "absolute",
            bottom: "-140px",
            left: "-100px",
            width: "740px",
            height: "620px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 45% 45%, rgba(31, 132, 118, 0.22) 0%, rgba(45, 212, 191, 0.16) 45%, transparent 70%)",
            filter: "blur(85px)",
            WebkitFilter: "blur(85px)",
            transform: "translate3d(0, 0, 0)",
          }}
        />

        {/* Whispering Dew Sage Highlight on Upper-Left */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "4%",
            width: "500px",
            height: "420px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(128, 182, 161, 0.16) 0%, rgba(233, 245, 243, 0.12) 50%, transparent 70%)",
            filter: "blur(70px)",
            WebkitFilter: "blur(70px)",
            transform: "translate3d(0, 0, 0)",
          }}
        />

        {/* Zen Technical Grid pattern with subtle radial mask */}
        <div
          className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#032D42 1px, transparent 1px), linear-gradient(to right, #032D42 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
          }}
        />
      </div>

      {/* Floating Detached Pill Header with Mirror Glass Reflection */}
      <div className="sticky top-4 z-50 w-full px-4 sm:px-6 pointer-events-none flex flex-col items-center">
        <header className="pointer-events-auto relative w-full max-w-4xl rounded-full border border-white/80 bg-white/85 backdrop-blur-md shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/[0.04] overflow-hidden">
          <div className="absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
          <div className="px-5 sm:px-7 h-14 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 select-none group" id="login-brand-logo">
              <GaHrmsLogo size="sm" variant="light" />
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white text-[#032D42] border border-[#DDE3EA] hover:bg-gray-50 transition-all shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#697586]" />
              <span>Back to Home</span>
            </Link>
          </div>
        </header>
      </div>

      {/* Main Content Area - Centered Minimalist Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-md bg-white border border-[#DDE3EA] rounded-3xl p-7 sm:p-9 shadow-[0_8px_30px_rgba(3,45,66,0.06)] space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#032D42] tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5D6B]">
              Enter your corporate credentials to access GA-HRMS.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-2xl bg-[#FCE8E6] border border-[#FAD2CF] flex items-start gap-2.5 text-xs text-[#C62828]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C62828] mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Reset Message */}
          {resetMessage && (
            <div className="p-3 rounded-2xl bg-[#E6F4EA] border border-[#CEEAD6] flex items-start gap-2.5 text-xs text-[#188038]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#188038] mt-0.5" />
              <div className="flex-1 font-medium">{resetMessage}</div>
            </div>
          )}

          {/* Quick Demo Access Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#697586]">
              <span className="font-semibold uppercase tracking-wider">Quick Demo Account</span>
              <span className="text-[10px] text-[#80B6A1]">pw: Password@123</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
              {[
                { key: "SUPER_ADMIN", label: "Admin" },
                { key: "HR_ADMIN", label: "HR Ops" },
                { key: "MANAGER", label: "Manager" },
                { key: "EMPLOYEE", label: "Employee" },
                { key: "NEW_HIRE", label: "New Hire" },
              ].map((p) => {
                const isSelected = selectedRole === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleSelectPersona(p.key)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                      isSelected
                        ? "bg-[#032D42] text-white shadow-xs"
                        : "bg-[#F7F9FB] text-[#4B5D6B] border border-[#DDE3EA] hover:border-[#032D42]/30 hover:text-[#032D42]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@ga-hrms.io"
              leftIcon={<Mail className="w-4 h-4 text-[#80B6A1]" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4 text-[#80B6A1]" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-[#697586]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DDE3EA] text-[#1F8476] focus:ring-[#1F8476]/20 w-4 h-4 accent-[#1F8476]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#1F8476] hover:text-[#166C61] font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* ServiceNow Signature Electric Lime Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-5 rounded-full bg-[#62D84E] text-[#032D42] hover:bg-[#50C838] font-bold text-sm shadow-[0_4px_16px_rgba(98,216,78,0.32)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? "Authenticating..." : "Sign In to Workplace"}</span>
              <ArrowRight className="w-4 h-4 text-[#032D42]" />
            </button>
          </form>
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="relative z-10 border-t border-[#DDE3EA] bg-[#F7F9FB] py-5 text-[11px] text-[#697586]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GaHrmsLogo size="xs" variant="light" />
            <span>© {new Date().getFullYear()} GA-HRMS. All rights reserved.</span>
          </div>
          <div>
            <span>Baner, Pune 411045</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
