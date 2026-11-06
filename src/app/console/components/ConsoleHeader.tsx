"use client";

// Floating console topbar. The brand lockup is identical to the landing
// page header (TiffinMark + Barlow brand + Marathi line) and the whole
// lockup is the link back to `/` — no separate "go to landing" button.
// Right side: scenario level pill, NET indicator, 0G signal lever.

import Link from "next/link";
import { useEffect, useState } from "react";
import TiffinMark from "@/app/components/landing/TiffinMark";
import type { ScenarioTestCase } from "../data/types";
import { loadBackendReadiness, type BackendReadiness } from "../services/consoleApi";

type ConsoleHeaderProps = {
  scenario: ScenarioTestCase;
  ogUp: boolean;
  onToggleOg: () => void;
  onOpenTheLine: () => void;
};

export default function ConsoleHeader({ scenario, ogUp, onToggleOg, onOpenTheLine }: ConsoleHeaderProps) {
  const [readiness, setReadiness] = useState<BackendReadiness | null>(null);

  useEffect(() => {
    loadBackendReadiness().then((r) => {
      if (r) setReadiness(r);
    });
    const id = setInterval(() => {
      loadBackendReadiness().then((r) => {
        if (r) setReadiness(r);
      });
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const computeStatus = readiness?.zero_g.compute.status;
  const isProven = readiness?.zero_g.compute.proven ?? false;

  let label = "0G ACTIVE";
  let dotColor = "bg-[#2E9E5B]";

  if (!ogUp) {
    label = "0G HALTED";
    dotColor = "bg-[#D0342C]";
  } else if (computeStatus === "LIVE") {
    if (isProven) {
      label = "0G LIVE (PROVEN)";
      dotColor = "bg-[#2E9E5B]";
    } else {
      label = "0G CONFIGURED";
      dotColor = "bg-[#E07B00]"; // Amber for configured but not yet verified
    }
  } else if (computeStatus === "MOCK") {
    label = "0G MOCK";
    dotColor = "bg-[#0F5257]";
  } else if (computeStatus === "BLOCKED") {
    label = "0G BLOCKED";
    dotColor = "bg-[#D0342C]";
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 py-2.5 flex items-center justify-between border-b border-[#14110F]/15 bg-[#F2EADB]/90 backdrop-blur-[4px]">
      {/* Brand lockup (same as landing; click -> landing) */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Dabbawala Protocol — home">
          <TiffinMark className="w-5 h-6 text-[#14110F] shrink-0 group-hover:scale-105 transition-transform" />
          <span className="flex flex-col leading-none">
            <span
              className="font-extrabold uppercase tracking-[0.08em] text-base text-[#14110F]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Dabbawala Protocol
            </span>
            <span
              className="text-[10px] text-[#14110F]/70 tracking-wide mt-0.5 leading-none"
              style={{ fontFamily: "'Tiro Devanagari Marathi', serif" }}
            >
              मुंबईचे डबेवाले · स्वायत्त यंत्रणा
            </span>
          </span>
        </Link>

        <div className="hidden md:block w-px h-6 bg-[#14110F]/15 mx-2" />

        {/* Level pill (opens The Line drawer) */}
        <button
          onClick={onOpenTheLine}
          className="flex items-center gap-2 px-2.5 py-1 border border-[#14110F]/30 bg-[#FAF4E9]/90 hover:border-[#14110F] hover:bg-[#E6DBC3] transition-colors cursor-pointer group"
          title="Switch dispatch scenario"
        >
          <span
            className="font-extrabold text-[11px] tracking-widest uppercase text-[#D0342C] bg-[#D0342C]/10 px-1"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            LVL {scenario.id.replace("TC-", "")}
          </span>
          <span
            className="text-sm text-[#14110F] italic"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {scenario.title}
          </span>
          <span className="text-[13px] text-[#14110F]/60 group-hover:translate-y-0.5 transition-transform">▾</span>
        </button>
      </div>

      {/* Right: NET + 0G lever */}
      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#14110F]/75 pr-1"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E9E5B] animate-pulse" />
          <span className="tracking-wider uppercase">NET: SepoliaETH</span>
        </div>

        <button
          onClick={onToggleOg}
          className="flex items-center gap-1.5 px-2.5 py-1 border border-[#14110F]/30 bg-[#FAF4E9]/90 hover:border-[#14110F] transition-colors cursor-pointer"
          style={{ fontFamily: "'Geist Mono', monospace" }}
          aria-pressed={!ogUp}
          aria-label="Toggle simulated 0G outage"
          title="Toggle 0G Galileo consensus heartbeat"
        >
          <span
            className={`w-2 h-2 rounded-full ${dotColor} ${ogUp && computeStatus === "LIVE" && isProven ? "animate-pulse" : ""}`}
          />
          <span className="font-bold tracking-wider text-[10px]">{label}</span>
        </button>
      </div>
    </header>
  );
}
