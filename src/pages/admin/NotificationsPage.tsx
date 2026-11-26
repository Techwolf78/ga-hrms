import React, { useState } from "react";
import { Bell, CheckCircle2, ExternalLink, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHrms } from "../../lib/hrmsContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useHrms();
  const [filterType, setFilterType] = useState("ALL");
  const navigate = useNavigate();

  const filtered = notifications.filter(
    (n) => filterType === "ALL" || n.type.toUpperCase() === filterType
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#032D42] tracking-tight flex items-center gap-2.5">
            <span>Notifications Center</span>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF7E0] text-[#E69F00]">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-[#4B5D6B] mt-1">
            System announcements, approval requests, and statutory compliance reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={markAllNotificationsRead}
            variant="outline"
            size="md"
            leftIcon={<CheckCircle2 className="w-4 h-4 text-[#188038]" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Pill Tabs */}
      <div className="inline-flex items-center p-1 bg-white rounded-full border border-[#DDE3EA] shadow-[0_2px_12px_rgba(3,45,66,0.03)] gap-1 overflow-x-auto max-w-full">
        {["ALL", "LEAVE", "ATTENDANCE", "PAYROLL", "SYSTEM"].map((type) => {
          const count =
            type === "ALL"
              ? notifications.length
              : notifications.filter((n) => n.type.toUpperCase() === type).length;
          const isActive = filterType === type;

          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#032D42] text-white shadow-xs"
                  : "text-[#4B5D6B] hover:text-[#032D42] hover:bg-[#F7F9FB]"
              }`}
            >
              <span>{type}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? "bg-white/15 text-white" : "bg-[#E9F5F3] text-[#1F8476]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-[#DDE3EA] shadow-[0_2px_16px_rgba(3,45,66,0.03)] overflow-hidden">
        <div className="divide-y divide-[#EDF1F6]">
          {filtered.length === 0 ? (
            <div className="p-14 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-400">
                <Inbox className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-900">No Notifications</p>
              <p className="text-xs text-gray-400 mt-0.5">
                There are no alerts matching the selected category.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationRead(item.id);
                  if (item.link) navigate(item.link);
                }}
                className={`p-4 sm:p-4.5 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                  !item.isRead
                    ? "bg-white hover:bg-gray-50/80 font-medium"
                    : "bg-gray-50/40 hover:bg-gray-50/80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      !item.isRead
                        ? "bg-gray-950 text-white shadow-xs"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-xs ${
                          !item.isRead ? "font-bold text-gray-950" : "font-semibold text-gray-800"
                        }`}
                      >
                        {item.title}
                      </h2>
                      <Badge variant="neutral" size="sm">
                        {item.type}
                      </Badge>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#1F8476] animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                      {item.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] text-gray-400 font-mono">{item.timestamp}</span>
                  {item.link && <ExternalLink className="w-3.5 h-3.5 text-gray-400" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
