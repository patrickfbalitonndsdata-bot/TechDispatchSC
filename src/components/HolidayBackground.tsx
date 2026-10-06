import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rot: number;
  vRot: number;
  color: string;
  type?: "bat" | "spark" | "ghost" | "spider" | "snow" | "crystal_snow" | "star" | "gift" | "confetti" | "bubble";
  extra?: number;
}

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
}

interface FireworkRocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
}

export const HolidayBackground: React.FC = () => {
  const { isDarkMode, activeHolidaySeason, holidayConfig, holidayAnimationActive } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic Current Year for New Year celebrations
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Only active in Light Mode and when holiday animation is toggled on
    if (isDarkMode || !holidayAnimationActive || activeHolidaySeason === "standard") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    // Particle pools based on holiday season
    const particles: Particle[] = [];
    const count =
      activeHolidaySeason === "christmas" ? 85 : activeHolidaySeason === "halloween" ? 55 : 60;

    // Fireworks state for New Year
    const rockets: FireworkRocket[] = [];
    const sparks: FireworkSpark[] = [];
    const fireworkColors = [
      "#F59E0B", // Gold
      "#E11D48", // Crimson
      "#A855F7", // Purple
      "#06B6D4", // Cyan
      "#10B981", // Emerald
      "#FBBF24", // Amber
      "#EC4899", // Magenta
      "#FFFFFF", // Sparkle White
    ];

    // Wet Season (Aug - Oct 29) Rain, Ripples, Splashes & Lightning State
    interface Raindrop {
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      width: number;
      alpha: number;
    }
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      decay: number;
    }
    interface Splash {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }
    interface GlassBead {
      x: number;
      y: number;
      vy: number;
      size: number;
    }
    interface LightningSegment {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
      isBranch?: boolean;
    }

    const raindrops: Raindrop[] = [];
    const ripples: Ripple[] = [];
    const splashes: Splash[] = [];
    const glassBeads: GlassBead[] = [];

    let currentLightningSegments: LightningSegment[] | null = null;
    let flashAlpha = 0;
    let flashSequence: number[] = [];
    let flashIndex = 0;
    let nextLightningFrame = Math.floor(rand(180, 360)); // Strike every 3-6 seconds

    if (activeHolidaySeason === "wet_season") {
      const rainCount = Math.min(220, Math.floor(width * 0.14) + 90);
      for (let r = 0; r < rainCount; r++) {
        raindrops.push({
          x: rand(-50, width + 50),
          y: rand(0, height),
          vx: rand(2.8, 4.8), // natural wind slant
          vy: rand(18, 32),
          length: rand(18, 38),
          width: rand(1.1, 2.0),
          alpha: rand(0.45, 0.85),
        });
      }
      for (let b = 0; b < 16; b++) {
        glassBeads.push({
          x: rand(20, width - 20),
          y: rand(0, height),
          vy: rand(0.12, 0.38),
          size: rand(2.2, 4.2),
        });
      }
    }

    // Initialize particles according to season
    for (let i = 0; i < count; i++) {
      if (activeHolidaySeason === "halloween") {
        // Spooky Theme: Ghosts, bats, crawling & dangling spiders, eerie will-o'-the-wisp motes (NO leaves!)
        const isGhost = i % 6 === 0;
        const isSpider = !isGhost && i % 3 === 0; // Plenty of spiders!
        const isBat = !isGhost && !isSpider && i % 2 === 0;

        particles.push({
          x: rand(0, width),
          y: isSpider ? rand(20, height * 0.75) : rand(0, height),
          vx: isGhost ? rand(-0.4, 0.4) : isBat ? rand(1.8, 3.2) : isSpider ? 0 : rand(-0.3, 0.3),
          vy: isGhost ? rand(-0.6, -0.2) : isBat ? rand(-0.3, 0.3) : isSpider ? rand(-0.4, 0.4) : rand(-0.7, -0.2),
          size: isGhost ? rand(24, 38) : isBat ? rand(16, 26) : isSpider ? rand(14, 20) : rand(2.5, 5),
          alpha: isGhost ? rand(0.6, 0.9) : rand(0.65, 0.95),
          rot: rand(0, Math.PI * 2),
          vRot: rand(-0.03, 0.03),
          color: isGhost
            ? "rgba(255, 255, 255, 0.92)"
            : isBat
            ? "rgba(28, 13, 6, 0.9)"
            : isSpider
            ? "rgba(20, 10, 5, 0.95)"
            : "rgba(249, 115, 22, 0.85)",
          type: isGhost ? "ghost" : isBat ? "bat" : isSpider ? "spider" : "spark",
          extra: rand(0, 100),
        });
      } else if (activeHolidaySeason === "christmas_eve") {
        // Christmas Eve: Starry twilight, gentle snowflakes & crystal flakes + floating gift boxes
        const isGift = i % 6 === 0;
        const isCrystal = !isGift && i % 4 === 0;
        const isStar = !isGift && !isCrystal && i % 2 === 0;
        particles.push({
          x: rand(0, width),
          y: isStar ? rand(0, height * 0.6) : rand(0, height),
          vx: isStar ? 0 : rand(-0.5, 0.5),
          vy: isStar ? 0 : isGift ? rand(0.7, 1.4) : rand(0.5, 1.3),
          size: isStar ? rand(1.5, 3.5) : isGift ? rand(16, 22) : isCrystal ? rand(8, 14) : rand(2, 5),
          alpha: rand(0.5, 0.95),
          rot: rand(0, Math.PI * 2),
          vRot: rand(-0.03, 0.03),
          color: isStar
            ? "rgba(254, 243, 199, 0.9)"
            : isGift
            ? ["#DC2626", "#15803D", "#D97706", "#2563EB"][i % 4]
            : "rgba(255, 255, 255, 0.95)",
          type: isStar ? "star" : isGift ? "gift" : isCrystal ? "crystal_snow" : "snow",
          extra: rand(0, 100),
        });
      } else if (activeHolidaySeason === "christmas") {
        // Christmas: Rich snow flurries + Intricate 6-pointed crystalline snowflakes + Falling wrapped GIFTS with bows & ribbons!
        const isGift = i % 5 === 0; // Frequent falling gifts!
        const isCrystal = !isGift && i % 3 === 0; // Intricate crystalline snowflakes!
        const isSparkle = !isGift && !isCrystal && i % 4 === 0;

        particles.push({
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-0.8, 0.8),
          vy: isGift ? rand(0.8, 1.8) : isCrystal ? rand(0.9, 1.9) : rand(0.8, 2.0),
          size: isGift ? rand(18, 26) : isCrystal ? rand(9, 16) : isSparkle ? rand(2.5, 4.5) : rand(2.5, 5),
          alpha: isGift ? rand(0.8, 0.98) : rand(0.6, 0.95),
          rot: rand(0, Math.PI * 2),
          vRot: rand(-0.025, 0.025),
          color: isGift
            ? ["#DC2626", "#15803D", "#D97706", "#2563EB", "#9333EA"][i % 5]
            : isSparkle
            ? "rgba(250, 204, 21, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          type: isGift ? "gift" : isCrystal ? "crystal_snow" : isSparkle ? "star" : "snow",
          extra: rand(0, Math.PI * 2),
        });
      } else if (activeHolidaySeason === "new_year") {
        // New Year: Golden champagne bubbles, confetti ribbons, celebratory sparkles
        const isBubble = i % 3 === 0;
        const isSparkle = i % 4 === 0;
        particles.push({
          x: rand(0, width),
          y: isBubble ? rand(height * 0.5, height) : rand(0, height),
          vx: isBubble ? rand(-0.3, 0.3) : rand(-1.0, 1.0),
          vy: isBubble ? rand(-1.4, -0.5) : rand(0.8, 2.2),
          size: isBubble ? rand(3, 9) : isSparkle ? rand(2, 5) : rand(6, 14),
          alpha: rand(0.45, 0.95),
          rot: rand(0, Math.PI * 2),
          vRot: rand(-0.05, 0.05),
          color: isBubble
            ? "rgba(253, 230, 138, 0.7)"
            : isSparkle
            ? "rgba(255, 255, 255, 0.95)"
            : ["rgba(245, 158, 11, 0.9)", "rgba(168, 85, 247, 0.85)", "rgba(20, 184, 166, 0.9)", "rgba(251, 191, 36, 0.9)"][i % 4],
          type: isBubble ? "bubble" : isSparkle ? "star" : "confetti",
          extra: rand(0, 50),
        });
      }
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // =============================================================
      // WET SEASON: RAINFALL, RAINDROPS, RIPPLES & LIGHTNING BOLTS
      // =============================================================
      if (activeHolidaySeason === "wet_season") {
        // 1. Lightning Bolt & Atmospheric Sheet Flash Trigger
        if (frame >= nextLightningFrame) {
          const segments: LightningSegment[] = [];
          const startX = rand(width * 0.15, width * 0.85);
          let cx = startX;
          let cy = 0;
          const targetY = rand(height * 0.45, height * 0.82);
          const steps = Math.floor(rand(12, 18));
          const stepY = targetY / steps;

          for (let s = 0; s < steps; s++) {
            const nx = cx + rand(-24, 24);
            const ny = cy + stepY * rand(0.75, 1.25);
            segments.push({
              x1: cx,
              y1: cy,
              x2: nx,
              y2: ny,
              width: rand(2.2, 3.6),
              isBranch: false,
            });

            // Branching offshoot (forked lightning)
            if (Math.random() < 0.35 && s > 1 && s < steps - 1) {
              const dir = Math.random() > 0.5 ? 1 : -1;
              let bx = cx;
              let by = cy;
              const bSteps = Math.floor(rand(4, 7));
              for (let b = 0; b < bSteps; b++) {
                const nbx = bx + dir * rand(12, 28);
                const nby = by + stepY * rand(0.5, 0.9);
                segments.push({
                  x1: bx,
                  y1: by,
                  x2: nbx,
                  y2: nby,
                  width: rand(1.0, 1.6),
                  isBranch: true,
                });
                bx = nbx;
                by = nby;
              }
            }

            cx = nx;
            cy = ny;
          }

          currentLightningSegments = segments;
          // Multi-phase atmospheric thunder lightning flash sequence
          flashSequence = [0.45, 0.2, 0.9, 0.95, 0.65, 0.35, 0.5, 0.2, 0.08, 0];
          flashIndex = 0;
          nextLightningFrame = frame + Math.floor(rand(240, 520)); // Next strike in 4-8.5 seconds
        }

        // Advance flash sequence
        if (flashSequence.length > 0 && flashIndex < flashSequence.length) {
          flashAlpha = flashSequence[flashIndex];
          flashIndex++;
          if (flashIndex >= flashSequence.length) {
            flashAlpha = 0;
            currentLightningSegments = null;
            flashSequence = [];
          }
        }

        // Render ambient lightning sky sheet flash
        if (flashAlpha > 0) {
          ctx.save();
          const skyFlash = ctx.createLinearGradient(0, 0, 0, height * 0.85);
          skyFlash.addColorStop(0, `rgba(224, 242, 254, ${flashAlpha * 0.38})`);
          skyFlash.addColorStop(0.5, `rgba(186, 230, 253, ${flashAlpha * 0.22})`);
          skyFlash.addColorStop(1, `rgba(255, 255, 255, 0)`);
          ctx.fillStyle = skyFlash;
          ctx.fillRect(0, 0, width, height);

          // Render lightning bolt segments
          if (currentLightningSegments && currentLightningSegments.length > 0) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Electric blue outer glow pass
            ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
            ctx.shadowColor = "rgba(186, 230, 253, 1)";
            ctx.shadowBlur = 24;
            ctx.lineWidth = 4.5;
            currentLightningSegments.forEach((seg) => {
              ctx.beginPath();
              ctx.moveTo(seg.x1, seg.y1);
              ctx.lineTo(seg.x2, seg.y2);
              ctx.stroke();
            });

            // Bright white electric core
            ctx.strokeStyle = "#FFFFFF";
            ctx.shadowColor = "#FFFFFF";
            ctx.shadowBlur = 8;
            currentLightningSegments.forEach((seg) => {
              ctx.lineWidth = seg.isBranch ? 1.4 : seg.width;
              ctx.beginPath();
              ctx.moveTo(seg.x1, seg.y1);
              ctx.lineTo(seg.x2, seg.y2);
              ctx.stroke();
            });
          }
          ctx.restore();
        }

        // 2. Render & advance falling raindrops
        ctx.save();
        ctx.lineCap = "round";
        raindrops.forEach((drop) => {
          drop.x += drop.vx;
          drop.y += drop.vy;

          // When reaching bottom or random splash ground plane
          if (drop.y > height + 20 || drop.x > width + 40) {
            if (Math.random() < 0.32 && ripples.length < 25) {
              ripples.push({
                x: drop.x,
                y: height - rand(6, 35),
                radius: 1.5,
                maxRadius: rand(12, 28),
                alpha: 0.65,
                decay: rand(0.018, 0.035),
              });
            }
            if (Math.random() < 0.25 && splashes.length < 35) {
              for (let s = 0; s < 2; s++) {
                splashes.push({
                  x: drop.x,
                  y: height - 10,
                  vx: rand(-2.5, 2.5),
                  vy: rand(-4.2, -1.5),
                  size: rand(1.2, 2.2),
                  alpha: 0.8,
                });
              }
            }
            drop.y = rand(-40, -10);
            drop.x = rand(-50, width - 20);
          }

          // Draw angled raindrop streak
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - (drop.vx / drop.vy) * drop.length, drop.y - drop.length);
          ctx.lineWidth = drop.width;
          ctx.strokeStyle = `rgba(165, 200, 225, ${drop.alpha})`;
          ctx.stroke();
        });
        ctx.restore();

        // 3. Render water ripple rings
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rip = ripples[i];
          rip.radius += 0.75;
          rip.alpha -= rip.decay;
          if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(rip.x, rip.y, rip.radius * 1.9, rip.radius * 0.65, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(140, 185, 215, ${Math.max(0, rip.alpha)})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
          ctx.restore();
        }

        // 4. Render water splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const sp = splashes[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.32; // gravity
          sp.alpha -= 0.04;
          if (sp.alpha <= 0) {
            splashes.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(165, 205, 230, ${Math.max(0, sp.alpha)})`;
          ctx.fill();
          ctx.restore();
        }

        // 5. Render window glass beads
        glassBeads.forEach((bead) => {
          bead.y += bead.vy;
          if (bead.y > height + 20) {
            bead.y = -20;
            bead.x = rand(20, width - 20);
            bead.vy = rand(0.12, 0.38);
          }
          ctx.save();
          ctx.fillStyle = "rgba(224, 242, 254, 0.55)";
          ctx.beginPath();
          ctx.ellipse(bead.x, bead.y, bead.size * 0.8, bead.size * 1.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(bead.x - bead.size * 0.25, bead.y - bead.size * 0.35, bead.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // =============================================================
      // HALLOWEEN: INTRICATE CANVAS CORNER WEBS
      // =============================================================
      if (activeHolidaySeason === "halloween") {
        ctx.save();
        ctx.strokeStyle = "rgba(40, 20, 10, 0.25)";
        ctx.lineWidth = 1;

        // Draw top-left spiderweb
        const webSize = Math.min(width * 0.22, 180);
        for (let rad = 0; rad <= Math.PI / 2; rad += Math.PI / 10) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(rad) * webSize, Math.sin(rad) * webSize);
          ctx.stroke();
        }
        for (let r = 25; r <= webSize; r += 28) {
          ctx.beginPath();
          for (let rad = 0; rad <= Math.PI / 2; rad += Math.PI / 10) {
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            if (rad === 0) ctx.moveTo(x, y);
            else ctx.quadraticCurveTo(Math.cos(rad - Math.PI / 20) * (r * 0.92), Math.sin(rad - Math.PI / 20) * (r * 0.92), x, y);
          }
          ctx.stroke();
        }

        // Draw top-right spiderweb
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        for (let rad = 0; rad <= Math.PI / 2; rad += Math.PI / 10) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(rad) * webSize * 0.9, Math.sin(rad) * webSize * 0.9);
          ctx.stroke();
        }
        for (let r = 25; r <= webSize * 0.9; r += 28) {
          ctx.beginPath();
          for (let rad = 0; rad <= Math.PI / 2; rad += Math.PI / 10) {
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            if (rad === 0) ctx.moveTo(x, y);
            else ctx.quadraticCurveTo(Math.cos(rad - Math.PI / 20) * (r * 0.92), Math.sin(rad - Math.PI / 20) * (r * 0.92), x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
        ctx.restore();
      }

      // =============================================================
      // NEW YEAR: GLOWING "CURRENT YEAR" DISPLAY IN BACKGROUND
      // =============================================================
      if (activeHolidaySeason === "new_year") {
        ctx.save();
        const yearFontSize = Math.min(width * 0.16, 150);
        ctx.font = `900 ${yearFontSize}px 'Cinzel', 'Playfair Display', Georgia, serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textX = width / 2;
        const textY = height * 0.28;

        // Soft pulsing glow
        const glowPulse = 20 + Math.sin(frame * 0.04) * 10;
        ctx.shadowBlur = glowPulse;
        ctx.shadowColor = "rgba(245, 158, 11, 0.7)";

        // Golden metallic gradient fill for the current year
        const grad = ctx.createLinearGradient(textX - 150, textY - 60, textX + 150, textY + 60);
        grad.addColorStop(0, "rgba(251, 191, 36, 0.35)");
        grad.addColorStop(0.5, "rgba(254, 243, 199, 0.55)");
        grad.addColorStop(1, "rgba(245, 158, 11, 0.35)");

        ctx.fillStyle = grad;
        ctx.fillText(String(currentYear), textX, textY);

        // Thin golden outline for crisp luxury aesthetic
        ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
        ctx.lineWidth = 2.5;
        ctx.strokeText(String(currentYear), textX, textY);

        // Subtitle "HAPPY NEW YEAR"
        ctx.font = `bold ${Math.max(12, yearFontSize * 0.14)}px sans-serif`;
        ctx.fillStyle = "rgba(180, 83, 9, 0.6)";
        ctx.letterSpacing = "6px";
        ctx.shadowBlur = 6;
        ctx.fillText("✨ HAPPY NEW YEAR ✨", textX, textY + yearFontSize * 0.55);

        ctx.restore();

        // -----------------------------------------------------------
        // NEW YEAR: CONTINUOUS CELEBRATORY FIREWORKS
        // -----------------------------------------------------------
        if (frame % 50 === 0 || (frame % 30 === 0 && Math.random() > 0.55)) {
          rockets.push({
            x: rand(width * 0.1, width * 0.9),
            y: height + 10,
            targetY: rand(height * 0.12, height * 0.48),
            vy: rand(-10, -14),
            color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
            exploded: false,
          });
        }

        // Update & draw rockets
        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i];
          r.y += r.vy;
          r.vy *= 0.98;

          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = r.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = r.color;
          ctx.fill();

          if (r.y <= r.targetY || r.vy >= -1.5) {
            r.exploded = true;
            const sparkCount = Math.floor(rand(35, 55));
            for (let s = 0; s < sparkCount; s++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = rand(1.5, 6.5);
              sparks.push({
                x: r.x,
                y: r.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: r.color,
                size: rand(1.8, 3.4),
                decay: rand(0.012, 0.024),
              });
            }
            rockets.splice(i, 1);
          }
        }

        // Update & draw sparks
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.045; // gravity
          s.vx *= 0.985;
          s.alpha -= s.decay;

          if (s.alpha <= 0) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, s.alpha);
          ctx.fillStyle = s.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // =============================================================
      // PARTICLES (GHOSTS, BATS, SPIDERS, FALLING GIFTS, SNOW)
      // =============================================================
      particles.forEach((p) => {
        ctx.save();

        if (p.type === "ghost") {
          // Floating playful ghostly apparition
          p.extra = (p.extra || 0) + 0.03;
          p.x += p.vx + Math.sin(p.extra) * 0.7;
          p.y += p.vy;
          if (p.y < -60) {
            p.y = height + 40;
            p.x = rand(40, width - 40);
          }
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = p.alpha;

          ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
          ctx.shadowBlur = 14;
          ctx.shadowColor = "rgba(251, 146, 60, 0.55)";
          ctx.beginPath();
          const gh = p.size;
          const gw = p.size * 0.75;
          ctx.moveTo(0, -gh * 0.5);
          ctx.bezierCurveTo(gw, -gh * 0.5, gw, gh * 0.3, gw * 0.8, gh * 0.5);
          ctx.quadraticCurveTo(gw * 0.4, gh * 0.3, 0, gh * 0.5);
          ctx.quadraticCurveTo(-gw * 0.4, gh * 0.3, -gw * 0.8, gh * 0.5);
          ctx.bezierCurveTo(-gw, gh * 0.3, -gw, -gh * 0.5, 0, -gh * 0.5);
          ctx.closePath();
          ctx.fill();

          // Spooky eyes
          ctx.fillStyle = "#1C0D06";
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.ellipse(-gw * 0.28, -gh * 0.1, gw * 0.16, gh * 0.13, 0, 0, Math.PI * 2);
          ctx.ellipse(gw * 0.28, -gh * 0.1, gw * 0.16, gh * 0.13, 0, 0, Math.PI * 2);
          ctx.fill();

          // Little mouth
          ctx.beginPath();
          ctx.ellipse(0, gh * 0.08, gw * 0.12, gh * 0.12, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "spider") {
          // Crawling & dangling spider on thread
          p.extra = (p.extra || 0) + 0.025;
          p.y += Math.sin(p.extra) * 0.8;
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = p.alpha;

          // Silk thread going up to top
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -p.y);
          ctx.strokeStyle = "rgba(180, 170, 160, 0.45)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Spider body & head
          ctx.fillStyle = "#1C0D06";
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.arc(0, -p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Glowing eerie spider eyes
          ctx.fillStyle = "#EF4444";
          ctx.beginPath();
          ctx.arc(-2, -p.size * 0.35, 1.2, 0, Math.PI * 2);
          ctx.arc(2, -p.size * 0.35, 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Spider 8 animated legs
          ctx.strokeStyle = "#1C0D06";
          ctx.lineWidth = 1.3;
          for (let side = -1; side <= 1; side += 2) {
            for (let l = 0; l < 4; l++) {
              const legAngle = (l - 1.5) * 0.35;
              const legLen = p.size * 0.85;
              const midX = side * (p.size * 0.5 + Math.cos(legAngle) * legLen * 0.6);
              const midY = (l - 1.5) * 3 + Math.sin(frame * 0.12 + l) * 2.5;
              const endX = side * (p.size * 0.85 + Math.cos(legAngle) * legLen);
              const endY = midY + 4;
              ctx.beginPath();
              ctx.moveTo(side * 2, (l - 1.5) * 2);
              ctx.lineTo(midX, midY);
              ctx.lineTo(endX, endY);
              ctx.stroke();
            }
          }
        } else if (p.type === "gift") {
          // Falling wrapped holiday gift box with ribbon & bow
          p.x += p.vx + Math.sin(frame * 0.02 + p.y * 0.01) * 0.5;
          p.y += p.vy;
          p.rot += p.vRot;
          if (p.y > height + 35) {
            p.y = -35;
            p.x = rand(0, width);
          }
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha;

          const s = p.size;
          // Box Body
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fillRect(-s * 0.5, -s * 0.5, s, s);

          // Lid
          ctx.fillStyle = p.color;
          ctx.fillRect(-s * 0.55, -s * 0.55, s * 1.1, s * 0.28);

          // Gold Ribbon cross bands
          ctx.fillStyle = "#FBBF24";
          ctx.shadowBlur = 0;
          ctx.fillRect(-s * 0.1, -s * 0.55, s * 0.2, s * 1.05);
          ctx.fillRect(-s * 0.5, -s * 0.1, s, s * 0.2);

          // Decorative Ribbon Bow on top
          ctx.beginPath();
          ctx.arc(-s * 0.18, -s * 0.65, s * 0.18, 0, Math.PI * 2);
          ctx.arc(s * 0.18, -s * 0.65, s * 0.18, 0, Math.PI * 2);
          ctx.fill();

          // Center knot
          ctx.fillStyle = "#F59E0B";
          ctx.beginPath();
          ctx.arc(0, -s * 0.58, s * 0.09, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "crystal_snow") {
          // Intricate 6-pointed hexagonal crystalline snowflake
          p.x += p.vx + Math.sin(frame * 0.025 + (p.extra || 0)) * 0.9;
          p.y += p.vy;
          p.rot += p.vRot;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = rand(0, width);
          }
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha;

          ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
          ctx.lineWidth = 1.3;
          ctx.shadowBlur = 6;
          ctx.shadowColor = "rgba(186, 230, 253, 0.8)";

          const arm = p.size;
          // Draw 6 symmetrical arms with branching twigs
          for (let a = 0; a < 6; a++) {
            ctx.save();
            ctx.rotate((a * Math.PI) / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -arm);
            // Branch 1
            ctx.moveTo(0, -arm * 0.5);
            ctx.lineTo(-arm * 0.3, -arm * 0.7);
            ctx.moveTo(0, -arm * 0.5);
            ctx.lineTo(arm * 0.3, -arm * 0.7);
            // Branch 2
            ctx.moveTo(0, -arm * 0.8);
            ctx.lineTo(-arm * 0.2, -arm * 0.95);
            ctx.moveTo(0, -arm * 0.8);
            ctx.lineTo(arm * 0.2, -arm * 0.95);
            ctx.stroke();
            ctx.restore();
          }
          // Tiny center circle
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(0, 0, arm * 0.15, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "bat") {
          // Distinguishable flying bat with realistic scalloped wings, pointed ears, glowing eyes, and banking flight
          p.extra = (p.extra || 0) + 0.05;
          p.x += p.vx;
          p.y += p.vy + Math.sin(p.extra * 0.6) * 1.1;
          if (p.x > width + 60) {
            p.x = -60;
            p.y = rand(30, height * 0.65);
          }
          ctx.translate(p.x, p.y);

          // Flight banking/tilt
          const bank = Math.sin(p.extra * 0.6) * 0.15;
          ctx.rotate(bank);
          ctx.globalAlpha = p.alpha;

          const s = p.size;
          // Wing flapping cycle (-1 up, 1 down)
          const flap = Math.sin(frame * 0.24 + (p.extra || 0));
          const wingFlapY = flap * s * 0.55;

          // Bat Silhouette Color (Deep night black/espresso with soft shadowy drop)
          ctx.fillStyle = "#120803";
          ctx.shadowBlur = 6;
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";

          // --- LEFT WING (Scalloped 3-arc bat wing) ---
          ctx.beginPath();
          ctx.moveTo(-s * 0.15, -s * 0.1);
          // Upper wing arm leading to primary wing tip
          ctx.bezierCurveTo(
            -s * 0.6, -s * 0.65 + wingFlapY * 0.4,
            -s * 1.1, -s * 0.55 + wingFlapY * 0.8,
            -s * 1.55, -s * 0.25 + wingFlapY
          );
          // 1st trailing scallop
          ctx.quadraticCurveTo(
            -s * 1.25, -s * 0.05 + wingFlapY * 0.7,
            -s * 1.1, 0 + wingFlapY * 0.55
          );
          // 2nd trailing scallop
          ctx.quadraticCurveTo(
            -s * 0.85, s * 0.12 + wingFlapY * 0.4,
            -s * 0.65, s * 0.18 + wingFlapY * 0.3
          );
          // 3rd trailing scallop returning to hip
          ctx.quadraticCurveTo(
            -s * 0.4, s * 0.25 + wingFlapY * 0.15,
            -s * 0.15, s * 0.28
          );
          ctx.closePath();
          ctx.fill();

          // --- RIGHT WING (Mirrored scalloped 3-arc bat wing) ---
          ctx.beginPath();
          ctx.moveTo(s * 0.15, -s * 0.1);
          // Upper wing arm leading to primary wing tip
          ctx.bezierCurveTo(
            s * 0.6, -s * 0.65 + wingFlapY * 0.4,
            s * 1.1, -s * 0.55 + wingFlapY * 0.8,
            s * 1.55, -s * 0.25 + wingFlapY
          );
          // 1st trailing scallop
          ctx.quadraticCurveTo(
            s * 1.25, -s * 0.05 + wingFlapY * 0.7,
            s * 1.1, 0 + wingFlapY * 0.55
          );
          // 2nd trailing scallop
          ctx.quadraticCurveTo(
            s * 0.85, s * 0.12 + wingFlapY * 0.4,
            s * 0.65, s * 0.18 + wingFlapY * 0.3
          );
          // 3rd trailing scallop returning to hip
          ctx.quadraticCurveTo(
            s * 0.4, s * 0.25 + wingFlapY * 0.15,
            s * 0.15, s * 0.28
          );
          ctx.closePath();
          ctx.fill();

          // --- BAT BODY & HEAD ---
          // Torso
          ctx.beginPath();
          ctx.ellipse(0, s * 0.1, s * 0.22, s * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();

          // Head
          ctx.beginPath();
          ctx.arc(0, -s * 0.22, s * 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Pointed Ears
          ctx.beginPath();
          // Left ear
          ctx.moveTo(-s * 0.18, -s * 0.26);
          ctx.lineTo(-s * 0.24, -s * 0.52);
          ctx.lineTo(-s * 0.06, -s * 0.36);
          // Right ear
          ctx.moveTo(s * 0.18, -s * 0.26);
          ctx.lineTo(s * 0.24, -s * 0.52);
          ctx.lineTo(s * 0.06, -s * 0.36);
          ctx.fill();

          // Small bat tail membrane
          ctx.beginPath();
          ctx.moveTo(-s * 0.15, s * 0.32);
          ctx.lineTo(0, s * 0.48);
          ctx.lineTo(s * 0.15, s * 0.32);
          ctx.closePath();
          ctx.fill();

          // Glowing Sinister Eyes (Orange/Amber embers)
          ctx.fillStyle = "#F97316";
          ctx.shadowBlur = 4;
          ctx.shadowColor = "#EA580C";
          ctx.beginPath();
          ctx.arc(-s * 0.08, -s * 0.22, s * 0.045, 0, Math.PI * 2);
          ctx.arc(s * 0.08, -s * 0.22, s * 0.045, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "snow") {
          // Fluffy snow particles with sway
          p.x += p.vx + Math.sin(frame * 0.02 + (p.extra || 0)) * 0.8;
          p.y += p.vy;
          if (p.y > height + 10) {
            p.y = -10;
            p.x = rand(0, width);
          }
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 4;
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "star") {
          // Twinkle star
          p.extra = (p.extra || 0) + 0.04;
          const currentAlpha = p.alpha * (0.5 + 0.5 * Math.sin(p.extra));
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/g, `${currentAlpha})`);
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          if (p.size > 2.5) {
            ctx.strokeStyle = p.color.replace(/[\d.]+\)$/g, `${currentAlpha * 0.7})`);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-p.size * 2, 0);
            ctx.lineTo(p.size * 2, 0);
            ctx.moveTo(0, -p.size * 2);
            ctx.lineTo(0, p.size * 2);
            ctx.stroke();
          }
        } else if (p.type === "spark") {
          // Eerie orange ember
          p.y += p.vy;
          p.x += p.vx + Math.sin(frame * 0.03 + p.y * 0.02) * 0.4;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = rand(0, width);
          }
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "bubble") {
          // Champagne bubble
          p.y += p.vy;
          p.x += p.vx + Math.sin(frame * 0.05 + p.y * 0.02) * 0.3;
          if (p.y < -20) {
            p.y = height + 20;
            p.x = rand(0, width);
          }
          ctx.translate(p.x, p.y);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.beginPath();
          ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "confetti") {
          // Confetti
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vRot;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = rand(0, width);
          }
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 0.5, -p.size * 0.2, p.size, p.size * 0.4);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDarkMode, activeHolidaySeason, holidayAnimationActive, currentYear]);

  if (isDarkMode) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-700 ease-in-out"
    >
      {/* 1. High-Res Holiday Background Image Wallpaper */}
      {holidayConfig.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${holidayConfig.backgroundImage})`,
            opacity:
              activeHolidaySeason === "halloween"
                ? 0.70 // High visibility for the haunted castle & eerie cemetery!
                : activeHolidaySeason === "wet_season"
                ? 0.56 // Dramatic mist & rolling green rainstorm
                : activeHolidaySeason === "christmas_eve"
                ? 0.55
                : activeHolidaySeason === "christmas"
                ? 0.58
                : 0.52,
            filter:
              activeHolidaySeason === "halloween"
                ? "contrast(1.2) saturate(1.3) brightness(0.98)"
                : activeHolidaySeason === "wet_season"
                ? "contrast(1.06) saturate(1.15) brightness(0.98)"
                : "contrast(1.08) saturate(1.15)",
          }}
        />
      )}

      {/* 2. Interactive Canvas Particles: Falling snowflakes/gifts, fireworks, ghosts, bats, spiders */}
      {holidayAnimationActive && activeHolidaySeason !== "standard" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.95 }}
        />
      )}

      {/* 3. New Year Static Watermark (Always present in background even if animation is paused) */}
      {activeHolidaySeason === "new_year" && (
        <div className="absolute inset-x-0 top-24 flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
          <span className="font-serif font-black text-7xl sm:text-9xl tracking-widest text-amber-500/40">
            {currentYear}
          </span>
          <span className="text-xs font-bold tracking-[0.4em] text-amber-700/60 uppercase -mt-2">
            Happy New Year
          </span>
        </div>
      )}

      {/* 4. Soft Subtle Radial Vignette for Center Contrast & Readability */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background:
            activeHolidaySeason === "halloween"
              ? "radial-gradient(ellipse at center, transparent 55%, rgba(253, 248, 243, 0.45) 85%, rgba(253, 248, 243, 0.8) 100%)"
              : activeHolidaySeason === "wet_season"
              ? "radial-gradient(ellipse at center, transparent 55%, rgba(251, 247, 240, 0.45) 85%, rgba(251, 247, 240, 0.8) 100%)"
              : activeHolidaySeason === "christmas_eve"
              ? "radial-gradient(ellipse at center, transparent 55%, rgba(246, 249, 253, 0.5) 88%, rgba(246, 249, 253, 0.85) 100%)"
              : activeHolidaySeason === "christmas"
              ? "radial-gradient(ellipse at center, transparent 55%, rgba(252, 249, 246, 0.5) 88%, rgba(252, 249, 246, 0.85) 100%)"
              : activeHolidaySeason === "new_year"
              ? "radial-gradient(ellipse at center, transparent 55%, rgba(252, 250, 246, 0.5) 88%, rgba(252, 250, 246, 0.85) 100%)"
              : "radial-gradient(ellipse at center, transparent 60%, rgba(251, 247, 240, 0.5) 90%, rgba(251, 247, 240, 0.8) 100%)",
        }}
      />
    </div>
  );
};
