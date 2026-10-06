import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  HolidaySeasonId,
  HolidayThemeMode,
  HolidayThemeConfig,
  detectHolidaySeason,
  HOLIDAY_CONFIGS,
} from "../utils/holidayThemes";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
  matrixRainActive: boolean;
  toggleMatrixRain: () => void;
  setMatrixRainActive: (val: boolean) => void;
  // Holiday Season Theme State (Active in Light Mode only)
  holidayMode: HolidayThemeMode;
  setHolidayMode: (mode: HolidayThemeMode) => void;
  activeHolidaySeason: HolidaySeasonId;
  holidayConfig: HolidayThemeConfig;
  holidayAnimationActive: boolean;
  toggleHolidayAnimation: () => void;
  setHolidayAnimationActive: (val: boolean) => void;
}

const LOCAL_STORAGE_KEY_THEME = "nds_matrix_dark_mode";
const LOCAL_STORAGE_KEY_RAIN = "nds_matrix_rain_active";
const LOCAL_STORAGE_KEY_HOLIDAY_MODE = "nds_holiday_theme_mode";
const LOCAL_STORAGE_KEY_HOLIDAY_ANIM = "nds_holiday_anim_active";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Dark Mode State
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      if (saved !== null) {
        return saved === "true";
      }
      return false;
    } catch {
      return false;
    }
  });

  // 2. Matrix Rain State (for dark mode)
  const [matrixRainActive, setMatrixRainActiveState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RAIN);
      if (saved !== null) {
        return saved === "true";
      }
      return true;
    } catch {
      return true;
    }
  });

  // 3. Holiday Theme Selection Mode ('auto' follows calendar date, or explicit override)
  const [holidayMode, setHolidayModeState] = useState<HolidayThemeMode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HOLIDAY_MODE) as HolidayThemeMode | null;
      if (saved && ["auto", "standard", "wet_season", "halloween", "christmas_eve", "christmas", "new_year"].includes(saved)) {
        return saved;
      }
      return "auto"; // Default to automatic calendar-based season detection
    } catch {
      return "auto";
    }
  });

  // 4. Holiday Animation Toggle (on by default)
  const [holidayAnimationActive, setHolidayAnimationActiveState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HOLIDAY_ANIM);
      if (saved !== null) {
        return saved === "true";
      }
      return true;
    } catch {
      return true;
    }
  });

  // Compute active holiday season
  const activeHolidaySeason: HolidaySeasonId = useMemo(() => {
    if (holidayMode === "auto") {
      return detectHolidaySeason(new Date());
    }
    return holidayMode;
  }, [holidayMode]);

  const holidayConfig = useMemo(() => {
    return HOLIDAY_CONFIGS[activeHolidaySeason] || HOLIDAY_CONFIGS.standard;
  }, [activeHolidaySeason]);

  // Effect: Sync theme classes to HTML document root and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Clean previous holiday theme classes
    const allHolidayClasses = [
      "theme-standard",
      "theme-wet-season",
      "theme-halloween",
      "theme-christmas-eve",
      "theme-christmas",
      "theme-new-year",
    ];
    root.classList.remove(...allHolidayClasses);
    body.classList.remove(...allHolidayClasses);

    if (isDarkMode) {
      // Dark Mode (Matrix) takes full priority, removing light holiday classes
      root.classList.add("dark", "matrix-theme");
      body.classList.add("dark", "matrix-theme");
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, "true");
      } catch {}
    } else {
      // Light Mode: Apply Holiday Theme design classes
      root.classList.remove("dark", "matrix-theme");
      body.classList.remove("dark", "matrix-theme");
      root.classList.add(holidayConfig.themeClass);
      body.classList.add(holidayConfig.themeClass);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, "false");
      } catch {}
    }
  }, [isDarkMode, holidayConfig]);

  // Save rain setting
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_RAIN, matrixRainActive ? "true" : "false");
    } catch {}
  }, [matrixRainActive]);

  // Save holiday settings
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HOLIDAY_MODE, holidayMode);
    } catch {}
  }, [holidayMode]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HOLIDAY_ANIM, holidayAnimationActive ? "true" : "false");
    } catch {}
  }, [holidayAnimationActive]);

  const toggleDarkMode = () => {
    setIsDarkModeState((prev) => !prev);
  };

  const setDarkMode = (val: boolean) => {
    setIsDarkModeState(val);
  };

  const toggleMatrixRain = () => {
    setMatrixRainActiveState((prev) => !prev);
  };

  const setMatrixRainActive = (val: boolean) => {
    setMatrixRainActiveState(val);
  };

  const setHolidayMode = (mode: HolidayThemeMode) => {
    setHolidayModeState(mode);
    // Automatically auto-play animations per theme by default
    setHolidayAnimationActiveState(true);
  };

  const toggleHolidayAnimation = () => {
    setHolidayAnimationActiveState((prev) => !prev);
  };

  const setHolidayAnimationActive = (val: boolean) => {
    setHolidayAnimationActiveState(val);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        matrixRainActive,
        toggleMatrixRain,
        setMatrixRainActive,
        holidayMode,
        setHolidayMode,
        activeHolidaySeason,
        holidayConfig,
        holidayAnimationActive,
        toggleHolidayAnimation,
        setHolidayAnimationActive,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
