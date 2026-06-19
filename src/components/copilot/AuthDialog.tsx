import { useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type AuthDialogProps = { open: boolean; onClose: () => void };

export function AuthDialog({ open, onClose }: AuthDialogProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup" && !result.data.session) {
      setMessage("Check your inbox to confirm your account.");
      return;
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#06100d]/80 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Account access"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1713] p-7 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d5ff63] font-black tracking-[-0.08em] text-[#102018]">
          SI
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d5ff63]">
          {mode === "signup" ? "Start your private beta" : "Welcome back"}
        </p>
        <h2 className="text-3xl font-semibold tracking-[-0.04em]">
          {mode === "signup" ? "One memory. Every browser." : "Pick up where you left off."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Your account connects the dashboard and extension without exposing API keys.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === "signup" && (
            <label className="grid gap-2 text-xs font-semibold text-white/65">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[#d5ff63]/70"
                placeholder="Alex Morgan"
              />
            </label>
          )}
          <label className="grid gap-2 text-xs font-semibold text-white/65">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[#d5ff63]/70"
              placeholder="you@example.com"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-white/65">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[#d5ff63]/70"
              placeholder="At least 8 characters"
            />
          </label>
          {message && (
            <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#d5ff63]">
              {message}
            </p>
          )}
          <button
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff63] font-bold text-[#102018] transition hover:bg-[#e1ff8d] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <>
                {mode === "signup" ? "Create account" : "Sign in"}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
        <button
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setMessage("");
          }}
          className="mt-5 w-full text-center text-sm text-white/55 hover:text-white"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-[11px] text-white/35">
          <ShieldCheck size={13} />
          Encrypted session · no brokerage credentials stored
        </div>
      </div>
    </div>
  );
}
