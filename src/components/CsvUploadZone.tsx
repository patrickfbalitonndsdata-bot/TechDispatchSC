import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, Sparkles, Check, AlertTriangle, ArrowRight, RefreshCw, Layers, Trash2, X, FileText, CheckCircle2 } from "lucide-react";
import { ColumnMapping, ParseResult } from "../types";
import { SAMPLE_DATASETS, SampleDataset } from "../utils/sampleData";
import { useTheme } from "../context/ThemeContext";
import csvUploadIllustration from "../assets/images/csv_upload_illustration_1790174280758.jpg";

interface CsvUploadZoneProps {
  onFileUpload: (fileContent: string, fileName: string) => void;
  onLoadSample: (sample: SampleDataset) => void;
  parseResult: ParseResult | null;
  currentFileName: string;
  onOpenMappingModal: () => void;
  onClearFile?: () => void;
}

export const CsvUploadZone: React.FC<CsvUploadZoneProps> = ({
  onFileUpload,
  onLoadSample,
  parseResult,
  currentFileName,
  onOpenMappingModal,
  onClearFile,
}) => {
  const { isDarkMode, activeHolidaySeason } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset native file input if the current file name was cleared
  useEffect(() => {
    if (!currentFileName && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [currentFileName]);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        onFileUpload(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClearFile) {
      onClearFile();
    }
  };

  return (
    <div
      className={`rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden ${
        isDarkMode
          ? "bg-[#08150D]/90 border border-[#00FF41]/40 shadow-[0_0_20px_rgba(0,255,65,0.15)] backdrop-blur-md"
          : activeHolidaySeason === "halloween"
          ? "bg-white/95 border-2 border-orange-500/40 shadow-md shadow-orange-950/10 backdrop-blur-md"
          : activeHolidaySeason === "christmas_eve"
          ? "bg-white/95 border-2 border-blue-500/40 shadow-md shadow-blue-950/10 backdrop-blur-md"
          : activeHolidaySeason === "christmas"
          ? "bg-white/95 border-2 border-emerald-500/40 shadow-md shadow-emerald-950/10 backdrop-blur-md"
          : activeHolidaySeason === "new_year"
          ? "bg-white/95 border-2 border-amber-500/40 shadow-md shadow-amber-950/10 backdrop-blur-md"
          : "bg-[#FBF7F0] border-2 border-[#CFE0B8]"
      }`}
    >
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        accept=".csv,text/csv,text/plain"
        className="hidden"
      />

      {/* Main Dropzone Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-dashed ${
          isDragging
            ? isDarkMode
              ? "border-[#00FF41] bg-[#00FF41]/15 shadow-[0_0_30px_rgba(0,255,65,0.45)] ring-4 ring-[#00FF41]/30"
              : activeHolidaySeason === "halloween"
              ? "border-orange-500 bg-orange-100/70 shadow-lg ring-4 ring-orange-500/30"
              : activeHolidaySeason === "christmas_eve"
              ? "border-amber-400 bg-blue-100/70 shadow-lg ring-4 ring-amber-400/30"
              : activeHolidaySeason === "christmas"
              ? "border-red-500 bg-emerald-100/70 shadow-lg ring-4 ring-red-500/30"
              : activeHolidaySeason === "new_year"
              ? "border-amber-500 bg-amber-100/70 shadow-lg ring-4 ring-amber-400/30"
              : "border-[#8AA66B] bg-[#EDF3E3] shadow-md ring-4 ring-[#8AA66B]/20"
            : currentFileName
            ? isDarkMode
              ? "border-[#00FF41]/50 bg-[#0C1E12]/80 hover:border-[#00FF41] hover:bg-[#0C1E12]"
              : activeHolidaySeason === "halloween"
              ? "border-orange-400/70 bg-orange-50/60 hover:border-orange-500 hover:bg-orange-50/90"
              : activeHolidaySeason === "christmas_eve"
              ? "border-blue-400/70 bg-blue-50/60 hover:border-amber-400 hover:bg-blue-50/90"
              : activeHolidaySeason === "christmas"
              ? "border-emerald-400/70 bg-emerald-50/60 hover:border-red-500 hover:bg-emerald-50/90"
              : activeHolidaySeason === "new_year"
              ? "border-amber-400/70 bg-amber-50/60 hover:border-amber-500 hover:bg-amber-50/90"
              : "border-[#8AA66B]/60 bg-[#EDF3E3]/40 hover:border-[#8AA66B] hover:bg-[#EDF3E3]/70"
            : isDarkMode
            ? "border-[#00FF41]/40 bg-[#040906]/85 hover:border-[#00FF41] hover:shadow-[0_0_18px_rgba(0,255,65,0.25)] matrix-dropzone"
            : activeHolidaySeason === "halloween"
            ? "border-orange-400/70 bg-white/95 hover:border-orange-500 hover:shadow-md hover:bg-orange-50/30"
            : activeHolidaySeason === "christmas_eve"
            ? "border-amber-400/70 bg-white/95 hover:border-blue-500 hover:shadow-md hover:bg-blue-50/30"
            : activeHolidaySeason === "christmas"
            ? "border-red-400/70 bg-white/95 hover:border-red-500 hover:shadow-md hover:bg-emerald-50/30"
            : activeHolidaySeason === "new_year"
            ? "border-amber-400/70 bg-white/95 hover:border-amber-500 hover:shadow-md hover:bg-amber-50/30"
            : "border-[#8AA66B]/70 bg-white hover:border-[#3F4A33] hover:shadow-xs"
        }`}
      >
        {!currentFileName ? (
          /* Empty State: Unmistakable graphical upload station */
          <div className="p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: 3D Illustration & Headline */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Graphical Upload Illustration Thumbnail */}
              <div className="relative group shrink-0">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 shadow-md p-1 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1 ${
                    isDarkMode
                      ? "border-[#00FF41]/50 bg-[#0C1E12] shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                      : activeHolidaySeason === "halloween"
                      ? "border-orange-300 bg-orange-100/70 shadow-orange-950/15"
                      : activeHolidaySeason === "christmas_eve"
                      ? "border-blue-300 bg-blue-100/70 shadow-blue-950/15"
                      : activeHolidaySeason === "christmas"
                      ? "border-emerald-300 bg-emerald-100/70 shadow-emerald-950/15"
                      : activeHolidaySeason === "new_year"
                      ? "border-amber-300 bg-amber-100/70 shadow-amber-950/15"
                      : "border-[#CFE0B8] bg-[#EDF3E3]"
                  }`}
                >
                  <img
                    src={csvUploadIllustration}
                    alt="Upload Technician Dispatch CSV"
                    className={`w-full h-full object-cover rounded-xl ${
                      isDarkMode ? "filter saturate-150 brightness-95" : ""
                    }`}
                  />
                </div>
                {/* Floating Upload Icon Badge */}
                <div
                  className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                    isDarkMode
                      ? "bg-[#00FF41] border-[#040906] text-[#040906] shadow-[0_0_12px_#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-600 border-white text-white shadow-orange-600/30"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-blue-600 border-white text-white shadow-blue-600/30"
                      : activeHolidaySeason === "christmas"
                      ? "bg-red-600 border-white text-white shadow-red-600/30"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-600 border-white text-white shadow-amber-600/30"
                      : "bg-[#3F4A33] border-white text-[#CFE0B8]"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                </div>
              </div>

              {/* Text & Guidance */}
              <div className="space-y-1.5">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isDarkMode
                      ? "bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-500/15 border border-orange-500/40 text-orange-800"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-amber-500/15 border border-amber-500/40 text-blue-900"
                      : activeHolidaySeason === "christmas"
                      ? "bg-red-500/15 border border-red-500/40 text-red-800"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-500/15 border border-amber-500/40 text-amber-900"
                      : "bg-[#8AA66B]/20 border border-[#8AA66B]/40 text-[#3F4A33]"
                  }`}
                >
                  <UploadCloud
                    className={`w-3 h-3 ${
                      isDarkMode
                        ? "text-[#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "text-orange-600"
                        : activeHolidaySeason === "christmas_eve"
                        ? "text-blue-600"
                        : activeHolidaySeason === "christmas"
                        ? "text-red-600"
                        : activeHolidaySeason === "new_year"
                        ? "text-amber-600"
                        : "text-[#8AA66B]"
                    }`}
                  />
                  <span>STEP 1 • CSV DISPATCH INGESTION</span>
                </div>
                <h3
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    isDarkMode
                      ? "text-[#E0FFE5]"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-900 font-extrabold"
                      : "text-[#3F4A33]"
                  }`}
                >
                  Upload Technician Dispatch CSV Schedule
                </h3>
                <p
                  className={`text-xs max-w-lg leading-relaxed ${
                    isDarkMode
                      ? "text-[#D2FAD7]"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-700"
                      : "text-[#3F4A33]/75"
                  }`}
                >
                  Drag &amp; drop your{" "}
                  <span
                    className={`font-bold ${
                      isDarkMode
                        ? "text-[#00FF41] font-mono"
                        : activeHolidaySeason === "halloween"
                        ? "text-orange-700"
                        : activeHolidaySeason === "christmas_eve"
                        ? "text-blue-700"
                        : activeHolidaySeason === "christmas"
                        ? "text-red-700"
                        : activeHolidaySeason === "new_year"
                        ? "text-amber-700"
                        : "text-[#3F4A33]"
                    }`}
                  >
                    .csv
                  </span>{" "}
                  file here, or click to browse. Automatically extracts technicians, project numbers, scheduled times, and work orders.
                </p>
                <div
                  className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-semibold ${
                    isDarkMode
                      ? "text-[#D2FAD7]/80"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-600"
                      : "text-[#3F4A33]/70"
                  }`}
                >
                  <span
                    className={`px-2 py-0.5 rounded-md border ${
                      isDarkMode
                        ? "bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41] font-mono"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-100 border-orange-300 text-orange-900"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-blue-100 border-blue-300 text-blue-900"
                        : activeHolidaySeason === "christmas"
                        ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-100 border-amber-300 text-amber-900"
                        : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                    }`}
                  >
                    .CSV Format
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md border ${
                      isDarkMode
                        ? "bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41] font-mono"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-100 border-orange-300 text-orange-900"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-blue-100 border-blue-300 text-blue-900"
                        : activeHolidaySeason === "christmas"
                        ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-100 border-amber-300 text-amber-900"
                        : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                    }`}
                  >
                    Airtable Export
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md border ${
                      isDarkMode
                        ? "bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41] font-mono"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-100 border-orange-300 text-orange-900"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-blue-100 border-blue-300 text-blue-900"
                        : activeHolidaySeason === "christmas"
                        ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-100 border-amber-300 text-amber-900"
                        : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                    }`}
                  >
                    Excel Schedule
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Browse Button & Quick Samples */}
            <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                type="button"
                className={`group w-full md:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs bg-transparent border-2 shadow-xs transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                  isDarkMode
                    ? "border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/20 hover:shadow-[0_0_18px_rgba(0,255,65,0.45)]"
                    : activeHolidaySeason === "halloween"
                    ? "border-orange-600 hover:border-orange-700 text-orange-700 hover:bg-orange-500/15"
                    : activeHolidaySeason === "christmas_eve"
                    ? "border-blue-600 hover:border-blue-700 text-blue-700 hover:bg-blue-500/15"
                    : activeHolidaySeason === "christmas"
                    ? "border-red-600 hover:border-red-700 text-red-700 hover:bg-red-500/15"
                    : activeHolidaySeason === "new_year"
                    ? "border-amber-600 hover:border-amber-700 text-amber-700 hover:bg-amber-500/15"
                    : "border-[#8AA66B] hover:border-[#3F4A33] text-[#3F4A33] hover:bg-[#8AA66B]/15"
                }`}
              >
                <UploadCloud
                  className={`w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600 group-hover:text-orange-700"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-blue-600 group-hover:text-blue-700"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600 group-hover:text-red-700"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600 group-hover:text-amber-700"
                      : "text-[#8AA66B] group-hover:text-[#3F4A33]"
                  }`}
                />
                <span className="tracking-wide">Select CSV File</span>
              </button>

              <div
                className={`text-[11px] flex items-center gap-1.5 ${
                  isDarkMode
                    ? "text-[#D2FAD7]/80"
                    : activeHolidaySeason !== "standard"
                    ? "text-stone-700"
                    : "text-[#3F4A33]/70"
                }`}
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-500"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-500"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-500"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-500"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span>Or load sample:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const sample = SAMPLE_DATASETS[0];
                    if (sample) onLoadSample(sample);
                  }}
                  className={`font-bold underline cursor-pointer transition-colors ${
                    isDarkMode
                      ? "text-[#00FF41] hover:text-[#E0FFE5]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-700 hover:text-orange-900"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-blue-700 hover:text-blue-900"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-700 hover:text-red-900"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-700 hover:text-amber-900"
                      : "text-[#3F4A33] hover:text-[#8AA66B]"
                  }`}
                >
                  3 Techs
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const sample = SAMPLE_DATASETS.find((s) => s.id === "dallas-cod") || SAMPLE_DATASETS[1];
                    if (sample) onLoadSample(sample);
                  }}
                  className={`font-bold underline cursor-pointer transition-colors ${
                    isDarkMode
                      ? "text-[#00FF41] hover:text-[#E0FFE5]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-700 hover:text-orange-900"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-blue-700 hover:text-blue-900"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-700 hover:text-red-900"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-700 hover:text-amber-900"
                      : "text-[#3F4A33] hover:text-[#8AA66B]"
                  }`}
                >
                  COD
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active File State: Clear confirmation with graphical thumbnail */
          <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Left: Graphical thumbnail + File statistics */}
            <div className="flex items-center space-x-4">
              <div className="relative shrink-0">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shadow-xs p-0.5 ${
                    isDarkMode
                      ? "border-[#00FF41] bg-[#0C1E12] shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                      : activeHolidaySeason === "halloween"
                      ? "border-orange-500 bg-white"
                      : activeHolidaySeason === "christmas_eve"
                      ? "border-blue-500 bg-white"
                      : activeHolidaySeason === "christmas"
                      ? "border-red-500 bg-white"
                      : activeHolidaySeason === "new_year"
                      ? "border-amber-500 bg-white"
                      : "border-[#8AA66B] bg-white"
                  }`}
                >
                  <img
                    src={csvUploadIllustration}
                    alt="Active CSV Schedule"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-xs ${
                    isDarkMode
                      ? "bg-[#00FF41] border-[#040906] text-[#040906]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-600 border-white text-white"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-blue-600 border-white text-white"
                      : activeHolidaySeason === "christmas"
                      ? "bg-red-600 border-white text-white"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-600 border-white text-white"
                      : "bg-[#8AA66B] border-white text-white"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm sm:text-base font-extrabold tracking-tight ${
                      isDarkMode
                        ? "text-[#E0FFE5]"
                        : activeHolidaySeason !== "standard"
                        ? "text-stone-900"
                        : "text-[#3F4A33]"
                    }`}
                  >
                    {currentFileName}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                      isDarkMode
                        ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 font-mono shadow-[0_0_8px_rgba(0,255,65,0.25)]"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-100 text-orange-800 border border-orange-300"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : activeHolidaySeason === "christmas"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-[#8AA66B]/25 text-[#3F4A33] border border-[#8AA66B]/50"
                    }`}
                  >
                    <CheckCircle2
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
                          : "text-[#3F4A33]"
                      }`}
                    />{" "}
                    Active Schedule
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    isDarkMode
                      ? "text-[#D2FAD7]"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-700"
                      : "text-[#3F4A33]/75"
                  }`}
                >
                  {parseResult && parseResult.orders.length > 0 ? (
                    <span className="font-semibold">
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
                        {parseResult.orders.length}
                      </strong>{" "}
                      work orders parsed across{" "}
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
                        {parseResult.technicians.length}
                      </strong>{" "}
                      technician roster
                      {parseResult.technicians.length === 1 ? "" : "s"}
                    </span>
                  ) : (
                    "Schedule file loaded and validated"
                  )}
                </p>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isDarkMode
                      ? "text-[#D2FAD7]/80"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-600"
                      : "text-[#3F4A33]/60"
                  }`}
                >
                  Click to replace or drop another CSV anytime.
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              {parseResult && parseResult.orders.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMappingModal();
                  }}
                  className={`group flex items-center space-x-1.5 text-xs font-bold bg-transparent px-3.5 py-2 rounded-xl border transition-all duration-300 shadow-2xs cursor-pointer transform hover:-translate-y-0.5 ${
                    isDarkMode
                      ? "border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/15 hover:border-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "border-orange-300 hover:border-orange-500 text-orange-800 hover:bg-orange-50"
                      : activeHolidaySeason === "christmas_eve"
                      ? "border-blue-300 hover:border-blue-500 text-blue-800 hover:bg-blue-50"
                      : activeHolidaySeason === "christmas"
                      ? "border-emerald-300 hover:border-emerald-500 text-emerald-800 hover:bg-emerald-50"
                      : activeHolidaySeason === "new_year"
                      ? "border-amber-300 hover:border-amber-500 text-amber-800 hover:bg-amber-50"
                      : "border-[#CFE0B8] hover:border-[#8AA66B] text-[#3F4A33] hover:bg-white"
                  }`}
                  title="Inspect or tweak CSV column field mappings"
                >
                  <Layers
                    className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300 ${
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
                  <span>Column Mapping ({Object.values(parseResult.mapping).filter(Boolean).length}/12)</span>
                </button>
              )}

              {onClearFile && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`group text-xs font-bold bg-transparent border border-transparent px-3 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5 ${
                    isDarkMode
                      ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 hover:border-rose-800"
                      : "text-stone-700 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                  }`}
                  title="Remove uploaded CSV and clear data"
                >
                  <Trash2 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                className={`group text-xs font-bold bg-transparent border-2 px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/20 hover:shadow-[0_0_15px_rgba(0,255,65,0.35)]"
                    : activeHolidaySeason === "halloween"
                    ? "border-orange-600 hover:border-orange-700 text-orange-700 hover:bg-orange-500/15"
                    : activeHolidaySeason === "christmas_eve"
                    ? "border-blue-600 hover:border-blue-700 text-blue-700 hover:bg-blue-500/15"
                    : activeHolidaySeason === "christmas"
                    ? "border-red-600 hover:border-red-700 text-red-700 hover:bg-red-500/15"
                    : activeHolidaySeason === "new_year"
                    ? "border-amber-600 hover:border-amber-700 text-amber-700 hover:bg-amber-500/15"
                    : "border-[#8AA66B] hover:border-[#3F4A33] text-[#3F4A33] hover:bg-[#8AA66B]/15"
                }`}
              >
                <UploadCloud
                  className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600 group-hover:text-orange-700"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-blue-600 group-hover:text-blue-700"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600 group-hover:text-red-700"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600 group-hover:text-amber-700"
                      : "text-[#8AA66B] group-hover:text-[#3F4A33]"
                  }`}
                />
                <span>Replace CSV</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Warnings & Suggestions Banner */}
      {parseResult && parseResult.orders.length > 0 && parseResult.warnings.length > 0 && (
        <div
          className={`mt-3 rounded-xl p-2.5 flex items-start space-x-2 text-xs border ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#E0FFE5]"
              : activeHolidaySeason === "halloween"
              ? "bg-amber-50 border-amber-300 text-stone-900"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-blue-50 border-blue-300 text-stone-900"
              : activeHolidaySeason === "christmas"
              ? "bg-emerald-50 border-emerald-300 text-stone-900"
              : activeHolidaySeason === "new_year"
              ? "bg-amber-50 border-amber-300 text-stone-900"
              : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
          }`}
        >
          <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isDarkMode ? "text-amber-400" : "text-amber-700"}`} />
          <div className="flex-1">
            <span
              className={`font-bold ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-800"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-800"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-800"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-800"
                  : "text-[#3F4A33]"
              }`}
            >
              Auto-Detection Note:
            </span>{" "}
            {parseResult.warnings[0]}
            {parseResult.warnings.length > 1 && (
              <span
                className={`ml-1 font-medium ${
                  isDarkMode
                    ? "text-[#D2FAD7]/80"
                    : activeHolidaySeason !== "standard"
                    ? "text-stone-700"
                    : "text-[#3F4A33]/70"
                }`}
              >
                (+{parseResult.warnings.length - 1} other auto-resolved fields)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
