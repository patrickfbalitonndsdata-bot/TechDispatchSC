import React, { useState } from "react";
import { X, Sparkles, Check, RefreshCw, HelpCircle, Layers } from "lucide-react";
import { ColumnMapping } from "../types";
import { useTheme } from "../context/ThemeContext";

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  currentMapping: ColumnMapping;
  sampleRows: Record<string, string>[];
  onSaveMapping: (newMapping: ColumnMapping) => void;
}

const FIELD_LABELS: { key: keyof ColumnMapping; label: string; description: string; required: boolean }[] = [
  { key: "locationId", label: "Location ID", description: "e.g. 26-104822-001 (Project # is automatically extracted by removing -001)", required: false },
  { key: "setupBefore", label: "Setup Before (Install Date & Time)", description: "Date (MM/DD/YYYY) & Time for Installs. Placed in corresponding Day of Week section.", required: false },
  { key: "teardownAfter", label: "Teardown After (Teardown Date & Time)", description: "Date (MM/DD/YYYY) & Time for Teardowns. Placed in corresponding Day of Week section.", required: false },
  { key: "scheduleOrder", label: "Schedule Order (Order List Sequence)", description: "Sorts install tasks and location bullets in numerical sequence (1, 2, 3...) within each day.", required: false },
  { key: "batteryCheckPrefix", label: "Battery Change / Equipment Checks", description: "Auto-scans columns: Battery Change/Equipment Check 1, 2, 3, 4, 5, 6, 7... only placed if date exists.", required: false },
  { key: "serviceType", label: "Service Type", description: "e.g. Miovision, ATR, Radar, Turning Movement", required: false },
  { key: "serviceTypeAddOns", label: "Service Type Add Ons", description: "Add ons from project ID / locations (e.g. Drone, ATR, Radar)", required: false },
  { key: "cityState", label: "City, State", description: "e.g. Dallas, TX or Fort Worth, TX", required: false },
  { key: "countyParish", label: "Different County / Parish (from Locations)", description: "e.g. Vermilion Parish, Lafayette Parish (used for LADOTD volume lines)", required: false },
  { key: "workWeek", label: "Work Week (WW)", description: "e.g. Work Week 32, WW 32, 32", required: false },
  { key: "cameraCounts", label: "Camera Counts", description: "e.g. 2 cameras, 0 cameras, 4 cameras", required: false },
  { key: "backupUnits", label: "Backup Units (Backup Cameras)", description: "e.g. 1, 1 backup, 2 backups (displayed as + 1 backup in location bullet)", required: false },
  { key: "schedulingTeamNotes", label: "Scheduling Team Notes", description: "Project-level notes e.g. (City of Dallas - List 104) replacing <City, State> in task lines", required: false },
  { key: "scheduleNotes", label: "Schedule Notes (Location Notes)", description: "Location-specific schedule notes e.g. (Also collecting data for 26-450236-004) beside camera counts", required: false },
  { key: "scheduleDetails", label: "Schedule Details", description: "Study duration e.g. '1 Day: Tue/Wed/Thu = TBD' converted into hours collection (24-hr, 48-hr...)", required: false },
  { key: "taskCategory", label: "Task / Job Category", description: "Install, Teardown, or BatterySwap / SD Check", required: false },
  { key: "teardownTimeNotes", label: "Teardown Time Notes", description: "e.g. Anytime, 10:00 AM, After rush hour", required: false },
  { key: "daysOfCollection", label: "Days of Collection", description: "e.g. 3-day, 5-day, 7-day", required: false },
  { key: "technicianName", label: "Technician Name", description: "Worker or field agent assigned to the job", required: true },
  { key: "technicianEmail", label: "Technician Email", description: "Email address where the schedule will be sent", required: true },
  { key: "date", label: "Fallback Scheduled Date", description: "Fallback single date if Setup/Teardown columns are absent", required: false },
  { key: "timeSlot", label: "Arrival Window / Time", description: "Time slot e.g. 08:00 AM - 10:00 AM", required: false },
  { key: "orderNumber", label: "Work Order # / Job ID", description: "Unique ticket number or work order ID", required: false },
  { key: "customerName", label: "Customer / Client Name", description: "Name of customer, business, or site contact", required: false },
  { key: "customerPhone", label: "Customer Phone Number", description: "Contact phone for technician to call on arrival", required: false },
  { key: "serviceAddress", label: "Service Location / Address", description: "Full address used for Google/Apple Maps GPS link", required: false },
  { key: "jobType", label: "Job / Work Type", description: "Title of service (e.g. Miovision, AC Diagnostic)", required: false },
  { key: "priority", label: "Priority / Urgency", description: "Urgent, High, Normal, Low severity level", required: false },
  { key: "description", label: "Task Scope / Description", description: "Detailed summary of customer issue or work to do", required: false },
  { key: "requiredParts", label: "Required Parts & Tools", description: "Special equipment, filters, replacement parts", required: false },
  { key: "specialInstructions", label: "Dispatcher Notes / Gate Codes", description: "Access notes, security codes, parking instructions", required: false },
  { key: "estimatedDurationMin", label: "Estimated Duration (Min)", description: "Job duration in minutes for shift math", required: false },
];

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  headers,
  currentMapping,
  sampleRows,
  onSaveMapping,
}) => {
  const { isDarkMode, activeHolidaySeason } = useTheme();
  const [mapping, setMapping] = useState<ColumnMapping>({ ...currentMapping });
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFieldChange = (key: keyof ColumnMapping, val: string) => {
    setMapping((prev) => ({ ...prev, [key]: val }));
  };

  const handleAiAutoMatch = async () => {
    setIsAiMatching(true);
    setAiSuccessMessage(null);
    try {
      const res = await fetch("/api/ai/match-columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers, sampleRows }),
      });
      const data = await res.json();
      if (data.matches && Object.keys(data.matches).length > 0) {
        setMapping((prev) => ({
          ...prev,
          ...data.matches,
        }));
        setAiSuccessMessage("AI successfully mapped detected column headers!");
      }
    } catch (err) {
      console.error("AI matching failed:", err);
    } finally {
      setIsAiMatching(false);
    }
  };

  const handleSave = () => {
    onSaveMapping(mapping);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isDarkMode
            ? "bg-[#08150D] border-[#00FF41]/40 shadow-[0_0_30px_rgba(0,255,65,0.2)] text-[#D2FAD7]"
            : activeHolidaySeason === "halloween"
            ? "bg-white border-2 border-orange-300 shadow-orange-950/20 text-orange-950"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white border-2 border-blue-300 shadow-blue-950/20 text-blue-950"
            : activeHolidaySeason === "christmas"
            ? "bg-white border-2 border-emerald-300 shadow-emerald-950/20 text-stone-900"
            : activeHolidaySeason === "new_year"
            ? "bg-white border-2 border-amber-300 shadow-amber-950/20 text-amber-950"
            : "bg-white border-[#CFE0B8] text-[#3F4A33]"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isDarkMode
              ? "bg-[#040906] border-[#00FF41]/30 text-white"
              : activeHolidaySeason === "halloween"
              ? "bg-[#2A130A] border-orange-400/40 text-white"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-[#0F1E36] border-amber-300/40 text-white"
              : activeHolidaySeason === "christmas"
              ? "bg-[#143E23] border-red-400/40 text-white"
              : activeHolidaySeason === "new_year"
              ? "bg-[#1E1B4B] border-yellow-300/40 text-white"
              : "bg-[#3F4A33] border-[#CFE0B8] text-white"
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isDarkMode
                  ? "bg-[#00FF41]/20 border-[#00FF41]/40 text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-600 text-white border-orange-400"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-600 text-white border-amber-400"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-600 text-white border-emerald-400"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-600 text-white border-amber-400"
                  : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
              }`}
            >
              <Layers className={`w-4 h-4 ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason !== "standard"
                  ? "text-white"
                  : "text-[#8AA66B]"
              }`} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">CSV Column Mapping</h2>
              <p className={`text-xs ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-white/80"
                  : "text-[#CFE0B8]"
              }`}>
                Map columns from your uploaded CSV file to technician schedule fields
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/15"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div
          className={`px-6 py-3 border-b flex items-center justify-between text-xs ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/20 text-[#D2FAD7]"
              : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
          }`}
        >
          <div className="font-medium">
            Detected <span className={`font-bold ${isDarkMode ? "text-[#00FF41] font-mono" : "text-[#3F4A33]"}`}>{headers.length}</span> columns in CSV file
          </div>
          <button
            onClick={handleAiAutoMatch}
            disabled={isAiMatching}
            className={`flex items-center space-x-1.5 font-bold px-3.5 py-1.5 rounded-xl border transition cursor-pointer shadow-2xs ${
              isDarkMode
                ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/50 hover:bg-[#00FF41]/20 shadow-[0_0_10px_rgba(0,255,65,0.2)] font-mono"
                : "text-[#3F4A33] bg-[#EDF3E3] hover:bg-[#CFE0B8] border-[#CFE0B8]"
            }`}
          >
            {isAiMatching ? (
              <RefreshCw className={`w-3.5 h-3.5 animate-spin ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
            ) : (
              <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
            )}
            <span>{isAiMatching ? "Analyzing Columns..." : "AI Auto-Match Columns"}</span>
          </button>
        </div>

        {aiSuccessMessage && (
          <div
            className={`mx-6 mt-3 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border ${
              isDarkMode
                ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#00FF41]"
                : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <Check className={`w-4 h-4 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
            <span className="font-semibold">{aiSuccessMessage}</span>
          </div>
        )}

        {/* Mapping Form List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FIELD_LABELS.map(({ key, label, description, required }) => (
              <div
                key={key}
                className={`border rounded-xl p-3.5 space-y-2 transition-colors ${
                  isDarkMode
                    ? "bg-[#040906] border-[#00FF41]/30 hover:border-[#00FF41]/60"
                    : "bg-[#FBF7F0] border-[#CFE0B8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-bold flex items-center gap-1 ${
                      isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"
                    }`}
                  >
                    <span>{label}</span>
                    {required && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  {mapping[key] ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isDarkMode
                          ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                          : "text-[#3F4A33] bg-[#CFE0B8] border-transparent"
                      }`}
                    >
                      Mapped
                    </span>
                  ) : (
                    <span className={`text-[10px] ${isDarkMode ? "text-[#D2FAD7]/50" : "text-[#3F4A33]/60"}`}>
                      Optional
                    </span>
                  )}
                </div>
                <p className={`text-[11px] line-clamp-1 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#3F4A33]/70"}`}>
                  {description}
                </p>
                <select
                  value={mapping[key] || ""}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className={`w-full text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-hidden focus:ring-2 border ${
                    isDarkMode
                      ? "bg-[#08150D] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                      : "bg-white border-[#CFE0B8] text-[#3F4A33] focus:ring-[#8AA66B]"
                  }`}
                >
                  <option value="" className={isDarkMode ? "bg-[#08150D] text-[#D2FAD7]" : ""}>
                    -- (Not Mapped) --
                  </option>
                  {headers.map((h) => (
                    <option key={h} value={h} className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                      Column: {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-end space-x-3 ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/30"
              : activeHolidaySeason === "halloween"
              ? "bg-[#251208] border-orange-400/30"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-[#0c182b] border-amber-300/30"
              : activeHolidaySeason === "christmas"
              ? "bg-[#0e2c19] border-red-400/30"
              : activeHolidaySeason === "new_year"
              ? "bg-[#18153b] border-yellow-300/30"
              : "bg-[#FBF7F0] border-[#CFE0B8]"
          }`}
        >
          <button
            onClick={onClose}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
              isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10"
                : activeHolidaySeason !== "standard"
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-[#3F4A33] hover:bg-[#EDF3E3]"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer ${
              isDarkMode
                ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_12px_#00FF41]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-600 hover:bg-orange-500 text-white"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Apply Mapping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
