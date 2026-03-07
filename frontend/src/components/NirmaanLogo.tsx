export default function NirmaanLogo({ className = '', white = false, iconOnly = false }: { className?: string; white?: boolean; iconOnly?: boolean }) {
  const textColor = white ? '#FFFFFF' : '#111827';
  const taglineColor = white ? 'rgba(255,255,255,0.5)' : '#9CA3AF';
  const accent = white ? '#FDBA74' : '#F97316';

  if (iconOnly) {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rounded background */}
        <rect width="64" height="64" rx="14" fill="url(#nirmaan-icon-grad)" />
        {/* N-monogram: left pillar */}
        <rect x="14" y="14" width="9" height="37" rx="2" fill="white" />
        {/* N-monogram: right pillar */}
        <rect x="41" y="14" width="9" height="37" rx="2" fill="white" />
        {/* N-monogram: diagonal beam */}
        <polygon points="14,14 23,14 50,51 41,51" fill="white" opacity="0.88" />
        {/* Peaked crown — construction accent */}
        <polygon points="41,14 45.5,7 50,14" fill="white" opacity="0.7" />
        {/* Foundation line */}
        <rect x="11" y="54" width="42" height="2.5" rx="1.25" fill="white" opacity="0.35" />
        <defs>
          <linearGradient id="nirmaan-icon-grad" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 260 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── N-monogram mark ── */}
      {/* Left pillar */}
      <rect x="2" y="8" width="8" height="40" rx="2" fill={accent} />
      {/* Diagonal structural beam */}
      <polygon points="2,8 10,8 46,48 38,48" fill={accent} opacity="0.75" />
      {/* Right pillar */}
      <rect x="38" y="8" width="8" height="40" rx="2" fill={accent} />
      {/* Peaked crown */}
      <polygon points="38,8 42,1 46,8" fill={accent} opacity="0.6" />
      {/* Foundation base */}
      <rect x="0" y="50" width="48" height="2.5" rx="1.25" fill={accent} opacity="0.3" />

      {/* ── Brand text ── */}
      <text x="58" y="36" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontSize="32" fontWeight="800" fill={textColor} letterSpacing="-0.5">
        Nirmaan
      </text>
      <text x="60" y="50" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontSize="8.5" fontWeight="700" fill={taglineColor} letterSpacing="4">
        BUILD SMARTER
      </text>
    </svg>
  );
}
