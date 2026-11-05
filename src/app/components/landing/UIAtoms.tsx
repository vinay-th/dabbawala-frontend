'use client';

interface StampBadgeProps {
  label: string;
  type?: 'denied' | 'proof';
}

export function StampBadge({ label, type = 'denied' }: StampBadgeProps) {
  const color = type === 'proof' ? '#FFC20E' : '#D7261E';
  return (
    <span
      className="inline-flex items-center justify-center text-[11px] font-extrabold tracking-[0.14em] border px-[7px] py-[1px] rounded-sm"
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        border: `1.5px solid ${color}`,
        color,
        transform: type === 'proof' ? 'rotate(-1deg)' : 'rotate(-3deg)',
      }}
    >
      {label}
    </span>
  );
}

interface EvidenceChipProps {
  children: React.ReactNode;
  dark?: boolean;
}

export function EvidenceChip({ children, dark = false }: EvidenceChipProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded border ${
        dark ? 'bg-white/10 border-white/20' : 'bg-black/10 border-current/20'
      }`}
      style={{ fontFamily: "'Geist Mono', monospace" }}
    >
      {children}
    </div>
  );
}

interface IfItFailsProps {
  stamp: string;
  sublabel: string;
  quote: string;
  dark?: boolean;
}

export function IfItFails({ stamp, sublabel, quote, dark = false }: IfItFailsProps) {
  return (
    <div
      className={`border-l-2 pl-3.5 py-1 mb-5 rounded-r ${
        dark ? 'border-[#FFC20E] bg-white/5' : 'border-[#D7261E] bg-[#D7261E]/5'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <StampBadge label={stamp} type={dark ? 'proof' : 'denied'} />
        <span
          className={`text-[10px] uppercase ${dark ? 'opacity-70' : 'opacity-70'}`}
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          {sublabel}
        </span>
      </div>
      <p className={`text-xs sm:text-[13px] opacity-90 italic ${dark ? 'text-[#F2EADB]/90' : ''}`}>
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}

