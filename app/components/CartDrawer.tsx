"use client";

import React from "react";
import Image from "next/image";
import { SareeProduct } from "../data/products";
import { X, Trash2, Sparkles } from "lucide-react";

export interface CartItem {
  product: SareeProduct;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#c7ba95]/80 backdrop-blur-sm transition-opacity">
      <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-[#9b7a3e]/30 bg-[#d6cba8] text-[#432817] shadow-[0_0_50px_rgba(0,0,0,0.9)] jas-slide-in">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#9b7a3e]/20 flex items-center justify-between bg-[#c7ba95]/60">
          <div>
            <h3 className="text-xl font-serif text-[#52351b]">Your Shopping Bag</h3>
            <p className="text-xs text-[#75521e] font-light mt-0.5">
              {items.length} {items.length === 1 ? "Heirloom Saree" : "Heirloom Sarees"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#c7ba95] text-[#75521e] hover:text-[#52351b] transition-colors cursor-pointer"
            aria-label="Close Shopping Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Items */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-[#50351e]/60">
              <Sparkles className="w-10 h-10 text-[#75521e]/40 mb-4 animate-pulse" />
              <p className="text-lg font-serif text-[#75521e]">Your bag is empty</p>
              <p className="text-xs mt-1 max-w-xs font-light">
                Discover our royal bridal trousseaus and ancestral Banarasi silk weaves.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="p-4 rounded-xl border border-[#9b7a3e]/20 bg-[#c7ba95]/70 flex gap-4"
              >
                <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-[#9b7a3e]/30">
                  <Image
                    src={item.product.image}
                    unoptimized
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-serif text-[#432817] leading-snug line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-[#75521e] font-light mt-0.5">
                      {item.product.type}
                    </p>
                    <p className="text-xs font-semibold text-[#52351b] mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#9b7a3e]/10">
                    <div className="flex items-center border border-[#9b7a3e]/40 rounded-md bg-[#d6cba8] text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="px-2.5 py-0.5 hover:text-[#75521e] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-serif">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="px-2.5 py-0.5 hover:text-[#75521e] cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-xs text-[#50351e]/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with WhatsApp Concierge Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#9b7a3e]/20 bg-[#c7ba95] space-y-4">
            <div className="space-y-1 text-xs text-[#50351e]/70">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-base font-serif font-semibold text-[#52351b]">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            {onCheckout && <button
              onClick={onCheckout}
              className="w-full bg-[#d8b477] px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#140202] transition-colors hover:bg-[#f1dfb8]"
            >
              Continue to checkout
            </button>}
          </div>
        )}
      </div>
    </div>
  );
}
