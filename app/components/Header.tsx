"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, Search, ShoppingBag, X } from "lucide-react";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onReplayIntro: () => void;
  onOpenSearch: () => void;
}

const NAV = [
  { href: "#featured", label: "Shop" },
  { href: "#story", label: "Our Story" },
];

export default function Header({
  cartCount,
  onOpenCart,
  onReplayIntro,
  onOpenSearch,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#d8b477]/25 bg-[#3a1b0d]/95 text-[#f3e6c8] backdrop-blur-md">
        <div className="relative mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#d8b477] lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.22em] text-[#f3e6c8]/90 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative transition-colors hover:text-[#e5cb93]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a href="#top" className="absolute left-1/2 flex -translate-x-1/2 items-center" title="Jai Ambe Sarees">
            <Image
              src="/logo-mark.png"
              alt="JAS"
              width={220}
              height={190}
              className="h-12 w-auto sm:h-14"
              priority
            />
          </a>

          <div className="flex items-center gap-2 text-[#d8b477] sm:gap-3">
            <button
              onClick={onReplayIntro}
              className="hidden border border-[#d8b477]/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#f3e6c8]/90 transition-colors hover:border-[#d8b477] hover:text-[#e5cb93] md:inline-flex"
            >
              Replay intro
            </button>
            <button onClick={onOpenSearch} className="p-2" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <button onClick={onOpenCart} className="relative p-2" aria-label="Shopping bag">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#881320] text-[9px] text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="flex flex-col gap-1 border-t border-[#d8b477]/20 bg-[#3a1b0d] px-6 py-5 text-sm uppercase tracking-[0.18em] text-[#f3e6c8] lg:hidden">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-[#d8b477]/20 py-3 hover:text-[#e5cb93]"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onReplayIntro();
              }}
              className="py-3 text-left text-[#d8b477]"
            >
              Replay intro
            </button>
          </div>
        )}
      </header>
    </>
  );
}
