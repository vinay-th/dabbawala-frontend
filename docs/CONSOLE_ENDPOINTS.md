# Console API Contract (Frontend ↔ Backend Swap Boundary)

Status: frontend-only. Every function in `src/app/console/services/consoleApi.ts`
resolves from local deterministic data today. This file is the contract the
future backend implements so the UI does not change.

Tagging per AGENTS.md §5: all shapes below are **INTERPRETATION** — proposed by
the frontend, not yet ratified by a backend. No live endpoint exists
(**UNKNOWN** until ROADMAP Phase B / task B-9 lands). Nothing here cites an
external API; no `REFERENCES.md` ID applies.

---

## 1. Swap Rule

- Call sites import **only** from `../services/consoleApi`.
- Backend work replaces the **function bodies** with `fetch()` calls.
  Signatures, return types and error behavior below are frozen.
- All responses are validated with zod at the boundary when the backend lands
  (AGENTS.md §8). Until then the types are compile-time only.
- Every response carries `source: "sim" | "live"` so the UI can label
  simulated vs. block-stamped data (AGENTS.md §9: never present sim data as
  live evidence).

---

## 2. Endpoints

### 2.1 `loadScenarios(): Promise<ScenarioTestCase[]>`

- Proposed path: `GET /api/console/scenarios`
- Purpose: the 10 dispatch test cases (TC-01 … TC-20) with per-robot lanes,
  checkpoints and steps.
- Today: returns `SCENARIOS` from `data/scenarios.ts`.
- Backend: serve the same `ScenarioTestCase` shape
  (`src/app/console/data/types.ts`). Scenario data is static content; caching
  is permitted.

### 2.2 `loadScenario(id: string): Promise<ScenarioTestCase | null>`

- Proposed path: `GET /api/console/scenarios/:id`
- Returns `null` for unknown ids (no throw).

### 2.3 `loadPassport(robotId: RobotId): Promise<RobotPassport>`

- Proposed path: `GET /api/robots/:id/passport`
- Purpose: block-stamped ENS record for one robot (`ensName`, `owner`,
  `resolver`, `zones`, `budgetMicroHbar`, `status`, `lastEpisode`,
  `block.{number,hash,scannedAtMs}`).
- Today: returns a canned record with `block.scannedAtMs = Date.now()` and
  `source: "sim"`.
- Backend (ROADMAP Phase B, ENS reads): resolve the robot's ENS name, stamp
  `block.number/hash` from the RPC response actually used, set
  `source: "live"`. Stale data must be flagged after 15s (invariant 12).
- Failure behavior: fail closed — the UI must show "unreadable", not a
  cached passport.

### 2.4 `submitGateDecision(request, decision): Promise<GateDecisionReceipt>`

- Proposed path: `POST /api/gate/decide`
- Request: `{ request: GateRequest, decision: "approved" | "denied" }`
- Response: `{ requestId, decision, token | null, ttlMs, decidedAtMs, source }`
- Today: mints `tok-<nonce>-<id>` locally with the request TTL (60s).
- Backend invariants it must enforce (AGENTS.md §7):
  - 8: per-zone approver allowlist; non-allowlisted caller → HTTP 403, no token.
  - 7: single-use token bound to robot, zone, nonce and 0G request id;
    TTL ≤ 60s; deny/expiry/replay issue no token.
- On denial the response carries `token: null`; the runner then stamps the
  scenario `DENIED` and the robot performs a safe turnaround.

### 2.5 `loadEpisodeLog(log: EpisodeLog): Promise<EpisodeLog>`

- Proposed path: `GET /api/episodes/:scenarioId/log`
- Purpose: serve the episode JSONL/JSON for export and replay.
- Today: echoes the locally assembled log (`schema:
  "dabbawala.console.replay/v1"`, `simulated: true`).
- Backend (ROADMAP B-3/B-5): serve the JSONL anchored on `RelayLedger`
  (0G Galileo), after `log-lint` passes; zero secrets/personal data
  (invariant 11).

---

## 3. Not Yet Exposed as Endpoints (UI-internal until Phase B)

| Concern | Current home | Future swap |
|---|---|---|
| Scenario playback clock | `state/useScenarioRunner.ts` | stays client-side (simulation); receives live step events later |
| 0G decision feed | runner (simulated) | `POST`-backed decision stream, still validated as untrusted proposal (invariant 2) |
| x402 payment settlement | proof rows in `InspectorDrawer` | real facilitator responses via backend proxy — **no payment keys in the browser** (invariant 1) |
| Map pan/zoom | `MumbaiMap.tsx` imperative transform | never a server concern |

---

## 4. Verification Record

- `npm run lint` → 0 errors, 0 warnings (10/31) — **VERIFIED**.
- `npm run build` → Next.js 16.4.3, `/console` static-prerendered (10/31) —
  **VERIFIED**.
- No network request is issued by the console today — **VERIFIED** by the
  absence of `fetch` in `services/consoleApi.ts` bodies.
