"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { SareeProduct } from "../data/products";

interface ProductCatalogProps {
  products: SareeProduct[];
  status: "loading" | "ready" | "error";
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onQuickView: (product: SareeProduct) => void;
  onAddToCart: (product: SareeProduct) => void;
  searchQuery?: string;
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

export default function ProductCatalog({
  products,
  status,
  selectedCategory,
  onCategoryChange,
  onQuickView,
  onAddToCart,
  searchQuery = "",
}: ProductCatalogProps) {
  const [addedId, setAddedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const categories = ["All", ...new Set(products.map((product) => product.type))];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCat = selectedCategory === "All" || prod.type === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.type.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="featured" className="paper-surface border-t border-[#9b7a3e]/15 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#9b7a3e]/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#75521e]">The atelier</p>
            <h2 className="font-serif text-3xl tracking-tight sm:text-5xl">Featured sarees</h2>
          </div>
          {products.length > 0 && <label className="text-[11px] uppercase tracking-[0.18em] text-[#50351e]/50">
            Sort
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="ml-3 border border-[#9b7a3e]/35 bg-[#c7ba95] px-3 py-2 text-[#75521e] focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>}
        </div>

        {products.length > 0 && <div className="mb-12 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors ${
                selectedCategory === category
                  ? "bg-[#d8b477] text-[#140202]"
                  : "border border-[#9b7a3e]/30 text-[#50351e]/80 hover:border-[#9b7a3e]"
              }`}
            >
              {category === "All" ? "All" : category}
            </button>
          ))}
        </div>}

        {filteredProducts.length === 0 && (
          <p className="py-16 text-center font-editorial text-lg text-[#75521e]">
            {status === "loading"
              ? "Unfolding the collection…"
              : status === "error"
                ? "We couldn't load the collection right now. Please try again shortly."
                : products.length === 0
                  ? "The collection will appear here soon."
                  : "No sarees match that search."}
          </p>
        )}

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article key={product.id} className="flex flex-col" data-gsap-reveal>
              <button
                type="button"
                onClick={() => onQuickView(product)}
                className="group relative mb-4 aspect-[3/4] overflow-hidden bg-[#c7ba95]"
              >
                <Image
                  src={product.image}
                  unoptimized
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </button>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#75521e]">{product.type}</p>
              <h3 className="mt-1 font-serif text-lg leading-snug">{product.name}</h3>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-editorial text-xl text-[#52351b]">{formatPrice(product.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product);
                    setAddedId(product.id);
                    setTimeout(() => setAddedId(null), 1600);
                  }}
                  className="text-[10px] uppercase tracking-[0.18em] text-[#75521e] hover:text-[#75521e]"
                >
                  {addedId === product.id ? "Added" : "Add to bag"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
