"use client";

export default function HeroSection() {
  return (
    <section className="paper-surface relative flex min-h-[88vh] items-end overflow-hidden px-4 pb-16 pt-24 sm:px-8 sm:pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_28%,rgba(181,138,69,0.18),transparent_42%),radial-gradient(ellipse_at_center,transparent_0%,rgba(87,57,28,0.14)_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-[#75521e]">
          Jai Ambe Sarees · Handloom Couture
        </p>
        <h1 className="max-w-3xl font-serif text-4xl leading-[1.12] tracking-tight text-[#432817] sm:text-6xl md:text-7xl">
          Woven in prayer.
          <span className="mt-2 block italic text-[#75521e]">Worn in grace.</span>
        </h1>
        <p className="mt-6 max-w-xl font-editorial text-lg font-light leading-relaxed text-[#50351e]/80 sm:text-xl">
          Banarasi, Kanjivaram and bridal silks from master looms — each drape a quiet offering
          of gold zari, temple borders and living craft.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#featured"
            className="inline-flex items-center justify-center bg-[#d8b477] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#140202] transition-colors hover:bg-[#f1dfb8]"
          >
            Enter the atelier
          </a>
          <a
            href="#story"
            className="inline-flex items-center justify-center border border-[#9b7a3e]/50 px-8 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[#432817] transition-colors hover:border-[#9b7a3e]"
          >
            Discover JAS
          </a>
        </div>
      </div>
    </section>
  );
}
