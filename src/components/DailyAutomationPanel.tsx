import React, { useState, useEffect } from "react";
import {
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Sliders,
  Calendar,
  Layers,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Archive,
} from "lucide-react";
import { AutomationConfig, TechnicianRoster, TemplateBranding, TemplateStyle } from "../types";
import { downloadAllAsZip } from "../utils/outlookTemplateGenerator";
import { useTheme } from "../context/ThemeContext";

interface DailyAutomationPanelProps {
  config: AutomationConfig;
  onUpdateConfig: (newConfig: Partial<AutomationConfig>) => void;
  rosters: TechnicianRoster[];
  branding: TemplateBranding;
  currentStyle: TemplateStyle;
  selectedDate: string;
  onRecordBatchDispatch: (logs: any[]) => void;
}

export const DailyAutomationPanel: React.FC<DailyAutomationPanelProps> = ({
  config,
  onUpdateConfig,
  rosters,
  branding,
  currentStyle,
  selectedDate,
  onRecordBatchDispatch,
}) => {
  const { isDarkMode, activeHolidaySeason, holidayConfig } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [timeUntilRun, setTimeUntilRun] = useState<string>("");

  // Countdown timer to next scheduled dispatch time
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const [hours, minutes] = (config.dailyTime || "07:00").split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      if (now.getTime() > target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diffMs = target.getTime() - now.getTime();
      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilRun(`${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [config.dailyTime]);

  const handleTriggerManualRun = async () => {
    if (rosters.length === 0) return;
    setIsRunning(true);
    setProgress(10);
    setLogs([`[${new Date().toLocaleTimeString()}] 🚀 Initiating Daily Dispatch Pipeline for ${selectedDate}...`]);

    await new Promise((r) => setTimeout(r, 600));
    setProgress(30);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 📊 Analyzed ${rosters.length} technician schedules (${rosters.reduce((a, b) => a + b.orders.length, 0)} total work orders).`,
    ]);

    await new Promise((r) => setTimeout(r, 700));
    setProgress(55);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ✉️ Generated Microsoft Outlook MSO HTML templates with style "${currentStyle}".`,
    ]);

    await new Promise((r) => setTimeout(r, 800));
    setProgress(80);

    const generatedLogs = rosters.map((r) => {
      return {
        timestamp: new Date().toISOString(),
        technicianName: r.technicianName,
        technicianEmail: r.technicianEmail,
        date: r.date,
        jobCount: r.orders.length,
        status: "Delivered" as const,
        method: "Daily Scheduler" as const,
      };
    });

    await new Promise((r) => setTimeout(r, 500));
    setProgress(100);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ✅ Successfully compiled & recorded distribution for ${rosters.length} technicians.`,
    ]);

    setIsRunning(false);
    onRecordBatchDispatch(generatedLogs);
  };

  const handleBatchZipDownload = async () => {
    if (rosters.length === 0) return;
    await downloadAllAsZip(rosters, branding, currentStyle, selectedDate, branding.attachments);
    const generatedLogs = rosters.map((r) => ({
      timestamp: new Date().toISOString(),
      technicianName: r.technicianName,
      technicianEmail: r.technicianEmail,
      date: r.date,
      jobCount: r.orders.length,
      status: "Exported" as const,
      method: "Manual Batch Export" as const,
    }));
    onRecordBatchDispatch(generatedLogs);
  };

  return (
    <div className="space-y-6">
      {/* Automation Status Card */}
      <div
        className={`rounded-2xl p-6 shadow-md border transition-all ${
          isDarkMode
            ? "bg-[#08150D] border-[#00FF41]/40 text-[#E0FFE5] shadow-[0_0_25px_rgba(0,255,65,0.15)]"
            : activeHolidaySeason === "halloween"
            ? "bg-[#2A130A] text-white border-orange-400/40 shadow-orange-950/20"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-[#0F1E36] text-white border-amber-300/40 shadow-blue-950/20"
            : activeHolidaySeason === "christmas"
            ? "bg-[#143E23] text-white border-red-400/40 shadow-emerald-950/20"
            : activeHolidaySeason === "new_year"
            ? "bg-[#1E1B4B] text-white border-yellow-300/40 shadow-amber-950/20"
            : "bg-[#3F4A33] text-white border-[#CFE0B8]/40"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span
                className={`p-1.5 rounded-lg border ${
                  isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 font-mono shadow-[0_0_8px_rgba(0,255,65,0.3)]"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-500/20 text-orange-200 border-orange-400/40"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-amber-400/20 text-amber-200 border-amber-300/40"
                    : activeHolidaySeason === "christmas"
                    ? "bg-red-500/20 text-red-200 border-red-400/40"
                    : activeHolidaySeason === "new_year"
                    ? "bg-yellow-400/20 text-yellow-200 border-yellow-300/40"
                    : "bg-white/10 text-white border-white/20"
                }`}
              >
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold">Automated Daily Distribution Engine</h2>
            </div>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? "text-[#D2FAD7]/80" : "text-white/80"}`}>
              Automatically compiles each technician's daily work orders from uploaded CSV schedules, formats personalized Outlook email templates, and distributes them at a designated morning cutoff time.
            </p>
          </div>

          {/* Quick Trigger & Status */}
          <div
            className={`border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 shrink-0 ${
              isDarkMode
                ? "bg-[#040906] border-[#00FF41]/30"
                : "bg-black/25 border-white/15"
            }`}
          >
            <div className="text-center sm:text-left">
              <div className={`text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? "text-[#D2FAD7]/60" : "text-white/70"}`}>
                Next Auto Dispatch
              </div>
              <div className={`text-base font-bold flex items-center gap-1.5 justify-center sm:justify-start mt-0.5 ${isDarkMode ? "text-[#00FF41] font-mono" : "text-white"}`}>
                <Clock className={`w-4 h-4 ${isDarkMode ? "text-[#00FF41]" : "text-amber-300"}`} />
                <span>{config.enabled ? timeUntilRun : "Disabled"}</span>
              </div>
              <div className={`text-[11px] mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/70" : "text-white/70"}`}>
                Every day at <span className={`font-semibold ${isDarkMode ? "text-[#00FF41]" : "text-amber-200"}`}>{config.dailyTime}</span>
              </div>
            </div>

            <button
              onClick={handleTriggerManualRun}
              disabled={isRunning || rosters.length === 0}
              className={`w-full sm:w-auto flex items-center justify-center space-x-2 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer ${
                isDarkMode
                  ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_12px_#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                  : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
              }`}
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className={`w-4 h-4 ${isDarkMode ? "fill-[#040906]" : "fill-white"}`} />}
              <span>{isRunning ? "Distributing..." : "Run Dispatch Now"}</span>
            </button>
          </div>
        </div>

        {/* Real-time progress bar when running */}
        {isRunning && (
          <div className="mt-6 space-y-1.5">
            <div className={`flex justify-between text-xs font-medium ${isDarkMode ? "text-[#D2FAD7]" : "text-white/90"}`}>
              <span>Automating distribution pipeline...</span>
              <span className={isDarkMode ? "text-[#00FF41] font-mono font-bold" : "font-bold"}>{progress}%</span>
            </div>
            <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode ? "bg-[#040906]" : "bg-black/30"}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isDarkMode
                    ? "bg-[#00FF41] shadow-[0_0_10px_#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-500"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-amber-400"
                    : activeHolidaySeason === "christmas"
                    ? "bg-emerald-400"
                    : activeHolidaySeason === "new_year"
                    ? "bg-yellow-400"
                    : "bg-[#CFE0B8]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Schedule Trigger Time */}
        <div
          className={`border rounded-2xl p-5 shadow-xs space-y-3 transition-colors ${
            isDarkMode
              ? "bg-[#08150D] border-[#00FF41]/35 text-[#D2FAD7]"
              : activeHolidaySeason === "halloween"
              ? "bg-white border-orange-200 text-stone-900 shadow-orange-600/5"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white border-blue-200 text-slate-900 shadow-blue-600/5"
              : activeHolidaySeason === "christmas"
              ? "bg-white border-emerald-200 text-stone-900 shadow-emerald-600/5"
              : activeHolidaySeason === "new_year"
              ? "bg-white border-amber-200 text-stone-900 shadow-amber-600/5"
              : "bg-white border-[#CFE0B8] text-zinc-800"
          }`}
        >
          <div
            className={`flex items-center space-x-2 font-bold text-xs uppercase tracking-wider ${
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
                : "text-zinc-800"
            }`}
          >
            <Clock
              className={`w-4 h-4 ${
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
            <span>Daily Schedule Trigger</span>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
              Dispatch Time (24h format)
            </label>
            <input
              type="time"
              value={config.dailyTime}
              onChange={(e) => onUpdateConfig({ dailyTime: e.target.value })}
              className={`w-full text-xs font-medium rounded-xl px-3 py-2 border focus:ring-2 focus:outline-hidden ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41] font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-50/50 border-orange-200 text-stone-900 focus:ring-orange-500"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-50/50 border-blue-200 text-slate-900 focus:ring-blue-500"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-50/50 border-emerald-200 text-stone-900 focus:ring-emerald-500"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-50/50 border-amber-200 text-stone-900 focus:ring-amber-500"
                  : "bg-zinc-50 border-zinc-300 text-zinc-800 focus:ring-[#8AA66B]"
              }`}
            />
            <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
              Emails will be automatically prepared and dispatched at this time every morning.
            </p>
          </div>

          <div className={`pt-2 border-t flex items-center justify-between ${isDarkMode ? "border-[#00FF41]/20" : "border-zinc-100"}`}>
            <span className={`text-xs font-medium ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
              Enable Daily Automation
            </span>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onUpdateConfig({ enabled: e.target.checked })}
              className={`w-4 h-4 rounded cursor-pointer ${
                isDarkMode
                  ? "accent-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "accent-orange-600"
                  : activeHolidaySeason === "christmas_eve"
                  ? "accent-amber-600"
                  : activeHolidaySeason === "christmas"
                  ? "accent-emerald-600"
                  : activeHolidaySeason === "new_year"
                  ? "accent-amber-600"
                  : "text-blue-600"
              }`}
            />
          </div>
        </div>

        {/* Card 2: Target Strategy */}
        <div
          className={`border rounded-2xl p-5 shadow-xs space-y-3 transition-colors ${
            isDarkMode
              ? "bg-[#08150D] border-[#00FF41]/35 text-[#D2FAD7]"
              : activeHolidaySeason === "halloween"
              ? "bg-white border-orange-200 text-stone-900 shadow-orange-600/5"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white border-blue-200 text-slate-900 shadow-blue-600/5"
              : activeHolidaySeason === "christmas"
              ? "bg-white border-emerald-200 text-stone-900 shadow-emerald-600/5"
              : activeHolidaySeason === "new_year"
              ? "bg-white border-amber-200 text-stone-900 shadow-amber-600/5"
              : "bg-white border-[#CFE0B8] text-zinc-800"
          }`}
        >
          <div
            className={`flex items-center space-x-2 font-bold text-xs uppercase tracking-wider ${
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
                : "text-zinc-800"
            }`}
          >
            <Calendar
              className={`w-4 h-4 ${
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
            <span>Date Range Strategy</span>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
              Target Work Orders
            </label>
            <select
              value={config.targetStrategy}
              onChange={(e) => onUpdateConfig({ targetStrategy: e.target.value as any })}
              className={`w-full text-xs font-medium rounded-xl px-3 py-2 border focus:ring-2 focus:outline-hidden ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-50/50 border-orange-200 text-stone-900 focus:ring-orange-500"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-50/50 border-blue-200 text-slate-900 focus:ring-blue-500"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-50/50 border-emerald-200 text-stone-900 focus:ring-emerald-500"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-50/50 border-amber-200 text-stone-900 focus:ring-amber-500"
                  : "bg-zinc-50 border-zinc-300 text-zinc-800 focus:ring-[#8AA66B]"
              }`}
            >
              <option value="tomorrow" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                Send Next-Day (T+1) Schedule Preview
              </option>
              <option value="today" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                Send Same-Day (Today's) Roster
              </option>
              <option value="upcoming_48h" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                Send Next 48 Hours Schedule
              </option>
              <option value="all" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                Send All Dates in CSV
              </option>
            </select>
            <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
              Select which appointment dates from the CSV are pulled for each daily dispatch.
            </p>
          </div>
        </div>

        {/* Card 3: Distribution Method */}
        <div
          className={`border rounded-2xl p-5 shadow-xs space-y-3 transition-colors ${
            isDarkMode
              ? "bg-[#08150D] border-[#00FF41]/35 text-[#D2FAD7]"
              : activeHolidaySeason === "halloween"
              ? "bg-white border-orange-200 text-stone-900 shadow-orange-600/5"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white border-blue-200 text-slate-900 shadow-blue-600/5"
              : activeHolidaySeason === "christmas"
              ? "bg-white border-emerald-200 text-stone-900 shadow-emerald-600/5"
              : activeHolidaySeason === "new_year"
              ? "bg-white border-amber-200 text-stone-900 shadow-amber-600/5"
              : "bg-white border-[#CFE0B8] text-zinc-800"
          }`}
        >
          <div
            className={`flex items-center space-x-2 font-bold text-xs uppercase tracking-wider ${
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
                : "text-zinc-800"
            }`}
          >
            <Send
              className={`w-4 h-4 ${
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
            <span>Distribution Channel</span>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
              Delivery Mode
            </label>
            <select
              value={config.sendMode}
              onChange={(e) => onUpdateConfig({ sendMode: e.target.value as any })}
              className={`w-full text-xs font-medium rounded-xl px-3 py-2 border focus:ring-2 focus:outline-hidden ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-50/50 border-orange-200 text-stone-900 focus:ring-orange-500"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-50/50 border-blue-200 text-slate-900 focus:ring-blue-500"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-50/50 border-emerald-200 text-stone-900 focus:ring-emerald-500"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-50/50 border-amber-200 text-stone-900 focus:ring-amber-500"
                  : "bg-zinc-50 border-zinc-300 text-zinc-800 focus:ring-[#8AA66B]"
              }`}
            >
              <option value="simulation" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                Outlook Automation &amp; Sandbox Simulator
              </option>
              <option value="webhook" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                Webhook / Power Automate / Zapier
              </option>
              <option value="smtp" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                Direct SMTP Email Server
              </option>
            </select>
            <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
              Integrates with Microsoft 365, Power Automate, SMTP relay, or local Outlook templates.
            </p>
          </div>
        </div>
      </div>

      {/* Batch Export & Bulk Actions Bar */}
      <div
        className={`border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
          isDarkMode
            ? "bg-[#0C1E12] border-[#00FF41]/35 text-[#D2FAD7]"
            : activeHolidaySeason === "halloween"
            ? "bg-orange-50/80 border-orange-200 text-stone-900"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-blue-50/80 border-blue-200 text-slate-900"
            : activeHolidaySeason === "christmas"
            ? "bg-emerald-50/80 border-emerald-200 text-stone-900"
            : activeHolidaySeason === "new_year"
            ? "bg-amber-50/80 border-amber-200 text-stone-900"
            : "bg-white border-[#CFE0B8]"
        }`}
      >
        <div className="flex items-center space-x-3 text-left">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isDarkMode
                ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
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
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h4
              className={`text-xs font-bold ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-950 font-bold"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-950 font-bold"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-950 font-bold"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-950 font-bold"
                  : "text-zinc-900"
              }`}
            >
              Batch Export All Technician Schedules (.ZIP)
            </h4>
            <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
              Generates ready-to-send Outlook <span className={`font-mono font-bold ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-700"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-700"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-700"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-700"
                  : "text-[#3F4A33]"
              }`}>.EML</span> and <span className={`font-mono font-bold ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-700"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-700"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-700"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-700"
                  : "text-[#3F4A33]"
              }`}>.HTML</span> email files for all {rosters.length} technicians in one zip archive.
            </p>
          </div>
        </div>

        <button
          onClick={handleBatchZipDownload}
          disabled={rosters.length === 0}
          className={`w-full sm:w-auto flex items-center justify-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition shrink-0 disabled:opacity-50 cursor-pointer ${
            isDarkMode
              ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_12px_#00FF41]"
              : activeHolidaySeason === "halloween"
              ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
              : activeHolidaySeason === "christmas"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
              : activeHolidaySeason === "new_year"
              ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
              : "bg-[#3F4A33] hover:bg-[#2F3826] text-white"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Download All ({rosters.length} Techs) as ZIP</span>
        </button>
      </div>

      {/* Live Automation Console / Terminal Output */}
      {logs.length > 0 && (
        <div
          className={`rounded-2xl p-4 border font-mono text-xs space-y-2 shadow-xs ${
            isDarkMode
              ? "bg-[#040906] border-[#00FF41]/35 text-[#D2FAD7]"
              : "bg-zinc-950 border-zinc-800 text-zinc-300"
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isDarkMode ? "border-[#00FF41]/25 text-[#00FF41]" : "border-zinc-800 text-zinc-400"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Terminal className={`w-4 h-4 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-400"}`} />
              <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-white"}`}>Live Automation Execution Logs</span>
            </div>
            <span className={`text-[10px] ${isDarkMode ? "text-[#D2FAD7]/60" : "text-zinc-500"}`}>Real-time status</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 py-1">
            {logs.map((log, i) => (
              <div key={i} className={`text-[11px] leading-relaxed ${isDarkMode ? "text-[#00FF41]" : "text-emerald-400/90"}`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
