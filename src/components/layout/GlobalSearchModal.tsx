import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Building2,
  FileCheck,
  Receipt,
  FileText,
  ArrowRight,
  UserPlus,
  CalendarPlus,
  Clock,
  X,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../../lib/authContext";
import { useHrms } from "../../lib/hrmsContext";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddEmployee?: () => void;
  onOpenApplyLeave?: () => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onOpenAddEmployee,
  onOpenApplyLeave,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, departments, leaveRequests, documents } = useHrms();

  const role = user?.role || "EMPLOYEE";
  const isSuperOrHr = role === "SUPER_ADMIN" || role === "HR_ADMIN";
  const canViewEmployees = role !== "EMPLOYEE";
  const canViewDepartments = isSuperOrHr;
  const canViewDocs = role !== "EMPLOYEE";
  const isEmployee = role === "EMPLOYEE";

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search Results filtered by Role
  const matchedEmployees = cleanQuery && canViewEmployees
    ? employees
        .filter(
          (e) =>
            e.firstName.toLowerCase().includes(cleanQuery) ||
            e.lastName.toLowerCase().includes(cleanQuery) ||
            e.employeeCode.toLowerCase().includes(cleanQuery) ||
            e.email.toLowerCase().includes(cleanQuery),
        )
        .slice(0, 5)
    : [];

  const matchedDepartments = cleanQuery && canViewDepartments
    ? departments
        .filter(
          (d) =>
            d.name.toLowerCase().includes(cleanQuery) ||
            d.code.toLowerCase().includes(cleanQuery),
        )
        .slice(0, 3)
    : [];

  const matchedLeaves = cleanQuery
    ? leaveRequests
        .filter((l) => {
          if (isEmployee && l.employeeId !== user?.employeeId) return false;
          const emp = employees.find((e) => e.id === l.employeeId);
          return (
            emp?.firstName.toLowerCase().includes(cleanQuery) ||
            l.reason.toLowerCase().includes(cleanQuery)
          );
        })
        .slice(0, 3)
    : [];

  const matchedDocs = cleanQuery && canViewDocs
    ? documents
        .filter(
          (d) =>
            d.title.toLowerCase().includes(cleanQuery) ||
            d.category.toLowerCase().includes(cleanQuery),
        )
        .slice(0, 3)
    : [];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-card shadow-elevated border border-surface-border overflow-hidden z-10 animate-scale-in">
        {/* Search Header */}
        <div className="p-4 border-b border-surface-border flex items-center gap-3 bg-surface-subtle/50">
          <Search className="w-5 h-5 text-gray-900 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search employees, departments, leaves, documents..."
            className="w-full text-base bg-transparent border-none text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions (when query is empty) */}
          {!cleanQuery && (
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Quick Shortcuts
              </p>
              <div className="space-y-1">
                {isSuperOrHr && onOpenAddEmployee && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAddEmployee();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-text-primary hover:bg-gray-100 hover:text-gray-950 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserPlus className="w-4 h-4 text-gray-900" />
                      <span>Onboard New Employee</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}

                {onOpenApplyLeave && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenApplyLeave();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-text-primary hover:bg-gray-100 hover:text-gray-950 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarPlus className="w-4 h-4 text-emerald-600" />
                      <span>Apply for Leave</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}

                <button
                  onClick={() => handleSelect("/time/attendance")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-text-primary hover:bg-gray-100 hover:text-gray-950 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-gray-700" />
                    <span>View Today's Attendance Register</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  onClick={() => handleSelect("/payroll/payslips")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-text-primary hover:bg-gray-100 hover:text-gray-950 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <WalletCards className="w-4 h-4 text-emerald-600" />
                    <span>Download Payslips</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isSuperOrHr && (
                  <button
                    onClick={() => handleSelect("/payroll/runs")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-text-primary hover:bg-gray-100 hover:text-gray-950 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-amber-600" />
                      <span>Process Monthly Payroll</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search Results */}
          {cleanQuery && (
            <>
              {matchedEmployees.length > 0 && (
                <div>
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Employees (
                    {matchedEmployees.length})
                  </p>
                  <div className="space-y-1">
                    {matchedEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() =>
                          handleSelect(`/people/employees/${emp.id}`)
                        }
                        className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-left hover:bg-gray-100 hover:text-gray-950 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-semibold text-text-primary">
                              {emp.firstName} {emp.lastName}
                            </span>
                            <span className="text-xs text-text-muted ml-2">
                              {emp.employeeCode}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-text-secondary">
                          View Profile →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedDepartments.length > 0 && (
                <div>
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Departments (
                    {matchedDepartments.length})
                  </p>
                  <div className="space-y-1">
                    {matchedDepartments.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => handleSelect("/people/departments")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-left hover:bg-gray-100 hover:text-gray-950 transition-colors"
                      >
                        <span className="font-medium text-text-primary">
                          {dept.name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {dept.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedLeaves.length > 0 && (
                <div>
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" /> Leave Requests
                  </p>
                  <div className="space-y-1">
                    {matchedLeaves.map((l) => (
                      <button
                        key={l.id}
                        onClick={() =>
                          handleSelect(isEmployee ? "/leave/overview" : "/leave/requests")
                        }
                        className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-left hover:bg-gray-100 hover:text-gray-950 transition-colors"
                      >
                        <span className="text-text-primary truncate">
                          {l.reason}
                        </span>
                        <span className="text-xs text-text-muted ml-2 shrink-0">
                          {l.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedDocs.length > 0 && (
                <div>
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Documents
                  </p>
                  <div className="space-y-1">
                    {matchedDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleSelect("/people/documents")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-button text-sm text-left hover:bg-gray-100 hover:text-gray-950 transition-colors"
                      >
                        <span className="text-text-primary">{doc.title}</span>
                        <span className="text-xs text-text-muted">
                          {doc.fileType}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedEmployees.length === 0 &&
                matchedDepartments.length === 0 &&
                matchedLeaves.length === 0 &&
                matchedDocs.length === 0 && (
                  <div className="py-8 text-center text-text-muted text-sm">
                    No results found for "
                    <span className="font-medium text-text-primary">
                      {query}
                    </span>
                    "
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-surface-border flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span>
              Navigation:{" "}
              <kbd className="bg-white border px-1.5 py-0.5 rounded">↑</kbd>{" "}
              <kbd className="bg-white border px-1.5 py-0.5 rounded">↓</kbd>
            </span>
            <span>
              Select:{" "}
              <kbd className="bg-white border px-1.5 py-0.5 rounded">↵</kbd>
            </span>
          </div>
          <span>Local Data Index</span>
        </div>
      </div>
    </div>
  );
}
