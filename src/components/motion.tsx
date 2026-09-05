"use client";

import { useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+";

export function ScrambleWords({ words, className = "" }: { words: string[]; className?: string }) {
  const [display, setDisplay] = useState(words[0] ?? "");
  const reduced = usePrefersReducedMotion();
  const idx = useRef(0);
  useEffect(() => {
    if (reduced) {
      setDisplay(words[0] ?? "");
      const t = setInterval(() => {
        idx.current = (idx.current + 1) % words.length;
        setDisplay(words[idx.current]);
      }, 3200);
      return () => clearInterval(t);
    }
    let frame = 0;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const scrambleTo = (target: string) => {
      frame = 0;
      const total = 26;
      const tick = () => {
        frame++;
        const progress = frame / total;
        const out = target
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i / target.length < progress) return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
        setDisplay(out);
        if (frame < total) raf = requestAnimationFrame(tick);
        else setDisplay(target);
      };
      raf = requestAnimationFrame(tick);
    };
    scrambleTo(words[0] ?? "");
    const loop = () => {
      timer = setTimeout(() => {
        idx.current = (idx.current + 1) % words.length;
        scrambleTo(words[idx.current]);
        loop();
      }, 3200);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [words, reduced]);
  return <span className={className}>{display}</span>;
}

export function CountUp({ to, suffix = "", duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setVal(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration, reduced]);
  return (
    <span ref={ref}>
      {val.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

export function Ticker({ items, className = "" }: { items: string[]; className?: string }) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track items-center gap-10 py-3">
        {doubled.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            <span className="font-display text-sm font-bold tracking-[0.18em] uppercase">{item}</span>
            <svg viewBox="0 0 8 8" className="h-2 w-2 fill-gold-400">
              <path d="M4 0l4 4-4 4-4-4z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Countdown({ date, className = "" }: { date: string; className?: string }) {
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date(`${date}T23:59:59`).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setParts({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff / 3_600_000) % 24),
        m: Math.floor((diff / 60_000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [date]);
  const cell = (v: number, label: string) => (
    <span className="flex flex-col items-center rounded-md bg-navy-950/60 px-2.5 py-1.5">
      <span className="font-display text-xl font-extrabold tabular-nums text-gold-400">
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[10px] font-semibold tracking-widest text-navy-200 uppercase">{label}</span>
    </span>
  );
  return (
    <span className={`flex gap-1.5 ${className}`}>
      {cell(parts.d, "days")}
      {cell(parts.h, "hrs")}
      {cell(parts.m, "min")}
      {cell(parts.s, "sec")}
    </span>
  );
}
