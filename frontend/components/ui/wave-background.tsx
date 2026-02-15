"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";

interface Wave {
  amplitude: number;
  frequency: number;
  speed: number;
  opacity: number;
  yOffset: number;
  phase: number;
}

const WAVES: Wave[] = [
  { amplitude: 40, frequency: 0.008, speed: 0.015, opacity: 0.06, yOffset: 0.35, phase: 0 },
  { amplitude: 55, frequency: 0.006, speed: 0.01, opacity: 0.04, yOffset: 0.45, phase: 2 },
  { amplitude: 30, frequency: 0.012, speed: 0.02, opacity: 0.05, yOffset: 0.55, phase: 4 },
  { amplitude: 45, frequency: 0.005, speed: 0.008, opacity: 0.03, yOffset: 0.65, phase: 1 },
];

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      timeRef.current += 1;
      ctx!.clearRect(0, 0, w, h);

      const isDark = themeRef.current === "dark";
      // Purple tones matching the brand primary
      const colors = isDark
        ? ["168,130,225", "140,100,210", "120,90,200", "150,120,220"]
        : ["140,80,200", "120,70,190", "160,100,210", "130,75,195"];

      for (let i = 0; i < WAVES.length; i++) {
        const wave = WAVES[i];
        const color = colors[i];

        ctx!.beginPath();
        ctx!.moveTo(0, h);

        for (let x = 0; x <= w; x += 3) {
          const y =
            h * wave.yOffset +
            Math.sin(x * wave.frequency + timeRef.current * wave.speed + wave.phase) *
              wave.amplitude +
            Math.sin(x * wave.frequency * 0.5 + timeRef.current * wave.speed * 0.7) *
              wave.amplitude * 0.3;
          if (x === 0) {
            ctx!.moveTo(x, y);
          } else {
            ctx!.lineTo(x, y);
          }
        }

        ctx!.lineTo(w, h);
        ctx!.lineTo(0, h);
        ctx!.closePath();

        ctx!.fillStyle = `rgba(${color}, ${wave.opacity})`;
        ctx!.fill();
      }

      // Top fade — blend into background
      const topGrad = ctx!.createLinearGradient(0, 0, 0, h * 0.15);
      const bgFill = isDark ? "11,15,28" : "255,255,255";
      topGrad.addColorStop(0, `rgba(${bgFill}, 1)`);
      topGrad.addColorStop(1, `rgba(${bgFill}, 0)`);
      ctx!.fillStyle = topGrad;
      ctx!.fillRect(0, 0, w, h * 0.15);

      // Bottom fade
      const botGrad = ctx!.createLinearGradient(0, h * 0.85, 0, h);
      botGrad.addColorStop(0, `rgba(${bgFill}, 0)`);
      botGrad.addColorStop(1, `rgba(${bgFill}, 1)`);
      ctx!.fillStyle = botGrad;
      ctx!.fillRect(0, h * 0.85, w, h * 0.15);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
