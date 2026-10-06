import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import matrixBackdropImg from "../assets/images/green_matrix_backdrop_1790711247799.jpg";

export const MatrixRainBackground: React.FC = () => {
  const { isDarkMode, matrixRainActive } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isDarkMode || !matrixRainActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS cap for ultra-smooth & battery-efficient execution

    // Characters: Katakana, Numbers, Cyber glyphs, Letters
    const matrixChars =
      "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ+-*/=%\"'#$&_(),.;:?!\\|{}<>[]^~";
    const charsArray = matrixChars.split("");

    const fontSize = 14;
    let columns = Math.floor(window.innerWidth / fontSize);
    let drops: number[] = [];
    let speeds: number[] = [];

    const initGrid = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      speeds = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100); // staggered starting heights
        speeds[i] = Math.random() * 0.7 + 0.6; // varied stream speeds
      }
    };

    initGrid();

    const handleResize = () => {
      initGrid();
    };

    window.addEventListener("resize", handleResize);

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Semi-transparent fade trail
      ctx.fillStyle = "rgba(4, 9, 6, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        // Random character
        const char = charsArray[Math.floor(Math.random() * charsArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head of stream glows brilliant luminous white-green
        const isHead = Math.random() > 0.82;
        if (isHead) {
          ctx.fillStyle = "#E8FFE8";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#00FF41";
        } else {
          // Body of stream in classic vibrant phosphor green
          ctx.fillStyle = Math.random() > 0.9 ? "#39FF14" : "#00FF41";
          ctx.shadowBlur = 4;
          ctx.shadowColor = "rgba(0, 255, 65, 0.6)";
        }

        ctx.fillText(char, x, y);

        // Reset drop to top with randomized delay once off screen
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = Math.random() * 0.7 + 0.6;
        }

        // Advance drop
        drops[i] += speeds[i];
      }

      ctx.shadowBlur = 0;
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDarkMode, matrixRainActive]);

  if (!isDarkMode) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700 ease-in-out"
    >
      {/* 1. Underlying High-Res Matrix Wallpaper image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-screen scale-105 transform motion-safe:animate-pulse"
        style={{
          backgroundImage: `url(${matrixBackdropImg})`,
          filter: "brightness(0.85) contrast(1.2) saturate(1.3)",
          animationDuration: "8s",
        }}
      />

      {/* 2. Live Animated Matrix Stream Canvas */}
      {matrixRainActive && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-35 mix-blend-screen"
        />
      )}

      {/* 3. Subtle Hexagonal / CRT Scanline Cyber Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FF41]/[0.02] to-transparent pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 255, 65, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* 4. Radial Vignette for Content Readability in Center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(3,8,5,0.78)_80%,rgba(2,6,4,0.94)_100%)]" />
    </div>
  );
};
