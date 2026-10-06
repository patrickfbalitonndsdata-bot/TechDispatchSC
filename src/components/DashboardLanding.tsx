import React from "react";
import {
  Mail,
  Calendar,
  Users,
  History,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Code2,
  Layers,
  Clock,
  FileSpreadsheet,
  Zap,
  Check,
  Send,
  FileText,
  Sliders,
  ChevronRight,
  MapPin,
  Camera,
  FolderGit2,
} from "lucide-react";
import { SampleDataset, SAMPLE_DATASETS } from "../utils/sampleData";
import { useTheme } from "../context/ThemeContext";
import dispatchHeroBgImg from "../assets/images/dispatch_hero_bg_1790173722242.jpg";
import matrixBackdropImg from "../assets/images/green_matrix_backdrop_1790711247799.jpg";
import workflowBannerImg from "../assets/images/operations_workflow_banner_1790098420684.jpg";
import dispatchSealImg from "../assets/images/dispatch_seal_1790100099915.jpg";

interface DashboardLandingProps {
  onGoToGenerator: () => void;
  onGoToHistory: () => void;
  onLoadSample: (sample: SampleDataset) => void;
  totalOrdersCount: number;
  techniciansCount: number;
  savedEmailsCount: number;
  currentFileName?: string;
}

export const DashboardLanding: React.FC<DashboardLandingProps> = ({
  onGoToGenerator,
  onGoToHistory,
  onLoadSample,
  totalOrdersCount,
  techniciansCount,
  savedEmailsCount,
  currentFileName,
}) => {
  const { isDarkMode, activeHolidaySeason, holidayConfig } = useTheme();

  return (
    <div className="w-full">
      {/* 1. IMMERSIVE HERO BACKGROUND INTEGRATION (Full-width edge-to-edge across entire browser window) */}
      <div
        className={`relative w-full overflow-hidden transition-colors duration-500 ${
          isDarkMode
            ? "bg-[#040906]"
            : activeHolidaySeason !== "standard"
            ? "bg-transparent" // Theme applied: transparent so holiday background is 100% visible
            : "bg-black/95"
        }`}
      >
        {/* Background Image with Deep Natural Gradient Overlay - REMOVED when holiday theme is active so theme background is completely visible */}
        {(isDarkMode || activeHolidaySeason === "standard") && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src={isDarkMode ? matrixBackdropImg : dispatchHeroBgImg}
              alt={isDarkMode ? "Matrix Cyber Digital Stream" : "Operations and scheduling workspace"}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-center transition-all duration-700 ${
                isDarkMode
                  ? "filter brightness-[0.85] contrast-[1.25] saturate-150 scale-105 motion-safe:animate-pulse"
                  : "filter brightness-[0.74] contrast-[1.08]"
              }`}
            />
            {/* Radial & directional gradient overlays that dissolve seamlessly into the page canvas */}
            <div
              className={`absolute inset-0 transition-all duration-500 ${
                isDarkMode
                  ? "bg-gradient-to-r from-black/95 via-[#040906]/85 to-black/90"
                  : "bg-gradient-to-r from-black/92 via-[#3F4A33]/88 to-black/80"
              }`}
            />
            <div
              className={`absolute inset-0 transition-all duration-500 ${
                isDarkMode
                  ? "bg-gradient-to-b from-black/60 via-transparent via-50% to-[#040906]"
                  : "bg-gradient-to-b from-black/50 via-transparent via-55% to-[#FBF7F0]"
              }`}
            />
          </div>
        )}

        {/* Hero Content - Directly integrated on the background, balanced within max-w-7xl container */}
        <div
          className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-20 sm:pb-28 lg:pb-36 space-y-6 ${
            isDarkMode
              ? "text-white"
              : activeHolidaySeason !== "standard"
              ? "text-stone-900"
              : "text-white"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`relative inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs transition-colors ${
                isDarkMode
                  ? "bg-[#08150D]/90 border border-[#00FF41]/40 text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.25)] font-mono"
                  : activeHolidaySeason !== "standard"
                  ? "bg-white/80 border border-stone-800/15 text-stone-800 shadow-sm"
                  : "bg-black/40 border border-[#CFE0B8]/40 text-[#EDF3E3]"
              }`}
            >
              <img
                src={dispatchSealImg}
                alt="Sch TechDispatch Official Seal"
                referrerPolicy="no-referrer"
                className={`w-5 h-5 rounded-full object-cover border ${
                  isDarkMode
                    ? "border-[#00FF41] shadow-[0_0_8px_#00FF41]"
                    : activeHolidaySeason !== "standard"
                    ? "border-stone-400"
                    : "border-white/50"
                }`}
              />
              <span>South Central Weekly Schedule Operations &bull; Outlook Edition</span>
            </div>

            {/* Holiday Season Indicator Badge in Light Mode */}
            {!isDarkMode && activeHolidaySeason !== "standard" && (
              <div
                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs animate-in fade-in duration-300 ${
                  activeHolidaySeason === "wet_season"
                    ? "bg-[#EDF3E3]/95 border-[#CFE0B8] text-[#3F4A33] shadow-emerald-700/10"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-100/90 border-orange-300 text-orange-950 shadow-orange-500/10"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-blue-100/90 border-blue-300 text-blue-950 shadow-blue-500/10"
                    : activeHolidaySeason === "christmas"
                    ? "bg-red-100/90 border-red-300 text-red-950 shadow-red-500/10"
                    : "bg-amber-100/90 border-amber-300 text-amber-950 shadow-amber-500/10"
                }`}
              >
                <span>{holidayConfig.emoji}</span>
                <span>{holidayConfig.name} Theme Active</span>
                <span className="text-[10px] opacity-80 font-normal">({holidayConfig.dateRangeText})</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            <span
              className={
                isDarkMode
                  ? "text-white"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 drop-shadow-xs"
                  : "text-white"
              }
            >
              WELCOME TO{" "}
            </span>
            <span
              className={
                isDarkMode
                  ? "text-[#00FF41] drop-shadow-[0_0_18px_rgba(0,255,65,0.65)] italic font-mono"
                  : activeHolidaySeason === "wet_season"
                  ? "text-[#5B8266] drop-shadow-[0_2px_12px_rgba(91,130,102,0.4)] italic"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600 drop-shadow-[0_2px_12px_rgba(234,88,12,0.45)] italic"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-900 drop-shadow-[0_2px_12px_rgba(30,58,138,0.35)] italic"
                  : activeHolidaySeason === "christmas"
                  ? "text-red-700 drop-shadow-[0_2px_12px_rgba(185,28,28,0.35)] italic"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600 drop-shadow-[0_2px_12px_rgba(217,119,6,0.4)] italic"
                  : "text-[#CFE0B8] italic"
              }
            >
              SCH TECHDISPATCH
            </span>
          </h1>

          <p
            className={`text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl drop-shadow-xs ${
              isDarkMode
                ? "text-[#D2FAD7]"
                : activeHolidaySeason !== "standard"
                ? "text-stone-800 font-medium"
                : "text-[#EDF3E3]/90"
            }`}
          >
            The smartest and most reliable dispatch schedule generator for field operations. Convert raw work order CSVs into flawless, production-ready Outlook emails with automated routing, descending revision tracking, and camera audits.
          </p>

          {/* Action Button Row - Transparent Label Illusion with Hover Animations */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onGoToGenerator}
              className={`group inline-flex items-center space-x-2.5 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-1 cursor-pointer active:translate-y-0 ${
                isDarkMode
                  ? "bg-[#00FF41]/10 border-2 border-[#00FF41] text-[#00FF41] hover:text-[#040906] hover:bg-[#00FF41] hover:shadow-[0_0_25px_#00FF41]"
                  : activeHolidaySeason === "wet_season"
                  ? "bg-[#5B8266] hover:bg-[#40684C] text-white shadow-lg shadow-[#5B8266]/30 border-2 border-[#5B8266] hover:border-[#40684C]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 border-2 border-orange-600 hover:border-orange-700"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-700/30 border-2 border-blue-700 hover:border-blue-800"
                  : activeHolidaySeason === "christmas"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 border-2 border-red-600 hover:border-red-700"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 border-2 border-amber-600 hover:border-amber-700"
                  : "bg-transparent border-2 border-[#8AA66B] hover:border-[#CFE0B8] text-[#EDF3E3] hover:text-white hover:bg-[#8AA66B]/25 hover:shadow-xl hover:shadow-[#8AA66B]/25"
              }`}
            >
              <Mail
                className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                  isDarkMode
                    ? "text-[#00FF41] group-hover:text-[#040906]"
                    : activeHolidaySeason !== "standard"
                    ? "text-white"
                    : "text-[#CFE0B8]"
                }`}
              />
              <span className="tracking-wide">LAUNCH EMAIL GENERATOR</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => {
                const sample = SAMPLE_DATASETS[0];
                if (sample) {
                  onLoadSample(sample);
                  onGoToGenerator();
                }
              }}
              className={`group inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1 cursor-pointer active:translate-y-0 ${
                isDarkMode
                  ? "bg-[#08150D]/80 border border-[#00FF41]/50 text-[#D2FAD7] hover:border-[#00FF41] hover:text-[#00FF41] hover:bg-[#00FF41]/15 hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                  : activeHolidaySeason !== "standard"
                  ? "bg-white/85 border border-stone-300 text-stone-800 hover:bg-white hover:border-stone-400 shadow-xs hover:shadow-sm"
                  : "bg-transparent border border-white/35 hover:border-white text-[#EDF3E3] hover:text-white hover:bg-white/10"
              }`}
            >
              <Zap
                className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-12 ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : activeHolidaySeason !== "standard"
                    ? "text-amber-600"
                    : "text-[#CFE0B8]"
                }`}
              />
              <span>LOAD SAMPLE DATASET</span>
            </button>

            <button
              type="button"
              onClick={onGoToHistory}
              className={`group inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                isDarkMode
                  ? "bg-transparent text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10 border border-transparent hover:border-[#00FF41]/30"
                  : activeHolidaySeason !== "standard"
                  ? "bg-white/70 text-stone-700 hover:text-stone-900 hover:bg-white border border-stone-200/80 shadow-xs"
                  : "bg-transparent text-[#CFE0B8] hover:text-white hover:bg-white/5"
              }`}
            >
              <History
                className={`w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : activeHolidaySeason !== "standard"
                    ? "text-stone-600"
                    : "text-[#CFE0B8]"
                }`}
              />
              <span>Saved History ({savedEmailsCount})</span>
            </button>
          </div>

          {/* Live System Metric Indicators */}
          <div
            className={`pt-6 border-t flex flex-wrap items-center gap-6 sm:gap-8 text-xs ${
              isDarkMode
                ? "border-[#00FF41]/20 text-[#D2FAD7]/80"
                : activeHolidaySeason !== "standard"
                ? "border-stone-800/15 text-stone-700 font-medium"
                : "border-white/15 text-[#EDF3E3]/80"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  isDarkMode
                    ? "bg-[#00FF41] ring-4 ring-[#00FF41]/30 shadow-[0_0_10px_#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-500 ring-4 ring-orange-500/30"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-amber-400 ring-4 ring-amber-400/30"
                    : activeHolidaySeason === "christmas"
                    ? "bg-red-500 ring-4 ring-red-500/30"
                    : activeHolidaySeason === "new_year"
                    ? "bg-yellow-400 ring-4 ring-yellow-400/30"
                    : "bg-[#8AA66B] ring-4 ring-[#8AA66B]/30"
                }`}
              />
              <span>
                Status:{" "}
                <strong
                  className={
                    isDarkMode
                      ? "text-[#00FF41] font-mono"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-900"
                      : "text-white"
                  }
                >
                  Active System
                </strong>
              </span>
            </div>
            {currentFileName ? (
              <div className="flex items-center space-x-2">
                <FileSpreadsheet
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-600"
                      : "text-[#CFE0B8]"
                  }`}
                />
                <span>
                  Loaded CSV:{" "}
                  <strong
                    className={
                      isDarkMode
                        ? "text-[#E0FFE5]"
                        : activeHolidaySeason !== "standard"
                        ? "text-stone-900"
                        : "text-white"
                    }
                  >
                    {currentFileName}
                  </strong>
                </span>
              </div>
            ) : (
              <div
                className={`flex items-center space-x-2 ${
                  isDarkMode
                    ? "text-[#D2FAD7]/70"
                    : activeHolidaySeason !== "standard"
                    ? "text-stone-600"
                    : "text-[#EDF3E3]/60"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>No CSV uploaded yet (Sample data ready)</span>
              </div>
            )}
            {techniciansCount > 0 && (
              <div className="flex items-center space-x-2">
                <Users
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-600"
                      : "text-[#CFE0B8]"
                  }`}
                />
                <span>
                  <strong
                    className={
                      isDarkMode
                        ? "text-[#00FF41]"
                        : activeHolidaySeason !== "standard"
                        ? "text-stone-900"
                        : "text-white"
                    }
                  >
                    {techniciansCount}
                  </strong>{" "}
                  Techs &bull;{" "}
                  <strong
                    className={
                      isDarkMode
                        ? "text-[#00FF41]"
                        : activeHolidaySeason !== "standard"
                        ? "text-stone-900"
                        : "text-white"
                    }
                  >
                    {totalOrdersCount}
                  </strong>{" "}
                  Jobs
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Body Content - Contained in max-w-7xl centered container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16 pt-8 relative z-10">

      {/* 2. CORE SYSTEM HIGHLIGHTS / PILLARS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              isDarkMode
                ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41] font-mono shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-100 border-orange-300 text-orange-950"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-amber-100 border-amber-300 text-amber-950"
                : activeHolidaySeason === "christmas"
                ? "bg-red-100 border-red-300 text-red-950"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-100 border-amber-300 text-amber-950"
                : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-amber-600"
                  : activeHolidaySeason === "christmas"
                  ? "text-red-600"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600"
                  : "text-[#8AA66B]"
              }`}
            />
            <span>Built For Field Excellence</span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors ${
              isDarkMode
                ? "text-[#E0FFE5]"
                : activeHolidaySeason !== "standard"
                ? "text-stone-900"
                : "text-[#3F4A33]"
            }`}
          >
            Take Full Control of Your Field Schedule
          </h2>
          <p
            className={`text-sm font-normal ${
              isDarkMode
                ? "text-[#D2FAD7]/80"
                : activeHolidaySeason !== "standard"
                ? "text-stone-700"
                : "text-[#3F4A33]/80"
            }`}
          >
            Everything dispatch managers need to format work orders, communicate real-time revisions, and support field technicians without manual copy-paste errors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Automated CSV Engine */}
          <div
            className={`rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all group border transform hover:-translate-y-1 duration-300 ${
              isDarkMode
                ? "bg-[#08150D]/90 border-[#00FF41]/40 text-[#D2FAD7] shadow-[0_0_20px_rgba(0,255,65,0.12)] hover:border-[#00FF41] hover:shadow-[0_0_25px_rgba(0,255,65,0.28)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-orange-200 hover:border-orange-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-blue-200 hover:border-amber-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-emerald-200 hover:border-red-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-amber-200 hover:border-amber-500 shadow-sm text-stone-900"
                : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform ${
                isDarkMode
                  ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/50 shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-500 text-white shadow-orange-500/20"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-600 text-white shadow-blue-500/20"
                  : activeHolidaySeason === "christmas"
                  ? "bg-red-600 text-white shadow-red-500/20"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-500 text-white shadow-amber-500/20"
                  : "bg-[#8AA66B] text-white"
              }`}
            >
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3
              className={`text-base font-bold mb-2 ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 font-extrabold"
                  : "text-[#3F4A33]"
              }`}
            >
              Smart Ingestion Engine
            </h3>
            <p
              className={`text-xs leading-relaxed mb-4 ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-700"
                  : "text-[#3F4A33]/80"
              }`}
            >
              Instantly detects technician schedules, calculates Sunday-to-Saturday and Sunday-to-Sunday work weeks, and groups orders by weekday with priority tagging.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Flexible CSV column mapper
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Multi-tech auto-detection
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Sunday-to-Sunday weekend support
                </span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Descending Revision Tracker */}
          <div
            className={`rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all group border transform hover:-translate-y-1 duration-300 ${
              isDarkMode
                ? "bg-[#08150D]/90 border-[#00FF41]/40 text-[#D2FAD7] shadow-[0_0_20px_rgba(0,255,65,0.12)] hover:border-[#00FF41] hover:shadow-[0_0_25px_rgba(0,255,65,0.28)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-orange-200 hover:border-orange-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-blue-200 hover:border-amber-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-emerald-200 hover:border-red-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-amber-200 hover:border-amber-500 shadow-sm text-stone-900"
                : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform ${
                isDarkMode
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/60 shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-purple-900 text-white shadow-purple-900/20"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-600 text-white shadow-amber-600/20"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-700 text-white shadow-emerald-700/20"
                  : activeHolidaySeason === "new_year"
                  ? "bg-indigo-700 text-white shadow-indigo-700/20"
                  : "bg-[#3F4A33] text-white"
              }`}
            >
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h3
              className={`text-base font-bold mb-2 ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 font-extrabold"
                  : "text-[#3F4A33]"
              }`}
            >
              Descending Revision Tracking
            </h3>
            <p
              className={`text-xs leading-relaxed mb-4 ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-700"
                  : "text-[#3F4A33]/80"
              }`}
            >
              Version updates are neatly stacked in descending order (e.g. v3 active at the top, followed by v2, then v1) with red highlights on added and removed changes.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Manual prior notes input toggle
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Auto-fill prior versions v(N-1) to v1
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Keyword highlight for added &amp; removed
                </span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Outlook Compatibility */}
          <div
            className={`rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all group border transform hover:-translate-y-1 duration-300 ${
              isDarkMode
                ? "bg-[#08150D]/90 border-[#00FF41]/40 text-[#D2FAD7] shadow-[0_0_20px_rgba(0,255,65,0.12)] hover:border-[#00FF41] hover:shadow-[0_0_25px_rgba(0,255,65,0.28)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-orange-200 hover:border-orange-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-blue-200 hover:border-amber-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-emerald-200 hover:border-red-500 shadow-sm text-stone-900"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-amber-200 hover:border-amber-500 shadow-sm text-stone-900"
                : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform ${
                isDarkMode
                  ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/50 shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-amber-600 text-white shadow-amber-600/20"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-500 text-white shadow-amber-500/20"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-600 text-white shadow-emerald-600/20"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-600 text-white shadow-amber-600/20"
                  : "bg-[#8AA66B] text-white"
              }`}
            >
              <Mail className="w-6 h-6" />
            </div>
            <h3
              className={`text-base font-bold mb-2 ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 font-extrabold"
                  : "text-[#3F4A33]"
              }`}
            >
              100% Outlook Native HTML
            </h3>
            <p
              className={`text-xs leading-relaxed mb-4 ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-700"
                  : "text-[#3F4A33]/80"
              }`}
            >
              Engineered with Microsoft Word MSO rendering specifications, zero styling breaks across Outlook desktop, Office 365, and mobile apps.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Download native .EML file
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Safe manual drag &amp; drop attachments
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Check
                  className={`w-3.5 h-3.5 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-600"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-600"
                      : activeHolidaySeason === "christmas"
                      ? "text-red-600"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-600"
                      : "text-[#8AA66B]"
                  }`}
                />
                <span className={isDarkMode ? "text-[#D2FAD7]" : activeHolidaySeason !== "standard" ? "text-stone-800" : "text-[#3F4A33]/90"}>
                  Yellow banner with high-contrast text
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. SECOND PHOTO BANNER / WORKFLOW SHOWCASE */}
      <section
        className={`relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border transition-all duration-300 ${
          isDarkMode
            ? "border-[#00FF41]/40 shadow-[0_0_30px_rgba(0,255,65,0.18)]"
            : activeHolidaySeason === "halloween"
            ? "border-orange-500/40 shadow-xl shadow-orange-950/20"
            : activeHolidaySeason === "christmas_eve"
            ? "border-blue-500/40 shadow-xl shadow-blue-950/20"
            : activeHolidaySeason === "christmas"
            ? "border-emerald-500/40 shadow-xl shadow-emerald-950/20"
            : activeHolidaySeason === "new_year"
            ? "border-amber-500/40 shadow-xl shadow-amber-950/20"
            : "border-[#CFE0B8]"
        }`}
      >
        <div className="absolute inset-0">
          <img
            src={isDarkMode ? matrixBackdropImg : workflowBannerImg}
            alt={isDarkMode ? "Matrix Cyber Digital Stream" : "Field engineering and traffic survey operations"}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center ${
              isDarkMode
                ? "filter brightness-[0.75] contrast-[1.25] saturate-150 scale-105 motion-safe:animate-pulse"
                : "filter brightness-90"
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-r from-[#040906]/98 via-[#040906]/90 to-[#040906]/80"
                : activeHolidaySeason === "halloween"
                ? "bg-gradient-to-r from-[#2A0F05]/98 via-[#431407]/92 to-[#1C0802]/85"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-gradient-to-r from-[#0C192E]/98 via-[#172554]/92 to-[#0A1324]/85"
                : activeHolidaySeason === "christmas"
                ? "bg-gradient-to-r from-[#0D2818]/98 via-[#14532D]/92 to-[#081C10]/85"
                : activeHolidaySeason === "new_year"
                ? "bg-gradient-to-r from-[#1E1435]/98 via-[#2E1065]/92 to-[#140A26]/85"
                : "bg-gradient-to-r from-[#3F4A33]/95 via-[#3F4A33]/88 to-[#3F4A33]/75"
            }`}
          />
        </div>

        <div className="relative z-10 px-6 sm:px-12 py-12 sm:py-16 text-white grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#00FF41] font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-400"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-amber-300"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-300"
                  : activeHolidaySeason === "new_year"
                  ? "text-yellow-300"
                  : "text-[#CFE0B8]"
              }`}
            >
              Comprehensive Operations Suite
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold leading-tight ${isDarkMode ? "text-[#E0FFE5]" : "text-white"}`}>
              Designed For High-Paced South Central Dispatch
            </h2>
            <p className={`text-sm leading-relaxed ${isDarkMode ? "text-[#D2FAD7]" : "text-[#EDF3E3]/90"}`}>
              From COD school zones to LADOTD highway studies, speed surveys, and weekend teardowns—Sch TechDispatch organizes complex logistics into clear, actionable communications.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div
                className={`backdrop-blur-sm border rounded-xl p-3 ${
                  isDarkMode
                    ? "bg-[#08150D]/80 border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.1)]"
                    : "bg-white/10 border-white/15"
                }`}
              >
                <MapPin
                  className={`w-5 h-5 mb-1 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-400"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-300"
                      : activeHolidaySeason === "christmas"
                      ? "text-emerald-300"
                      : activeHolidaySeason === "new_year"
                      ? "text-yellow-300"
                      : "text-[#CFE0B8]"
                  }`}
                />
                <h4 className="text-xs font-bold text-white">Route Links</h4>
                <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/80"}`}>
                  Custom Google Maps &amp; Airtable links per technician.
                </p>
              </div>
              <div
                className={`backdrop-blur-sm border rounded-xl p-3 ${
                  isDarkMode
                    ? "bg-[#08150D]/80 border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.1)]"
                    : "bg-white/10 border-white/15"
                }`}
              >
                <Camera
                  className={`w-5 h-5 mb-1 ${
                    isDarkMode
                      ? "text-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-400"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-amber-300"
                      : activeHolidaySeason === "christmas"
                      ? "text-emerald-300"
                      : activeHolidaySeason === "new_year"
                      ? "text-yellow-300"
                      : "text-[#CFE0B8]"
                  }`}
                />
                <h4 className="text-xs font-bold text-white">Photo Portals</h4>
                <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/80"}`}>
                  Integrated South Central field photo upload links.
                </p>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={onGoToGenerator}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs shadow-md transition transform hover:-translate-y-0.5 cursor-pointer ${
                  isDarkMode
                    ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-extrabold shadow-[0_0_15px_#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-lg shadow-amber-500/30"
                    : activeHolidaySeason === "christmas"
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                    : activeHolidaySeason === "new_year"
                    ? "bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-lg shadow-amber-500/30"
                    : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
                }`}
              >
                <span>OPEN EMAIL GENERATOR</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Showcase Card with Email Mockup */}
          <div
            className={`rounded-xl p-5 shadow-2xl space-y-3 font-sans border transition-colors ${
              isDarkMode
                ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/40 shadow-[0_0_25px_rgba(0,255,65,0.2)]"
                : activeHolidaySeason === "halloween"
                ? "bg-[#FDF8F3] text-stone-900 border-orange-200"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-[#F6F9FD] text-stone-900 border-blue-200"
                : activeHolidaySeason === "christmas"
                ? "bg-[#FCF9F6] text-stone-900 border-emerald-200"
                : activeHolidaySeason === "new_year"
                ? "bg-[#FCFAF6] text-stone-900 border-amber-200"
                : "bg-[#FBF7F0] text-[#3F4A33] border-[#CFE0B8]"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2 text-xs ${
                isDarkMode
                  ? "border-[#00FF41]/30"
                  : activeHolidaySeason === "halloween"
                  ? "border-orange-200"
                  : activeHolidaySeason === "christmas_eve"
                  ? "border-blue-200"
                  : activeHolidaySeason === "christmas"
                  ? "border-emerald-200"
                  : activeHolidaySeason === "new_year"
                  ? "border-amber-200"
                  : "border-[#CFE0B8]"
              }`}
            >
              <span className="font-bold flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isDarkMode
                      ? "bg-[#00FF41] shadow-[0_0_8px_#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-500 ring-2 ring-orange-400/40"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-amber-400 ring-2 ring-amber-400/40"
                      : activeHolidaySeason === "christmas"
                      ? "bg-red-500 ring-2 ring-red-400/40"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-500 ring-2 ring-amber-400/40"
                      : "bg-[#8AA66B]"
                  }`}
                />
                Live Email Template Preview
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                  isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-100 text-orange-950 border-orange-300"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-amber-100 text-amber-950 border-amber-300"
                    : activeHolidaySeason === "christmas"
                    ? "bg-red-100 text-red-950 border-red-300"
                    : activeHolidaySeason === "new_year"
                    ? "bg-amber-100 text-amber-950 border-amber-300"
                    : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                }`}
              >
                Descending Order
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p
                className={`font-medium ${
                  isDarkMode ? "text-[#E0FFE5]" : "text-stone-900"
                }`}
              >
                Hello Dustin,
              </p>
              <div className="bg-yellow-300 text-black px-2.5 py-1 rounded font-bold text-xs shadow-2xs">
                UPDATE v3: Schedule is updated. I <span className="text-red-700 font-black">removed</span> nothing
              </div>
              <p className={isDarkMode ? "text-zinc-300 text-[11px]" : "text-[11px] text-zinc-800"}>
                UPDATE v2: Schedule is updated. I <span className="text-red-500 font-bold">added</span> kineme
              </p>
              <p className={isDarkMode ? "text-zinc-300 text-[11px]" : "text-[11px] text-zinc-800"}>
                UPDATE v1: Schedule is updated. I <span className="text-red-500 font-bold">added</span> nothing
              </p>
              <p className={`text-[11px] italic pt-1 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-600"}`}>
                Hope your week is off to a great start. Please see the attached documents and table below...
              </p>
            </div>

            <div
              className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                isDarkMode
                  ? "border-[#00FF41]/20 text-[#D2FAD7]/80"
                  : activeHolidaySeason === "halloween"
                  ? "border-orange-200 text-stone-700"
                  : activeHolidaySeason === "christmas_eve"
                  ? "border-blue-200 text-stone-700"
                  : activeHolidaySeason === "christmas"
                  ? "border-emerald-200 text-stone-700"
                  : activeHolidaySeason === "new_year"
                  ? "border-amber-200 text-stone-700"
                  : "border-[#CFE0B8] text-[#3F4A33]/70"
              }`}
            >
              <span>Ready for copy to Outlook</span>
              <span
                className={`font-bold ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "text-orange-600"
                    : activeHolidaySeason === "christmas_eve"
                    ? "text-amber-600"
                    : activeHolidaySeason === "christmas"
                    ? "text-red-600"
                    : activeHolidaySeason === "new_year"
                    ? "text-amber-600"
                    : "text-[#8AA66B]"
                }`}
              >
                Zero formatting errors
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW THE APP WORKS (Step-by-step visual workflow) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isDarkMode
                ? "text-[#00FF41] font-mono"
                : activeHolidaySeason === "halloween"
                ? "text-orange-600"
                : activeHolidaySeason === "christmas_eve"
                ? "text-amber-600"
                : activeHolidaySeason === "christmas"
                ? "text-red-600"
                : activeHolidaySeason === "new_year"
                ? "text-amber-600"
                : "text-[#8AA66B]"
            }`}
          >
            Simple 4-Step Process
          </span>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDarkMode ? "text-[#E0FFE5]" : activeHolidaySeason !== "standard" ? "text-stone-900" : "text-[#3F4A33]"
            }`}
          >
            How The Application Works
          </h2>
          <p
            className={`text-xs sm:text-sm ${
              isDarkMode ? "text-[#D2FAD7]/80" : activeHolidaySeason !== "standard" ? "text-stone-700" : "text-[#3F4A33]/80"
            }`}
          >
            A frictionless workflow designed for quick daily and weekly dispatches.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div
            className={`rounded-xl p-5 space-y-3 relative shadow-xs border transition-all duration-300 transform hover:-translate-y-1 ${
              isDarkMode
                ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:border-[#00FF41] hover:shadow-[0_0_20px_rgba(0,255,65,0.25)] text-[#D2FAD7]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-orange-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-blue-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-emerald-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-amber-200 text-stone-900 shadow-sm"
                : "bg-white border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center border ${
                isDarkMode
                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-100 text-orange-950 border-orange-300"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-100 text-amber-950 border-amber-300"
                  : activeHolidaySeason === "christmas"
                  ? "bg-red-100 text-red-950 border-red-300"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-100 text-amber-950 border-amber-300"
                  : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              01
            </div>
            <h4
              className={`text-sm font-bold ${
                isDarkMode ? "text-[#E0FFE5]" : activeHolidaySeason !== "standard" ? "text-stone-900 font-extrabold" : "text-[#3F4A33]"
              }`}
            >
              Ingest Work Orders
            </h4>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#D2FAD7]/80" : activeHolidaySeason !== "standard" ? "text-stone-700" : "text-[#3F4A33]/75"}`}>
              Drag &amp; drop your dispatch CSV or load a pre-configured sample dataset. The mapper automatically correlates columns.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`rounded-xl p-5 space-y-3 relative shadow-xs border transition-all duration-300 transform hover:-translate-y-1 ${
              isDarkMode
                ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:border-[#00FF41] hover:shadow-[0_0_20px_rgba(0,255,65,0.25)] text-[#D2FAD7]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-orange-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-blue-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-emerald-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-amber-200 text-stone-900 shadow-sm"
                : "bg-white border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center border ${
                isDarkMode
                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-100 text-orange-950 border-orange-300"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-100 text-amber-950 border-amber-300"
                  : activeHolidaySeason === "christmas"
                  ? "bg-red-100 text-red-950 border-red-300"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-100 text-amber-950 border-amber-300"
                  : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              02
            </div>
            <h4
              className={`text-sm font-bold ${
                isDarkMode ? "text-[#E0FFE5]" : activeHolidaySeason !== "standard" ? "text-stone-900 font-extrabold" : "text-[#3F4A33]"
              }`}
            >
              Select Tech &amp; Week
            </h4>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#D2FAD7]/80" : activeHolidaySeason !== "standard" ? "text-stone-700" : "text-[#3F4A33]/75"}`}>
              Choose the target technician from the dropdown. The system automatically partitions daily tasks with durations and notes.
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`rounded-xl p-5 space-y-3 relative shadow-xs border transition-all duration-300 transform hover:-translate-y-1 ${
              isDarkMode
                ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:border-[#00FF41] hover:shadow-[0_0_20px_rgba(0,255,65,0.25)] text-[#D2FAD7]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-orange-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-blue-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-emerald-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-amber-200 text-stone-900 shadow-sm"
                : "bg-white border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center border ${
                isDarkMode
                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-100 text-orange-950 border-orange-300"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-100 text-amber-950 border-amber-300"
                  : activeHolidaySeason === "christmas"
                  ? "bg-red-100 text-red-950 border-red-300"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-100 text-amber-950 border-amber-300"
                  : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              03
            </div>
            <h4
              className={`text-sm font-bold ${
                isDarkMode ? "text-[#E0FFE5]" : activeHolidaySeason !== "standard" ? "text-stone-900 font-extrabold" : "text-[#3F4A33]"
              }`}
            >
              Manage Versions &amp; Notes
            </h4>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#D2FAD7]/80" : activeHolidaySeason !== "standard" ? "text-stone-700" : "text-[#3F4A33]/75"}`}>
              Toggle Email Updates for revisions. Input or auto-fill prior version notes in descending order (v3, v2, v1) with live preview.
            </p>
          </div>

          {/* Step 4 */}
          <div
            className={`rounded-xl p-5 space-y-3 relative shadow-xs border transition-all duration-300 transform hover:-translate-y-1 ${
              isDarkMode
                ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:border-[#00FF41] hover:shadow-[0_0_20px_rgba(0,255,65,0.25)] text-[#D2FAD7]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-orange-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-blue-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-emerald-200 text-stone-900 shadow-sm"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-amber-200 text-stone-900 shadow-sm"
                : "bg-white border-[#CFE0B8] text-[#3F4A33]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center ${
                isDarkMode
                  ? "bg-[#00FF41] text-[#040906] font-mono shadow-[0_0_10px_#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-600 text-white shadow-xs"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-500 text-stone-950 font-black shadow-xs"
                  : activeHolidaySeason === "christmas"
                  ? "bg-red-600 text-white shadow-xs"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-500 text-stone-950 font-black shadow-xs"
                  : "bg-[#8AA66B] text-white"
              }`}
            >
              04
            </div>
            <h4
              className={`text-sm font-bold ${
                isDarkMode ? "text-[#E0FFE5]" : activeHolidaySeason !== "standard" ? "text-stone-900 font-extrabold" : "text-[#3F4A33]"
              }`}
            >
              Copy or Download .EML
            </h4>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#D2FAD7]/80" : activeHolidaySeason !== "standard" ? "text-stone-700" : "text-[#3F4A33]/75"}`}>
              Click Copy Email Body to paste directly into Outlook with formatting intact, or download the native .EML file for offline sending.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ABOUT DEVELOPERS & SYSTEM ARCHITECTURE */}
      <section
        className={`rounded-2xl p-6 sm:p-10 space-y-6 border transition-colors ${
          isDarkMode
            ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_25px_rgba(0,255,65,0.15)] text-[#D2FAD7]"
            : activeHolidaySeason === "halloween"
            ? "bg-white/95 border-orange-200 text-stone-900 shadow-md"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white/95 border-blue-200 text-stone-900 shadow-md"
            : activeHolidaySeason === "christmas"
            ? "bg-white/95 border-emerald-200 text-stone-900 shadow-md"
            : activeHolidaySeason === "new_year"
            ? "bg-white/95 border-amber-200 text-stone-900 shadow-md"
            : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
        }`}
      >
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b ${
            isDarkMode
              ? "border-[#00FF41]/30"
              : activeHolidaySeason === "halloween"
              ? "border-orange-200"
              : activeHolidaySeason === "christmas_eve"
              ? "border-blue-200"
              : activeHolidaySeason === "christmas"
              ? "border-emerald-200"
              : activeHolidaySeason === "new_year"
              ? "border-amber-200"
              : "border-[#CFE0B8]"
          }`}
        >
          <div className="space-y-2 max-w-xl">
            <div
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isDarkMode
                  ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41] font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-100 border-orange-300 text-orange-950"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-100 border-amber-300 text-amber-950"
                  : activeHolidaySeason === "christmas"
                  ? "bg-red-100 border-red-300 text-red-950"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-100 border-amber-300 text-amber-950"
                  : "bg-white border-[#CFE0B8] text-[#3F4A33]"
              }`}
            >
              <Code2
                className={`w-3.5 h-3.5 ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "text-orange-600"
                    : activeHolidaySeason === "christmas_eve"
                    ? "text-amber-600"
                    : activeHolidaySeason === "christmas"
                    ? "text-red-600"
                    : activeHolidaySeason === "new_year"
                    ? "text-amber-600"
                    : "text-[#8AA66B]"
                }`}
              />
              <span>Engineering &bull; South Central Operations</span>
            </div>
            <h3
              className={`text-xl sm:text-2xl font-extrabold ${
                isDarkMode ? "text-[#E0FFE5]" : activeHolidaySeason !== "standard" ? "text-stone-900" : "text-[#3F4A33]"
              }`}
            >
              About the Developers &amp; Mission
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]/85"}`}>
              Developed by the South Central Field Operations Technology Team. Built specifically to eliminate human errors during dispatch email creation, safeguard technician routing schedules, and maintain transparent version control across all camera and install projects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onGoToGenerator}
              className={`group inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs border transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                isDarkMode
                  ? "bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41] hover:text-[#040906] hover:shadow-[0_0_15px_#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-white border-orange-500 hover:border-orange-600 text-orange-700 hover:bg-orange-50 shadow-xs"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-white border-blue-500 hover:border-blue-600 text-blue-700 hover:bg-blue-50 shadow-xs"
                  : activeHolidaySeason === "christmas"
                  ? "bg-white border-red-500 hover:border-red-600 text-red-700 hover:bg-emerald-50 shadow-xs"
                  : activeHolidaySeason === "new_year"
                  ? "bg-white border-amber-500 hover:border-amber-600 text-amber-700 hover:bg-amber-50 shadow-xs"
                  : "bg-transparent border-[#8AA66B] hover:border-[#3F4A33] text-[#3F4A33] hover:bg-[#8AA66B]/15"
              }`}
            >
              <span>Go to Generator</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Developer Badges & Tech Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div
            className={`rounded-xl p-4 border space-y-1.5 transition-all ${
              isDarkMode
                ? "bg-[#040906]/90 border-[#00FF41]/30 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-2 border-orange-500/30 hover:border-orange-500 shadow-md shadow-orange-950/5"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-2 border-blue-500/30 hover:border-blue-500 shadow-md shadow-blue-950/5"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-2 border-emerald-500/30 hover:border-emerald-500 shadow-md shadow-emerald-950/5"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-2 border-amber-500/30 hover:border-amber-500 shadow-md shadow-amber-950/5"
                : "bg-white border-[#CFE0B8]/60 hover:border-[#8AA66B]"
            }`}
          >
            <div
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#00FF41] font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600 font-extrabold"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600 font-extrabold"
                  : activeHolidaySeason === "christmas"
                  ? "text-red-600 font-extrabold"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600 font-extrabold"
                  : "text-[#8AA66B]"
              }`}
            >
              Zero Corruption
            </div>
            <h5
              className={`text-xs font-bold ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 font-extrabold"
                  : "text-[#3F4A33]"
              }`}
            >
              Manual Safe Attachments
            </h5>
            <p
              className={`text-[11px] ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Clean file pipeline ensuring job PDFs, maps, and camera rosters are never corrupted during export.
            </p>
          </div>

          <div
            className={`rounded-xl p-4 border space-y-1.5 transition-all ${
              isDarkMode
                ? "bg-[#040906]/90 border-[#00FF41]/30 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-2 border-orange-500/30 hover:border-orange-500 shadow-md shadow-orange-950/5"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-2 border-blue-500/30 hover:border-blue-500 shadow-md shadow-blue-950/5"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-2 border-emerald-500/30 hover:border-emerald-500 shadow-md shadow-emerald-950/5"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-2 border-amber-500/30 hover:border-amber-500 shadow-md shadow-amber-950/5"
                : "bg-white border-[#CFE0B8]/60 hover:border-[#8AA66B]"
            }`}
          >
            <div
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#00FF41] font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600 font-extrabold"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600 font-extrabold"
                  : activeHolidaySeason === "christmas"
                  ? "text-blue-600 font-extrabold"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600 font-extrabold"
                  : "text-[#8AA66B]"
              }`}
            >
              Local Privacy
            </div>
            <h5
              className={`text-xs font-bold ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 font-extrabold"
                  : "text-[#3F4A33]"
              }`}
            >
              Client-Side Processing
            </h5>
            <p
              className={`text-[11px] ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              All technician CSV data and saved email history stay securely within the dispatcher's local browser environment.
            </p>
          </div>

          <div
            className={`rounded-xl p-4 border space-y-1.5 transition-all ${
              isDarkMode
                ? "bg-[#040906]/90 border-[#00FF41]/30 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-2 border-orange-500/30 hover:border-orange-500 shadow-md shadow-orange-950/5"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-2 border-blue-500/30 hover:border-blue-500 shadow-md shadow-blue-950/5"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-2 border-emerald-500/30 hover:border-emerald-500 shadow-md shadow-emerald-950/5"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-2 border-amber-500/30 hover:border-amber-500 shadow-md shadow-amber-950/5"
                : "bg-white border-[#CFE0B8]/60 hover:border-[#8AA66B]"
            }`}
          >
            <div
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#00FF41] font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600 font-extrabold"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600 font-extrabold"
                  : activeHolidaySeason === "christmas"
                  ? "text-red-600 font-extrabold"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600 font-extrabold"
                  : "text-[#8AA66B]"
              }`}
            >
              Outlook Engine
            </div>
            <h5
              className={`text-xs font-bold ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 font-extrabold"
                  : "text-[#3F4A33]"
              }`}
            >
              MSO Table Standards
            </h5>
            <p
              className={`text-[11px] ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Hand-crafted table widths, Calibri typography, and Microsoft Word rendering conditional rules.
            </p>
          </div>

          <div
            className={`rounded-xl p-4 border space-y-1.5 transition-all ${
              isDarkMode
                ? "bg-[#040906]/90 border-[#00FF41]/30 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white/95 border-2 border-orange-500/30 hover:border-orange-500 shadow-md shadow-orange-950/5"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white/95 border-2 border-blue-500/30 hover:border-blue-500 shadow-md shadow-blue-950/5"
                : activeHolidaySeason === "christmas"
                ? "bg-white/95 border-2 border-emerald-500/30 hover:border-emerald-500 shadow-md shadow-emerald-950/5"
                : activeHolidaySeason === "new_year"
                ? "bg-white/95 border-2 border-amber-500/30 hover:border-amber-500 shadow-md shadow-amber-950/5"
                : "bg-white border-[#CFE0B8]/60 hover:border-[#8AA66B]"
            }`}
          >
            <div
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "text-[#00FF41] font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600 font-extrabold"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600 font-extrabold"
                  : activeHolidaySeason === "christmas"
                  ? "text-red-600 font-extrabold"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600 font-extrabold"
                  : "text-[#8AA66B]"
              }`}
            >
              Revision Audit
            </div>
            <h5
              className={`text-xs font-bold ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 font-extrabold"
                  : "text-[#3F4A33]"
              }`}
            >
              Audit Trail History
            </h5>
            <p
              className={`text-[11px] ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Instant recall of any previous email sent for any technician in any work week with one-click restore.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section
        className={`rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xl border transition-all duration-300 relative overflow-hidden ${
          isDarkMode
            ? "bg-[#040906]/95 border-2 border-[#00FF41]/60 shadow-[0_0_35px_rgba(0,255,65,0.25)] text-[#E0FFE5]"
            : activeHolidaySeason === "halloween"
            ? "bg-gradient-to-r from-stone-950 via-orange-950 to-stone-900 border-2 border-orange-500/50 shadow-2xl shadow-orange-950/40 text-white"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 border-2 border-blue-500/50 shadow-2xl shadow-blue-950/40 text-white"
            : activeHolidaySeason === "christmas"
            ? "bg-gradient-to-r from-emerald-950 via-stone-900 to-red-950 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/40 text-white"
            : activeHolidaySeason === "new_year"
            ? "bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 border-2 border-amber-500/50 shadow-2xl shadow-amber-950/40 text-white"
            : "bg-[#3F4A33] border-[#CFE0B8] text-white"
        }`}
      >
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to generate this week's technician schedules?
        </h3>
        <p
          className={`text-xs sm:text-sm max-w-xl mx-auto ${
            isDarkMode
              ? "text-[#D2FAD7]"
              : activeHolidaySeason === "halloween"
              ? "text-orange-200/90"
              : activeHolidaySeason === "christmas_eve"
              ? "text-blue-200/90"
              : activeHolidaySeason === "christmas"
              ? "text-emerald-200/90"
              : activeHolidaySeason === "new_year"
              ? "text-amber-200/90"
              : "text-[#EDF3E3]/85"
          }`}
        >
          Start now by uploading a CSV dispatch file or clicking below to access the email generator workbench.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onGoToGenerator}
            className={`group inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${
              isDarkMode
                ? "bg-[#00FF41] text-[#040906] hover:bg-[#39FF14] shadow-[0_0_20px_#00FF41] font-extrabold"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 border border-orange-400"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 border border-blue-400"
                : activeHolidaySeason === "christmas"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 border border-red-400"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 border border-amber-400"
                : "bg-transparent border-2 border-[#CFE0B8] hover:border-white text-white hover:bg-white/10"
            }`}
          >
            <Mail
              className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                isDarkMode ? "text-[#040906]" : "text-white"
              }`}
            />
            <span className="tracking-wide">LAUNCH EMAIL GENERATOR</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </section>
      </div>
    </div>
  );
};
