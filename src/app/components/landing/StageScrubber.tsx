'use client';

interface StageScrubberProps {
  activeFrame: number;
  onGoToFrame: (frame: number) => void;
}

const STAGES = [
  { id: 0, label: 'F0 Hero' },
  { id: 1, label: 'F1 Passport' },
  { id: 2, label: 'F2 Payment' },
  { id: 3, label: 'F3 Decide' },
  { id: 4, label: 'F4 Human' },
  { id: 5, label: 'F5 Storage' },
  { id: 6, label: 'F6 Close' },
];

export default function StageScrubber({ activeFrame, onGoToFrame }: StageScrubberProps) {
  return (
    <footer className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-50 bg-[#14110F]/90 text-[#F2EADB] backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-2xl">
      <span
        className="text-[10px] text-[#FFC20E] uppercase tracking-wider px-2 hidden sm:inline border-r border-white/20"
        style={{ fontFamily: "'Geist Mono', monospace" }}
      >
        STAGE SCRUB:
      </span>
      {STAGES.map((stage) => (
        <button
          key={stage.id}
          data-stage={stage.id}
          onClick={() => onGoToFrame(stage.id)}
          className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
            activeFrame === stage.id
              ? 'bg-[#FFC20E] text-black'
              : 'text-white/70 hover:text-white'
          }`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {stage.label}
        </button>
      ))}
    </footer>
  );
}

