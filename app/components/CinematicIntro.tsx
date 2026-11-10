"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import SareeSilkWave from "./SareeSilkWave";
import {
  leftClosedSeam,
  leftEyeClip,
  leftUpperLid,
  rightClosedSeam,
  rightEyeClip,
  rightUpperLid,
} from "../lib/logoEyes";

const INTRO_ASSETS = [
  "/assets/logo/eyes_full.png",
  "/assets/logo/bindi.png",
  "/assets/logo/crown.png",
  "/assets/logo/letter_j.png",
  "/assets/logo/letter_a.png",
  "/assets/logo/letter_s.png",
  "/assets/logo/saree_pallu.png",
  "/assets/logo/lotus.png",
  "/assets/logo/accent_rules.png",
  "/assets/logo/tagline.png",
  "/assets/logo/bottom_rule.png",
];

interface CinematicIntroProps {
  onComplete: () => void;
  mode?: "full" | "short";
}

export default function CinematicIntro({
  onComplete,
  mode = "full",
}: CinematicIntroProps) {
  const [assetsReady, setAssetsReady] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const dustRef = useRef<HTMLCanvasElement | null>(null);
  const logoStageRef = useRef<HTMLDivElement | null>(null);
  const leftClipRef = useRef<SVGPathElement | null>(null);
  const rightClipRef = useRef<SVGPathElement | null>(null);
  const leftLidRef = useRef<SVGPathElement | null>(null);
  const rightLidRef = useRef<SVGPathElement | null>(null);
  const leftSeamRef = useRef<SVGPathElement | null>(null);
  const rightSeamRef = useRef<SVGPathElement | null>(null);
  const browsRef = useRef<SVGGElement | null>(null);
  const irisesRef = useRef<SVGGElement | null>(null);
  const bindiRef = useRef<SVGGElement | null>(null);
  const crownRef = useRef<SVGImageElement | null>(null);
  const letterJRef = useRef<SVGImageElement | null>(null);
  const letterARef = useRef<SVGImageElement | null>(null);
  const letterSRef = useRef<SVGImageElement | null>(null);
  const maskJRef = useRef<SVGRectElement | null>(null);
  const maskARef = useRef<SVGRectElement | null>(null);
  const maskSRef = useRef<SVGRectElement | null>(null);
  const palluRef = useRef<HTMLDivElement | null>(null);
  const lotusRef = useRef<SVGImageElement | null>(null);
  const rulesRef = useRef<SVGGElement | null>(null);
  const taglineRef = useRef<SVGImageElement | null>(null);
  const bottomRef = useRef<SVGImageElement | null>(null);
  const shimmerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const skipped = useRef(false);

  useEffect(() => {
    let active = true;
    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const image = new window.Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;
        if (image.complete) resolve();
      });

    void Promise.all(INTRO_ASSETS.map(preload)).then(() => {
      if (active) setAssetsReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const exitToSite = useCallback(() => {
    const tl = gsap.timeline({
      onComplete,
    });
    tl.to(glowRef.current, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 0);
    tl.to(
      rootRef.current,
      {
        backgroundColor: "rgba(58,27,13,0)",
        duration: 1.05,
        ease: "power2.inOut",
      },
      0.1
    );
    tl.to(
      logoStageRef.current,
      {
        y: -220,
        scale: 0.22,
        opacity: 0.15,
        duration: 1.05,
        ease: "power3.inOut",
      },
      0.05
    );
    tl.to(rootRef.current, { opacity: 0, duration: 0.35 }, 0.85);
  }, [onComplete]);

  const skip = () => {
    if (skipped.current) return;
    skipped.current = true;
    timelineRef.current?.kill();
    exitToSite();
  };

  useEffect(() => {
    const canvas = dustRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const n = w < 700 ? 16 : 32;
    const particles = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.28 + 0.08),
      vx: (Math.random() - 0.5) * 0.14,
      a: Math.random() * 0.45 + 0.12,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -8) {
          p.y = h + 8;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216,180,119,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!assetsReady) return;

    const applyEye = (leftT: number, rightT = leftT) => {
      leftClipRef.current?.setAttribute("d", leftEyeClip(leftT));
      rightClipRef.current?.setAttribute("d", rightEyeClip(rightT));
      leftLidRef.current?.setAttribute("d", leftUpperLid(leftT));
      rightLidRef.current?.setAttribute("d", rightUpperLid(rightT));
    };

    applyEye(0);

    gsap.set(
      [
        crownRef.current,
        bindiRef.current,
        lotusRef.current,
        rulesRef.current,
        taglineRef.current,
        bottomRef.current,
        palluRef.current,
        shimmerRef.current,
      ],
      { opacity: 0 }
    );
    gsap.set(irisesRef.current, { opacity: 1 });
    gsap.set(browsRef.current, { opacity: 0 });
    gsap.set([maskJRef.current, maskARef.current, maskSRef.current], {
      attr: { width: 0, height: 300 },
    });
    const eye = { progress: 0 };
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        if (!skipped.current) exitToSite();
      },
    });
    timelineRef.current = tl;

    if (mode === "short") {
      applyEye(1);
      gsap.set(
        [
          browsRef.current,
          bindiRef.current,
          crownRef.current,
          lotusRef.current,
          rulesRef.current,
          taglineRef.current,
          bottomRef.current,
          palluRef.current,
        ],
        { opacity: 1 }
      );
      gsap.set([leftSeamRef.current, rightSeamRef.current, leftLidRef.current, rightLidRef.current], {
        opacity: 0,
      });
      gsap.set(
        [maskJRef.current, maskARef.current, maskSRef.current],
        { attr: { width: [190, 280, 175], height: 300 } }
      );
      tl.to(glowRef.current, { opacity: 0.5, duration: 0.4 });
      tl.to({}, { duration: 1.1 });
      return () => tl.kill();
    }

    tl.to(glowRef.current, { opacity: 0.55, duration: 1.4, ease: "power1.inOut" }, 0);
    tl.to(browsRef.current, { opacity: 1, duration: 1.3, ease: "power2.out" }, 0.25);
    tl.to([leftSeamRef.current, rightSeamRef.current], { opacity: 1, duration: 0.8 }, 0.4);

    tl.to(
      eye,
      {
        progress: 1,
        duration: 2.55,
        ease: "power2.inOut",
        onUpdate: () => applyEye(eye.progress),
      },
      1.7
    );
    tl.to(
      [leftSeamRef.current, rightSeamRef.current],
      { opacity: 0, duration: 1.1, ease: "power2.out" },
      2.15
    );
    tl.to(
      [leftLidRef.current, rightLidRef.current],
      { opacity: 0.35, duration: 1.2 },
      3.5
    );
    tl.to([leftLidRef.current, rightLidRef.current], { opacity: 0, duration: 0.6 }, 4.3);

    tl.to(bindiRef.current, { opacity: 1, duration: 0.9, ease: "power2.out" }, 4.05);
    tl.fromTo(
      bindiRef.current,
      { filter: "brightness(1.8)" },
      { filter: "brightness(1)", duration: 1.1 },
      4.05
    );
    tl.to(crownRef.current, { opacity: 1, duration: 0.9, ease: "power2.out" }, 4.45);

    const revealLetter = (mask: SVGRectElement | null, width: number, at: number) => {
      tl.to(mask, { attr: { width }, duration: 0.85, ease: "power2.inOut" }, at);
    };
    revealLetter(maskJRef.current, 190, 5.15);
    revealLetter(maskARef.current, 280, 5.95);
    revealLetter(maskSRef.current, 175, 6.75);

    tl.to(palluRef.current, { opacity: 1, duration: 1.15, ease: "power2.out" }, 7.35);
    tl.to(lotusRef.current, { opacity: 1, duration: 0.9, ease: "power2.out" }, 8.55);
    tl.to(rulesRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" }, 8.85);
    tl.to(taglineRef.current, { opacity: 1, duration: 1.0, ease: "power2.out" }, 9.1);
    tl.to(bottomRef.current, { opacity: 1, duration: 0.7, ease: "power2.out" }, 9.35);
    tl.fromTo(
      shimmerRef.current,
      { x: "-120%", opacity: 0.7 },
      { x: "120%", opacity: 0, duration: 1.4, ease: "power1.inOut" },
      9.7
    );
    tl.to({}, { duration: 1.35 });

    return () => {
      tl.kill();
    };
  }, [assetsReady, exitToSite, mode]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#3a1b0d] text-[#f7f0e5]"
      role="dialog"
      aria-label="JAS cinematic introduction"
    >
      <canvas ref={dustRef} className="absolute inset-0 pointer-events-none opacity-80" />
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(216,180,119,0.22) 0%, rgba(74,36,18,0.35) 42%, rgba(58,27,13,0) 72%)",
          filter: "blur(28px)",
        }}
      />

      <button
        type="button"
        onClick={skip}
        className="absolute right-5 top-5 z-20 border border-[#d8b477]/35 bg-[#241206]/55 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[#f7f0e5] backdrop-blur-sm transition-colors hover:border-[#d8b477] hover:text-[#d8b477] sm:right-8 sm:top-8"
      >
        Skip intro
      </button>

      <div
        ref={logoStageRef}
        className="relative z-10 w-[min(92vw,480px)] origin-center aspect-[600/739]"
      >
        <svg
          viewBox="0 0 600 739"
          className="absolute inset-0 z-[1] h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id="jas-left-eye">
              <path ref={leftClipRef} d={leftEyeClip(0)} />
            </clipPath>
            <clipPath id="jas-right-eye">
              <path ref={rightClipRef} d={rightEyeClip(0)} />
            </clipPath>
            <clipPath id="jas-brows-only">
              <rect x="0" y="120" width="600" height="72" />
            </clipPath>
            <mask id="jas-mask-j">
              <rect ref={maskJRef} x="0" y="290" width="0" height="300" fill="white" />
            </mask>
            <mask id="jas-mask-a">
              <rect ref={maskARef} x="175" y="288" width="0" height="300" fill="white" />
            </mask>
            <mask id="jas-mask-s">
              <rect ref={maskSRef} x="400" y="288" width="0" height="300" fill="white" />
            </mask>
            <clipPath id="jas-letter-a-body">
              <rect x="175" y="288" width="280" height="230" />
            </clipPath>
          </defs>

          <g ref={browsRef} clipPath="url(#jas-brows-only)" opacity="0">
            <image href="/assets/logo/eyes_full.png" x="0" y="0" width="600" height="739" />
          </g>

          <g ref={irisesRef}>
            <g clipPath="url(#jas-left-eye)">
              <image href="/assets/logo/eyes_full.png" x="0" y="0" width="600" height="739" />
            </g>
            <g clipPath="url(#jas-right-eye)">
              <image href="/assets/logo/eyes_full.png" x="0" y="0" width="600" height="739" />
            </g>
          </g>

          <path
            ref={leftSeamRef}
            d={leftClosedSeam()}
            stroke="#e8d4a0"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
            opacity="0"
          />
          <path
            ref={rightSeamRef}
            d={rightClosedSeam()}
            stroke="#e8d4a0"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
            opacity="0"
          />
          <path
            ref={leftLidRef}
            d={leftUpperLid(0)}
            stroke="#ead7a8"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            ref={rightLidRef}
            d={rightUpperLid(0)}
            stroke="#ead7a8"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />

          <g ref={bindiRef} opacity="0">
            <circle cx="301" cy="170" r="28" fill="#c0101b" opacity="0.28" />
            <image href="/assets/logo/bindi.png" x="0" y="0" width="600" height="739" />
          </g>

          <image
            ref={crownRef}
            href="/assets/logo/crown.png"
            x="0"
            y="0"
            width="600"
            height="739"
            opacity="0"
          />

          <image
            ref={letterJRef}
            href="/assets/logo/letter_j.png"
            x="0"
            y="0"
            width="600"
            height="739"
            mask="url(#jas-mask-j)"
          />

          <g clipPath="url(#jas-letter-a-body)">
            <image
              ref={letterARef}
              href="/assets/logo/letter_a.png"
              x="0"
              y="0"
              width="600"
              height="739"
              mask="url(#jas-mask-a)"
            />
          </g>

        </svg>

        <div ref={palluRef} className="absolute inset-0 z-[2] opacity-0">
          <SareeSilkWave className="h-full w-full" playing intensity={1} />
        </div>

        <svg
          viewBox="0 0 600 739"
          className="absolute inset-0 z-[3] h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id="jas-rules-clip">
              <rect x="0" y="612" width="230" height="28" />
              <rect x="370" y="612" width="230" height="28" />
            </clipPath>
          </defs>
          <image
            ref={letterSRef}
            href="/assets/logo/letter_s.png"
            x="0"
            y="0"
            width="600"
            height="739"
            mask="url(#jas-mask-s)"
          />

          <image
            ref={lotusRef}
            href="/assets/logo/lotus.png"
            x="0"
            y="0"
            width="600"
            height="739"
            opacity="0"
          />
          <g ref={rulesRef} opacity="0">
            <image
              href="/assets/logo/accent_rules.png"
              x="0"
              y="0"
              width="600"
              height="739"
              clipPath="url(#jas-rules-clip)"
            />
          </g>
          <image
            ref={taglineRef}
            href="/assets/logo/tagline.png"
            x="0"
            y="0"
            width="600"
            height="739"
            opacity="0"
          />
          <image
            ref={bottomRef}
            href="/assets/logo/bottom_rule.png"
            x="0"
            y="0"
            width="600"
            height="739"
            opacity="0"
          />
        </svg>

        <div
          ref={shimmerRef}
          className="pointer-events-none absolute inset-0 z-10 opacity-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(241,223,184,0.35) 50%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
