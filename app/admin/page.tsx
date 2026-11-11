"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  AdminOrder,
  AuthError,
  OrderStatus,
  fetchOrders,
  imageSrc,
  updateOrderStatus,
  updatePaymentVerified,
} from "../lib/api";
import { useAdmin } from "./AdminShell";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "New",
  SENT_TO_SUPPLIER: "Sent to supplier",
  NOTIFY_FAILED: "Notify failed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const FILTERS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "SENT_TO_SUPPLIER", label: "Sent" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const buttonClass =
  "px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton = `${buttonClass} bg-[#d8b477] font-semibold text-[#140202] hover:bg-[#f1dfb8]`;
const ghostButton = `${buttonClass} border border-[#9b7a3e]/50 text-[#75521e] hover:border-[#9b7a3e]`;

function OrderCard({
  order,
  busy,
  onSend,
  onStatus,
  onVerify,
}: {
  order: AdminOrder;
  busy: boolean;
  onSend: () => void;
  onStatus: (status: OrderStatus) => void;
  onVerify: (verified: boolean) => void;
}) {
  const closed = order.status === "COMPLETED" || order.status === "CANCELLED";
  return (
    <article className="flex flex-col gap-4 border border-[#9b7a3e]/30 bg-[#d6cba8] p-4 sm:flex-row">
      <div className="relative h-40 w-28 flex-shrink-0 overflow-hidden bg-[#c7ba95]">
        {order.sareeImageUrl && (
          <Image src={imageSrc(order.sareeImageUrl)} alt={order.sareeTitle ?? "Saree"} fill unoptimized className="object-cover" sizes="112px" />
        )}
      </div>

      <div className="flex-1 space-y-2 text-sm text-[#432817]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="font-serif text-lg text-[#52351b]">Order #{order.id}</h2>
          <span className="bg-[#c7ba95] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#75521e]">
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-xs text-[#50351e]/60">{new Date(order.createdAt).toLocaleString("en-IN")}</span>
        </div>

        <p>
          {order.sareeTitle ?? "Saree"} · <strong>{formatPrice(order.price)}</strong>
        </p>

        <p>
          {order.customerName} ·{" "}
          <a href={`tel:${order.customerPhone}`} className="underline">
            {order.customerPhone}
          </a>
        </p>
        <p className="whitespace-pre-line text-[#50351e]/80">
          {order.address}
          {"\n"}Pincode {order.pincode}
        </p>

        <p className="text-xs">
          {order.paymentMethod === "COD" ? (
            <span>Cash on delivery</span>
          ) : (
            <span>
              UPI · Transaction ID: <strong className="select-all">{order.transactionId ?? "—"}</strong> ·{" "}
              <span className={order.paymentVerified ? "text-emerald-800" : "text-[#881320]"}>
                {order.paymentVerified ? "Payment verified" : "Not verified yet"}
              </span>
            </span>
          )}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {order.paymentMethod === "UPI" && (
            <button type="button" disabled={busy} onClick={() => onVerify(!order.paymentVerified)} className={ghostButton}>
              {order.paymentVerified ? "Undo verified" : "Mark payment verified"}
            </button>
          )}
          {!closed && (
            <button type="button" disabled={busy} onClick={onSend} className={primaryButton}>
              {order.status === "SENT_TO_SUPPLIER" ? "Send to supplier again" : "Send to supplier"}
            </button>
          )}
          {!closed && (
            <button type="button" disabled={busy} onClick={() => onStatus("COMPLETED")} className={ghostButton}>
              Mark completed
            </button>
          )}
          {!closed && (
            <button type="button" disabled={busy} onClick={() => onStatus("CANCELLED")} className={ghostButton}>
              Cancel order
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function AdminOrdersPage() {
  const { expire } = useAdmin();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleFailure = useCallback(
    (err: unknown) => {
      if (err instanceof AuthError) expire(err.message);
      else setError("Something went wrong. Check that the backend is running and try again.");
    },
    [expire]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await fetchOrders());
    } catch (err) {
      handleFailure(err);
    } finally {
      setLoading(false);
    }
  };

  // First load. State is only set inside the promise callbacks.
  useEffect(() => {
    let cancelled = false;
    fetchOrders()
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch((err) => {
        if (!cancelled) handleFailure(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handleFailure]);

  const run = async (order: AdminOrder, action: () => Promise<AdminOrder>) => {
    setBusyId(order.id);
    setError(null);
    try {
      const updated = await action();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      handleFailure(err);
    } finally {
      setBusyId(null);
    }
  };

  const sendToSupplier = (order: AdminOrder) => {
    if (
      order.paymentMethod === "UPI" &&
      !order.paymentVerified &&
      !window.confirm("This UPI payment is not marked as verified yet. Send to the supplier anyway?")
    ) {
      return;
    }
    // Open WhatsApp straight from the click so the browser doesn't block the popup.
    window.open(order.whatsappLink, "_blank", "noopener,noreferrer");
    void run(order, () => updateOrderStatus(order.id, "SENT_TO_SUPPLIER"));
  };

  const changeStatus = (order: AdminOrder, status: OrderStatus) => {
    if (status === "CANCELLED" && !window.confirm(`Cancel order #${order.id}?`)) return;
    void run(order, () => updateOrderStatus(order.id, status));
  };

  const visible = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 py-8">
        <h1 className="font-serif text-3xl text-[#52351b]">Orders</h1>
        <button type="button" onClick={() => void load()} disabled={loading} className={ghostButton}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-[0.16em] ${
              filter === f.key ? "bg-[#d8b477] text-[#140202]" : "border border-[#9b7a3e]/30 text-[#50351e]/80 hover:border-[#9b7a3e]"
            }`}
          >
            {f.label}
            {f.key !== "ALL" && ` (${orders.filter((o) => o.status === f.key).length})`}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 border border-[#881320]/40 bg-[#881320]/10 p-3 text-xs text-[#881320]">
          {error}
        </p>
      )}

      {visible.length === 0 && !loading && (
        <p className="py-16 text-center font-editorial text-lg text-[#75521e]">No orders here yet.</p>
      )}

      <div className="space-y-4">
        {visible.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            busy={busyId === order.id}
            onSend={() => sendToSupplier(order)}
            onStatus={(status) => changeStatus(order, status)}
            onVerify={(verified) => void run(order, () => updatePaymentVerified(order.id, verified))}
          />
        ))}
      </div>
    </div>
  );
}
