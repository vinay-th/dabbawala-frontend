'use client';

export default function MumbaiBackdrop() {
  return (
    // suppressHydrationWarning: browser extension injects `bis_skin_checked` here pre-hydration.
    <div aria-hidden="true" suppressHydrationWarning className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Ledger/Surveyor grid overlay — 3-4% opacity */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundSize: '32px 32px',
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
        }}
      />

      {/* Survey coordinates top-left */}
      <div className="absolute top-20 left-12 font-mono text-[10px] tracking-widest opacity-25 uppercase flex flex-col gap-1">
        <span>SURVEY PLAT 1890-B · WESTERN DIVISION</span>
        <span>BOMBAY CENTRAL ↔ CHURCHGATE ↔ ANDHERI [KM 18.4]</span>
        <span>GAUGE: BROAD 1676MM · CADASTRE SHEET #04</span>
      </div>

      {/* Coordinates top-right */}
      <div className="absolute top-20 right-12 font-mono text-[10px] tracking-widest opacity-25 uppercase text-right flex flex-col gap-1">
        <span>{"LAT 18°55'48\" N · LON 72°49'38\" E"}</span>
        <span>DAILY TIFFIN SORT RUN: 200,000 DABBIS</span>
        <span>SIGMA SIX ERROR MARGIN: 1 IN 16,000,000</span>
      </div>

      {/* Vintage railway ticket stamp — top right */}
      <div className="absolute top-24 right-48 pointer-events-none opacity-20 hidden xl:block select-none rotate-6">
        <div className="w-24 h-24 rounded-full border-2 border-[#D7261E] border-dashed p-1 flex items-center justify-center text-center">
          <div className="w-full h-full rounded-full border border-[#D7261E] flex flex-col items-center justify-center p-1 text-[#D7261E] font-['Barlow_Condensed'] leading-none">
            <span className="text-[8px] tracking-widest font-extrabold uppercase">WESTERN RAILWAY</span>
            <span className="text-[11px] font-black my-0.5">COLABA</span>
            <span className="text-[8px] font-bold">14 APR 1890</span>
            <span className="text-[7px] tracking-tighter uppercase opacity-80">VERIFIED AUTH</span>
          </div>
        </div>
      </div>

      {/* Dabbawala quality seal — bottom left */}
      <div className="absolute bottom-28 left-16 pointer-events-none opacity-15 hidden xl:block select-none -rotate-12">
        <div className="w-20 h-20 rounded-full border-2 border-current p-1 flex items-center justify-center text-center">
          <div className="w-full h-full rounded-full border border-current flex flex-col items-center justify-center text-current font-['Barlow_Condensed'] leading-none">
            <span className="text-[8px] font-extrabold uppercase">TRUST PROTOCOL</span>
            <span className="text-[10px] my-0.5 font-bold" style={{ fontFamily: "'Tiro Devanagari Marathi', serif" }}>
              डबेवाले
            </span>
            <span className="text-[7px] font-mono tracking-widest">ZERO-FAIL</span>
          </div>
        </div>
      </div>

      {/* Monsoon diagonal rain hachures */}
      <svg className="absolute top-0 right-0 w-96 h-80 opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="monsoon-rain" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="0.85" strokeDasharray="1 5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#monsoon-rain)" />
      </svg>

      {/* Compass rose — top center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-15 flex items-center gap-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="1" x2="12" y2="23" />
          <line x1="1" y1="12" x2="23" y2="12" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
        <span className="font-mono text-[9px] tracking-widest uppercase">SECTION LINE 12-W</span>
      </div>

      {/* Mumbai skyline SVG */}
      <svg
        className="absolute bottom-4 w-full h-56 opacity-[0.09]"
        fill="none"
        preserveAspectRatio="xMidYMax meet"
        viewBox="0 0 1440 220"
      >
        {/* Queen's Necklace promenade */}
        <path
          d="M -20 195 Q 260 180 540 195 T 1060 190 T 1480 195"
          stroke="currentColor"
          strokeDasharray="4 6"
          strokeWidth="1.4"
        />
        {/* Street lanterns */}
        <g stroke="currentColor" strokeWidth="1">
          {[120, 280, 440, 600, 760, 920, 1080, 1240].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={190 - (i % 3) * 4} x2={x} y2={160 - (i % 3) * 4} />
              <circle cx={x} cy={158 - (i % 3) * 4} r="2" />
            </g>
          ))}
        </g>
        {/* CST / Gothic railway arches */}
        <g stroke="currentColor" strokeWidth="1.3">
          <path d="M 40 195 L 40 160 Q 55 145 70 160 L 70 195" />
          <path d="M 70 195 L 70 160 Q 85 145 100 160 L 100 195" />
          <path d="M 100 195 L 100 155 L 110 140 L 120 155 L 120 195" />
          {/* Gateway of India */}
          <path d="M 330 195 L 330 135 L 338 135 L 338 115 L 350 115 L 350 135 L 380 135 L 380 115 L 392 115 L 392 135 L 400 135 L 400 195 Z" />
          <path d="M 352 195 L 352 145 Q 365 133 378 145 L 378 195 Z" />
          <path d="M 336 195 L 336 160 Q 342 152 348 160 L 348 195" />
          <path d="M 382 195 L 382 160 Q 388 152 394 160 L 394 195" />
          <circle cx="365" cy="125" r="4.5" />
          {/* Rajabai Clock Tower */}
          <path d="M 480 195 L 480 130 L 486 130 L 486 95 L 490 70 L 494 95 L 494 130 L 500 130 L 500 195 Z" />
          <circle cx="490" cy="115" r="3.5" />
          <line x1="486" y1="145" x2="494" y2="145" />
          <line x1="486" y1="165" x2="494" y2="165" />
          {/* Bandra-Worli Sea Link */}
          <path d="M 880 195 L 905 60 L 930 195" strokeWidth="1.8" />
          <line x1="905" y1="75" x2="820" y2="195" strokeWidth="0.75" />
          <line x1="905" y1="95" x2="845" y2="195" strokeWidth="0.75" />
          <line x1="905" y1="115" x2="865" y2="195" strokeWidth="0.75" />
          <line x1="905" y1="140" x2="880" y2="195" strokeWidth="0.75" />
          <line x1="905" y1="75" x2="990" y2="195" strokeWidth="0.75" />
          <line x1="905" y1="95" x2="965" y2="195" strokeWidth="0.75" />
          <line x1="905" y1="115" x2="945" y2="195" strokeWidth="0.75" />
          <line x1="905" y1="140" x2="930" y2="195" strokeWidth="0.75" />
          {/* Dockyard cranes */}
          <path d="M 1140 195 L 1140 170 L 1170 170 L 1170 155 L 1200 155 L 1200 195" />
          <path d="M 1240 195 L 1260 145 L 1290 145 L 1265 195" />
          <line x1="1260" y1="145" x2="1310" y2="120" />
          <line x1="1310" y1="120" x2="1310" y2="195" strokeDasharray="2 2" />
        </g>
        {/* Rail tracks */}
        <line x1="0" y1="198" x2="1440" y2="198" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="202" x2="1440" y2="202" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 0 200 L 1440 200" stroke="currentColor" strokeDasharray="2 10" strokeWidth="4" opacity="0.6" />
      </svg>

      {/* Animated EMU local train */}
      <div className="absolute bottom-1 w-full overflow-hidden opacity-[0.11]">
        <svg
          className="h-12 w-[680px]"
          fill="none"
          viewBox="0 0 680 48"
          style={{ animation: 'glideTrain 32s linear infinite' }}
        >
          {/* glideTrain keyframes defined once in globals.css */}
          <rect x="5" y="6" width="670" height="32" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="60" cy="5" rx="10" ry="2" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="220" cy="5" rx="10" ry="2" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="380" cy="5" rx="10" ry="2" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="540" cy="5" rx="10" ry="2" stroke="currentColor" strokeWidth="1" />
          <g stroke="currentColor" strokeWidth="0.9">
            {/* Coach 1 */}
            <rect x="20" y="12" width="30" height="18" rx="1" />
            <line x1="28" y1="12" x2="28" y2="30" />
            <line x1="38" y1="12" x2="38" y2="30" />
            <rect x="62" y="12" width="30" height="18" rx="1" />
            <line x1="72" y1="12" x2="72" y2="30" />
            <line x1="82" y1="12" x2="82" y2="30" />
            <rect x="105" y="10" width="24" height="28" strokeWidth="1.2" />
            <line x1="117" y1="10" x2="117" y2="38" strokeWidth="1.2" />
            <rect x="140" y="12" width="30" height="18" rx="1" />
            <line x1="150" y1="12" x2="150" y2="30" />
            <line x1="160" y1="12" x2="160" y2="30" />
            <line x1="185" y1="4" x2="185" y2="40" strokeWidth="2" />
            {/* Coach 2 */}
            <rect x="200" y="12" width="30" height="18" rx="1" />
            <line x1="210" y1="12" x2="210" y2="30" />
            <line x1="220" y1="12" x2="220" y2="30" />
            <rect x="242" y="12" width="30" height="18" rx="1" />
            <line x1="252" y1="12" x2="252" y2="30" />
            <line x1="262" y1="12" x2="262" y2="30" />
            <rect x="285" y="10" width="24" height="28" strokeWidth="1.2" />
            <line x1="297" y1="10" x2="297" y2="38" strokeWidth="1.2" />
            <rect x="320" y="12" width="30" height="18" rx="1" />
            <line x1="330" y1="12" x2="330" y2="30" />
            <line x1="340" y1="12" x2="340" y2="30" />
            <line x1="365" y1="4" x2="365" y2="40" strokeWidth="2" />
            {/* Coach 3 */}
            <rect x="380" y="12" width="30" height="18" rx="1" />
            <line x1="390" y1="12" x2="390" y2="30" />
            <line x1="400" y1="12" x2="400" y2="30" />
            <rect x="422" y="12" width="30" height="18" rx="1" />
            <line x1="432" y1="12" x2="432" y2="30" />
            <line x1="442" y1="12" x2="442" y2="30" />
            <rect x="465" y="10" width="24" height="28" strokeWidth="1.2" />
            <line x1="477" y1="10" x2="477" y2="38" strokeWidth="1.2" />
            <rect x="500" y="12" width="30" height="18" rx="1" />
            <line x1="510" y1="12" x2="510" y2="30" />
            <line x1="520" y1="12" x2="520" y2="30" />
            <line x1="545" y1="4" x2="545" y2="40" strokeWidth="2" />
          </g>
          {/* Bogies */}
          {[75, 170, 255, 350, 435, 530, 615].map((cx, i) => (
            <circle key={i} cx={cx} cy="40" r="4" stroke="currentColor" strokeWidth="1.3" />
          ))}
        </svg>
      </div>
    </div>
  );
}

