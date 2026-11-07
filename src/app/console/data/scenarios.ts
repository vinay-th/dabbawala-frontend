// 10 core dispatch scenarios. v2: every scenario carries a lane for ALL
// THREE robots (Ramu, Sakhu, Janu) so the fleet is always on the board;
// each lane narrates its own per-step callouts. Geometry matches the
// cartographic board in MumbaiMap.tsx (1440x900 survey grid).

import type {
  Checkpoint,
  HaltReason,
  ProofReceipt,
  RobotId,
  RobotLane,
  RouteWaypoint,
  ScenarioTestCase,
} from "./types";

// --- Board geometry (shared with MumbaiMap.tsx) ---
const RAMU_ROUTE: RouteWaypoint[] = [
  { id: "k1", x: 650, y: 120, label: "K1" },
  { id: "adh", x: 540, y: 140 },
  { id: "cp1", x: 540, y: 270 },
  { id: "bvi", x: 510, y: 430 },
  { id: "cp2", x: 510, y: 590 },
  { id: "ccg", x: 510, y: 750 },
  { id: "col", x: 630, y: 840 },
];

const SAKHU_ROUTE: RouteWaypoint[] = [
  { id: "k2", x: 900, y: 140, label: "K2" },
  { id: "sak-a", x: 800, y: 210 },
  { id: "sak-b", x: 800, y: 420 },
  { id: "sak-c", x: 740, y: 480 },
  { id: "sak-d", x: 530, y: 600 },
  { id: "sak-e", x: 530, y: 760 },
  { id: "sak-f", x: 720, y: 840 },
];

const JANU_ROUTE: RouteWaypoint[] = [
  { id: "dock", x: 1120, y: 180, label: "Dock Yard" },
  { id: "jan-a", x: 1120, y: 320 },
  { id: "cp3", x: 880, y: 360 },
  { id: "jan-b", x: 1040, y: 410 },
  { id: "jan-c", x: 920, y: 580 },
  { id: "jan-d", x: 960, y: 780 },
];

const DEFAULT_ROUTE: Record<RobotId, RouteWaypoint[]> = {
  ramu: RAMU_ROUTE,
  sakhu: SAKHU_ROUTE,
  janu: JANU_ROUTE,
};

const ROBOT_ROLE: Record<RobotId, string> = {
  ramu: "Primary Western Line courier",
  sakhu: "Monsoon canal detour scout",
  janu: "Restricted Zone R-2 cargo specialist",
};

function lane(robotId: RobotId, stepCallouts: string[], route?: RouteWaypoint[]): RobotLane {
  return {
    robotId,
    role: ROBOT_ROLE[robotId],
    route: route ?? DEFAULT_ROUTE[robotId],
    stepCallouts,
  };
}

// --- Shared checkpoints ---
const CP_ENS: Checkpoint = {
  id: "cp-ens",
  name: "CP1 · Mahim ENS Gate",
  type: "ens_policy",
  coordinates: { x: 540, y: 270 },
  status: "pending",
};
const CP_PAY: Checkpoint = {
  id: "cp-pay",
  name: "CP2 · Dadar x402 Relay",
  type: "hedera_payment",
  coordinates: { x: 510, y: 590 },
  status: "pending",
};
const CP_GATE: Checkpoint = {
  id: "cp-gate",
  name: "CP3 · R-2 Sentry Gate",
  type: "human_gate",
  coordinates: { x: 880, y: 360 },
  status: "pending",
};
const CP_RELAY_Ramu: Checkpoint = {
  id: "cp-relay-ramu",
  name: "Dadar Relay Handoff (Ramu)",
  type: "relay",
  coordinates: { x: 510, y: 590 },
  status: "pending",
};
const CP_RELAY_Sakhu: Checkpoint = {
  id: "cp-relay-sakhu",
  name: "Dadar Relay Handoff (Sakhu)",
  type: "relay",
  coordinates: { x: 510, y: 590 },
  status: "pending",
};
const CP_RELAY: Checkpoint = {
  id: "cp-relay",
  name: "Dadar Relay Handoff",
  type: "relay",
  coordinates: { x: 510, y: 590 },
  status: "pending",
};
const CP_DELIVER: Checkpoint = {
  id: "cp-deliver",
  name: "Colaba Gate 4 Drop",
  type: "delivery",
  coordinates: { x: 630, y: 840 },
  status: "pending",
};

// --- Proof factory (tier 1-5 receipt per scenario, SIMULATED data) ---
const createProofs = (scenarioId: string, status: "verified" | "pending" | "failed" = "verified"): ProofReceipt[] => [
  { id: `${scenarioId}-p1`, tier: 1, title: "ENS Policy Read", details: { block: "0x1A2B3C", status: "active", budget: "5000000" }, status, hash: "0xens…" },
  { id: `${scenarioId}-p2`, tier: 2, title: "Hedera x402 Payment", details: { txId: "0.0.6001#492", amountHbar: 0.002, feeHbar: 0.0001 }, status, hash: "0x402…" },
  { id: `${scenarioId}-p3`, tier: 3, title: "0G Compute Decision", details: { requestId: "zg-req-99", modelHash: "sha256:…", action: "continue" }, status, hash: "0gzg…" },
  { id: `${scenarioId}-p4`, tier: 4, title: "Human Gate Permit", details: { zoneId: "R-2", nonce: "0xabc", ttlMs: 60000, status: "minted" }, status: status === "verified" ? "pending" : "failed" },
  { id: `${scenarioId}-p5`, tier: 5, title: "0G Storage Ledger", details: { merkleRoot: "0xroot…", anchorContract: "RelayLedger" }, status, hash: "0xstore…" },
];

// --- 10 core scenarios (all 3 robots on the board) ---
export const SCENARIOS: ScenarioTestCase[] = [
  {
    id: "TC-01",
    title: "Clean Delivery (Happy Path)",
    description: "Ramu reads ENS, pays 0.002 HBAR over x402, follows the 0G route to Colaba Gate 4. Sakhu and Janu run their lanes in parallel.",
    track: "Integration",
    leadRobot: "ramu",
    lanes: {
      ramu: lane("ramu", ["🛂 ENS policy read", "⚡ Paying 0.002 HBAR", "🏁 Delivering · Colaba Gate 4"]),
      sakhu: lane("sakhu", ["📦 Parallel manifest", "🌧 Canal scout clear", "🤝 Relay standby"]),
      janu: lane("janu", ["🛰 R-2 perimeter scan", "🛑 Zone R-2 Halt Flag", "⏳ Holding at sentry"]),
    },
    checkpoints: [CP_ENS, CP_PAY, CP_DELIVER],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-01") },
      { checkpointId: "cp-pay", action: { type: "continue" }, expectedProofs: createProofs("TC-01") },
      { checkpointId: "cp-deliver", action: { type: "continue" }, expectedProofs: createProofs("TC-01") },
    ],
    expectedOutcome: "DELIVERED",
  },
  {
    id: "TC-02",
    title: "Monsoon Flooded Lane Reroute",
    description: "SV Canal waterlogged. 0G detects the hazard at Dadar and Sakhu takes the Mahim detour while Ramu holds the main line.",
    track: "0G",
    leadRobot: "sakhu",
    lanes: {
      ramu: lane("ramu", ["🛂 ENS policy read", "⏸ Holding at Dadar", "📦 Manifest locked"]),
      sakhu: lane("sakhu", ["🌧 Canal flooded", "📍 0G detour · Mahim", "🏁 Reroute complete"]),
      janu: lane("janu", ["🛰 R-2 perimeter scan", "🛑 Zone R-2 Halt Flag", "⏳ Holding at sentry"]),
    },
    checkpoints: [CP_ENS, CP_PAY, CP_DELIVER],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-02") },
      { checkpointId: "cp-pay", action: { type: "reroute", routeId: "mahim-detour" }, expectedProofs: createProofs("TC-02") },
      { checkpointId: "cp-deliver", action: { type: "continue" }, expectedProofs: createProofs("TC-02") },
    ],
    expectedOutcome: "REROUTED",
  },
  {
    id: "TC-03",
    title: "Three Robots Concurrent Relay",
    description: "Ramu hands the dabba box to Sakhu at Dadar; Sakhu transfers to Janu; all three synchronize manifests.",
    track: "Integration",
    leadRobot: "ramu",
    lanes: {
      ramu: lane("ramu", ["📦 Approaching handoff", "⇄ Handoff → Sakhu", "✅ Manifest signed"]),
      sakhu: lane("sakhu", ["⏳ Awaiting box", "⇄ Handoff → Janu", "✅ Manifest signed"]),
      janu: lane("janu", ["⏳ Awaiting transfer", "📦 Receiving box", "✅ Manifest signed"]),
    },
    checkpoints: [CP_RELAY_Ramu, CP_RELAY_Sakhu, CP_DELIVER],
    steps: [
      { checkpointId: "cp-relay-ramu", action: { type: "handoff" }, expectedProofs: createProofs("TC-03-ramu") },
      { checkpointId: "cp-relay-sakhu", action: { type: "handoff" }, expectedProofs: createProofs("TC-03-sakhu") },
      { checkpointId: "cp-deliver", action: { type: "continue" }, expectedProofs: createProofs("TC-03-janu") },
    ],
    expectedOutcome: "DELIVERED",
  },
  {
    id: "TC-04",
    title: "Over Per-Request Cap",
    description: "Intel server demands 0.050 HBAR (cap 0.005). Spend Controller refuses to sign. Ramu halts safely; fleet holds.",
    track: "Hedera",
    leadRobot: "ramu",
    lanes: {
      ramu: lane("ramu", ["🛂 ENS policy read", "🛑 Refused · OVER_CAP"]),
      sakhu: lane("sakhu", ["📦 Parallel manifest", "⏸ Fleet hold"]),
      janu: lane("janu", ["🛰 R-2 perimeter scan", "⏸ Fleet hold"]),
    },
    checkpoints: [CP_ENS, CP_PAY],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-04", "verified") },
      { checkpointId: "cp-pay", action: { type: "halt", reason: "OVER_CAP" as HaltReason }, expectedProofs: createProofs("TC-04", "failed") },
    ],
    expectedOutcome: "HALTED",
  },
  {
    id: "TC-05",
    title: "Budget Exhausted",
    description: "Sakhu's ENS budget is depleted mid-transit. x402 payment refused, operator-ask event fired, robot safe-stops.",
    track: "Hedera",
    leadRobot: "sakhu",
    lanes: {
      ramu: lane("ramu", ["🛂 ENS policy read", "⏸ Holding at Dadar"]),
      sakhu: lane("sakhu", ["🌧 Canal approach", "🛑 BUDGET_EXHAUSTED · asking operator"]),
      janu: lane("janu", ["🛰 R-2 perimeter scan", "⏸ Fleet hold"]),
    },
    checkpoints: [CP_ENS, CP_PAY],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-05", "verified") },
      { checkpointId: "cp-pay", action: { type: "ask_human", zoneId: "budget-ops" }, expectedProofs: createProofs("TC-05", "failed") },
    ],
    expectedOutcome: "HALTED",
  },
  {
    id: "TC-08",
    title: "Safety Officer Halts One Robot",
    description: "Safety officer sets `status=paused` on Janu's ENS record. Janu halts with POLICY_PAUSED; Ramu and Sakhu continue unaffected.",
    track: "ENS",
    leadRobot: "ramu",
    lanes: {
      ramu: lane("ramu", ["🛂 ENS policy read", "⚡ Paying 0.002 HBAR", "✅ Delivery unaffected"]),
      sakhu: lane("sakhu", ["📦 Parallel manifest", "🌧 Canal scout clear", "✅ Lane unaffected"]),
      janu: lane("janu", ["🛰 R-2 perimeter scan", "🛑 POLICY_PAUSED via ENS"]),
    },
    checkpoints: [CP_ENS, CP_PAY, CP_DELIVER],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-08-pre") },
      { checkpointId: "cp-pay", action: { type: "halt", reason: "POLICY_PAUSED" as HaltReason }, haltTarget: "janu", expectedProofs: createProofs("TC-08-janu", "failed") },
      { checkpointId: "cp-deliver", action: { type: "continue" }, expectedProofs: createProofs("TC-08-post") },
    ],
    expectedOutcome: "DELIVERED",
  },
  {
    id: "TC-12",
    title: "Human Gate Approved (Zone R-2)",
    description: "Janu requests entry to Zone R-2. Stationmaster APPROVES; a 60s single-use token is minted and the sentry opens.",
    track: "ENS",
    leadRobot: "janu",
    lanes: {
      ramu: lane("ramu", ["📦 Western line clear", "⚡ Paying 0.002 HBAR"]),
      sakhu: lane("sakhu", ["🌧 Canal scout clear", "🤝 Relay standby"]),
      janu: lane("janu", ["🛰 Requesting R-2 entry", "✅ Token minted · sentry open", "🏁 Delivery inside R-2"]),
    },
    checkpoints: [CP_GATE, CP_DELIVER],
    steps: [
      {
        checkpointId: "cp-gate",
        action: { type: "continue" },
        gateRequest: { id: "gr-01", robotId: "janu", zoneId: "R-2", nonce: "n-99", ttlMs: 60000, status: "approved" },
        expectedProofs: createProofs("TC-12"),
      },
      { checkpointId: "cp-deliver", action: { type: "continue" }, expectedProofs: createProofs("TC-12") },
    ],
    expectedOutcome: "DELIVERED",
  },
  {
    id: "TC-13",
    title: "Human Gate Denied",
    description: "Janu requests entry to Zone R-2. Stationmaster DENIES; no token is issued and Janu executes a safe turnaround.",
    track: "ENS",
    leadRobot: "janu",
    lanes: {
      ramu: lane("ramu", ["📦 Western line clear", "⚡ Paying 0.002 HBAR"]),
      sakhu: lane("sakhu", ["🌧 Canal scout clear", "🤝 Relay standby"]),
      janu: lane("janu", ["🛰 Requesting R-2 entry", "🛑 Denied · safe turnaround"]),
    },
    checkpoints: [CP_GATE],
    steps: [
      {
        checkpointId: "cp-gate",
        action: { type: "halt", reason: "GATE_DENIED" as HaltReason },
        gateRequest: { id: "gr-02", robotId: "janu", zoneId: "R-2", nonce: "n-99", ttlMs: 60000, status: "denied" },
        expectedProofs: createProofs("TC-13", "failed"),
      },
    ],
    expectedOutcome: "REFUSED",
  },
  {
    id: "TC-16",
    title: "0G Outage Safe-Stop (No Guessing)",
    description: "0G Router goes down mid-run. All robots fail closed and halt on safe cells. No substitute decision is made.",
    track: "0G",
    leadRobot: "ramu",
    lanes: {
      ramu: lane("ramu", ["🛂 ENS policy read", "🛑 parking"]),
      sakhu: lane("sakhu", ["🌧 Canal scout clear", "🛑 parking"]),
      janu: lane("janu", ["🛰 R-2 perimeter scan", "🛑 parking"]),
    },
    checkpoints: [CP_ENS, CP_PAY],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-16", "verified") },
      { checkpointId: "cp-pay", action: { type: "halt", reason: "ACTION_NOT_ALLOWED" as HaltReason }, expectedProofs: createProofs("TC-16", "failed") },
    ],
    expectedOutcome: "HALTED",
  },
  {
    id: "TC-20",
    title: "Cryptographic Replay & Verification",
    description: "Full-fleet replay: the episode JSONL is re-hashed and compared against the RelayLedger root on 0G Galileo. Match confirmed.",
    track: "Integration",
    leadRobot: "ramu",
    lanes: {
      ramu: lane("ramu", ["🎞 Replay: Mahim gate", "🎞 Replay: Dadar relay", "🎞 Replay: Colaba drop"]),
      sakhu: lane("sakhu", ["🎞 Replay: canal lane", "🎞 Replay: detour", "🎞 Replay: relay standby"]),
      janu: lane("janu", ["🎞 Replay: R-2 scan", "🎞 Replay: sentry hold", "🎞 Replay: perimeter"]),
    },
    checkpoints: [CP_ENS, CP_RELAY, CP_DELIVER],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-20") },
      { checkpointId: "cp-relay", action: { type: "continue" }, expectedProofs: createProofs("TC-20") },
      { checkpointId: "cp-deliver", action: { type: "continue" }, expectedProofs: createProofs("TC-20") },
    ],
    expectedOutcome: "DELIVERED",
  },
];

export function getScenarioById(id: string): ScenarioTestCase | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function getRandomScenario(): ScenarioTestCase {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}
