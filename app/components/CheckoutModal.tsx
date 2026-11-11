"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { CartItem } from "./CartDrawer";
import { COD_MIN_PRICE, OrderError, PaymentMethod, UPI_ID, placeOrder } from "../lib/api";

interface CheckoutModalProps {
  items: CartItem[];
  onClose: () => void;
  onCartChange: (items: CartItem[]) => void;
}

interface FormState {
  customerName: string;
  customerPhone: string;
  address: string;
  pincode: string;
  transactionId: string;
}
type Errors = Partial<Record<keyof FormState, string>>;

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

// Accept "+91 98765 43210", "98765-43210" etc. and reduce to the 10 digits the backend expects.
function cleanPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

// Same rules as the backend's OrderRequest, so people get instant feedback.
function validate(f: FormState, method: PaymentMethod): Errors {
  const e: Errors = {};
  if (f.customerName.trim().length < 2) e.customerName = "Please enter your full name.";
  if (!/^[6-9]\d{9}$/.test(f.customerPhone)) e.customerPhone = "Enter a 10-digit mobile number.";
  if (f.address.trim().length < 10) e.address = "Please enter your full delivery address.";
  if (!/^\d{6}$/.test(f.pincode)) e.pincode = "Enter a 6-digit pincode.";
  if (method === "UPI" && !/^[A-Za-z0-9]{8,30}$/.test(f.transactionId.trim())) {
    e.transactionId = "Enter the transaction ID (UTR) from your payment app.";
  }
  return e;
}

const inputClass =
  "w-full border border-[#9b7a3e]/40 bg-[#d6cba8] px-3 py-2.5 text-sm text-[#432817] placeholder-[#50351e]/40 focus:border-[#9b7a3e] focus:outline-none";
const labelClass = "block text-[11px] uppercase tracking-[0.16em] text-[#50351e]/70";
const errorClass = "mt-1 block text-xs normal-case tracking-normal text-[#881320]";

export default function CheckoutModal({ items, onClose, onCartChange }: CheckoutModalProps) {
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerPhone: "",
    address: "",
    pincode: "",
    transactionId: "",
  });
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [qrFailed, setQrFailed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [placedIds, setPlacedIds] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [doneMethod, setDoneMethod] = useState<PaymentMethod>("UPI");
  const [problem, setProblem] = useState<string | null>(null);

  const total = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  // Each saree becomes its own order, so COD needs every saree in the bag to be above the minimum.
  const codAllowed = items.every((it) => it.product.price > COD_MIN_PRICE);
  const activeMethod: PaymentMethod = codAllowed ? method : "UPI";
  const upiLink = UPI_ID
    ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Jai Ambe Sarees")}&am=${total}&cu=INR&tn=${encodeURIComponent("JAS order")}`
    : null;

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const payload: FormState = {
      customerName: form.customerName.trim(),
      customerPhone: cleanPhone(form.customerPhone),
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      transactionId: form.transactionId.trim().toUpperCase(),
    };
    const found = validate(payload, activeMethod);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSubmitting(true);
    setProblem(null);

    // One order per saree: a quantity of 3 becomes 3 orders. A UPI payment covers all of them.
    const units = items.flatMap((it) => Array.from({ length: it.quantity }, () => it.product));
    const placed: number[] = [];
    const failedCount = new Map<string, number>();
    let unavailable = false;

    for (const product of units) {
      try {
        const order = await placeOrder(Number(product.id), {
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          address: payload.address,
          pincode: payload.pincode,
          paymentMethod: activeMethod,
          transactionId: activeMethod === "UPI" ? payload.transactionId : undefined,
        });
        placed.push(order.id);
      } catch (err) {
        failedCount.set(product.id, (failedCount.get(product.id) ?? 0) + 1);
        if (err instanceof OrderError && err.httpStatus === 404) unavailable = true;
      }
    }

    // Anything that failed stays in the bag so the customer can retry.
    const remaining = items
      .map((it) => ({ ...it, quantity: failedCount.get(it.product.id) ?? 0 }))
      .filter((it) => it.quantity > 0);
    onCartChange(remaining);
    setPlacedIds((prev) => [...prev, ...placed]);
    setSubmitting(false);

    if (remaining.length === 0) {
      setDoneMethod(activeMethod);
      setDone(true);
    } else {
      setProblem(
        unavailable
          ? "Some sarees are no longer available. They are still in your bag, so please remove them and try again."
          : "We couldn't place every order. The ones that failed are still in your bag, so please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#c7ba95]/85 p-4 backdrop-blur-md sm:p-6">
      <div className="relative my-8 w-full max-w-lg border border-[#9b7a3e]/50 bg-[#d6cba8] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 p-2 text-[#75521e] disabled:opacity-40"
          aria-label="Close checkout"
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#d8b477] text-[#140202]">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl text-[#52351b]">Thank you</h2>
            <p className="mt-3 font-editorial text-lg text-[#50351e]">
              {doneMethod === "UPI"
                ? `Your order has been received. We will verify your payment and get in touch on ${cleanPhone(form.customerPhone)}.`
                : `Your order has been received. You will pay on delivery. We will get in touch on ${cleanPhone(form.customerPhone)}.`}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#75521e]">
              Order {placedIds.length > 1 ? "numbers" : "number"}: {placedIds.map((id) => `#${id}`).join(", ")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 bg-[#d8b477] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-[#140202] hover:bg-[#f1dfb8]"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-[#52351b]">Delivery details</h2>
            <p className="mt-1 text-xs text-[#75521e]">
              {items.reduce((n, it) => n + it.quantity, 0)} saree(s) · {formatPrice(total)}
            </p>

            <div className="mt-6 space-y-4">
              <label className={labelClass}>
                Full name
                <input
                  className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                  value={form.customerName}
                  onChange={(e) => set("customerName", e.target.value)}
                  autoComplete="name"
                />
                {errors.customerName && <span className={errorClass}>{errors.customerName}</span>}
              </label>

              <label className={labelClass}>
                Mobile number
                <input
                  className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                  value={form.customerPhone}
                  onChange={(e) => set("customerPhone", e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="10-digit number"
                />
                {errors.customerPhone && <span className={errorClass}>{errors.customerPhone}</span>}
              </label>

              <label className={labelClass}>
                Delivery address
                <textarea
                  className={`${inputClass} mt-1.5 min-h-24 normal-case tracking-normal`}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  autoComplete="street-address"
                  placeholder="House / flat, street, area, city"
                />
                {errors.address && <span className={errorClass}>{errors.address}</span>}
              </label>

              <label className={labelClass}>
                Pincode
                <input
                  className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                />
                {errors.pincode && <span className={errorClass}>{errors.pincode}</span>}
              </label>
            </div>

            <h3 className="mt-8 font-serif text-lg text-[#52351b]">Payment</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["UPI", "COD"] as const).map((m) => {
                const disabled = m === "COD" && !codAllowed;
                const selected = activeMethod === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={disabled}
                    onClick={() => setMethod(m)}
                    aria-pressed={selected}
                    className={`px-3 py-3 text-xs uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected ? "bg-[#d8b477] text-[#140202]" : "border border-[#9b7a3e]/40 text-[#50351e] hover:border-[#9b7a3e]"
                    }`}
                  >
                    {m === "UPI" ? "Pay by UPI" : "Cash on delivery"}
                  </button>
                );
              })}
            </div>
            {!codAllowed && (
              <p className="mt-2 text-xs text-[#50351e]/70">
                Cash on delivery is available when every saree in your bag costs more than {formatPrice(COD_MIN_PRICE)}.
              </p>
            )}

            {activeMethod === "UPI" && (
              <div className="mt-4 border border-[#9b7a3e]/30 bg-[#c7ba95]/60 p-4">
                <p className="text-sm text-[#432817]">
                  Pay <strong>{formatPrice(total)}</strong> using the QR code or UPI ID below, then enter the transaction
                  ID shown in your payment app.
                </p>
                {!qrFailed && (
                  <div className="mx-auto mt-4 w-44">
                    <Image
                      src="/upi-qr.png"
                      alt="UPI QR code for Jai Ambe Sarees"
                      width={176}
                      height={176}
                      unoptimized
                      onError={() => setQrFailed(true)}
                    />
                  </div>
                )}
                {UPI_ID && (
                  <p className="mt-3 text-center text-sm">
                    UPI ID: <strong className="select-all">{UPI_ID}</strong>
                  </p>
                )}
                {upiLink && (
                  <a
                    href={upiLink}
                    className="mt-3 block border border-[#9b7a3e] px-4 py-2.5 text-center text-xs uppercase tracking-[0.16em] text-[#75521e] hover:bg-[#d8b477]/30 sm:hidden"
                  >
                    Pay with UPI app
                  </a>
                )}
                <label className={`${labelClass} mt-4`}>
                  Transaction ID (UTR)
                  <input
                    className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                    value={form.transactionId}
                    onChange={(e) => set("transactionId", e.target.value)}
                    autoCapitalize="characters"
                    placeholder="e.g. 412345678901"
                  />
                  {errors.transactionId && <span className={errorClass}>{errors.transactionId}</span>}
                </label>
              </div>
            )}

            {problem && (
              <p role="alert" className="mt-5 border border-[#881320]/40 bg-[#881320]/10 p-3 text-xs text-[#881320]">
                {problem}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="mt-6 w-full bg-[#d8b477] px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#140202] transition-colors hover:bg-[#f1dfb8] disabled:opacity-60"
            >
              {submitting ? "Placing your order…" : "Place order"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
