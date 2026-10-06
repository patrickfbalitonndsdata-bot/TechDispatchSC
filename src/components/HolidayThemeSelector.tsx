import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Calendar, Check, Play, Pause, ChevronDown, Wand2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { HolidayThemeMode, HOLIDAY_CONFIGS, HolidaySeasonId } from "../utils/holidayThemes";

export const HolidayThemeSelector: React.FC = () => {
  const {
    isDarkMode,
    holidayMode,
    setHolidayMode,
    activeHolidaySeason,
    holidayConfig,
    holidayAnimationActive,
    toggleHolidayAnimation,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // If in dark mode, we do not show holiday theme switcher in the primary navbar spot (since dark mode is active)
  // or we can show a compact version indicating light mode holiday settings.
  if (isDarkMode) return null;

  const seasonsList: Array<{ id: HolidaySeasonId; label: string; dateRange: string; emoji: string }> = [
    { id: "wet_season", label: "Wet Season", dateRange: "Aug 1 – Oct 29 (Rain & Lightning)", emoji: "⛈️" },
    { id: "halloween", label: "Halloween", dateRange: "Oct 30 – Nov 30", emoji: "🎃" },
    { id: "christmas_eve", label: "Christmas Eve", dateRange: "Dec 22 – Dec 24", emoji: "🕯️" },
    { id: "christmas", label: "Christmas", dateRange: "Whole Dec (excl. 22-24)", emoji: "🎄" },
    { id: "new_year", label: "New Year", dateRange: "Jan 1 – Jan 15", emoji: "✨" },
    { id: "standard", label: "Standard NDS", dateRange: "Default Olive/Sage", emoji: "🌿" },
  ];

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div className="flex items-center bg-black/20 rounded-xl p-0.5 border border-white/15 backdrop-blur-xs shadow-xs">
        {/* Main Seasonal Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer text-white hover:bg-white/10"
          title={`Active Theme: ${holidayConfig.name} (${holidayMode === "auto" ? "Calendar Auto-Detect" : "Manual Preview"})`}
        >
          <span className="text-sm group-hover:scale-115 transition-transform duration-200">
            {holidayConfig.emoji}
          </span>
          <span className="hidden lg:inline text-[11px] font-semibold tracking-wide">
            {holidayConfig.name}
          </span>
          {holidayMode === "auto" && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white border border-white/30 uppercase tracking-tighter">
              Auto
            </span>
          )}
          <ChevronDown
            className={`w-3 h-3 text-white/70 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
            }`}
          />
        </button>

        {/* Animation Pause/Play Quick Toggle Button (if holiday theme has active animation) */}
        {activeHolidaySeason !== "standard" && (
          <button
            type="button"
            onClick={toggleHolidayAnimation}
            className={`p-1.5 rounded-md transition-colors cursor-pointer text-xs ${
              holidayAnimationActive
                ? "text-amber-200 hover:text-white hover:bg-white/15"
                : "text-white/40 hover:text-white/80 hover:bg-white/10"
            }`}
            title={
              holidayAnimationActive
                ? `Pause ${holidayConfig.name} Falling Animation`
                : `Resume ${holidayConfig.name} Falling Animation`
            }
          >
            {holidayAnimationActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Seasonal Themes Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 rounded-2xl shadow-2xl z-50 py-2.5 px-3 bg-white/95 backdrop-blur-md border border-stone-200 text-stone-800 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-xs text-stone-900">Holiday Seasons &amp; Animations</span>
            </div>
            <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full font-medium">
              Light Mode Only
            </span>
          </div>

          <p className="text-[11px] text-stone-600 leading-snug mb-3">
            Automatic seasonal backgrounds, animations, and color palettes keyed to calendar dates.
          </p>

          {/* Option: Auto Date Mode */}
          <div className="mb-2">
            <button
              type="button"
              onClick={() => {
                setHolidayMode("auto");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer border ${
                holidayMode === "auto"
                  ? "bg-amber-50/80 border-amber-300 text-amber-900 font-bold shadow-2xs"
                  : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold">Auto (Calendar Dates)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      Recommended
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-600 block">
                    Currently matches: <strong className="text-stone-800">{HOLIDAY_CONFIGS[activeHolidaySeason].emoji} {HOLIDAY_CONFIGS[activeHolidaySeason].name}</strong>
                  </span>
                </div>
              </div>
              {holidayMode === "auto" && <Check className="w-4 h-4 text-amber-600" />}
            </button>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600 px-1 py-1 flex items-center space-x-1">
            <Wand2 className="w-3 h-3 text-stone-600" />
            <span>Preview or Force Seasonal Design</span>
          </div>

          {/* List of Holiday Themes */}
          <div className="space-y-1">
            {seasonsList.map((season) => {
              const isSelected = holidayMode === season.id;
              const isCurrentlyActive = activeHolidaySeason === season.id;
              return (
                <button
                  key={season.id}
                  type="button"
                  onClick={() => {
                    setHolidayMode(season.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-stone-900 text-white border-stone-900 font-bold shadow-xs"
                      : "bg-white hover:bg-stone-50 text-stone-800 border-stone-100 hover:border-stone-200"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{season.emoji}</span>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold">{season.label}</span>
                        {isCurrentlyActive && holidayMode !== season.id && (
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Current Date
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] block ${
                          isSelected ? "text-stone-300" : "text-stone-600"
                        }`}
                      >
                        {season.dateRange}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Animation Controls footer in popover */}
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span className="text-[11px] font-medium">Holiday Canvas Animation:</span>
            <button
              type="button"
              onClick={toggleHolidayAnimation}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                holidayAnimationActive
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-stone-200 text-stone-600 hover:bg-stone-300"
              }`}
            >
              {holidayAnimationActive ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-600" />
                  <span>Enabled</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-stone-500" />
                  <span>Paused</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
