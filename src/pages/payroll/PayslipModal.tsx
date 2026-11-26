import React from "react";
import { createPortal } from "react-dom";
import { Download, Printer, Building2, ShieldCheck, X } from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { PayrollRecord } from "../../types/hrms";
import { Button } from "../../components/ui/Button";
import { formatINR, formatDate } from "../../lib/utils";
import { GaHrmsLogo } from "../../components/ui/GaHrmsLogo";

export interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollRecord: PayrollRecord | null;
}

export function PayslipModal({ isOpen, onClose, payrollRecord }: PayslipModalProps) {
  const { company, employees, departments, designations, branches, salaryStructures } = useHrms();

  if (!isOpen || !payrollRecord) return null;

  const emp = employees.find((e) => e.id === payrollRecord.employeeId);
  const dept = departments.find((d) => d.id === emp?.departmentId);
  const desig = designations.find((d) => d.id === emp?.designationId);
  const branch = branches.find((b) => b.id === emp?.branchId);
  const salary = salaryStructures.find((s) => s.employeeId === payrollRecord.employeeId);

  const basic = salary?.basic || Math.round(payrollRecord.grossSalary * 0.5);
  const hra = salary?.hra || Math.round(payrollRecord.grossSalary * 0.25);
  const special = salary?.specialAllowance || Math.max(0, payrollRecord.grossSalary - (basic + hra));

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num: number): string => {
    const a = [
      "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
      "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
      "SEVENTEEN", "EIGHTEEN", "NINETEEN",
    ];
    const b = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " HUNDRED" + (n % 100 ? " " + inWords(n % 100) : "");
      if (n < 100000) return inWords(Math.floor(n / 1000)) + " THOUSAND" + (n % 1000 ? " " + inWords(n % 1000) : "");
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + " LAKH" + (n % 100000 ? " " + inWords(n % 100000) : "");
      return inWords(Math.floor(n / 10000000)) + " CRORE" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
    };

    const rounded = Math.round(Math.abs(num));
    return rounded === 0 ? "ZERO" : inWords(rounded);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-scale-in my-auto">
        {/* Modal Controls Bar */}
        <div className="px-6 py-3.5 bg-gray-950 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Salary Payslip Preview
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs font-mono text-gray-200">{payrollRecord.monthName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="bg-transparent text-white border-white/20 hover:bg-white/10 h-8 text-xs"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Corporate Payslip Sheet */}
        <div id="printable-payslip" className="p-6 sm:p-8 bg-white text-black font-sans text-xs">
          <div className="border border-black">
            {/* Company Branding & Header */}
            <div className="p-4 pb-3 relative">
              <div className="sm:absolute sm:left-4 sm:top-3 mb-2 sm:mb-0">
                <img
                  src="/brand/gryphon-logo.png"
                  alt={company.name}
                  className="h-8 w-auto object-contain contrast-150 brightness-75"
                />
              </div>
              <div className="text-center space-y-1 sm:px-24">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-black">
                  {company.name}
                </h2>
                <p className="text-[11px] text-gray-800 uppercase max-w-md mx-auto">
                  {company.headquarters}
                </p>
                <p className="text-[11px] text-gray-800 uppercase">
                  MAHARASHTRA
                </p>
              </div>
            </div>

            <div className="border-t border-black py-2 text-center">
              <p className="font-bold uppercase text-xs tracking-wide">
                PAYSLIP FOR {payrollRecord.monthName}
              </p>
            </div>

            {/* Employee & Statutory Details */}
            <div className="border-t border-black px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-[11px]">
              <div className="space-y-1.5">
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">EMPLOYEE NAME</span>
                  <span className="uppercase font-medium">{emp?.firstName} {emp?.lastName}</span>
                </div>
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">EMPLOYEE ID</span>
                  <span className="uppercase font-medium">{emp?.employeeCode}</span>
                </div>
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">DESIGNATION</span>
                  <span className="uppercase font-medium">{desig?.title}</span>
                </div>
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">DEPARTMENT</span>
                  <span className="uppercase font-medium">{dept?.name}</span>
                </div>
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">DATE OF JOINING</span>
                  <span className="font-medium">
                    {emp?.joiningDate ? formatDate(emp.joiningDate) : "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">UAN</span>
                  <span className="font-medium">{emp?.uan || ""}</span>
                </div>
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">PF NO.</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">ESIC NO.</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">BANK NAME</span>
                  <span className="uppercase font-medium">{emp?.bankName || ""}</span>
                </div>
                <div className="grid grid-cols-[130px_1fr]">
                  <span className="uppercase">BANK A/C NO.</span>
                  <span className="font-medium">{emp?.accountNumber || ""}</span>
                </div>
              </div>
            </div>

            {/* Working & Present Days */}
            <div className="border-t border-black px-4 py-2 flex flex-wrap gap-x-24 gap-y-1 text-[11px] uppercase">
              <span>WORKING DAYS - {payrollRecord.workingDaysInMonth}</span>
              <span>PRESENT DAYS - {payrollRecord.presentDays + payrollRecord.paidLeaveDays}</span>
            </div>

            {/* Earnings & Deductions Table */}
            <div className="border-t border-black mt-3">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-gray-300 border-b border-black font-bold uppercase">
                    <th className="text-left px-2 py-1.5 border-r border-black w-[30%]">EARNING</th>
                    <th className="text-right px-2 py-1.5 border-r border-black w-[20%]">AMOUNT(RS.)</th>
                    <th className="text-left px-2 py-1.5 border-r border-black w-[30%]">DEDUCTIONS</th>
                    <th className="text-right px-2 py-1.5 w-[20%]">AMOUNT(RS.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border-r border-black">Basic</td>
                    <td className="px-2 py-1 text-right border-r border-black">{basic}</td>
                    <td className="px-2 py-1 border-r border-black">PF - Employee</td>
                    <td className="px-2 py-1 text-right">{payrollRecord.pfDeduction}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-black">HRA</td>
                    <td className="px-2 py-1 text-right border-r border-black">{hra}</td>
                    <td className="px-2 py-1 border-r border-black">Profession Tax</td>
                    <td className="px-2 py-1 text-right">{payrollRecord.ptDeduction}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border-r border-black">Special</td>
                    <td className="px-2 py-1 text-right border-r border-black">{special}</td>
                    <td className="px-2 py-1 border-r border-black">ESI</td>
                    <td className="px-2 py-1 text-right">{payrollRecord.esicDeduction}</td>
                  </tr>
                  {payrollRecord.tdsDeduction > 0 && (
                    <tr>
                      <td className="px-2 py-1 border-r border-black"></td>
                      <td className="px-2 py-1 text-right border-r border-black"></td>
                      <td className="px-2 py-1 border-r border-black">TDS</td>
                      <td className="px-2 py-1 text-right">{payrollRecord.tdsDeduction}</td>
                    </tr>
                  )}
                  <tr className="h-12">
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>
                  <tr className="font-bold border-t border-black">
                    <td className="px-2 py-1.5 border-r border-black uppercase">TOTAL</td>
                    <td className="px-2 py-1.5 text-right border-r border-black">{payrollRecord.grossSalary}</td>
                    <td className="px-2 py-1.5 border-r border-black uppercase">TOTAL</td>
                    <td className="px-2 py-1.5 text-right">{payrollRecord.totalDeductions}</td>
                  </tr>
                  <tr className="bg-gray-300 font-bold border-t border-black">
                    <td className="px-2 py-1.5 border-r border-black uppercase" colSpan={2}>
                      NET PAYMENT(RS.)
                    </td>
                    <td className="px-2 py-1.5 text-right" colSpan={2}>
                      {payrollRecord.netSalary}
                    </td>
                  </tr>
                  <tr className="bg-gray-300 border-t border-black">
                    <td className="px-2 py-1.5 uppercase" colSpan={4}>
                      <span className="font-bold">AMOUNT IN WORDS:</span>{" "}
                      {numberToWords(payrollRecord.netSalary)} ONLY!
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signoff Footer */}
            <div className="border-t border-black px-4 py-3 mt-10 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide">
                ** THIS DOCUMENT IS COMPUTER GENERATED AND DOES NOT REQUIRE THE SIGNATURE **
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
