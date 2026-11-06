'use client';

import { useRouter } from 'next/navigation';
import PrimaryButton from './PrimaryButton';
import { EvidenceChip, IfItFails } from './UIAtoms';

interface FrameProps {
  visible: boolean;
}

const baseClass =
  'transition-all duration-300';

function frameStyle(visible: boolean): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(8px)',
    pointerEvents: visible ? 'auto' : 'none',
    position: visible ? 'relative' : 'absolute',
    top: visible ? 'auto' : 0,
  };
}

export function Frame0Hero({ visible, onScroll }: FrameProps & { onScroll: () => void }) {
  const router = useRouter();
  return (
    <section className={baseClass} style={frameStyle(visible)}>
      <div className="flex items-center gap-3 text-[11px] tracking-[0.14em] uppercase opacity-75 mb-3.5"
        style={{ fontFamily: "'Geist Mono', monospace" }}>
        <span className="bg-[#14110F]/10 px-2 py-0.5 rounded">ETHGLOBAL MUMBAI 2026</span>
        <span className="opacity-40">·</span>
        <span>OPEN SOURCE</span>
      </div>
      <h1
        className="text-5xl sm:text-[58px] lg:text-[64px] leading-[0.98] tracking-tight mb-5"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Every robot gets a passport, a budget and a{' '}
        <em className="italic font-normal">stop button</em>.
      </h1>
      <p className="text-base sm:text-[17px] leading-[1.55] opacity-85 mb-7 max-w-[460px]">
        An open protocol for machines that move and spend. Public identity, metered payments,
        and replayable decisions across Mumbai&apos;s urban grid.
      </p>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <PrimaryButton size="md" onClick={() => router.push('/console')}>
          Launch app
        </PrimaryButton>
        <button
          type="button"
          className="text-xs tracking-wider opacity-70 flex items-center gap-2 cursor-pointer hover:opacity-100"
          style={{ fontFamily: "'Geist Mono', monospace" }}
          onClick={onScroll}
        >
          <span>Scroll or scrub below to open</span>
          <span className="inline-block animate-bounce text-[#FFC20E]">↓</span>
        </button>
      </div>
    </section>
  );
}

export function Frame1ENS({ visible }: FrameProps) {
  return (
    <section className={baseClass} style={frameStyle(visible)}>
      <div className="relative">
        <div
          className="absolute -top-10 -left-6 pointer-events-none"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '100px',
            lineHeight: '0.8',
            WebkitTextStroke: '1.5px currentColor',
            color: 'transparent',
            opacity: 0.14,
            userSelect: 'none',
          }}
        >
          01
        </div>
        <div className="relative z-10">
          <div
            className="text-[11px] tracking-[0.14em] uppercase text-[#FFC20E] bg-black/50 px-2.5 py-0.5 rounded inline-block mb-3"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            CHECK 1 OF 5 · ENS PASSPORT
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.0] tracking-tight mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Read the <em className="italic">passport</em>.
          </h2>
          <p className="text-base sm:text-[17px] leading-[1.55] opacity-85 mb-5 max-w-[460px]">
            Before it moves, the robot&apos;s public ENS record is read: where it may go, what it
            may spend, and whether it is active.
          </p>
          <IfItFails
            stamp="HALTED"
            sublabel="DETERMINISTIC GUARD"
            quote="One ENS text record flips and this robot stops. The others keep going."
          />
          <EvidenceChip>
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-semibold">ramu.dabbawala.eth</span>
            <span className="opacity-40">·</span>
            <span className="opacity-75">block 7,204,118</span>
          </EvidenceChip>
        </div>
      </div>
    </section>
  );
}

export function Frame2Hedera({ visible }: FrameProps) {
  return (
    <section className={baseClass} style={frameStyle(visible)}>
      <div className="relative">
        <div
          className="absolute -top-10 -left-6 pointer-events-none"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '100px',
            lineHeight: '0.8',
            WebkitTextStroke: '1.5px currentColor',
            color: 'transparent',
            opacity: 0.14,
            userSelect: 'none',
          }}
        >
          02
        </div>
        <div className="relative z-10">
          <div
            className="text-[11px] tracking-[0.14em] uppercase text-[#FFC20E] bg-black/50 px-2.5 py-0.5 rounded inline-block mb-3"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            CHECK 2 OF 5 · HEDERA x402
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.0] tracking-tight mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Pay per <em className="italic">request</em>.
          </h2>
          <p className="text-base sm:text-[17px] leading-[1.55] opacity-85 mb-5 max-w-[460px]">
            Route intel is bought one request at a time, signed only if the payment fits inside
            the robot&apos;s real-time budget envelope.
          </p>
          <IfItFails
            stamp="REFUSED"
            sublabel="BUDGET ENFORCEMENT"
            quote="Over budget threshold, so the transaction voucher is never signed."
          />
          <EvidenceChip>
            <span className="text-[#FFC20E] font-bold">0.002 HBAR</span>
            <span className="opacity-40">·</span>
            <span className="opacity-75">tx 0.0.4821937@1712904000</span>
          </EvidenceChip>
        </div>
      </div>
    </section>
  );
}

export function Frame3ZeroG({ visible }: FrameProps) {
  return (
    <section className={baseClass} style={frameStyle(visible)}>
      <div className="relative">
        <div
          className="absolute -top-10 -left-6 pointer-events-none"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '100px',
            lineHeight: '0.8',
            WebkitTextStroke: '1.5px currentColor',
            color: 'transparent',
            opacity: 0.14,
            userSelect: 'none',
          }}
        >
          03
        </div>
        <div className="relative z-10">
          <div
            className="text-[11px] tracking-[0.14em] uppercase text-[#FFC20E] bg-black/50 px-2.5 py-0.5 rounded inline-block mb-3"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            CHECK 3 OF 5 · 0G COMPUTE
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.0] tracking-tight mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Decide, with a <em className="italic">receipt</em>.
          </h2>
          <p className="text-base sm:text-[17px] leading-[1.55] opacity-85 mb-5 max-w-[460px]">
            Every checkpoint decision comes from verified 0G compute with an exact cryptographic
            request ID replayed anytime.
          </p>
          <IfItFails
            stamp="SAFE-STOP"
            sublabel="ORACLE QUORUM"
            quote="0G unreachable, so the machine halts. No decision beats an untested guess."
          />
          <EvidenceChip>
            <span className="opacity-75">req 0g_req_7f3a2b9f…c91</span>
          </EvidenceChip>
        </div>
      </div>
    </section>
  );
}

export function Frame4HumanGate({ visible }: FrameProps) {
  return (
    <section className={baseClass} style={frameStyle(visible)}>
      <div className="relative">
        <div
          className="absolute -top-10 -left-6 pointer-events-none"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '100px',
            lineHeight: '0.8',
            WebkitTextStroke: '1.5px currentColor',
            color: 'transparent',
            opacity: 0.14,
            userSelect: 'none',
          }}
        >
          04
        </div>
        <div className="relative z-10">
          <div
            className="text-[11px] tracking-[0.14em] uppercase text-[#FFC20E] bg-black/50 px-2.5 py-0.5 rounded inline-block mb-3"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            CHECK 4 OF 5 · HUMAN GATE
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.0] tracking-tight mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Ask a <em className="italic">human</em>.
          </h2>
          <p className="text-base sm:text-[17px] leading-[1.55] opacity-85 mb-5 max-w-[460px]">
            Restricted railway corridors open only with a single-use cryptographically signed
            human permit.
          </p>
          <IfItFails
            stamp="DENIED"
            sublabel="HUMAN OVERRIDE"
            quote="Denied or expired permit: gate remains locked and robot reroutes instantly."
          />
          <EvidenceChip>
            <span className="text-amber-500 font-bold">zone R-2</span>
            <span className="opacity-40">·</span>
            <span>single-use</span>
            <span className="opacity-40">·</span>
            <span>ttl: 60s</span>
          </EvidenceChip>
        </div>
      </div>
    </section>
  );
}

export function Frame5Storage({ visible }: FrameProps) {
  return (
    <section className={baseClass} style={frameStyle(visible)}>
      <div className="relative">
        <div
          className="absolute -top-10 -left-6 pointer-events-none"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '100px',
            lineHeight: '0.8',
            WebkitTextStroke: '1.5px currentColor',
            color: 'transparent',
            opacity: 0.14,
            userSelect: 'none',
          }}
        >
          05
        </div>
        <div className="relative z-10">
          <div
            className="text-[11px] tracking-[0.14em] uppercase text-[#FFC20E] px-2.5 py-0.5 rounded inline-block mb-3"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            CHECK 5 OF 5 · 0G STORAGE
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.0] tracking-tight mb-4 text-[#F2EADB]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Leave a <em className="italic text-[#FFC20E]">record</em>.
          </h2>
          <p className="text-base sm:text-[17px] leading-[1.55] opacity-85 mb-5 max-w-[460px] text-[#F2EADB]/90">
            The entire run is appended to an immutable decentralized episode log for transparent
            post-hoc audit.
          </p>
          <IfItFails
            stamp="THE PROOF"
            sublabel="PERPETUAL AUDIT"
            quote="Not just the operator: any third-party auditor can mathematically replay it."
            dark
          />
          <EvidenceChip dark>
            <span className="opacity-75">root 0x9f2cb48a…b81</span>
            <span className="opacity-40">·</span>
            <span className="text-emerald-400">IMMUTABLE (0G AUDIT)</span>
          </EvidenceChip>
        </div>
      </div>
    </section>
  );
}

export function Frame6Closing({ visible }: FrameProps) {
  const router = useRouter();
  return (
    <section className={baseClass} style={frameStyle(visible)}>
      <div className="relative z-10">
        <div
          className="text-[11px] tracking-[0.16em] uppercase text-[#FFC20E] mb-3"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          DABBAWALA PROTOCOL · WESTERN RAILWAY DIVISION
        </div>
        <h2
          className="text-5xl sm:text-6xl leading-[0.98] tracking-tight mb-5 text-[#F2EADB]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          See a robot <em className="italic text-[#FFC20E]">refuse</em>.
        </h2>
        <div className="mb-6">
          <PrimaryButton size="lg" shadow="#000" border="#000" borderWidth="2px" onClick={() => router.push('/console')}>
            Launch app
          </PrimaryButton>
        </div>
        <div
          className="border-t border-white/15 pt-4 flex flex-col gap-2.5 text-[11px] text-[#F2EADB]/70"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          <p className="max-w-[450px] leading-relaxed">
            Simulation: physical city &amp; robots are simulated, approval proofs are mocked.
            Permission, payment, and audit layers are cryptographically live.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <a href="#" className="hover:underline text-[#F2EADB]">GitHub</a>
            <span className="opacity-30">·</span>
            <a href="#" className="hover:underline text-[#F2EADB]">Docs</a>
            <span className="opacity-30">·</span>
            <span>ETHGlobal Mumbai 2026</span>
            <span className="opacity-30">·</span>
            <span
              className="text-xs text-[#FFC20E]"
              style={{ fontFamily: "'Tiro Devanagari Marathi', serif" }}
            >
              मुंबईचे डबेवाले
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

