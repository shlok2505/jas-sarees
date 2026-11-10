"use client";

import Image from "next/image";

export default function OurStory() {
  return (
    <section id="story" className="paper-surface border-t border-[#9b7a3e]/15 px-4 py-24 sm:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div className="relative mx-auto aspect-square w-full max-w-[34rem] overflow-hidden border border-[#9b7a3e]/30 shadow-[0_18px_50px_rgba(58,27,13,0.18)]" data-gsap-reveal>
          <Image
            src="/logo-paper.png"
            alt="JAS emblem on textured brown paper"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#75521e]">Our story</p>
          <h2 className="font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
            Jai Ambe Sarees
          </h2>
          <div className="mt-6 space-y-4 font-editorial text-lg font-light leading-relaxed text-[#50351e]/80">
            <p>The JAS emblem brings together Durga’s gaze, a bindi, a lotus, and a flowing saree motif.</p>
            <p>A visual expression of devotion, heritage, and the art of the saree.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
