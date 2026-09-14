"use client";

export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
            i + 1 <= current ? "bg-gold-400" : "bg-navy-900/10"
          }`}
        />
      ))}
      </div>
      <p className="mt-2 text-xs font-bold tracking-widest text-ink-soft uppercase">Step {current} of {total}</p>
    </div>
  );
}
