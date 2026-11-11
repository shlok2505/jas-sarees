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

export interface OrderInput {
  customerName: string;
  customerPhone: string;
  address: string;
  pincode: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface OrderConfirmation {
  id: number;
  sareeId: number;
  sareeTitle: string | null;
  price: number;
  status: string;
  createdAt: string;
}

export class OrderError extends Error {
  httpStatus: number;
  constructor(httpStatus: number) {
    super(`Order failed (${httpStatus})`);
    this.httpStatus = httpStatus;
  }
}

// The backend takes one saree per order.
export async function placeOrder(sareeId: number, input: OrderInput): Promise<OrderConfirmation> {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sareeId, ...input }),
  });
  if (!res.ok) throw new OrderError(res.status);
  return res.json();
}

// ---------- Payments ----------
export type PaymentMethod = "UPI" | "COD";

// Cash on delivery is only offered above this price. The backend enforces the same rule.
export const COD_MIN_PRICE = 500;
// Set NEXT_PUBLIC_UPI_ID in .env.local (e.g. shopname@bank) to show the UPI ID and a "Pay with UPI app" button.
export const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? "";

// ---------- Admin ----------
export type OrderStatus = "NEW" | "SENT_TO_SUPPLIER" | "NOTIFY_FAILED" | "COMPLETED" | "CANCELLED";

export interface AdminOrder {
  id: number;
  sareeId: number;
  sareeTitle: string | null;
  sareeImageUrl: string | null;
  price: number;
  customerName: string;
  customerPhone: string;
  address: string;
  pincode: string;
  supplierWhatsapp: string;
  whatsappLink: string;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  paymentVerified: boolean;
}

export class AuthError extends Error {}

const TOKEN_KEY = "jas_admin_token";

interface StoredToken {
  token: string;
  expiresAt: number;
}

export function getToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const stored: StoredToken = JSON.parse(raw);
    if (Date.now() >= stored.expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return stored.token;
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing */
  }
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 401) throw new AuthError("Wrong username or password");
  if (!res.ok) throw new Error(`Login failed (${res.status})`);
  const data: { token: string; expiresInSeconds: number } = await res.json();
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({ token: data.token, expiresAt: Date.now() + data.expiresInSeconds * 1000 - 60_000 } satisfies StoredToken)
  );
}

export class ApiError extends Error {
  httpStatus: number;
  constructor(httpStatus: number) {
    super(`Request failed (${httpStatus})`);
    this.httpStatus = httpStatus;
  }
}

async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) throw new AuthError("Please sign in");
  // JSON bodies need a Content-Type; for FormData the browser sets it (with the multipart boundary).
  const jsonHeaders: Record<string, string> = typeof init.body === "string" ? { "Content-Type": "application/json" } : {};
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: { ...jsonHeaders, ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) {
    clearToken();
    throw new AuthError("Your session has expired. Please sign in again.");
  }
  if (!res.ok) throw new ApiError(res.status);
  return res;
}

export async function fetchOrders(): Promise<AdminOrder[]> {
  return (await adminFetch("/api/orders")).json();
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<AdminOrder> {
  const res = await adminFetch(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  return res.json();
}

export async function updatePaymentVerified(id: number, verified: boolean): Promise<AdminOrder> {
  const res = await adminFetch(`/api/orders/${id}/payment`, { method: "PATCH", body: JSON.stringify({ verified }) });
  return res.json();
}

// ---------- Admin: sarees ----------
export type SareeStatus = "LIVE" | "HIDDEN";

export interface AdminSaree {
  id: number;
  type: string;
  price: number;
  imageUrl: string | null;
  title: string | null;
  description: string | null;
  supplierWhatsapp: string;
  status: SareeStatus;
  createdAt: string;
}

export interface SareeUpdate {
  type?: string;
  price?: number;
  title?: string;
  description?: string;
  supplierWhatsapp?: string;
  status?: SareeStatus;
}

// The backend wants digits with country code. A plain 10-digit Indian number gets 91 in front.
export function normalizeSupplierNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export const isValidSupplierNumber = (normalized: string) => /^\d{10,15}$/.test(normalized);

export async function fetchAdminSarees(): Promise<AdminSaree[]> {
  return (await adminFetch("/api/admin/sarees")).json();
}

export async function createSaree(input: {
  type: string;
  price: number;
  supplierWhatsapp: string;
  photo: File;
}): Promise<ApiSaree> {
  const body = new FormData();
  body.append("type", input.type);
  body.append("price", String(input.price));
  body.append("supplierWhatsapp", input.supplierWhatsapp);
  body.append("photo", input.photo);
  return (await adminFetch("/api/sarees", { method: "POST", body })).json();
}

export async function updateSaree(id: number, changes: SareeUpdate): Promise<AdminSaree> {
  const res = await adminFetch(`/api/admin/sarees/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
  return res.json();
}
