import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Calendar,
  Trash2,
  AlertTriangle,
  Check,
  Search,
  CheckSquare,
  Square,
  Filter,
  Users,
  Mail,
} from "lucide-react";
import { GeneratedEmailRecord } from "../utils/generatedEmailStorage";
import { useTheme } from "../context/ThemeContext";

interface ClearWorkWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedEmailRecord[];
  selectedTechFilter: string;
  onConfirmDelete: (selectedWeeks: string[], techName?: string) => void;
}

interface WorkWeekSummary {
  workWeek: string;
  totalEmails: number;
  filteredEmails: number;
  technicians: string[];
  lastGenerated: string;
}

export const ClearWorkWeekModal: React.FC<ClearWorkWeekModalProps> = ({
  isOpen,
  onClose,
  history,
  selectedTechFilter,
  onConfirmDelete,
}) => {
  const { isDarkMode, activeHolidaySeason } = useTheme();
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"filtered" | "all">(
    selectedTechFilter !== "all" ? "filtered" : "all"
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync default scope filter whenever modal opens or active tech changes
  useEffect(() => {
    if (isOpen) {
      setSelectedWeeks([]);
      setSearchTerm("");
      setScopeFilter(selectedTechFilter !== "all" ? "filtered" : "all");
      setIsDeleting(false);
    }
  }, [isOpen, selectedTechFilter]);

  // Aggregate work weeks from history
  const workWeekSummaries = useMemo<WorkWeekSummary[]>(() => {
    const map = new Map<
      string,
      {
        total: number;
        filtered: number;
        techs: Set<string>;
        latestTimestamp: number;
        lastGeneratedFormatted: string;
      }
    >();

    for (const record of history) {
      const week = (record.workWeek || "Unspecified Work Week").trim();
      if (!map.has(week)) {
        map.set(week, {
          total: 0,
          filtered: 0,
          techs: new Set<string>(),
          latestTimestamp: 0,
          lastGeneratedFormatted: "",
        });
      }

      const item = map.get(week)!;
      item.total += 1;
      item.techs.add(record.cleanTechName || record.technicianName);

      if (
        selectedTechFilter === "all" ||
        record.cleanTechName.toLowerCase() === selectedTechFilter.toLowerCase()
      ) {
        item.filtered += 1;
      }

      const recTime = new Date(record.timestamp).getTime();
      if (recTime > item.latestTimestamp) {
        item.latestTimestamp = recTime;
        item.lastGeneratedFormatted = record.dateFormatted;
      }
    }

    const list: WorkWeekSummary[] = [];
    map.forEach((data, week) => {
      // If we are scoping by a specific technician and this week has 0 emails for them, we can still list it if in 'all' mode
      list.push({
        workWeek: week,
        totalEmails: data.total,
        filteredEmails: data.filtered,
        technicians: Array.from(data.techs).sort(),
        lastGenerated: data.lastGeneratedFormatted,
      });
    });

    // Sort by work week or recent
    return list.sort((a, b) => b.workWeek.localeCompare(a.workWeek));
  }, [history, selectedTechFilter]);

  // Filtered summaries according to search term and scope
  const filteredSummaries = useMemo(() => {
    return workWeekSummaries.filter((summary) => {
      if (scopeFilter === "filtered" && selectedTechFilter !== "all" && summary.filteredEmails === 0) {
        return false;
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        summary.workWeek.toLowerCase().includes(term) ||
        summary.technicians.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [workWeekSummaries, searchTerm, scopeFilter, selectedTechFilter]);

  // Calculate total affected emails
  const affectedEmailCount = useMemo(() => {
    const selectedSet = new Set(selectedWeeks);
    return history.filter((r) => {
      const week = (r.workWeek || "Unspecified Work Week").trim();
      if (!selectedSet.has(week)) return false;
      if (scopeFilter === "filtered" && selectedTechFilter !== "all") {
        return r.cleanTechName.toLowerCase() === selectedTechFilter.toLowerCase();
      }
      return true;
    }).length;
  }, [history, selectedWeeks, scopeFilter, selectedTechFilter]);

  if (!isOpen) return null;

  // Toggle one week
  const handleToggleWeek = (week: string) => {
    setSelectedWeeks((prev) =>
      prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
    );
  };

  // Select all visible
  const handleSelectAll = () => {
    const allVisible = filteredSummaries.map((s) => s.workWeek);
    const newSet = new Set([...selectedWeeks, ...allVisible]);
    setSelectedWeeks(Array.from(newSet));
  };

  // Deselect all visible
  const handleDeselectAll = () => {
    const visibleSet = new Set(filteredSummaries.map((s) => s.workWeek));
    setSelectedWeeks((prev) => prev.filter((w) => !visibleSet.has(w)));
  };

  const handleDelete = () => {
    if (selectedWeeks.length === 0) return;
    setIsDeleting(true);
    const techParam = scopeFilter === "filtered" && selectedTechFilter !== "all" ? selectedTechFilter : undefined;
    onConfirmDelete(selectedWeeks, techParam);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 border transition-colors ${
          isDarkMode
            ? "bg-[#08150D] border-[#00FF41]/40 shadow-[0_0_35px_rgba(0,255,65,0.2)] text-[#D2FAD7]"
            : activeHolidaySeason === "halloween"
            ? "bg-white border-2 border-orange-300 shadow-orange-950/20"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white border-2 border-blue-300 shadow-blue-950/20"
            : activeHolidaySeason === "christmas"
            ? "bg-white border-2 border-emerald-300 shadow-emerald-950/20"
            : activeHolidaySeason === "new_year"
            ? "bg-white border-2 border-amber-300 shadow-amber-950/20"
            : "bg-white border-zinc-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isDarkMode
              ? "bg-[#040906] border-[#00FF41]/30"
              : "bg-zinc-50/70 border-zinc-100"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDarkMode ? "bg-red-950/60 text-rose-400 border border-red-800/40" : "bg-red-100 text-red-600"
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`text-base font-bold ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>
                  Clear History by Work Week
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    isDarkMode
                      ? "bg-red-950/40 text-rose-300 border-red-800/50 font-mono"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  Bulk Deletion
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
                Select one or more specific work weeks to permanently delete from stored email history.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
              isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10"
                : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60"
            }`}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Technician Scope Selector (if technician filter is currently applied) */}
        {selectedTechFilter !== "all" && (
          <div
            className={`px-4 py-2.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
              isDarkMode
                ? "bg-[#06120A] border-[#00FF41]/30 text-[#D2FAD7]"
                : "bg-amber-50/80 border-amber-200/70 text-amber-900"
            }`}
          >
            <div className="flex items-center space-x-1.5 font-medium">
              <Filter className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-amber-600"}`} />
              <span>
                Active Filter: <strong className={isDarkMode ? "text-[#00FF41]" : ""}>{selectedTechFilter}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]" : "text-amber-800"}`}>Delete scope:</span>
              <div
                className={`inline-flex rounded-lg p-0.5 text-xs font-semibold border ${
                  isDarkMode ? "bg-[#040906] border-[#00FF41]/30" : "bg-amber-200/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setScopeFilter("filtered")}
                  className={`px-2 py-1 rounded-md transition ${
                    scopeFilter === "filtered"
                      ? isDarkMode
                        ? "bg-[#00FF41]/20 text-[#00FF41] shadow-2xs font-bold"
                        : "bg-white text-amber-950 shadow-2xs"
                      : isDarkMode
                      ? "text-[#D2FAD7] hover:text-[#00FF41]"
                      : "text-amber-800 hover:text-amber-950"
                  }`}
                >
                  {selectedTechFilter} Only
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter("all")}
                  className={`px-2 py-1 rounded-md transition ${
                    scopeFilter === "all"
                      ? isDarkMode
                        ? "bg-[#00FF41]/20 text-[#00FF41] shadow-2xs font-bold"
                        : "bg-white text-amber-950 shadow-2xs"
                      : isDarkMode
                      ? "text-[#D2FAD7] hover:text-[#00FF41]"
                      : "text-amber-800 hover:text-amber-950"
                  }`}
                >
                  All Technicians
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Selection Toolbar */}
        <div
          className={`p-3.5 border-b flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs ${
            isDarkMode
              ? "bg-[#040906] border-[#00FF41]/30"
              : "bg-white border-zinc-100"
          }`}
        >
          <div className="relative w-full sm:w-64">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-[#00FF41]" : "text-zinc-400"}`} />
            <input
              type="text"
              placeholder="Search work weeks or tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8.5 pr-3 py-1.5 rounded-lg text-xs focus:outline-hidden border ${
                isDarkMode
                  ? "bg-[#08150D] border-[#00FF41]/40 text-[#00FF41] placeholder:text-[#D2FAD7]/50 focus:ring-2 focus:ring-[#00FF41]"
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900"
              }`}
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={filteredSummaries.length === 0}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition disabled:opacity-40 cursor-pointer border ${
                isDarkMode
                  ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 hover:bg-[#00FF41]/25"
                  : "text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border-transparent"
              }`}
            >
              Select All ({filteredSummaries.length})
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              disabled={selectedWeeks.length === 0}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition disabled:opacity-40 cursor-pointer ${
                isDarkMode
                  ? "text-[#D2FAD7] hover:text-[#00FF41]"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Work Week Checklist Content */}
        <div className={`p-3 sm:p-4 overflow-y-auto flex-1 divide-y ${isDarkMode ? "divide-[#00FF41]/10" : "divide-zinc-100"}`}>
          {filteredSummaries.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Calendar className={`w-8 h-8 mx-auto ${isDarkMode ? "text-[#00FF41]/40" : "text-zinc-300"}`} />
              <p className={`text-xs font-medium ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-600"}`}>
                No matching work weeks found.
              </p>
              <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-400"}`}>
                Try adjusting your search query or technician filter.
              </p>
            </div>
          ) : (
            filteredSummaries.map((summary) => {
              const isSelected = selectedWeeks.includes(summary.workWeek);
              const emailCount =
                scopeFilter === "filtered" && selectedTechFilter !== "all"
                  ? summary.filteredEmails
                  : summary.totalEmails;

              return (
                <div
                  key={summary.workWeek}
                  onClick={() => handleToggleWeek(summary.workWeek)}
                  className={`py-3 px-3 rounded-xl transition flex items-start space-x-3 cursor-pointer select-none my-1 border ${
                    isSelected
                      ? isDarkMode
                        ? "bg-red-950/30 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                        : "bg-red-50/80 border-red-200/80"
                      : isDarkMode
                      ? "hover:bg-[#00FF41]/5 border-transparent"
                      : "hover:bg-zinc-50 border-transparent"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isSelected
                          ? "bg-red-600 border-red-600 text-white"
                          : isDarkMode
                          ? "border-[#00FF41]/40 bg-[#040906]"
                          : "border-zinc-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isSelected
                            ? isDarkMode ? "text-rose-300" : "text-red-950"
                            : isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"
                        }`}
                      >
                        {summary.workWeek}
                      </h4>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                          isSelected
                            ? isDarkMode
                              ? "bg-red-900/50 text-rose-200 border-red-700/60 font-mono"
                              : "bg-red-200/80 text-red-900 font-extrabold"
                            : isDarkMode
                            ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/30 font-mono"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {emailCount} email{emailCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-500"}`}>
                      <div className="flex items-center space-x-1 truncate max-w-xs">
                        <Users className={`w-3 h-3 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-zinc-400"}`} />
                        <span className="truncate">
                          {summary.technicians.slice(0, 3).join(", ")}
                          {summary.technicians.length > 3
                            ? ` +${summary.technicians.length - 3} more`
                            : ""}
                        </span>
                      </div>
                      {summary.lastGenerated && (
                        <div className={`flex items-center space-x-1 ${isDarkMode ? "text-[#D2FAD7]/80 font-mono" : "text-zinc-400"}`}>
                          <span>Latest: {summary.lastGenerated}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Warning / Summary Banner */}
        {selectedWeeks.length > 0 && (
          <div
            className={`px-4 py-2.5 border-t flex items-center space-x-2 text-xs ${
              isDarkMode
                ? "bg-red-950/40 border-red-800/40 text-rose-300"
                : "bg-red-50 border-red-100 text-red-800"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="flex-1 font-medium">
              You have selected <strong>{selectedWeeks.length} work week{selectedWeeks.length !== 1 ? "s" : ""}</strong> containing{" "}
              <strong>{affectedEmailCount} email record{affectedEmailCount !== 1 ? "s" : ""}</strong> to permanently delete.
            </span>
          </div>
        )}

        {/* Modal Footer */}
        <div
          className={`p-3.5 sm:p-4 border-t flex items-center justify-between gap-3 ${
            isDarkMode
              ? "bg-[#040906] border-[#00FF41]/30"
              : "bg-zinc-50/70 border-zinc-100"
          }`}
        >
          <div className={`text-xs font-medium ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
            {selectedWeeks.length} of {workWeekSummaries.length} selected
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.75 text-xs font-semibold rounded-lg transition cursor-pointer shadow-2xs border ${
                isDarkMode
                  ? "text-[#D2FAD7] hover:text-[#00FF41] border-[#00FF41]/30 bg-[#08150D] hover:bg-[#00FF41]/10"
                  : "text-zinc-700 hover:text-zinc-900 bg-white border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={selectedWeeks.length === 0 || isDeleting}
              className="flex items-center space-x-1.5 px-4 py-1.75 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 rounded-lg transition shadow-xs cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                Delete Selected ({selectedWeeks.length})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
