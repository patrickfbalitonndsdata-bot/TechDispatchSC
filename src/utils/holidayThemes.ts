import halloweenBg from "../assets/images/haunted_castle_cemetery_bg_1790950203881.jpg";
import xmasEveBg from "../assets/images/xmas_eve_bg_1790863368702.jpg";
import christmasBg from "../assets/images/christmas_light_bg_1790863381002.jpg";
import newYearBg from "../assets/images/new_year_bg_1790863394137.jpg";
import wetSeasonBg from "../assets/images/wet_season_bg_1791305549083.jpg";

export type HolidaySeasonId = "standard" | "wet_season" | "halloween" | "christmas_eve" | "christmas" | "new_year";

export type HolidayThemeMode = "auto" | HolidaySeasonId;

export interface HolidayThemeConfig {
  id: HolidaySeasonId;
  name: string;
  emoji: string;
  badgeLabel: string;
  dateRangeText: string;
  description: string;
  backgroundImage: string | null;
  themeClass: string;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    navbarBg: string;
    navbarBorder: string;
    bodyBg: string;
    cardBg: string;
    cardBorder: string;
    cardHoverBorder: string;
    textPrimary: string;
    textMuted: string;
    accentGlow: string;
    buttonGradient: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  };
}

/**
 * Determines current holiday season based on specific calendar date rules:
 * - Halloween: October 20 - November 30
 * - Christmas Eve: December 22 - 24
 * - Christmas: Whole December excluding 22-24
 * - New Year: January 1 - 15
 * - Wet Season: August 1 - October 19 (excluding October 20 onwards for Halloween)
 * - Standard: All other dates
 */
export function detectHolidaySeason(date: Date = new Date()): HolidaySeasonId {
  const month = date.getMonth(); // 0 = Jan, 7 = Aug, 8 = Sep, 9 = Oct, 10 = Nov, 11 = Dec
  const day = date.getDate();

  // 1. Halloween: Oct 20 - Nov 30
  if ((month === 9 && day >= 20) || (month === 10 && day <= 30)) {
    return "halloween";
  }

  // 2. Christmas Eve: Dec 22 - 24
  if (month === 11 && day >= 22 && day <= 24) {
    return "christmas_eve";
  }

  // 3. Christmas: Whole December excluding 22-24
  if (month === 11 && (day < 22 || day > 24)) {
    return "christmas";
  }

  // 4. New Year: January 1 - 15
  if (month === 0 && day >= 1 && day <= 15) {
    return "new_year";
  }

  // 5. Wet Season: August 1 - October 19 (exclude October 20 onwards for Halloween)
  if (month === 7 || month === 8 || (month === 9 && day < 20)) {
    return "wet_season";
  }

  return "standard";
}

export const HOLIDAY_CONFIGS: Record<HolidaySeasonId, HolidayThemeConfig> = {
  standard: {
    id: "standard",
    name: "Standard Light",
    emoji: "🌿",
    badgeLabel: "Classic South Central",
    dateRangeText: "Default NDS Palette",
    description: "Classic South Central sage & forest olive palette",
    backgroundImage: null,
    themeClass: "theme-standard",
    colors: {
      primary: "#8AA66B",
      primaryHover: "#779357",
      secondary: "#3F4A33",
      navbarBg: "bg-[#3F4A33]/85",
      navbarBorder: "border-[#CFE0B8]/30",
      bodyBg: "#FBF7F0",
      cardBg: "bg-white",
      cardBorder: "border-[#CFE0B8]",
      cardHoverBorder: "hover:border-[#8AA66B]",
      textPrimary: "text-[#3F4A33]",
      textMuted: "text-[#3F4A33]/70",
      accentGlow: "rgba(138, 166, 107, 0.3)",
      buttonGradient: "from-[#8AA66B] to-[#779357]",
      badgeBg: "bg-[#EDF3E3]",
      badgeText: "text-[#3F4A33]",
      badgeBorder: "border-[#CFE0B8]",
    },
  },
  wet_season: {
    id: "wet_season",
    name: "Wet Season",
    emoji: "⛈️",
    badgeLabel: "Wet Season (Rain & Lightning)",
    dateRangeText: "Aug 1 – Oct 19",
    description: "Standard South Central palette with rainfall, raindrops, and thunderstorm lightning",
    backgroundImage: wetSeasonBg,
    themeClass: "theme-wet-season",
    colors: {
      primary: "#8AA66B",
      primaryHover: "#779357",
      secondary: "#3F4A33",
      navbarBg: "bg-[#354536]/90",
      navbarBorder: "border-[#8AA66B]/35",
      bodyBg: "#FBF7F0",
      cardBg: "bg-white/95",
      cardBorder: "border-[#CFE0B8]",
      cardHoverBorder: "hover:border-[#8AA66B]",
      textPrimary: "text-[#3F4A33]",
      textMuted: "text-[#3F4A33]/70",
      accentGlow: "rgba(138, 166, 107, 0.35)",
      buttonGradient: "from-[#8AA66B] to-[#779357]",
      badgeBg: "bg-[#EDF3E3]",
      badgeText: "text-[#3F4A33]",
      badgeBorder: "border-[#CFE0B8]",
    },
  },
  halloween: {
    id: "halloween",
    name: "Halloween",
    emoji: "🎃",
    badgeLabel: "Halloween Season",
    dateRangeText: "Oct 20 – Nov 30",
    description: "Spooky pumpkin orange, midnight plum & drifting autumn leaves",
    backgroundImage: halloweenBg,
    themeClass: "theme-halloween",
    colors: {
      primary: "#EA580C",
      primaryHover: "#C2410C",
      secondary: "#7C3AED",
      navbarBg: "bg-[#2A130A]/90",
      navbarBorder: "border-[#FB923C]/35",
      bodyBg: "#FDF8F3",
      cardBg: "bg-white/95",
      cardBorder: "border-[#FED7AA]",
      cardHoverBorder: "hover:border-[#F97316]",
      textPrimary: "text-[#431407]",
      textMuted: "text-[#7C2D12]/80",
      accentGlow: "rgba(234, 88, 12, 0.4)",
      buttonGradient: "from-[#EA580C] to-[#C2410C]",
      badgeBg: "bg-[#FFEDD5]",
      badgeText: "text-[#9A3412]",
      badgeBorder: "border-[#FDBA74]",
    },
  },
  christmas_eve: {
    id: "christmas_eve",
    name: "Christmas Eve",
    emoji: "🕯️",
    badgeLabel: "Christmas Eve Magic",
    dateRangeText: "Dec 22 – Dec 24",
    description: "Starry silent night twilight, candlelight gold & gentle snow shimmers",
    backgroundImage: xmasEveBg,
    themeClass: "theme-christmas-eve",
    colors: {
      primary: "#D97706",
      primaryHover: "#B45309",
      secondary: "#1E3A8A",
      navbarBg: "bg-[#0F1E36]/90",
      navbarBorder: "border-[#FCD34D]/35",
      bodyBg: "#F6F9FD",
      cardBg: "bg-white/95",
      cardBorder: "border-[#BFDBFE]",
      cardHoverBorder: "hover:border-[#F59E0B]",
      textPrimary: "text-[#1E293B]",
      textMuted: "text-[#334155]/80",
      accentGlow: "rgba(217, 119, 6, 0.4)",
      buttonGradient: "from-[#D97706] to-[#B45309]",
      badgeBg: "bg-[#FEF3C7]",
      badgeText: "text-[#92400E]",
      badgeBorder: "border-[#FDE68A]",
    },
  },
  christmas: {
    id: "christmas",
    name: "Christmas",
    emoji: "🎄",
    badgeLabel: "Christmas Holiday",
    dateRangeText: "Dec 1 – Dec 31 (excl. 22-24)",
    description: "Festive crimson red, pine evergreen & joyful drifting snowflakes",
    backgroundImage: christmasBg,
    themeClass: "theme-christmas",
    colors: {
      primary: "#DC2626",
      primaryHover: "#B91C1C",
      secondary: "#15803D",
      navbarBg: "bg-[#143E23]/92",
      navbarBorder: "border-[#F87171]/35",
      bodyBg: "#FCF9F6",
      cardBg: "bg-white/95",
      cardBorder: "border-[#BBF7D0]",
      cardHoverBorder: "hover:border-[#DC2626]",
      textPrimary: "text-[#1C1917]",
      textMuted: "text-[#44403C]/80",
      accentGlow: "rgba(220, 38, 38, 0.4)",
      buttonGradient: "from-[#DC2626] to-[#991B1B]",
      badgeBg: "bg-[#FEE2E2]",
      badgeText: "text-[#991B1B]",
      badgeBorder: "border-[#FECACA]",
    },
  },
  new_year: {
    id: "new_year",
    name: "New Year",
    emoji: "✨",
    badgeLabel: "Happy New Year",
    dateRangeText: "Jan 1 – Jan 15",
    description: "Sparkling champagne gold, celebratory confetti & glowing starbursts",
    backgroundImage: newYearBg,
    themeClass: "theme-new-year",
    colors: {
      primary: "#D97706",
      primaryHover: "#B45309",
      secondary: "#4338CA",
      navbarBg: "bg-[#1E1B4B]/90",
      navbarBorder: "border-[#FDE68A]/35",
      bodyBg: "#FCFAF6",
      cardBg: "bg-white/95",
      cardBorder: "border-[#FDE68A]",
      cardHoverBorder: "hover:border-[#F59E0B]",
      textPrimary: "text-[#1E1B4B]",
      textMuted: "text-[#4338CA]/80",
      accentGlow: "rgba(217, 119, 6, 0.45)",
      buttonGradient: "from-[#D97706] to-[#9333EA]",
      badgeBg: "bg-[#FEF9C3]",
      badgeText: "text-[#854D0E]",
      badgeBorder: "border-[#FEF08A]",
    },
  },
};
