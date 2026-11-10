"use client";

import Image from "next/image";

export default function Footer({ onReplayIntro }: { onReplayIntro: () => void }) {
  return (
    <footer className="paper-surface border-t border-[#9b7a3e]/25 px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="inline-flex bg-[#3a1b0d] px-3 py-2">
          <Image src="/logo-mark.png" alt="JAS — Jai Ambe Sarees" width={160} height={140} className="h-12 w-auto" />
        </span>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.2em] text-[#75521e]">
          <a href="#top" className="hover:text-[#75521e]">Home</a>
          <a href="#featured" className="hover:text-[#75521e]">Shop</a>
          <a href="#story" className="hover:text-[#75521e]">Our story</a>
          <button type="button" onClick={onReplayIntro} className="hover:text-[#75521e]">Replay intro</button>
        </nav>
        <p className="text-xs text-[#50351e]/45">© {new Date().getFullYear()} JAS</p>
      </div>
    </footer>
  );
}
