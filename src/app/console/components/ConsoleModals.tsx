"use client";

// Overlays for the console board (v2, styled after ref/console.html):
// 1. 0G outage vignette — monsoon dusk wash + fail-closed banner.
// 2. Human Gate desk modal — countdown ring, robot details, APPROVE/DENY
//    rubber-stamp buttons (single-use token, TTL <= 60s).
// 3. Verdict overlay — giant rotated stamp on a backdrop with receipt /
//    re-dispatch actions.
// All state comes from the runner; this file renders only.

import { useState } from "react";
import type { ScenarioRunner, Verdict } from "../state/useScenarioRunner";

const STAMP_TONE: Record<Verdict, string> = {
  DELIVERED: "text-[#2E9E5B] border-[#2E9E5B]",
  REROUTED: "text-[#2E9E5B] border-[#2E9E5B]",
  HALTED: "text-[#D0342C] border-[#D0342C]",
  REFUSED: "text-[#D0342C] border-[#D0342C]",
  DENIED: "text-[#D0342C] border-[#D0342C]",
  "SAFE-STOP": "text-[#D0342C] border-[#D0342C]",
};

const STAMP_REASON: Record<Verdict, string> = {
  DELIVERED: "All 5 proof receipts validated · episode anchored",
  REROUTED: "0G chose a different route — delivery completed",
  HALTED: "Policy gate stopped the run",
  REFUSED: "Spend Controller refused to sign",
  DENIED: "Approver denied — gate stayed closed",
  "SAFE-STOP": "0G unreachable — halted on safe cell, no substitute decision",
};

const ROBOT_CARD: Record<string, { name: string; code: string; ens: string }> = {
  ramu: { name: "RAMU", code: "A·●·7", ens: "ramu.dabbawala.eth" },
  sakhu: { name: "SAKHU", code: "B·●·2", ens: "sakhu.dabbawala.eth" },
  janu: { name: "JANU", code: "C·●·9", ens: "janu.dabbawala.eth" },
};

type ConsoleModalsProps = {
  runner: ScenarioRunner;
  ogUp: boolean;
  reducedMotion: boolean;
  onOpenReceipt: () => void;
};

export default function ConsoleModals({ runner, ogUp, reducedMotion, onOpenReceipt }: ConsoleModalsProps) {
  const { gate, verdict, haltReason, controls } = runner;
  const [dismissedVerdict, setDismissedVerdict] = useState<Verdict | null>(null);

  // A new run re-arms the verdict overlay. Adjust-state-during-render (the
  // reset clears verdict first), so no effect is needed.
  if (dismissedVerdict !== null && verdict === null) {
    setDismissedVerdict(null);
  }

  const secondsLeft = gate ? Math.ceil(gate.remainingMs / 1000) : 0;
  const gateRobot = gate ? ROBOT_CARD[gate.request.robotId] : null;
  const showVerdict = verdict !== null && dismissedVerdict !== verdict;

  const stampBtn =
    "py-3 border-2 border-[#14110F] text-[#F2EADB] font-bold text-base uppercase tracking-wider shadow-[3px_3px_0_#14110F] active:shadow-[0.5px_0.5px_0_#14110F] active:translate-x-[2px] active:translate-y-[2px] transition-all flex flex-col items-center disabled:opacity-50";

  return (
    <>
      {/* 1. 0G outage vignette */}
      {!ogUp && (
        <div className="pointer-events-none fixed inset-0 z-20 bg-[#14110F]/45 flex items-start justify-center pt-24">
          <div
            className="px-4 py-2 bg-[#D0342C] text-[#F2EADB] text-sm uppercase tracking-[0.15em] rotate-[-3deg] shadow-[3px_3px_0_#14110F]"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}
          >
            0G Router unreachable — fleet fails closed, no substitute decision
          </div>
        </div>
      )}

      {/* 2. Human Gate desk */}
      {gate && (
        <div className="fixed inset-0 z-50 bg-[#14110F]/75 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg bg-[#F2EADB] border-2 border-[#14110F] shadow-[4px_4px_0_#14110F] p-6 space-y-4">
            {/* Archival header + countdown ring */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#14110F]">
              <div className="flex items-center gap-2.5">
                <span className="text-[#D0342C] text-2xl" aria-hidden="true">
                  ⚖
                </span>
                <div>
                  <div
                    className="text-xs uppercase text-[#D0342C] tracking-wider font-bold"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Security Checkpoint Desk
                  </div>
                  <h3 className="text-2xl font-bold text-[#14110F]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Zone {gate.request.zoneId} Perimeter Entry
                  </h3>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center bg-[#FAF4E9] shadow-[2px_2px_0_#14110F] ${
                  secondsLeft <= 10 ? "border-[#D0342C] animate-pulse" : "border-[#D0342C]"
                }`}
                aria-live="polite"
              >
                <span className="font-bold text-xs text-[#D0342C] tabular-nums" style={{ fontFamily: "'Geist Mono', monospace" }}>
                  {secondsLeft}s
                </span>
                <span
                  className="text-[6.5px] uppercase text-[#14110F]/60"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  LEFT
                </span>
              </div>
            </div>

            {/* Robot details */}
            <div className="bg-[#E6DBC3] border border-[#14110F] p-3 space-y-1 font-mono text-xs">
              {[
                ["ROBOT UNIT:", `${gateRobot?.name ?? gate.request.robotId} (${gateRobot?.code ?? "—"})`],
                ["CARRIER ENS:", gateRobot?.ens ?? "—"],
                ["SECTOR:", `RESTRICTED ZONE ${gate.request.zoneId}`],
                ["REQUEST ID:", `zg-req-${gate.request.id}`],
                ["NONCE:", gate.request.nonce],
              ].map(([k, v], i) => (
                <div key={k} className={`flex justify-between gap-3 ${i === 2 ? "text-[#D0342C] font-bold" : ""}`}>
                  <span className={i === 2 ? "" : "text-[#14110F]/70"}>{k}</span>
                  <span className="truncate">{v}</span>
                </div>
              ))}
            </div>

            <p className="font-mono text-[10px] text-[#14110F]/70 text-center">
              Awaiting Stationmaster gate decision · approve mints a single-use token bound to robot, zone,
              nonce and 0G request id (TTL {gate.request.ttlMs / 1000}s).
            </p>

            {/* Stamp buttons */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <button
                onClick={() => controls.resolveGate("approved")}
                disabled={gate.resolving}
                className={`${stampBtn} bg-[#2E9E5B]`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <span>{gate.resolving ? "Stamping…" : "Approve Entry"}</span>
                <span className="font-mono text-[8px] font-normal text-[#F2EADB]/80">
                  Mint single-use token [STAMP]
                </span>
              </button>
              <button
                onClick={() => controls.resolveGate("denied")}
                disabled={gate.resolving}
                className={`${stampBtn} bg-[#D0342C]`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <span>Deny / Halt</span>
                <span className="font-mono text-[8px] font-normal text-[#F2EADB]/80">
                  Trigger safe turnaround
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Verdict overlay */}
      {showVerdict && !gate && (
        <div className="fixed inset-0 z-50 bg-[#14110F]/80 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl bg-[#F2EADB] border-2 border-[#14110F] shadow-[4px_4px_0_#14110F] p-6 text-center space-y-5">
            {/* Giant slammed rubber stamp */}
            <div
              className={`my-2 inline-block border-4 ${STAMP_TONE[verdict]} px-8 py-2 -rotate-6 bg-[#F2EADB]/95 shadow-[4px_4px_0_#14110F] ${
                reducedMotion ? "opacity-100" : "animate-[stamp-slam_0.35s_cubic-bezier(0.2,1.4,0.4,1)_both]"
              }`}
            >
              <span
                className="text-5xl md:text-6xl font-bold tracking-widest uppercase"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {verdict}
              </span>
            </div>

            <div className="font-mono text-[11px] text-[#14110F]/75 uppercase tracking-wider">
              {haltReason ? `REASON ${haltReason} · ` : ""}
              {STAMP_REASON[verdict]}
            </div>

            {/* Simulated proof receipt strip */}
            <div className="bg-[#E6DBC3] border border-[#14110F] p-3 mx-2 text-left font-mono text-[11px] shadow-[2px_2px_0_#14110F] space-y-1">
              <div className="flex justify-between pb-1 border-b border-[#14110F]/20">
                <span className="font-bold">EPISODE {runner.records.length} STEPS RECORDED</span>
                <span className="text-[9px] text-[#14110F]/60 font-bold">SIMULATED PROOF DATA</span>
              </div>
              <div className="text-[#14110F]/80">{STAMP_REASON[verdict]}.</div>
              <div className="text-[9px] text-[#14110F]/50">
                Anchor: RelayLedger @ 0G Galileo · root 0x99a1f04ec90231aa… [pending live wiring]
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onOpenReceipt();
                  setDismissedVerdict(verdict);
                }}
                className="px-4 py-2 bg-[#FFF8EF] border border-[#14110F] font-extrabold text-xs uppercase tracking-wider shadow-[2px_2px_0_#14110F] hover:bg-[#E6DBC3] transition-colors"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                View Receipt
              </button>
              <button
                onClick={() => {
                  controls.reset();
                  controls.play();
                  setDismissedVerdict(verdict);
                }}
                className="px-5 py-2 bg-[#FFC20E] border-2 border-[#14110F] font-extrabold text-xs uppercase tracking-wider shadow-[2.5px_2.5px_0_#14110F] hover:shadow-[3.5px_3.5px_0_#14110F] transition-all"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Run Again →
              </button>
              <button
                onClick={() => setDismissedVerdict(verdict)}
                className="px-4 py-2 bg-[#FFF8EF] border border-[#14110F] font-extrabold text-xs uppercase tracking-wider shadow-[2px_2px_0_#14110F] hover:bg-[#E6DBC3] transition-colors"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes stamp-slam {
          0% {
            opacity: 0;
            transform: rotate(-6deg) scale(2.4);
          }
          70% {
            opacity: 1;
            transform: rotate(-6deg) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: rotate(-6deg) scale(1);
          }
        }
      `}</style>
    </>
  );
}
