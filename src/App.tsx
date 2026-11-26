import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/authContext";
import { ToastProvider } from "./lib/toastContext";
import { HrmsProvider, useHrms } from "./lib/hrmsContext";
import { AppShell } from "./components/layout/AppShell";
import { AddEmployeeModal } from "./pages/people/AddEmployeeModal";
import { ApplyLeaveModal } from "./pages/leave/ApplyLeaveModal";
import { AttendanceCorrectionModal } from "./pages/time/AttendanceCorrectionModal";
import { UserRole } from "./types/hrms";

// Route-level code-split pages
const LandingPage = lazy(() => import("./pages/landing/LandingPage").then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import("./pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const EmployeesPage = lazy(() => import("./pages/people/EmployeesPage").then((m) => ({ default: m.EmployeesPage })));
const EmployeeProfilePage = lazy(() => import("./pages/people/EmployeeProfilePage").then((m) => ({ default: m.EmployeeProfilePage })));
const DepartmentsPage = lazy(() => import("./pages/people/DepartmentsPage").then((m) => ({ default: m.DepartmentsPage })));
const DesignationsPage = lazy(() => import("./pages/people/DesignationsPage").then((m) => ({ default: m.DesignationsPage })));
const OrganizationPage = lazy(() => import("./pages/people/OrganizationPage").then((m) => ({ default: m.OrganizationPage })));
const DocumentsPage = lazy(() => import("./pages/people/DocumentsPage").then((m) => ({ default: m.DocumentsPage })));
const AttendancePage = lazy(() => import("./pages/time/AttendancePage").then((m) => ({ default: m.AttendancePage })));
const RegularizationPage = lazy(() => import("./pages/time/RegularizationPage").then((m) => ({ default: m.RegularizationPage })));
const ShiftsPage = lazy(() => import("./pages/time/ShiftsPage").then((m) => ({ default: m.ShiftsPage })));
const HolidaysPage = lazy(() => import("./pages/time/HolidaysPage").then((m) => ({ default: m.HolidaysPage })));
const LeaveOverviewPage = lazy(() => import("./pages/leave/LeaveOverviewPage").then((m) => ({ default: m.LeaveOverviewPage })));
const LeaveRequestsPage = lazy(() => import("./pages/leave/LeaveRequestsPage").then((m) => ({ default: m.LeaveRequestsPage })));
const LeavePoliciesPage = lazy(() => import("./pages/leave/LeavePoliciesPage").then((m) => ({ default: m.LeavePoliciesPage })));
const PayrollDashboardPage = lazy(() => import("./pages/payroll/PayrollDashboardPage").then((m) => ({ default: m.PayrollDashboardPage })));
const SalaryStructurePage = lazy(() => import("./pages/payroll/SalaryStructurePage").then((m) => ({ default: m.SalaryStructurePage })));
const PayrollRunPage = lazy(() => import("./pages/payroll/PayrollRunPage").then((m) => ({ default: m.PayrollRunPage })));
const PayslipsPage = lazy(() => import("./pages/payroll/PayslipsPage").then((m) => ({ default: m.PayslipsPage })));
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const UsersRolesPage = lazy(() => import("./pages/admin/UsersRolesPage").then((m) => ({ default: m.UsersRolesPage })));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const NotificationsPage = lazy(() => import("./pages/admin/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const AuditLogsPage = lazy(() => import("./pages/admin/AuditLogsPage").then((m) => ({ default: m.AuditLogsPage })));
const RecruitmentPage = lazy(() => import("./pages/recruitment/RecruitmentPage").then((m) => ({ default: m.RecruitmentPage })));
const AssetsPage = lazy(() => import("./pages/assets/AssetsPage").then((m) => ({ default: m.AssetsPage })));
const PerformancePage = lazy(() => import("./pages/performance/PerformancePage").then((m) => ({ default: m.PerformancePage })));
const SelfOnboardingPage = lazy(() => import("./pages/people/SelfOnboardingPage").then((m) => ({ default: m.SelfOnboardingPage })));
const OnboardingSetupPage = lazy(() => import("./pages/admin/OnboardingSetupPage").then((m) => ({ default: m.OnboardingSetupPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[240px]">
      <div className="w-6 h-6 rounded-full border-2 border-[#DDE3EA] border-t-[#1F8476] animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { employees } = useHrms();

  if (user?.role === "EMPLOYEE") {
    const emp = employees.find((e) => e.id === user.employeeId || e.email === user.email);
    if (emp && emp.onboardingCompleted === false) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}

function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const role = user?.role || "EMPLOYEE";
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function MainAppContent() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isAttendanceCorrectionOpen, setIsAttendanceCorrectionOpen] = useState(false);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Standalone Employee Self-Onboarding Route */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <SelfOnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Layout with Onboarding Guard */}
        <Route
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <AppShell
                  onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
                  onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
                  onOpenAttendanceCorrection={() => setIsAttendanceCorrectionOpen(true)}
                />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
                onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
              />
            }
          />

          {/* People Module */}
          <Route
            path="/people/employees"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <EmployeesPage onOpenAddEmployee={() => setIsAddEmployeeOpen(true)} />
              </RoleRoute>
            }
          />
          <Route
            path="/people/employees/:id"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <EmployeeProfilePage />
              </RoleRoute>
            }
          />
          <Route
            path="/people/departments"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <DepartmentsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/people/designations"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <DesignationsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/people/organization"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <OrganizationPage />
              </RoleRoute>
            }
          />
          <Route
            path="/people/documents"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <DocumentsPage />
              </RoleRoute>
            }
          />

          {/* Time & Attendance */}
          <Route path="/time/attendance" element={<AttendancePage />} />
          <Route
            path="/time/regularization"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <RegularizationPage />
              </RoleRoute>
            }
          />
          <Route
            path="/time/shifts"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER"]}>
                <ShiftsPage />
              </RoleRoute>
            }
          />
          <Route path="/time/holidays" element={<HolidaysPage />} />

          {/* Leave Management */}
          <Route
            path="/leave/overview"
            element={<LeaveOverviewPage onOpenApplyLeave={() => setIsApplyLeaveOpen(true)} />}
          />
          <Route
            path="/leave/requests"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <LeaveRequestsPage onOpenApplyLeave={() => setIsApplyLeaveOpen(true)} />
              </RoleRoute>
            }
          />
          <Route
            path="/leave/policies"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <LeavePoliciesPage />
              </RoleRoute>
            }
          />

          {/* Payroll Management */}
          <Route
            path="/payroll/dashboard"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <PayrollDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/payroll/salary-structures"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <SalaryStructurePage />
              </RoleRoute>
            }
          />
          <Route
            path="/payroll/runs"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <PayrollRunPage />
              </RoleRoute>
            }
          />
          <Route path="/payroll/payslips" element={<PayslipsPage />} />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER"]}>
                <ReportsPage />
              </RoleRoute>
            }
          />

          {/* Administration */}
          <Route
            path="/admin/users-roles"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <UsersRolesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <SettingsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/onboarding-setup"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <OnboardingSetupPage />
              </RoleRoute>
            }
          />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route
            path="/admin/audit-logs"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN"]}>
                <AuditLogsPage />
              </RoleRoute>
            }
          />

          {/* Extended Enterprise Modules */}
          <Route
            path="/recruitment"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <RecruitmentPage />
              </RoleRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <AssetsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]}>
                <PerformancePage />
              </RoleRoute>
            }
          />

          {/* Backwards-compatible legacy short-URL aliases */}
          <Route path="/employees" element={<Navigate to="/people/employees" replace />} />
          <Route path="/departments" element={<Navigate to="/people/departments" replace />} />
          <Route path="/designations" element={<Navigate to="/people/designations" replace />} />
          <Route path="/organization" element={<Navigate to="/people/organization" replace />} />
          <Route path="/documents" element={<Navigate to="/people/documents" replace />} />
          <Route path="/attendance" element={<Navigate to="/time/attendance" replace />} />
          <Route path="/regularization" element={<Navigate to="/time/regularization" replace />} />
          <Route path="/shifts" element={<Navigate to="/time/shifts" replace />} />
          <Route path="/holidays" element={<Navigate to="/time/holidays" replace />} />
          <Route path="/leave" element={<Navigate to="/leave/overview" replace />} />
          <Route path="/payroll" element={<Navigate to="/payroll/dashboard" replace />} />
          <Route path="/admin/onboarding" element={<Navigate to="/admin/onboarding-setup" replace />} />
          <Route path="/users-roles" element={<Navigate to="/admin/users-roles" replace />} />
          <Route path="/notifications" element={<Navigate to="/admin/notifications" replace />} />
          <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
          <Route path="/audit-logs" element={<Navigate to="/admin/audit-logs" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      </Suspense>

      {/* Global Modals */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
      />

      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
      />

      <AttendanceCorrectionModal
        isOpen={isAttendanceCorrectionOpen}
        onClose={() => setIsAttendanceCorrectionOpen(false)}
      />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <AuthProvider>
          <HrmsProvider>
            <MainAppContent />
          </HrmsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
