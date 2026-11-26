import React from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { useHrms } from "../../lib/hrmsContext";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../lib/utils";

export function HolidaysPage() {
  const { holidays, branches } = useHrms();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4">
        <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight">
          Annual Holiday Calendar
        </h1>
        <p className="text-xs text-[#4B5D6B] mt-0.5">
          Declared public holidays and optional cultural festival leaves for Calendar Year 2026.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#F7F9FB] border-b border-[#EDF1F6] text-[11px] uppercase tracking-wider text-[#697586] font-semibold">
                <th className="py-3.5 px-5">Holiday Name</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Day of Week</th>
                <th className="py-3.5 px-5">Classification</th>
                <th className="py-3.5 px-5">Applicable Locations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {holidays.map((h) => (
                <tr key={h.id} className="group hover:bg-[#F7F9FB] transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#032D42] group-hover:text-[#1F8476] flex items-center gap-3 transition-colors">
                    <div className="w-9 h-9 rounded-2xl bg-[#E9F5F3] text-[#1F8476] border border-[#80B6A1]/30 flex items-center justify-center shrink-0 group-hover:bg-[#032D42] group-hover:text-[#62D84E] transition-colors">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <span>{h.name}</span>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-xs text-[#032D42]">
                    {formatDate(h.date)}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#4B5D6B]">{h.day}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={h.isOptional ? "warning" : "success"} size="sm">
                      {h.isOptional ? "Optional Leave" : "Mandatory Public Holiday"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#697586]">
                    {h.applicableBranchIds.length === branches.length
                      ? "All Pan-India Branches"
                      : `${h.applicableBranchIds.length} Regional Branches`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
