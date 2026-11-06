// Console service layer — the frontend's endpoint boundary.
//
// Connected to Dabbawala Protocol Fastify API backend with graceful
// fallback to local deterministic simulation data for offline reliability.
// Endpoint contract: docs/CONSOLE_ENDPOINTS.md.
// ref: user prompt §8, §9

import { SCENARIOS, getScenarioById } from "../data/scenarios";
import type { GateRequest, RobotId, RobotPassport, ScenarioTestCase } from "../data/types";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")
    : "http://localhost:3000/v1");

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
  return { ...passport, block: { ...passport.block, scannedAtMs: Date.now() } };
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
 * Backend enforces the per-zone approver allowlist and mints single-use token. */
export async function submitGateDecision(
  request: GateRequest,
  decision: "approved" | "denied",
): Promise<GateDecisionReceipt> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/gate/decide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer sim-approver-all",
      },
      body: JSON.stringify({ request, decision }),
    });

    if (res.ok) {
      const receipt = await res.json();
      return receipt as GateDecisionReceipt;
    }
  } catch {
    // Offline / dev fallback
  }

  return {
    requestId: request.id,
    decision,
    token: decision === "approved" ? `tok-${request.nonce}-${request.id}` : null,
    ttlMs: decision === "approved" ? request.ttlMs : 0,
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

export interface BackendReadiness {
  status: "ready" | "degraded";
  checks: {
    database: string;
    ens_reader: string;
    zero_g_router: string;
  };
  zero_g: {
    compute: {
      status: "LIVE" | "MOCK" | "BLOCKED";
      blockedBy: string[];
      endpoint: string | null;
      model: string | null;
      proven: boolean;
      lastSuccessAtMs: number | null;
      lastHaltFailure: string | null;
      successCount: number;
      haltCount: number;
    };
    storage: {
      status: "LIVE" | "MOCK" | "BLOCKED";
      blockedBy: string[];
      indexerHost: string | null;
      chainId: number | null;
    };
    networkProbed: false;
  };
}

/** GET /v1/ready -> Backend operational readiness */
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

/** POST /v1/mission/decide -> Trigger 0G Decision Checkpoint */
export async function triggerMissionDecision(
  scenarioId: string,
  robotId?: RobotId,
  challenge: "none" | "0g_unavailable" | "stale_telemetry" | "policy_denied" | "policy_paused" = "none",
): Promise<any> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/mission/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId, robotId, challenge }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline
  }
  return null;
}

/** POST /v1/evidence/upload -> Upload to 0G Storage */
export async function uploadEpisodeEvidence(
  episodeId: string,
  robotId: RobotId = "ramu",
  kind: "episode-log" | "provenance" = "episode-log",
  content?: string,
): Promise<any> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/evidence/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId, robotId, kind, content }),
    });
    return await res.json();
  } catch {
    return null;
  }
}
