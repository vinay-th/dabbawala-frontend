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
}

export interface ScenarioTestCase {
  id: string;
  title: string;
  description: string;
  track: "0G" | "Hedera" | "ENS" | "Integration";
  activeRobots: RobotId[];
  waypoints: RouteWaypoint[];
  checkpoints: Checkpoint[];
  steps: ScenarioStep[];
  expectedOutcome: "DELIVERED" | "REROUTED" | "HALTED" | "REFUSED";
}
