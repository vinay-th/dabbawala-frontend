"use client";

// Simulation runner for the /console demo board. This is a DETERMINISTIC
// replay engine over the static scenario data in ../data/scenarios.ts:
// the same scenario + seed always produces the same frames (ROADMAP test R1).
// It models the Policy Gate outcomes (approve, deny, halt, outage) but does
// NOT contact any network — every proof shown here is SIMULATED demo data.
// Real 0G / Hedera / ENS integration lands in Phase B, not in this file.

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GateRequest,
  HaltReason,
  RobotId,
  ScenarioTestCase,
} from "../data/types";

export type Verdict =
  | "DELIVERED"
  | "REROUTED"
  | "HALTED"
  | "REFUSED"
  | "DENIED"
  | "SAFE-STOP";

export type RobotRuntime = {
  id: RobotId;
  progress: number; // 0..1 along its current leg
  state: "idle" | "moving" | "checkpoint" | "halted" | "delivered";
  callout: string | null;
};

export type GateSession = {
  request: GateRequest;
  remainingMs: number;
};

export type StepRecord = {
  stepIndex: number;
  checkpointId: string;
  outcome: "ok" | "wait" | "stop";
  gateToken: string | null;
  gateDecision: "approved" | "denied" | "expired" | null;
};

const TICK_MS = 50;
const BASE_PROGRESS_PER_TICK = 0.012; // 1x -> ~4.2s per leg
const GATE_TTL_MS = 60_000; // token TTL <= 60s (invariant 7)
const ROBOT_LAG = 0.18; // convoy stagger between robots (progress units)

const HALT_STAMP: Record<string, Verdict> = {
  ZG_TIMEOUT: "SAFE-STOP",
  ZG_TRANSPORT: "SAFE-STOP",
  ZG_MALFORMED: "SAFE-STOP",
  OVER_CAP: "REFUSED",
  BUDGET_EXHAUSTED: "REFUSED",
  POLICY_PAUSED: "HALTED",
  GATE_DENIED: "DENIED",
};

const CALLOUT_BY_ACTION: Record<string, string> = {
  "hedera_payment": "⚡ Paying 0.002 HBAR",
  "ens_policy": "🛂 ENS Policy Read",
  "human_gate": "🛑 Zone R-2 Halt Flag",
  "relay": "📦 Handoff Sync",
  "delivery": "🏁 Delivering",
};

type RunnerState = {
  stepIndex: number;
  progress: number; // lead robot progress along current leg
  playing: boolean;
  speed: 1 | 2 | 4;
  gate: GateSession | null;
  verdict: Verdict | null;
  haltReason: HaltReason | null;
  halted: boolean;
  records: StepRecord[];
};

const INITIAL: RunnerState = {
  stepIndex: 0,
  progress: 0,
  playing: false,
  speed: 1,
  gate: null,
  verdict: null,
  haltReason: null,
  halted: false,
  records: [],
};

function stampForHalt(reason: HaltReason): Verdict {
  return HALT_STAMP[reason] ?? "HALTED";
}

export function useScenarioRunner(scenario: ScenarioTestCase, ogUp: boolean) {
  const [state, setState] = useState<RunnerState>(INITIAL);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref mirror so the interval callback reads fresh state without re-subscribing.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Reset whenever a different scenario is loaded (adjust-state-during-render
  // pattern instead of setState-in-effect).
  const [lastScenarioId, setLastScenarioId] = useState(scenario.id);
  if (lastScenarioId !== scenario.id) {
    setLastScenarioId(scenario.id);
    setState(INITIAL);
  }

  const advanceStep = useCallback(
    (s: RunnerState): RunnerState => {
      const step = scenario.steps[s.stepIndex];
      if (!step) return s;

      const record = (outcome: StepRecord["outcome"], decision: StepRecord["gateDecision"] = null): StepRecord => ({
        stepIndex: s.stepIndex,
        checkpointId: step.checkpointId,
        outcome,
        gateToken: null,
        gateDecision: decision,
      });

      // 1. Gate request pauses the run and opens the human gate modal.
      if (step.gateRequest || step.action.type === "ask_human") {
        const request: GateRequest = step.gateRequest ?? {
          id: `gr-auto-${s.stepIndex}`,
          robotId: scenario.activeRobots[0],
          zoneId: step.action.type === "ask_human" ? step.action.zoneId : "R-2",
          nonce: `n-${scenario.id}-${s.stepIndex}`,
          ttlMs: GATE_TTL_MS,
          status: "pending",
        };
        return {
          ...s,
          playing: false,
          gate: { request, remainingMs: GATE_TTL_MS },
          records: [...s.records, record("wait")],
        };
      }

      // 2. Halt action (cap, budget, pause, outage) ends the run with a stamp.
      if (step.action.type === "halt") {
        const reason = step.action.reason;
        return {
          ...s,
          playing: false,
          halted: true,
          haltReason: reason,
          verdict: stampForHalt(reason),
          records: [...s.records, record("stop")],
        };
      }

      // 3. Terminal step -> final verdict.
      if (s.stepIndex === scenario.steps.length - 1) {
        return {
          ...s,
          playing: false,
          verdict: scenario.expectedOutcome === "REROUTED" ? "REROUTED" : "DELIVERED",
          records: [...s.records, record("ok")],
        };
      }

      // 4. Ordinary step -> next leg.
      return {
        ...s,
        stepIndex: s.stepIndex + 1,
        progress: 0,
        records: [...s.records, record("ok")],
      };
    },
    [scenario],
  );

  // Main clock.
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const s = stateRef.current;
      if (!s.playing || s.gate) return;

      const nextProgress = s.progress + BASE_PROGRESS_PER_TICK * s.speed;
      if (nextProgress >= 1) {
        setState((cur) => advanceStep(cur));
      } else {
        setState((cur) => ({ ...cur, progress: nextProgress }));
      }
    }, TICK_MS);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [advanceStep]);

  // Gate countdown.
  useEffect(() => {
    if (!state.gate) return;
    const id = setInterval(() => {
      setState((cur) => {
        if (!cur.gate) return cur;
        const remainingMs = cur.gate.remainingMs - 1000;
        if (remainingMs <= 0) {
          const rec = cur.records[cur.records.length - 1];
          return {
            ...cur,
            gate: null,
            halted: true,
            haltReason: "APPROVAL_EXPIRED",
            verdict: "HALTED",
            records: rec
              ? [...cur.records.slice(0, -1), { ...rec, gateDecision: "expired" }]
              : cur.records,
          };
        }
        return { ...cur, gate: { ...cur.gate, remainingMs } };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.gate !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // 0G outage: fail closed mid-run (invariant 4). Resume requires 0G back
  // plus a fresh play() which simulates a fresh 0G call + policy read.
  const outageRef = useRef(ogUp);
  useEffect(() => {
    const wasUp = outageRef.current;
    outageRef.current = ogUp;
    if (wasUp && !ogUp) {
      setState((cur) => {
        if (!cur.playing || cur.verdict) return cur;
        const rec = cur.records[cur.records.length - 1];
        return {
          ...cur,
          playing: false,
          halted: true,
          haltReason: "ZG_TIMEOUT",
          verdict: "SAFE-STOP",
          records: rec
            ? cur.records.map((r, i) =>
                i === cur.records.length - 1 ? { ...r, outcome: "stop" as const } : r,
              )
            : cur.records,
        };
      });
    }
  }, [ogUp]);

  // Controls -------------------------------------------------------------
  const play = useCallback(() => {
    setState((cur) => {
      // Resume after halt only when 0G is back (fresh call + policy read).
      if (cur.halted && !ogUp) return cur;
      if (cur.verdict && cur.halted && ogUp) {
        return { ...cur, playing: true, halted: false, verdict: null, haltReason: null };
      }
      if (cur.verdict) return cur; // run finished; reset to replay
      return { ...cur, playing: true };
    });
  }, [ogUp]);

  const pause = useCallback(() => {
    setState((cur) => ({ ...cur, playing: false }));
  }, []);

  const stepForward = useCallback(() => {
    setState((cur) => {
      if (cur.playing || cur.verdict) return cur;
      return advanceStep({ ...cur, progress: 1 });
    });
  }, [advanceStep]);

  const stepBack = useCallback(() => {
    setState((cur) => {
      if (cur.playing || cur.gate) return cur;
      const stepIndex = Math.max(0, cur.stepIndex - 1);
      return {
        ...cur,
        stepIndex,
        progress: 0,
        halted: false,
        verdict: null,
        haltReason: null,
        records: cur.records.filter((r) => r.stepIndex < stepIndex),
      };
    });
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  const setSpeed = useCallback((speed: 1 | 2 | 4) => {
    setState((cur) => ({ ...cur, speed }));
  }, []);

  const resolveGate = useCallback((decision: "approved" | "denied") => {
    setState((cur) => {
      if (!cur.gate) return cur;
      const rec = cur.records[cur.records.length - 1];
      const stamped: StepRecord | null = rec
        ? {
            ...rec,
            gateDecision: decision,
            gateToken:
              decision === "approved"
                ? `tok-${cur.gate.request.nonce}-${cur.gate.request.id}`
                : null,
          }
        : null;

      if (decision === "denied") {
        return {
          ...cur,
          gate: null,
          halted: true,
          haltReason: "GATE_DENIED",
          verdict: "DENIED",
          records: stamped ? [...cur.records.slice(0, -1), stamped] : cur.records,
        };
      }

      // Approved: single-use token minted; run resumes (or completes if last step).
      const cleared = { ...cur, gate: null, records: stamped ? [...cur.records.slice(0, -1), stamped] : cur.records };
      if (cur.stepIndex === scenario.steps.length - 1) {
        return {
          ...cleared,
          playing: false,
          verdict: scenario.expectedOutcome === "REROUTED" ? "REROUTED" : "DELIVERED",
        };
      }
      return { ...cleared, playing: true, stepIndex: cur.stepIndex + 1, progress: 0 };
    });
  }, [scenario]);

  // Derived robot runtimes: lead follows progress; convoy robots lag by ROBOT_LAG.
  const robots: RobotRuntime[] = scenario.activeRobots.map((id, idx) => {
    const lag = idx * ROBOT_LAG;
    const p = Math.max(0, state.progress - lag);
    const lastRecord = state.records[state.records.length - 1];
    const leadStep = scenario.steps[state.stepIndex];

    let robotState: RobotRuntime["state"] = "idle";
    let callout: string | null = null;

    if (state.halted && idx === 0) {
      robotState = "halted";
      callout = state.haltReason ? `🛑 Halt: ${state.haltReason}` : "🛑 Halted";
    } else if (state.verdict === "DELIVERED" || state.verdict === "REROUTED") {
      robotState = "delivered";
      callout = "✅ Delivered";
    } else if (state.playing || p > 0) {
      robotState = p >= 1 ? "checkpoint" : "moving";
      if (leadStep) {
        const cp = scenario.checkpoints.find((c) => c.id === leadStep.checkpointId);
        callout = cp ? CALLOUT_BY_ACTION[cp.type] ?? null : null;
      }
      if (leadStep?.action.type === "reroute") callout = "📍 0G Route Verified";
    } else if (state.gate) {
      robotState = "checkpoint";
      callout = "🛑 Awaiting Approver";
    } else if (lastRecord) {
      robotState = "checkpoint";
    }

    return { id, progress: p, state: robotState, callout };
  });

  return {
    stepIndex: state.stepIndex,
    progress: state.progress,
    playing: state.playing,
    speed: state.speed,
    gate: state.gate,
    verdict: state.verdict,
    haltReason: state.haltReason,
    records: state.records,
    robots,
    totalSteps: scenario.steps.length,
    controls: {
      play,
      pause,
      reset,
      stepForward,
      stepBack,
      setSpeed,
      resolveGate,
    },
  };
}

export type ScenarioRunner = ReturnType<typeof useScenarioRunner>;
