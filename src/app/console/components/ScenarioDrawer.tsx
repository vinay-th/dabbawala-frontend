"use client";

// "The Line" — the scenario drawer (slide-over, left). 10 dispatch test
// cases grouped into chapters like a railway timetable. Includes the
// 600ms Surprise-Me highlight cycle (instant under reduced motion).

import { useCallback, useRef, useState } from "react";
import { SCENARIOS } from "../data/scenarios";
import type { ScenarioTestCase } from "../data/types";

const CHAPTERS: { title: string; tone: string; ids: string[] }[] = [
  { title: "Chapter I · Happy Path", tone: "text-[#2E9E5B]", ids: ["TC-01", "TC-02", "TC-03"] },
  { title: "Chapter II · Micropayments & Spending", tone: "text-[#14110F]", ids: ["TC-04", "TC-05"] },
  { title: "Chapter III · Identity & Access", tone: "text-[#14110F]", ids: ["TC-08"] },
  { title: "Chapter IV · Human Gate Mandate", tone: "text-[#D0342C]", ids: ["TC-12", "TC-13"] },
  { title: "Chapter V · 0G Galileo", tone: "text-[#0F5257]", ids: ["TC-16"] },
  { title: "Chapter VI · Ledger Replay", tone: "text-[#14110F]", ids: ["TC-20"] },
];

const OUTCOME_TONE: Record<ScenarioTestCase["expectedOutcome"], string> = {
  DELIVERED: "text-[#2E9E5B]",
  REROUTED: "text-[#2E9E5B]",
  HALTED: "text-[#D0342C]",
  REFUSED: "text-[#D0342C]",
};

type ScenarioDrawerProps = {
  open: boolean;
  selected: ScenarioTestCase;
  onSelect: (s: ScenarioTestCase) => void;
  onClose: () => void;
  reducedMotion: boolean;
};

export default function ScenarioDrawer({ open, selected, onSelect, onClose, reducedMotion }: ScenarioDrawerProps) {
  const [flashId, setFlashId] = useState<string | null>(null);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const surpriseMe = useCallback(() => {
    if (cycleRef.current) clearInterval(cycleRef.current);
    if (reducedMotion) {
      onSelect(SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);
      return;
    }
    const started = Date.now();
    cycleRef.current = setInterval(() => {
      const candidate = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      setFlashId(candidate.id);
      if (Date.now() - started >= 600) {
        if (cycleRef.current) clearInterval(cycleRef.current);
        cycleRef.current = null;
        setFlashId(null);
        onSelect(candidate);
      }
    }, 60);
  }, [onSelect, reducedMotion]);

  return (
    <div
      className={`fixed top-14 bottom-0 left-0 z-30 w-[380px] bg-[#F2EADB] border-r-2 border-[#14110F] shadow-[3px_3px_0_#14110F] flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <div className="p-3.5 border-b-2 border-[#14110F] bg-[#E6DBC3] flex items-start justify-between">
        <div>
          <div className="text-[11px] text-[#14110F]/60" style={{ fontFamily: "'Tiro Devanagari Marathi', serif" }}>
            मुंबई रेल्वे मार्गिका · संपूर्ण विन्यास
          </div>
          <h2
            className="text-2xl font-bold uppercase tracking-wide text-[#14110F]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            The Line — Dispatch Scenarios
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 border border-[#14110F] bg-[#F2EADB] flex items-center justify-center font-mono font-bold text-sm hover:bg-[#D0342C] hover:text-[#F2EADB] transition-colors"
          aria-label="Close scenario drawer"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {CHAPTERS.map((ch) => (
          <div key={ch.title}>
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#14110F]/14">
              <span
                className={`font-bold text-sm uppercase ${ch.tone}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {ch.title}
              </span>
              <span className="font-mono text-[9px] text-[#14110F]/50">({ch.ids.join(" · ")})</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {ch.ids.map((id) => {
                const s = SCENARIOS.find((x) => x.id === id);
                if (!s) return null;
                const isSelected = s.id === selected.id;
                const isFlash = flashId === s.id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelect(s)}
                    className={`text-left border p-2.5 transition-colors relative ${
                      isSelected
                        ? "border-2 border-[#14110F] bg-[#FFC20E]/25"
                        : isFlash
                          ? "border-2 border-[#14110F] bg-[#FFC20E]/40"
                          : "border-[#14110F] bg-[#FAF4E9] hover:bg-[#FFC20E]/20"
                    }`}
                    style={{ boxShadow: "2px 2px 0 #14110F" }}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 font-mono text-[8px] bg-[#14110F] text-[#FFC20E] px-1 font-bold">
                        LOADED
                      </span>
                    )}
                    <div className="font-mono text-[10px] text-[#14110F]/50">
                      LVL {id.replace("TC-", "")} · {s.track.toUpperCase()}
                    </div>
                    <div className="font-bold text-sm text-[#14110F] mt-0.5">{s.title}</div>
                    <div className="font-mono text-[9px] text-[#14110F]/70 mt-1 leading-snug">{s.description}</div>
                    <div className={`font-mono text-[9px] mt-1.5 font-bold ${OUTCOME_TONE[s.expectedOutcome]}`}>
                      ● EXPECTS {s.expectedOutcome}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-[#E6DBC3] border-t-2 border-[#14110F] flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-[#14110F]/60">All 3 robots dispatch every run.</span>
        <button
          onClick={surpriseMe}
          className="px-4 py-2 bg-[#FFC20E] text-[#14110F] border-2 border-[#14110F] uppercase tracking-wider text-xs font-extrabold hover:shadow-[3.5px_3.5px_0_#14110F] active:shadow-[0.5px_0.5px_0_#14110F] active:translate-x-[2px] active:translate-y-[2px] transition-all shrink-0"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", boxShadow: "2.5px 2.5px 0 #14110F" }}
        >
          Surprise Me
        </button>
      </div>
    </div>
  );
}
