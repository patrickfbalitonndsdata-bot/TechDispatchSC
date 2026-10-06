import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

interface FuturisticTabTransitionProps {
  activeTab: string;
  children: React.ReactNode;
}

export const FuturisticTabTransition: React.FC<FuturisticTabTransitionProps> = ({
  activeTab,
  children,
}) => {
  const { isDarkMode, activeHolidaySeason } = useTheme();
  const [isScanning, setIsScanning] = useState(false);

  // Trigger futuristic laser scanline sweep whenever the active tab changes (calibrated for cinematic appreciation)
  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* 1. Futuristic Cyber Laser Scanline Beam (Sweeps vertically downward upon tab change) */}
      {isScanning && (
        <div
          key={`laser-${activeTab}`}
          className="absolute left-0 right-0 pointer-events-none z-30 select-none animate-[laser-scanline-sweep_0.95s_cubic-bezier(0.25,1,0.35,1)_forwards]"
        >
          {/* Luminous hairline laser line with glowing optic core */}
          <div
            className={`h-[2.5px] w-full ${
              isDarkMode
                ? "bg-gradient-to-r from-transparent via-[#00FF41] to-transparent shadow-[0_0_22px_#00FF41,0_0_40px_rgba(0,255,65,0.75)]"
                : activeHolidaySeason === "halloween"
                ? "bg-gradient-to-r from-transparent via-[#EA580C] to-transparent shadow-[0_0_20px_#EA580C]"
                : activeHolidaySeason === "wet_season"
                ? "bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_22px_#38BDF8,0_0_36px_rgba(138,166,107,0.7)]"
                : "bg-gradient-to-r from-transparent via-[#8AA66B] to-transparent shadow-[0_0_18px_rgba(138,166,107,0.9)]"
            }`}
          />
          {/* Trailing holographic light curtain wake behind the laser */}
          <div
            className={`h-24 w-full -mt-24 opacity-35 ${
              isDarkMode
                ? "bg-gradient-to-b from-transparent to-[#00FF41]/30"
                : activeHolidaySeason === "halloween"
                ? "bg-gradient-to-b from-transparent to-[#EA580C]/25"
                : activeHolidaySeason === "wet_season"
                ? "bg-gradient-to-b from-transparent to-[#38BDF8]/25"
                : "bg-gradient-to-b from-transparent to-[#8AA66B]/25"
            }`}
          />
        </div>
      )}

      {/* 2. Main Content Futuristic Quantum Warp Transition */}
      <div
        key={activeTab}
        className="w-full relative z-10 animate-[quantum-warp-in_0.85s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      >
        {children}
      </div>
    </div>
  );
};
