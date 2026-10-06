import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Search,
  Trash2,
  Download,
  Calendar,
  User,
  History,
  Sparkles,
  Copy,
  Check,
  Eye,
  ExternalLink,
  RotateCcw,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  GeneratedEmailRecord,
  getStoredGeneratedEmails,
  deleteStoredGeneratedEmail,
  clearStoredGeneratedEmailsForTech,
  clearStoredGeneratedEmailsForWorkWeeks,
  LOCAL_STORAGE_KEY_EMAILS,
  NDS_SAVED_EMAILS_EVENT,
} from "../utils/generatedEmailStorage";
import { cleanTechnicianName, copyRichHtmlToClipboard } from "../utils/outlookTemplateGenerator";
import { useTheme } from "../context/ThemeContext";
import { EmailViewerModal } from "./EmailViewerModal";
import { ClearWorkWeekModal } from "./ClearWorkWeekModal";

interface SavedEmailsHistoryTabProps {
  activeTechName?: string;
  onSelectTechInGenerator?: (techName: string) => void;
  onLoadSavedEmailIntoGenerator?: (record: GeneratedEmailRecord) => void;
}

export const SavedEmailsHistoryTab: React.FC<SavedEmailsHistoryTabProps> = ({
  activeTechName,
  onSelectTechInGenerator,
  onLoadSavedEmailIntoGenerator,
}) => {
  const { isDarkMode, activeHolidaySeason, holidayConfig } = useTheme();
  const [history, setHistory] = useState<GeneratedEmailRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechFilter, setSelectedTechFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedHtmlId, setCopiedHtmlId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<GeneratedEmailRecord | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [isClearWorkWeekModalOpen, setIsClearWorkWeekModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Load history from localStorage
  const loadHistory = () => {
    const records = getStoredGeneratedEmails();
    setHistory(records);
    return records;
  };

  useEffect(() => {
    loadHistory();

    // Listen for storage events across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_EMAILS) {
        loadHistory();
      }
    };
    // Listen for in-app updates dispatched in the same window
    const handleCustomUpdate = () => {
      loadHistory();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(NDS_SAVED_EMAILS_EVENT, handleCustomUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(NDS_SAVED_EMAILS_EVENT, handleCustomUpdate);
    };
  }, []);

  // Unique list of technicians in history
  const technicianList = useMemo(() => {
    const techSet = new Set<string>();
    history.forEach((h) => techSet.add(h.cleanTechName));
    return Array.from(techSet).sort();
  }, [history]);

  // Filtered history list
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (selectedTechFilter !== "all") {
        if (item.cleanTechName.toLowerCase() !== selectedTechFilter.toLowerCase()) {
          return false;
        }
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.technicianName.toLowerCase().includes(term) ||
        item.cleanTechName.toLowerCase().includes(term) ||
        item.workWeek.toLowerCase().includes(term) ||
        item.subject.toLowerCase().includes(term) ||
        String(item.version).toLowerCase().includes(term) ||
        (item.notes && item.notes.toLowerCase().includes(term)) ||
        item.exportMethod.toLowerCase().includes(term)
      );
    });
  }, [history, selectedTechFilter, searchTerm]);

  // Handle single record deletion
  const handleDeleteRecord = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = deleteStoredGeneratedEmail(id);
    setHistory(updated);
    setFeedbackNotice("Deleted email record from local storage.");
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Handle clear all records for filtered tech or all
  const handleClearHistory = () => {
    if (selectedTechFilter !== "all") {
      const updated = clearStoredGeneratedEmailsForTech(selectedTechFilter);
      setHistory(updated);
      setFeedbackNotice(`Cleared all stored history for ${selectedTechFilter}.`);
    } else {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY_EMAILS);
        setHistory([]);
        setFeedbackNotice("Cleared all generated email records.");
      } catch (err) {
        console.warn("Failed to clear local storage", err);
      }
    }
    setConfirmClearAll(false);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // Handle clear specific selected work weeks
  const handleClearWorkWeeks = (selectedWeeks: string[], techName?: string) => {
    const updated = clearStoredGeneratedEmailsForWorkWeeks(selectedWeeks, techName);
    setHistory(updated);
    const scopeLabel = techName ? ` for ${techName}` : "";
    setFeedbackNotice(
      `Cleared stored records for ${selectedWeeks.length} work week${selectedWeeks.length !== 1 ? "s" : ""}${scopeLabel}.`
    );
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // Handle copy subject
  const handleCopySubject = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle copy HTML
  const handleCopyHtml = async (item: GeneratedEmailRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!item.htmlContent) return;
    const ok = await copyRichHtmlToClipboard(item.htmlContent, item.plainTextContent || "");
    if (ok) {
      setCopiedHtmlId(item.id);
      setTimeout(() => setCopiedHtmlId(null), 2500);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredHistory.length === 0) return;
    const headers = ["Date Generated", "Technician", "Work Week", "Version", "Subject", "Method", "Stops Count", "Notes"];
    const rows = filteredHistory.map((r) => [
      `"${r.dateFormatted}"`,
      `"${r.cleanTechName}"`,
      `"${r.workWeek}"`,
      `"${r.version}"`,
      `"${r.subject.replace(/"/g, '""')}"`,
      `"${r.exportMethod}"`,
      `"${r.jobCount || ""}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvText = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NDS_Saved_Emails_History_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Card */}
      <div
        className={`rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-colors ${
          isDarkMode
            ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_25px_rgba(0,255,65,0.15)] text-[#D2FAD7]"
            : activeHolidaySeason === "halloween"
            ? "bg-white/95 border-2 border-orange-500/40 shadow-md shadow-orange-950/10 text-orange-950"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white/95 border-2 border-blue-500/40 shadow-md shadow-blue-950/10 text-blue-950"
            : activeHolidaySeason === "christmas"
            ? "bg-white/95 border-2 border-emerald-500/40 shadow-md shadow-emerald-950/10 text-stone-900"
            : activeHolidaySeason === "new_year"
            ? "bg-white/95 border-2 border-amber-500/40 shadow-md shadow-amber-950/10 text-amber-950"
            : "bg-white border-[#CFE0B8]"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-2xs border ${
              isDarkMode
                ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.25)]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-100 text-orange-600 border-orange-300"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-100 text-blue-600 border-blue-300"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-100 text-emerald-600 border-emerald-300"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-100 text-amber-600 border-amber-300"
                : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
            }`}
          >
            <History
              className={`w-5 h-5 ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-600"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600"
                  : "text-[#8AA66B]"
              }`}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2
                className={`text-base font-bold ${
                  isDarkMode
                    ? "text-[#E0FFE5]"
                    : activeHolidaySeason !== "standard"
                    ? "text-stone-900 font-extrabold"
                    : "text-[#3F4A33]"
                }`}
              >
                Saved Emails History Directory
              </h2>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-100 text-orange-800 border-orange-300"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : activeHolidaySeason === "christmas"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : activeHolidaySeason === "new_year"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                }`}
              >
                {history.length} Email{history.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p
              className={`text-xs ${
                isDarkMode
                  ? "text-[#D2FAD7]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Locally persisted Outlook emails. Click{" "}
              <strong
                className={
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
                    : "text-zinc-800"
                }
              >
                Display Email
              </strong>{" "}
              to view any generated schedule anytime.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredHistory.length === 0}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border shadow-2xs transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 ${
              isDarkMode
                ? "bg-[#040906] hover:bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.25)] font-mono"
                : activeHolidaySeason === "halloween"
                ? "bg-white hover:bg-orange-50 text-orange-800 border-orange-300 hover:border-orange-500"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white hover:bg-blue-50 text-blue-800 border-blue-300 hover:border-blue-500"
                : activeHolidaySeason === "christmas"
                ? "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 hover:border-emerald-500"
                : activeHolidaySeason === "new_year"
                ? "bg-white hover:bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-500"
                : "bg-white hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
            }`}
          >
            <Download
              className={`w-3.5 h-3.5 ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-600"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600"
                  : "text-[#8AA66B]"
              }`}
            />
            <span>Export CSV</span>
          </button>

          {/* Clear by Work Week button */}
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearWorkWeekModalOpen(true)}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border shadow-2xs transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                isDarkMode
                  ? "bg-[#040906] hover:bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.25)] font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "bg-white hover:bg-orange-50 text-orange-800 border-orange-300 hover:border-orange-500"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-white hover:bg-blue-50 text-blue-800 border-blue-300 hover:border-blue-500"
                  : activeHolidaySeason === "christmas"
                  ? "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 hover:border-emerald-500"
                  : activeHolidaySeason === "new_year"
                  ? "bg-white hover:bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-500"
                  : "bg-white hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
              title="Select and clear specific work weeks from history"
            >
              <Calendar
                className={`w-3.5 h-3.5 ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "text-orange-600"
                    : activeHolidaySeason === "christmas_eve"
                    ? "text-blue-600"
                    : activeHolidaySeason === "christmas"
                    ? "text-emerald-600"
                    : activeHolidaySeason === "new_year"
                    ? "text-amber-600"
                    : "text-[#8AA66B]"
                }`}
              />
              <span>Clear by Work Week</span>
            </button>
          )}

          {/* Clear History button */}
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirmClearAll) {
                  handleClearHistory();
                } else {
                  setConfirmClearAll(true);
                  setTimeout(() => setConfirmClearAll(false), 4000);
                }
              }}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                confirmClearAll
                  ? isDarkMode
                    ? "bg-red-600 text-white border-red-500 animate-pulse shadow-[0_0_15px_red]"
                    : "bg-red-600 text-white border-red-700 animate-pulse"
                  : isDarkMode
                  ? "bg-red-950/40 hover:bg-red-900/50 text-rose-300 border-red-800/50 hover:shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                  : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              }`}
              title="Clear stored email records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {confirmClearAll
                  ? selectedTechFilter !== "all"
                    ? `Confirm Clear ${selectedTechFilter}?`
                    : "Confirm Clear All?"
                  : selectedTechFilter !== "all"
                  ? `Clear ${selectedTechFilter}`
                  : "Clear All History"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackNotice && (
        <div
          className={`text-xs font-medium px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between border animate-in fade-in duration-150 ${
            isDarkMode
              ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.2)] font-mono"
              : activeHolidaySeason === "halloween"
              ? "bg-orange-800 text-white border-transparent"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-blue-800 text-white border-transparent"
              : activeHolidaySeason === "christmas"
              ? "bg-emerald-800 text-white border-transparent"
              : activeHolidaySeason === "new_year"
              ? "bg-amber-800 text-white border-transparent"
              : "bg-[#3F4A33] text-white border-transparent"
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? "text-[#00FF41]" : "text-white"}`} />
            <span>{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className={`text-xs cursor-pointer ${isDarkMode ? "text-[#D2FAD7] hover:text-[#00FF41]" : "text-white/80 hover:text-white"}`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div
        className={`rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border transition-colors ${
          isDarkMode
            ? "bg-[#08150D]/90 border-[#00FF41]/30 text-[#D2FAD7] shadow-[0_0_15px_rgba(0,255,65,0.08)]"
            : activeHolidaySeason === "halloween"
            ? "bg-white/95 border-2 border-orange-500/30 text-stone-900 shadow-md shadow-orange-950/5"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white/95 border-2 border-blue-500/30 text-stone-900 shadow-md shadow-blue-950/5"
            : activeHolidaySeason === "christmas"
            ? "bg-white/95 border-2 border-emerald-500/30 text-stone-900 shadow-md shadow-emerald-950/5"
            : activeHolidaySeason === "new_year"
            ? "bg-white/95 border-2 border-amber-500/30 text-stone-900 shadow-md shadow-amber-950/5"
            : "bg-white border-[#CFE0B8]"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-600"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600"
                  : "text-[#8AA66B]"
              }`}
            />
            <input
              type="text"
              placeholder="Search by technician, subject, work week, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8.5 pr-3 py-1.5 rounded-xl text-xs focus:outline-hidden border ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] placeholder:text-[#D2FAD7]/50 focus:ring-2 focus:ring-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-50/50 border-orange-300 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-50/50 border-blue-300 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-blue-500"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-50/50 border-emerald-300 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-50/50 border-amber-300 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500"
                  : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33] placeholder:text-[#3F4A33]/50 focus:ring-2 focus:ring-[#8AA66B]"
              }`}
            />
          </div>

          {/* Technician Filter Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter
              className={`w-3.5 h-3.5 shrink-0 hidden sm:inline ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-600"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600"
                  : "text-[#8AA66B]"
              }`}
            />
            <select
              value={selectedTechFilter}
              onChange={(e) => setSelectedTechFilter(e.target.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden cursor-pointer w-full sm:w-auto shadow-2xs border ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] focus:ring-2 focus:ring-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-white border-orange-300 text-stone-900 focus:ring-2 focus:ring-orange-500"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-white border-blue-300 text-stone-900 focus:ring-2 focus:ring-blue-500"
                  : activeHolidaySeason === "christmas"
                  ? "bg-white border-emerald-300 text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  : activeHolidaySeason === "new_year"
                  ? "bg-white border-amber-300 text-stone-900 focus:ring-2 focus:ring-amber-500"
                  : "bg-white border-[#CFE0B8] text-[#3F4A33] focus:ring-2 focus:ring-[#8AA66B]"
              }`}
            >
              <option value="all">All Technicians ({history.length} records)</option>
              {technicianList.map((tech) => {
                const count = history.filter((h) => h.cleanTechName.toLowerCase() === tech.toLowerCase()).length;
                return (
                  <option key={tech} value={tech}>
                    {tech} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div
          className={`text-[11px] font-medium shrink-0 ${
            isDarkMode
              ? "text-[#D2FAD7]/80"
              : activeHolidaySeason !== "standard"
              ? "text-stone-600"
              : "text-[#3F4A33]/70"
          }`}
        >
          Showing{" "}
          <strong
            className={
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
            }
          >
            {filteredHistory.length}
          </strong>{" "}
          of{" "}
          <strong
            className={
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
            }
          >
            {history.length}
          </strong>{" "}
          stored emails
        </div>
      </div>

      {/* History Grid / List */}
      {filteredHistory.length === 0 ? (
        <div
          className={`rounded-2xl p-12 text-center space-y-3 shadow-xs border ${
            isDarkMode
              ? "bg-[#08150D]/90 border-[#00FF41]/30 text-[#D2FAD7] shadow-[0_0_20px_rgba(0,255,65,0.1)]"
              : activeHolidaySeason === "halloween"
              ? "bg-white/95 border-orange-200 shadow-md text-stone-900"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-white/95 border-blue-200 shadow-md text-stone-900"
              : activeHolidaySeason === "christmas"
              ? "bg-white/95 border-emerald-200 shadow-md text-stone-900"
              : activeHolidaySeason === "new_year"
              ? "bg-white/95 border-amber-200 shadow-md text-stone-900"
              : "bg-white border-zinc-200"
          }`}
        >
          <History
            className={`w-12 h-12 mx-auto ${
              isDarkMode
                ? "text-[#00FF41]/50"
                : activeHolidaySeason === "halloween"
                ? "text-orange-300"
                : activeHolidaySeason === "christmas_eve"
                ? "text-blue-300"
                : activeHolidaySeason === "christmas"
                ? "text-emerald-300"
                : activeHolidaySeason === "new_year"
                ? "text-amber-300"
                : "text-zinc-300"
            }`}
          />
          <h3
            className={`text-sm font-semibold ${
              isDarkMode
                ? "text-[#E0FFE5]"
                : activeHolidaySeason !== "standard"
                ? "text-stone-900 font-bold"
                : "text-zinc-900"
            }`}
          >
            No Stored Email Records Found
          </h3>
          <p
            className={`text-xs max-w-md mx-auto ${
              isDarkMode
                ? "text-[#D2FAD7]/80"
                : activeHolidaySeason !== "standard"
                ? "text-stone-600"
                : "text-zinc-500"
            }`}
          >
            {searchTerm || selectedTechFilter !== "all"
              ? "No saved emails match your current filter criteria. Try clearing the search or switching technician."
              : "Whenever you generate, copy, download, or click Save to History on an Outlook schedule, it will appear here so you can display and re-use it anytime."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((record) => {
            const isCurrentTech =
              activeTechName && cleanTechnicianName(activeTechName).toLowerCase() === record.cleanTechName.toLowerCase();

            return (
              <div
                key={record.id}
                className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-300 flex flex-col space-y-3 group border transform hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "bg-[#08150D]/90 border-[#00FF41]/30 hover:border-[#00FF41] text-[#D2FAD7] shadow-[0_0_15px_rgba(0,255,65,0.08)] hover:shadow-[0_0_25px_rgba(0,255,65,0.25)]"
                    : activeHolidaySeason === "halloween"
                    ? "bg-white/95 border-orange-200 hover:border-orange-500 shadow-md shadow-orange-950/5"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-white/95 border-blue-200 hover:border-blue-500 shadow-md shadow-blue-950/5"
                    : activeHolidaySeason === "christmas"
                    ? "bg-white/95 border-emerald-200 hover:border-emerald-500 shadow-md shadow-emerald-950/5"
                    : activeHolidaySeason === "new_year"
                    ? "bg-white/95 border-amber-200 hover:border-amber-500 shadow-md shadow-amber-950/5"
                    : "bg-white border-[#CFE0B8] hover:border-[#8AA66B]"
                }`}
              >
                {/* Card Top Row: Version Badge, Tech, Work Week, Date, and Quick Actions */}
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                    isDarkMode
                      ? "border-[#00FF41]/20"
                      : activeHolidaySeason === "halloween"
                      ? "border-orange-100"
                      : activeHolidaySeason === "christmas_eve"
                      ? "border-blue-100"
                      : activeHolidaySeason === "christmas"
                      ? "border-emerald-100"
                      : activeHolidaySeason === "new_year"
                      ? "border-amber-100"
                      : "border-[#CFE0B8]/60"
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    {/* Version Badge */}
                    <span
                      className={`font-black px-2.5 py-0.5 rounded-lg text-xs border ${
                        isDarkMode
                          ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                          : activeHolidaySeason === "halloween"
                          ? "bg-orange-100 text-orange-900 border-orange-300"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-blue-100 text-blue-900 border-blue-300"
                          : activeHolidaySeason === "christmas"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : activeHolidaySeason === "new_year"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : String(record.version).toLowerCase().includes("update") ||
                            (String(record.version).toLowerCase().includes("v") && !String(record.version).toLowerCase().includes("v0"))
                          ? "bg-[#EDF3E3] text-[#3F4A33] border-[#8AA66B]"
                          : "bg-[#FBF7F0] text-[#3F4A33] border-[#CFE0B8]"
                      }`}
                    >
                      {record.version}
                    </span>

                    {/* Technician Name */}
                    <div
                      className={`flex items-center space-x-1 font-bold text-xs ${
                        isDarkMode
                          ? "text-[#E0FFE5]"
                          : activeHolidaySeason !== "standard"
                          ? "text-stone-900"
                          : "text-[#3F4A33]"
                      }`}
                    >
                      <User
                        className={`w-3.5 h-3.5 ${
                          isDarkMode
                            ? "text-[#00FF41]"
                            : activeHolidaySeason === "halloween"
                            ? "text-orange-600"
                            : activeHolidaySeason === "christmas_eve"
                            ? "text-blue-600"
                            : activeHolidaySeason === "christmas"
                            ? "text-emerald-600"
                            : activeHolidaySeason === "new_year"
                            ? "text-amber-600"
                            : "text-[#8AA66B]"
                        }`}
                      />
                      <span>{record.cleanTechName}</span>
                    </div>

                    <span className={isDarkMode ? "text-[#00FF41]/40 text-xs" : "text-[#CFE0B8] text-xs"}>•</span>

                    {/* Work Week */}
                    <div
                      className={`flex items-center space-x-1 text-xs ${
                        isDarkMode
                          ? "text-[#D2FAD7]"
                          : activeHolidaySeason !== "standard"
                          ? "text-stone-600"
                          : "text-[#3F4A33]/70"
                      }`}
                    >
                      <Calendar
                        className={`w-3.5 h-3.5 ${
                          isDarkMode
                            ? "text-[#00FF41]"
                            : activeHolidaySeason === "halloween"
                            ? "text-orange-600"
                            : activeHolidaySeason === "christmas_eve"
                            ? "text-blue-600"
                            : activeHolidaySeason === "christmas"
                            ? "text-emerald-600"
                            : activeHolidaySeason === "new_year"
                            ? "text-amber-600"
                            : "text-[#8AA66B]"
                        }`}
                      />
                      <span>{record.workWeek}</span>
                    </div>

                    {isCurrentTech && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs border ${
                          isDarkMode
                            ? "bg-[#00FF41] text-[#040906] border-[#00FF41] shadow-[0_0_10px_#00FF41] font-extrabold"
                            : activeHolidaySeason === "halloween"
                            ? "bg-orange-600 text-white border-orange-600"
                            : activeHolidaySeason === "christmas_eve"
                            ? "bg-blue-600 text-white border-blue-600"
                            : activeHolidaySeason === "christmas"
                            ? "bg-red-600 text-white border-red-600"
                            : activeHolidaySeason === "new_year"
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-[#8AA66B] text-white border-[#8AA66B]"
                        }`}
                      >
                        Active Tech
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-xs shrink-0">
                    <span className={`text-[11px] font-mono ${isDarkMode ? "text-[#D2FAD7]/80" : "text-stone-500"}`}>
                      {record.dateFormatted}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                        isDarkMode
                          ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 font-mono"
                          : activeHolidaySeason === "halloween"
                          ? "bg-orange-50 text-orange-900 border-orange-200"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-blue-50 text-blue-900 border-blue-200"
                          : activeHolidaySeason === "christmas"
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                          : activeHolidaySeason === "new_year"
                          ? "bg-amber-50 text-amber-900 border-amber-200"
                          : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                      }`}
                    >
                      {record.exportMethod}
                    </span>
                    {record.jobCount !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                          isDarkMode
                            ? "bg-[#040906] text-[#D2FAD7] border-[#00FF41]/30"
                            : activeHolidaySeason !== "standard"
                            ? "bg-white text-stone-700 border-stone-200"
                            : "bg-[#FBF7F0] text-[#3F4A33] border-[#CFE0B8]"
                        }`}
                      >
                        {record.jobCount} stops
                      </span>
                    )}

                    {/* Delete Individual Record */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRecord(record.id, e)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isDarkMode
                          ? "text-[#D2FAD7] hover:text-rose-400 hover:bg-rose-950/30"
                          : "text-stone-500 hover:text-red-600 hover:bg-red-50"
                      }`}
                      title="Delete this stored email record from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Subject & Notes */}
                <div className="text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span
                        className={`font-bold mr-1.5 ${
                          isDarkMode
                            ? "text-[#D2FAD7]/80"
                            : activeHolidaySeason !== "standard"
                            ? "text-stone-600"
                            : "text-[#3F4A33]/60"
                        }`}
                      >
                        Subject:
                      </span>
                      <span
                        className={`font-semibold select-all ${
                          isDarkMode
                            ? "text-[#E0FFE5]"
                            : activeHolidaySeason !== "standard"
                            ? "text-stone-900"
                            : "text-[#3F4A33]"
                        }`}
                      >
                        {record.subject}
                      </span>
                    </div>
                  </div>

                  {record.notes && (
                    <div
                      className={`border rounded-xl px-3 py-2 text-[11px] font-medium ${
                        isDarkMode
                          ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                          : activeHolidaySeason === "halloween"
                          ? "bg-orange-50/70 border-orange-200 text-stone-900"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-blue-50/70 border-blue-200 text-stone-900"
                          : activeHolidaySeason === "christmas"
                          ? "bg-emerald-50/70 border-emerald-200 text-stone-900"
                          : activeHolidaySeason === "new_year"
                          ? "bg-amber-50/70 border-amber-200 text-stone-900"
                          : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                      }`}
                    >
                      <span
                        className={`font-bold ${
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
                            : "text-[#8AA66B]"
                        }`}
                      >
                        Update Notes:
                      </span>{" "}
                      {record.notes}
                    </div>
                  )}

                  {record.additionalNotes && record.additionalNotes.length > 0 && (
                    <div className="flex items-center space-x-1.5 flex-wrap text-[10px] pt-1">
                      <span
                        className={`font-bold ${
                          isDarkMode
                            ? "text-[#D2FAD7]"
                            : activeHolidaySeason !== "standard"
                            ? "text-stone-700"
                            : "text-[#3F4A33]"
                        }`}
                      >
                        Additional Notes:
                      </span>
                      {record.additionalNotes.map((n) => (
                        <span
                          key={n.id}
                          className={`font-semibold px-2 py-0.5 rounded-lg border ${
                            isDarkMode
                              ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
                              : activeHolidaySeason === "halloween"
                              ? "bg-orange-50 text-orange-900 border-orange-200"
                              : activeHolidaySeason === "christmas_eve"
                              ? "bg-blue-50 text-blue-900 border-blue-200"
                              : activeHolidaySeason === "christmas"
                              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                              : activeHolidaySeason === "new_year"
                              ? "bg-amber-50 text-amber-900 border-amber-200"
                              : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                          }`}
                        >
                          {n.day}: {n.text.slice(0, 30)}...
                        </span>
                      ))}
                    </div>
                  )}

                  {record.brandingConfig?.overlappingSchedulesEnabled && (
                    <div className="flex items-center space-x-1.5 text-[10px] pt-0.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full border ${
                          isDarkMode
                            ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40"
                            : activeHolidaySeason === "halloween"
                            ? "bg-orange-100 text-orange-800 border-orange-300"
                            : activeHolidaySeason === "christmas_eve"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : activeHolidaySeason === "christmas"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : activeHolidaySeason === "new_year"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-[#8AA66B]/15 text-[#3F4A33] border-[#8AA66B]/30"
                        }`}
                      >
                        Overlapping Schedule Enabled
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions Row: Display Email Button + Copy HTML + Copy Subject */}
                <div
                  className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 ${
                    isDarkMode
                      ? "border-[#00FF41]/20"
                      : activeHolidaySeason === "halloween"
                      ? "border-orange-100"
                      : activeHolidaySeason === "christmas_eve"
                      ? "border-blue-100"
                      : activeHolidaySeason === "christmas"
                      ? "border-emerald-100"
                      : activeHolidaySeason === "new_year"
                      ? "border-amber-100"
                      : "border-[#CFE0B8]/60"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {/* DISPLAY EMAIL BUTTON (Prominent) */}
                    <button
                      type="button"
                      onClick={() => setViewingRecord(record)}
                      className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                        isDarkMode
                          ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-extrabold shadow-[0_0_15px_#00FF41] hover:shadow-[0_0_25px_#00FF41]"
                          : activeHolidaySeason === "halloween"
                          ? "bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-600/30"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30"
                          : activeHolidaySeason === "christmas"
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/30"
                          : activeHolidaySeason === "new_year"
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/30"
                          : "bg-[#8AA66B] hover:bg-[#7a965c] text-white shadow-xs"
                      }`}
                      title="Display the exact stored email with styled layout and preview options"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Display Email</span>
                    </button>

                    {/* Copy HTML Button */}
                    {record.htmlContent && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyHtml(record, e)}
                        className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border shadow-2xs transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                          isDarkMode
                            ? "bg-[#040906] hover:bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 hover:border-[#00FF41]"
                            : activeHolidaySeason === "halloween"
                            ? "bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-200"
                            : activeHolidaySeason === "christmas_eve"
                            ? "bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200"
                            : activeHolidaySeason === "christmas"
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200"
                            : activeHolidaySeason === "new_year"
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                            : "bg-[#EDF3E3] hover:bg-[#CFE0B8] text-[#3F4A33] border-[#CFE0B8]"
                        }`}
                        title="Copy styled HTML to paste directly into Outlook"
                      >
                        {copiedHtmlId === record.id ? (
                          <>
                            <Check
                              className={`w-3.5 h-3.5 ${
                                isDarkMode
                                  ? "text-[#00FF41]"
                                  : activeHolidaySeason === "halloween"
                                  ? "text-orange-600"
                                  : activeHolidaySeason === "christmas_eve"
                                  ? "text-blue-600"
                                  : activeHolidaySeason === "christmas"
                                  ? "text-emerald-600"
                                  : activeHolidaySeason === "new_year"
                                  ? "text-amber-600"
                                  : "text-[#8AA66B]"
                              }`}
                            />
                            <span
                              className={`font-bold ${
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
                                  : "text-[#8AA66B]"
                              }`}
                            >
                              Copied!
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy
                              className={`w-3.5 h-3.5 ${
                                isDarkMode
                                  ? "text-[#00FF41]"
                                  : activeHolidaySeason === "halloween"
                                  ? "text-orange-600"
                                  : activeHolidaySeason === "christmas_eve"
                                  ? "text-blue-600"
                                  : activeHolidaySeason === "christmas"
                                  ? "text-emerald-600"
                                  : activeHolidaySeason === "new_year"
                                  ? "text-amber-600"
                                  : "text-[#8AA66B]"
                              }`}
                            />
                            <span>Copy HTML</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Copy Subject Button */}
                    <button
                      type="button"
                      onClick={(e) => handleCopySubject(record.id, record.subject, e)}
                      className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-2xs ${
                        isDarkMode
                          ? "bg-[#040906] hover:bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 hover:border-[#00FF41]"
                          : activeHolidaySeason === "halloween"
                          ? "bg-white hover:bg-orange-50 text-orange-900 border-orange-200"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-white hover:bg-blue-50 text-blue-900 border-blue-200"
                          : activeHolidaySeason === "christmas"
                          ? "bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200"
                          : activeHolidaySeason === "new_year"
                          ? "bg-white hover:bg-amber-50 text-amber-900 border-amber-200"
                          : "bg-white hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                      }`}
                    >
                      {copiedId === record.id ? (
                        <>
                          <Check
                            className={`w-3 h-3 ${
                              isDarkMode
                                ? "text-[#00FF41]"
                                : activeHolidaySeason === "halloween"
                                ? "text-orange-600"
                                : activeHolidaySeason === "christmas_eve"
                                ? "text-blue-600"
                                : activeHolidaySeason === "christmas"
                                ? "text-emerald-600"
                                : activeHolidaySeason === "new_year"
                                ? "text-amber-600"
                                : "text-[#8AA66B]"
                            }`}
                          />
                          <span
                            className={`font-bold ${
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
                                : "text-[#8AA66B]"
                            }`}
                          >
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy
                            className={`w-3 h-3 ${
                              isDarkMode
                                ? "text-[#00FF41]"
                                : activeHolidaySeason === "halloween"
                                ? "text-orange-600"
                                : activeHolidaySeason === "christmas_eve"
                                ? "text-blue-600"
                                : activeHolidaySeason === "christmas"
                                ? "text-emerald-600"
                                : activeHolidaySeason === "new_year"
                                ? "text-amber-600"
                                : "text-[#8AA66B]"
                            }`}
                          />
                          <span>Subject</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Switch to Tech in Generator */}
                  {onSelectTechInGenerator && (
                    <button
                      type="button"
                      onClick={() => onSelectTechInGenerator(record.cleanTechName)}
                      className={`text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition transform hover:translate-x-0.5 ${
                        isDarkMode
                          ? "text-[#00FF41] hover:text-[#39FF14]"
                          : activeHolidaySeason === "halloween"
                          ? "text-orange-700 hover:text-orange-900"
                          : activeHolidaySeason === "christmas_eve"
                          ? "text-blue-700 hover:text-blue-900"
                          : activeHolidaySeason === "christmas"
                          ? "text-emerald-700 hover:text-emerald-900"
                          : activeHolidaySeason === "new_year"
                          ? "text-amber-700 hover:text-amber-900"
                          : "text-[#3F4A33] hover:text-[#8AA66B]"
                      }`}
                    >
                      <span>Switch to {record.cleanTechName} in Generator</span>
                      <ArrowRight
                        className={`w-3 h-3 ${
                          isDarkMode
                            ? "text-[#00FF41]"
                            : activeHolidaySeason === "halloween"
                            ? "text-orange-600"
                            : activeHolidaySeason === "christmas_eve"
                            ? "text-blue-600"
                            : activeHolidaySeason === "christmas"
                            ? "text-emerald-600"
                            : activeHolidaySeason === "new_year"
                            ? "text-amber-600"
                            : "text-[#8AA66B]"
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-Fidelity Stored Email Display Modal */}
      {viewingRecord && (
        <EmailViewerModal
          isOpen={Boolean(viewingRecord)}
          onClose={() => setViewingRecord(null)}
          record={viewingRecord}
          onLoadIntoGenerator={onLoadSavedEmailIntoGenerator}
        />
      )}

      {/* Clear Specific Work Weeks Modal */}
      <ClearWorkWeekModal
        isOpen={isClearWorkWeekModalOpen}
        onClose={() => setIsClearWorkWeekModalOpen(false)}
        history={history}
        selectedTechFilter={selectedTechFilter}
        onConfirmDelete={handleClearWorkWeeks}
      />
    </div>
  );
};
