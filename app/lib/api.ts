// Talks to the Spring Boot backend. The public list endpoint never includes the supplier number.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ApiSaree {
  id: number;
  type: string;
  price: number;
  imageUrl: string | null;
  title: string | null;
  description: string | null;
}

export function imageSrc(path: string): string {
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

export async function fetchSarees(signal?: AbortSignal): Promise<ApiSaree[]> {
  const res = await fetch(`${API_URL}/api/sarees`, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load sarees (${res.status})`);
  return res.json();
}
