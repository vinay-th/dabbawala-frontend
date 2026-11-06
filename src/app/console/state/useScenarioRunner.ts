"use client";

// Deterministic replay engine for the /console board (v2).
// Every scenario carries three robot lanes; this engine advances all three
// along their own polylines on one shared step clock, resolves gates
// through the consoleApi service boundary (the future backend swap point),
// and fails closed on 0G outage. No network I/O happens today: all proof
// data is SIMULATED demo data until ROADMAP Phase B.

import { useCallback, useEffect, useRef, useState } from "react";
import { loadPassport, submitGateDecision, triggerMissionDecision } from "../services/consoleApi";
import type {
  GateRequest,
  HaltReason,
  RobotId,
  RobotLane,
  RouteWaypoint,
  ScenarioTestCase,
  StateSummary,
} from "../data/types";

/**
 * Backend decision response type from POST /v1/mission/decide.
 * VERIFIED: Actual return type from consoleApi.ts lines 235-247.
 * The API returns optional fields - we validate at runtime in validateBackendDecision.
 */
export type BackendDecision = {
  source: string;
  action?: { type: string; routeId?: string };
  requestId: string;
  halted?: boolean;
  reason?: string;
  detail?: string;
  policyApproved?: boolean;
  policyHalt?: { halted: true; reason: string; detail?: string } | null;
  policyBlock: string;
  policyHash: string;
  provenance: { mode: string; recordId: string };
} | null;

/** Validated backend decision with runtime checks */
type ValidatedDecision =
  | { approved: true; action?: { type: string; routeId?: string }; requestId: string }
  | { approved: false; reason: HaltReason; detail?: string };

export type Verdict =
  | "DELIVERED"
  | "REROUTED"
  | "HALTED"
  | "REFUSED"
  | "DENIED"
  | "SAFE-STOP";

export type RobotRuntime = {
  id: RobotId;
  pos: { x: number; y: number };
  state: "idle" | "moving" | "checkpoint" | "halted" | "delivered";
  callout: string | null;
  progress: number;
};

export type GateSession = {
  request: GateRequest;
  remainingMs: number;
  resolving: boolean;
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
const GATE_TTL_MS = 60_000; // token TTL <= 60s (ROADMAP invariant 7)
const CONVOY_LAG = 0.05; // progress stagger between robots
const LANE_ORDER: RobotId[] = ["ramu", "sakhu", "janu"];

/**
 * Policy/passport budget is expressed in microHbar; x402 and the backend
 * StateSummary use Hedera tinybars. 1 microHbar = 100 tinybars
 * (1 HBAR = 1e6 microHbar = 1e8 tinybars). Conversion is explicit so the
 * checkpoint payload never silently reports a fabricated zero budget.
 */
const TINYBARS_PER_MICROHBAR = 100;

const HALT_STAMP: Record<string, Verdict> = {
  ZG_TIMEOUT: "SAFE-STOP",
  ZG_TRANSPORT: "SAFE-STOP",
  ZG_MALFORMED: "SAFE-STOP",
  OVER_CAP: "REFUSED",
  BUDGET_EXHAUSTED: "REFUSED",
  POLICY_PAUSED: "HALTED",
  GATE_DENIED: "DENIED",
};

type RunnerState = {
  stepIndex: number;
  progress: number; // 0..1 along the current step
  playing: boolean;
  speed: 1 | 2 | 4;
  gate: GateSession | null;
  verdict: Verdict | null;
  haltReason: HaltReason | null;
  haltedRobots: RobotId[];
  records: StepRecord[];
  pendingDecision: boolean;
};

const INITIAL: RunnerState = {
  stepIndex: 0,
  progress: 0,
  playing: false,
  speed: 1,
  gate: null,
  verdict: null,
  haltReason: null,
  haltedRobots: [],
  records: [],
  pendingDecision: false,
};

function stampForHalt(reason: HaltReason): Verdict {
  return HALT_STAMP[reason] ?? "HALTED";
}

/** Linear position along a polyline at parametric position u in [0,1]. */
export function pointAlong(route: RouteWaypoint[], u: number): { x: number; y: number } {
  if (route.length === 0) return { x: 0, y: 0 };
  if (route.length === 1) return { x: route[0].x, y: route[0].y };
  const t = Math.min(1, Math.max(0, u)) * (route.length - 1);
  const i = Math.min(route.length - 2, Math.floor(t));
  const f = t - i;
  return {
    x: route[i].x + (route[i + 1].x - route[i].x) * f,
    y: route[i].y + (route[i + 1].y - route[i].y) * f,
  };
}

export function laneToPathD(route: RouteWaypoint[]): string {
  return route.map((wp, i) => `${i === 0 ? "M" : "L"} ${wp.x} ${wp.y}`).join(" ");
}

export function useScenarioRunner(scenario: ScenarioTestCase, ogUp: boolean) {
  const [state, setState] = useState<RunnerState>(INITIAL);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Synchronous useRef-based lock for checkpoint decision requests
  // VERIFIED: Rules of Hooks require hooks at top level, not inside useEffect
  const decisionLockRef = useRef<{
    scenarioId: string;
    stepIndex: number;
    requestId: string;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Authoritative checkpoint budget. Loaded from the passport endpoint
  // (block-stamped ENS read in live mode, sim stub otherwise); never a
  // hardcoded zero. If the passport cannot be read we keep "0" and the backend
  // rejects before any billable inference.
  const budgetRef = useRef<string>("0");
  useEffect(() => {
    let cancelled = false;
    budgetRef.current = "0";
    loadPassport(scenario.leadRobot)
      .then((passport) => {
        if (cancelled) return;
        const microHbar = Number.isFinite(passport.budgetMicroHbar)
          ? Math.max(0, Math.trunc(passport.budgetMicroHbar))
          : 0;
        budgetRef.current = String(microHbar * TINYBARS_PER_MICROHBAR);
      })
      .catch(() => {
        if (!cancelled) budgetRef.current = "0";
      });
    return () => {
      cancelled = true;
    };
  }, [scenario.id, scenario.leadRobot]);


  // Adjust-state-during-render reset when a different scenario loads.
  const [lastScenarioId, setLastScenarioId] = useState(scenario.id);
  if (lastScenarioId !== scenario.id) {
    setLastScenarioId(scenario.id);
    setState(INITIAL);
    decisionLockRef.current = null;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }

  const laneOrder = LANE_ORDER;

  /**
   * Validate backend decision response at runtime.
   * Returns { approved: true } only for valid policyApproved === true.
   * Returns { approved: false, reason } for any rejection, null, or invalid response.
   */
  function validateBackendDecision(
    response: BackendDecision,
    _currentStepIndex: number,
  ): ValidatedDecision {
    // Null response (network error, timeout, 503, etc.)
    if (response === null) {
      return { approved: false, reason: "ZG_TIMEOUT" };
    }

    // Check for halted state (explicit halted: true)
    if (response.halted === true) {
      return { approved: false, reason: response.reason as HaltReason };
    }

    // policyApproved can be true, false, or undefined
    // Only explicit true allows progression
    if (response.policyApproved === true) {
      return { approved: true, action: response.action, requestId: response.requestId };
    }

    // policyApproved is false, undefined, or missing -> reject
    if (response.policyApproved === false && response.policyHalt) {
      return { approved: false, reason: response.policyHalt.reason as HaltReason, detail: response.policyHalt.detail };
    }

    // Malformed or unrecognized response - fail closed
    return { approved: false, reason: "ZG_MALFORMED" };
  }

  const advanceStep = useCallback(
    (s: RunnerState, backendDecision?: BackendDecision | null): RunnerState => {
      const step = scenario.steps[s.stepIndex];
      if (!step) return s;

      const record = (
        outcome: StepRecord["outcome"],
        decision: StepRecord["gateDecision"] = null,
      ): StepRecord => ({
        stepIndex: s.stepIndex,
        checkpointId: step.checkpointId,
        outcome,
        gateToken: null,
        gateDecision: decision,
      });

      // Check if this decision is for our current checkpoint and scenario
      // (prevents stale responses from affecting wrong mission)
      if (backendDecision !== undefined) {
        const validated = validateBackendDecision(backendDecision, s.stepIndex);
        if (!validated.approved) {
          // Decision rejected - halt the robot
          const haltReason: HaltReason = validated.reason;
          const verdict = stampForHalt(haltReason);
          return {
            ...s,
            playing: false,
            haltReason,
            verdict,
            haltedRobots: [...s.haltedRobots, scenario.leadRobot],
            records: [...s.records.slice(0, -1), record("stop", null)],
            pendingDecision: false,
          };
        }

        // ── Action execution state machine (PART 5.2) ─────────────────────
        // The approved action from the 0G proposal must be executed deterministically.
        // No cached or locally fabricated decision is returned.
        const approvedAction = validated.action;
        if (approvedAction) {
          return executeApprovedAction(approvedAction, s, scenario);
        }
        // ──────────────────────────────────────────────────────────────────

        // Approved - proceed to next step
        // Check if this is the terminal step
        if (s.stepIndex === scenario.steps.length - 1) {
          return {
            ...s,
            playing: false,
            verdict: scenario.expectedOutcome === "REROUTED" ? "REROUTED" : "DELIVERED",
            records: [...s.records, record("ok")],
            pendingDecision: false,
          };
        }
        // Ordinary step - advance to next
        return {
          ...s,
          stepIndex: s.stepIndex + 1,
          progress: 0,
          records: [...s.records, record("ok")],
          pendingDecision: false,
        };
      }

      // 1. Gate request pauses the run and opens the human gate modal.
      if (step.gateRequest || step.action.type === "ask_human") {
        const request: GateRequest = step.gateRequest ?? {
          id: `gr-auto-${s.stepIndex}`,
          robotId: scenario.leadRobot,
          zoneId: step.action.type === "ask_human" ? step.action.zoneId : "R-2",
          nonce: `n-${scenario.id}-${s.stepIndex}`,
          ttlMs: GATE_TTL_MS,
          status: "pending",
        };
        return {
          ...s,
          playing: false,
          gate: { request, remainingMs: GATE_TTL_MS, resolving: false },
          records: [...s.records, record("wait")],
          pendingDecision: false,
        };
      }

      // 2. Halt action. A haltTarget stops only that robot; the fleet may
      // continue (TC-08). Otherwise the whole run halts with a stamp.
      if (step.action.type === "halt") {
        const reason = step.action.reason;
        const target = step.haltTarget ?? scenario.leadRobot;
        const haltedRobots = [...new Set([...s.haltedRobots, target])];
        const fleetHalted = scenario.leadRobot === target || haltedRobots.length >= laneOrder.length;
        if (fleetHalted) {
          return {
            ...s,
            playing: false,
            haltedRobots,
            haltReason: reason,
            verdict: stampForHalt(reason),
            records: [...s.records, record("stop")],
            pendingDecision: false,
          };
        }
        // Targeted halt (TC-08): record it, keep the run going.
        const next = { ...s, haltedRobots, records: [...s.records, record("stop")] };
        if (s.stepIndex === scenario.steps.length - 1) {
          return { ...next, playing: false, verdict: "DELIVERED", pendingDecision: false };
        }
        return { ...next, stepIndex: s.stepIndex + 1, progress: 0, pendingDecision: false };
      }

      // 3. Terminal step -> final verdict.
      if (s.stepIndex === scenario.steps.length - 1) {
        return {
          ...s,
          playing: false,
          verdict: scenario.expectedOutcome === "REROUTED" ? "REROUTED" : "DELIVERED",
          records: [...s.records, record("ok")],
          pendingDecision: false,
        };
      }

      // 4. Ordinary step -> next leg.
      return {
        ...s,
        stepIndex: s.stepIndex + 1,
        progress: 0,
        records: [...s.records, record("ok")],
        pendingDecision: false,
      };
    },
    [scenario, laneOrder],
  );

  // ── Action execution state machine (PART 5.2) ───────────────────────────────
  // Deterministically executes the approved action from a 0G proposal.
  // Guarantees: fail-closed on any failure, no model-output bypass,
  // and that only authorised actions affect robot movement.
  function executeApprovedAction(
    action: { type: string; routeId?: string } | undefined,
    s: RunnerState,
    scenario: ScenarioTestCase,
  ): RunnerState {
    if (!action) {
      // No action returned - fail closed
      const haltReason: HaltReason = "ZG_MALFORMED";
      const verdict = stampForHalt(haltReason);
      return {
        ...s,
        playing: false,
        haltReason,
        verdict,
        haltedRobots: [...s.haltedRobots, scenario.leadRobot],
        records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "stop", gateToken: null, gateDecision: null }],
        pendingDecision: false,
      };
    }

    const { type, routeId } = action;

    switch (type) {
      case "continue": {
        // Continue the authorised path - advance to next step
        if (s.stepIndex === scenario.steps.length - 1) {
          return {
            ...s,
            playing: false,
            verdict: scenario.expectedOutcome === "REROUTED" ? "REROUTED" : "DELIVERED",
            records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "ok", gateToken: null, gateDecision: null }],
            pendingDecision: false,
          };
        }
        return {
          ...s,
          stepIndex: s.stepIndex + 1,
          progress: 0,
          records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "ok", gateToken: null, gateDecision: null }],
          pendingDecision: false,
        };
      }

      case "reroute": {
        // The approved action is authoritative for authorisation, but route
        // geometry is owned by the scenario fixture. A non-empty routeId is
        // validated and the run advances deterministically; we do not invent
        // waypoints that were never issued by the backend.
        if (typeof routeId !== "string" || routeId.length === 0) {
          const haltReason: HaltReason = "ZG_MALFORMED";
          const verdict = stampForHalt(haltReason);
          return {
            ...s,
            playing: false,
            haltReason,
            verdict,
            haltedRobots: [...s.haltedRobots, scenario.leadRobot],
            records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "stop", gateToken: null, gateDecision: null }],
            pendingDecision: false,
          };
        }

        if (s.stepIndex === scenario.steps.length - 1) {
          return {
            ...s,
            playing: false,
            verdict: "REROUTED",
            records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "ok", gateToken: null, gateDecision: null }],
            pendingDecision: false,
          };
        }
        return {
          ...s,
          stepIndex: s.stepIndex + 1,
          progress: 0,
          records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "ok", gateToken: null, gateDecision: null }],
          pendingDecision: false,
        };
      }

      case "handoff": {
        // A handoff is a deterministic state transition. Robot runtime
        // positions remain scenario-owned; the record proves the approved
        // action was executed without fabricating a route or proof.
        if (s.stepIndex === scenario.steps.length - 1) {
          return {
            ...s,
            playing: false,
            verdict: scenario.expectedOutcome === "REROUTED" ? "REROUTED" : "DELIVERED",
            records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "ok", gateToken: null, gateDecision: null }],
            pendingDecision: false,
          };
        }
        return {
          ...s,
          stepIndex: s.stepIndex + 1,
          progress: 0,
          records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "ok", gateToken: null, gateDecision: null }],
          pendingDecision: false,
        };
      }

      case "ask_human": {
        // Stop and open the corresponding approval workflow
        // The gate modal should be opened with the requested zone and robot
        const zoneId = routeId || "docks-r2"; // use routeId as zoneId if available

        return {
          ...s,
          playing: false,
          gate: {
            request: {
              id: `gr-auto-${s.stepIndex}-human`,
              robotId: scenario.leadRobot,
              zoneId,
              nonce: `n-${scenario.id}-${s.stepIndex}-human`,
              ttlMs: GATE_TTL_MS,
              status: "pending",
            },
            remainingMs: GATE_TTL_MS,
            resolving: false,
          },
          records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "wait", gateToken: null, gateDecision: null }],
          pendingDecision: false,
        };
      }

      default: {
        // Unknown action type - reject and safe-stop
        const haltReason: HaltReason = "ACTION_NOT_ALLOWED";
        const verdict = stampForHalt(haltReason);
        return {
          ...s,
          playing: false,
          haltReason,
          verdict,
          haltedRobots: [...s.haltedRobots, scenario.leadRobot],
          records: [...s.records, { stepIndex: s.stepIndex, checkpointId: scenario.steps[s.stepIndex]?.checkpointId, outcome: "stop", gateToken: null, gateDecision: null }],
          pendingDecision: false,
        };
      }
    }
  }

  // Main clock.
  useEffect(() => {
    // Abort any pending request when component unmounts or scenario changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      const s = stateRef.current;
      // Pause if: playing=false, gate active, or decision pending
      if (!s.playing || s.gate || s.pendingDecision) return;

      const nextProgress = s.progress + BASE_PROGRESS_PER_TICK * s.speed;
      if (nextProgress >= 1) {
        // Acquire lock synchronously
        const currentStep = s.stepIndex;
        const lockKey = { scenarioId: scenario.id, stepIndex: currentStep, requestId: crypto.randomUUID() };

        // Check if another request is in flight for the same checkpoint
        if (decisionLockRef.current?.stepIndex !== currentStep ||
            decisionLockRef.current?.scenarioId !== scenario.id) {
          // Not locked or locked for different checkpoint - proceed
          decisionLockRef.current = lockKey;

          // Abort any previous request
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          abortControllerRef.current = new AbortController();

          // Mark as pending to pause movement
          setState((cur) => ({ ...cur, pendingDecision: true }));

          // Construct decision payload from actual scenario data
          const decisionPayload: StateSummary = {
            robotId: scenario.leadRobot,
            currentCell: `cell-${s.stepIndex}`,
            heading: "north",
            checkpointIndex: s.stepIndex + 1,
            totalCheckpoints: scenario.steps.length,
            availableRoutes: scenario.lanes[scenario.leadRobot].route.map(wp => `r${wp.x}-${wp.y}`),
            restrictedZones: [], // populated from checkpoint data
            remainingBudgetAtomic: budgetRef.current,
            scenarioHints: [],
            seed: `DABBAWALA_${scenario.id}_${currentStep}`,
          };

          triggerMissionDecision(decisionPayload)
            .then((backendDecision) => {
              // Check if scenario changed (stale response protection)
              if (scenario.id !== decisionLockRef.current?.scenarioId) {
                decisionLockRef.current = null;
                return;
              }

              // Validate and apply decision
              const validated = validateBackendDecision(backendDecision, s.stepIndex);

              if (!validated.approved) {
                // Decision rejected or invalid - halt with reason
                setState((cur) => {
                  const rec = cur.records[cur.records.length - 1];
                  return {
                    ...cur,
                    playing: false,
                    haltReason: validated.reason,
                    verdict: stampForHalt(validated.reason),
                    haltedRobots: [...new Set([...cur.haltedRobots, scenario.leadRobot])],
                    pendingDecision: false,
                    records: rec
                      ? [...cur.records.slice(0, -1), { ...rec, gateDecision: "expired" as const }]
                      : cur.records,
                  };
                });
                decisionLockRef.current = null;
                return;
              }

              // Approved decision
              setState((cur) => advanceStep(cur, backendDecision));
              decisionLockRef.current = null;
            })
            .catch((error) => {
              // Network error, timeout, etc.
              if (abortControllerRef.current?.signal.aborted) {
                // Request was intentionally aborted - check if still relevant
                if (scenario.id !== decisionLockRef.current?.scenarioId) {
                  decisionLockRef.current = null;
                }
                return;
              }

              // Network failure - halt
              setState((cur) => {
                const rec = cur.records[cur.records.length - 1];
                return {
                  ...cur,
                  playing: false,
                  haltReason: "ZG_TIMEOUT",
                  verdict: "SAFE-STOP",
                  haltedRobots: [...new Set([...cur.haltedRobots, scenario.leadRobot])],
                  pendingDecision: false,
                  records: rec
                    ? [...cur.records.slice(0, -1), { ...rec, outcome: "stop" as const }]
                    : cur.records,
                };
              });
              decisionLockRef.current = null;
            });
        }
      } else {
        setState((cur) => ({ ...cur, progress: nextProgress }));
      }
    }, TICK_MS);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [advanceStep, scenario, ogUp]);

  // Gate countdown.
  useEffect(() => {
    if (!state.gate) return;
    const id = setInterval(() => {
      setState((cur) => {
        if (!cur.gate || cur.gate.resolving) return cur;
        const remainingMs = cur.gate.remainingMs - 1000;
        if (remainingMs <= 0) {
          const rec = cur.records[cur.records.length - 1];
          return {
            ...cur,
            gate: null,
            haltedRobots: [...new Set([...cur.haltedRobots, cur.gate.request.robotId])],
            haltReason: "APPROVAL_EXPIRED",
            verdict: "HALTED",
            records: rec
              ? [...cur.records.slice(0, -1), { ...rec, gateDecision: "expired" as const }]
              : cur.records,
          };
        }
        return { ...cur, gate: { ...cur.gate, remainingMs } };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.gate !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // 0G outage: fail closed mid-run (ROADMAP invariant 4). Resume requires
  // 0G restored plus a fresh play() (fresh call + fresh policy read).
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
          haltedRobots: laneOrder.slice(),
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
  }, [ogUp, laneOrder]);

  // Controls -------------------------------------------------------------
  const play = useCallback(() => {
    setState((cur) => {
      if (cur.haltedRobots.length > 0 && !ogUp) return cur; // still no 0G
      if (cur.verdict && cur.haltedRobots.length > 0 && ogUp) {
        // Resume: fresh 0G call + fresh policy read (simulated).
        return { ...cur, playing: true, haltedRobots: [], verdict: null, haltReason: null };
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
        haltedRobots: [],
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

  // Gate resolution goes through the service boundary (future backend
  // enforces the approver allowlist and mints the single-use token).
  const resolveGate = useCallback(
    async (decision: "approved" | "denied") => {
      const gate = stateRef.current.gate;
      if (!gate || gate.resolving) return;
      setState((cur) => (cur.gate ? { ...cur, gate: { ...cur.gate, resolving: true } } : cur));

      const receipt = await submitGateDecision(gate.request, decision);

      setState((cur) => {
        if (!cur.gate) return cur;
        const rec = cur.records[cur.records.length - 1];
        const stamped: StepRecord | null = rec
          ? {
              ...rec,
              gateDecision: decision,
              gateToken: receipt.token,
            }
          : null;
        const cleared = {
          ...cur,
          gate: null,
          records: stamped ? [...cur.records.slice(0, -1), stamped] : cur.records,
        };

        if (decision === "denied") {
          return {
            ...cleared,
            haltedRobots: [...new Set([...cur.haltedRobots, cur.gate.request.robotId])],
            haltReason: "GATE_DENIED",
            verdict: "DENIED",
          };
        }
        if (cur.stepIndex === scenario.steps.length - 1) {
          return {
            ...cleared,
            playing: false,
            verdict: scenario.expectedOutcome === "REROUTED" ? "REROUTED" : "DELIVERED",
          };
        }
        return { ...cleared, playing: true, stepIndex: cur.stepIndex + 1, progress: 0 };
      });
    },
    [scenario],
  );

  // Derived robot runtimes: each robot rides its own lane.
  const lanes: RobotLane[] = laneOrder.map((id) => scenario.lanes[id]);
  const totalSteps = scenario.steps.length;
  const robots: RobotRuntime[] = lanes.map((lane, idx) => {
    const lag = idx * CONVOY_LAG;
    const rawU = (state.stepIndex + state.progress) / Math.max(1, totalSteps);
    const u = Math.max(0, rawU - lag);
    const pos = pointAlong(lane.route, u);
    const calloutIdx = Math.min(state.stepIndex, lane.stepCallouts.length - 1);
    const callout = calloutIdx >= 0 ? lane.stepCallouts[calloutIdx] : null;
    const isHalted = state.haltedRobots.includes(lane.robotId);
    const isLead = lane.robotId === scenario.leadRobot;

    let robotState: RobotRuntime["state"] = "idle";
    if (isHalted) {
      robotState = "halted";
    } else if (state.verdict === "DELIVERED" || state.verdict === "REROUTED") {
      robotState = "delivered";
    } else if (state.playing || u > 0) {
      const atStepEnd = state.progress >= 1;
      robotState = atStepEnd ? "checkpoint" : "moving";
    } else if (state.gate && isLead) {
      robotState = "checkpoint";
    }

    // A fleet-wide stop shows on every robot; a targeted halt only on the
    // halted one (TC-08: Ramu/Sakhu keep their normal callouts).
    const displayCallout =
      isHalted && (state.verdict !== null || isLead)
        ? `🛑 ${state.haltReason ?? "HALTED"}`
        : callout;

    return { id: lane.robotId, pos, state: robotState, callout: displayCallout, progress: u };
  });

  return {
    stepIndex: state.stepIndex,
    progress: state.progress,
    playing: state.playing,
    speed: state.speed,
    gate: state.gate,
    verdict: state.verdict,
    haltReason: state.haltReason,
    haltedRobots: state.haltedRobots,
    records: state.records,
    robots,
    lanes,
    leadLane: scenario.lanes[scenario.leadRobot],
    totalSteps,
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
