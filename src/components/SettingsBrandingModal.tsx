import React, { useState, useEffect } from "react";
import { X, Settings, Building, Phone, Mail, Palette, CheckSquare, ShieldCheck, Check, Users, ExternalLink, Search, FileSignature, Sparkles } from "lucide-react";
import { TemplateBranding, EmailSignaturePresetId } from "../types";
import { HARDCODED_TECHNICIAN_ROSTER } from "../utils/technicianRosterDirectory";
import {
  EMAIL_SIGNATURE_PRESETS,
  SIGNATURE_PRESET_OPTIONS,
  getEffectiveSignature,
  renderEmailSignatureHtml,
} from "../utils/signaturePresets";
import { useTheme } from "../context/ThemeContext";

interface SettingsBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: TemplateBranding;
  onSaveBranding: (newBranding: TemplateBranding) => void;
}

export const SettingsBrandingModal: React.FC<SettingsBrandingModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSaveBranding,
}) => {
  const {
    isDarkMode,
    holidayMode,
    setHolidayMode,
    activeHolidaySeason,
    holidayConfig,
    holidayAnimationActive,
    toggleHolidayAnimation,
  } = useTheme();

  const [form, setForm] = useState<TemplateBranding>({ ...branding });
  const [rosterSearch, setRosterSearch] = useState("");

  // Sync state whenever the modal opens or branding prop updates
  useEffect(() => {
    if (isOpen) {
      setForm({ ...branding });
      setRosterSearch("");
    }
  }, [isOpen, branding]);

  if (!isOpen) return null;

  const handleChange = (key: keyof TemplateBranding, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    onSaveBranding(form);
    onClose();
  };

  const COLOR_PRESETS = [
    { name: "Outlook Blue", hex: "#0078D4" },
    { name: "Classic Navy", hex: "#0F172A" },
    { name: "Emerald", hex: "#0F766E" },
    { name: "Amber Orange", hex: "#D97706" },
    { name: "Crimson", hex: "#DC2626" },
  ];

  const filteredRoster = HARDCODED_TECHNICIAN_ROSTER.filter(
    (t) =>
      t.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      t.aliases.some((a) => a.toLowerCase().includes(rosterSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isDarkMode
            ? "bg-[#08150D] border-[#00FF41]/40 shadow-[0_0_30px_rgba(0,255,65,0.2)] text-[#D2FAD7]"
            : activeHolidaySeason === "halloween"
            ? "bg-white border-orange-300 text-stone-900 shadow-orange-950/20"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white border-blue-300 text-slate-900 shadow-blue-950/20"
            : activeHolidaySeason === "christmas"
            ? "bg-white border-emerald-300 text-stone-900 shadow-emerald-950/20"
            : activeHolidaySeason === "new_year"
            ? "bg-white border-amber-300 text-stone-900 shadow-amber-950/20"
            : "bg-white border-[#CFE0B8] text-[#3F4A33]"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b transition-colors ${
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
              className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs ${
                isDarkMode
                  ? "bg-[#00FF41]/20 border-[#00FF41]/40 text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-500/20 border-orange-400/50 text-orange-200"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-amber-400/20 border-amber-300/50 text-amber-200"
                  : activeHolidaySeason === "christmas"
                  ? "bg-red-500/20 border-red-400/50 text-red-200"
                  : activeHolidaySeason === "new_year"
                  ? "bg-yellow-400/20 border-yellow-300/50 text-yellow-200"
                  : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
              }`}
            >
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Outlook Template &amp; Dispatcher Settings</h2>
              <p className={`text-xs ${isDarkMode ? "text-[#D2FAD7]/80" : "text-white/80"}`}>
                Configure company branding, holiday theme selector, and safety options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/15"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className={`p-6 overflow-y-auto space-y-5 flex-1 text-xs ${isDarkMode ? "bg-[#08150D]" : "bg-white"}`}>
          {/* Section: Organization & Dispatcher Info */}
          <div className="space-y-3">
            <h3
              className={`font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px] ${
                isDarkMode ? "text-[#00FF41]" : "text-zinc-900"
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Company &amp; Dispatcher Signature</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Dispatcher / Sender Name
                </label>
                <input
                  type="text"
                  value={form.dispatcherName}
                  onChange={(e) => handleChange("dispatcherName", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Reply-To Email Address
                </label>
                <input
                  type="email"
                  value={form.replyToEmail}
                  onChange={(e) => handleChange("replyToEmail", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Dispatch Support Phone
                </label>
                <input
                  type="text"
                  value={form.supportPhone}
                  onChange={(e) => handleChange("supportPhone", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section: External Links & Upload Channels (for Exact Schedule Template) */}
          <div className={`space-y-3 pt-3 border-t ${isDarkMode ? "border-[#00FF41]/20" : "border-zinc-200"}`}>
            <h3
              className={`font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px] ${
                isDarkMode ? "text-[#00FF41]" : "text-zinc-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Airtable, Maps &amp; Field Photo Links</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Airtable View Base URL
                </label>
                <input
                  type="text"
                  placeholder="https://airtable.com/appYourAirtableBase"
                  value={form.airtableBaseUrl || ""}
                  onChange={(e) => handleChange("airtableBaseUrl", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41] placeholder:text-[#D2FAD7]/40"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Google Maps Routing URL
                </label>
                <input
                  type="text"
                  placeholder="https://maps.google.com"
                  value={form.googleMapsBaseUrl || ""}
                  onChange={(e) => handleChange("googleMapsBaseUrl", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41] placeholder:text-[#D2FAD7]/40"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Photo Upload URL
                </label>
                <input
                  type="text"
                  placeholder="https://airtable.com/appsVo4SWcGXTkarK/shrBgw2x5NJZwU3Xo"
                  value={form.photoUploadUrl || ""}
                  onChange={(e) => handleChange("photoUploadUrl", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41] placeholder:text-[#D2FAD7]/40"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Photo Upload Link Text
                </label>
                <input
                  type="text"
                  placeholder="South Central Job Photos"
                  value={form.photoUploadLinkText || ""}
                  onChange={(e) => handleChange("photoUploadLinkText", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41] placeholder:text-[#D2FAD7]/40"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`font-medium block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                  Data Transfer Upload Email (FileZilla / Reports)
                </label>
                <input
                  type="email"
                  placeholder="jobs@ndsdata.com"
                  value={form.dataUploadEmail || ""}
                  onChange={(e) => handleChange("dataUploadEmail", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41] placeholder:text-[#D2FAD7]/40"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section: Outlook Accent Styling */}
          <div className={`space-y-3 pt-3 border-t ${isDarkMode ? "border-[#00FF41]/20" : "border-zinc-200"}`}>
            <h3
              className={`font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px] ${
                isDarkMode ? "text-[#00FF41]" : "text-zinc-900"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme &amp; Brand Accent Colors</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => handleChange("primaryColor", color.hex)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                    form.primaryColor === color.hex
                      ? isDarkMode
                        ? "border-[#00FF41] bg-[#00FF41]/20 text-[#00FF41] font-bold shadow-[0_0_8px_rgba(0,255,65,0.25)] font-mono"
                        : "border-zinc-900 bg-zinc-900 text-white font-semibold"
                      : isDarkMode
                      ? "border-[#00FF41]/30 bg-[#040906] text-[#D2FAD7] hover:border-[#00FF41]"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color.hex }}></span>
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Holiday Season Themes & Animations (Light Mode) */}
          <div className={`space-y-3.5 pt-3.5 border-t ${isDarkMode ? "border-[#00FF41]/20" : "border-zinc-200"}`}>
            <div className="flex items-center justify-between">
              <h3
                className={`font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px] ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "text-orange-700"
                    : activeHolidaySeason === "christmas_eve"
                    ? "text-amber-700"
                    : activeHolidaySeason === "christmas"
                    ? "text-red-700"
                    : activeHolidaySeason === "new_year"
                    ? "text-amber-700"
                    : "text-zinc-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Holiday Season Themes &amp; Animations</span>
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isDarkMode
                    ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 font-mono"
                    : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                }`}
              >
                {isDarkMode ? "Dark Matrix Mode Active" : "Light Mode Themes"}
              </span>
            </div>

            <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
              Choose your seasonal theme below. Dynamic holiday wallpapers, custom animations (falling leaves &amp; distinguishable flying bats, snowflakes, floating gifts, champagne bubbles &amp; confetti), and color palettes apply across every part of the application.
            </p>

            {/* Direct Theme Dropdown Selector (Integrated into Settings) */}
            <div
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/30"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-50/70 border-orange-200"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-50/70 border-blue-200"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-50/70 border-emerald-200"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-50/70 border-amber-200"
                  : "bg-stone-50 border-stone-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{holidayConfig.emoji}</span>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{holidayConfig.name} Theme</span>
                    {holidayMode === "auto" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 uppercase tracking-tighter">
                        Auto-Detected
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                    {holidayConfig.dateRangeText}
                  </span>
                </div>
              </div>

              {/* Theme Dropdown Menu */}
              <div className="flex items-center space-x-2">
                <label htmlFor="theme-dropdown-select" className="sr-only">
                  Theme Selector
                </label>
                <select
                  id="theme-dropdown-select"
                  value={holidayMode}
                  onChange={(e) => setHolidayMode(e.target.value as any)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 ${
                    isDarkMode
                      ? "bg-[#08150D] text-[#E0FFE5] border-[#00FF41]/40 focus:ring-[#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-white text-orange-950 border-orange-300 focus:ring-orange-500"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-white text-blue-950 border-blue-300 focus:ring-blue-500"
                      : activeHolidaySeason === "christmas"
                      ? "bg-white text-emerald-950 border-emerald-300 focus:ring-emerald-500"
                      : activeHolidaySeason === "new_year"
                      ? "bg-white text-amber-950 border-amber-300 focus:ring-amber-500"
                      : "bg-white text-zinc-800 border-zinc-300 focus:ring-zinc-800"
                  }`}
                >
                  <option value="auto">📅 Auto (Calendar Date Detection)</option>
                  <option value="wet_season">⛈️ Wet Season Theme (Aug 1 - Oct 29 Rain &amp; Lightning)</option>
                  <option value="halloween">🎃 Halloween Theme (Haunted Castle &amp; Bats)</option>
                  <option value="christmas_eve">🕯️ Christmas Eve Theme (Starry Snow)</option>
                  <option value="christmas">🎄 Christmas Theme (Falling Gifts &amp; Snow)</option>
                  <option value="new_year">✨ New Year Theme (Confetti &amp; Sparkles)</option>
                  <option value="standard">🌿 Standard NDS Sage (Classic Olive)</option>
                </select>
              </div>
            </div>

            {/* Quick-Pick Season Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                { id: "auto", label: "Auto Detect", sub: `Keyed to calendar (${holidayConfig.emoji})`, emoji: "📅" },
                { id: "wet_season", label: "Wet Season", sub: "Rain, Drops & Lightning", emoji: "⛈️" },
                { id: "halloween", label: "Halloween", sub: "Haunted & Flying Bats", emoji: "🎃" },
                { id: "christmas_eve", label: "Christmas Eve", sub: "Starry Twilight & Snow", emoji: "🕯️" },
                { id: "christmas", label: "Christmas", sub: "Falling Snow & Gifts", emoji: "🎄" },
                { id: "new_year", label: "New Year", sub: "Champagne & Fireworks", emoji: "✨" },
                { id: "standard", label: "Standard Palette", sub: "Default NDS Sage", emoji: "🌿" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setHolidayMode(s.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center space-x-2.5 ${
                    holidayMode === s.id
                      ? isDarkMode
                        ? "border-[#00FF41] bg-[#00FF41]/20 text-[#00FF41] font-bold shadow-[0_0_10px_rgba(0,255,65,0.25)]"
                        : activeHolidaySeason === "halloween"
                        ? "border-orange-500 bg-orange-100 text-orange-950 font-bold shadow-xs ring-1 ring-orange-400"
                        : activeHolidaySeason === "christmas_eve"
                        ? "border-amber-500 bg-amber-100 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400"
                        : activeHolidaySeason === "christmas"
                        ? "border-red-500 bg-red-100 text-red-950 font-bold shadow-xs ring-1 ring-red-400"
                        : activeHolidaySeason === "new_year"
                        ? "border-amber-500 bg-amber-100 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400"
                        : "border-[#8AA66B] bg-[#EDF3E3] text-[#3F4A33] font-bold shadow-xs"
                      : isDarkMode
                      ? "border-[#00FF41]/30 bg-[#040906] text-[#D2FAD7] hover:border-[#00FF41]/60"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <span className="text-xl shrink-0">{s.emoji}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate">{s.label}</span>
                    <span className="text-[10px] opacity-75 block truncate">{s.sub}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Animation Auto-Play Info & Toggle */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/20 text-[#D2FAD7]"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700"
              }`}
            >
              <div>
                <span className="text-xs font-bold block">
                  Theme Animation Auto-Play
                </span>
                <p className="text-[11px] opacity-75">
                  Animations auto-play by default on theme change. You can pause or resume anytime.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleHolidayAnimation}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-2xs ${
                  holidayAnimationActive
                    ? isDarkMode
                      ? "bg-[#00FF41] text-[#040906] font-mono shadow-[0_0_10px_#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-600 hover:bg-orange-500 text-white"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : activeHolidaySeason === "christmas"
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
                    : isDarkMode
                    ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                <span>{holidayAnimationActive ? "Playing (Auto)" : "Paused"}</span>
              </button>
            </div>
          </div>

          {/* Section: Email Content Features */}
          <div className={`space-y-3 pt-3 border-t ${isDarkMode ? "border-[#00FF41]/20" : "border-zinc-200"}`}>
            <h3
              className={`font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px] ${
                isDarkMode ? "text-[#00FF41]" : "text-zinc-900"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Email Content Controls</span>
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includeMapLinks}
                  onChange={(e) => handleChange("includeMapLinks", e.target.checked)}
                  className={`w-4 h-4 rounded ${isDarkMode ? "accent-[#00FF41]" : "text-blue-600"}`}
                />
                <span className={`font-medium ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-800"}`}>
                  Include Google Maps GPS links for all service addresses
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includeChecklist}
                  onChange={(e) => handleChange("includeChecklist", e.target.checked)}
                  className={`w-4 h-4 rounded ${isDarkMode ? "accent-[#00FF41]" : "text-blue-600"}`}
                />
                <span className={`font-medium ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-800"}`}>
                  Attach Pre-Shift Field &amp; Vehicle Safety Checklist in footer
                </span>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!form.useAnytimeTeardowns}
                  onChange={(e) => handleChange("useAnytimeTeardowns", e.target.checked)}
                  className={`w-4 h-4 rounded mt-0.5 ${isDarkMode ? "accent-[#00FF41]" : "text-amber-600"}`}
                />
                <div>
                  <span className={`font-medium block ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>
                    (Anytime) Teardown Scheduling Mode
                  </span>
                  <span className={`text-[11px] block ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                    When enabled, only teardowns with 0:30 time are scheduled on their exact Teardown After date and labeled as &ldquo;Anytime&rdquo; (at the top of the day&apos;s teardowns). Other teardowns (such as 14:00, 19:00) keep their specific time notes. When disabled, 0:30 midnight teardowns are automatically scheduled on the previous day.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!form.ladotdExclusive}
                  onChange={(e) => handleChange("ladotdExclusive", e.target.checked)}
                  className={`w-4 h-4 rounded mt-0.5 ${isDarkMode ? "accent-[#00FF41]" : "text-emerald-600"}`}
                />
                <div>
                  <span className={`font-medium block ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>
                    LADOTD Exclusive Mode
                  </span>
                  <span className={`text-[11px] block ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                    When enabled, for project number 26-240026 formats lines as &ldquo;Install: ALG 26-240026 Volume &lt;Parish&gt; (Camera Counts) (Work Week 32) &lt;No. Days&gt; collection&rdquo; with 3-4 digit location suffixes (e.g. • 5666 1 camera). Parish is scanned from &ldquo;Different County (from Locations)&rdquo; and collection duration is scanned from &ldquo;Schedule Details&rdquo;.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!form.codExclusive}
                  onChange={(e) => handleChange("codExclusive", e.target.checked)}
                  className={`w-4 h-4 rounded mt-0.5 ${isDarkMode ? "accent-[#00FF41]" : "text-teal-600"}`}
                />
                <div className="flex-1">
                  <span className={`font-medium flex items-center space-x-1.5 ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>
                    <span>City of Dallas (COD Exclusive) Mode</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        isDarkMode
                          ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                          : "bg-teal-100 text-teal-900 border-teal-300"
                      }`}
                    >
                      COD Exclusive
                    </span>
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                    When enabled, provides modal selection for Conduct Sight Distance teardown lines on Peds studies with City of Dallas List notes, and includes the School Zone PED Count Site Data Form header link.
                  </span>

                  {form.codExclusive && (
                    <div
                      className={`mt-2.5 p-2.5 rounded-xl border space-y-2 ${
                        isDarkMode
                          ? "bg-[#0C1E12] border-[#00FF41]/35 text-[#D2FAD7]"
                          : "bg-purple-50/70 border-purple-200"
                      }`}
                    >
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.codSchoolZonePedFormEnabled !== false}
                          onChange={(e) => handleChange("codSchoolZonePedFormEnabled", e.target.checked)}
                          className={`w-3.5 h-3.5 rounded ${isDarkMode ? "accent-[#00FF41]" : "text-purple-600"}`}
                        />
                        <span className={`text-xs font-semibold ${isDarkMode ? "text-[#E0FFE5]" : "text-purple-950"}`}>
                          Include &ldquo;📝 School Zone PED Count Site Data Form&rdquo; link in Header Links
                        </span>
                      </label>

                      {form.codSchoolZonePedFormEnabled !== false && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className={`text-[10px] font-bold block mb-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                              Link Text
                            </label>
                            <input
                              type="text"
                              value={form.codSchoolZonePedFormText || "School Zone PED Count Site Data Form"}
                              onChange={(e) => handleChange("codSchoolZonePedFormText", e.target.value)}
                              className={`w-full px-2 py-1 rounded text-xs border ${
                                isDarkMode
                                  ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5]"
                                  : "bg-white border-zinc-300 text-zinc-800"
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`text-[10px] font-bold block mb-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
                              Google Form URL
                            </label>
                            <input
                              type="url"
                              value={form.codSchoolZonePedFormUrl || "https://docs.google.com/forms/d/e/1FAIpQLSdfpvqvsfjC8gA8gKoByJdu1CQafOhvTP_gWMQvItjEvcprMg/viewform"}
                              onChange={(e) => handleChange("codSchoolZonePedFormUrl", e.target.value)}
                              className={`w-full px-2 py-1 rounded text-xs font-mono border ${
                                isDarkMode
                                  ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5]"
                                  : "bg-white border-zinc-300 text-zinc-800"
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!form.additionalNotesEnabled}
                  onChange={(e) => handleChange("additionalNotesEnabled", e.target.checked)}
                  className={`w-4 h-4 rounded mt-0.5 ${isDarkMode ? "accent-[#00FF41]" : "text-emerald-600"}`}
                />
                <div>
                  <span className={`font-medium block ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>
                    Additional Notes Feature
                  </span>
                  <span className={`text-[11px] block ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                    When enabled, provides day-specific custom notes placed before the task lines, highlighted with a bright green background and styled in black bold italic text.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!form.sundaySundayEnabled}
                  onChange={(e) => handleChange("sundaySundayEnabled", e.target.checked)}
                  className={`w-4 h-4 rounded mt-0.5 ${isDarkMode ? "accent-[#00FF41]" : "text-cyan-600"}`}
                />
                <div>
                  <span className={`font-medium block ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>
                    Sunday - Sunday 8-Day Schedule Mode
                  </span>
                  <span className={`text-[11px] block ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                    When enabled, extends the weekly schedule view to Sunday through Sunday, adding a second Sunday after Saturday with dates for both the Upper Sunday and Lower Sunday (e.g., Sunday 08/23/2026 to Sunday 08/30/2026).
                  </span>
                </div>
              </label>

              {/* Email Signature Feature */}
              <div className={`pt-2 border-t ${isDarkMode ? "border-[#00FF41]/20" : "border-zinc-100"}`}>
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.emailSignatureEnabled}
                    onChange={(e) => handleChange("emailSignatureEnabled", e.target.checked)}
                    className={`w-4 h-4 rounded mt-0.5 ${isDarkMode ? "accent-[#00FF41]" : "text-blue-600"}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium block ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>
                        Email Signature Toggle Feature
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          isDarkMode
                            ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                            : "bg-sky-100 text-sky-900 border-sky-300"
                        }`}
                      >
                        Signature
                      </span>
                    </div>
                    <span className={`text-[11px] block mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                      When enabled, automatically appends the selected sender signature to the bottom of the email schedule.
                    </span>

                    {/* Presets Picker (James, Kyle, Patrick, Katrin) */}
                    <div className="mt-2.5 space-y-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? "text-[#00FF41]" : "text-zinc-700"}`}>
                        Choose Sender Preset:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SIGNATURE_PRESET_OPTIONS.map((preset) => {
                          const isSelected = (form.emailSignaturePreset || "patrick") === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                handleChange("emailSignaturePreset", preset.id);
                                handleChange("emailSignatureEnabled", true);
                              }}
                              className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                                isSelected
                                  ? isDarkMode
                                    ? "border-[#00FF41] bg-[#00FF41]/20 text-[#00FF41] font-bold ring-1 ring-[#00FF41] font-mono shadow-[0_0_8px_rgba(0,255,65,0.25)]"
                                    : "border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-500"
                                  : isDarkMode
                                  ? "border-[#00FF41]/30 bg-[#040906] text-[#D2FAD7] hover:border-[#00FF41]"
                                  : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs">{preset.label}</span>
                                {isSelected && <Check className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-blue-600"}`} />}
                              </div>
                              <span className={`text-[9px] block truncate mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                                {preset.desc.split(" - ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Small Live Preview in Settings Modal */}
                      <div className="p-3 bg-white text-black border border-zinc-200 rounded-lg mt-2 shadow-2xs outlook-body-wrapper">
                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          Signature Preview (Styled as per photo)
                        </div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderEmailSignatureHtml(getEffectiveSignature(form)),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section: Technician Airtable Links Directory */}
          <div className={`space-y-3 pt-3 border-t ${isDarkMode ? "border-[#00FF41]/20" : "border-zinc-200"}`}>
            <div className="flex items-center justify-between">
              <h3
                className={`font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px] ${
                  isDarkMode ? "text-[#00FF41]" : "text-zinc-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Hardcoded Technician Airtable Links ({HARDCODED_TECHNICIAN_ROSTER.length})</span>
              </h3>
              <div className="relative w-44">
                <Search className={`w-3 h-3 absolute left-2 top-2 ${isDarkMode ? "text-[#00FF41]" : "text-zinc-400"}`} />
                <input
                  type="text"
                  placeholder="Filter roster..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className={`w-full pl-6 pr-2 py-1 rounded-md text-[11px] focus:outline-hidden border ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-1 focus:ring-[#00FF41]"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  }`}
                />
              </div>
            </div>

            <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
              When an email is generated for any scanned technician matching the roster below, their specific Airtable link is automatically embedded into the greeting header link.
            </p>

            <div
              className={`max-h-48 overflow-y-auto border rounded-lg divide-y ${
                isDarkMode
                  ? "border-[#00FF41]/30 bg-[#040906] divide-[#00FF41]/15"
                  : "border-zinc-200 bg-zinc-50/50 divide-zinc-200"
              }`}
            >
              {filteredRoster.map((item) => (
                <div
                  key={item.name}
                  className={`p-2 flex items-center justify-between gap-2 transition text-[11px] ${
                    isDarkMode ? "hover:bg-[#00FF41]/10" : "hover:bg-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className={`font-semibold ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>{item.name}</span>
                    <span className={`ml-2 font-mono text-[10px] truncate block ${isDarkMode ? "text-[#D2FAD7]/60" : "text-zinc-400"}`}>
                      {item.airtableLink}
                    </span>
                  </div>
                  <a
                    href={item.airtableLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`shrink-0 inline-flex items-center space-x-1 px-2 py-1 rounded border text-[10px] font-medium transition ${
                      isDarkMode
                        ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/25 font-mono"
                        : "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-200"
                    }`}
                  >
                    <span>Test</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Safety Disclaimer */}
          <div className={`space-y-2 pt-3 border-t ${isDarkMode ? "border-[#00FF41]/20" : "border-zinc-200"}`}>
            <label className={`font-medium block ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"}`}>
              Custom Field Safety Disclaimer / Notice
            </label>
            <textarea
              rows={2}
              value={form.customDisclaimer}
              onChange={(e) => handleChange("customDisclaimer", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-hidden focus:ring-2 ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                  : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              }`}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-end space-x-3 transition-colors ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/30"
              : activeHolidaySeason === "halloween"
              ? "bg-orange-50/80 border-orange-200"
              : activeHolidaySeason === "christmas_eve"
              ? "bg-blue-50/80 border-blue-200"
              : activeHolidaySeason === "christmas"
              ? "bg-emerald-50/80 border-emerald-200"
              : activeHolidaySeason === "new_year"
              ? "bg-amber-50/80 border-amber-200"
              : "bg-[#FBF7F0] border-[#CFE0B8]"
          }`}
        >
          <button
            onClick={onClose}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer border ${
              isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10 border-[#00FF41]/30"
                : activeHolidaySeason === "halloween"
                ? "text-stone-700 hover:bg-orange-100/60 border-orange-300"
                : activeHolidaySeason === "christmas_eve"
                ? "text-stone-700 hover:bg-blue-100/60 border-blue-300"
                : activeHolidaySeason === "christmas"
                ? "text-stone-700 hover:bg-emerald-100/60 border-emerald-300"
                : activeHolidaySeason === "new_year"
                ? "text-stone-700 hover:bg-amber-100/60 border-amber-300"
                : "text-[#3F4A33] hover:bg-[#EDF3E3] border-[#CFE0B8]"
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
                ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-700/30"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
