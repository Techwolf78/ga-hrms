import React from "react";
import { UserCheck, Shield, Check, X, ShieldAlert } from "lucide-react";
import { useAuth } from "../../lib/authContext";
import { UserRole } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";

export function UsersRolesPage() {
  const { user, switchRole } = useAuth();

  const permissionsMatrix = [
    { module: "Dashboard & Executive KPIs", superAdmin: true, hrAdmin: true, manager: true, employee: true },
    { module: "Employee Directory & Profiles", superAdmin: true, hrAdmin: true, manager: true, employee: false },
    { module: "Add / Terminate Employee", superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: "Departments & Hierarchy", superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: "Time & Attendance Register", superAdmin: true, hrAdmin: true, manager: true, employee: true },
    { module: "Approve Missed Punch Regularization", superAdmin: true, hrAdmin: true, manager: true, employee: false },
    { module: "Leave Applications & Approvals", superAdmin: true, hrAdmin: true, manager: true, employee: true },
    { module: "Configure Statutory Leave Policies", superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: "Execute Monthly Payroll Run", superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: "Download Confidential Payslips", superAdmin: true, hrAdmin: true, manager: true, employee: true },
    { module: "Company Settings & Policies", superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: "Security & Audit Log", superAdmin: true, hrAdmin: true, manager: false, employee: false },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            Role-Based Access Control (RBAC) & Permissions
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5">
            Multi-tier permission governance across Super Admin, HR, Department Managers, and Employee Self-Service.
          </p>
        </div>
      </div>

      {/* Active Persona Simulator Banner */}
      <div className="p-5 sm:p-6 bg-[#032D42] text-white rounded-3xl shadow-[0_8px_24px_rgba(3,45,66,0.12)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-white shrink-0 border border-white/15">
            <Shield className="w-5 h-5 text-[#62D84E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Current Active Persona:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/15 text-[#62D84E] border border-white/20">
                {user?.role.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Simulating session as <strong className="text-white">{user?.name}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"] as UserRole[]).map((r) => {
            const isActive = user?.role === r;
            return (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#62D84E] text-[#032D42] shadow-[0_4px_16px_rgba(98,216,78,0.32)] font-bold"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10"
                }`}
              >
                {isActive && <Check className="w-3.5 h-3.5 text-[#032D42]" />}
                <span>{r.replace("_", " ")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Enterprise Permissions Matrix</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Granular capabilities assigned per administrative hierarchy.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3.5 px-4">Capability / Module</th>
                  <th className="py-3.5 px-4 text-center">Super Admin</th>
                  <th className="py-3.5 px-4 text-center">HR Admin</th>
                  <th className="py-3.5 px-4 text-center">Manager</th>
                  <th className="py-3.5 px-4 text-center">Employee (ESS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.module}</td>
                    <td className="py-3 px-4 text-center">
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.hrAdmin ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.manager ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.employee ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
