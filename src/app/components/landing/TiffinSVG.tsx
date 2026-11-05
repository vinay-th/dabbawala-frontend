'use client';

interface TiffinSVGProps {
  activeFrame: number;
}

export default function TiffinSVG({ activeFrame }: TiffinSVGProps) {
  const isLidLifted = activeFrame >= 1;
  const isLidFar = activeFrame >= 2;

  const t1Lifted = activeFrame >= 2;
  const t1Far = activeFrame >= 3;
  const t1Active = activeFrame === 1;

  const t2Lifted = activeFrame >= 3;
  const t2Far = activeFrame >= 4;
  const t2Active = activeFrame === 2;

  const t3Lifted = activeFrame >= 4;
  const t3Far = activeFrame >= 5;
  const t3Active = activeFrame === 3;

  const t4Lifted = activeFrame >= 5;
  const t4Far = activeFrame >= 6;
  const t4Active = activeFrame === 4;

  const t5Active = activeFrame >= 5;

  const tierFill = (tierIdx: number): string => {
    const activeTier = activeFrame; // 1-indexed
    if (tierIdx === activeTier) return 'url(#tiffin-yellow-grad)';
    return 'url(#tiffin-steel-grad)';
  };

  return (
    <div className="relative w-full max-w-[340px] h-[450px] flex items-center justify-center">

      <svg
        id="tiffin-scene"
        className="w-full h-full overflow-visible drop-shadow-sm"
        viewBox="0 0 350 490"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tiffin-steel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C2C6C5" />
            <stop offset="25%" stopColor="#E5E8E7" />
            <stop offset="70%" stopColor="#C2C6C5" />
            <stop offset="100%" stopColor="#9FA2A1" />
          </linearGradient>
          <linearGradient id="tiffin-yellow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFC20E" />
            <stop offset="30%" stopColor="#FFD768" />
            <stop offset="75%" stopColor="#FFC20E" />
            <stop offset="100%" stopColor="#D9A100" />
          </linearGradient>
          <pattern id="brushed-metal" width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="3" x2="6" y2="3" stroke="#ffffff" strokeWidth="0.3" opacity="0.3" />
          </pattern>
        </defs>

        {/* Ground shadow ellipse */}
        <ellipse cx="170" cy="460" rx="125" ry="14" fill="#14110F" opacity="0.16" />

        {/* Dual locking rails (clasps) */}
        <g id="tiffin-clasps" stroke="#14110F" strokeWidth="2.2">
          <line x1="50" y1="80" x2="50" y2="445" />
          {[160, 235, 310, 385].map((y) => (
            <rect key={y} x="45" y={y} width="10" height="15" rx="1.5" fill="#C9CCCB" />
          ))}
          <line x1="290" y1="80" x2="290" y2="445" />
          {[160, 235, 310, 385].map((y) => (
            <rect key={y} x="285" y={y} width="10" height="15" rx="1.5" fill="#C9CCCB" />
          ))}
        </g>

        {/* LID */}
        <g
          id="tiffin-lid"
          style={{
            transition: 'transform 0.5s cubic-bezier(0.2, 0.85, 0.3, 1), opacity 0.4s ease',
            transform: isLidFar
              ? 'translate(-30px, -155px) rotate(-6deg)'
              : isLidLifted
              ? 'translate(-18px, -92px) rotate(-3.5deg)'
              : 'none',
            opacity: isLidFar ? 0 : isLidLifted ? 0.15 : 1,
          }}
        >
          <path
            d="M 120 45 C 120 18, 220 18, 220 45"
            fill="none"
            stroke="#14110F"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <circle cx="120" cy="45" r="4.5" fill="#14110F" />
          <circle cx="220" cy="45" r="4.5" fill="#14110F" />
          <path
            d="M 60 82 C 60 46, 280 46, 280 82 Z"
            fill="url(#tiffin-steel-grad)"
            stroke="#14110F"
            strokeWidth="2.2"
          />
          <rect x="58" y="81" width="224" height="8" rx="2.5" fill="#9FA2A1" stroke="#14110F" strokeWidth="1.8" />
          <text
            x="170"
            y="70"
            textAnchor="middle"
            fontFamily="'Barlow Condensed'"
            fontSize="10"
            fontWeight="800"
            letterSpacing="1"
            fill="#14110F"
            opacity="0.65"
          >
            DABBAWALA · 1890
          </text>
        </g>

        {/* TIER 1: ENS Passport */}
        <g
          id="tier-1"
          style={{
            transition: 'transform 0.5s cubic-bezier(0.2, 0.85, 0.3, 1), opacity 0.4s ease',
            transform: t1Far
              ? 'translate(-30px, -155px) rotate(-6deg)'
              : t1Lifted
              ? 'translate(-18px, -92px) rotate(-3.5deg)'
              : t1Active
              ? 'translate(14px, 0)'
              : 'none',
            opacity: t1Far ? 0 : t1Lifted ? 0.15 : 1,
          }}
        >
          <rect x="60" y="90" width="220" height="70" rx="5" fill={tierFill(1)} stroke="#14110F" strokeWidth="2.2" />
          <rect x="60" y="154" width="220" height="6" rx="1.5" fill="#9FA2A1" stroke="#14110F" strokeWidth="1.5" />
          <rect x="76" y="105" width="80" height="38" rx="2.5" fill="#F2EADB" stroke="#14110F" strokeWidth="1.4" />
          <text x="86" y="132" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">A</text>
          <circle cx="114" cy="124" r="5.5" fill="#FFC20E" stroke="#14110F" strokeWidth="1.4" />
          <text x="134" y="132" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">7</text>
          <text x="306" y="132" fontFamily="'Barlow Condensed'" fontSize="28" fontWeight="900" fill="currentColor">01</text>
          <text x="180" y="121" fontFamily="'Geist Mono'" fontSize="10" fontWeight="600" fill="#14110F">ENS PASS</text>
          <text x="180" y="136" fontFamily="'Geist Mono'" fontSize="8.5" fill="#14110F" opacity="0.75">ANDHERI</text>
        </g>

        {/* TIER 2: Hedera x402 */}
        <g
          id="tier-2"
          style={{
            transition: 'transform 0.5s cubic-bezier(0.2, 0.85, 0.3, 1), opacity 0.4s ease',
            transform: t2Far
              ? 'translate(-30px, -155px) rotate(-6deg)'
              : t2Lifted
              ? 'translate(-18px, -92px) rotate(-3.5deg)'
              : t2Active
              ? 'translate(14px, 0)'
              : 'none',
            opacity: t2Far ? 0 : t2Lifted ? 0.15 : 1,
          }}
        >
          <rect x="60" y="163" width="220" height="70" rx="5" fill={tierFill(2)} stroke="#14110F" strokeWidth="2.2" />
          <rect x="60" y="227" width="220" height="6" rx="1.5" fill="#9FA2A1" stroke="#14110F" strokeWidth="1.5" />
          <rect x="76" y="178" width="80" height="38" rx="2.5" fill="#F2EADB" stroke="#14110F" strokeWidth="1.4" />
          <text x="86" y="205" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">B</text>
          <circle cx="114" cy="197" r="5.5" fill="#1F7A4D" stroke="#14110F" strokeWidth="1.4" />
          <text x="134" y="205" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">2</text>
          <text x="306" y="205" fontFamily="'Barlow Condensed'" fontSize="28" fontWeight="900" fill="currentColor">02</text>
          <text x="180" y="194" fontFamily="'Geist Mono'" fontSize="10" fontWeight="600" fill="#14110F">HEDERA x402</text>
          <text x="180" y="209" fontFamily="'Geist Mono'" fontSize="8.5" fill="#14110F" opacity="0.75">METERED</text>
        </g>

        {/* TIER 3: 0G Compute */}
        <g
          id="tier-3"
          style={{
            transition: 'transform 0.5s cubic-bezier(0.2, 0.85, 0.3, 1), opacity 0.4s ease',
            transform: t3Far
              ? 'translate(-30px, -155px) rotate(-6deg)'
              : t3Lifted
              ? 'translate(-18px, -92px) rotate(-3.5deg)'
              : t3Active
              ? 'translate(14px, 0)'
              : 'none',
            opacity: t3Far ? 0 : t3Lifted ? 0.15 : 1,
          }}
        >
          <rect x="60" y="236" width="220" height="70" rx="5" fill={tierFill(3)} stroke="#14110F" strokeWidth="2.2" />
          <rect x="60" y="300" width="220" height="6" rx="1.5" fill="#9FA2A1" stroke="#14110F" strokeWidth="1.5" />
          <rect x="76" y="251" width="80" height="38" rx="2.5" fill="#F2EADB" stroke="#14110F" strokeWidth="1.4" />
          <text x="86" y="278" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">C</text>
          <circle cx="114" cy="270" r="5.5" fill="#D7261E" stroke="#14110F" strokeWidth="1.4" />
          <text x="134" y="278" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">9</text>
          <text x="306" y="278" fontFamily="'Barlow Condensed'" fontSize="28" fontWeight="900" fill="currentColor">03</text>
          <text x="180" y="267" fontFamily="'Geist Mono'" fontSize="10" fontWeight="600" fill="#14110F">0G DECIDE</text>
          <text x="180" y="282" fontFamily="'Geist Mono'" fontSize="8.5" fill="#14110F" opacity="0.75">REPLAYABLE</text>
        </g>

        {/* TIER 4: Human Gate */}
        <g
          id="tier-4"
          style={{
            transition: 'transform 0.5s cubic-bezier(0.2, 0.85, 0.3, 1), opacity 0.4s ease',
            transform: t4Far
              ? 'translate(-30px, -155px) rotate(-6deg)'
              : t4Lifted
              ? 'translate(-18px, -92px) rotate(-3.5deg)'
              : t4Active
              ? 'translate(14px, 0)'
              : 'none',
            opacity: t4Far ? 0 : t4Lifted ? 0.15 : 1,
          }}
        >
          <rect x="60" y="309" width="220" height="70" rx="5" fill={tierFill(4)} stroke="#14110F" strokeWidth="2.2" />
          <rect x="60" y="373" width="220" height="6" rx="1.5" fill="#9FA2A1" stroke="#14110F" strokeWidth="1.5" />
          <rect x="76" y="324" width="80" height="38" rx="2.5" fill="#F2EADB" stroke="#14110F" strokeWidth="1.4" />
          <text x="86" y="351" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">R</text>
          <circle cx="114" cy="343" r="5.5" fill="#FFC20E" stroke="#14110F" strokeWidth="1.4" />
          <text x="134" y="351" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">2</text>
          <text x="306" y="351" fontFamily="'Barlow Condensed'" fontSize="28" fontWeight="900" fill="currentColor">04</text>
          <text x="180" y="340" fontFamily="'Geist Mono'" fontSize="10" fontWeight="600" fill="#14110F">HUMAN GATE</text>
          <text x="180" y="355" fontFamily="'Geist Mono'" fontSize="8.5" fill="#14110F" opacity="0.75">SINGLE-USE</text>
        </g>

        {/* TIER 5: 0G Storage (base) */}
        <g
          id="tier-5"
          style={{
            transition: 'transform 0.5s cubic-bezier(0.2, 0.85, 0.3, 1), opacity 0.4s ease',
            transform: t5Active ? 'translate(14px, 0)' : 'none',
          }}
        >
          <path
            d="M 60 382 L 280 382 L 280 435 C 280 448, 60 448, 60 435 Z"
            fill={tierFill(5)}
            stroke="#14110F"
            strokeWidth="2.2"
          />
          <rect x="60" y="380" width="220" height="5" fill="#9FA2A1" stroke="#14110F" strokeWidth="1.4" />
          <rect x="76" y="394" width="80" height="38" rx="2.5" fill="#F2EADB" stroke="#14110F" strokeWidth="1.4" />
          <text x="86" y="421" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">L</text>
          <circle cx="114" cy="413" r="5.5" fill="#1F7A4D" stroke="#14110F" strokeWidth="1.4" />
          <text x="134" y="421" fontFamily="'Barlow Condensed'" fontSize="24" fontWeight="900" fill="#14110F">0</text>
          <text x="306" y="421" fontFamily="'Barlow Condensed'" fontSize="28" fontWeight="900" fill="currentColor">05</text>
          <text x="180" y="410" fontFamily="'Geist Mono'" fontSize="10" fontWeight="600" fill="#14110F">0G AUDIT</text>
          <text x="180" y="425" fontFamily="'Geist Mono'" fontSize="8.5" fill="#14110F" opacity="0.75">PERPETUAL</text>
        </g>
      </svg>
    </div>
  );
}

