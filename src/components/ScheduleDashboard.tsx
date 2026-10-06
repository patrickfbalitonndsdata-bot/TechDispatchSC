import React from "react";
import { Users, Clock, AlertCircle, Calendar, MapPin, Phone, Wrench, ShieldAlert, CheckCircle2, ChevronRight, Sparkles, ExternalLink } from "lucide-react";
import { TechnicianRoster, WorkOrder, TemplateBranding } from "../types";
import { getPriorityColors, formatMinutes } from "../utils/outlookTemplateGenerator";
import { getTechnicianAirtableLink } from "../utils/technicianRosterDirectory";
import { useTheme } from "../context/ThemeContext";

interface ScheduleDashboardProps {
  rosters: TechnicianRoster[];
  selectedTechName: string;
  onSelectTech: (name: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableDates: string[];
  branding: TemplateBranding;
  onTriggerAiBriefing: (techName: string) => void;
  isAiGenerating: boolean;
}

export const ScheduleDashboard: React.FC<ScheduleDashboardProps> = ({
  rosters,
  selectedTechName,
  onSelectTech,
  selectedDate,
  onSelectDate,
  availableDates = [],
  branding,
  onTriggerAiBriefing,
  isAiGenerating,
}) => {
  const { isDarkMode, activeHolidaySeason, holidayConfig } = useTheme();
  const currentRoster = rosters.find((r) => r.technicianName === selectedTechName) || rosters[0];

  // Aggregate Metrics across all technicians for selected date
  const totalJobs = rosters.reduce((acc, r) => acc + r.orders.length, 0);
  const totalUrgent = rosters.reduce((acc, r) => acc + r.urgentCount, 0);
  const totalMinutes = rosters.reduce((acc, r) => acc + r.totalEstimatedMinutes, 0);

  if (rosters.length === 0) {
    return (
      <div
        className={`border rounded-2xl p-12 text-center shadow-2xs transition-colors ${
          isDarkMode
            ? "bg-[#08150D]/90 border-[#00FF41]/40 text-[#D2FAD7] shadow-[0_0_20px_rgba(0,255,65,0.15)]"
            : activeHolidaySeason === "halloween"
            ? "bg-white border-orange-200 text-stone-900"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white border-blue-200 text-slate-900"
            : activeHolidaySeason === "christmas"
            ? "bg-white border-emerald-200 text-stone-900"
            : activeHolidaySeason === "new_year"
            ? "bg-white border-amber-200 text-stone-900"
            : "bg-white border-[#CFE0B8] text-zinc-500"
        }`}
      >
        <Users
          className={`w-10 h-10 mx-auto mb-3 ${
            isDarkMode
              ? "text-[#00FF41]/70"
              : activeHolidaySeason === "halloween"
              ? "text-orange-500"
              : activeHolidaySeason === "christmas_eve"
              ? "text-amber-500"
              : activeHolidaySeason === "christmas"
              ? "text-emerald-500"
              : activeHolidaySeason === "new_year"
              ? "text-amber-500"
              : "text-[#8AA66B]/50"
          }`}
        />
        <h3
          className={`text-sm font-bold ${
            isDarkMode
              ? "text-[#E0FFE5]"
              : activeHolidaySeason === "halloween"
              ? "text-orange-950"
              : activeHolidaySeason === "christmas_eve"
              ? "text-blue-950"
              : activeHolidaySeason === "christmas"
              ? "text-emerald-950"
              : activeHolidaySeason === "new_year"
              ? "text-amber-950"
              : "text-[#3F4A33]"
          }`}
        >
          No Technician Schedules Available
        </h3>
        <p className={`text-xs max-w-md mx-auto mt-1 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
          Upload a CSV file or load a sample dataset above to view and generate Outlook schedule emails.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Technicians */}
        <div
          className={`border rounded-2xl p-4 shadow-2xs transition-colors ${
            isDarkMode
              ? "bg-[#08150D]/90 border-[#00FF41]/30 text-[#E0FFE5] shadow-[0_0_12px_rgba(0,255,65,0.1)]"
              : activeHolidaySeason === "halloween"
              ? "bg-white border-orange-200 text-stone-900"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white border-blue-200 text-slate-900"
              : activeHolidaySeason === "christmas"
              ? "bg-white border-emerald-200 text-stone-900"
              : activeHolidaySeason === "new_year"
              ? "bg-white border-amber-200 text-stone-900"
              : "bg-white border-[#CFE0B8]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#D2FAD7]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-900"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-900"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-900"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-900"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Technicians
            </span>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center border ${
                isDarkMode
                  ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-100 text-orange-700 border-orange-200"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              isDarkMode
                ? "text-[#00FF41] font-mono"
                : activeHolidaySeason === "halloween"
                ? "text-orange-950"
                : activeHolidaySeason === "christmas_eve"
                ? "text-blue-950"
                : activeHolidaySeason === "christmas"
                ? "text-emerald-950"
                : activeHolidaySeason === "new_year"
                ? "text-amber-950"
                : "text-[#3F4A33]"
            }`}
          >
            {rosters.length}
          </div>
          <div className={`text-[11px] mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>Active field rosters</div>
        </div>

        {/* Total Stops */}
        <div
          className={`border rounded-2xl p-4 shadow-2xs transition-colors ${
            isDarkMode
              ? "bg-[#08150D]/90 border-[#00FF41]/30 text-[#E0FFE5] shadow-[0_0_12px_rgba(0,255,65,0.1)]"
              : activeHolidaySeason === "halloween"
              ? "bg-white border-orange-200 text-stone-900"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white border-blue-200 text-slate-900"
              : activeHolidaySeason === "christmas"
              ? "bg-white border-emerald-200 text-stone-900"
              : activeHolidaySeason === "new_year"
              ? "bg-white border-amber-200 text-stone-900"
              : "bg-white border-[#CFE0B8]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#D2FAD7]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-900"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-900"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-900"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-900"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Total Stops
            </span>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center border ${
                isDarkMode
                  ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-100 text-orange-700 border-orange-200"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              isDarkMode
                ? "text-[#00FF41] font-mono"
                : activeHolidaySeason === "halloween"
                ? "text-orange-950"
                : activeHolidaySeason === "christmas_eve"
                ? "text-blue-950"
                : activeHolidaySeason === "christmas"
                ? "text-emerald-950"
                : activeHolidaySeason === "new_year"
                ? "text-amber-950"
                : "text-[#3F4A33]"
            }`}
          >
            {totalJobs}
          </div>
          <div className={`text-[11px] mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>Scheduled appointments</div>
        </div>

        {/* Urgent Jobs */}
        <div
          className={`border rounded-2xl p-4 shadow-2xs transition-colors ${
            isDarkMode
              ? "bg-[#08150D]/90 border-[#00FF41]/30 text-[#E0FFE5] shadow-[0_0_12px_rgba(0,255,65,0.1)]"
              : activeHolidaySeason === "halloween"
              ? "bg-white border-orange-200 text-stone-900"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white border-blue-200 text-slate-900"
              : activeHolidaySeason === "christmas"
              ? "bg-white border-emerald-200 text-stone-900"
              : activeHolidaySeason === "new_year"
              ? "bg-white border-amber-200 text-stone-900"
              : "bg-white border-[#CFE0B8]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#D2FAD7]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-900"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-900"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-900"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-900"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Urgent Jobs
            </span>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center border ${
                totalUrgent > 0
                  ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800"
                  : isDarkMode
                  ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-100 text-orange-700 border-orange-200"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              totalUrgent > 0
                ? "text-red-600 dark:text-red-400"
                : isDarkMode
                ? "text-[#00FF41] font-mono"
                : activeHolidaySeason === "halloween"
                ? "text-orange-950"
                : activeHolidaySeason === "christmas_eve"
                ? "text-blue-950"
                : activeHolidaySeason === "christmas"
                ? "text-emerald-950"
                : activeHolidaySeason === "new_year"
                ? "text-amber-950"
                : "text-[#3F4A33]"
            }`}
          >
            {totalUrgent}
          </div>
          <div className={`text-[11px] mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>Priority &amp; emergency</div>
        </div>

        {/* Total Work Time */}
        <div
          className={`border rounded-2xl p-4 shadow-2xs transition-colors ${
            isDarkMode
              ? "bg-[#08150D]/90 border-[#00FF41]/30 text-[#E0FFE5] shadow-[0_0_12px_rgba(0,255,65,0.1)]"
              : activeHolidaySeason === "halloween"
              ? "bg-white border-orange-200 text-stone-900"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white border-blue-200 text-slate-900"
              : activeHolidaySeason === "christmas"
              ? "bg-white border-emerald-200 text-stone-900"
              : activeHolidaySeason === "new_year"
              ? "bg-white border-amber-200 text-stone-900"
              : "bg-white border-[#CFE0B8]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#D2FAD7]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-900"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-900"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-900"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-900"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Total Work Time
            </span>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center border ${
                isDarkMode
                  ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-100 text-orange-700 border-orange-200"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-[#EDF3E3] text-[#8AA66B] border-[#CFE0B8]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              isDarkMode
                ? "text-[#00FF41] font-mono"
                : activeHolidaySeason === "halloween"
                ? "text-orange-950"
                : activeHolidaySeason === "christmas_eve"
                ? "text-blue-950"
                : activeHolidaySeason === "christmas"
                ? "text-emerald-950"
                : activeHolidaySeason === "new_year"
                ? "text-amber-950"
                : "text-[#3F4A33]"
            }`}
          >
            {formatMinutes(totalMinutes)}
          </div>
          <div className={`text-[11px] mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>Estimated on-site hours</div>
        </div>
      </div>

      {/* Date and Technician Selector Bar */}
      <div
        className={`border rounded-2xl p-4 shadow-2xs space-y-3 transition-colors ${
          isDarkMode
            ? "bg-[#08150D]/90 border-[#00FF41]/30 text-[#E0FFE5] shadow-[0_0_15px_rgba(0,255,65,0.1)]"
            : activeHolidaySeason === "halloween"
            ? "bg-white border-orange-200 shadow-orange-600/5"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white border-blue-200 shadow-blue-600/5"
            : activeHolidaySeason === "christmas"
            ? "bg-white border-emerald-200 shadow-emerald-600/5"
            : activeHolidaySeason === "new_year"
            ? "bg-white border-amber-200 shadow-amber-600/5"
            : "bg-white border-[#CFE0B8]"
        }`}
      >
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3 ${
            isDarkMode
              ? "border-[#00FF41]/20"
              : activeHolidaySeason === "halloween"
              ? "border-orange-200"
              : activeHolidaySeason === "christmas_eve"
              ? "border-blue-200"
              : activeHolidaySeason === "christmas"
              ? "border-emerald-200"
              : activeHolidaySeason === "new_year"
              ? "border-amber-200"
              : "border-[#CFE0B8]/40"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Calendar
              className={`w-3.5 h-3.5 ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-amber-600"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-600"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600"
                  : "text-[#8AA66B]"
              }`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-950 font-bold"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-amber-950 font-bold"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-950 font-bold"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-950 font-bold"
                  : "text-[#3F4A33]"
              }`}
            >
              Date:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs sm:max-w-md py-1">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => onSelectDate(date)}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition cursor-pointer ${
                    selectedDate === date
                      ? isDarkMode
                        ? "bg-[#00FF41] text-[#040906] font-mono shadow-[0_0_10px_#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-600 text-white shadow-xs"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-amber-600 text-white shadow-xs"
                        : activeHolidaySeason === "christmas"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-[#3F4A33] text-white shadow-xs"
                      : isDarkMode
                      ? "bg-[#0C1E12] text-[#00FF41] hover:bg-[#00FF41]/20 border border-[#00FF41]/30"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-50 text-orange-950 hover:bg-orange-100 border border-orange-200"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-blue-50 text-blue-950 hover:bg-blue-100 border border-blue-200"
                      : activeHolidaySeason === "christmas"
                      ? "bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border border-emerald-200"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200"
                      : "bg-[#EDF3E3] text-[#3F4A33] hover:bg-[#CFE0B8]"
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          <div className={`text-xs ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
            Viewing: <span className={`font-bold ${
              isDarkMode
                ? "text-[#00FF41]"
                : activeHolidaySeason === "halloween"
                ? "text-orange-950"
                : activeHolidaySeason === "christmas_eve"
                ? "text-blue-950"
                : activeHolidaySeason === "christmas"
                ? "text-emerald-950"
                : activeHolidaySeason === "new_year"
                ? "text-amber-950"
                : "text-[#3F4A33]"
            }`}>{currentRoster?.technicianName}</span> ({currentRoster?.orders.length} stops)
          </div>
        </div>

        {/* Technician Tabs Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {rosters.map((roster) => {
            const isSelected = roster.technicianName === selectedTechName;
            return (
              <button
                key={roster.technicianName}
                onClick={() => onSelectTech(roster.technicianName)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? isDarkMode
                      ? "bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.3)] ring-1 ring-[#00FF41]/50 font-mono"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-100 border-orange-500 text-orange-950 shadow-xs ring-1 ring-orange-400"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-amber-100 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400"
                      : activeHolidaySeason === "christmas"
                      ? "bg-emerald-100 border-emerald-600 text-emerald-950 shadow-xs ring-1 ring-emerald-500"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-100 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400"
                      : "bg-[#EDF3E3] border-[#8AA66B] text-[#3F4A33] shadow-xs ring-1 ring-[#8AA66B]/50"
                    : isDarkMode
                    ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]/80 hover:text-[#00FF41] hover:border-[#00FF41]/60 hover:bg-[#0C1E12]"
                    : activeHolidaySeason === "halloween"
                    ? "bg-white border-orange-200 text-stone-900 hover:border-orange-400 hover:bg-orange-50"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-white border-blue-200 text-slate-900 hover:border-blue-400 hover:bg-blue-50"
                    : activeHolidaySeason === "christmas"
                    ? "bg-white border-emerald-200 text-stone-900 hover:border-emerald-400 hover:bg-emerald-50"
                    : activeHolidaySeason === "new_year"
                    ? "bg-white border-amber-200 text-stone-900 hover:border-amber-400 hover:bg-amber-50"
                    : "bg-white border-[#CFE0B8] text-[#3F4A33] hover:border-[#8AA66B] hover:bg-[#FBF7F0]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                    isSelected
                      ? isDarkMode
                        ? "bg-[#00FF41] text-[#040906]"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-600 text-white"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-amber-600 text-white"
                        : activeHolidaySeason === "christmas"
                        ? "bg-emerald-600 text-white"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-600 text-white"
                        : "bg-[#8AA66B] text-white"
                      : isDarkMode
                      ? "bg-[#0C1E12] text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-100 text-orange-800"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-blue-100 text-blue-800"
                      : activeHolidaySeason === "christmas"
                      ? "bg-emerald-100 text-emerald-800"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-[#EDF3E3] text-[#3F4A33]"
                  }`}
                >
                  {roster.technicianName.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs leading-tight">{roster.technicianName}</div>
                  <div className={`text-[10px] leading-tight ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
                    {roster.orders.length} stops &bull; {formatMinutes(roster.totalEstimatedMinutes)}
                  </div>
                </div>
                {roster.urgentCount > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800 px-1.5 py-0.5 rounded-full border border-red-200">
                    {roster.urgentCount} Urgent
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Technician Schedule Details Card */}
      {currentRoster && (
        <div
          className={`border rounded-2xl overflow-hidden shadow-2xs transition-colors ${
            isDarkMode
              ? "bg-[#08150D]/90 border-[#00FF41]/30 text-[#E0FFE5] shadow-[0_0_20px_rgba(0,255,65,0.1)]"
              : activeHolidaySeason === "halloween"
              ? "bg-white border-orange-200 shadow-orange-900/5"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white border-blue-200 shadow-blue-900/5"
              : activeHolidaySeason === "christmas"
              ? "bg-white border-emerald-200 shadow-emerald-900/5"
              : activeHolidaySeason === "new_year"
              ? "bg-white border-amber-200 shadow-amber-900/5"
              : "bg-white border-[#CFE0B8]"
          }`}
        >
          {/* Header Info */}
          <div
            className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              isDarkMode
                ? "bg-[#040906] border-[#00FF41]/20"
                : activeHolidaySeason === "halloween"
                ? "bg-[#2A130A] text-white border-orange-400/40"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-[#0F1E36] text-white border-amber-300/40"
                : activeHolidaySeason === "christmas"
                ? "bg-[#143E23] text-white border-red-400/40"
                : activeHolidaySeason === "new_year"
                ? "bg-[#1E1B4B] text-white border-yellow-300/40"
                : "bg-[#FBF7F0] border-[#CFE0B8]"
            }`}
          >
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-bold text-sm ${isDarkMode ? "text-[#E0FFE5]" : activeHolidaySeason !== "standard" ? "text-white" : "text-[#3F4A33]"}`}>
                  {currentRoster.technicianName}'s Route Roster
                </h3>
                <span className={`text-xs font-mono ${isDarkMode ? "text-[#00FF41]" : activeHolidaySeason !== "standard" ? "text-white/80" : "text-[#3F4A33]/70"}`}>
                  ({currentRoster.technicianEmail})
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/80" : activeHolidaySeason !== "standard" ? "text-white/70" : "text-zinc-500"}`}>
                {currentRoster.orders.length} stops scheduled on {currentRoster.date} &bull; Total estimated time: {formatMinutes(currentRoster.totalEstimatedMinutes)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Airtable View Button */}
              <a
                href={getTechnicianAirtableLink(currentRoster.technicianName, branding.airtableBaseUrl, branding.customTechAirtableLinks)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-1.5 text-xs font-bold border px-3 py-1.5 rounded-xl shadow-xs transition ${
                  isDarkMode
                    ? "bg-[#0C1E12] hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                    : activeHolidaySeason !== "standard"
                    ? "bg-white/15 hover:bg-white/25 text-white border-white/30"
                    : "bg-white hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                }`}
                title={`Open Airtable view for ${currentRoster.technicianName}`}
              >
                <span>Airtable View</span>
                <ExternalLink className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : activeHolidaySeason !== "standard" ? "text-white" : "text-[#8AA66B]"}`} />
              </a>

              {/* AI Briefing Button */}
              <button
                onClick={() => onTriggerAiBriefing(currentRoster.technicianName)}
                disabled={isAiGenerating}
                className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer ${
                  isDarkMode
                    ? "bg-[#00FF41] hover:bg-[#00FF41]/80 text-[#040906] font-mono shadow-[0_0_12px_#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                    : activeHolidaySeason === "christmas"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                    : activeHolidaySeason === "new_year"
                    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                    : "bg-[#3F4A33] hover:bg-[#2b3323] text-white"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#040906]" : "text-amber-200"}`} />
                <span>{isAiGenerating ? "Generating AI Brief..." : currentRoster.aiBriefing ? "Regenerate AI Brief" : "Generate AI Route Brief"}</span>
              </button>
            </div>
          </div>

          {/* AI Briefing Card (if generated) */}
          {currentRoster.aiBriefing && (
            <div
              className={`p-4 border-b ${
                isDarkMode ? "bg-[#0C1E12]/80 border-[#00FF41]/20" : "bg-[#EDF3E3]/60 border-[#CFE0B8]"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isDarkMode ? "bg-[#00FF41] text-[#040906]" : "bg-[#8AA66B] text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                      AI Morning Route Briefing
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>
                    {currentRoster.aiBriefing.briefing}
                  </p>

                  {currentRoster.aiBriefing.safetyAlert && (
                    <div
                      className={`rounded-xl p-2.5 text-xs font-medium border ${
                        isDarkMode
                          ? "bg-amber-950/40 border-amber-600/40 text-amber-200"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      ⚠️ Safety Focus: {currentRoster.aiBriefing.safetyAlert}
                    </div>
                  )}

                  {currentRoster.aiBriefing.keyHighlights && currentRoster.aiBriefing.keyHighlights.length > 0 && (
                    <div className="text-xs">
                      <div className={`font-bold text-[11px] mb-1 ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                        Key Highlights:
                      </div>
                      <ul className={`list-disc list-inside space-y-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-600"}`}>
                        {currentRoster.aiBriefing.keyHighlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Work Orders List Table */}
          <div className={`divide-y overflow-x-auto ${
            isDarkMode
              ? "divide-[#00FF41]/15"
              : activeHolidaySeason === "halloween"
              ? "divide-orange-100"
              : activeHolidaySeason === "christmas_eve"
              ? "divide-blue-100"
              : activeHolidaySeason === "christmas"
              ? "divide-emerald-100"
              : activeHolidaySeason === "new_year"
              ? "divide-amber-100"
              : "divide-[#CFE0B8]/40"
          }`}>
            {currentRoster.orders.map((order, idx) => {
              const pColors = getPriorityColors(order.priority);
              const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.serviceAddress)}`;

              return (
                <div
                  key={order.id}
                  className={`p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isDarkMode
                      ? "hover:bg-[#0C1E12]/60"
                      : activeHolidaySeason === "halloween"
                      ? "hover:bg-orange-50/50"
                      : activeHolidaySeason === "christmas_eve"
                      ? "hover:bg-blue-50/50"
                      : activeHolidaySeason === "christmas"
                      ? "hover:bg-emerald-50/50"
                      : activeHolidaySeason === "new_year"
                      ? "hover:bg-amber-50/50"
                      : "hover:bg-[#FBF7F0]/60"
                  }`}
                >
                  {/* Left Column: Index & Time */}
                  <div className="flex items-start space-x-3 md:w-1/4 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isDarkMode
                          ? "bg-[#00FF41] text-[#040906] font-mono shadow-[0_0_8px_#00FF41]"
                          : activeHolidaySeason === "halloween"
                          ? "bg-orange-600 text-white"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-amber-600 text-white"
                          : activeHolidaySeason === "christmas"
                          ? "bg-emerald-600 text-white"
                          : activeHolidaySeason === "new_year"
                          ? "bg-amber-600 text-white"
                          : "bg-[#3F4A33] text-white"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${
                        isDarkMode
                          ? "text-[#E0FFE5]"
                          : activeHolidaySeason === "halloween"
                          ? "text-orange-950"
                          : activeHolidaySeason === "christmas_eve"
                          ? "text-blue-950"
                          : activeHolidaySeason === "christmas"
                          ? "text-emerald-950"
                          : activeHolidaySeason === "new_year"
                          ? "text-amber-950"
                          : "text-[#3F4A33]"
                      }`}>
                        {order.timeSlot}
                      </div>
                      <div className={`text-[11px] font-mono ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
                        {order.orderNumber}
                      </div>
                      <div className="mt-1">
                        <span
                          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: pColors.bg, color: pColors.text, border: `1px solid ${pColors.border}` }}
                        >
                          {order.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Task & Notes */}
                  <div className="md:w-2/5 space-y-1">
                    <div className={`text-xs font-bold ${
                      isDarkMode
                        ? "text-[#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "text-orange-900"
                        : activeHolidaySeason === "christmas_eve"
                        ? "text-blue-900"
                        : activeHolidaySeason === "christmas"
                        ? "text-emerald-900"
                        : activeHolidaySeason === "new_year"
                        ? "text-amber-900"
                        : "text-[#3F4A33]"
                    }`}>
                      {order.jobType}
                    </div>
                    <p className={`text-xs line-clamp-2 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-600"}`}>
                      {order.description}
                    </p>
                    
                    {order.requiredParts && (
                      <div
                        className={`text-[11px] px-2 py-0.5 rounded-md border inline-block font-semibold ${
                          isDarkMode
                            ? "text-[#E0FFE5] bg-[#0C1E12] border-[#00FF41]/40"
                            : activeHolidaySeason === "halloween"
                            ? "text-orange-900 bg-orange-50 border-orange-200"
                            : activeHolidaySeason === "christmas_eve"
                            ? "text-blue-900 bg-blue-50 border-blue-200"
                            : activeHolidaySeason === "christmas"
                            ? "text-emerald-900 bg-emerald-50 border-emerald-200"
                            : activeHolidaySeason === "new_year"
                            ? "text-amber-900 bg-amber-50 border-amber-200"
                            : "text-[#3F4A33] bg-[#EDF3E3] border-[#CFE0B8]"
                        }`}
                      >
                        🔧 {order.requiredParts}
                      </div>
                    )}
                    {order.specialInstructions && (
                      <div
                        className={`text-[11px] px-2 py-0.5 rounded-md border inline-block font-semibold ml-1 ${
                          isDarkMode
                            ? "text-amber-300 bg-amber-950/50 border-amber-600/40"
                            : "text-amber-900 bg-amber-50 border-amber-200"
                        }`}
                      >
                        📝 {order.specialInstructions}
                      </div>
                    )}
                    {order.scheduleNotes && (
                      <div
                        className={`text-[11px] px-2 py-0.5 rounded-md border inline-block font-semibold ml-1 ${
                          isDarkMode
                            ? "text-rose-300 bg-rose-950/50 border-rose-600/40"
                            : "text-rose-900 bg-rose-50 border-rose-200"
                        }`}
                      >
                        📌 {order.scheduleNotes}
                      </div>
                    )}
                    {order.schedulingTeamNotes && (
                      <div
                        className={`text-[11px] px-2 py-0.5 rounded-md border inline-block font-semibold ml-1 ${
                          isDarkMode
                            ? "text-blue-300 bg-blue-950/50 border-blue-600/40"
                            : "text-blue-900 bg-blue-50 border-blue-200"
                        }`}
                      >
                        📋 {order.schedulingTeamNotes}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Customer & Location */}
                  <div className="md:w-1/3 text-xs space-y-1">
                    <div className={`font-bold ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`underline line-clamp-1 font-medium ${
                          isDarkMode ? "text-[#00FF41] hover:text-[#E0FFE5]" : "text-[#3F4A33] hover:text-[#8AA66B]"
                        }`}
                        title={order.serviceAddress}
                      >
                        {order.serviceAddress}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-zinc-400"}`} />
                      <a
                        href={`tel:${order.customerPhone}`}
                        className={`font-mono ${isDarkMode ? "text-[#D2FAD7] hover:text-[#00FF41]" : "text-zinc-600 hover:text-[#3F4A33]"}`}
                      >
                        {order.customerPhone}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
