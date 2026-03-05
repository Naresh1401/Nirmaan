export default function NirmaanLogo({ className = '', white = false, iconOnly = false }: { className?: string; white?: boolean; iconOnly?: boolean }) {
  const textColor = white ? '#FFFFFF' : '#111827';
  const taglineColor = white ? 'rgba(255,255,255,0.5)' : '#9CA3AF';
  const colors = white
    ? ['#FB923C', '#FDBA74', '#FED7AA']
    : ['#F97316', '#EA580C', '#C2410C'];

  if (iconOnly) {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="url(#nirmaan-icon-grad)" />
        <rect x="10" y="36" width="14" height="20" rx="2.5" fill="white" opacity="0.95" />
        <rect x="26" y="24" width="14" height="32" rx="2.5" fill="white" opacity="0.85" />
        <rect x="42" y="10" width="14" height="46" rx="2.5" fill="white" opacity="0.75" />
        <polygon points="49,6 56,10 42,10" fill="white" opacity="0.95" />
        <rect x="14" y="40" width="6" height="5" rx="1.2" fill="#F97316" opacity="0.6" />
        <rect x="30" y="29" width="6" height="5" rx="1.2" fill="#EA580C" opacity="0.5" />
        <rect x="30" y="38" width="6" height="5" rx="1.2" fill="#EA580C" opacity="0.5" />
        <rect x="46" y="16" width="6" height="5" rx="1.2" fill="#C2410C" opacity="0.45" />
        <rect x="46" y="25" width="6" height="5" rx="1.2" fill="#C2410C" opacity="0.45" />
        <rect x="46" y="34" width="6" height="5" rx="1.2" fill="#C2410C" opacity="0.45" />
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
    <svg className={className} viewBox="0 0 280 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Building blocks icon */}
      <rect x="4" y="36" width="20" height="24" rx="3" fill={colors[0]} />
      <rect x="28" y="22" width="20" height="38" rx="3" fill={colors[1]} />
      <rect x="52" y="6" width="20" height="54" rx="3" fill={colors[2]} />
      <polygon points="62,2 72,6 52,6" fill={colors[0]} />
      {/* Windows */}
      <rect x="10" y="42" width="8" height="6" rx="1.5" fill="white" opacity={white ? '0.2' : '0.4'} />
      <rect x="34" y="28" width="8" height="6" rx="1.5" fill="white" opacity={white ? '0.18' : '0.35'} />
      <rect x="34" y="40" width="8" height="6" rx="1.5" fill="white" opacity={white ? '0.18' : '0.35'} />
      <rect x="58" y="14" width="8" height="6" rx="1.5" fill="white" opacity={white ? '0.15' : '0.3'} />
      <rect x="58" y="26" width="8" height="6" rx="1.5" fill="white" opacity={white ? '0.15' : '0.3'} />
      <rect x="58" y="38" width="8" height="6" rx="1.5" fill="white" opacity={white ? '0.15' : '0.3'} />
      {/* Text */}
      <text x="86" y="44" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontSize="36" fontWeight="800" fill={textColor} letterSpacing="-1">
        Nirmaan
      </text>
      <text x="88" y="58" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontSize="10" fontWeight="600" fill={taglineColor} letterSpacing="3.5">
        BUILD SMARTER
      </text>
    </svg>
  );
}
