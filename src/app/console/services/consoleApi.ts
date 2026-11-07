// Console service layer — the frontend's endpoint boundary.
//
// Connected to Dabbawala Protocol Fastify API backend with graceful
// fallback to local deterministic simulation data for offline reliability.
// Endpoint contract: docs/CONSOLE_ENDPOINTS.md.
// ref: user prompt §8, §9

import { SCENARIOS, getScenarioById } from "../data/scenarios";
import type { GateRequest, RobotId, RobotPassport, ScenarioTestCase } from "../data/types";

/**
 * Resolve the API base URL.
 *
 * Production MUST NOT silently target localhost: a deployed browser cannot
 * reach the operator's machine, and doing so turns every live call into a
 * timeout that looks like a 0G outage. If NEXT_PUBLIC_API_URL is absent in a
 * production build we use the known deployed backend origin; that host is
 * still allowed to fail closed if it is unavailable.
 */
const CONFIGURED_API_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.trim()
    : "";

const PRODUCTION_API_ORIGIN = "https://dabbawala-backend-service.onrender.com";
const DEV_API_ORIGIN = "http://localhost:3001";

const RAW_ORIGIN =
  CONFIGURED_API_URL !== ""
    ? CONFIGURED_API_URL
    : process.env.NODE_ENV === "production"
      ? PRODUCTION_API_ORIGIN
      : DEV_API_ORIGIN;

const API_BASE_URL = RAW_ORIGIN.replace(/\/+$/, "").replace(/\/v1$/, "") + "/v1";


async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** GET /v1/console/scenarios -> ScenarioTestCase[] */
export async function loadScenarios(): Promise<ScenarioTestCase[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/console/scenarios`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as ScenarioTestCase[];
      }
    }
  } catch {
    // Offline / dev fallback
  }
  return SCENARIOS;
}

/** GET /v1/console/scenarios/:id -> ScenarioTestCase */
export async function loadScenario(id: string): Promise<ScenarioTestCase | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/console/scenarios/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data) return data as ScenarioTestCase;
    }
  } catch {
    // Offline / dev fallback
  }
  return getScenarioById(id) ?? null;
}

const PASSPORTS: Record<RobotId, RobotPassport> = {
  ramu: {
    robotId: "ramu",
    ensName: "ramu.dabbawala.eth",
    owner: "0xF1EE7…a91c (operator)",
    resolver: "PermissionedResolver #7 (own proxy)",
    zones: ["mahim", "dadar", "churchgate"],
    budgetMicroHbar: 5000,
    status: "active",
    lastEpisode: "ep-tc-01-001",
    block: { number: 7204118, hash: "0x1A2B3C", scannedAtMs: 0 },
    source: "sim",
  },
  sakhu: {
    robotId: "sakhu",
    ensName: "sakhu.dabbawala.eth",
    owner: "0xF1EE7…a91c (operator)",
    resolver: "PermissionedResolver #8 (own proxy)",
    zones: ["mahim", "dadar"],
    budgetMicroHbar: 5000,
    status: "active",
    lastEpisode: "ep-tc-02-001",
    block: { number: 7204118, hash: "0x1A2B3C", scannedAtMs: 0 },
    source: "sim",
  },
  janu: {
    robotId: "janu",
    ensName: "janu.dabbawala.eth",
    owner: "0xF1EE7…a91c (operator)",
    resolver: "PermissionedResolver #9 (own proxy)",
    zones: ["docks-r2"],
    budgetMicroHbar: 5000,
    status: "active",
    lastEpisode: "ep-tc-12-001",
    block: { number: 7204118, hash: "0x1A2B3C", scannedAtMs: 0 },
    source: "sim",
  },
};

/** GET /v1/robots/:id/passport -> RobotPassport (block-stamped ENS read) */
export async function loadPassport(robotId: RobotId): Promise<RobotPassport> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/robots/${encodeURIComponent(robotId)}/passport`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.robotId) return data as RobotPassport;
    }
  } catch {
    // Offline / dev fallback
  }
  const passport = PASSPORTS[robotId];
  // Ensure block.hash is NOT the valuesHash - they are separate:
  // block.number = blockchain block number, block.hash = block hash (or synthetic)
  // valuesHash = policy content hash, displayed separately
  const fixedBlock = {
    number: passport.block.number,
    // Do NOT set hash to passport.valuesHash - they are different things.
    // Use a synthetic block hash that is not the policy content hash.
    hash: `0x${passport.block.number.toString(16).padStart(64, "0")}`,
    scannedAtMs: Date.now(),
  };
  return { ...passport, block: fixedBlock };
}

export interface GateDecisionReceipt {
  requestId: string;
  decision: "approved" | "denied";
  token: string | null;
  ttlMs: number;
  decidedAtMs: number;
  source: "sim" | "live";
}

/** POST /v1/gate/decide -> GateDecisionReceipt
 * Backend enforces the per-zone approver allowlist and mints single-use token.
 * No static bearer credentials in the browser - the backend validates the
 * approver identity and zone binding.
 */
export async function submitGateDecision(
  request: GateRequest,
  decision: "approved" | "denied",
): Promise<GateDecisionReceipt> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/gate/decide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // No static bearer token - backend enforces allowlist via
        // ZONE_APPROVERS config and approved-approver identity
      },
      body: JSON.stringify({ request, decision }),
    });

    if (res.ok) {
      const receipt = await res.json();
      return receipt as GateDecisionReceipt;
    }
  } catch {
    // Offline / dev fallback - fail closed, do not generate token locally
  }

  // Fail closed: no token generation fallback
  return {
    requestId: request.id,
    decision,
    token: null,
    ttlMs: 0,
    decidedAtMs: Date.now(),
    source: "sim",
  };
}

export interface EpisodeLog {
  schema: "dabbawala.console.replay/v1";
  scenario: string;
  seed: string;
  exportedAtMs: number;
  simulated: boolean;
  robots: unknown[];
  steps: unknown[];
  verdict: string | null;
  haltReason: string | null;
}

/** GET /v1/episodes/:scenarioId/log -> EpisodeLog */
export async function loadEpisodeLog(log: EpisodeLog): Promise<EpisodeLog> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/episodes/${encodeURIComponent(log.scenario)}/log`);
    if (res.ok) {
      const served = await res.json();
      if (served && served.schema) return served as EpisodeLog;
    }
  } catch {
    // Fallback to local
  }
  return log;
}

export interface ZeroGProbeEvidence {
  ok: boolean;
  probedAtMs: number;
  latencyMs: number;
  mode: string;
  model: string | null;
  requestId: string | null;
  routerRequestId: string | null;
  provider: string | null;
  teeVerified: boolean | null;
  httpStatus: number | null;
  errorCode: string | null;
  detail: string | null;
  reason: string | null;
}

export interface BackendReadiness {
  status: "ready" | "degraded";
  checks?: {
    database?: string;
    ens_reader?: string;
    zero_g_router?: string;
  };
  zero_g: {
    compute: {
      status: "LIVE" | "MOCK" | "BLOCKED";
      blockedBy: string[];
      endpoint?: string | null;
      model: string | null;
      proven: boolean;
      /** A recent explicit probe completed a Router round-trip. */
      reachable?: boolean;
      /** That probe returned a TEE-verified proposal. */
      verified?: boolean;
      lastSuccessAtMs: number | null;
      lastHaltFailure: string | null;
      successCount: number;
      haltCount: number;
    };
    storage: {
      status: "LIVE" | "MOCK" | "BLOCKED";
      blockedBy?: string[];
      indexerHost: string | null;
      chainId: number | null;
    };
    probe?: ZeroGProbeEvidence | null;
    networkProbed?: false;
  };
}

/** GET /v1/ready -> Backend operational readiness (never billable). */
export async function loadBackendReadiness(): Promise<BackendReadiness | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/ready`);
    if (res.ok) {
      return (await res.json()) as BackendReadiness;
    }
  } catch {
    // Offline
  }
  return null;
}

/**
 * POST /v1/diagnostics/zero-g/probe -> one explicit, cached 0G diagnostic.
 * This is the ONLY frontend action that may spend a billable inference.
 * Call it from an explicit user action, never from a polling interval.
 */
export async function probeZeroG(force = false): Promise<ZeroGProbeEvidence | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/diagnostics/zero-g/probe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      },
      30_000,
    );
    if (res.ok) {
      const body = (await res.json()) as { cached?: boolean; probe?: ZeroGProbeEvidence };
      return body.probe ?? null;
    }
  } catch {
    // Offline
  }
  return null;
}


/** POST /v1/mission/decide -> Trigger 0G Decision Checkpoint */
export async function triggerMissionDecision(
  stateSummary: {
    robotId: string;
    currentCell: string;
    heading: string;
    checkpointIndex: number;
    totalCheckpoints: number;
    availableRoutes: readonly string[];
    restrictedZones: readonly string[];
    remainingBudgetAtomic: string;
    scenarioHints: readonly string[];
    seed: string;
  },
): Promise<{
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
} | null> {
  try {
    // A live 0G Router inference takes seconds (3.9 s observed in a live probe),
    // and the backend allows ONE retry on failure (invariant §7.4) with a
    // ZERO_G_REQUEST_TIMEOUT_MS deadline of up to 20 s per attempt. The default
    // fetchWithTimeout budget (2500 ms) aborts every live decision mid-flight
    // and turns it into a SAFE-STOP that looks like a 0G outage. Fail-closed
    // semantics are unchanged: a timeout here still halts with
    // ACTION_NOT_ALLOWED on the safe cell.
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/mission/decide`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stateSummary),
      },
      45_000,
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline
  }
  return null;
}

export interface EvidenceUploadReceipt {
  rootHash: string;
  storageTxId: string;
  anchorTxId: string;
  status: string;
  /** Address of the contracted RelayLedger the root was anchored on. */
  relayLedgerAddress?: string;
}

export interface EvidenceUploadFailure {
  error: string;
  violations?: readonly string[];
  details?: string;
}

/**
 * POST /v1/evidence/upload -> Upload to 0G Storage + anchor the root on
 * RelayLedger (0G Galileo). The backend applies the log linter, uploads,
 * sends the real anchor() transaction and verifies by contract read-back;
 * it never invents a receipt (fail-closed). source tag reflects the receipt
 * contract: `complete` only when anchoring verified.
 */
export async function uploadEpisodeEvidence(
  episodeId: string,
  robotId: RobotId = "ramu",
  kind: "episode-log" | "provenance" = "episode-log",
  content?: string,
): Promise<
  { ok: true; source: "live"; receipt: EvidenceUploadReceipt } | { ok: false; source: "sim"; failure: EvidenceUploadFailure | null }
> {
  try {
    // 120 s budget covers the 0G Storage upload (ZERO_G_STORAGE_TIMEOUT_MS
    // default) plus the RelayLedger anchor tx + read-back round-trip.
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/evidence/upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, robotId, kind, content }),
      },
      120_000,
    );
    if (res.ok) {
      const body = (await res.json()) as EvidenceUploadReceipt & { error?: string };
      if (typeof body.rootHash === "string" && body.rootHash.length > 0 && body.status === "complete") {
        return { ok: true, source: "live", receipt: body };
      }
      return { ok: false, source: "sim", failure: { error: "MALFORMED_RECEIPT" } };
    }
    const failure = (await res.json()) as EvidenceUploadFailure;
    return { ok: false, source: "sim", failure };
  } catch {
    return { ok: false, source: "sim", failure: null };
  }
}
