import type { ScenarioTestCase, RouteWaypoint, Checkpoint, ProofReceipt, HaltReason } from "./types";

// --- Shared Map Waypoints (1440x900 Canvas Space) ---
const WP_ADH: RouteWaypoint = { id: "wp-adh", x: 300, y: 180, label: "ADH Andheri Terminus" };
const WP_MAHIM: RouteWaypoint = { id: "wp-cp1", x: 400, y: 300, label: "CP1 Mahim Interchange" };
const WP_DDR: RouteWaypoint = { id: "wp-ddr", x: 480, y: 420, label: "DDR Dadar Jct" };
const WP_R2: RouteWaypoint = { id: "wp-r2", x: 580, y: 650, label: "R-2 Sentry Gate" };
const WP_CCG: RouteWaypoint = { id: "wp-ccg", x: 550, y: 750, label: "CCG Churchgate" };
const WP_COL: RouteWaypoint = { id: "wp-col", x: 600, y: 820, label: "COL Mittal Towers" };

// --- Shared Checkpoints ---
const CP_ENS: Checkpoint = { id: "cp-ens", name: "ENS Policy Validation", type: "ens_policy", coordinates: { x: 400, y: 300 }, status: "pending" };
const CP_X402: Checkpoint = { id: "cp-x402", name: "Hedera x402 Payment", type: "hedera_payment", coordinates: { x: 480, y: 420 }, status: "pending" };
const CP_GATE: Checkpoint = { id: "cp-gate", name: "Human Gate (R-2)", type: "human_gate", coordinates: { x: 580, y: 650 }, status: "pending" };
const CP_RELAY: Checkpoint = { id: "cp-relay", name: "Relay Handoff", type: "relay", coordinates: { x: 480, y: 420 }, status: "pending" };
const CP_DELIVERY: Checkpoint = { id: "cp-delivery", name: "Final Delivery", type: "delivery", coordinates: { x: 600, y: 820 }, status: "pending" };

// --- Proof Factory ---
const createProofs = (scenarioId: string, status: "verified" | "pending" | "failed" = "verified"): ProofReceipt[] => [
  { id: `${scenarioId}-p1`, tier: 1, title: "ENS Policy Read", details: { block: "0x1A2B3C", status: "active", budget: "5000000" }, status, hash: "0xens..." },
  { id: `${scenarioId}-p2`, tier: 2, title: "Hedera x402 Payment", details: { txId: "0.0.6001#492", amountHbar: 0.002, feeHbar: 0.0001 }, status, hash: "0x402..." },
  { id: `${scenarioId}-p3`, tier: 3, title: "0G Compute Decision", details: { requestId: "zg-req-99", modelHash: "sha256:...", action: "continue" }, status, hash: "0gzg..." },
  { id: `${scenarioId}-p4`, tier: 4, title: "Human Gate Permit", details: { zoneId: "R-2", nonce: "0xabc", ttlMs: 60000, status: "minted" }, status: status === "verified" ? "pending" : "failed" },
  { id: `${scenarioId}-p5`, tier: 5, title: "0G Storage Ledger", details: { merkleRoot: "0xroot...", anchorContract: "RelayLedger" }, status, hash: "0xstore..." },
];

// --- 10 Core Scenarios ---
export const SCENARIOS: ScenarioTestCase[] = [
  {
    id: "TC-01",
    title: "Clean Delivery (Happy Path)",
    description: "Ramu reads ENS, buys route intel over Hedera x402, follows 0G Compute route, and delivers to Mittal Towers.",
    track: "Integration",
    activeRobots: ["ramu"],
    waypoints: [WP_ADH, WP_MAHIM, WP_DDR, WP_CCG, WP_COL],
    checkpoints: [CP_ENS, CP_X402, CP_DELIVERY],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-01") },
      { checkpointId: "cp-x402", action: { type: "continue" }, expectedProofs: createProofs("TC-01") },
      { checkpointId: "cp-delivery", action: { type: "continue" }, expectedProofs: createProofs("TC-01") },
    ],
    expectedOutcome: "DELIVERED",
  },
  {
    id: "TC-02",
    title: "Monsoon Flooded Lane Reroute",
    description: "SV Canal waterlogged. 0G Router detects hazard at Dadar, chooses Mahim detour. Sakhu completes delivery.",
    track: "0G",
    activeRobots: ["sakhu"],
    waypoints: [WP_ADH, WP_MAHIM, WP_CCG, WP_COL],
    checkpoints: [CP_ENS, CP_X402, CP_DELIVERY],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-02") },
      { checkpointId: "cp-x402", action: { type: "reroute", routeId: "mahim-detour" }, expectedProofs: createProofs("TC-02") },
      { checkpointId: "cp-delivery", action: { type: "continue" }, expectedProofs: createProofs("TC-02") },
    ],
    expectedOutcome: "REROUTED",
  },
  {
    id: "TC-03",
    title: "Three Robots Concurrent Relay",
    description: "Ramu hands off dabba box to Sakhu at Dadar. Sakhu transfers to Janu. All synchronize manifests.",
    track: "Integration",
    activeRobots: ["ramu", "sakhu", "janu"],
    waypoints: [WP_ADH, WP_DDR, WP_CCG, WP_COL],
    checkpoints: [CP_RELAY, CP_RELAY, CP_DELIVERY],
    steps: [
      { checkpointId: "cp-relay", action: { type: "handoff" }, expectedProofs: createProofs("TC-03-ramu") },
      { checkpointId: "cp-relay", action: { type: "handoff" }, expectedProofs: createProofs("TC-03-sakhu") },
      { checkpointId: "cp-delivery", action: { type: "continue" }, expectedProofs: createProofs("TC-03-janu") },
    ],
    expectedOutcome: "DELIVERED",
  },
  {
    id: "TC-04",
    title: "Over Per-Request Cap",
    description: "Intel server demands 0.050 HBAR (above Spend Controller deploy cap of 0.005). Spend Controller refuses. Robot halts safely.",
    track: "Hedera",
    activeRobots: ["ramu"],
    waypoints: [WP_ADH, WP_MAHIM],
    checkpoints: [CP_ENS, CP_X402],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-04", "verified") },
      { checkpointId: "cp-x402", action: { type: "halt", reason: "OVER_CAP" as HaltReason }, expectedProofs: createProofs("TC-04", "failed") },
    ],
    expectedOutcome: "HALTED",
  },
  {
    id: "TC-05",
    title: "Budget Exhausted",
    description: "Robot's ENS budget depleted mid-transit. x402 payment refused. Operator-ask event fired. Robot safe-stops.",
    track: "Hedera",
    activeRobots: ["sakhu"],
    waypoints: [WP_ADH, WP_MAHIM],
    checkpoints: [CP_ENS, CP_X402],
    steps: [
      { checkpointId: "cp-ens", action: { type: "continue" }, expectedProofs: createProofs("TC-05", "verified") },
      { checkpointId: "cp-x402", action: { type: "ask_human", zoneId: "budget-ops" }, expectedProofs: createProofs("TC-05", "failed") },
    ],
    expectedOutcome: "HALTED",
  },
  {
    id: "TC-08",
    title: "Safety Officer Halts One Robot",
    description: "Safety officer edits ENS `status=paused` for Janu. Janu halts with POLICY_PAUSED. Ramu and Sakhu continue.",
    track: "ENS",
    activeRobots: ["ramu", "sakhu", "janu"],
    waypoints: [WP_ADH, WP_MAHIM, WP_DDR],
    checkpoints: [CP_ENS, CP_X402, CP_RELAY],
    steps: [
      { checkpointId: "cp-ens", action: { type: "halt", reason: "POLICY_PAUSED" as HaltReason }, expectedProofs: createProofs("TC-08-janu", "failed") },
      { checkpointId: "cp-x402", action: { type: "continue" }, expectedProofs: createProofs("TC-08-ramu") },
      { checkpointId: "cp-relay", action: { type: "continue" }, expectedProofs: createProofs("TC-08-sakhu") },
    ],
    expectedOutcome: "HALTED",
  },
  {
    id: "TC-12",
    title: "Human Gate Approved (Restricted Zone R-2)",
    description: "Janu requests entry to R-2. Gatekeeper modal appears. Stationmaster APPROVES. 60s single-use token minted. Sentry opens.",
    track: "ENS",
    activeRobots: ["janu"],
    waypoints: [WP_DDR, WP_R2, WP_CCG],
    checkpoints: [CP_GATE, CP_DELIVERY],
    steps: [
      { 
        checkpointId: "cp-gate", 
        action: { type: "continue" }, 
        gateRequest: { id: "gr-01", robotId: "janu", zoneId: "R-2", nonce: "n-99", ttlMs: 60000, status: "approved" },
        expectedProofs: createProofs("TC-12")
      },
      { checkpointId: "cp-delivery", action: { type: "continue" }, expectedProofs: createProofs("TC-12") },
    ],
    expectedOutcome: "DELIVERED",
  },
  {
    id: "TC-13",
    title: "Human Gate Denied",
    description: "Janu requests entry to R-2. Stationmaster DENIES. No token issued. Janu executes safe turnaround.",
    track: "ENS",
    activeRobots: ["janu"],
    waypoints: [WP_DDR, WP_R2],
    checkpoints: [CP_GATE],
    steps: [
      { 
        checkpointId: "cp-gate", 
        action: { type: "halt", reason: "GATE_DENIED" as HaltReason }, 
        gateRequest: { id: "gr-02", robotId: "janu", zoneId: "R-2", nonce: "n-99", ttlMs: 60000, status: "denied" },
        expectedProofs: createProofs("TC-13", "failed")
      },
    ],
    expectedOutcome: "REFUSED",
  },
  {
    id: "TC-16",
    title: "0G Outage Safe-Stop (No Guessing)",
    description: "0G endpoint down (or toggle off). Robot fails closed with ZG_TIMEOUT. Halts on nearest safe cell.",
    track: "0G",
    activeRobots: ["ramu"],
    waypoints: [WP_ADH, WP_MAHIM],
    checkpoints: [CP_ENS],
    steps: [
      { checkpointId: "cp-ens", action: { type: "halt", reason: "ZG_TIMEOUT" as HaltReason }, expectedProofs: createProofs("TC-16", "failed") },
    ],
    expectedOutcome: "HALTED",
  },
  {
    id: "TC-20",
    title: "Cryptographic Replay & Verification",
    description: "Downloads episode JSONL log. Hashes execution steps. Compares against 0G Galileo RelayLedger root. Match confirmed.",
    track: "Integration",
    activeRobots: ["ramu", "sakhu", "janu"],
    waypoints: [WP_ADH, WP_DDR, WP_COL],
    checkpoints: [CP_DELIVERY],
    steps: [
      { checkpointId: "cp-delivery", action: { type: "continue" }, expectedProofs: createProofs("TC-20", "verified") },
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
