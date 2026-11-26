import React, { useState } from "react";
import { Briefcase, Users, Plus, Building2 } from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatINR } from "../../lib/utils";

export function DesignationsPage() {
  const { designations, departments, employees } = useHrms();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
            Designations & Job Levels
          </h1>
          <p className="text-xs text-[#4B5D6B] mt-0.5">
            Corporate hierarchy levels, role titles, and standard compensation brackets.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#F7F9FB] border-b border-[#EDF1F6] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                <th className="py-3.5 px-5">Designation Title</th>
                <th className="py-3.5 px-5">Code</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Career Level</th>
                <th className="py-3.5 px-5">Standard CTC Band (Monthly)</th>
                <th className="py-3.5 px-5 text-center">Incumbents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {designations.map((desig) => {
                const dept = departments.find((d) => d.id === desig.departmentId);
                const count = employees.filter((e) => e.designationId === desig.id).length;

                return (
                  <tr key={desig.id} className="group hover:bg-[#F7F9FB] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#032D42] group-hover:text-[#1F8476] flex items-center gap-3 transition-colors">
                      <div className="w-9 h-9 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center shrink-0 group-hover:bg-[#032D42] group-hover:text-[#62D84E] transition-colors">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span>{desig.title}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-xs font-semibold text-[#032D42] bg-[#F7F9FB] border border-[#DDE3EA] px-2.5 py-0.5 rounded-full">
                        {desig.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#4B5D6B] text-xs font-medium">
                      {dept?.name || "Corporate"}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant="neutral" size="sm">
                        {desig.level}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-medium text-[#4B5D6B]">
                      {formatINR(desig.minCtc)} - {formatINR(desig.maxCtc)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#032D42] bg-[#E9F5F3] text-[#1F8476] px-3 py-1 rounded-full text-xs border border-[#80B6A1]/30">
                        <Users className="w-3.5 h-3.5" />
                        {count}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
