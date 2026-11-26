import React, { useState } from "react";
import {
  ShieldCheck,
  Edit2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { LeaveType } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

export function LeavePoliciesPage() {
  const { leaveTypes, updateLeavePolicy } = useHrms();
  const { user } = useAuth();
  const [editingPolicy, setEditingPolicy] = useState<LeaveType | null>(null);

  const [annualQuota, setAnnualQuota] = useState(12);
  const [monthlyAccrual, setMonthlyAccrual] = useState(1.0);
  const [carryForwardMax, setCarryForwardMax] = useState(0);

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN";

  const handleOpenEdit = (policy: LeaveType) => {
    setEditingPolicy(policy);
    setAnnualQuota(policy.annualQuota);
    setMonthlyAccrual(policy.monthlyAccrual);
    setCarryForwardMax(policy.carryForwardMax);
  };

  const handleSave = () => {
    if (!editingPolicy) return;
    updateLeavePolicy(editingPolicy.id, {
      annualQuota: Number(annualQuota),
      monthlyAccrual: Number(monthlyAccrual),
      carryForwardMax: Number(carryForwardMax),
    });
    setEditingPolicy(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            Leave Policies &amp; Accrual Rules
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5">
            Configurable statutory annual quotas, monthly accrual schedules, and year-end carry-forward limits for GA Enterprise.
          </p>
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {leaveTypes.map((policy) => (
          <div
            key={policy.id}
            className="group bg-white rounded-3xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] hover:border-[#1F8476]/30 hover:shadow-[0_8px_24px_rgba(3,45,66,0.08)] transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center shrink-0 group-hover:bg-[#032D42] group-hover:text-[#62D84E] transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#032D42] group-hover:text-[#1F8476] leading-tight transition-colors">
                      {policy.name}
                    </h2>
                    <span className="text-[11px] font-mono text-[#697586] font-semibold">
                      {policy.code}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleOpenEdit(policy)}
                    className="p-2 text-[#697586] hover:text-[#1F8476] hover:bg-[#E9F5F3] rounded-full transition-colors"
                    title="Configure Policy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#697586] leading-relaxed mb-4 min-h-[36px]">
                {policy.description}
              </p>

              {/* Metrics Grid */}
              <div className="space-y-2.5 text-xs pt-3 border-t border-[#DDE3EA]">
                <div className="flex justify-between items-center">
                  <span className="text-[#697586]">Annual Entitlement:</span>
                  <span className="font-bold text-[#1B2430] text-sm">
                    {policy.annualQuota} Days
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#697586]">Monthly Accrual:</span>
                  <span className="font-semibold text-[#1B2430]">
                    +{policy.monthlyAccrual} / month
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#697586]">Max Carry-Forward:</span>
                  <span className="font-semibold text-[#1B2430]">
                    {policy.carryForwardMax > 0 ? `${policy.carryForwardMax} Days` : "0 (Lapses Yearly)"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#697586]">Compensation:</span>
                  <Badge variant={policy.isPaid ? "success" : "neutral"} size="sm">
                    {policy.isPaid ? "Paid Leave" : "Loss of Pay (Unpaid)"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#697586]">Encashable:</span>
                  <span className="text-xs font-medium text-[#1B2430]">
                    {policy.isEncashable ? "Yes (On Separation)" : "Non-encashable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="px-5 py-3 bg-[#F7F9FB] border-t border-[#DDE3EA] flex items-center justify-between">
              <span className="text-[11px] text-[#697586]">GA Statutory Policy</span>
              {isAdmin ? (
                <button
                  onClick={() => handleOpenEdit(policy)}
                  className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1"
                >
                  <span>Edit Parameters</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[11px] text-[#697586]">Active Rule</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Policy Modal */}
      <Modal
        isOpen={!!editingPolicy}
        onClose={() => setEditingPolicy(null)}
        title={`Configure ${editingPolicy?.name} (${editingPolicy?.code})`}
        description="Modify annual quotas, monthly accrual rates, and year-end carry forward caps."
      >
        <div className="space-y-4">
          <Input
            label="Annual Entitlement Quota (Days / Year)"
            type="number"
            value={annualQuota}
            onChange={(e) => setAnnualQuota(Number(e.target.value))}
            min={0}
            required
          />

          <Input
            label="Monthly Accrual Rate (Days / Month)"
            type="number"
            step="0.1"
            value={monthlyAccrual}
            onChange={(e) => setMonthlyAccrual(Number(e.target.value))}
            min={0}
            required
          />

          <Input
            label="Maximum Carry Forward Cap (Days)"
            type="number"
            value={carryForwardMax}
            onChange={(e) => setCarryForwardMax(Number(e.target.value))}
            min={0}
            required
          />

          <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] text-xs text-[#697586] space-y-1">
            <div className="flex justify-between font-medium">
              <span>Policy Mode:</span>
              <span className="text-[#1B2430] font-semibold">{editingPolicy?.isPaid ? "Paid Leave" : "Loss of Pay"}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Encashable:</span>
              <span className="text-[#1B2430] font-semibold">{editingPolicy?.isEncashable ? "Permitted" : "No"}</span>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#DDE3EA]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPolicy(null)}
              className="text-xs border-[#DDE3EA]"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="text-xs bg-[#1F8476] hover:bg-[#166C61] text-white"
            >
              Save Policy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
