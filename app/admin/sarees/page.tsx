"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  AdminSaree,
  ApiError,
  AuthError,
  SareeStatus,
  createSaree,
  fetchAdminSarees,
  imageSrc,
  isValidSupplierNumber,
  normalizeSupplierNumber,
  updateSaree,
} from "../../lib/api";
import { useAdmin } from "../AdminShell";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // same limit as the backend
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LAST_SUPPLIER_KEY = "jas_last_supplier";

const buttonClass =
  "px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton = `${buttonClass} bg-[#d8b477] font-semibold text-[#140202] hover:bg-[#f1dfb8]`;
const ghostButton = `${buttonClass} border border-[#9b7a3e]/50 text-[#75521e] hover:border-[#9b7a3e]`;
const inputClass =
  "w-full border border-[#9b7a3e]/40 bg-[#d6cba8] px-3 py-2.5 text-sm text-[#432817] placeholder-[#50351e]/40 focus:border-[#9b7a3e] focus:outline-none";
const labelClass = "block text-[11px] uppercase tracking-[0.16em] text-[#50351e]/70";

function UploadForm({ types, onCreated }: { types: string[]; onCreated: (title: string) => void }) {
  const { expire } = useAdmin();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  // Usually the same supplier every time, so remember the last one. This form only renders after sign-in,
  // in the browser, so reading localStorage here is safe.
  const [supplier, setSupplier] = useState(() => {
    try {
      return localStorage.getItem(LAST_SUPPLIER_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const pickFile = (f: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const priceNumber = Number(price);
    const supplierNumber = normalizeSupplierNumber(supplier);
    if (!file) return setError("Please choose a photo of the saree.");
    if (!PHOTO_TYPES.includes(file.type)) return setError("The photo must be a JPEG, PNG or WebP image.");
    if (file.size > MAX_PHOTO_BYTES) return setError("The photo is larger than 10 MB. Please choose a smaller one.");
    if (!type.trim()) return setError("Please enter the type of cloth, e.g. Cotton or Banarasi silk.");
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) return setError("Please enter the price in rupees.");
    if (!isValidSupplierNumber(supplierNumber)) return setError("Please enter the supplier's WhatsApp number.");

    setBusy(true);
    setError(null);
    try {
      const saree = await createSaree({
        type: type.trim(),
        price: priceNumber,
        supplierWhatsapp: supplierNumber,
        photo: file,
      });
      try {
        localStorage.setItem(LAST_SUPPLIER_KEY, supplier);
      } catch {
        /* private browsing */
      }
      pickFile(null);
      setInputKey((k) => k + 1); // clears the file input
      setType("");
      setPrice("");
      onCreated(saree.title ?? saree.type);
    } catch (err) {
      if (err instanceof AuthError) expire(err.message);
      else if (err instanceof ApiError && (err.httpStatus === 400 || err.httpStatus === 413))
        setError("The server rejected this upload. Check the photo (JPEG, PNG or WebP, under 10 MB) and the details.");
      else setError("Could not upload. Check that the backend is running and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="border border-[#9b7a3e]/30 bg-[#d6cba8] p-5 sm:p-6">
      <h2 className="font-serif text-xl text-[#52351b]">Add a saree</h2>
      <p className="mt-1 text-xs text-[#75521e]">
        Add the photo, cloth type, price and supplier number. The title and description are written automatically.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-[10rem_1fr]">
        <div>
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#9b7a3e]/30 bg-[#c7ba95]">
            {preview ? (
              <Image src={preview} alt="Selected saree" fill unoptimized className="object-cover" sizes="160px" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-[#50351e]/60">
                No photo yet
              </span>
            )}
          </div>
          <input
            key={inputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-xs file:mr-2 file:border-0 file:bg-[#d8b477] file:px-3 file:py-2 file:text-[11px] file:uppercase file:tracking-wider"
          />
        </div>

        <div className="space-y-4">
          <label className={labelClass}>
            Type of cloth
            <input
              className={`${inputClass} mt-1.5 normal-case tracking-normal`}
              value={type}
              onChange={(e) => setType(e.target.value)}
              list="saree-types"
              placeholder="e.g. Cotton, Banarasi silk"
            />
            <datalist id="saree-types">
              {types.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>

          <label className={labelClass}>
            Price (₹)
            <input
              className={`${inputClass} mt-1.5 normal-case tracking-normal`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 1200"
            />
          </label>

          <label className={labelClass}>
            Supplier WhatsApp number
            <input
              className={`${inputClass} mt-1.5 normal-case tracking-normal`}
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              inputMode="tel"
              placeholder="10-digit number"
            />
            <span className="mt-1 block text-[11px] normal-case tracking-normal text-[#50351e]/60">
              Never shown to customers.
            </span>
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 border border-[#881320]/40 bg-[#881320]/10 p-3 text-xs text-[#881320]">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className={`${primaryButton} mt-5 w-full py-3 sm:w-auto sm:px-8`}>
        {busy ? "Uploading and writing the description…" : "Add saree"}
      </button>
    </form>
  );
}

function SareeCard({
  saree,
  busy,
  onChange,
}: {
  saree: AdminSaree;
  busy: boolean;
  onChange: (changes: Parameters<typeof updateSaree>[1]) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(saree.title ?? "");
  const [description, setDescription] = useState(saree.description ?? "");
  const [type, setType] = useState(saree.type);
  const [price, setPrice] = useState(String(saree.price));
  const [supplier, setSupplier] = useState(saree.supplierWhatsapp);
  const [error, setError] = useState<string | null>(null);

  const live = saree.status === "LIVE";

  const startEdit = () => {
    setTitle(saree.title ?? "");
    setDescription(saree.description ?? "");
    setType(saree.type);
    setPrice(String(saree.price));
    setSupplier(saree.supplierWhatsapp);
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    const priceNumber = Number(price);
    const supplierNumber = normalizeSupplierNumber(supplier);
    if (!type.trim()) return setError("Type can't be empty.");
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) return setError("Enter a valid price.");
    if (!isValidSupplierNumber(supplierNumber)) return setError("Enter a valid supplier WhatsApp number.");
    setError(null);
    const ok = await onChange({
      type: type.trim(),
      price: priceNumber,
      title: title.trim(),
      description: description.trim(),
      supplierWhatsapp: supplierNumber,
    });
    if (ok) setEditing(false);
  };

  return (
    <article className="flex flex-col gap-4 border border-[#9b7a3e]/30 bg-[#d6cba8] p-4 sm:flex-row">
      <div className="relative h-44 w-32 flex-shrink-0 overflow-hidden bg-[#c7ba95]">
        {saree.imageUrl && (
          <Image
            src={imageSrc(saree.imageUrl)}
            alt={saree.title ?? saree.type}
            fill
            unoptimized
            className={`object-cover ${live ? "" : "opacity-50"}`}
            sizes="128px"
          />
        )}
      </div>

      <div className="flex-1 text-sm text-[#432817]">
        {editing ? (
          <div className="space-y-3">
            <label className={labelClass}>
              Title
              <input className={`${inputClass} mt-1 normal-case tracking-normal`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className={labelClass}>
              Description
              <textarea
                className={`${inputClass} mt-1 min-h-28 normal-case tracking-normal`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className={labelClass}>
                Type
                <input className={`${inputClass} mt-1 normal-case tracking-normal`} value={type} onChange={(e) => setType(e.target.value)} />
              </label>
              <label className={labelClass}>
                Price (₹)
                <input
                  className={`${inputClass} mt-1 normal-case tracking-normal`}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                />
              </label>
              <label className={labelClass}>
                Supplier WhatsApp
                <input
                  className={`${inputClass} mt-1 normal-case tracking-normal`}
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  inputMode="tel"
                />
              </label>
            </div>
            {error && (
              <p role="alert" className="text-xs text-[#881320]">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={() => void save()} className={primaryButton}>
                {busy ? "Saving…" : "Save"}
              </button>
              <button type="button" disabled={busy} onClick={() => setEditing(false)} className={ghostButton}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-serif text-lg text-[#52351b]">{saree.title ?? `${saree.type} Saree`}</h3>
              <span
                className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                  live ? "bg-emerald-800/15 text-emerald-900" : "bg-[#c7ba95] text-[#75521e]"
                }`}
              >
                {live ? "Live" : "Hidden"}
              </span>
            </div>
            <p>
              {saree.type} · <strong>{formatPrice(saree.price)}</strong>
            </p>
            {saree.description && <p className="line-clamp-3 text-xs text-[#50351e]/80">{saree.description}</p>}
            <p className="text-xs text-[#50351e]/60">Supplier: {saree.supplierWhatsapp}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void onChange({ status: live ? "HIDDEN" : "LIVE" })}
                className={primaryButton}
              >
                {live ? "Hide from shop" : "Show in shop"}
              </button>
              <button type="button" disabled={busy} onClick={startEdit} className={ghostButton}>
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function AdminSareesPage() {
  const { expire } = useAdmin();
  const [sarees, setSarees] = useState<AdminSaree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | SareeStatus>("ALL");
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleFailure = useCallback(
    (err: unknown) => {
      if (err instanceof AuthError) expire(err.message);
      else setError("Something went wrong. Check that the backend is running and try again.");
    },
    [expire]
  );

  const reload = async () => {
    try {
      setSarees(await fetchAdminSarees());
    } catch (err) {
      handleFailure(err);
    } finally {
      setLoading(false);
    }
  };

  // First load. State is only set inside the promise callbacks.
  useEffect(() => {
    let cancelled = false;
    fetchAdminSarees()
      .then((list) => {
        if (!cancelled) setSarees(list);
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

  const change = async (saree: AdminSaree, changes: Parameters<typeof updateSaree>[1]): Promise<boolean> => {
    setBusyId(saree.id);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateSaree(saree.id, changes);
      setSarees((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return true;
    } catch (err) {
      handleFailure(err);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const types = [...new Set(sarees.map((s) => s.type))];
  const liveCount = sarees.filter((s) => s.status === "LIVE").length;
  const visible = filter === "ALL" ? sarees : sarees.filter((s) => s.status === filter);

  return (
    <div>
      <header className="py-8">
        <h1 className="font-serif text-3xl text-[#52351b]">Sarees</h1>
      </header>

      <UploadForm
        types={types}
        onCreated={(title) => {
          setNotice(`Added “${title}”. It is now live in the shop.`);
          setError(null);
          void reload();
        }}
      />

      {notice && (
        <p role="status" className="mt-4 border border-emerald-800/30 bg-emerald-800/10 p-3 text-xs text-emerald-900">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 border border-[#881320]/40 bg-[#881320]/10 p-3 text-xs text-[#881320]">
          {error}
        </p>
      )}

      <div className="mb-5 mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-[#52351b]">
          All sarees ({sarees.length}) <span className="text-sm text-[#75521e]">· {liveCount} live</span>
        </h2>
        <div className="flex gap-2">
          {(["ALL", "LIVE", "HIDDEN"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.16em] ${
                filter === f ? "bg-[#d8b477] text-[#140202]" : "border border-[#9b7a3e]/30 text-[#50351e]/80 hover:border-[#9b7a3e]"
              }`}
            >
              {f === "ALL" ? "All" : f === "LIVE" ? "Live" : "Hidden"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="py-10 text-center font-editorial text-lg text-[#75521e]">Loading…</p>}
      {!loading && visible.length === 0 && (
        <p className="py-10 text-center font-editorial text-lg text-[#75521e]">No sarees here yet.</p>
      )}

      <div className="space-y-4">
        {visible.map((saree) => (
          <SareeCard key={saree.id} saree={saree} busy={busyId === saree.id} onChange={(changes) => change(saree, changes)} />
        ))}
      </div>
    </div>
  );
}
