"use client";
import { useState, useRef, useEffect } from "react";
import { IconSpark, IconX } from "./icons";

type Msg = { role: "user" | "assistant"; content: string };

export function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm ZUAE's assistant. Ask me about applying, programmes, fees, or career guidance." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });
    const data = await res.json();
    setBusy(false);
    setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Sorry, I couldn't respond." }]);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-400 shadow-2xl transition hover:scale-105"
        aria-label="Open AI assistant"
      >
        {open ? <IconX className="h-6 w-6" /> : <IconSpark className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[28rem] w-96 flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-2xl">
          <header className="flex items-center gap-2 bg-navy-950 px-4 py-3 text-white">
            <IconSpark className="h-4 w-4 text-gold-400" />
            <span className="font-display text-sm font-extrabold tracking-wide uppercase">ZUAE Assistant</span>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-navy-800 text-white" : "bg-paper text-ink"}`}>
                {m.content}
              </div>
            ))}
            {busy && <div className="text-xs text-ink-soft">Thinking…</div>}
            <div ref={endRef} />
          </div>

          <div className="flex gap-2 border-t border-navy-900/10 p-3">
            <input
              className="flex-1 rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-600"
              placeholder="Ask about ZUAE, courses, careers…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={send} disabled={busy} className="rounded-lg bg-navy-800 px-4 text-sm font-extrabold text-white hover:bg-navy-700 disabled:opacity-40">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}