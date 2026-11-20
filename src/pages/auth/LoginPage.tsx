import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Users,
  Building,
  User,
  UserCheck,
  ArrowLeft,
  AlertCircle,
  KeyRound,
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
      // Error handled and shown by AuthContext
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFA] text-gray-900 selection:bg-gray-950 selection:text-white">
      {/* Left Column: Editorial Dark Brand Sidebar */}
      <div className="lg:w-1/2 bg-gray-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-r border-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F2937_1px,transparent_1px),linear-gradient(to_bottom,#1F2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 -z-10 pointer-events-none" />

        {/* Top: Logo & Back Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <GaHrmsLogo size="md" variant="dark" />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to website</span>
          </Link>
        </div>

        {/* Center: Hero Heading & Feature Pillars */}
        <div className="relative z-10 my-12 space-y-8 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Internal Workplace Portal • Firebase Authentication
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              The internal operational standard for workforce & payroll.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed font-normal">
              Replacing fragmented third-party software with a unified company platform:
              authenticated email & password access, biometric attendance normalization, and automated Indian statutory payroll.
            </p>
          </div>

          {/* Value points */}
          <div className="space-y-3 pt-2">
            {[
              "Firebase Authentication (Email & Encrypted Password)",
              "Cloud Firestore Realtime Attendance & Employee Directory",
              "Indian Statutory Payroll (PF, ESIC, PT, TDS) for November 2026",
              "Multi-branch Approval Workflows & Biometric Push Sync",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Trust & Security Note */}
        <div className="relative z-10 pt-8 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Single-Company Internal HRMS</span>
          </div>
          <span className="font-mono text-gray-500">Firebase ga-hrms-70260</span>
        </div>
      </div>

      {/* Right Column: Clean Sign In Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FAFAFA]">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-gray-200/90 shadow-sm">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <div className="lg:hidden pb-3">
              <GaHrmsLogo size="md" variant="light" />
            </div>
            <h3 className="text-2xl font-black text-gray-950 tracking-tight">
              Sign in to your workplace
            </h3>
            <p className="text-sm text-gray-500">
              Enter your corporate email and password to access the internal portal.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Reset password message */}
          {resetMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1 font-medium">{resetMessage}</div>
            </div>
          )}

          {/* Quick Select Persona Pills */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center justify-between">
              <span>Quick Select Registered Account</span>
              <span className="text-[10px] text-gray-400 normal-case font-normal">All pw: Password@123</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "SUPER_ADMIN", name: "Super Admin", icon: Shield, subtitle: "Ajay Pawar" },
                { key: "HR_ADMIN", name: "HR Manager", icon: Users, subtitle: "Priya Sharma" },
                { key: "MANAGER", name: "Team Manager", icon: Building, subtitle: "Rajesh Kulkarni" },
                { key: "EMPLOYEE", name: "Employee", icon: User, subtitle: "Ananya Iyer" },
                { key: "NEW_HIRE", name: "New Hire", icon: UserCheck, subtitle: "Ramesh Patil" },
              ].map((p, idx) => {
                const Icon = p.icon;
                const isSelected = selectedRole === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleSelectPersona(p.key)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
                      idx === 4 ? "col-span-2" : ""
                    } ${
                      isSelected
                        ? "bg-gray-950 border-gray-950 text-white shadow-xs font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <div className="truncate">
                      <div className="font-semibold">{p.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                        {p.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@ga-hrms.io"
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-gray-950 focus:ring-gray-950/20 w-4 h-4 accent-gray-950"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-gray-700 hover:text-black font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gray-950 hover:bg-black text-white text-sm font-semibold transition-all shadow-xs hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <span>{isLoading ? "Authenticating with Firebase..." : "Sign In to Workplace"}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </form>

          {/* Registered Firebase Auth Badge */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/90 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Firebase Auth Registered</span>
            </div>
            <span className="font-mono text-[11px] text-gray-500">ga-hrms-70260</span>
          </div>
        </div>
      </div>
    </div>
  );
}
