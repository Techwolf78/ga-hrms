import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Globe,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { Branch, Company, Employee } from "../../types/hrms";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { GaHrmsLogo } from "../../components/ui/GaHrmsLogo";

export function OrganizationPage() {
  const {
    company,
    branches,
    departments,
    designations,
    employees,
    updateCompany,
    addBranch,
    updateBranch,
    deleteBranch,
    transferBranchEmployees,
    updateEmployee,
  } = useHrms();
  const navigate = useNavigate();

  const [expandedBranch, setExpandedBranch] = useState<string | null>(branches[0]?.id || null);

  // Modals state
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [transferringBranch, setTransferringBranch] = useState<Branch | null>(null);
  const [transferringEmployee, setTransferringEmployee] = useState<Employee | null>(null);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);

  // Transfer destination branch state
  const [destinationBranchId, setDestinationBranchId] = useState<string>("");
  const [individualTargetBranchId, setIndividualTargetBranchId] = useState<string>("");

  // Branch form state
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchCity, setBranchCity] = useState("");
  const [branchState, setBranchState] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchFormError, setBranchFormError] = useState("");

  // Company form state
  const [compName, setCompName] = useState("");
  const [compTagline, setCompTagline] = useState("");
  const [compHq, setCompHq] = useState("");
  const [compCin, setCompCin] = useState("");
  const [compGstin, setCompGstin] = useState("");
  const [compPan, setCompPan] = useState("");
  const [compPhone, setCompPhone] = useState("");
  const [compEmail, setCompEmail] = useState("");
  const [compWebsite, setCompWebsite] = useState("");

  // Open Add Branch Modal
  const handleOpenAddBranch = () => {
    setBranchName("");
    setBranchCode("");
    setBranchCity("");
    setBranchState("");
    setBranchAddress("");
    setBranchFormError("");
    setIsAddBranchOpen(true);
  };

  // Open Edit Branch Modal
  const handleOpenEditBranch = (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchCode(branch.code);
    setBranchCity(branch.city);
    setBranchState(branch.state);
    setBranchAddress(branch.address);
    setBranchFormError("");
  };

  // Open Transfer Modal for entire branch
  const handleOpenTransferBranch = (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransferringBranch(branch);
    const otherBranches = branches.filter((b) => b.id !== branch.id);
    setDestinationBranchId(otherBranches[0]?.id || "");
  };

  // Open Transfer Modal for individual employee
  const handleOpenTransferEmployee = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransferringEmployee(emp);
    const otherBranches = branches.filter((b) => b.id !== emp.branchId);
    setIndividualTargetBranchId(otherBranches[0]?.id || "");
  };

  // Open Delete Branch
  const handleOpenDeleteBranch = (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingBranch(branch);
    const otherBranches = branches.filter((b) => b.id !== branch.id);
    setDestinationBranchId(otherBranches[0]?.id || "");
  };

  // Save new Branch
  const handleCreateBranch = () => {
    if (!branchName.trim() || !branchCode.trim() || !branchCity.trim() || !branchAddress.trim()) {
      setBranchFormError("Please fill in all required fields (Name, Code, City, and Address).");
      return;
    }
    const newBranch = addBranch({
      name: branchName.trim(),
      code: branchCode.trim().toUpperCase(),
      city: branchCity.trim(),
      state: branchState.trim() || "India",
      address: branchAddress.trim(),
    });
    setIsAddBranchOpen(false);
    setExpandedBranch(newBranch.id);
  };

  // Update existing Branch
  const handleSaveEditBranch = () => {
    if (!editingBranch) return;
    if (!branchName.trim() || !branchCode.trim() || !branchCity.trim() || !branchAddress.trim()) {
      setBranchFormError("Please fill in all required fields (Name, Code, City, and Address).");
      return;
    }
    updateBranch(editingBranch.id, {
      name: branchName.trim(),
      code: branchCode.trim().toUpperCase(),
      city: branchCity.trim(),
      state: branchState.trim() || "India",
      address: branchAddress.trim(),
    });
    setEditingBranch(null);
  };

  // Save Company Updates
  const handleOpenEditCompany = () => {
    setCompName(company.name || "");
    setCompTagline(company.tagline || "");
    setCompHq(company.headquarters || "");
    setCompCin(company.cin || "");
    setCompGstin(company.gstin || "");
    setCompPan(company.pan || "");
    setCompPhone(company.phone || "");
    setCompEmail(company.email || "");
    setCompWebsite(company.website || "");
    setIsEditCompanyOpen(true);
  };

  const handleSaveCompany = () => {
    if (!compName.trim()) return;
    updateCompany({
      name: compName.trim(),
      tagline: compTagline.trim(),
      headquarters: compHq.trim(),
      cin: compCin.trim(),
      gstin: compGstin.trim(),
      pan: compPan.trim(),
      phone: compPhone.trim(),
      email: compEmail.trim(),
      website: compWebsite.trim(),
    });
    setIsEditCompanyOpen(false);
  };

  // Execute Shift & Delete
  const handleShiftStaffAndDelete = () => {
    if (!deletingBranch || !destinationBranchId) return;
    transferBranchEmployees(deletingBranch.id, destinationBranchId);
    deleteBranch(deletingBranch.id);
    setDeletingBranch(null);
  };

  // Execute Shift Staff Only
  const handleShiftStaffOnly = () => {
    if (!deletingBranch || !destinationBranchId) return;
    transferBranchEmployees(deletingBranch.id, destinationBranchId);
    setDeletingBranch(null);
  };

  // Execute Branch Staff Transfer
  const handleConfirmBranchTransfer = () => {
    if (!transferringBranch || !destinationBranchId) return;
    transferBranchEmployees(transferringBranch.id, destinationBranchId);
    setTransferringBranch(null);
  };

  // Execute Single Employee Transfer
  const handleConfirmSingleEmployeeTransfer = () => {
    if (!transferringEmployee || !individualTargetBranchId) return;
    updateEmployee(transferringEmployee.id, { branchId: individualTargetBranchId });
    setTransferringEmployee(null);
  };

  // Deletion helper
  const deletingBranchEmployees = deletingBranch
    ? employees.filter((e) => e.branchId === deletingBranch.id)
    : [];

  const transferringBranchEmployees = transferringBranch
    ? employees.filter((e) => e.branchId === transferringBranch.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
            Organization Hierarchy
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Multi-branch organizational structure, functional department trees, and reporting lines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenEditCompany}
            variant="outline"
            size="md"
            leftIcon={<Edit2 className="w-4 h-4 text-gray-600" />}
          >
            Edit Company
          </Button>
          <Button
            onClick={handleOpenAddBranch}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Branch
          </Button>
        </div>
      </div>

      {/* Root Company Card */}
      <div className="bg-gray-950 text-white p-6 sm:p-8 rounded-card border border-gray-800 shadow-elevated relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 text-white border border-white/10 flex items-center justify-center p-2.5 shadow-sm flex-shrink-0">
              <GaHrmsLogo size="md" variant="dark" iconOnly />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {company.name}
                </h2>
                <Badge variant="neutral" size="sm" className="bg-white/10 text-white border border-white/20">
                  Root Parent
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {company.headquarters} • CIN: <span className="font-mono text-gray-300">{company.cin}</span>
              </p>
              {company.tagline && (
                <p className="text-xs text-gray-500 italic mt-0.5">{company.tagline}</p>
              )}

              {/* Company metadata links */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
                {company.email && (
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    {company.email}
                  </span>
                )}
                {company.phone && (
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    {company.phone}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-brand-primary transition-colors underline decoration-gray-600 underline-offset-2"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-500" />
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs text-gray-300 bg-white/5 p-4 rounded-xl border border-white/10 flex-shrink-0">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                Total Branches
              </span>
              <p className="text-lg font-bold text-white mt-0.5">{branches.length}</p>
            </div>
            <div className="w-px h-9 bg-white/15" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                Departments
              </span>
              <p className="text-lg font-bold text-white mt-0.5">{departments.length}</p>
            </div>
            <div className="w-px h-9 bg-white/15" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                Staff Strength
              </span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{employees.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branches Tier */}
      <div className="space-y-4 pl-4 sm:pl-8 border-l-2 border-gray-200 ml-4 sm:ml-8">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Pan-India Operating Locations & Campuses
            </h3>
            <Badge variant="neutral" size="sm">
              {branches.length} Locations
            </Badge>
          </div>
          <Button
            onClick={handleOpenAddBranch}
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Campus
          </Button>
        </div>

        {branches.length === 0 ? (
          <div className="bg-white rounded-card border border-surface-border p-8 text-center space-y-3">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">No branches added yet</h4>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Add your first operating campus or office branch to organize teams and reporting lines.
            </p>
            <Button
              onClick={handleOpenAddBranch}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add First Branch
            </Button>
          </div>
        ) : (
          branches.map((b) => {
            const isBranchExpanded = expandedBranch === b.id;
            const branchEmployees = employees.filter((e) => e.branchId === b.id);
            const branchDepartments = departments.filter((d) =>
              branchEmployees.some((e) => e.departmentId === d.id)
            );

            return (
              <div
                key={b.id}
                className="bg-white rounded-card border border-surface-border shadow-card overflow-hidden transition-all hover:border-gray-300"
              >
                {/* Branch Header */}
                <div
                  onClick={() => setExpandedBranch(isBranchExpanded ? null : b.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center font-bold flex-shrink-0">
                      <MapPin className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-text-primary">
                          {b.name}
                        </h4>
                        <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                          {b.code}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{b.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                    <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200/60">
                      {branchEmployees.length} Staff
                    </span>

                    {/* Interactive Action Buttons */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* Shift / Transfer Staff button */}
                      {branchEmployees.length > 0 && branches.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenTransferBranch(b, e)}
                          className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                          title="Shift Staff to Another Branch"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Branch button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditBranch(b, e)}
                        className="p-1.5 text-text-muted hover:text-gray-950 hover:bg-gray-200/60 rounded-lg transition-colors"
                        title="Edit Branch Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Branch button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenDeleteBranch(b, e)}
                        className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-gray-400 pl-1">
                      {isBranchExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Departments inside this branch */}
                {isBranchExpanded && (
                  <div className="p-4 sm:p-6 bg-surface-subtle/50 border-t border-surface-border space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Departments Located at {b.city} ({branchDepartments.length} active units)
                      </p>
                      <div className="text-[11px] text-gray-500 font-medium">
                        Region: <span className="font-semibold text-gray-800">{b.city}, {b.state}</span>
                      </div>
                    </div>

                    {branchEmployees.length === 0 ? (
                      <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center space-y-2">
                        <Users className="w-6 h-6 text-gray-400 mx-auto" />
                        <p className="text-xs font-semibold text-gray-700">No staff members currently assigned</p>
                        <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                          New hires or employee transfers can be mapped to this campus location.
                        </p>
                        <Button
                          onClick={() => navigate("/people/employees")}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          Browse Employee Directory
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {departments.map((d) => {
                          const branchDeptEmployees = branchEmployees.filter(
                            (e) => e.departmentId === d.id
                          );
                          if (branchDeptEmployees.length === 0) return null;

                          return (
                            <div
                              key={d.id}
                              className="bg-white p-4 rounded-xl border border-surface-border shadow-xs space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-gray-700" />
                                  <span className="text-xs font-bold text-gray-950">{d.name}</span>
                                </div>
                                <Badge variant="neutral" size="sm">
                                  {branchDeptEmployees.length} Members
                                </Badge>
                              </div>

                              {/* Member avatars */}
                              <div className="space-y-2 pt-2 border-t border-gray-100">
                                {branchDeptEmployees.map((emp) => (
                                  <div
                                    key={emp.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                  >
                                    <div
                                      onClick={() => navigate(`/people/employees/${emp.id}`)}
                                      className="flex items-center gap-2.5 cursor-pointer flex-1"
                                    >
                                      <Avatar
                                        src={emp.avatar}
                                        name={`${emp.firstName} ${emp.lastName}`}
                                        size="xs"
                                      />
                                      <div>
                                        <p className="text-xs font-semibold text-text-primary group-hover:text-black">
                                          {emp.firstName} {emp.lastName}
                                        </p>
                                        <p className="text-[10px] text-text-muted">
                                          {emp.employeeCode} • {designations.find((ds) => ds.id === emp.designationId)?.title || "Staff"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Individual Shift Employee Button */}
                                      {branches.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={(e) => handleOpenTransferEmployee(emp, e)}
                                          className="p-1 text-gray-400 hover:text-brand-primary hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                          title={`Shift ${emp.firstName} to another branch`}
                                        >
                                          <ArrowRightLeft className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      <ArrowRight
                                        onClick={() => navigate(`/people/employees/${emp.id}`)}
                                        className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ADD BRANCH MODAL */}
      <Modal
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        title="Add New Operating Branch"
        description="Establish a new regional campus, hub, or branch office in the hierarchy."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setIsAddBranchOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateBranch}>
              Create Branch
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {branchFormError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {branchFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch / Campus Name"
              placeholder="e.g. Hyderabad Innovation Hub"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              required
            />
            <Input
              label="Branch Code"
              placeholder="e.g. HYD-01"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="e.g. Hyderabad"
              value={branchCity}
              onChange={(e) => setBranchCity(e.target.value)}
              required
            />
            <Input
              label="State / Province"
              placeholder="e.g. Telangana"
              value={branchState}
              onChange={(e) => setBranchState(e.target.value)}
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Campus Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 bg-white border border-surface-border rounded-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary min-h-[80px]"
              placeholder="Full building, street, locality and postal code"
              value={branchAddress}
              onChange={(e) => setBranchAddress(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>

      {/* EDIT BRANCH MODAL */}
      <Modal
        isOpen={!!editingBranch}
        onClose={() => setEditingBranch(null)}
        title="Edit Branch Location"
        description="Update campus name, code, or physical address."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setEditingBranch(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditBranch}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {branchFormError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {branchFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch / Campus Name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              required
            />
            <Input
              label="Branch Code"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              value={branchCity}
              onChange={(e) => setBranchCity(e.target.value)}
              required
            />
            <Input
              label="State / Province"
              value={branchState}
              onChange={(e) => setBranchState(e.target.value)}
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Campus Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 bg-white border border-surface-border rounded-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary min-h-[80px]"
              value={branchAddress}
              onChange={(e) => setBranchAddress(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>

      {/* EDIT COMPANY PROFILE MODAL */}
      <Modal
        isOpen={isEditCompanyOpen}
        onClose={() => setIsEditCompanyOpen(false)}
        title="Edit Organization Details"
        description="Update enterprise registration credentials, statutory identifiers, and headquarters."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setIsEditCompanyOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCompany}>
              Save Organization Profile
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              placeholder="e.g. Gryphon Technologies India Pvt. Ltd."
              required
            />
            <Input
              label="Corporate Tagline"
              value={compTagline}
              onChange={(e) => setCompTagline(e.target.value)}
              placeholder="e.g. Enterprise Workforce Operations"
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Registered Headquarters Address
            </label>
            <textarea
              className="w-full px-3 py-2 bg-white border border-surface-border rounded-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary min-h-[70px]"
              value={compHq}
              onChange={(e) => setCompHq(e.target.value)}
              placeholder="Registered HQ address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="CIN"
              value={compCin}
              onChange={(e) => setCompCin(e.target.value.toUpperCase())}
              placeholder="U72900PN2022PTC215689"
            />
            <Input
              label="GSTIN"
              value={compGstin}
              onChange={(e) => setCompGstin(e.target.value.toUpperCase())}
              placeholder="27AABCG1234F1Z8"
            />
            <Input
              label="PAN"
              value={compPan}
              onChange={(e) => setCompPan(e.target.value.toUpperCase())}
              placeholder="AABCG1234F"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Official Email"
              type="email"
              value={compEmail}
              onChange={(e) => setCompEmail(e.target.value)}
              placeholder="contact@company.com"
            />
            <Input
              label="Official Phone"
              value={compPhone}
              onChange={(e) => setCompPhone(e.target.value)}
              placeholder="+91 (020) 6745-9000"
            />
            <Input
              label="Website URL"
              value={compWebsite}
              onChange={(e) => setCompWebsite(e.target.value)}
              placeholder="https://company.com"
            />
          </div>
        </div>
      </Modal>

      {/* SHIFT STAFF & DELETE MODAL (When branch has active employees) */}
      <Modal
        isOpen={!!deletingBranch && deletingBranchEmployees.length > 0}
        onClose={() => setDeletingBranch(null)}
        title="Shift Active Employees to Delete Branch"
        description={`"${deletingBranch?.name}" currently has ${deletingBranchEmployees.length} active employee(s) assigned.`}
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full">
            <Button variant="outline" onClick={() => setDeletingBranch(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                onClick={handleShiftStaffOnly}
                disabled={!destinationBranchId}
                className="w-full sm:w-auto text-xs"
              >
                Shift Staff Only
              </Button>
              <Button
                variant="danger"
                onClick={handleShiftStaffAndDelete}
                disabled={!destinationBranchId}
                className="w-full sm:w-auto text-xs"
              >
                Shift Staff & Delete Branch
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-semibold text-amber-950">Active Employees Must Be Shifted First</p>
              <p>
                To maintain payroll records, department reporting lines, and compliance, choose which
                branch campus these {deletingBranchEmployees.length} staff members will be transferred to:
              </p>
            </div>
          </div>

          {branches.length > 1 ? (
            <div className="space-y-2">
              <Select
                label="Transfer Destination Branch"
                value={destinationBranchId}
                onChange={(e) => setDestinationBranchId(e.target.value)}
                options={branches
                  .filter((b) => b.id !== deletingBranch?.id)
                  .map((b) => ({
                    value: b.id,
                    label: `${b.name} (${b.code}) — ${b.city}`,
                  }))}
                required
              />
            </div>
          ) : (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg">
              There are no other branches available to receive transferred employees. Please add another branch first.
            </div>
          )}

          {/* List of employees being shifted */}
          <div>
            <p className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">
              Staff Members to be Shifted ({deletingBranchEmployees.length})
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-surface-border rounded-xl p-2 bg-gray-50/50">
              {deletingBranchEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar src={emp.avatar} name={`${emp.firstName} ${emp.lastName}`} size="xs" />
                    <div>
                      <p className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                      <p className="text-[10px] text-gray-500">{emp.employeeCode}</p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {departments.find((d) => d.id === emp.departmentId)?.name || "Department"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* STANDARD DELETE BRANCH CONFIRMATION (When branch has 0 employees) */}
      <ConfirmDialog
        isOpen={!!deletingBranch && deletingBranchEmployees.length === 0}
        onClose={() => setDeletingBranch(null)}
        title={`Delete Branch "${deletingBranch?.name}"?`}
        description={`Are you sure you want to remove the branch "${deletingBranch?.name}" (${deletingBranch?.code})? This branch currently has 0 active employees and can be safely removed.`}
        confirmText="Delete Branch"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deletingBranch) {
            deleteBranch(deletingBranch.id);
          }
        }}
      />

      {/* DEDICATED TRANSFER BRANCH STAFF MODAL (Anytime shift) */}
      <Modal
        isOpen={!!transferringBranch}
        onClose={() => setTransferringBranch(null)}
        title={`Shift Staff from "${transferringBranch?.name}"`}
        description={`Reassign all ${transferringBranchEmployees.length} employee(s) to another branch campus.`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setTransferringBranch(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmBranchTransfer}
              disabled={!destinationBranchId}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Transfer All Staff
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="New Destination Branch"
            value={destinationBranchId}
            onChange={(e) => setDestinationBranchId(e.target.value)}
            options={branches
              .filter((b) => b.id !== transferringBranch?.id)
              .map((b) => ({
                value: b.id,
                label: `${b.name} (${b.code}) — ${b.city}`,
              }))}
            required
          />

          <div>
            <p className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">
              Staff Members Moving ({transferringBranchEmployees.length})
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-surface-border rounded-xl p-2 bg-gray-50/50">
              {transferringBranchEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar src={emp.avatar} name={`${emp.firstName} ${emp.lastName}`} size="xs" />
                    <div>
                      <p className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                      <p className="text-[10px] text-gray-500">{emp.employeeCode}</p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {departments.find((d) => d.id === emp.departmentId)?.name || "Department"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* SINGLE EMPLOYEE TRANSFER MODAL */}
      <Modal
        isOpen={!!transferringEmployee}
        onClose={() => setTransferringEmployee(null)}
        title="Shift Employee to Another Campus"
        description={`Transfer ${transferringEmployee?.firstName} ${transferringEmployee?.lastName} (${transferringEmployee?.employeeCode}) to a new branch office.`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setTransferringEmployee(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSingleEmployeeTransfer}
              disabled={!individualTargetBranchId}
            >
              Confirm Transfer
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <Avatar
              src={transferringEmployee?.avatar}
              name={`${transferringEmployee?.firstName} ${transferringEmployee?.lastName}`}
              size="sm"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {transferringEmployee?.firstName} {transferringEmployee?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                Current Branch:{" "}
                <span className="font-medium text-gray-800">
                  {branches.find((b) => b.id === transferringEmployee?.branchId)?.name || "Branch"}
                </span>
              </p>
            </div>
          </div>

          <Select
            label="Select New Branch"
            value={individualTargetBranchId}
            onChange={(e) => setIndividualTargetBranchId(e.target.value)}
            options={branches
              .filter((b) => b.id !== transferringEmployee?.branchId)
              .map((b) => ({
                value: b.id,
                label: `${b.name} (${b.code}) — ${b.city}`,
              }))}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
