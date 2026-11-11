"use client";

import { useEffect, useState } from "react";
import CinematicIntro from "./components/CinematicIntro";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProductCatalog from "./components/ProductCatalog";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer, { CartItem } from "./components/CartDrawer";
import OurStory from "./components/OurStory";
import Footer from "./components/Footer";
import { SareeProduct, toProduct } from "./data/products";
import { fetchSarees } from "./lib/api";
import { Search, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type IntroMode = "pending" | "full" | "short" | "off";

export default function Home() {
  const [introMode, setIntroMode] = useState<IntroMode>("pending");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SareeProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<SareeProduct[]>([]);
  const [productsState, setProductsState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetchSarees(controller.signal)
      .then((list) => {
        setProducts(list.map(toProduct).filter((p): p is SareeProduct => p !== null));
        setProductsState("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setProductsState("error");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = localStorage.getItem("jas_intro_seen") === "1";
    } catch {
      seen = false;
    }
    // This state change initializes the client-only intro after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reduce) setIntroMode("off");
    else if (seen) setIntroMode("short");
    else setIntroMode("full");
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-gsap-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });

    return () => context.revert();
  }, []);

  const finishIntro = () => {
    try {
      localStorage.setItem("jas_intro_seen", "1");
    } catch {
      /* private browsing */
    }
    setIntroMode("off");
  };

  const handleAddToCart = (product: SareeProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.product.id === id) {
              const next = item.quantity + delta;
              return next > 0 ? { ...item, quantity: next } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[]
    );
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const showIntro = introMode === "full" || introMode === "short";

  return (
    <div id="top" className="paper-surface min-h-screen w-full max-w-full overflow-x-hidden text-[#432817] antialiased">
      {introMode === "pending" && <div className="paper-surface fixed inset-0 z-[80]" aria-hidden />}
      {showIntro && <CinematicIntro mode={introMode === "short" ? "short" : "full"} onComplete={finishIntro} />}

      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onReplayIntro={() => setIntroMode("full")}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main>
        <HeroSection />
        <ProductCatalog
          products={products}
          status={productsState}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onQuickView={setSelectedProduct}
          onAddToCart={handleAddToCart}
          searchQuery={searchQuery}
        />
        <OurStory />
      </main>

      <Footer onReplayIntro={() => setIntroMode("full")} />

      <ProductDetailModal
        key={selectedProduct?.id ?? "closed"}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(id) => setCart((prev) => prev.filter((item) => item.product.id !== id))}
      />

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#c7ba95]/90 px-4 pt-24 backdrop-blur-md">
          <div className="relative w-full max-w-2xl border border-[#9b7a3e]/40 bg-[#d6cba8] p-6 shadow-2xl">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-4 top-4 p-2 text-[#75521e]"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 flex items-center gap-3 border-b border-[#9b7a3e]/30 pb-4">
              <Search className="h-5 w-5 text-[#75521e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search weave, colour, or motif"
                autoFocus
                className="w-full bg-transparent font-editorial text-lg text-[#432817] placeholder-[#50351e]/55 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
