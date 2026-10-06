import React from "react";
import {
  Mail,
  Settings,
  History,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Moon,
  Terminal,
  Play,
  Pause,
} from "lucide-react";
import { SAMPLE_DATASETS, SampleDataset } from "../utils/sampleData";
import dispatchSealImg from "../assets/images/dispatch_seal_1790100099915.jpg";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  onLoadSample: (sample: SampleDataset) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  activeDatasetName?: string;
  totalOrdersCount: number;
  techniciansCount: number;
  activeTab: "dashboard" | "generator" | "history" | "algtmc";
  onSelectTab: (tab: "dashboard" | "generator" | "history" | "algtmc") => void;
  savedEmailsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSample,
  onOpenSettings,
  onOpenHistory,
  activeDatasetName,
  totalOrdersCount,
  techniciansCount,
  activeTab,
  onSelectTab,
  savedEmailsCount,
}) => {
  const [sampleMenuOpen, setSampleMenuOpen] = React.useState(false);
  const {
    isDarkMode,
    toggleDarkMode,
    matrixRainActive,
    toggleMatrixRain,
    activeHolidaySeason,
    holidayConfig,
  } = useTheme();

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 shadow-md ${
        isDarkMode
          ? "bg-[#040906]/90 border-[#00FF41]/25 text-[#D2FAD7] shadow-[0_4px_25px_rgba(0,0,0,0.85)]"
          : `${holidayConfig.colors.navbarBg} ${holidayConfig.colors.navbarBorder} text-[#EDF3E3]`
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo and Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group select-none transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => onSelectTab("dashboard")}
            title="Go to Dashboard / Landing Page"
          >
            <div className="relative">
              <img
                src={dispatchSealImg}
                alt="Sch TechDispatch Official Logo"
                referrerPolicy="no-referrer"
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border shadow-md transition-all duration-300 ${
                  isDarkMode
                    ? "border-[#00FF41]/60 ring-2 ring-[#00FF41]/40 group-hover:ring-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.4)]"
                    : activeHolidaySeason === "halloween"
                    ? "border-orange-400/60 ring-2 ring-orange-500/40 group-hover:ring-orange-400 shadow-[0_0_12px_rgba(234,88,12,0.4)]"
                    : activeHolidaySeason === "christmas_eve"
                    ? "border-amber-300/60 ring-2 ring-amber-400/40 group-hover:ring-amber-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]"
                    : activeHolidaySeason === "christmas"
                    ? "border-red-400/60 ring-2 ring-emerald-500/40 group-hover:ring-red-400 shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                    : activeHolidaySeason === "new_year"
                    ? "border-yellow-300/60 ring-2 ring-purple-500/40 group-hover:ring-yellow-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]"
                    : "border-[#CFE0B8]/50 ring-2 ring-[#8AA66B]/30 group-hover:ring-[#CFE0B8]"
                }`}
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                  isDarkMode
                    ? "bg-[#00FF41] border-[#040906] shadow-[0_0_6px_#00FF41] animate-pulse"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-500 border-stone-900 group-hover:bg-amber-400"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-amber-400 border-blue-950 group-hover:bg-yellow-300 animate-pulse"
                    : activeHolidaySeason === "christmas"
                    ? "bg-red-500 border-emerald-950 group-hover:bg-emerald-400"
                    : activeHolidaySeason === "new_year"
                    ? "bg-yellow-400 border-indigo-950 group-hover:bg-amber-300 animate-pulse"
                    : "bg-[#8AA66B] border-[#3F4A33] group-hover:bg-[#CFE0B8]"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-black text-sm sm:text-base tracking-tight transition-colors ${
                    isDarkMode
                      ? "text-[#E0FFE5] group-hover:text-[#00FF41]"
                      : "text-white group-hover:text-[#CFE0B8]"
                  }`}
                >
                  Sch TechDispatch
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDarkMode
                      ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_8px_rgba(0,255,65,0.2)] font-mono"
                      : activeHolidaySeason !== "standard"
                      ? "bg-white/20 text-white border-white/40 shadow-xs"
                      : "bg-[#8AA66B]/30 text-[#EDF3E3] border border-[#CFE0B8]/40"
                  }`}
                >
                  {isDarkMode
                    ? "SYS: MATRIX"
                    : activeHolidaySeason !== "standard"
                    ? `${holidayConfig.emoji} ${holidayConfig.badgeLabel}`
                    : "South Central"}
                </span>
              </div>
              <p
                className={`text-[11px] font-medium ${
                  isDarkMode ? "text-[#D2FAD7]/80 font-mono text-[10px]" : "text-[#EDF3E3]/70"
                }`}
              >
                Field Operations &bull; Outlook Email Generator
              </p>
            </div>
          </div>

          {/* Navigation Links (Center Tabs) - Single-line futuristic tabs with animated underglow */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-transparent shrink-0">
            {/* Dashboard / Home */}
            <button
              type="button"
              onClick={() => onSelectTab("dashboard")}
              className={`group relative flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold tracking-tight whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer bg-transparent hover:-translate-y-0.5 ${
                activeTab === "dashboard"
                  ? isDarkMode
                    ? "text-[#00FF41]"
                    : "text-white"
                  : isDarkMode
                  ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                  : "text-[#EDF3E3]/70 hover:text-white"
              }`}
            >
              <LayoutDashboard
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  activeTab === "dashboard"
                    ? isDarkMode
                      ? "text-[#00FF41]"
                      : "text-[#CFE0B8]"
                    : isDarkMode
                    ? "text-[#00FF41]/60 group-hover:text-[#00FF41]"
                    : "text-[#EDF3E3]/60 group-hover:text-[#CFE0B8]"
                }`}
              />
              <span className="whitespace-nowrap">Dashboard</span>
              {/* Animated Underline Indicator */}
              <span
                className={`absolute bottom-0 left-1.5 right-1.5 h-[2px] rounded-full transition-all duration-300 ${
                  activeTab === "dashboard"
                    ? isDarkMode
                      ? "bg-[#00FF41] scale-x-100 opacity-100 shadow-[0_0_12px_#00FF41,0_0_20px_rgba(0,255,65,0.7)]"
                      : "bg-[#CFE0B8] scale-x-100 opacity-100 shadow-[0_0_8px_rgba(207,224,184,0.8)]"
                    : isDarkMode
                    ? "bg-[#00FF41]/60 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    : "bg-[#8AA66B] scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                }`}
              />
            </button>

            {/* Email Generator */}
            <button
              type="button"
              onClick={() => onSelectTab("generator")}
              className={`group relative flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold tracking-tight whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer bg-transparent hover:-translate-y-0.5 ${
                activeTab === "generator"
                  ? isDarkMode
                    ? "text-[#00FF41]"
                    : "text-[#CFE0B8]"
                  : isDarkMode
                  ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                  : "text-[#EDF3E3]/70 hover:text-white"
              }`}
            >
              <Mail
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  activeTab === "generator"
                    ? isDarkMode
                      ? "text-[#00FF41]"
                      : "text-[#CFE0B8]"
                    : isDarkMode
                    ? "text-[#00FF41]/60 group-hover:text-[#00FF41]"
                    : "text-[#EDF3E3]/60 group-hover:text-[#CFE0B8]"
                }`}
              />
              <span className="whitespace-nowrap">Generator</span>
              {techniciansCount > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full border shrink-0 ${
                    isDarkMode
                      ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                      : "bg-[#8AA66B]/40 text-[#EDF3E3] border-[#CFE0B8]/30"
                  }`}
                >
                  {techniciansCount}
                </span>
              )}
              {/* Animated Underline Indicator */}
              <span
                className={`absolute bottom-0 left-1.5 right-1.5 h-[2px] rounded-full transition-all duration-300 ${
                  activeTab === "generator"
                    ? isDarkMode
                      ? "bg-[#00FF41] scale-x-100 opacity-100 shadow-[0_0_12px_#00FF41,0_0_20px_rgba(0,255,65,0.7)]"
                      : "bg-[#CFE0B8] scale-x-100 opacity-100 shadow-[0_0_8px_rgba(207,224,184,0.8)]"
                    : isDarkMode
                    ? "bg-[#00FF41]/60 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    : "bg-[#8AA66B] scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                }`}
              />
            </button>

            {/* Saved History */}
            <button
              type="button"
              onClick={() => onSelectTab("history")}
              className={`group relative flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold tracking-tight whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer bg-transparent hover:-translate-y-0.5 ${
                activeTab === "history"
                  ? isDarkMode
                    ? "text-[#00FF41]"
                    : "text-[#CFE0B8]"
                  : isDarkMode
                  ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                  : "text-[#EDF3E3]/70 hover:text-white"
              }`}
            >
              <History
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  activeTab === "history"
                    ? isDarkMode
                      ? "text-[#00FF41]"
                      : "text-[#CFE0B8]"
                    : isDarkMode
                    ? "text-[#00FF41]/60 group-hover:text-[#00FF41]"
                    : "text-[#EDF3E3]/60 group-hover:text-[#CFE0B8]"
                }`}
              />
              <span className="whitespace-nowrap">Saved History</span>
              {savedEmailsCount > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs shrink-0 ${
                    isDarkMode
                      ? "bg-[#00FF41] text-[#040906] font-extrabold shadow-[0_0_8px_#00FF41]"
                      : "bg-[#8AA66B] text-white"
                  }`}
                >
                  {savedEmailsCount}
                </span>
              )}
              {/* Animated Underline Indicator */}
              <span
                className={`absolute bottom-0 left-1.5 right-1.5 h-[2px] rounded-full transition-all duration-300 ${
                  activeTab === "history"
                    ? isDarkMode
                      ? "bg-[#00FF41] scale-x-100 opacity-100 shadow-[0_0_12px_#00FF41,0_0_20px_rgba(0,255,65,0.7)]"
                      : "bg-[#CFE0B8] scale-x-100 opacity-100 shadow-[0_0_8px_rgba(207,224,184,0.8)]"
                    : isDarkMode
                    ? "bg-[#00FF41]/60 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    : "bg-[#8AA66B] scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                }`}
              />
            </button>

            {/* ALG/TMC Approval */}
            <button
              type="button"
              onClick={() => onSelectTab("algtmc")}
              className={`group relative flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold tracking-tight whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer bg-transparent hover:-translate-y-0.5 ${
                activeTab === "algtmc"
                  ? isDarkMode
                    ? "text-[#00FF41]"
                    : "text-[#CFE0B8]"
                  : isDarkMode
                  ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                  : "text-[#EDF3E3]/70 hover:text-white"
              }`}
            >
              <FileText
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  activeTab === "algtmc"
                    ? isDarkMode
                      ? "text-[#00FF41]"
                      : "text-[#CFE0B8]"
                    : isDarkMode
                    ? "text-[#00FF41]/60 group-hover:text-[#00FF41]"
                    : "text-[#EDF3E3]/60 group-hover:text-[#CFE0B8]"
                }`}
              />
              <span className="whitespace-nowrap">ALG/TMC Approval</span>
              {/* Animated Underline Indicator */}
              <span
                className={`absolute bottom-0 left-1.5 right-1.5 h-[2px] rounded-full transition-all duration-300 ${
                  activeTab === "algtmc"
                    ? isDarkMode
                      ? "bg-[#00FF41] scale-x-100 opacity-100 shadow-[0_0_12px_#00FF41,0_0_20px_rgba(0,255,65,0.7)]"
                      : "bg-[#CFE0B8] scale-x-100 opacity-100 shadow-[0_0_8px_rgba(207,224,184,0.8)]"
                    : isDarkMode
                    ? "bg-[#00FF41]/60 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    : "bg-[#8AA66B] scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                }`}
              />
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Dark Mode / Matrix Theme Toggle Button */}
            <div className="flex items-center bg-black/25 rounded-xl p-0.5 border border-white/10 backdrop-blur-xs">
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 shadow-[0_0_12px_rgba(0,255,65,0.35)]"
                    : "bg-transparent text-[#EDF3E3] hover:text-white hover:bg-white/10"
                }`}
                title={
                  isDarkMode
                    ? "Switch to Light Mode (Classic South Central Theme)"
                    : "Activate Futuristic Green Matrix Dark Mode"
                }
              >
                {isDarkMode ? (
                  <>
                    <Terminal className="w-3.5 h-3.5 text-[#00FF41] animate-pulse" />
                    <span className="font-mono text-[11px] tracking-wide">MATRIX</span>
                    <span className="w-2 h-2 rounded-full bg-[#00FF41] shadow-[0_0_6px_#00FF41] animate-ping" />
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#CFE0B8] transition-transform duration-300 group-hover:-rotate-12" />
                    <span className="text-[11px]">Dark Mode</span>
                  </>
                )}
              </button>

              {/* Matrix Rain Animation Pause/Resume quick control when in Dark Mode */}
              {isDarkMode && (
                <button
                  type="button"
                  onClick={toggleMatrixRain}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                    matrixRainActive
                      ? "text-[#00FF41] hover:bg-[#00FF41]/20"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  }`}
                  title={
                    matrixRainActive
                      ? "Pause Background Matrix Code Stream"
                      : "Resume Background Matrix Code Stream"
                  }
                >
                  {matrixRainActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Sample Datasets Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSampleMenuOpen(!sampleMenuOpen)}
                className={`group flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border transition-all duration-300 shadow-xs cursor-pointer hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "bg-[#08150D] text-[#E0FFE5] border-[#00FF41]/35 hover:border-[#00FF41] hover:text-[#00FF41] hover:shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                    : "bg-transparent hover:bg-white/10 text-[#EDF3E3] hover:text-white border-[#CFE0B8]/40 hover:border-[#CFE0B8]"
                }`}
              >
                <Sparkles
                  className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 ${
                    isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]"
                  }`}
                />
                <span className="hidden sm:inline">Load Sample</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    isDarkMode ? "text-[#00FF41]/70" : "text-[#EDF3E3]/70"
                  } ${sampleMenuOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                />
              </button>

              {sampleMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSampleMenuOpen(false)} />
                  <div
                    className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl z-20 py-2 divide-y animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-md ${
                      isDarkMode
                        ? "bg-[#08150D]/95 border border-[#00FF41]/50 divide-[#00FF41]/20 shadow-[0_10px_40px_rgba(0,0,0,0.9)]"
                        : "bg-[#3F4A33] border border-[#CFE0B8]/40 divide-[#CFE0B8]/20"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${
                        isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]"
                      }`}
                    >
                      <span>Select Industry Template</span>
                      <span className={isDarkMode ? "text-[#00FF41]/70 font-mono" : "text-[#8AA66B]"}>Quick Load</span>
                    </div>
                    {SAMPLE_DATASETS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          onLoadSample(sample);
                          onSelectTab("generator");
                          setSampleMenuOpen(false);
                        }}
                        className={`group w-full text-left px-4 py-2.5 bg-transparent transition-all duration-200 flex flex-col space-y-0.5 cursor-pointer hover:translate-x-1 ${
                          isDarkMode ? "hover:bg-[#00FF41]/10" : "hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold transition-colors ${
                              isDarkMode
                                ? "text-[#E0FFE5] group-hover:text-[#00FF41]"
                                : "text-white group-hover:text-[#CFE0B8]"
                            }`}
                          >
                            {sample.name}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              isDarkMode
                                ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30 font-mono"
                                : "bg-[#8AA66B]/30 text-[#EDF3E3] border-[#CFE0B8]/30"
                            }`}
                          >
                            {sample.category}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] line-clamp-1 ${
                            isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/70"
                          }`}
                        >
                          {sample.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Branding & Template Settings */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Branding & Outlook Template Settings"
              className={`group flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border transition-all duration-300 shadow-xs cursor-pointer hover:-translate-y-0.5 ${
                isDarkMode
                  ? "bg-[#08150D] text-[#E0FFE5] border-[#00FF41]/35 hover:border-[#00FF41] hover:text-[#00FF41] hover:shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                  : "bg-transparent hover:bg-white/10 text-[#EDF3E3] hover:text-white border-[#CFE0B8]/40 hover:border-[#CFE0B8]"
              }`}
            >
              <Settings
                className={`w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-90 ${
                  isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]"
                }`}
              />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div
          className={`flex md:hidden items-center justify-around py-2 border-t text-xs ${
            isDarkMode ? "border-[#00FF41]/20 text-[#D2FAD7]" : "border-[#CFE0B8]/20"
          }`}
        >
          <button
            type="button"
            onClick={() => onSelectTab("dashboard")}
            className={`group relative flex items-center space-x-1 py-1.5 px-3 rounded-lg font-bold bg-transparent transition-all duration-200 ${
              activeTab === "dashboard"
                ? isDarkMode
                  ? "text-[#00FF41]"
                  : "text-[#CFE0B8]"
                : isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41]"
                : "text-[#EDF3E3]/70 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
            <span
              className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-transform duration-200 ${
                activeTab === "dashboard" ? "scale-x-100" : "scale-x-0"
              } ${isDarkMode ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41]" : "bg-[#CFE0B8]"}`}
            />
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("generator")}
            className={`group relative flex items-center space-x-1 py-1.5 px-3 rounded-lg font-bold bg-transparent transition-all duration-200 ${
              activeTab === "generator"
                ? isDarkMode
                  ? "text-[#00FF41]"
                  : "text-[#CFE0B8]"
                : isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41]"
                : "text-[#EDF3E3]/70 hover:text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Generator</span>
            <span
              className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-transform duration-200 ${
                activeTab === "generator" ? "scale-x-100" : "scale-x-0"
              } ${isDarkMode ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41]" : "bg-[#CFE0B8]"}`}
            />
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("history")}
            className={`group relative flex items-center space-x-1 py-1.5 px-3 rounded-lg font-bold bg-transparent transition-all duration-200 ${
              activeTab === "history"
                ? isDarkMode
                  ? "text-[#00FF41]"
                  : "text-[#CFE0B8]"
                : isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41]"
                : "text-[#EDF3E3]/70 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            <span
              className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-transform duration-200 ${
                activeTab === "history" ? "scale-x-100" : "scale-x-0"
              } ${isDarkMode ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41]" : "bg-[#CFE0B8]"}`}
            />
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("algtmc")}
            className={`group relative flex items-center space-x-1 py-1.5 px-3 rounded-lg font-bold bg-transparent transition-all duration-200 ${
              activeTab === "algtmc"
                ? isDarkMode
                  ? "text-[#00FF41]"
                  : "text-[#CFE0B8]"
                : isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41]"
                : "text-[#EDF3E3]/70 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ALG/TMC</span>
            <span
              className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-transform duration-200 ${
                activeTab === "algtmc" ? "scale-x-100" : "scale-x-0"
              } ${isDarkMode ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41]" : "bg-[#CFE0B8]"}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
