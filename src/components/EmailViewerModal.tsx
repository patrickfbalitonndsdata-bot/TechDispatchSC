import React, { useState, useMemo } from "react";
import {
  X,
  Mail,
  Copy,
  Check,
  Download,
  ExternalLink,
  Calendar,
  User,
  Monitor,
  Smartphone,
  RotateCcw,
  Sparkles,
  ArrowLeftRight,
  Paperclip,
} from "lucide-react";
import { GeneratedEmailRecord } from "../utils/generatedEmailStorage";
import { copyRichHtmlToClipboard, cleanTechnicianName } from "../utils/outlookTemplateGenerator";
import { useTheme } from "../context/ThemeContext";

interface EmailViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: GeneratedEmailRecord | null;
  onLoadIntoGenerator?: (record: GeneratedEmailRecord) => void;
}

export const EmailViewerModal: React.FC<EmailViewerModalProps> = ({
  isOpen,
  onClose,
  record,
  onLoadIntoGenerator,
}) => {
  const { isDarkMode, activeHolidaySeason } = useTheme();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);

  const previewHtml = useMemo(() => {
    if (!record?.htmlContent) return "";
    const match = record.htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match ? match[1] : record.htmlContent;
  }, [record?.htmlContent]);

  if (!isOpen || !record) return null;

  const handleCopyHtml = async () => {
    if (!record.htmlContent) return;
    const success = await copyRichHtmlToClipboard(record.htmlContent, record.plainTextContent || "");
    if (success) {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(record.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleDownloadAttachment = (att: { name: string; base64Data: string; type?: string }) => {
    try {
      const byteCharacters = atob(att.base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: att.type || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download attachment", e);
    }
  };

  const handleDownloadEml = () => {
    if (!record.htmlContent) return;
    const activeAttachments = record.attachments || record.brandingConfig?.attachments || [];
    let emlContent: string;

    if (activeAttachments.length > 0) {
      const mixedBoundary = `----=_MixedPart_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      const altBoundary = `----=_AltPart_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      const lines: string[] = [
        `From: "NDS Dispatch Scheduling" <dispatch@ndsdata.com>`,
        `To: "${cleanTechnicianName(record.cleanTechName)}" <technician@ndsdata.com>`,
        `Subject: ${record.subject}`,
        `MIME-Version: 1.0`,
        `X-Unsent: 1`,
        `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
        ``,
        `--${mixedBoundary}`,
        `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
        ``,
        `--${altBoundary}`,
        `Content-Type: text/plain; charset=UTF-8`,
        `Content-Transfer-Encoding: 7bit`,
        ``,
        record.plainTextContent || "NDS Technician Schedule",
        ``,
        `--${altBoundary}`,
        `Content-Type: text/html; charset=UTF-8`,
        `Content-Transfer-Encoding: 7bit`,
        ``,
        record.htmlContent,
        ``,
        `--${altBoundary}--`,
      ];

      for (const att of activeAttachments) {
        if (!att.base64Data) continue;
        const contentType = att.type || "application/octet-stream";
        const filename = att.name || "attachment";
        const formattedBase64 = att.base64Data.match(/.{1,76}/g)?.join("\r\n") || att.base64Data;
        lines.push(
          `--${mixedBoundary}`,
          `Content-Type: ${contentType}; name="${filename}"`,
          `Content-Disposition: attachment; filename="${filename}"`,
          `Content-Transfer-Encoding: base64`,
          ``,
          formattedBase64
        );
      }

      lines.push(`--${mixedBoundary}--`);
      emlContent = lines.join("\r\n");
    } else {
      const boundary = "----=_NextPart_" + Date.now().toString(16);
      emlContent = [
        `From: "NDS Dispatch Scheduling" <dispatch@ndsdata.com>`,
        `To: "${cleanTechnicianName(record.cleanTechName)}" <technician@ndsdata.com>`,
        `Subject: ${record.subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        `X-Unsent: 1`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=UTF-8`,
        `Content-Transfer-Encoding: 7bit`,
        ``,
        record.plainTextContent || "NDS Technician Schedule",
        ``,
        `--${boundary}`,
        `Content-Type: text/html; charset=UTF-8`,
        `Content-Transfer-Encoding: 7bit`,
        ``,
        record.htmlContent,
        ``,
        `--${boundary}--`,
      ].join("\r\n");
    }

    const blob = new Blob([emlContent], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = record.cleanTechName.replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `Saved_${safeName}_${String(record.version).replace(/\s+/g, "_")}.eml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border overflow-hidden transition-colors ${
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
            : "bg-white border-[#CFE0B8]"
        }`}
      >
        {/* Modal Top Header */}
        <div
          className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
            isDarkMode
              ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/30"
              : activeHolidaySeason === "halloween"
              ? "bg-[#2A130A] text-white border-orange-400/40"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-[#0F1E36] text-white border-amber-300/40"
              : activeHolidaySeason === "christmas"
              ? "bg-[#143E23] text-white border-red-400/40"
              : activeHolidaySeason === "new_year"
              ? "bg-[#1E1B4B] text-white border-yellow-300/40"
              : "bg-[#3F4A33] text-white border-transparent"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                isDarkMode
                  ? "bg-[#00FF41] text-black font-extrabold"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-600 text-white"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-600 text-white"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-600 text-white"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-600 text-white"
                  : "bg-[#8AA66B] text-white"
              }`}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className={`text-sm font-bold ${isDarkMode ? "text-[#E0FFE5]" : "text-white"}`}>
                  Stored Email Display Viewer
                </h2>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    isDarkMode
                      ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-900/60 text-orange-200 border-orange-400"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-blue-900/60 text-blue-200 border-amber-300"
                      : activeHolidaySeason === "christmas"
                      ? "bg-emerald-900/60 text-emerald-200 border-emerald-400"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-900/60 text-amber-200 border-yellow-300"
                      : String(record.version).toLowerCase().includes("update") ||
                        (String(record.version).toLowerCase().includes("v") && !String(record.version).toLowerCase().includes("v0"))
                      ? "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                      : "bg-[#CFE0B8] text-[#3F4A33]"
                  }`}
                >
                  {record.version}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isDarkMode
                      ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 font-mono"
                      : "bg-white/15 text-[#EDF3E3] border-white/20"
                  }`}
                >
                  {record.exportMethod}
                </span>
              </div>
              <p
                className={`text-xs flex items-center space-x-2 mt-0.5 ${
                  isDarkMode ? "text-[#D2FAD7]" : "text-[#CFE0B8]"
                }`}
              >
                <span>{cleanTechnicianName(record.cleanTechName)}</span>
                <span>•</span>
                <span>{record.workWeek}</span>
                <span>•</span>
                <span className={`font-mono ${isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]/80"}`}>
                  {record.dateFormatted}
                </span>
              </p>
            </div>
          </div>

          {/* Top Controls: View mode switcher & Close button */}
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-1 p-1 rounded-xl border ${
                isDarkMode ? "bg-[#020503] border-[#00FF41]/30" : "bg-black/20 border-white/10"
              }`}
            >
              <button
                onClick={() => setViewMode("desktop")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === "desktop"
                    ? isDarkMode
                      ? "bg-[#00FF41] text-black font-bold shadow-[0_0_8px_#00FF41]"
                      : "bg-[#8AA66B] text-white shadow-xs"
                    : isDarkMode
                    ? "text-[#D2FAD7] hover:text-[#00FF41]"
                    : "text-[#CFE0B8] hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === "mobile"
                    ? isDarkMode
                      ? "bg-[#00FF41] text-black font-bold shadow-[0_0_8px_#00FF41]"
                      : "bg-[#8AA66B] text-white shadow-xs"
                    : isDarkMode
                    ? "text-[#D2FAD7] hover:text-[#00FF41]"
                    : "text-[#CFE0B8] hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDarkMode ? "text-[#00FF41] hover:bg-[#00FF41]/20" : "text-[#CFE0B8] hover:text-white hover:bg-white/10"
              }`}
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subject Header Bar */}
        <div
          className={`px-6 py-2.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
            isDarkMode
              ? "bg-[#06120A] border-[#00FF41]/30 text-[#D2FAD7]"
              : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className={`font-bold shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]/70"}`}>Subject:</span>
            <span className={`font-bold select-all truncate ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>{record.subject}</span>
          </div>
          <button
            onClick={handleCopySubject}
            className={`flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-xl transition shrink-0 cursor-pointer shadow-2xs border ${
              isDarkMode
                ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/25"
                : "bg-white text-[#3F4A33] hover:bg-[#EDF3E3] border-[#CFE0B8]"
            }`}
          >
            {copiedSubject ? (
              <>
                <Check className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                <span className={isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}>Copied Subject</span>
              </>
            ) : (
              <>
                <Copy className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                <span>Copy Subject</span>
              </>
            )}
          </button>
        </div>

        {/* Stored Custom Notes / Details if present */}
        {record.notes && (
          <div
            className={`px-6 py-2 border-b text-xs flex items-center space-x-2 ${
              isDarkMode
                ? "bg-[#0a180f] border-[#00FF41]/30 text-[#D2FAD7]"
                : "bg-yellow-50/80 border-yellow-200 text-yellow-950"
            }`}
          >
            <span className={`font-bold shrink-0 ${isDarkMode ? "text-[#00FF41]" : ""}`}>Update Note Recorded:</span>
            <span className="italic">{record.notes}</span>
          </div>
        )}

        {/* Stored Attachments Bar if present */}
        {((record.attachments && record.attachments.length > 0) || (record.brandingConfig?.attachments && record.brandingConfig.attachments.length > 0)) && (
          <div
            className={`px-6 py-2 border-b text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              isDarkMode
                ? "bg-[#06120A] border-[#00FF41]/30 text-[#D2FAD7]"
                : "bg-blue-50/90 border-blue-200 text-blue-950"
            }`}
          >
            <div className="flex items-center space-x-2 flex-wrap">
              <span className={`font-bold flex items-center space-x-1 ${isDarkMode ? "text-[#00FF41]" : "text-blue-900"}`}>
                <Paperclip className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-blue-700"}`} />
                <span>
                  Saved Attachments (
                  {(record.attachments || record.brandingConfig?.attachments || []).length}
                  ):
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(record.attachments || record.brandingConfig?.attachments || []).map((att) => (
                  <span
                    key={att.id}
                    className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-medium shadow-2xs border ${
                      isDarkMode
                        ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/40"
                        : "bg-white text-zinc-900 border-blue-200"
                    }`}
                  >
                    <span className="truncate max-w-[160px]">{att.name}</span>
                    {att.base64Data && (
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(att)}
                        className={`p-0.5 rounded transition cursor-pointer ${
                          isDarkMode ? "text-[#00FF41] hover:bg-[#00FF41]/20" : "text-blue-600 hover:text-blue-900 hover:bg-blue-100"
                        }`}
                        title={`Download ${att.name}`}
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <span className={`text-[11px] italic shrink-0 ${isDarkMode ? "text-[#00FF41]/70" : "text-blue-700"}`}>
              Preserved with this version
            </span>
          </div>
        )}

        {/* Rendered Email Body Area */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center ${
            isDarkMode ? "bg-[#030805]" : "bg-zinc-100"
          }`}
        >
          <div
            className={`rounded-xl shadow-xs transition-all duration-200 overflow-hidden w-full ${
              viewMode === "mobile" ? "max-w-[420px] p-4" : "max-w-4xl p-6"
            } ${
              isDarkMode
                ? "bg-white text-zinc-900 border border-[#00FF41]/30 shadow-[0_0_20px_rgba(0,255,65,0.1)]"
                : "bg-white text-zinc-900"
            }`}
          >
            {record.htmlContent ? (
              <div
                className="outlook-saved-preview prose max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="p-8 text-center text-zinc-500 space-y-2">
                <Mail className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="font-semibold text-sm">HTML content was not stored for this record</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Subject: {record.subject}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div
          className={`px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDarkMode
              ? "bg-[#040906] border-[#00FF41]/30"
              : activeHolidaySeason === "halloween"
              ? "bg-[#251208] border-orange-400/30 text-white"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-[#0c182b] border-amber-300/30 text-white"
              : activeHolidaySeason === "christmas"
              ? "bg-[#0e2c19] border-red-400/30 text-white"
              : activeHolidaySeason === "new_year"
              ? "bg-[#18153b] border-yellow-300/30 text-white"
              : "bg-[#FBF7F0] border-[#CFE0B8]"
          }`}
        >
          <div>
            {onLoadIntoGenerator && (
              <button
                onClick={() => {
                  onLoadIntoGenerator(record);
                  onClose();
                }}
                className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs border ${
                  isDarkMode
                    ? "bg-[#00FF41]/10 text-[#00FF41] hover:bg-[#00FF41]/25 border-[#00FF41]/40"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-100 hover:bg-orange-200 text-orange-950 border-orange-300"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-blue-100 hover:bg-blue-200 text-blue-950 border-blue-300"
                    : activeHolidaySeason === "christmas"
                    ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-300"
                    : activeHolidaySeason === "new_year"
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"
                    : "text-[#3F4A33] bg-[#EDF3E3] hover:bg-[#CFE0B8] border-[#CFE0B8]"
                }`}
                title="Load this technician's notes and configuration into the active generator"
              >
                <ArrowLeftRight className={`w-3.5 h-3.5 ${
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
                }`} />
                <span>Load in Generator</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy HTML */}
            <button
              onClick={handleCopyHtml}
              className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border shadow-xs transition cursor-pointer ${
                isDarkMode
                  ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 hover:bg-[#00FF41]/30"
                  : activeHolidaySeason !== "standard"
                  ? "bg-white/15 hover:bg-white/25 text-white border-white/30"
                  : "bg-white hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              {copiedHtml ? (
                <>
                  <Check className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-400"}`} />
                  <span className={isDarkMode ? "text-[#00FF41]" : "text-emerald-300"}>Copied for Outlook!</span>
                </>
              ) : (
                <>
                  <Copy className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-white"}`} />
                  <span>Copy Styled HTML</span>
                </>
              )}
            </button>

            {/* Download EML */}
            <button
              onClick={handleDownloadEml}
              className={`flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer border ${
                isDarkMode
                  ? "bg-[#00FF41] text-black font-extrabold border-[#00FF41] hover:bg-[#00FF41]/90 shadow-[0_0_15px_#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-600 hover:bg-orange-500 text-white border-orange-500"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-500"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-500"
                  : "bg-[#8AA66B] hover:bg-[#7a965c] text-white border-[#8AA66B]"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.EML)</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition cursor-pointer ${
                isDarkMode
                  ? "text-[#D2FAD7] hover:text-[#00FF41] border-[#00FF41]/30 hover:bg-[#00FF41]/10"
                  : activeHolidaySeason !== "standard"
                  ? "text-white/80 hover:text-white border-white/20 hover:bg-white/10"
                  : "text-[#3F4A33] hover:bg-[#EDF3E3] border-[#CFE0B8]"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
