'use client';

interface NavHeaderProps {
  onGoToFrame: (frame: number) => void;
}

export default function NavHeader({ onGoToFrame }: NavHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-3.5 flex items-center justify-between border-b border-current/10 backdrop-blur-[2px]">
      {/* Wordmark */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onGoToFrame(0); }}
        className="flex items-center gap-3 group"
      >
        {/* 4-tier tiffin icon */}
        <svg
          className="w-5 h-6 text-current group-hover:scale-105 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 28"
        >
          <path d="M12 2 C8 2 8 5 8 5 L16 5 C16 5 16 2 12 2 Z" />
          <rect x="5" y="6" width="14" height="4" rx="1" />
          <rect x="5" y="11" width="14" height="4" rx="1" />
          <rect x="5" y="16" width="14" height="4" rx="1" />
          <rect x="5" y="21" width="14" height="5" rx="1" />
          <line x1="19" y1="6" x2="19" y2="25" strokeDasharray="1 1" />
          <line x1="5" y1="6" x2="5" y2="25" strokeDasharray="1 1" />
        </svg>
        <div>
          <div
            className="font-extrabold uppercase tracking-[0.08em] text-base leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Dabbawala Protocol
          </div>
          <div
            className="text-[10px] opacity-70 tracking-wide mt-0.5 leading-none"
            style={{ fontFamily: "'Tiro Devanagari Marathi', serif" }}
          >
            मुंबईचे डबेवाले · स्वायत्त यंत्रणा
          </div>
        </div>
      </a>

      {/* Nav right */}
      <div className="flex items-center gap-6">
        <div
          className="hidden lg:flex items-center gap-2 text-[11px] opacity-65 border-r border-current/20 pr-6"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>NET: ETHGLOBAL LIVE</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener"
          className="text-xs tracking-wider uppercase opacity-75 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          GitHub
        </a>
        <button
          className="bg-[#FFC20E] text-[#14110F] font-extrabold uppercase text-xs tracking-wider px-4 py-2 rounded-sm border-[1.5px] border-[#14110F]"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            boxShadow: '2.5px 2.5px 0px #14110F',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translate(-1px,-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '3.5px 3.5px 0px #14110F';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '2.5px 2.5px 0px #14110F';
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translate(2px,2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '1px 1px 0px #14110F';
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translate(-1px,-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '3.5px 3.5px 0px #14110F';
          }}
        >
          Launch app
        </button>
      </div>
    </header>
  );
}

