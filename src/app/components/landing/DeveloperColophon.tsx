'use client';

// F6 Closing: the tiffin has 5 tiers but the story has 7 frames (F0-F6), so the
// tiffin only maps to the hero + 5 checks. At F6 it is replaced by this flat
// colophon — the two developers — and the tiffin returns on scroll-up.
// Follows DESIGN.md restraint: no card, no badge, no icon row. One hairline,
// flat type, one yellow accent (link hover), Geist Mono labels, Instrument Serif
// names, Tiro Devanagari for the Marathi line.

import TiffinMark from './TiffinMark';

interface Developer {
  name: string;
  role: string;
  links: { label: string; href: string }[];
}

// NOTE (LP-2): hrefs are `#` placeholders. AGENTS.md §5 forbids inventing URLs,
// so real profile links must be supplied by the human before launch.
const DEVELOPERS: Developer[] = [
  {
    name: 'Vinay Thakor',
    role: 'Full Stack Web3 dev',
    links: [
      { label: 'GitHub', href: '#' },
      { label: 'X', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
  {
    name: 'Niomi',
    role: 'Web3 dev',
    links: [
      { label: 'GitHub', href: '#' },
      { label: 'X', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
];

export default function DeveloperColophon() {
  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-8 flex items-center gap-3">
        <TiffinMark className="h-9 w-8 text-current opacity-70" />
        <span
          className="text-[11px] uppercase tracking-[0.18em] opacity-60"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Built by
        </span>
      </div>

      <div className="flex flex-col gap-8">
        {DEVELOPERS.map((dev) => (
          <div key={dev.name} className="flex flex-col gap-1.5">
            <div
              className="text-[34px] leading-none tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {dev.name}
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.14em] opacity-65"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {dev.role}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              {dev.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[11px] uppercase tracking-wider opacity-75 underline underline-offset-4 decoration-1 transition-opacity hover:opacity-100 hover:text-[#FFC20E]"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* <div className="mt-9 border-t border-current/15 pt-4">
        <span
          className="text-[12px] text-[#FFC20E]"
          style={{ fontFamily: "'Tiro Devanagari Marathi', serif" }}
        >
          मुंबईचे डबेवाले
        </span>
        <span
          className="ml-2 text-[10px] uppercase tracking-[0.14em] opacity-50"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          · ETHGlobal Mumbai 2026
        </span>
      </div> */}
    </div>
  );
}
