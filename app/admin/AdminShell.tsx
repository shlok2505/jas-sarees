"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthError, clearToken, getToken, login } from "../lib/api";

const AdminContext = createContext<{ expire: (message?: string) => void }>({ expire: () => {} });

// Pages call this when the backend says the session is no longer valid.
export const useAdmin = () => useContext(AdminContext);

const buttonClass =
  "px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const ghostButton = `${buttonClass} border border-[#9b7a3e]/50 text-[#75521e] hover:border-[#9b7a3e]`;

function LoginForm({ notice, onLoggedIn }: { notice: string | null; onLoggedIn: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username.trim(), password);
      onLoggedIn();
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Could not reach the server. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm border border-[#9b7a3e]/40 bg-[#d6cba8] p-8 shadow-xl">
      <h1 className="font-serif text-2xl text-[#52351b]">JAS admin</h1>
      <p className="mt-1 text-xs text-[#75521e]">Sign in to manage sarees and orders.</p>
      {notice && <p className="mt-4 text-xs text-[#50351e]">{notice}</p>}
      <input
        className="mt-6 w-full border border-[#9b7a3e]/40 bg-[#d6cba8] px-3 py-2.5 text-sm focus:border-[#9b7a3e] focus:outline-none"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />
      <input
        className="mt-3 w-full border border-[#9b7a3e]/40 bg-[#d6cba8] px-3 py-2.5 text-sm focus:border-[#9b7a3e] focus:outline-none"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && (
        <p role="alert" className="mt-3 text-xs text-[#881320]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !username || !password}
        className={`${buttonClass} mt-5 w-full bg-[#d8b477] py-3 font-semibold text-[#140202] hover:bg-[#f1dfb8]`}
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

const NAV = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/sarees", label: "Sarees" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Reads localStorage, which only exists in the browser, so this has to run after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthed(getToken() !== null);
  }, []);

  const expire = useCallback((message?: string) => {
    clearToken();
    setNotice(message ?? null);
    setAuthed(false);
  }, []);

  if (authed === null) return <div className="paper-surface min-h-screen" />;

  return (
    <div className="paper-surface min-h-screen px-4 pb-16 text-[#432817] sm:px-8">
      {!authed ? (
        <LoginForm
          notice={notice}
          onLoggedIn={() => {
            setNotice(null);
            setAuthed(true);
          }}
        />
      ) : (
        <div className="mx-auto max-w-4xl">
          <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9b7a3e]/25 py-4">
            <div className="flex items-center gap-2">
              <span className="mr-2 font-serif text-lg text-[#52351b]">JAS admin</span>
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.16em] ${
                      active ? "bg-[#d8b477] text-[#140202]" : "border border-[#9b7a3e]/30 text-[#50351e]/80 hover:border-[#9b7a3e]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Link href="/" className={ghostButton}>
                View shop
              </Link>
              <button type="button" onClick={() => expire()} className={ghostButton}>
                Sign out
              </button>
            </div>
          </nav>
          <AdminContext.Provider value={{ expire }}>{children}</AdminContext.Provider>
        </div>
      )}
    </div>
  );
}
