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
  Database,
} from "lucide-react";
import { useAuth, DEMO_USERS, DEMO_PERSONAS } from "../../lib/authContext";
import { UserRole } from "../../types/hrms";
import { Input } from "../../components/ui/Input";
import { GaHrmsLogo } from "../../components/ui/GaHrmsLogo";
import { seedFirestoreWithNovember2026 } from "../../lib/firebase/firestoreService";

export function LoginPage() {
  const [email, setEmail] = useState("ajay.pawar@ga-hrms.io");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState<string>("SUPER_ADMIN");
  const [rememberMe, setRememberMe] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const { login, loginWithGoogle, loginWithEmailPassword, isLoading: authLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const isLoading = localLoading || authLoading;

  const handleGoogleSignIn = async () => {
    clearError();
    setLocalLoading(true);
    try {
      await loginWithGoogle();
      setLocalLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      setLocalLoading(false);
      // Error handled by AuthContext
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearError();
    setLocalLoading(true);
    try {
      // If entered a custom password that isn't the masked demo default, attempt Firebase Email/Pass
      if (password !== "••••••••••••" && password.length >= 6) {
        await loginWithEmailPassword(email, password);
        setLocalLoading(false);
        navigate("/dashboard");
      } else {
        // Fast local demo login
        setTimeout(() => {
          login(email, (selectedRole === "NEW_HIRE" ? "EMPLOYEE" : selectedRole) as UserRole);
          setLocalLoading(false);
          if (selectedRole === "NEW_HIRE") {
            navigate("/onboarding");
          } else {
            navigate("/dashboard");
          }
        }, 300);
      }
    } catch (err: any) {
      setLocalLoading(false);
    }
  };

  const handleQuickDemo = (personaKey: string) => {
    setSelectedRole(personaKey);
    setLocalLoading(true);
    setTimeout(() => {
      if (personaKey === "NEW_HIRE") {
        const demo = DEMO_PERSONAS.NEW_HIRE;
        setEmail(demo.email);
        login(demo.email, "EMPLOYEE", demo);
        setLocalLoading(false);
        navigate("/onboarding");
      } else {
        const role = personaKey as UserRole;
        const demo = DEMO_USERS[role];
        setEmail(demo.email);
        login(demo.email, role);
        setLocalLoading(false);
        navigate("/dashboard");
      }
    }, 250);
  };

  const handleSeedFirestore = async () => {
    setLocalLoading(true);
    setSeedMessage(null);
    const res = await seedFirestoreWithNovember2026(false);
    setSeedMessage(res.message);
    setLocalLoading(false);
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
              Internal Workforce Portal • Firebase Backend
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              The internal operational standard for workforce & payroll.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed font-normal">
              Replacing fragmented third-party software with an in-house unified platform:
              real-time biometric attendance sync, automated statutory payroll, and secure Google Workspace authentication.
            </p>
          </div>

          {/* Value points */}
          <div className="space-y-3 pt-2">
            {[
              "Firebase Authentication with Google Workspace SSO",
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
              Sign in with your Google account or select a quick demo persona.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Notice</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Seed Success Notice */}
          {seedMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1 font-medium">{seedMessage}</div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider shrink-0">
              Or use demo persona
            </span>
            <div className="border-t border-gray-200 w-full" />
          </div>

          {/* Quick Demo Role Selector Pills */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "SUPER_ADMIN", name: "Super Admin", icon: Shield, subtitle: "Admin" },
                { key: "HR_ADMIN", name: "HR Manager", icon: Users, subtitle: "Priya" },
                { key: "MANAGER", name: "Team Manager", icon: Building, subtitle: "Rajesh" },
                { key: "EMPLOYEE", name: "Employee", icon: User, subtitle: "Ananya" },
                { key: "NEW_HIRE", name: "New Hire", icon: UserCheck, subtitle: "Ramesh (Onboarding)" },
              ].map((p, idx) => {
                const Icon = p.icon;
                const isSelected = selectedRole === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleQuickDemo(p.key)}
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

          {/* Standard Form */}
          <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
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
                onClick={() => alert("Simulated: Password reset link sent to " + email)}
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
              <span>{isLoading ? "Signing in..." : `Sign In as ${selectedRole === "NEW_HIRE" ? "New Hire" : DEMO_USERS[selectedRole as UserRole]?.name || "Employee"}`}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </form>

          {/* Database seeding action for admins */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-gray-400" />
              <span>Live Firestore Connected</span>
            </span>
            <button
              type="button"
              onClick={handleSeedFirestore}
              disabled={isLoading}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline disabled:opacity-50"
            >
              Seed November 2026 Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
