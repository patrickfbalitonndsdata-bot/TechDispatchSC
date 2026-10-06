import React, { useState } from "react";
import { X, History, Search, Download, Trash2, CheckCircle2, AlertCircle, Eye, FileSpreadsheet } from "lucide-react";
import { DispatchLogRecord } from "../types";
import { useTheme } from "../context/ThemeContext";

interface DispatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: DispatchLogRecord[];
  onClearLogs: () => void;
}

export const DispatchHistoryModal: React.FC<DispatchHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const { isDarkMode, activeHolidaySeason } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.technicianEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.previewSubject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "Technician", "Email", "Date", "Stops", "Status", "Method", "Subject", "Notes"];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.technicianName}"`,
      `"${l.technicianEmail}"`,
      `"${l.date}"`,
      l.jobCount,
      `"${l.status}"`,
      `"${l.method}"`,
      `"${l.previewSubject.replace(/"/g, '""')}"`,
      `"${l.notes || ""}"`,
    ]);

    const csvText = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Dispatch_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
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
              : "bg-[#3F4A33] border-[#CFE0B8]/30 text-white"
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs ${
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
                  : "bg-[#8AA66B]/30 border-[#CFE0B8]/30 text-[#EDF3E3]"
              }`}
            >
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Dispatch History &amp; Audit Logs</h2>
              <p className={`text-xs ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/80"}`}>
                Track and verify all automated and manual Outlook schedule distributions
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

        {/* Toolbar & Filters */}
        <div
          className={`p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/25 text-[#D2FAD7]"
              : activeHolidaySeason === "halloween"
              ? "bg-orange-50/50 border-orange-200 text-orange-950"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-blue-50/50 border-blue-200 text-blue-950"
              : activeHolidaySeason === "christmas"
              ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
              : activeHolidaySeason === "new_year"
              ? "bg-amber-50/50 border-amber-200 text-amber-950"
              : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
          }`}
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
              <input
                type="text"
                placeholder="Search technician, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-hidden focus:ring-2 border ${
                  isDarkMode
                    ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41] placeholder:text-[#D2FAD7]/40"
                    : "bg-white border-[#CFE0B8] text-zinc-800 focus:ring-[#8AA66B]"
                }`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-2 border ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                  : "bg-white border-[#CFE0B8] text-[#3F4A33] focus:ring-[#8AA66B]"
              }`}
            >
              <option value="all" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>All Statuses</option>
              <option value="delivered" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>Delivered</option>
              <option value="exported" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>Exported</option>
              <option value="failed" className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCsv}
              disabled={logs.length === 0}
              className={`flex items-center space-x-1.5 font-bold px-3.5 py-1.5 rounded-xl border transition disabled:opacity-50 cursor-pointer shadow-xs ${
                isDarkMode
                  ? "bg-[#08150D] hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : "bg-white hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              <Download className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className={`flex items-center space-x-1.5 font-bold px-3.5 py-1.5 rounded-xl border transition disabled:opacity-50 cursor-pointer shadow-xs ${
                isDarkMode
                  ? "text-rose-400 bg-rose-950/30 hover:bg-rose-950/50 border-rose-800/60"
                  : "text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? "bg-[#08150D]" : "bg-[#FBF7F0]/30"}`}>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <History className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? "text-[#00FF41]/40" : "text-[#8AA66B]/50"}`} />
              <p className={`text-xs font-bold ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>No dispatch records found</p>
              <p className={`text-[11px] mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/60" : "text-zinc-400"}`}>
                Run a daily distribution or export an Outlook template to log actions.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b uppercase text-[10px] tracking-wider font-bold ${
                  isDarkMode ? "border-[#00FF41]/25 text-[#00FF41]" : "border-[#CFE0B8] text-[#3F4A33]"
                }`}>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Technician</th>
                  <th className="pb-2">Recipient Email</th>
                  <th className="pb-2">Stops</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Notes</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-[#00FF41]/15" : "divide-[#CFE0B8]/40"}`}>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition ${isDarkMode ? "hover:bg-[#00FF41]/10" : "hover:bg-[#EDF3E3]/40"}`}
                  >
                    <td className={`py-2.5 font-mono text-[11px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className={`py-2.5 font-bold ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>{log.technicianName}</td>
                    <td className={`py-2.5 font-mono ${isDarkMode ? "text-[#D2FAD7]/90" : "text-zinc-600"}`}>{log.technicianEmail}</td>
                    <td className={`py-2.5 font-semibold ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>{log.jobCount} stops</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                          isDarkMode
                            ? "bg-[#0C1E12] text-[#00FF41] border-[#00FF41]/40 font-mono"
                            : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.status === "Delivered"
                            ? isDarkMode
                              ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/60 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                              : "bg-[#EDF3E3] text-[#3F4A33] border-[#8AA66B]"
                            : log.status === "Exported"
                            ? isDarkMode
                              ? "bg-[#0C1E12] text-[#E0FFE5] border-[#00FF41]/35 font-mono"
                              : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                            : "bg-red-950/40 text-rose-400 border-rose-800"
                        }`}
                      >
                        {log.status === "Delivered" && <CheckCircle2 className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />}
                        {log.status}
                      </span>
                    </td>
                    <td className={`py-2.5 text-right text-[11px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>{log.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs font-semibold ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/25 text-[#D2FAD7]"
              : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
          }`}
        >
          <span>Total records: <strong className={isDarkMode ? "text-[#00FF41]" : ""}>{filteredLogs.length}</strong></span>
          <button
            onClick={onClose}
            className={`font-bold px-4 py-1.5 rounded-xl border shadow-xs transition cursor-pointer ${
              isDarkMode
                ? "bg-[#08150D] text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10 border-[#00FF41]/40"
                : "bg-white text-[#3F4A33] hover:text-black border-[#CFE0B8] hover:bg-[#EDF3E3]"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
