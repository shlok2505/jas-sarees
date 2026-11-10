"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SareeProduct } from "../data/products";
import { X, ShoppingBag, Clock, Sparkles, Check } from "lucide-react";

interface ProductDetailModalProps {
  product: SareeProduct | null;
  onClose: () => void;
  onAddToCart: (product: SareeProduct) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#c7ba95]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#d6cba8] border border-[#9b7a3e]/50 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#c7ba95]/80 border border-[#9b7a3e]/40 text-[#432817] hover:bg-[#d8b477] hover:text-[#140202] flex items-center justify-center transition-all cursor-pointer shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Imagery Gallery */}
          <div className="bg-[#c7ba95] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#9b7a3e]/20">
            {/* Primary Large Image */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-4 border border-[#9b7a3e]/30 shadow-inner">
              <Image
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.badge && <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#d6cba8]/90 border border-[#9b7a3e]/50 text-[10px] uppercase tracking-wider text-[#75521e] font-serif">
                {product.badge}
              </div>}
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === idx
                        ? "border-[#9b7a3e] scale-105"
                        : "border-[#9b7a3e]/25 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Detailed Saree Spec & Direct Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between text-[#432817] max-h-[80vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#75521e] font-serif mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#75521e]" />
                <span>{product.collectionLabel}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#52351b] font-normal mb-2 leading-tight">
                {product.name}
              </h2>

              <p className="text-xs text-[#50351e]/50 tracking-wider uppercase mb-4">
                SKU: {product.sku}
              </p>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-xl bg-[#c7ba95] border border-[#9b7a3e]/25">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#52351b]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-[#50351e]/40 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Weaving & Fabric Specifications */}
              <div className="space-y-3 mb-6 text-xs text-[#50351e]/80">
                <div className="flex justify-between border-b border-[#9b7a3e]/15 pb-2">
                  <span className="text-[#50351e]/60">Weaving Technique:</span>
                  <span className="text-[#432817] font-medium">{product.weave}</span>
                </div>
                <div className="flex justify-between border-b border-[#9b7a3e]/15 pb-2">
                  <span className="text-[#50351e]/60">Zari Purity:</span>
                  <span className="text-[#75521e] font-medium">{product.zari}</span>
                </div>
                <div className="flex justify-between border-b border-[#9b7a3e]/15 pb-2">
                  <span className="text-[#50351e]/60">Fabric Composition:</span>
                  <span className="text-[#432817] font-medium">{product.fabric}</span>
                </div>
                <div className="flex justify-between border-b border-[#9b7a3e]/15 pb-2">
                  <span className="text-[#50351e]/60">Artisan Loom Time:</span>
                  <span className="text-[#432817] font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#75521e]" />
                    {product.loomDays} Days of Handloom Craft
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#9b7a3e]/15 pb-2">
                  <span className="text-[#50351e]/60">Blouse Piece:</span>
                  <span className="text-[#432817] font-medium">{product.blousePiece}</span>
                </div>
              </div>

              {/* Narrative Story */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-widest text-[#75521e] font-serif mb-2">
                  Artisan Notes
                </h4>
                <p className="text-xs sm:text-sm text-[#50351e]/80 font-light leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Care Instructions */}
              <div className="p-3 rounded-lg bg-[#c7ba95]/60 border border-[#9b7a3e]/20 text-[11px] text-[#50351e]/70 mb-6">
                <span className="text-[#75521e] font-semibold">Care: </span>
                {product.care}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#9b7a3e]/25 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs uppercase tracking-widest font-serif font-semibold transition-all cursor-pointer ${
                  added
                    ? "bg-emerald-700 text-white"
                    : "bg-gradient-to-r from-[#b58a45] via-[#d8b477] to-[#b58a45] text-[#140202] hover:shadow-lg"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
