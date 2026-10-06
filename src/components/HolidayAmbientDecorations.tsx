import React from "react";
import { useTheme } from "../context/ThemeContext";

export const HolidayAmbientDecorations: React.FC = () => {
  const { isDarkMode, activeHolidaySeason, holidayAnimationActive } = useTheme();

  // Active in Light Mode only and when animations are not paused
  if (isDarkMode || !holidayAnimationActive || activeHolidaySeason === "standard") {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none"
    >
      {/* ========================================================================= */}
      {/* 0. WET SEASON THEME: Rainfall, Raindrops & Thunderstorm Lightning Accents */}
      {/* ========================================================================= */}
      {activeHolidaySeason === "wet_season" && (
        <>
          {/* Top-Left: Storm Cloud with animated dripping raindrops & occasional lightning flash */}
          <div className="absolute top-2 left-3 sm:left-6 flex flex-col items-start opacity-90 transition-opacity duration-500 animate-[thunder-cloud-drift_8s_ease-in-out_infinite]">
            <div className="relative">
              {/* Illustrated Storm Cloud SVG */}
              <svg width="88" height="52" viewBox="0 0 100 60" fill="none" className="drop-shadow-md">
                <path
                  d="M 28 48 C 18 48 10 40 10 30 C 10 21 17 14 26 13 C 29 6 36 2 45 2 C 56 2 65 9 68 18 C 72 16 76 15 80 15 C 91 15 98 23 98 33 C 98 42 90 48 80 48 Z"
                  fill="url(#storm-cloud-grad)"
                />
                <defs>
                  <linearGradient id="storm-cloud-grad" x1="50" y1="2" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#64748B" />
                    <stop offset="0.65" stopColor="#475569" />
                    <stop offset="1" stopColor="#334155" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Dynamic Lightning Bolt branching out from the cloud */}
              <div className="absolute top-9 left-9 sm:left-10 animate-[lightning-bolt-strike_6s_ease-in-out_infinite]">
                <svg width="28" height="42" viewBox="0 0 28 42" fill="none" className="filter drop-shadow-[0_0_8px_rgba(186,230,253,0.9)]">
                  <polygon
                    points="14,0 4,20 12,20 8,42 24,16 16,16"
                    fill="#F0F9FF"
                    stroke="#7DD3FC"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              {/* Animated Falling Raindrops below the cloud */}
              <div className="absolute -bottom-6 left-5 flex space-x-3 text-xs sm:text-sm">
                <span className="text-sky-400 font-bold animate-[raindrop-drip_1.4s_linear_infinite]" style={{ animationDelay: "0s" }}>
                  💧
                </span>
                <span className="text-sky-500 font-bold animate-[raindrop-drip_1.7s_linear_infinite]" style={{ animationDelay: "0.5s" }}>
                  💧
                </span>
                <span className="text-sky-400 font-bold animate-[raindrop-drip_1.5s_linear_infinite]" style={{ animationDelay: "0.9s" }}>
                  💧
                </span>
              </div>
            </div>
          </div>

          {/* Top-Right: Gentle Rain Cloud with Wind-Angled Raindrops */}
          <div className="hidden sm:flex absolute top-2 right-4 sm:right-8 flex-col items-end opacity-85 animate-[thunder-cloud-drift_9s_ease-in-out_infinite] scale-x-[-1]">
            <div className="relative">
              <svg width="78" height="46" viewBox="0 0 100 60" fill="none" className="drop-shadow-md">
                <path
                  d="M 28 48 C 18 48 10 40 10 30 C 10 21 17 14 26 13 C 29 6 36 2 45 2 C 56 2 65 9 68 18 C 72 16 76 15 80 15 C 91 15 98 23 98 33 C 98 42 90 48 80 48 Z"
                  fill="#475569"
                />
              </svg>
              <div className="absolute -bottom-5 left-4 flex space-x-2.5 text-xs">
                <span className="text-sky-400 animate-[raindrop-drip_1.6s_linear_infinite]" style={{ animationDelay: "0.3s" }}>
                  💧
                </span>
                <span className="text-sky-400 animate-[raindrop-drip_1.8s_linear_infinite]" style={{ animationDelay: "0.8s" }}>
                  💧
                </span>
              </div>
            </div>
          </div>

          {/* Bottom-Left: Rain Puddle & Concentric Ripples */}
          <div className="absolute bottom-6 left-6 sm:left-10 flex items-center space-x-3 opacity-90">
            <div className="relative w-16 h-8 flex items-center justify-center">
              {/* Expanding Ripple Rings */}
              <div className="absolute inset-0 rounded-full border border-sky-400/60 animate-[ripple-expand_2.8s_ease-out_infinite]" />
              <div className="absolute inset-1 rounded-full border border-sky-300/50 animate-[ripple-expand_2.8s_ease-out_infinite]" style={{ animationDelay: "0.9s" }} />
              <div className="absolute inset-2 rounded-full border border-sky-200/40 animate-[ripple-expand_2.8s_ease-out_infinite]" style={{ animationDelay: "1.8s" }} />
              <span className="text-sm">🌧️</span>
            </div>
            <div className="hidden md:flex flex-col text-[11px] font-semibold text-[#3F4A33]/80">
              <span className="flex items-center gap-1 font-bold text-[#3F4A33]">
                <span>⚡ Wet Season Weather</span>
              </span>
              <span className="text-[10px] text-[#3F4A33]/65">Raining &amp; Thunderstorm Mode</span>
            </div>
          </div>

          {/* Bottom-Right: Wet Season Ambient Pill Indicator */}
          <div className="absolute bottom-6 right-4 sm:right-8 flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#CFE0B8] shadow-md text-[#3F4A33]">
            <span className="text-xl filter drop-shadow-xs">⛈️</span>
            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold leading-tight">Wet Season Active</span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200 px-1.5 py-0.2 rounded-full">
                  Aug – Oct 29
                </span>
              </div>
              <span className="text-[10px] text-[#3F4A33]/70 font-medium">
                Rainfall &bull; Raindrops &bull; Lightning Flashes
              </span>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 1. HALLOWEEN THEME: Spooky Haunted Webs, Crawling Spiders, Tombstones, Ghosts */}
      {/* ========================================================================= */}
      {activeHolidaySeason === "halloween" && (
        <>
          {/* Top-Left: Large Intricate Spooky Spider Web with Crawling & Dangling Spiders */}
          <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 opacity-90 transition-opacity duration-500">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full fill-none stroke-stone-900/50"
              strokeWidth="1.2"
            >
              {/* Radial Spokes */}
              <line x1="0" y1="0" x2="100" y2="0" strokeWidth="1.6" />
              <line x1="0" y1="0" x2="94" y2="34" />
              <line x1="0" y1="0" x2="72" y2="70" />
              <line x1="0" y1="0" x2="34" y2="94" />
              <line x1="0" y1="0" x2="0" y2="100" strokeWidth="1.6" />
              {/* Concentric Web Arcs */}
              <path d="M 15 0 Q 13 8 10 10 Q 8 13 0 15" strokeWidth="0.9" />
              <path d="M 30 0 Q 27 15 21 21 Q 15 27 0 30" strokeWidth="1.0" />
              <path d="M 48 0 Q 43 24 34 34 Q 24 43 0 48" strokeWidth="1.0" />
              <path d="M 68 0 Q 61 34 48 48 Q 34 61 0 68" strokeWidth="1.1" />
              <path d="M 88 0 Q 79 44 62 62 Q 44 79 0 88" strokeWidth="1.1" />
              <path d="M 100 0 Q 90 50 70 70 Q 50 90 0 100" strokeWidth="1.2" />
            </svg>

            {/* Dangling Spider 1 on thread swaying */}
            <div className="absolute top-24 left-24 sm:top-32 sm:left-32 origin-top animate-[spider-swing_3.8s_ease-in-out_infinite]">
              <div className="w-[1.2px] h-12 sm:h-20 bg-stone-900/55" />
              <div className="relative -left-2.5 -top-1 text-lg sm:text-2xl filter drop-shadow-md">
                🕷️
              </div>
            </div>

            {/* Little Spider 2 crawling along top border */}
            <div className="absolute top-1 left-28 sm:left-40 animate-[spider-crawl_7s_linear_infinite] text-base">
              🕷️
            </div>
          </div>

          {/* Top-Right: Cobweb with Dangling & Scuttling Spiders */}
          <div className="absolute top-0 right-0 w-44 h-44 sm:w-60 sm:h-60 opacity-85 transition-opacity duration-500 scale-x-[-1]">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full fill-none stroke-stone-900/50"
              strokeWidth="1.2"
            >
              <line x1="0" y1="0" x2="100" y2="0" strokeWidth="1.6" />
              <line x1="0" y1="0" x2="94" y2="34" />
              <line x1="0" y1="0" x2="72" y2="70" />
              <line x1="0" y1="0" x2="34" y2="94" />
              <line x1="0" y1="0" x2="0" y2="100" strokeWidth="1.6" />
              <path d="M 22 0 Q 19 11 15 15 Q 11 19 0 22" strokeWidth="0.9" />
              <path d="M 44 0 Q 39 22 31 31 Q 22 39 0 44" strokeWidth="1.0" />
              <path d="M 68 0 Q 60 34 48 48 Q 34 60 0 68" strokeWidth="1.1" />
              <path d="M 92 0 Q 82 46 65 65 Q 46 82 0 92" strokeWidth="1.2" />
            </svg>
            <div className="absolute top-20 left-20 sm:top-28 sm:left-28 origin-top animate-[spider-swing_4.5s_ease-in-out_infinite]">
              <div className="w-[1.2px] h-10 sm:h-16 bg-stone-900/50" />
              <div className="relative -left-2.5 -top-1 text-lg sm:text-xl">🕷️</div>
            </div>
          </div>

          {/* Bottom-Right: Spooky Corner Cobweb with Crawling Spider */}
          <div className="absolute bottom-0 right-0 w-36 h-36 sm:w-48 sm:h-48 opacity-80 scale-x-[-1] scale-y-[-1]">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full fill-none stroke-stone-900/40"
              strokeWidth="1.1"
            >
              <line x1="0" y1="0" x2="100" y2="0" strokeWidth="1.4" />
              <line x1="0" y1="0" x2="72" y2="70" />
              <line x1="0" y1="0" x2="0" y2="100" strokeWidth="1.4" />
              <path d="M 30 0 Q 25 15 20 20 Q 15 25 0 30" strokeWidth="0.9" />
              <path d="M 60 0 Q 50 30 35 35 Q 30 50 0 60" strokeWidth="1.0" />
              <path d="M 90 0 Q 75 45 50 50 Q 45 75 0 90" strokeWidth="1.1" />
            </svg>
            <div className="absolute top-12 left-12 text-sm">🕷️</div>
          </div>

          {/* Bottom-Left: Eerie Cemetery Tombstones & Glowing Jack-o'-Lantern */}
          <div className="absolute bottom-6 left-4 sm:left-8 flex items-end space-x-3 opacity-95 animate-[ghost-sway_8s_ease-in-out_infinite]">
            {/* Tombstone 1 */}
            <div className="relative flex flex-col items-center">
              <svg width="65" height="80" viewBox="0 0 60 75" fill="none" className="drop-shadow-lg">
                {/* Rounded gravestone */}
                <path
                  d="M10 75 V28 C10 14 20 5 30 5 C40 5 50 14 50 28 V75 Z"
                  fill="#44403C"
                  stroke="#292524"
                  strokeWidth="1.5"
                />
                {/* Cross on tombstone */}
                <rect x="28" y="16" width="4" height="18" fill="#78716C" />
                <rect x="22" y="21" width="16" height="4" fill="#78716C" />
                {/* R.I.P Text */}
                <text x="30" y="48" fontSize="8" fontWeight="bold" fill="#D6D3D1" textAnchor="middle" fontFamily="serif">
                  R. I. P.
                </text>
                {/* Cracks */}
                <path d="M18 60 L24 55 L22 50" stroke="#292524" strokeWidth="1.2" />
              </svg>
              {/* Spider crawling on tombstone */}
              <div className="absolute top-7 right-1 text-xs animate-bounce" style={{ animationDuration: "2.5s" }}>
                🕷️
              </div>
            </div>

            {/* Glowing Jack-o'-Lantern Pumpkin */}
            <div className="relative group text-3xl filter drop-shadow-[0_0_15px_rgba(249,115,22,0.9)] animate-bounce" style={{ animationDuration: "3.5s" }}>
              🎃
            </div>
          </div>

          {/* Floating Ghost 1 (Rising gracefully from cemetery) */}
          <div className="absolute bottom-28 left-16 sm:left-24 animate-[ghost-float_5.5s_ease-in-out_infinite] opacity-90">
            <svg width="55" height="70" viewBox="0 0 60 74" fill="none" className="drop-shadow-xl">
              <path
                d="M30 4C16.7 4 6 14.7 6 28V62C10 60 14 65 18 62C22 59 26 65 30 62C34 59 38 65 42 62C46 59 50 65 54 62V28C54 14.7 43.3 4 30 4Z"
                fill="url(#spooky-ghost)"
              />
              <ellipse cx="22" cy="26" rx="3.5" ry="5.5" fill="#1C0D06" />
              <ellipse cx="38" cy="26" rx="3.5" ry="5.5" fill="#1C0D06" />
              <circle cx="23.5" cy="24" r="1.5" fill="#FFFFFF" />
              <circle cx="39.5" cy="24" r="1.5" fill="#FFFFFF" />
              <ellipse cx="30" cy="38" rx="3" ry="5" fill="#1C0D06" />
              <defs>
                <linearGradient id="spooky-ghost" x1="30" y1="4" x2="30" y2="65" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="0.75" stopColor="#FFF7ED" />
                  <stop offset="1" stopColor="#FED7AA" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Floating Ghost 2 (Right side mid-height) */}
          <div className="hidden md:block absolute top-48 right-6 sm:right-10 animate-[ghost-sway_7s_ease-in-out_infinite] opacity-85">
            <div className="relative flex flex-col items-center">
              <svg width="50" height="64" viewBox="0 0 60 74" fill="none" className="drop-shadow-lg">
                <path
                  d="M30 4C16.7 4 6 14.7 6 28V62C10 60 14 65 18 62C22 59 26 65 30 62C34 59 38 65 42 62C46 59 50 65 54 62V28C54 14.7 43.3 4 30 4Z"
                  fill="#FFFFFF"
                  fillOpacity="0.95"
                />
                <ellipse cx="23" cy="25" rx="3" ry="4.5" fill="#2A130A" />
                <ellipse cx="37" cy="25" rx="3" ry="4.5" fill="#2A130A" />
                <circle cx="24" cy="23.5" r="1.2" fill="#FFFFFF" />
                <circle cx="38" cy="23.5" r="1.2" fill="#FFFFFF" />
                <path d="M26 35C26 38 34 38 34 35" stroke="#2A130A" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DISTINGUISHABLE FLYING BATS SWOOPING ACROSS THE SKY */}
          {/* ========================================================================= */}
          {/* Bat 1: Large distinguishable flying bat swooping left-to-right across upper sky */}
          <div
            className="absolute top-0 left-0 pointer-events-none z-30 animate-[bat-fly-left-to-right_13s_linear_infinite]"
            style={{ animationDelay: "0s" }}
          >
            <svg
              width="64"
              height="36"
              viewBox="0 0 100 55"
              fill="none"
              className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] filter"
            >
              <g className="origin-center animate-[bat-wing-flap_0.28s_ease-in-out_infinite]">
                {/* Left Scalloped Bat Wing */}
                <path
                  d="M 45 28 C 36 16 22 9 3 15 C 0.5 16 -0.5 19 1 21 C 5 25 11 26 15 28 C 17 33 23 36 28 37 C 32 42 39 44 44 38 Z"
                  fill="#140803"
                />
                <path d="M 45 26 Q 24 16 4 16" stroke="#3D1A0E" strokeWidth="1.2" />
                <path d="M 35 24 Q 21 28 15 28" stroke="#3D1A0E" strokeWidth="0.8" />
                <path d="M 38 27 Q 30 33 28 37" stroke="#3D1A0E" strokeWidth="0.8" />

                {/* Right Scalloped Bat Wing */}
                <path
                  d="M 55 28 C 64 16 78 9 97 15 C 99.5 16 100.5 19 99 21 C 95 25 89 26 85 28 C 83 33 77 36 72 37 C 68 42 61 44 56 38 Z"
                  fill="#140803"
                />
                <path d="M 55 26 Q 76 16 96 16" stroke="#3D1A0E" strokeWidth="1.2" />
                <path d="M 65 24 Q 79 28 85 28" stroke="#3D1A0E" strokeWidth="0.8" />
                <path d="M 62 27 Q 70 33 72 37" stroke="#3D1A0E" strokeWidth="0.8" />
              </g>

              {/* Bat Torso Body */}
              <ellipse cx="50" cy="32" rx="5.5" ry="9" fill="#1C0D06" />

              {/* Bat Head */}
              <ellipse cx="50" cy="22" rx="5" ry="5.5" fill="#1C0D06" />

              {/* Pointed Bat Ears */}
              <polygon points="45,21 41,11 48,17" fill="#1C0D06" />
              <polygon points="55,21 59,11 52,17" fill="#1C0D06" />

              {/* Glowing Sinister Eyes */}
              <circle cx="48" cy="21.5" r="1.2" fill="#F97316" />
              <circle cx="52" cy="21.5" r="1.2" fill="#F97316" />
            </svg>
          </div>

          {/* Bat 2: Medium flying bat swooping right-to-left */}
          <div
            className="absolute top-0 right-0 pointer-events-none z-30 animate-[bat-fly-right-to-left_15s_linear_infinite]"
            style={{ animationDelay: "4.5s" }}
          >
            <svg
              width="52"
              height="30"
              viewBox="0 0 100 55"
              fill="none"
              className="drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)] filter"
            >
              <g className="origin-center animate-[bat-wing-flap_0.24s_ease-in-out_infinite]">
                <path
                  d="M 45 28 C 36 16 22 9 3 15 C 0.5 16 -0.5 19 1 21 C 5 25 11 26 15 28 C 17 33 23 36 28 37 C 32 42 39 44 44 38 Z"
                  fill="#140803"
                />
                <path d="M 45 26 Q 24 16 4 16" stroke="#3D1A0E" strokeWidth="1.2" />
                <path
                  d="M 55 28 C 64 16 78 9 97 15 C 99.5 16 100.5 19 99 21 C 95 25 89 26 85 28 C 83 33 77 36 72 37 C 68 42 61 44 56 38 Z"
                  fill="#140803"
                />
                <path d="M 55 26 Q 76 16 96 16" stroke="#3D1A0E" strokeWidth="1.2" />
              </g>
              <ellipse cx="50" cy="32" rx="5.5" ry="9" fill="#1C0D06" />
              <ellipse cx="50" cy="22" rx="5" ry="5.5" fill="#1C0D06" />
              <polygon points="45,21 41,11 48,17" fill="#1C0D06" />
              <polygon points="55,21 59,11 52,17" fill="#1C0D06" />
              <circle cx="48" cy="21.5" r="1.1" fill="#EA580C" />
              <circle cx="52" cy="21.5" r="1.1" fill="#EA580C" />
            </svg>
          </div>

          {/* Bat 3: Fast swooping bat diving in an arc */}
          <div
            className="absolute top-0 right-0 pointer-events-none z-30 animate-[bat-fly-swoop_17s_linear_infinite]"
            style={{ animationDelay: "8.5s" }}
          >
            <svg
              width="44"
              height="25"
              viewBox="0 0 100 55"
              fill="none"
              className="drop-shadow-[0_3px_8px_rgba(0,0,0,0.75)] filter"
            >
              <g className="origin-center animate-[bat-wing-flap_0.22s_ease-in-out_infinite]">
                <path
                  d="M 45 28 C 36 16 22 9 3 15 C 0.5 16 -0.5 19 1 21 C 5 25 11 26 15 28 C 17 33 23 36 28 37 C 32 42 39 44 44 38 Z"
                  fill="#140803"
                />
                <path
                  d="M 55 28 C 64 16 78 9 97 15 C 99.5 16 100.5 19 99 21 C 95 25 89 26 85 28 C 83 33 77 36 72 37 C 68 42 61 44 56 38 Z"
                  fill="#140803"
                />
              </g>
              <ellipse cx="50" cy="32" rx="5" ry="8" fill="#1C0D06" />
              <ellipse cx="50" cy="22" rx="4.5" ry="5" fill="#1C0D06" />
              <polygon points="45,21 41,11 48,17" fill="#1C0D06" />
              <polygon points="55,21 59,11 52,17" fill="#1C0D06" />
              <circle cx="48" cy="21.5" r="1.1" fill="#F97316" />
              <circle cx="52" cy="21.5" r="1.1" fill="#F97316" />
            </svg>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. CHRISTMAS & CHRISTMAS EVE: Snowman, Trees, Snowflakes & GIFTS ANIMATIONS */}
      {/* ========================================================================= */}
      {(activeHolidaySeason === "christmas" || activeHolidaySeason === "christmas_eve") && (
        <>
          {/* Top Border Pine Garland with Frosted Berries, Gifts, and Snowflakes */}
          <div className="absolute top-0 left-0 right-0 h-7 flex justify-around overflow-hidden opacity-90">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="origin-top animate-[garland-sway_5s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <div className="text-sm sm:text-base transform -translate-y-1">
                  {i % 4 === 0 ? "🎄" : i % 4 === 1 ? "🎁" : i % 4 === 2 ? "❄️" : "🔔"}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom-Right: Friendly Illustrated Snowman + Bouncing Gift Boxes */}
          <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-end space-x-3 opacity-95">
            {/* Animated Wrapped Gift 1 (Red with Gold Ribbon) */}
            <div className="flex flex-col items-center animate-[gift-bounce_3s_ease-in-out_infinite]">
              <div className="relative group text-2xl sm:text-3xl filter drop-shadow-md">
                🎁
                {/* Popping Sparkle */}
                <span className="absolute -top-2 -right-2 text-xs animate-ping">✨</span>
              </div>
            </div>

            {/* Snowman */}
            <div className="relative animate-[snowman-bounce_4s_ease-in-out_infinite]">
              <svg width="78" height="105" viewBox="0 0 90 120" fill="none" className="drop-shadow-xl">
                <rect x="25" y="8" width="40" height="22" rx="3" fill="#1C1917" />
                <rect x="15" y="27" width="60" height="6" rx="3" fill="#1C1917" />
                <rect x="25" y="23" width="40" height="4" fill="#DC2626" />
                <circle cx="45" cy="46" r="18" fill="url(#snow-grad-c)" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="39" cy="43" r="2.2" fill="#1E293B" />
                <circle cx="51" cy="43" r="2.2" fill="#1E293B" />
                <polygon points="45,46 45,50 32,48" fill="#F97316" stroke="#EA580C" strokeWidth="0.5" />
                <circle cx="37" cy="54" r="1" fill="#334155" />
                <circle cx="41" cy="56" r="1" fill="#334155" />
                <circle cx="45" cy="56.5" r="1" fill="#334155" />
                <circle cx="49" cy="56" r="1" fill="#334155" />
                <circle cx="53" cy="54" r="1" fill="#334155" />
                <circle cx="34" cy="48" r="3" fill="#FECACA" opacity="0.7" />
                <circle cx="56" cy="48" r="3" fill="#FECACA" opacity="0.7" />
                <path d="M30 60 C38 65 52 65 60 60 L62 65 C54 70 36 70 28 65 Z" fill="#DC2626" />
                <path d="M52 62 L55 82 L47 81 L46 64 Z" fill="#DC2626" />
                <path d="M52 67 L54 72 L46 71 L46 66 Z" fill="#15803D" />
                <circle cx="45" cy="88" r="28" fill="url(#snow-grad-c)" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="45" cy="76" r="2.5" fill="#1E293B" />
                <circle cx="45" cy="86" r="2.5" fill="#1E293B" />
                <circle cx="45" cy="96" r="2.5" fill="#1E293B" />
                <path d="M20 76 L6 66 M8 72 L6 66 L12 67" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M70 76 L84 68 M82 74 L84 68 L78 69" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <radialGradient id="snow-grad-c" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="75%" stopColor="#F1F5F9" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Bottom-Left: Decorated Christmas Tree with Gift Boxes Underneath */}
          <div className="absolute bottom-6 left-4 sm:left-8 z-20 flex items-end space-x-2 animate-[tree-gentle_6s_ease-in-out_infinite] opacity-95">
            <svg width="80" height="110" viewBox="0 0 80 110" fill="none" className="drop-shadow-xl">
              <polygon
                points="40,4 43,13 52,13 45,18 48,27 40,22 32,27 35,18 28,13 37,13"
                fill="#FBBF24"
                stroke="#F59E0B"
                strokeWidth="1"
                className="animate-pulse"
              />
              <polygon points="40,20 58,40 48,40 64,58 52,58 70,80 10,80 28,58 16,58 32,40 22,40" fill="#15803D" />
              <path d="M30 40 Q40 43 50 40 Q45 36 40 20 Q35 36 30 40 Z" fill="#F8FAFC" opacity="0.85" />
              <path d="M22 58 Q40 62 58 58 Q50 54 48 40 Q32 40 22 58 Z" fill="#F8FAFC" opacity="0.8" />
              <path d="M16 80 Q40 85 64 80 Q56 74 52 58 Q28 58 16 80 Z" fill="#F8FAFC" opacity="0.75" />
              <rect x="34" y="80" width="12" height="16" rx="2" fill="#78350F" />
              {/* Wrapped Gift Boxes Stacked Under Tree */}
              <rect x="16" y="84" width="16" height="14" rx="2" fill="#DC2626" />
              <line x1="24" y1="84" x2="24" y2="98" stroke="#FBBF24" strokeWidth="2.5" />
              <line x1="16" y1="91" x2="32" y2="91" stroke="#FBBF24" strokeWidth="2.5" />
              <rect x="48" y="86" width="16" height="12" rx="2" fill="#2563EB" />
              <line x1="56" y1="86" x2="56" y2="98" stroke="#FFFFFF" strokeWidth="2" />
              {/* Colorful Twinkling Fairy Lights */}
              <circle cx="36" cy="34" r="2.5" fill="#EF4444" className="animate-pulse" />
              <circle cx="44" cy="36" r="2.5" fill="#FBBF24" className="animate-ping" style={{ animationDuration: "2s" }} />
              <circle cx="30" cy="50" r="3" fill="#3B82F6" className="animate-pulse" />
              <circle cx="42" cy="52" r="3" fill="#EF4444" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
              <circle cx="52" cy="48" r="3" fill="#FBBF24" className="animate-pulse" style={{ animationDelay: "1s" }} />
              <circle cx="24" cy="70" r="3.5" fill="#FBBF24" className="animate-pulse" />
              <circle cx="38" cy="72" r="3.5" fill="#EC4899" className="animate-pulse" style={{ animationDelay: "0.7s" }} />
              <circle cx="56" cy="71" r="3.5" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: "1.2s" }} />
            </svg>

            {/* Extra Bouncing Gift Box Beside Tree */}
            <div className="animate-[gift-bounce_3.4s_ease-in-out_infinite] text-2xl sm:text-3xl filter drop-shadow-md">
              🎁
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. NEW YEAR THEME: Large Dynamic Year Display, Fireworks & Clinking Flutes */}
      {/* ========================================================================= */}
      {activeHolidaySeason === "new_year" && (
        <>
          {/* Top Left Celebration Banner featuring Dynamic Current Year */}
          <div className="absolute top-4 left-6 sm:left-12 flex items-center space-x-2 animate-[firework-pulse_3s_ease-in-out_infinite] opacity-95">
            <div className="text-2xl sm:text-3xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.85)]">
              🎆
            </div>
            <div className="text-xs font-black tracking-widest text-amber-900 bg-amber-50/95 border border-amber-300 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <span>HAPPY NEW YEAR</span>
              <strong className="text-amber-950 font-black px-2 py-0.5 rounded bg-amber-200 border border-amber-400 text-sm">
                {currentYear}
              </strong>
              <span>✨</span>
            </div>
          </div>

          {/* Top Right Celebration Starburst & Fireworks */}
          <div
            className="absolute top-4 right-6 sm:right-12 flex items-center space-x-2 animate-[firework-pulse_3s_ease-in-out_infinite] opacity-90"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="text-2xl sm:text-3xl filter drop-shadow-[0_0_12px_rgba(168,85,247,0.85)]">
              🎇
            </div>
          </div>

          {/* Bottom Right Champagne Clinking Flutes with Current Year Toast */}
          <div className="absolute bottom-6 right-6 sm:right-10 flex items-center space-x-2.5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-300/80 shadow-xl animate-[newyear-bob_4s_ease-in-out_infinite]">
            <span className="text-2xl sm:text-3xl">🥂</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-amber-950 leading-tight">
                Cheers to {currentYear}!
              </span>
              <span className="text-[10px] font-semibold text-amber-800">New Year Milestone Season</span>
            </div>
            <span className="text-base animate-spin" style={{ animationDuration: "6s" }}>✨</span>
          </div>
        </>
      )}
    </div>
  );
};
