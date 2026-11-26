import React, { useState, useMemo } from "react";
import {
  Laptop,
  HardDrive,
  Monitor,
  Smartphone,
  Key,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Calendar,
  DollarSign,
  Tag,
  ShieldCheck,
  ArrowUpRight,
  User,
  Users,
  Wrench,
  HelpCircle,
  Cpu,
  PackageCheck,
  Check,
  ExternalLink,
  LifeBuoy,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { useAuth } from "../../lib/authContext";
import { useToast } from "../../lib/toastContext";
import { KpiCard } from "../../components/ui/KpiCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { CompanyAsset, AssetCategory, AssetStatus, AssetCondition } from "../../types/hrms";
import { formatINR, formatDate, cn } from "../../lib/utils";

const CATEGORIES: { key: AssetCategory | "ALL"; label: string; icon: any }[] = [
  { key: "ALL", label: "All Assets", icon: HardDrive },
  { key: "LAPTOP", label: "Laptops & PCs", icon: Laptop },
  { key: "MONITOR", label: "Monitors", icon: Monitor },
  { key: "MOBILE", label: "Phones & Tablets", icon: Smartphone },
  { key: "ACCESSORY", label: "Peripherals & Gear", icon: HardDrive },
  { key: "LICENSE", label: "Software Licenses", icon: Key },
];

export function AssetsPage() {
  const { assets, employees, addAsset, allocateAsset, returnAsset } = useHrms();
  const { user } = useAuth();
  const { success: toastSuccess, info: toastInfo } = useToast();

  const role = user?.role || "EMPLOYEE";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isHrAdmin = role === "HR_ADMIN";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  // Resolved current employee identity
  const currentEmployee = useMemo(() => {
    if (!user) return null;
    return (
      employees.find(
        (e) => e.id === user.employeeId || e.employeeCode === user.employeeId
      ) ||
      (isManager
        ? employees.find((e) => e.employeeCode === "EMP-1003") || employees[2]
        : isEmployee
        ? employees.find((e) => e.employeeCode === "EMP-1004") || employees[3]
        : null)
    );
  }, [employees, user, isManager, isEmployee]);

  // Direct reports for Manager
  const directReports = useMemo(() => {
    if (!currentEmployee) return [];
    return employees.filter(
      (e) =>
        e.managerId === currentEmployee.id ||
        e.managerId === user?.employeeId ||
        (currentEmployee && e.departmentId === currentEmployee.departmentId && e.id !== currentEmployee.id)
    );
  }, [employees, currentEmployee, user?.employeeId]);

  // Scoped Personal Assets for Employee / Manager
  const myAssets = useMemo(() => {
    const targetId = currentEmployee?.id || user?.employeeId || "EMP-1004";
    const targetCode = currentEmployee?.employeeCode || "EMP-1004";
    return assets.filter(
      (a) =>
        a.assignedToEmployeeId === targetId ||
        a.assignedToEmployeeId === targetCode ||
        a.assignedToEmployeeId === user?.employeeId
    );
  }, [assets, currentEmployee, user?.employeeId]);

  // Scoped Team Assets for Manager
  const teamAssets = useMemo(() => {
    return assets.filter((a) =>
      directReports.some(
        (dr) => dr.id === a.assignedToEmployeeId || dr.employeeCode === a.assignedToEmployeeId
      )
    );
  }, [assets, directReports]);

  // Tab State
  const [adminTab, setAdminTab] = useState<"inventory" | "allocations">("inventory");
  const [managerTab, setManagerTab] = useState<"TEAM" | "MY_ASSETS">("TEAM");

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "ALL">("ALL");

  // Modals State
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [targetAssetForAllocation, setTargetAssetForAllocation] = useState<CompanyAsset | null>(null);

  // Issue / Service Request Modal State (for Employee & Manager)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedAssetForIssue, setSelectedAssetForIssue] = useState<string>("");
  const [issueType, setIssueType] = useState("HARDWARE_FAULT");
  const [issueDescription, setIssueDescription] = useState("");
  const [issuePriority, setIssuePriority] = useState("STANDARD");

  // Team Hardware Request Modal State (for Manager)
  const [isTeamReqModalOpen, setIsTeamReqModalOpen] = useState(false);
  const [teamReqEmpId, setTeamReqEmpId] = useState(directReports[0]?.id || "");
  const [teamReqCategory, setTeamReqCategory] = useState("LAPTOP");
  const [teamReqNotes, setTeamReqNotes] = useState("");

  // New Asset Form State (Admin)
  const [newTag, setNewTag] = useState(`AST-LT-${100 + assets.length + 1}`);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<AssetCategory>("LAPTOP");
  const [newModel, setNewModel] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [newCost, setNewCost] = useState(125000);
  const [newPurchaseDate, setNewPurchaseDate] = useState("2026-02-15");
  const [newWarranty, setNewWarranty] = useState("2029-02-14");
  const [newCondition, setNewCondition] = useState<AssetCondition>("EXCELLENT");

  // Allocation Form State (Admin)
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || "");

  // Metrics
  const totalAssets = assets.length;
  const allocatedAssets = assets.filter((a) => a.status === "ALLOCATED").length;
  const availableAssets = assets.filter((a) => a.status === "AVAILABLE").length;
  const maintenanceAssets = assets.filter((a) => a.status === "MAINTENANCE").length;
  const totalCapitalValue = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

  const availableOptions = assets.filter((a) => a.status === "AVAILABLE");

  // Handlers
  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSerial.trim()) return;

    addAsset({
      assetTag: newTag.trim() || `AST-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      category: newCategory,
      model: newModel.trim() || newName.trim(),
      serialNumber: newSerial.trim(),
      purchaseDate: newPurchaseDate,
      warrantyExpiry: newWarranty,
      purchaseCost: Number(newCost) || 50000,
      status: "AVAILABLE",
      condition: newCondition,
      department: "IT Stock Room",
    });

    toastSuccess(`Asset ${newTag} successfully added to inventory.`);
    setIsAddAssetModalOpen(false);
    setNewName("");
    setNewModel("");
    setNewSerial("");
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assetId = targetAssetForAllocation ? targetAssetForAllocation.id : selectedAssetId;
    if (!assetId || !selectedEmpId) return;

    const emp = employees.find((e) => e.id === selectedEmpId || e.employeeCode === selectedEmpId);
    if (!emp) return;

    allocateAsset(assetId, emp.id, `${emp.firstName} ${emp.lastName}`);
    toastSuccess(`Asset allocated to ${emp.firstName} ${emp.lastName}.`);
    setIsAllocateModalOpen(false);
    setTargetAssetForAllocation(null);
  };

  const openAllocateForSpecific = (asset: CompanyAsset) => {
    setTargetAssetForAllocation(asset);
    setSelectedAssetId(asset.id);
    setIsAllocateModalOpen(true);
  };

  const handleReportIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomTicketId = `AST-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    toastSuccess(
      `Service Ticket #${randomTicketId} logged. IT Support Hinjawadi Pune will contact within 4 business hours.`
    );
    setIsIssueModalOpen(false);
    setIssueDescription("");
    setSelectedAssetForIssue("");
  };

  const handleTeamReqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reqEmp = employees.find((e) => e.id === teamReqEmpId || e.employeeCode === teamReqEmpId);
    const randomReqId = `EQ-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    toastSuccess(
      `Requisition #${randomReqId} for ${reqEmp ? `${reqEmp.firstName} ${reqEmp.lastName}` : "Team Member"} sent to IT Procurement.`
    );
    setIsTeamReqModalOpen(false);
    setTeamReqNotes("");
  };

  // Filtered Assets for Admin
  const filteredAssets = assets.filter((a) => {
    const matchesCat = selectedCategory === "ALL" || a.category === selectedCategory;
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      a.name.toLowerCase().includes(q) ||
      a.assetTag.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      (a.assignedToEmployeeName && a.assignedToEmployeeName.toLowerCase().includes(q));
    return matchesCat && matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight whitespace-nowrap">
            {isEmployee
              ? "My Workstation & Hardware Vault"
              : isManager
              ? managerTab === "TEAM"
                ? "Team Hardware & Device Distribution"
                : "My Personal Workstation"
              : "Corporate IT Asset & Inventory Management"}
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5D6B] mt-1 truncate hidden sm:block">
            {isEmployee
              ? "Assigned primary workstation, external displays, accessories, and active software licenses."
              : isManager
              ? "Oversee corporate hardware deployed across your direct reports, track device health, and request upgrades."
              : "Enterprise inventory, device assignments, procurement value, and warranties across all 4 branches."}
          </p>
        </div>

        {/* Persona Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Employee Action */}
          {isEmployee && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAssetForIssue(myAssets[0]?.id || "");
                setIsIssueModalOpen(true);
              }}
              className="h-8 text-xs font-semibold px-3 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430] rounded-xl"
              leftIcon={<Wrench className="w-3.5 h-3.5 text-[#1F8476]" />}
            >
              Report Hardware Issue
            </Button>
          )}

          {/* Manager Action */}
          {isManager && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAssetForIssue(myAssets[0]?.id || teamAssets[0]?.id || "");
                  setIsIssueModalOpen(true);
                }}
                className="h-8 text-xs font-semibold px-3 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430] rounded-xl"
                leftIcon={<LifeBuoy className="w-3.5 h-3.5 text-[#1F8476]" />}
              >
                Log IT Ticket
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setTeamReqEmpId(directReports[0]?.id || "");
                  setIsTeamReqModalOpen(true);
                }}
                className="h-8 text-xs font-bold px-3.5 bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
                leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
              >
                Request Team Hardware
              </Button>
            </>
          )}

          {/* Admin Actions */}
          {(isSuperAdmin || isHrAdmin) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTargetAssetForAllocation(null);
                  setIsAllocateModalOpen(true);
                }}
                className="h-8 text-xs font-semibold px-3 border-[#DDE3EA] hover:bg-[#F7F9FB] text-[#1B2430] rounded-xl"
                leftIcon={<UserCheck className="w-3.5 h-3.5 text-[#1F8476]" />}
                disabled={availableOptions.length === 0}
              >
                Allocate Asset
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddAssetModalOpen(true)}
                className="h-8 text-xs font-bold px-3.5 bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
                leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
              >
                Register Device
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MANAGER DUAL TAB SWITCHER                                             */}
      {/* ========================================================================= */}
      {isManager && (
        <div className="border-b border-[#DDE3EA] flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setManagerTab("TEAM")}
            className={`pb-3 transition-colors flex items-center gap-2 ${
              managerTab === "TEAM"
                ? "text-[#1F8476] border-b-2 border-[#1F8476] font-bold"
                : "text-[#697586] hover:text-[#1B2430]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Hardware Distribution ({teamAssets.length} Assets)</span>
          </button>

          <button
            onClick={() => setManagerTab("MY_ASSETS")}
            className={`pb-3 transition-colors flex items-center gap-2 ${
              managerTab === "MY_ASSETS"
                ? "text-[#1F8476] border-b-2 border-[#1F8476] font-bold"
                : "text-[#697586] hover:text-[#1B2430]"
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>My Personal Workstation ({myAssets.length} Items)</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PERSONA-SPECIFIC VIEWS                                                */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* A. EMPLOYEE VIEW (Personal Workstation Setup & Hardware Vault)             */}
      {/* ------------------------------------------------------------------------- */}
      {isEmployee && (
        <div className="space-y-6">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#697586]">Assigned Hardware Items</span>
                <PackageCheck className="w-4 h-4 text-[#1F8476]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1B2430]">{myAssets.length}</span>
                <span className="text-xs text-[#188038] font-semibold bg-[#E6F4EA] px-2 py-0.5 rounded-full border border-[#CEEAD6]">
                  Active &amp; Deployed
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#697586]">Security &amp; MDM Compliance</span>
                <ShieldCheck className="w-4 h-4 text-[#188038]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm font-bold text-[#1B2430]">FileVault Enrolled</span>
                <span className="text-[10px] text-[#697586]">SOC-2 Level 2</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#697586]">IT Service Desk SLA</span>
                <LifeBuoy className="w-4 h-4 text-[#4B5D6B]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm font-bold text-[#1B2430]">Pune Campus Hub</span>
                <span className="text-xs text-[#697586]">4h response</span>
              </div>
            </div>
          </div>

          {/* Assigned Devices Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1B2430] uppercase tracking-wider">
                Issued Company Devices &amp; Peripherals
              </h2>
              <span className="text-xs text-[#697586]">
                Employee Code: <strong className="text-[#1B2430] font-mono">{currentEmployee?.employeeCode || "EMP-1004"}</strong>
              </span>
            </div>

            {myAssets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#DDE3EA] p-12 text-center shadow-xs">
                <Laptop className="w-10 h-10 mx-auto text-[#1F8476] mb-3" />
                <h3 className="text-base font-bold text-[#1B2430]">No Hardware Assigned Yet</h3>
                <p className="text-xs text-[#697586] max-w-sm mx-auto mt-1">
                  Your workstation provisioning is currently being prepared by IT Services.
                </p>
                <Button
                  onClick={() => setIsIssueModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs border-[#DDE3EA]"
                >
                  Request Workstation Kit
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAssets.map((asset) => {
                  const Icon =
                    asset.category === "LAPTOP"
                      ? Laptop
                      : asset.category === "MONITOR"
                      ? Monitor
                      : asset.category === "LICENSE"
                      ? Key
                      : HardDrive;

                  return (
                    <div
                      key={asset.id}
                      className="bg-white rounded-2xl border border-[#DDE3EA] p-5 shadow-xs hover:border-[#80B6A1] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] flex items-center justify-center text-[#1F8476] shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <Badge variant="success" size="sm">
                            {asset.status}
                          </Badge>
                        </div>

                        <h3 className="text-sm font-bold text-[#1B2430] leading-tight mb-1">
                          {asset.name}
                        </h3>
                        <p className="text-xs text-[#697586] mb-3">{asset.model}</p>

                        <div className="space-y-2 text-xs pt-3 border-t border-[#DDE3EA]">
                          <div className="flex justify-between items-center">
                            <span className="text-[#697586]">Asset Tag:</span>
                            <span className="font-mono font-bold text-[#1F8476]">
                              {asset.assetTag}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#697586]">Serial Number:</span>
                            <span className="font-mono text-[#1B2430]">
                              {asset.serialNumber}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#697586]">Issued Date:</span>
                            <span className="text-[#1B2430]">
                              {asset.assignedDate ? formatDate(asset.assignedDate) : "Active"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#697586]">Warranty Expiry:</span>
                            <span className="text-[#1B2430]">
                              {formatDate(asset.warrantyExpiry)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#697586]">Condition:</span>
                            <span className="font-semibold text-[#188038] bg-[#E6F4EA] border border-[#CEEAD6] px-2 py-0.5 rounded text-[10px]">
                              {asset.condition}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#DDE3EA] flex items-center justify-between">
                        <span className="text-[11px] text-[#697586]">GA Enterprise Care</span>
                        <button
                          onClick={() => {
                            setSelectedAssetForIssue(asset.id);
                            setIsIssueModalOpen(true);
                          }}
                          className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1"
                        >
                          <span>Report Issue</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* IT Device Policy Notice */}
          <div className="bg-[#F7F9FB] border border-[#DDE3EA] rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#1F8476] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#1B2430]">
                  Company Hardware Asset Care &amp; Security Policy
                </p>
                <p className="text-[11px] text-[#697586]">
                  All devices are protected with endpoint encryption. In case of loss or theft, notify security immediately at support@ga-hrms.io.
                </p>
              </div>
            </div>
            <a
              href="#policy"
              onClick={(e) => {
                e.preventDefault();
                toastInfo("Corporate IT Handbook v2.4 (Pune Campus)");
              }}
              className="text-xs font-semibold text-[#1F8476] hover:underline whitespace-nowrap"
            >
              View IT Handbook →
            </a>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* B. MANAGER VIEW (Team Hardware Distribution & Health)                     */}
      {/* ------------------------------------------------------------------------- */}
      {isManager && (
        <div className="space-y-6">
          {/* Tab 1: Team Hardware Distribution */}
          {managerTab === "TEAM" && (
            <>
              {/* Manager Team Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-2xs">
                  <span className="text-xs font-semibold text-[#697586]">Direct Reports Supervised</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1B2430]">{directReports.length}</span>
                    <span className="text-xs text-[#697586]">engineers</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-2xs">
                  <span className="text-xs font-semibold text-[#697586]">Team Deployed Devices</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1B2430]">{teamAssets.length}</span>
                    <span className="text-xs text-[#188038] font-semibold bg-[#E6F4EA] px-2 py-0.5 rounded-full border border-[#CEEAD6]">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-2xs">
                  <span className="text-xs font-semibold text-[#697586]">Laptops Deployed</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1B2430]">
                      {teamAssets.filter((a) => a.category === "LAPTOP").length}
                    </span>
                    <span className="text-xs text-[#697586]">Mac / ThinkPad</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[#DDE3EA] bg-white shadow-2xs">
                  <span className="text-xs font-semibold text-[#697586]">Monitors &amp; Peripherals</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1B2430]">
                      {teamAssets.filter((a) => a.category !== "LAPTOP").length}
                    </span>
                    <span className="text-xs text-[#697586]">displays &amp; gear</span>
                  </div>
                </div>
              </div>

              {/* Team Hardware Table */}
              <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-[#DDE3EA] flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-[#1B2430]">Team Member Hardware Allocations</h2>
                    <p className="text-xs text-[#697586]">
                      Direct reports and their active corporate workstations in Engineering &amp; Design.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setTeamReqEmpId(directReports[0]?.id || "");
                      setIsTeamReqModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs border-[#DDE3EA] hover:bg-[#F7F9FB]"
                  >
                    + Request Kit for New Report
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                        <th className="py-3 px-4">Team Member</th>
                        <th className="py-3 px-4">Assigned Device</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Asset Tag</th>
                        <th className="py-3 px-4">Serial Number</th>
                        <th className="py-3 px-4">Warranty</th>
                        <th className="py-3 px-4">Condition</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE3EA]">
                      {teamAssets.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-[#697586]">
                            <Laptop className="w-8 h-8 mx-auto text-[#1F8476] mb-2" />
                            <p className="text-xs font-semibold text-[#1B2430]">No Devices Deployed in Team</p>
                            <p className="text-[11px] text-[#697586] mt-0.5">
                              Use "Request Team Hardware" above to request workstations for your direct reports.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        teamAssets.map((asset) => {
                          const emp = employees.find(
                            (e) => e.id === asset.assignedToEmployeeId || e.employeeCode === asset.assignedToEmployeeId
                          );

                          return (
                            <tr key={asset.id} className="hover:bg-[#F7F9FB] transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#1B2430]">
                                  {emp ? `${emp.firstName} ${emp.lastName}` : asset.assignedToEmployeeName}
                                </div>
                                <div className="text-[11px] font-mono text-[#697586]">
                                  {emp?.employeeCode || asset.assignedToEmployeeId}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#1B2430]">{asset.name}</div>
                                <div className="text-[11px] text-[#697586]">{asset.model}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0F4F8] border border-[#DDE3EA] text-[#4B5D6B]">
                                  {asset.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-[#1F8476]">
                                {asset.assetTag}
                              </td>
                              <td className="py-3 px-4 font-mono text-[#697586]">
                                {asset.serialNumber}
                              </td>
                              <td className="py-3 px-4 text-[#1B2430]">
                                {formatDate(asset.warrantyExpiry)}
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] font-semibold text-[#188038] bg-[#E6F4EA] px-2 py-0.5 rounded border border-[#CEEAD6]">
                                  {asset.condition}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedAssetForIssue(asset.id);
                                    setIsIssueModalOpen(true);
                                  }}
                                  className="text-xs font-semibold text-[#1F8476] hover:underline"
                                >
                                  Log Ticket
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Manager Personal Workstation */}
          {managerTab === "MY_ASSETS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-2xl border border-[#DDE3EA] p-5 shadow-xs hover:border-[#80B6A1] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] flex items-center justify-center text-[#1F8476] shrink-0">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <Badge variant="success" size="sm">
                        {asset.status}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-[#1B2430] leading-tight mb-1">
                      {asset.name}
                    </h3>
                    <p className="text-xs text-[#697586] mb-3">{asset.model}</p>

                    <div className="space-y-2 text-xs pt-3 border-t border-[#DDE3EA]">
                      <div className="flex justify-between items-center">
                        <span className="text-[#697586]">Asset Tag:</span>
                        <span className="font-mono font-bold text-[#1F8476]">{asset.assetTag}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#697586]">Serial Number:</span>
                        <span className="font-mono text-[#1B2430]">{asset.serialNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#697586]">Warranty Expiry:</span>
                        <span className="text-[#1B2430]">{formatDate(asset.warrantyExpiry)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#697586]">Condition:</span>
                        <span className="font-semibold text-[#188038] bg-[#E6F4EA] border border-[#CEEAD6] px-2 py-0.5 rounded text-[10px]">
                          {asset.condition}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#DDE3EA] flex items-center justify-between">
                    <span className="text-[11px] text-[#697586]">Manager Workstation</span>
                    <button
                      onClick={() => {
                        setSelectedAssetForIssue(asset.id);
                        setIsIssueModalOpen(true);
                      }}
                      className="text-xs font-semibold text-[#1F8476] hover:text-[#166C61] flex items-center gap-1"
                    >
                      <span>Report Issue</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* C. SUPER ADMIN & HR ADMIN VIEW (Corporate IT Operations & Stock)          */}
      {/* ------------------------------------------------------------------------- */}
      {(isSuperAdmin || isHrAdmin) && (
        <div className="space-y-6">
          {/* Executive IT Asset Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <KpiCard
              label="Total IT Assets"
              value={totalAssets}
              trend={{ value: `${totalAssets}`, label: "hardware & licenses", isPositive: true }}
              icon={<Laptop className="w-5 h-5 text-[#1B2430]" />}
              accentColor="neutral"
            />
            <KpiCard
              label="Assigned to Staff"
              value={allocatedAssets}
              trend={{
                value: `${Math.round((allocatedAssets / (totalAssets || 1)) * 100)}%`,
                label: "deployed",
                isPositive: true,
              }}
              icon={<UserCheck className="w-5 h-5 text-[#1F8476]" />}
              accentColor="indigo"
            />
            <KpiCard
              label="In Stock & Ready"
              value={availableAssets}
              trend={{ value: `${availableAssets}`, label: "ready to deploy", isPositive: true }}
              icon={<CheckCircle2 className="w-5 h-5 text-[#188038]" />}
              accentColor="emerald"
            />
            <KpiCard
              label="Under Maintenance"
              value={maintenanceAssets}
              trend={{ value: `${maintenanceAssets}`, label: "at service center", isPositive: false }}
              icon={<AlertTriangle className="w-5 h-5 text-[#E69F00]" />}
              accentColor="amber"
            />
            <KpiCard
              label="Capital Value"
              value={formatINR(totalCapitalValue)}
              trend={{ value: "Enterprise Book", label: "procurement cost", isPositive: true }}
              icon={<DollarSign className="w-5 h-5 text-[#1F8476]" />}
              accentColor="neutral"
            />
          </div>

          {/* Admin Tabs */}
          <div className="flex items-center gap-1 border-b border-[#DDE3EA]">
            <button
              type="button"
              onClick={() => setAdminTab("inventory")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px",
                adminTab === "inventory"
                  ? "border-[#1F8476] text-[#1F8476]"
                  : "border-transparent text-[#697586] hover:text-[#1B2430]"
              )}
            >
              Hardware Inventory
              <span className="text-[11px] font-bold bg-[#F0F4F8] text-[#1B2430] px-2 py-0.5 rounded-full border border-[#DDE3EA]">
                {assets.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAdminTab("allocations")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px",
                adminTab === "allocations"
                  ? "border-[#1F8476] text-[#1F8476]"
                  : "border-transparent text-[#697586] hover:text-[#1B2430]"
              )}
            >
              Staff Allocations Matrix
              <span className="text-[11px] font-bold bg-[#F0F4F8] text-[#1B2430] px-2 py-0.5 rounded-full border border-[#DDE3EA]">
                {allocatedAssets}
              </span>
            </button>
          </div>

          {/* Admin Tab 1: Inventory List */}
          {adminTab === "inventory" && (
            <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-[#DDE3EA] space-y-3">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                          isSelected
                            ? "bg-[#1F8476] text-white border-[#1F8476] shadow-xs"
                            : "bg-[#F7F9FB] hover:bg-white text-[#1B2430] border-[#DDE3EA]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#DDE3EA]">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#697586]" />
                    <input
                      type="text"
                      placeholder="Search tag, serial, model, employee..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 text-xs bg-[#F7F9FB] border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:bg-white focus:outline-none focus:border-[#1F8476] transition-all"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="ALLOCATED">Allocated</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>

                    {(searchQuery || statusFilter !== "ALL" || selectedCategory !== "ALL") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("ALL");
                          setSelectedCategory("ALL");
                        }}
                        className="px-2.5 py-1.5 text-xs text-[#697586] hover:text-[#1B2430] flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                      <th className="py-3 px-4">Asset Tag</th>
                      <th className="py-3 px-4">Device / Asset Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Serial Number</th>
                      <th className="py-3 px-4">Cost</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE3EA]">
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-[#697586]">
                          <Laptop className="w-8 h-8 mx-auto text-[#1F8476] mb-2" />
                          <p className="text-xs font-semibold text-[#1B2430]">No Assets Found</p>
                          <p className="text-[11px] text-[#697586] mt-0.5">
                            Try adjusting your search criteria or category filter.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-[#F7F9FB] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1F8476]">
                            {asset.assetTag}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#1B2430] block">{asset.name}</span>
                            <span className="text-[10px] text-[#697586]">
                              Model: {asset.model} • Warranty: {formatDate(asset.warrantyExpiry)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0F4F8] border border-[#DDE3EA] text-[#4B5D6B]">
                              {asset.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#697586]">
                            {asset.serialNumber}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#1B2430]">
                            {formatINR(asset.purchaseCost)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                asset.status === "ALLOCATED"
                                  ? "bg-[#EBF7F5] text-[#1F8476] border-[#80B6A1]"
                                  : asset.status === "AVAILABLE"
                                  ? "bg-[#E6F4EA] text-[#188038] border-[#CEEAD6]"
                                  : "bg-[#FEF7E0] text-[#1B2430] border-[#FEEFC3]"
                              }`}
                            >
                              {asset.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {asset.assignedToEmployeeName ? (
                              <span className="font-semibold text-[#1B2430] flex items-center gap-1">
                                <User className="w-3 h-3 text-[#1F8476]" />
                                {asset.assignedToEmployeeName}
                              </span>
                            ) : (
                              <span className="text-[#697586] italic">In IT Stock</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {asset.status === "AVAILABLE" ? (
                              <button
                                onClick={() => openAllocateForSpecific(asset)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#1F8476] hover:bg-[#166C61] rounded-lg shadow-2xs"
                              >
                                Assign
                              </button>
                            ) : asset.status === "ALLOCATED" ? (
                              <button
                                onClick={() => {
                                  returnAsset(asset.id);
                                  toastSuccess(`Asset ${asset.assetTag} checked back into IT stock.`);
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#C62828] hover:bg-[#FCE8E6] rounded-lg border border-[#FAD2CF] inline-flex items-center gap-1"
                                title="Check back into stock"
                              >
                                <RotateCcw className="w-3 h-3" /> Return
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#697586] italic">In Service</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Tab 2: Allocations Matrix */}
          {adminTab === "allocations" && (
            <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-[#DDE3EA]">
                <h2 className="text-sm font-bold text-[#1B2430]">Staff Hardware Allocations Matrix</h2>
                <p className="text-xs text-[#697586]">
                  Active company devices deployed to team members across all 4 branches.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F7F9FB] border-b border-[#DDE3EA] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Assigned Asset</th>
                      <th className="py-3 px-4">Asset Tag</th>
                      <th className="py-3 px-4">Date Issued</th>
                      <th className="py-3 px-4">Condition</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE3EA]">
                    {assets
                      .filter((a) => a.status === "ALLOCATED")
                      .map((asset) => (
                        <tr key={asset.id} className="hover:bg-[#F7F9FB] transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#1B2430]">
                            {asset.assignedToEmployeeName}
                          </td>
                          <td className="py-3.5 px-4 text-[#697586]">{asset.department || "General"}</td>
                          <td className="py-3.5 px-4 font-semibold text-[#1B2430]">{asset.name}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1F8476]">
                            {asset.assetTag}
                          </td>
                          <td className="py-3.5 px-4 text-[#697586]">
                            {asset.assignedDate ? formatDate(asset.assignedDate) : "Active"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-semibold text-[#188038] bg-[#E6F4EA] px-2 py-0.5 rounded border border-[#CEEAD6]">
                              {asset.condition}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                returnAsset(asset.id);
                                toastSuccess(`Asset ${asset.assetTag} checked back into IT stock.`);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#C62828] hover:bg-[#FCE8E6] rounded-lg border border-[#FAD2CF] inline-flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Return to Stock
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS & DIALOGS                                                       */}
      {/* ========================================================================= */}

      {/* MODAL 1: Report Issue / Service Ticket (Employee & Manager) */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Report Hardware Issue / Service Request"
        size="md"
      >
        <form onSubmit={handleReportIssueSubmit} className="space-y-4">
          <p className="text-xs text-[#697586]">
            Submit a service request to IT Desk Hinjawadi Pune. A technician will assist with troubleshooting or kit swap.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Select Device
            </label>
            <select
              value={selectedAssetForIssue}
              onChange={(e) => setSelectedAssetForIssue(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:outline-none focus:border-[#1F8476] transition-all"
              required
            >
              {(isManager ? [...myAssets, ...teamAssets] : myAssets).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name} ({a.serialNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Issue Category
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:outline-none focus:border-[#1F8476] transition-all"
            >
              <option value="HARDWARE_FAULT">Hardware Defect / Not Powering On</option>
              <option value="SCREEN_BATTERY">Display Flicker / Battery Drainage</option>
              <option value="PERIPHERAL_REQ">Peripheral Request (Monitor / Keyboard / Hub)</option>
              <option value="SOFTWARE_ACCESS">OS Re-image / Enterprise VPN Access</option>
              <option value="LOST_DAMAGED">Physical Damage / Accidental Drop</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIssuePriority("STANDARD")}
                className={cn(
                  "p-2 rounded-xl border text-center transition-all",
                  issuePriority === "STANDARD"
                    ? "border-[#1F8476] bg-[#EBF7F5] text-[#1F8476] font-bold"
                    : "border-[#DDE3EA] bg-white text-[#697586] hover:bg-[#F7F9FB]"
                )}
              >
                Standard (Next Day)
              </button>
              <button
                type="button"
                onClick={() => setIssuePriority("URGENT")}
                className={cn(
                  "p-2 rounded-xl border text-center transition-all",
                  issuePriority === "URGENT"
                    ? "border-[#C62828] bg-[#FCE8E6] text-[#C62828] font-bold"
                    : "border-[#DDE3EA] bg-white text-[#697586] hover:bg-[#F7F9FB]"
                )}
              >
                Work Blocker (&lt; 4 Hours)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Issue Description &amp; Symptoms
            </label>
            <textarea
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe what happened, any error codes, or symptoms..."
              className="w-full text-xs p-2.5 rounded-xl border border-[#DDE3EA] bg-white text-[#1B2430] focus:outline-none focus:border-[#1F8476] transition-all"
              required
            />
          </div>

          <div className="pt-3 border-t border-[#DDE3EA] flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="text-xs border-[#DDE3EA] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="text-xs bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Request Team Hardware Requisition (Manager) */}
      <Modal
        isOpen={isTeamReqModalOpen}
        onClose={() => setIsTeamReqModalOpen(false)}
        title="Request Team Hardware Requisition"
        size="md"
      >
        <form onSubmit={handleTeamReqSubmit} className="space-y-4">
          <p className="text-xs text-[#697586]">
            Requisition hardware kits or upgrades for direct reports. Routes to IT Procurement &amp; HR.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Direct Report Member
            </label>
            <select
              value={teamReqEmpId}
              onChange={(e) => setTeamReqEmpId(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:outline-none focus:border-[#1F8476] transition-all"
              required
            >
              {directReports.map((dr) => (
                <option key={dr.id} value={dr.id}>
                  {dr.firstName} {dr.lastName} ({dr.employeeCode}) — {dr.designationId || "Engineer"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Required Equipment Specification
            </label>
            <select
              value={teamReqCategory}
              onChange={(e) => setTeamReqCategory(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#DDE3EA] rounded-xl text-[#1B2430] focus:outline-none focus:border-[#1F8476] transition-all"
            >
              <option value="LAPTOP">Apple MacBook Pro 14" (M3 Pro, 18GB RAM) - Senior Dev Kit</option>
              <option value="LAPTOP_AMD">Lenovo ThinkPad T14 Gen 4 (Ryzen 7 PRO, 32GB) - Dev Kit</option>
              <option value="MONITOR">Dell UltraSharp 27" 4K USB-C Hub Display (U2723QE)</option>
              <option value="PERIPHERAL">Apple Magic Keyboard &amp; Trackpad Ergonomic Bundle</option>
              <option value="LICENSE">Figma Organization / JetBrains Enterprise Seat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B2430] mb-1">
              Business Justification &amp; Sprint Needs
            </label>
            <textarea
              rows={3}
              value={teamReqNotes}
              onChange={(e) => setTeamReqNotes(e.target.value)}
              placeholder="e.g. Required for high-compute local build workflows and multi-service Docker testing..."
              className="w-full text-xs p-2.5 rounded-xl border border-[#DDE3EA] bg-white text-[#1B2430] focus:outline-none focus:border-[#1F8476] transition-all"
              required
            />
          </div>

          <div className="pt-3 border-t border-[#DDE3EA] flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsTeamReqModalOpen(false)}
              className="text-xs border-[#DDE3EA] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="text-xs bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
            >
              Submit Requisition
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Register New Asset (Admin Only) */}
      <Modal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        title="Register New Company Asset"
        size="lg"
      >
        <form onSubmit={handleRegisterAsset} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Asset Tag / Inventory ID"
              placeholder="e.g. AST-LT-109"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              required
            />
            <Select
              label="Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as AssetCategory)}
              options={[
                { value: "LAPTOP", label: "Laptop / Computer" },
                { value: "MONITOR", label: "External Display / Monitor" },
                { value: "MOBILE", label: "Phone / Tablet" },
                { value: "ACCESSORY", label: "Accessory / Peripheral" },
                { value: "LICENSE", label: "Software License" },
              ]}
            />
          </div>

          <Input
            label="Device / Model Name"
            placeholder="e.g. Apple MacBook Pro 14 (M3 Max, 36GB, 1TB)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manufacturer Model"
              placeholder="e.g. MacBook Pro 14-inch"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
            />
            <Input
              label="Serial Number"
              placeholder="e.g. C02GL01X..."
              value={newSerial}
              onChange={(e) => setNewSerial(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Purchase Cost (₹)"
              type="number"
              value={newCost}
              onChange={(e) => setNewCost(Number(e.target.value))}
            />
            <Input
              label="Purchase Date"
              type="date"
              value={newPurchaseDate}
              onChange={(e) => setNewPurchaseDate(e.target.value)}
            />
            <Input
              label="Warranty Expiry"
              type="date"
              value={newWarranty}
              onChange={(e) => setNewWarranty(e.target.value)}
            />
          </div>

          <Select
            label="Initial Physical Condition"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value as AssetCondition)}
            options={[
              { value: "EXCELLENT", label: "Brand New / Excellent" },
              { value: "GOOD", label: "Good" },
              { value: "FAIR", label: "Fair" },
              { value: "NEEDS_REPAIR", label: "Needs Repair" },
            ]}
          />

          <div className="pt-3 border-t border-[#DDE3EA] flex justify-end gap-2.5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsAddAssetModalOpen(false)}
              className="text-xs border-[#DDE3EA] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="text-xs bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
            >
              Save &amp; Register Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Allocate Asset to Employee (Admin Only) */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => {
          setIsAllocateModalOpen(false);
          setTargetAssetForAllocation(null);
        }}
        title="Allocate Asset to Employee"
        size="md"
      >
        <form onSubmit={handleAllocateSubmit} className="space-y-4">
          {targetAssetForAllocation ? (
            <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#DDE3EA] text-xs space-y-1">
              <div className="font-bold text-[#1B2430]">{targetAssetForAllocation.name}</div>
              <div className="text-[#697586] font-mono">
                Tag: {targetAssetForAllocation.assetTag} • SN: {targetAssetForAllocation.serialNumber}
              </div>
            </div>
          ) : (
            <Select
              label="Select Available Device"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              options={availableOptions.map((a) => ({
                value: a.id,
                label: `${a.assetTag} — ${a.name} (${a.category})`,
              }))}
            />
          )}

          <Select
            label="Assign to Employee"
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            options={employees.map((e) => ({
              value: e.id,
              label: `${e.employeeCode} - ${e.firstName} ${e.lastName} (${e.departmentId})`,
            }))}
          />

          <div className="pt-3 border-t border-[#DDE3EA] flex justify-end gap-2.5">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsAllocateModalOpen(false);
                setTargetAssetForAllocation(null);
              }}
              className="text-xs border-[#DDE3EA] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="text-xs bg-[#1F8476] hover:bg-[#166C61] text-white rounded-xl shadow-xs"
            >
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
