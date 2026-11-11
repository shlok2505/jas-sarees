import { ApiSaree, imageSrc } from "../lib/api";

// Only what the backend actually stores: type, price, photo, AI title + description.
export interface SareeProduct {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  description: string;
}

// Listings without a photo can't be shown in a shop, so they are skipped.
export function toProduct(s: ApiSaree): SareeProduct | null {
  if (!s.imageUrl) return null;
  return {
    id: String(s.id),
    name: s.title?.trim() || `${s.type} Saree`,
    type: s.type,
    price: s.price,
    image: imageSrc(s.imageUrl),
    description: s.description?.trim() ?? "",
  };
}
