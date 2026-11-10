export interface SareeProduct {
  id: string;
  name: string;
  collection: "Bridal" | "Banarasi" | "Kanchipuram" | "Organza" | "Festive";
  collectionLabel: string;
  price: number;
  originalPrice: number;
  weave: string;
  zari: string;
  color: string;
  fabric: string;
  loomDays: number;
  blousePiece: string;
  care: string;
  images: string[];
  description: string;
  silkMarkCertified: boolean;
  badge?: string;
  sku: string;
}

// Connect the product API here. The storefront intentionally starts with no demo records.
export const SAREE_PRODUCTS: SareeProduct[] = [];
