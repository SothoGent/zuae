import { initials } from "@/lib/utils";

export function ZuaeCrest({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="ZUAE crest">
      <circle cx="32" cy="32" r="30" fill="#0a2a66" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#f7c600" strokeWidth="2.5" />
      <path d="M14 26c6-3 12-3 18 0v18c-6-3-12-3-18 0V26Z" fill="#f6f4ee" />
      <path d="M50 26c-6-3-12-3-18 0v18c6-3 12-3 18 0V26Z" fill="#dbe6fb" />
      <path d="M32 26v18" stroke="#0a2a66" strokeWidth="1.6" />
      <g fill="#f7c600">
        <path d="M24 14l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L24 14Z" />
        <path d="M32 10l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L32 10Z" />
        <path d="M40 14l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L40 14Z" />
      </g>
      <path d="M18 48h28" stroke="#f7c600" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FlagStripe({ className = "h-1.5 w-full" }: { className?: string }) {
  return <div className={`flag-stripe ${className}`} aria-hidden="true" />;
}

export function UniCrest({
  name,
  hue,
  logoUrl,
  className = "h-12 w-12",
}: {
  name: string;
  hue: number;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className={`rounded-full bg-white object-contain ${className}`} />;
  }

  const label = initials(name);
  return (
    <svg viewBox="0 0 48 56" className={className} role="img" aria-label={name}>
      <path
        d="M24 2l20 6v20c0 13-8.6 22-20 26C12.6 50 4 41 4 28V8l20-6Z"
        fill={`hsl(${hue} 62% 32%)`}
      />
      <path
        d="M24 5.4l16.8 5v17.4c0 11-7.2 18.8-16.8 22.4-9.6-3.6-16.8-11.4-16.8-22.4V10.4l16.8-5Z"
        fill="none"
        stroke={`hsl(${hue} 70% 72%)`}
        strokeWidth="1.6"
      />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="Archivo, sans-serif"
        fontWeight="800"
        fontSize={label.length > 2 ? 13 : 16}
        fill="#f6f4ee"
      >
        {label}
      </text>
    </svg>
  );
}

export function ZimcheBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.zimche.ac.zw"
      target="_blank"
      rel="noreferrer noopener"
      className={`group inline-flex items-center gap-3 rounded-lg border border-zim-green/40 bg-zim-green/10 px-4 py-3 transition hover:bg-zim-green/20 ${className}`}
    >
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0">
        <circle cx="20" cy="20" r="18" fill="#179447" />
        <path d="M12 20.5l5 5 11-11" stroke="#f6f4ee" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-left">
        <span className="block font-display text-sm font-extrabold tracking-wide text-zim-green">
          Verify with ZIMCHE
        </span>
        <span className="block text-xs text-ink-soft">
          ZUAE programmes align with ZIMCHE-accredited institutions →
        </span>
      </span>
    </a>
  );
}
