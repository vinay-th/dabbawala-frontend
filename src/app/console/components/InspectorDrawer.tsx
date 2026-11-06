"use client";

// Cryptographic receipt drawer (380px, right slide-out). Top: the selected
// robot's block-stamped ENS passport (fetched through consoleApi — the
// backend swap point). Middle: the 5-tier checkpoint proof receipt.
// Bottom: episode JSON export (also via consoleApi). All values are
// SIMULATED until ROADMAP Phase B wires live ENS / 0G / Hedera reads.

import { useEffect, useState } from "react";
import { loadEpisodeLog, loadPassport, loadBackendReadiness, type EpisodeLog, type BackendReadiness } from "../services/consoleApi";
import type { RobotId, RobotPassport, ScenarioTestCase } from "../data/types";
import type { ScenarioRunner, StepRecord } from "../state/useScenarioRunner";

const TIER_META = [
  { tier: 1, title: "Passport (ENS Resolution)", border: "border-[#2E9E5B]" },
  { tier: 2, title: "x402 Payment Channel", border: "border-[#FFC20E]" },
  { tier: 3, title: "0G Decision Matrix", border: "border-[#0F5257]" },
  { tier: 4, title: "Human Gate Sign-off", border: "border-[#14110F]/30" },
  { tier: 5, title: "Ledger Record (0G Storage)", border: "border-[#14110F]/30" },
] as const;

function tierStatus(record: StepRecord | undefined, tier: number): "verified" | "pending" | "failed" {
  if (!record) return "pending";
  if (tier === 4) {
    if (record.gateDecision === "approved") return "verified";
    if (record.gateDecision === "denied" || record.gateDecision === "expired") return "failed";
    return "pending";
  }
  if (record.outcome === "stop") return "failed";
  if (record.outcome === "wait") return "pending";
  return "verified";
}

const STATUS_TONE: Record<"verified" | "pending" | "failed", string> = {
  verified: "text-[#2E9E5B]",
  pending: "text-[#E07B00]",
  failed: "text-[#D0342C]",
};

type InspectorDrawerProps = {
  open: boolean;
  scenario: ScenarioTestCase;
  runner: ScenarioRunner;
  selectedRobot: RobotId;
  onClose: () => void;
};

export default function InspectorDrawer({
  open,
  scenario,
  runner,
  selectedRobot,
  onClose,
}: InspectorDrawerProps) {
  const [passport, setPassport] = useState<RobotPassport | null>(null);
  const [readiness, setReadiness] = useState<BackendReadiness | null>(null);

  useEffect(() => {
    loadBackendReadiness().then((r) => {
      if (r) setReadiness(r);
    });
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    loadPassport(selectedRobot).then((p) => {
      if (!cancelled) setPassport(p);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedRobot, runner.records.length]);

  const lastRecord = runner.records[runner.records.length - 1];
  const robotRuntime = runner.robots.find((r) => r.id === selectedRobot);

  const exportJson = async () => {
    const log: EpisodeLog = {
      schema: "dabbawala.console.replay/v1",
      scenario: scenario.id,
      seed: `sim-${scenario.id.toLowerCase()}`,
      exportedAtMs: Date.now(),
      simulated: true,
      robots: runner.robots,
      steps: runner.records,
      verdict: runner.verdict,
      haltReason: runner.haltReason,
    };
    const served = await loadEpisodeLog(log); // future: GET /api/episodes/:id/log
    const blob = new Blob([JSON.stringify(served, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `episode-${scenario.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tierDetail = (tier: number): string => {
    switch (tier) {
      case 1:
        return passport
          ? `block ${passport.block.number} · ${passport.ensName} · ${passport.status.toUpperCase()}`
          : "reading passport…";
      case 2:
        return lastRecord?.outcome === "stop"
          ? "Refusal: 0.050 HBAR demanded, cap 0.005 [REFUSED]"
          : "tx 0.0.6001#492 · 0.002 HBAR → route-intel [SETTLED]";
      case 3:
        if (readiness?.zero_g.compute.status === "BLOCKED") {
          return "0G Compute: BLOCKED (No Router sk- key) [SAFE-STOP]";
        }
        if (readiness?.zero_g.compute.status === "MOCK") {
          return "0G Compute: MOCK [PROPOSAL-ONLY]";
        }
        return readiness?.zero_g.compute.proven
          ? `0G Compute: LIVE [TEE-VERIFIED] · model ${readiness.zero_g.compute.model ?? "glm-5"}`
          : "0G Compute: LIVE [CONFIGURED · NOT YET TESTED]";
      case 4:
        if (lastRecord?.gateToken) return `token ${lastRecord.gateToken} · single-use · TTL ≤ 60s [MINTED]`;
        if (lastRecord?.gateDecision === "expired") return "expired: gate stayed closed [EXPIRED]";
        if (lastRecord?.gateDecision === "denied") return "denied: no token issued [DENIED]";
        return "awaiting stationmaster decision [STANDBY]";
      case 5:
        if (readiness?.zero_g.storage.status === "BLOCKED") {
          return "0G Storage: BLOCKED (No Galileo key) [LOCAL-ONLY]";
        }
        if (readiness?.zero_g.storage.status === "MOCK") {
          return "0G Storage: MOCK [UNANCHORED]";
        }
        return "0G Storage: LIVE · chain 16602 Galileo";
      default:
        return "";
    }
  };

  return (
    <div
      className={`fixed top-14 bottom-0 right-0 z-30 w-[380px] bg-[#F2EADB] border-l-2 border-[#14110F] shadow-[-3px_3px_0_#14110F] flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <div className="p-4 border-b-2 border-[#14110F] bg-[#E6DBC3] flex items-center justify-between">
        <div>
          <div className="text-xs uppercase text-[#14110F]/60" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>
            Cryptographic Proof Ledger
          </div>
          <h3 className="text-xl font-bold text-[#14110F]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            5-Checkpoint Receipt
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 border border-[#14110F] bg-[#F2EADB] flex items-center justify-center font-mono font-bold text-xs hover:bg-[#D0342C] hover:text-[#F2EADB] transition-colors"
          aria-label="Close receipt drawer"
        >
          ✕
        </button>
      </div>

      {/* Passport */}
      <div className="px-4 py-3 border-b border-[#14110F]/15">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#14110F]/60" style={{ fontFamily: "'Geist Mono', monospace" }}>
            Robot Passport · {robotRuntime?.state ?? "idle"}
          </span>
          <span className="text-[9px] text-[#14110F]/45" style={{ fontFamily: "'Geist Mono', monospace" }}>
            {passport ? `BLOCK ${passport.block.number} · SIM` : "LOADING"}
          </span>
        </div>
        <div className="space-y-0.5">
          {(passport
            ? ([
                ["name", passport.ensName],
                ["owner", passport.owner],
                ["resolver", passport.resolver],
                ["zones", passport.zones.join(", ")],
                ["budget", `${passport.budgetMicroHbar} µHBAR`],
                ["status", robotRuntime?.state === "halted" ? "paused" : passport.status],
                ["last-episode", passport.lastEpisode],
              ] as const)
            : ([["name", "…"]] as const)
          ).map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-2 text-[10.5px]" style={{ fontFamily: "'Geist Mono', monospace" }}>
              <span className="opacity-55 shrink-0">{k}</span>
              <span className="text-right truncate">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5-tier receipt */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10.5px]">
        {TIER_META.map(({ tier, title, border }) => {
          const status = tierStatus(lastRecord, tier);
          return (
            <div key={tier} className={`border-l-2 pl-2.5 space-y-0.5 ${border}`}>
              <div className="flex items-center justify-between">
                <div className="font-bold text-[#14110F] text-[11px]">
                  {tier}. {title.toUpperCase()}
                </div>
                <div className={`text-[9px] font-bold ${STATUS_TONE[status]}`}>● {status.toUpperCase()}</div>
              </div>
              <div className="text-[#14110F]/70">{tierDetail(tier)}</div>
              <div className="bg-[#E6DBC3]/80 p-1 text-[8.5px] truncate">
                {tier === 1 && `policyHash 0xens…3c · source ${passport?.source ?? "sim"}`}
                {tier === 2 && "header x402-Hedera-4920 · facilitator official-x402"}
                {tier === 3 && "model galileo-da · verify_tee=true · ZG-Res-Key captured"}
                {tier === 4 && "allowlist: stationmaster-01 · nonce bound to robot+zone"}
                {tier === 5 && "episode ep-…-001 · JSONL · log-lint clean"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export */}
      <div className="p-3 bg-[#E6DBC3] border-t-2 border-[#14110F] font-mono text-[9.5px] flex items-center justify-between">
        <span className="text-[#14110F]/60">STATUS: RECORD ATTESTED</span>
        <button
          onClick={exportJson}
          className="px-2.5 py-1 bg-[#14110F] text-[#F2EADB] font-bold hover:bg-[#14110F]/80 transition-colors"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}
