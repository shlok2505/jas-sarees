"use client";

import { useEffect, useRef } from "react";

const SRC_W = 600;
const SRC_H = 739;
const STRIPS = 56;

interface SareeSilkWaveProps {
  playing?: boolean;
  intensity?: number;
  className?: string;
}

/**
 * Directional silk wave: vertical strips of the pallu PNG are offset with a
 * travelling sine. Amplitude is zero at the letter-S attachment (right) and
 * rises toward the free embroidered tip (left). Embroidery stays intact
 * because we never apply fractal displacement.
 */
export default function SareeSilkWave({
  playing = true,
  intensity = 1,
  className = "",
}: SareeSilkWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = SRC_W;
    canvas.height = SRC_H;

    const img = new Image();
    img.src = "/assets/logo/saree_pallu.png";
    let frame = 0;
    let raf = 0;
    let time = 0;
    let reduced = false;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced = media.matches;
    const onPref = () => {
      reduced = media.matches;
    };
    media.addEventListener("change", onPref);

    const stripW = SRC_W / STRIPS + 1.2;

    const draw = () => {
      ctx.clearRect(0, 0, SRC_W, SRC_H);
      if (!img.complete) return;

      if (reduced || !playingRef.current) {
        ctx.drawImage(img, 0, 0, SRC_W, SRC_H);
        return;
      }

      time += 0.016;
      for (let i = 0; i < STRIPS; i++) {
        const sx = (i / STRIPS) * SRC_W;
        // 0 at the S (right ~520), 1 at the free tip (left ~90)
        const along = Math.max(0, Math.min(1, (510 - sx) / 420));
        const falloff = along * along;
        const wave =
          Math.sin(time * 1.55 + i * 0.22) * 8.5 * falloff * intensity +
          Math.sin(time * 0.85 + i * 0.11) * 3.2 * falloff * intensity;
        const shear = Math.cos(time * 0.7 + i * 0.09) * 1.8 * falloff * intensity;
        ctx.drawImage(img, sx, 0, stripW, SRC_H, sx + shear, wave, stripW, SRC_H);
      }
    };

    const loop = () => {
      draw();
      frame++;
      raf = requestAnimationFrame(loop);
    };

    img.onload = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    if (img.complete) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      media.removeEventListener("change", onPref);
      cancelAnimationFrame(raf);
      void frame;
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={SRC_W}
      height={SRC_H}
      aria-hidden
    />
  );
}
