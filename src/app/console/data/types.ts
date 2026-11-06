// Console data model. v2 adds per-robot route lanes so every test case
// involves all three robots (Ramu, Sakhu, Janu) with their own paths and
// callouts, and a RobotPassport shape that mirrors the future backend
// response (docs/CONSOLE_ENDPOINTS.md).

export type RobotId = "ramu" | "sakhu" | "janu";

export type RobotState = "idle" | "moving" | "checkpoint" | "halted" | "delivered";

export type HaltReason =
  | "ZG_TIMEOUT"
  | "ZG_TRANSPORT"
  | "ZG_MALFORMED"
  | "ACTION_NOT_ALLOWED"
  | "ENS_UNREADABLE"
  | "POLICY_PAUSED"
  | "BUDGET_EXHAUSTED"
  | "PAYEE_NOT_ALLOWED"
  | "OVER_CAP"
  | "FACILITATOR_DOWN"
  | "GATE_DENIED"
  | "APPROVAL_EXPIRED"
  | "APPROVAL_REPLAYED"
  | "ZONE_REMOVED";

export type Action =
  | { type: "continue" }
  | { type: "reroute"; routeId: string }
  | { type: "handoff" }
  | { type: "ask_human"; zoneId: string }
  | { type: "halt"; reason: HaltReason };

export interface Checkpoint {
  id: string;
  name: string;
  type: "ens_policy" | "hedera_payment" | "human_gate" | "relay" | "delivery";
  coordinates: { x: number; y: number };
  status: "pending" | "passed" | "halted";
}

export interface RouteWaypoint {
  id: string;
  x: number;
  y: number;
  label?: string;
}

/** One robot's path through the scenario. Every scenario carries a lane for
 * all three robots; `stepCallouts` is aligned with `ScenarioTestCase.steps`
 * so each robot narrates its own activity at every checkpoint. */
export interface RobotLane {
  robotId: RobotId;
  role: string;
  route: RouteWaypoint[];
  stepCallouts: string[];
}

export interface ProofReceipt {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;
  title: string;
  details: Record<string, string | number | boolean | null>;
  status: "verified" | "pending" | "failed";
  hash?: string;
}

export interface GateRequest {
  id: string;
  robotId: RobotId;
  zoneId: string;
  nonce: string;
  ttlMs: number;
  status: "pending" | "approved" | "denied" | "expired";
}

export interface ScenarioStep {
  checkpointId: string;
  action: Action;
  expectedProofs: ProofReceipt[];
  gateRequest?: GateRequest;
  /** When action is a halt, which robot the Policy Gate stops. Omitted = the
   * lead robot (and a scenario-wide halt when no other robot can continue). */
  haltTarget?: RobotId;
}

export interface ScenarioTestCase {
  id: string;
  title: string;
  description: string;
  track: "0G" | "Hedera" | "ENS" | "Integration";
  leadRobot: RobotId;
  lanes: Record<RobotId, RobotLane>;
  checkpoints: Checkpoint[];
  steps: ScenarioStep[];
  expectedOutcome: "DELIVERED" | "REROUTED" | "HALTED" | "REFUSED";
}

/** Block-stamped ENS passport for the inspector. Shape matches the future
 * GET /api/robots/:id/passport backend response. */
export interface RobotPassport {
  robotId: RobotId;
  ensName: string;
  owner: string;
  resolver: string;
  zones: string[];
  budgetMicroHbar: number;
  status: "active" | "paused";
  lastEpisode: string;
  block: { number: number; hash: string; scannedAtMs: number };
  source: "sim" | "live";
}

export type StateSummary = {
  readonly robotId: RobotId;
  readonly currentCell: string;
  readonly heading: string;
  readonly checkpointIndex: number;
  readonly totalCheckpoints: number;
  readonly availableRoutes: readonly string[];
  readonly restrictedZones: readonly string[];
  readonly remainingBudgetAtomic: string;
  readonly scenarioHints: readonly string[];
  readonly seed: string;
};