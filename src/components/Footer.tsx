import React from "react";
import {
  Mail,
  Calendar,
  History,
  Settings,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  MapPin,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  FileText,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import dispatchSealImg from "../assets/images/dispatch_seal_1790100099915.jpg";

interface FooterProps {
  onGoToDashboard: () => void;
  onGoToGenerator: () => void;
  onGoToHistory: () => void;
  onGoToAlgTmc?: () => void;
  onOpenSettings: () => void;
  onOpenAuditLogs: () => void;
  savedEmailsCount?: number;
  totalOrdersCount?: number;
  techniciansCount?: number;
}

export const Footer: React.FC<FooterProps> = ({
  onGoToDashboard,
  onGoToGenerator,
  onGoToHistory,
  onGoToAlgTmc,
  onOpenSettings,
  onOpenAuditLogs,
  savedEmailsCount = 0,
  totalOrdersCount = 0,
  techniciansCount = 0,
}) => {
  const { isDarkMode, activeHolidaySeason, holidayConfig } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`mt-16 relative overflow-hidden font-sans border-t transition-colors duration-500 ${
        isDarkMode
          ? "bg-[#040906]/98 text-[#D2FAD7] border-[#00FF41]/30 shadow-[0_-10px_35px_rgba(0,255,65,0.08)] backdrop-blur-md"
          : activeHolidaySeason === "halloween"
          ? "bg-[#1C0D06] text-[#FFEDD5] border-orange-500/30 shadow-[0_-10px_35px_rgba(234,88,12,0.12)]"
          : activeHolidaySeason === "christmas_eve"
          ? "bg-[#091322] text-[#EFF6FF] border-amber-400/30 shadow-[0_-10px_35px_rgba(217,119,6,0.12)]"
          : activeHolidaySeason === "christmas"
          ? "bg-[#092212] text-[#F0FDF4] border-red-500/30 shadow-[0_-10px_35px_rgba(220,38,38,0.12)]"
          : activeHolidaySeason === "new_year"
          ? "bg-[#0F0D2B] text-[#FAF5FF] border-amber-400/30 shadow-[0_-10px_35px_rgba(217,119,6,0.12)]"
          : "bg-[#3F4A33] text-[#EDF3E3] border-[#CFE0B8]/40"
      }`}
    >
      {/* Subtle background ambient glow */}
      <div
        className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isDarkMode
            ? "bg-[#00FF41]/10"
            : activeHolidaySeason === "halloween"
            ? "bg-orange-500/15"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-amber-400/15"
            : activeHolidaySeason === "christmas"
            ? "bg-red-500/15"
            : activeHolidaySeason === "new_year"
            ? "bg-amber-400/15"
            : "bg-[#8AA66B]/10"
        }`}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isDarkMode
            ? "bg-[#00FF41]/5"
            : activeHolidaySeason === "halloween"
            ? "bg-purple-600/10"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-blue-600/10"
            : activeHolidaySeason === "christmas"
            ? "bg-emerald-500/15"
            : activeHolidaySeason === "new_year"
            ? "bg-purple-600/15"
            : "bg-[#CFE0B8]/5"
        }`}
      />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b ${
            isDarkMode
              ? "border-[#00FF41]/20"
              : activeHolidaySeason === "halloween"
              ? "border-orange-500/20"
              : activeHolidaySeason === "christmas_eve"
              ? "border-amber-400/20"
              : activeHolidaySeason === "christmas"
              ? "border-emerald-500/25"
              : activeHolidaySeason === "new_year"
              ? "border-amber-400/20"
              : "border-[#CFE0B8]/20"
          }`}
        >
          {/* Column 1 & 2: Brand, Seal, & Platform Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <img
                  src={dispatchSealImg}
                  alt="Sch TechDispatch Official Seal"
                  referrerPolicy="no-referrer"
                  className={`w-12 h-12 rounded-xl object-cover shadow-md transition-all duration-300 ${
                    isDarkMode
                      ? "border-2 border-[#00FF41] ring-2 ring-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.35)]"
                      : activeHolidaySeason === "halloween"
                      ? "border border-orange-400 ring-2 ring-orange-500/30 shadow-[0_0_12px_rgba(234,88,12,0.4)]"
                      : activeHolidaySeason === "christmas_eve"
                      ? "border border-amber-300 ring-2 ring-amber-400/30 shadow-[0_0_12px_rgba(217,119,6,0.4)]"
                      : activeHolidaySeason === "christmas"
                      ? "border border-red-400 ring-2 ring-emerald-500/30 shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                      : activeHolidaySeason === "new_year"
                      ? "border border-yellow-300 ring-2 ring-purple-500/30 shadow-[0_0_12px_rgba(217,119,6,0.4)]"
                      : "border border-[#CFE0B8]/40 ring-2 ring-[#8AA66B]/30"
                  }`}
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${
                    isDarkMode
                      ? "bg-[#00FF41] border-[#040906] shadow-[0_0_6px_#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-500 border-stone-900"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-amber-400 border-blue-950"
                      : activeHolidaySeason === "christmas"
                      ? "bg-red-500 border-emerald-950"
                      : activeHolidaySeason === "new_year"
                      ? "bg-yellow-400 border-indigo-950"
                      : "bg-[#8AA66B] border-[#3F4A33]"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-base sm:text-lg font-black tracking-tight ${
                      isDarkMode ? "text-[#E0FFE5]" : "text-white"
                    }`}
                  >
                    Sch TechDispatch
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDarkMode
                        ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                        : activeHolidaySeason !== "standard"
                        ? "bg-white/20 text-white border-white/40 shadow-xs"
                        : "bg-[#8AA66B]/30 text-[#EDF3E3] border-[#CFE0B8]/30"
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
                  className={`text-xs font-medium ${
                    isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/70"
                  }`}
                >
                  Field Operations &bull; Weekly Outlook Schedule System
                </p>
              </div>
            </div>

            {/* Seasonal Greeting Banner in Footer */}
            {!isDarkMode && activeHolidaySeason !== "standard" && (
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl text-xs font-semibold bg-white/10 border border-white/20 text-white/90">
                <span>{holidayConfig.emoji}</span>
                <span>
                  {activeHolidaySeason === "wet_season"
                    ? "Drive safely in wet weather and take precautions during thunderstorms across all field routes!"
                    : activeHolidaySeason === "halloween"
                    ? "Wishing you a spooktacular, safe Halloween season across all field routes!"
                    : activeHolidaySeason === "christmas_eve"
                    ? "May the peaceful starlight of Christmas Eve brighten your dispatch operations!"
                    : activeHolidaySeason === "christmas"
                    ? "Warmest season's greetings, joyful holidays, and safe travels to all technicians!"
                    : "Celebrating new milestones and wishing all dispatch crews a Happy New Year!"}
                </span>
              </div>
            )}

            <p
              className={`text-xs leading-relaxed max-w-sm ${
                isDarkMode ? "text-[#D2FAD7]/90" : "text-[#EDF3E3]/80"
              }`}
            >
              Mission-critical dispatch and schedule compilation platform engineered for South Central field technicians. Transforms complex work order datasets into standardized, high-deliverability Outlook HTML emails with descending revision control and camera verification audits.
            </p>

            {/* Operational Status Pill */}
            <div className="flex items-center space-x-3 pt-1">
              <div
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs border ${
                  isDarkMode
                    ? "bg-[#00FF41]/15 border-[#00FF41]/40 text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.25)] font-mono"
                    : "bg-[#8AA66B]/20 border-[#CFE0B8]/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isDarkMode ? "bg-[#00FF41] shadow-[0_0_8px_#00FF41]" : "bg-[#8AA66B]"
                  }`}
                />
                <span
                  className={`font-semibold text-[11px] ${
                    isDarkMode ? "text-[#00FF41]" : "text-[#EDF3E3]"
                  }`}
                >
                  System Status: Operational
                </span>
              </div>
              {techniciansCount > 0 && (
                <div
                  className={`text-[11px] font-mono ${
                    isDarkMode ? "text-[#00FF41]/80" : "text-[#CFE0B8]/80"
                  }`}
                >
                  {techniciansCount} Techs &bull; {totalOrdersCount} Stops Loaded
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                isDarkMode ? "text-[#00FF41] font-mono" : "text-[#CFE0B8]"
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
              <span>Platform Modules</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className={`group transition-all duration-200 flex items-center space-x-1.5 cursor-pointer text-left bg-transparent border-0 p-0 transform hover:translate-x-1 ${
                    isDarkMode
                      ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                      : "text-[#EDF3E3]/80 hover:text-white"
                  }`}
                >
                  <span className="relative">
                    Operations Dashboard
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isDarkMode ? "bg-[#00FF41]" : "bg-[#CFE0B8]"
                      }`}
                    />
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onGoToGenerator}
                  className={`group transition-all duration-200 flex items-center space-x-1.5 cursor-pointer text-left bg-transparent border-0 p-0 transform hover:translate-x-1 ${
                    isDarkMode
                      ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                      : "text-[#EDF3E3]/80 hover:text-white"
                  }`}
                >
                  <Mail
                    className={`w-3 h-3 group-hover:scale-110 transition-transform ${
                      isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"
                    }`}
                  />
                  <span className="relative">
                    Outlook Email Generator
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isDarkMode ? "bg-[#00FF41]" : "bg-[#CFE0B8]"
                      }`}
                    />
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onGoToHistory}
                  className={`group transition-all duration-200 flex items-center space-x-1.5 cursor-pointer text-left bg-transparent border-0 p-0 transform hover:translate-x-1 ${
                    isDarkMode
                      ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                      : "text-[#EDF3E3]/80 hover:text-white"
                  }`}
                >
                  <History
                    className={`w-3 h-3 group-hover:rotate-45 transition-transform ${
                      isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]"
                    }`}
                  />
                  <span className="relative">
                    Saved Emails History ({savedEmailsCount})
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isDarkMode ? "bg-[#00FF41]" : "bg-[#CFE0B8]"
                      }`}
                    />
                  </span>
                </button>
              </li>
              {onGoToAlgTmc && (
                <li>
                  <button
                    type="button"
                    onClick={onGoToAlgTmc}
                    className={`group transition-all duration-200 flex items-center space-x-1.5 cursor-pointer text-left bg-transparent border-0 p-0 transform hover:translate-x-1 ${
                      isDarkMode
                        ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                        : "text-[#EDF3E3]/80 hover:text-white"
                    }`}
                  >
                    <FileText
                      className={`w-3 h-3 group-hover:scale-110 transition-transform ${
                        isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"
                      }`}
                    />
                    <span className="relative">
                      ALG/TMC Approval Scanner
                      <span
                        className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                          isDarkMode ? "bg-[#00FF41]" : "bg-[#CFE0B8]"
                        }`}
                      />
                    </span>
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`group transition-all duration-200 flex items-center space-x-1.5 cursor-pointer text-left bg-transparent border-0 p-0 transform hover:translate-x-1 ${
                    isDarkMode
                      ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                      : "text-[#EDF3E3]/80 hover:text-white"
                  }`}
                >
                  <Settings
                    className={`w-3 h-3 group-hover:rotate-90 transition-transform duration-300 ${
                      isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"
                    }`}
                  />
                  <span className="relative">
                    Branding &amp; Template Settings
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isDarkMode ? "bg-[#00FF41]" : "bg-[#CFE0B8]"
                      }`}
                    />
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAuditLogs}
                  className={`group transition-all duration-200 flex items-center space-x-1.5 cursor-pointer text-left bg-transparent border-0 p-0 transform hover:translate-x-1 ${
                    isDarkMode
                      ? "text-[#D2FAD7]/80 hover:text-[#00FF41]"
                      : "text-[#EDF3E3]/80 hover:text-white"
                  }`}
                >
                  <FileSpreadsheet
                    className={`w-3 h-3 group-hover:scale-110 transition-transform ${
                      isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]"
                    }`}
                  />
                  <span className="relative">
                    Dispatch Audit Trail
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isDarkMode ? "bg-[#00FF41]" : "bg-[#CFE0B8]"
                      }`}
                    />
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Operational Standards */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                isDarkMode ? "text-[#00FF41] font-mono" : "text-[#CFE0B8]"
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
              <span>South Central Specs</span>
            </h4>
            <ul
              className={`space-y-2 text-xs ${
                isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/80"
              }`}
            >
              <li className="flex items-start space-x-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"
                  }`}
                />
                <span>City of Dallas PEDS &amp; Sight Distance Support</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"
                  }`}
                />
                <span>LADOTD Special Project State Format</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"
                  }`}
                />
                <span>Airtable Individual Technician Route Sync</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"
                  }`}
                />
                <span>ALG / TMC Multi-Project Approvals</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"
                  }`}
                />
                <span>Sunday-to-Sunday 8-Day Week Support</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Compliance & Security */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                isDarkMode ? "text-[#00FF41] font-mono" : "text-[#CFE0B8]"
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
              <span>Compliance &amp; Data</span>
            </h4>
            <div
              className={`space-y-2 text-xs ${
                isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/80"
              }`}
            >
              <div
                className={`rounded-xl p-2.5 space-y-1 border ${
                  isDarkMode
                    ? "bg-[#08150D]/90 border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.08)]"
                    : "bg-[#EDF3E3]/5 border-[#CFE0B8]/20"
                }`}
              >
                <div
                  className={`font-bold text-[11px] flex items-center space-x-1 ${
                    isDarkMode ? "text-[#E0FFE5]" : "text-white"
                  }`}
                >
                  <Cpu className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                  <span>100% In-Browser Privacy</span>
                </div>
                <p
                  className={`text-[10px] leading-normal ${
                    isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/70"
                  }`}
                >
                  No CSV or technician customer data is transmitted to external servers. All processing runs entirely on client runtime.
                </p>
              </div>

              <div
                className={`rounded-xl p-2.5 space-y-1 border ${
                  isDarkMode
                    ? "bg-[#08150D]/90 border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.08)]"
                    : "bg-[#EDF3E3]/5 border-[#CFE0B8]/20"
                }`}
              >
                <div
                  className={`font-bold text-[11px] flex items-center space-x-1 ${
                    isDarkMode ? "text-[#E0FFE5]" : "text-white"
                  }`}
                >
                  <Mail className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                  <span>Outlook HTML Standard</span>
                </div>
                <p
                  className={`text-[10px] leading-normal ${
                    isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/70"
                  }`}
                >
                  Strict inline CSS styles ensure 100% layout fidelity across Outlook 2016, 2019, 2021, and Office 365 Web.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Subtle Watermark Developer Credit */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Copyright Notice */}
          <div
            className={`text-center sm:text-left space-y-0.5 ${
              isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/70"
            }`}
          >
            <p className="font-medium">
              &copy; {currentYear}{" "}
              <strong className={isDarkMode ? "text-[#00FF41] font-mono" : "text-white"}>
                Sch TechDispatch
              </strong>
              . All rights reserved.
            </p>
            <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/60" : "text-[#EDF3E3]/50"}`}>
              South Central Field Operations &bull; Dallas &bull; Houston &bull; Austin &bull; San Antonio &bull; Louisiana
            </p>
          </div>

          {/* Watermark-Style Developer Credit */}
          <div className="flex items-center space-x-2">
            <div
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md border select-none group cursor-default transition-all duration-300 ${
                isDarkMode
                  ? "border-[#00FF41]/30 bg-[#00FF41]/10 text-[#00FF41] opacity-75 hover:opacity-100 hover:shadow-[0_0_10px_rgba(0,255,65,0.3)] font-mono"
                  : "border-[#CFE0B8]/15 bg-[#CFE0B8]/5 opacity-35 hover:opacity-75"
              }`}
              title="Application Developer Credit"
            >
              <Code2
                className={`w-3 h-3 ${
                  isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]/60 group-hover:text-[#CFE0B8]"
                }`}
              />
              <span
                className={`text-[10px] font-mono tracking-widest uppercase ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : "text-[#CFE0B8]/80 group-hover:text-white"
                }`}
              >
                Dev: Patrick Franz O. B.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
