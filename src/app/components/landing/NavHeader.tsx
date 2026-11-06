'use client';

import { useRouter } from 'next/navigation';
import PrimaryButton from './PrimaryButton';
import TiffinMark from './TiffinMark';

interface NavHeaderProps {
  onGoToFrame: (frame: number) => void;
}

export default function NavHeader({ onGoToFrame }: NavHeaderProps) {
  const router = useRouter();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-3.5 flex items-center justify-between border-b border-current/10 backdrop-blur-[2px]">
      {/* Wordmark */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onGoToFrame(0); }}
        className="flex items-center gap-3 group"
      >
        {/* 4-tier tiffin icon */}
        <TiffinMark className="w-5 h-6 text-current group-hover:scale-105 transition-transform" />
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
          <span>NET: SepoliaETH</span>
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
        <PrimaryButton size="sm" onClick={() => router.push('/console')}>
          Launch app
        </PrimaryButton>
      </div>
    </header>
  );
}

