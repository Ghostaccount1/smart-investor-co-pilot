import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Check,
  ChevronRight,
  CircleUserRound,
  Download,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Minus,
  Move,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { AuthDialog } from "./AuthDialog";

type ChatMessage = { role: "user" | "assistant"; content: string; sources?: string[] };

const pulse = [
  { symbol: "SPY", name: "S&P 500 ETF", price: "—", move: "Connect live data", up: true },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", price: "—", move: "Connect live data", up: true },
  { symbol: "BTC", name: "Bitcoin", price: "—", move: "Connect live data", up: false },
];

const demoWatchlist = [
  { symbol: "NVDA", name: "NVIDIA", thesis: "AI infrastructure", tone: "positive" },
  { symbol: "MSFT", name: "Microsoft", thesis: "Cloud + AI durability", tone: "neutral" },
  { symbol: "COST", name: "Costco", thesis: "Defensive compounder", tone: "neutral" },
];

const starterPrompts = [
  "Build a bull and bear case for the company on this page",
  "What assumptions matter most in this valuation?",
  "Summarize the material risks before the next earnings call",
];

function DemoAnswer() {
  return (
    <>
      <p className="font-semibold text-[#122019]">Here’s the decision frame I’d use:</p>
      <ol className="mt-3 space-y-3 text-sm leading-6 text-[#4d5d55]">
        <li>
          <b className="text-[#122019]">1. Separate signal from narrative.</b> Check whether revenue
          growth is converting into durable free cash flow, not merely expanding the headline
          multiple.
        </li>
        <li>
          <b className="text-[#122019]">2. Stress the key assumption.</b> Model a base, upside, and
          downside case around margin durability and customer concentration.
        </li>
        <li>
          <b className="text-[#122019]">3. Define disconfirming evidence.</b> Write down what would
          break the thesis before considering position sizing.
        </li>
      </ol>
      <p className="mt-4 border-t border-[#dfe5de] pt-3 text-xs text-[#7b8982]">
        Demo response · Connect OpenAI and a licensed market feed in Lovable Cloud for grounded live
        analysis.
      </p>
    </>
  );
}

export function MarketCopilotApp() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contextEnabled, setContextEnabled] = useState(true);
  const firstName = useMemo(
    () =>
      user?.user_metadata?.display_name?.split(" ")[0] || user?.email?.split("@")[0] || "Investor",
    [user],
  );

  async function ask(text = question) {
    const clean = text.trim();
    if (!clean || asking) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setMessages((current) => [...current, { role: "user", content: clean }]);
    setQuestion("");
    setAsking(true);
    const { data, error } = await supabase.functions.invoke("copilot-chat", {
      body: { question: clean, surface: "web", pageContext: null },
    });
    setAsking(false);
    if (error) {
      toast.error("The analyst service is not configured yet.");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Cloud analysis is waiting for its OpenAI and market-data secrets. The product shell, account, and memory paths are connected; add the secrets in Lovable Cloud to turn on grounded answers.",
        },
      ]);
      return;
    }
    setMessages((current) => [
      ...current,
      { role: "assistant", content: data.answer, sources: data.sources },
    ]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out securely");
  }

  return (
    <div className="min-h-screen bg-[#f3f1ea] text-[#122019] selection:bg-[#d5ff63] selection:text-[#122019]">
      <Toaster />
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      <header className="sticky top-0 z-40 border-b border-[#122019]/10 bg-[#f3f1ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1480px] items-center gap-8 px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#122019] font-black tracking-[-0.08em] text-[#d5ff63]">
              SI
            </span>
            <span className="text-[15px] font-bold tracking-[-0.02em]">Smart Investor</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[#5f6d66] md:flex">
            <a href="#workspace" className="font-semibold text-[#122019]">
              Workspace
            </a>
            <a href="#how" className="transition hover:text-[#122019]">
              How it works
            </a>
            <a href="#trust" className="transition hover:text-[#122019]">
              Trust
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-[#122019]/10 bg-white/40 px-3 py-2 text-[11px] font-semibold text-[#5f6d66] lg:flex">
              <span className="h-2 w-2 rounded-full bg-[#60b985]" />
              Research systems online
            </span>
            {loading ? (
              <Loader2 className="animate-spin text-[#6c7972]" size={18} />
            ) : user ? (
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-full border border-[#122019]/10 bg-white/70 px-3 py-2 text-sm font-semibold"
              >
                <CircleUserRound size={17} />
                {firstName}
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-full bg-[#122019] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#244034]"
              >
                Sign in
              </button>
            )}
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="rounded-full border border-[#122019]/10 p-2.5 md:hidden"
              aria-label="Open menu"
            >
              {mobileNav ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileNav && (
          <nav className="grid gap-3 border-t border-[#122019]/10 px-5 py-4 text-sm font-semibold md:hidden">
            <a href="#workspace">Workspace</a>
            <a href="#how">How it works</a>
            <a href="#trust">Trust</a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-[#122019]/10 px-5 pb-16 pt-14 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="pointer-events-none absolute right-[-12%] top-[-80%] h-[750px] w-[750px] rounded-full bg-[#d5ff63]/25 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#122019]/10 bg-white/55 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em]">
                <Sparkles size={14} />
                Context-aware market research
              </div>
              <h1 className="max-w-4xl text-[clamp(3.6rem,8vw,8.2rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
                Invest with
                <br />
                <span className="text-[#537365]">more context.</span>
              </h1>
            </div>
            <div className="max-w-xl pb-2 lg:justify-self-end">
              <p className="text-lg leading-8 text-[#536159]">
                A sober second set of eyes across your research. Smart Investor reads the page you
                approve, remembers how you analyze, and helps you interrogate the thesis—not chase
                the ticker.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    user
                      ? document.querySelector("#workspace")?.scrollIntoView({ behavior: "smooth" })
                      : setAuthOpen(true)
                  }
                  className="flex items-center gap-2 rounded-full bg-[#122019] px-6 py-3.5 text-sm font-bold text-white"
                >
                  {user ? "Open workspace" : "Join the private beta"}
                  <ArrowRight size={17} />
                </button>
                <a
                  href="#extension"
                  className="flex items-center gap-2 rounded-full border border-[#122019]/15 bg-white/50 px-6 py-3.5 text-sm font-bold"
                >
                  See the extension <ChevronRight size={17} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="workspace" className="mx-auto max-w-[1480px] px-5 py-8 lg:px-8 lg:py-12">
          <div className="grid overflow-hidden rounded-[30px] border border-[#122019]/10 bg-[#07120f] shadow-[0_28px_80px_rgba(18,32,25,.18)] lg:grid-cols-[230px_1fr_410px]">
            <aside className="hidden border-r border-white/10 p-5 text-white lg:flex lg:min-h-[720px] lg:flex-col">
              <div className="mb-8 flex items-center gap-3 px-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d5ff63] font-black text-[#122019]">
                  SI
                </span>
                <div>
                  <b className="block text-sm">Workspace</b>
                  <span className="text-[10px] text-white/40">Private research</span>
                </div>
              </div>
              <nav className="space-y-1 text-sm">
                <button className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-left font-semibold">
                  <LayoutDashboard size={17} className="text-[#d5ff63]" />
                  Overview
                </button>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-white/50 hover:bg-white/5">
                  <MessageSquareText size={17} />
                  Conversations
                </button>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-white/50 hover:bg-white/5">
                  <Brain size={17} />
                  Memory
                </button>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-wh…1122 tokens truncated…e="text-sm">{item.symbol}</b>
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${item.tone === "positive" ? "bg-[#5db17d]" : "bg-[#b4bd70]"}`}
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-[#7a8780]">{item.thesis}</p>
                      </div>
                      <ChevronRight size={16} className="text-[#9aa49f]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#d5ff63] p-5">
                  <Brain size={20} />
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.13em]">
                    Memory signal
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    You consistently ask for downside cases before valuation upside.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#dfe7e1] p-5">
                  <BarChart3 size={20} />
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.13em]">
                    Research habit
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    Fundamentals first, with technicals used for context—not conviction.
                  </p>
                </div>
              </div>
            </div>

            <section className="flex min-h-[640px] flex-col border-l border-white/10 bg-[#0b1713] text-white">
              <div className="flex items-center gap-3 border-b border-white/10 p-5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d5ff63] text-[#122019]">
                  <Bot size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold">Research copilot</h3>
                  <p className="text-[10px] text-white/40">Evidence before confidence</p>
                </div>
                <button className="rounded-full border border-white/10 p-2 text-white/50">
                  <Minus size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
                <button
                  onClick={() => setContextEnabled(!contextEnabled)}
                  className={`relative h-5 w-9 rounded-full transition ${contextEnabled ? "bg-[#d5ff63]" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-1 h-3 w-3 rounded-full transition ${contextEnabled ? "left-5 bg-[#122019]" : "left-1 bg-white/50"}`}
                  />
                </button>
                <p className="flex-1 truncate text-[10px] text-white/45">
                  {contextEnabled ? "Page context approved" : "Page context off"}
                </p>
                <Globe2 size={13} className="text-white/35" />
              </div>
              <div className="flex-1 space-y-4 overflow-auto p-5">
                {messages.length === 0 && (
                  <>
                    <div className="rounded-2xl rounded-tl-md bg-white/[0.07] p-4">
                      <p className="text-sm leading-6 text-white/80">
                        What are you trying to understand? I’ll separate evidence, assumptions, and
                        risk.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {starterPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => ask(prompt)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-left text-xs leading-5 text-white/55 transition hover:border-[#d5ff63]/40 hover:text-white"
                        >
                          <span>{prompt}</span>
                          <ChevronRight size={14} className="shrink-0" />
                        </button>
                      ))}
                    </div>
                    <div className="rounded-2xl rounded-tl-md bg-white p-4 text-[#122019]">
                      <DemoAnswer />
                    </div>
                  </>
                )}
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-2xl p-4 text-sm leading-6 ${message.role === "user" ? "ml-8 rounded-tr-md bg-[#d5ff63] text-[#122019]" : "mr-4 rounded-tl-md bg-white text-[#122019]"}`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.sources?.length ? (
                      <p className="mt-3 border-t border-[#122019]/10 pt-2 text-[10px] text-[#66736c]">
                        Sources: {message.sources.join(" · ")}
                      </p>
                    ) : null}
                  </div>
                ))}
                {asking && (
                  <div className="mr-16 flex items-center gap-2 rounded-2xl rounded-tl-md bg-white/[0.07] p-4 text-xs text-white/45">
                    <Loader2 size={14} className="animate-spin" />
                    Checking the evidence…
                  </div>
                )}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  ask();
                }}
                className="border-t border-white/10 p-4"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.05] p-2 focus-within:border-[#d5ff63]/50">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={2}
                    className="min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/30"
                    placeholder="Ask about a company, chart, or thesis…"
                  />
                  <button
                    disabled={!question.trim() || asking}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d5ff63] text-[#122019] disabled:opacity-30"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="mt-2 text-center text-[9px] text-white/25">
                  Research only · Verify market data and filings
                </p>
              </form>
            </section>
          </div>
        </section>

        <section
          id="how"
          className="border-y border-[#122019]/10 bg-[#dfe6df] px-5 py-20 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-[1480px]">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5f7268]">
                  How it compounds
                </p>
                <h2 className="mt-5 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] lg:text-7xl">
                  Your process becomes the product.
                </h2>
              </div>
              <p className="max-w-xl self-end text-lg leading-8 text-[#5a6961]">
                Smart Investor remembers the way you investigate—not just what you asked. Every
                signal is visible, editable, and erasable.
              </p>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-[26px] border border-[#122019]/10 bg-[#122019]/10 md:grid-cols-3">
              {[
                [
                  Search,
                  "Read with permission",
                  "The extension captures only the visible page context you explicitly approve.",
                ],
                [
                  Brain,
                  "Remember transparently",
                  "Research preferences and recurring signals live in your private profile.",
                ],
                [
                  Activity,
                  "Challenge the thesis",
                  "Answers distinguish current evidence from assumptions and counterarguments.",
                ],
              ].map(([Icon, title, copy], index) => {
                const C = Icon as typeof Search;
                return (
                  <div key={String(title)} className="bg-[#edf0e9] p-7 lg:p-9">
                    <span className="text-xs font-bold text-[#718078]">0{index + 1}</span>
                    <C className="mt-16" size={25} />
                    <h3 className="mt-5 text-xl font-bold tracking-[-0.03em]">{String(title)}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#647169]">{String(copy)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="extension" className="bg-[#f3f1ea] px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#122019] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d5ff63]">
                <Globe2 size={13} />
                Browser companion
              </span>
              <h2 className="mt-7 text-5xl font-semibold leading-[0.95] tracking-[-0.06em] lg:text-7xl">
                One copilot.
                <br />
                Any research tab.
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#5d6a63]">
                Move it anywhere, minimize it when you need the screen, and carry the same memory
                from browser to browser.
              </p>
              <button className="mt-8 flex items-center gap-2 rounded-full bg-[#122019] px-6 py-3.5 text-sm font-bold text-white">
                <Download size={17} />
                Extension package included
              </button>
            </div>
            <div className="relative min-h-[500px] overflow-hidden rounded-[30px] bg-[#b8c7bf] p-6 lg:p-10">
              <div className="h-full min-h-[430px] rounded-[22px] bg-[#eef1ed] p-5 shadow-inner">
                <div className="flex gap-2 border-b border-[#122019]/10 pb-4">
                  <span className="h-3 w-3 rounded-full bg-[#de7c67]" />
                  <span className="h-3 w-3 rounded-full bg-[#dfbb5d]" />
                  <span className="h-3 w-3 rounded-full bg-[#72af7f]" />
                  <div className="ml-4 h-7 flex-1 rounded-full bg-white" />
                </div>
                <div className="mt-9 h-4 w-28 rounded bg-[#cad2cd]" />
                <div className="mt-4 h-12 w-4/5 rounded bg-[#c1cbc5]" />
                <div className="mt-3 h-3 w-3/5 rounded bg-[#d5dcd7]" />
                <div className="mt-16 grid grid-cols-3 gap-4">
                  <div className="h-28 rounded-xl bg-white" />
                  <div className="h-28 rounded-xl bg-white" />
                  <div className="h-28 rounded-xl bg-white" />
                </div>
              </div>
              <div className="absolute bottom-6 right-6 w-[310px] rounded-[24px] border border-white/10 bg-[#0b1713] p-4 text-white shadow-2xl lg:bottom-10 lg:right-10">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d5ff63] font-black text-[#122019]">
                    SI
                  </span>
                  <div className="flex-1">
                    <b className="block text-xs">Research copilot</b>
                    <span className="text-[9px] text-white/35">Reading with permission</span>
                  </div>
                  <Move size={15} className="text-white/30" />
                </div>
                <p className="mt-4 rounded-xl bg-white/[0.07] p-3 text-xs leading-5 text-white/65">
                  I found three assumptions worth stress-testing on this page.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 p-2 text-[10px] text-white/30">
                  <span className="flex-1">Ask a follow-up…</span>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#d5ff63] text-[#122019]">
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="bg-[#07120f] px-5 py-20 text-white lg:px-8">
          <div className="mx-auto max-w-[1480px]">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d5ff63]">
                  Built for trust
                </p>
                <h2 className="mt-5 text-5xl font-semibold tracking-[-0.055em]">
                  Useful restraint,
                  <br />
                  by design.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [LockKeyhole, "Secrets stay server-side"],
                  [ShieldCheck, "Per-user database policies"],
                  [Check, "Context requires consent"],
                  [ExternalLink, "Sources travel with claims"],
                ].map(([Icon, label]) => {
                  const C = Icon as typeof LockKeyhole;
                  return (
                    <div
                      key={String(label)}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d5ff63]/10 text-[#d5ff63]">
                        <C size={18} />
                      </span>
                      <span className="text-sm font-semibold">{String(label)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-white/35 sm:flex-row sm:items-center">
              <span>© 2026 Smart Investor</span>
              <span className="sm:ml-auto">
                Research assistance only. Not investment advice or a brokerage service.
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
