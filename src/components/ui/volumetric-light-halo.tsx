import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export interface VolumetricLightHaloProps {
  className?: string;
  children?: React.ReactNode;
  arcPosition?: number; // 0.0 (top) to 1.0 (bottom), default ~0.72
  beamIntensity?: number; // 0.5 to 1.5
  accentColor?: string; // "teal" | "cyan" | "lime"
}

interface LightBeamStreak {
  xPercent: number; // percentage of width (0.2 to 0.8)
  height: number;
  width: number;
  speed: number;
  phase: number;
  opacity: number;
  colorType: "white" | "cyan" | "teal";
}

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedY: number;
  speedX: number;
  pulsePhase: number;
}

export function VolumetricLightHalo({
  className,
  children,
  arcPosition = 0.72,
  beamIntensity = 1.0,
}: VolumetricLightHaloProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 1920);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 900);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    window.addEventListener("resize", handleResize);

    // Initialize 36 randomized vertical light rays
    const streaks: LightBeamStreak[] = Array.from({ length: 36 }, () => ({
      xPercent: 0.18 + Math.random() * 0.64,
      height: 120 + Math.random() * 320,
      width: 1.2 + Math.random() * 2.8,
      speed: 0.0015 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.35 + Math.random() * 0.55,
      colorType: Math.random() > 0.4 ? "cyan" : Math.random() > 0.5 ? "white" : "teal",
    }));

    // Initialize 70 cosmic stardust particles
    const particles: Particle[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.8 + Math.random() * 1.8,
      alpha: 0.1 + Math.random() * 0.6,
      speedY: -0.15 - Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.2,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, width, height);

      const dpr = window.devicePixelRatio || 1;
      const horizonY = height * arcPosition;
      const centerX = width / 2;

      // -----------------------------------------------------------------------
      // 1. DEEP SPACE AMBIENT CANVAS (Midnight Navy -> Deep Space Void)
      // -----------------------------------------------------------------------
      const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
      baseGrad.addColorStop(0, "#010810");
      baseGrad.addColorStop(0.4, "#02121E");
      baseGrad.addColorStop(0.7, "#031C2C");
      baseGrad.addColorStop(1, "#01070D");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Atmospheric radial glow behind the halo
      const atmosGlow = ctx.createRadialGradient(
        centerX,
        horizonY,
        10 * dpr,
        centerX,
        horizonY - 50 * dpr,
        width * 0.55
      );
      atmosGlow.addColorStop(0, "rgba(31, 132, 118, 0.42)"); // ServiceNow Teal
      atmosGlow.addColorStop(0.25, "rgba(22, 108, 97, 0.25)");
      atmosGlow.addColorStop(0.55, "rgba(3, 45, 66, 0.2)");
      atmosGlow.addColorStop(1, "rgba(1, 8, 16, 0)");
      ctx.fillStyle = atmosGlow;
      ctx.fillRect(0, 0, width, height);

      // Switch to Additive Blending for Photographic Volumetric Bloom
      ctx.globalCompositeOperation = "lighter";

      // -----------------------------------------------------------------------
      // 2. MAIN VERTICAL VOLUMETRIC LIGHT PILLAR (The Central God-Ray)
      // -----------------------------------------------------------------------
      const pulse = Math.sin(elapsed * 0.0018) * 0.12 + 0.88; // subtle breathing
      const pillarWidth = 140 * dpr * pulse * beamIntensity;
      const pillarHeight = horizonY * 0.98;

      // Vertical shaft gradient
      const pillarGrad = ctx.createLinearGradient(centerX, horizonY, centerX, horizonY - pillarHeight);
      pillarGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      pillarGrad.addColorStop(0.12, "rgba(224, 242, 254, 0.85)");
      pillarGrad.addColorStop(0.35, "rgba(56, 189, 248, 0.45)");
      pillarGrad.addColorStop(0.65, "rgba(31, 132, 118, 0.22)");
      pillarGrad.addColorStop(1, "rgba(2, 18, 30, 0)");

      // Draw tapered central light beam
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX - pillarWidth * 0.6, horizonY);
      ctx.lineTo(centerX - pillarWidth * 0.15, horizonY - pillarHeight);
      ctx.lineTo(centerX + pillarWidth * 0.15, horizonY - pillarHeight);
      ctx.lineTo(centerX + pillarWidth * 0.6, horizonY);
      ctx.closePath();
      ctx.fillStyle = pillarGrad;
      ctx.fill();

      // Sharp intense core laser at the very center
      const coreGrad = ctx.createLinearGradient(centerX, horizonY, centerX, horizonY - pillarHeight * 0.7);
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
      coreGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.75)");
      coreGrad.addColorStop(0.6, "rgba(186, 230, 253, 0.2)");
      coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.moveTo(centerX - 10 * dpr, horizonY);
      ctx.lineTo(centerX - 2 * dpr, horizonY - pillarHeight * 0.7);
      ctx.lineTo(centerX + 2 * dpr, horizonY - pillarHeight * 0.7);
      ctx.lineTo(centerX + 10 * dpr, horizonY);
      ctx.closePath();
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.restore();

      // -----------------------------------------------------------------------
      // 3. CURVED PLANETARY HORIZON HALO ARC
      // -----------------------------------------------------------------------
      // Arc curvature setup: circle center placed deep below the horizon
      const arcRadius = width * 1.35;
      const arcCenterY = horizonY + arcRadius - 40 * dpr;

      ctx.save();
      // Outer soft aura around the arc
      ctx.beginPath();
      ctx.arc(centerX, arcCenterY, arcRadius, Math.PI * 1.18, Math.PI * 1.82);
      ctx.lineWidth = 14 * dpr;
      const auraGrad = ctx.createLinearGradient(centerX - width * 0.45, 0, centerX + width * 0.45, 0);
      auraGrad.addColorStop(0, "rgba(3, 45, 66, 0)");
      auraGrad.addColorStop(0.3, "rgba(31, 132, 118, 0.5)");
      auraGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.85)");
      auraGrad.addColorStop(0.7, "rgba(31, 132, 118, 0.5)");
      auraGrad.addColorStop(1, "rgba(3, 45, 66, 0)");
      ctx.strokeStyle = auraGrad;
      ctx.stroke();

      // Razor-sharp luminous white rim
      ctx.beginPath();
      ctx.arc(centerX, arcCenterY, arcRadius, Math.PI * 1.22, Math.PI * 1.78);
      ctx.lineWidth = 3.5 * dpr;
      const sharpGrad = ctx.createLinearGradient(centerX - width * 0.35, 0, centerX + width * 0.35, 0);
      sharpGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      sharpGrad.addColorStop(0.35, "rgba(224, 242, 254, 0.8)");
      sharpGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
      sharpGrad.addColorStop(0.65, "rgba(224, 242, 254, 0.8)");
      sharpGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = sharpGrad;
      ctx.stroke();
      ctx.restore();

      // -----------------------------------------------------------------------
      // 4. ASCENDING VERTICAL LIGHT STREAKS / GOD RAYS
      // -----------------------------------------------------------------------
      streaks.forEach((streak) => {
        const x = width * streak.xPercent;
        // Calculate Y on the curved circle so streaks emerge directly from the arc
        const dx = x - centerX;
        const dy = Math.sqrt(Math.max(0, arcRadius * arcRadius - dx * dx));
        const startY = arcCenterY - dy;

        // Flicker & pulse calculation
        const streakPulse = (Math.sin(elapsed * streak.speed + streak.phase) + 1) * 0.5;
        const currentOpacity = streak.opacity * (0.6 + streakPulse * 0.4) * beamIntensity;
        const currentHeight = streak.height * dpr * (0.8 + streakPulse * 0.4);

        const streakGrad = ctx.createLinearGradient(x, startY + 20 * dpr, x, startY - currentHeight);
        if (streak.colorType === "white") {
          streakGrad.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
          streakGrad.addColorStop(0.4, `rgba(224, 242, 254, ${currentOpacity * 0.7})`);
          streakGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        } else if (streak.colorType === "cyan") {
          streakGrad.addColorStop(0, `rgba(56, 189, 248, ${currentOpacity})`);
          streakGrad.addColorStop(0.5, `rgba(34, 211, 238, ${currentOpacity * 0.6})`);
          streakGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
        } else {
          streakGrad.addColorStop(0, `rgba(98, 216, 78, ${currentOpacity * 0.7})`); // ServiceNow Electric Lime hint
          streakGrad.addColorStop(0.5, `rgba(31, 132, 118, ${currentOpacity * 0.5})`);
          streakGrad.addColorStop(1, "rgba(31, 132, 118, 0)");
        }

        ctx.lineWidth = streak.width * dpr;
        ctx.strokeStyle = streakGrad;
        ctx.beginPath();
        ctx.moveTo(x, startY + 15 * dpr);
        ctx.lineTo(x, startY - currentHeight);
        ctx.stroke();
      });

      // -----------------------------------------------------------------------
      // 5. FLOATING COSMIC PARTICLES / STARDUST
      // -----------------------------------------------------------------------
      particles.forEach((p) => {
        p.y += p.speedY * dpr;
        p.x += p.speedX * dpr;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        const particlePulse = Math.sin(elapsed * 0.002 + p.pulsePhase) * 0.3 + 0.7;
        const alpha = p.alpha * particlePulse;

        ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Restore normal blending for subsequent operations
      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [arcPosition, beamIntensity]);

  return (
    <div className={cn("relative w-full overflow-hidden bg-[#010810]", className)}>
      {/* Hardware-Accelerated Volumetric Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
      />

      {/* Vignette & Soft Gradient Masks */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(1,8,16,0.65)_100%)]" />

      {/* Bottom seamless dissolve into light canvas */}
      <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 pointer-events-none bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent" />

      {/* Foreground Hero Content Container */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
export default VolumetricLightHalo;

