# Dabbawala Protocol — Console Implementation Specification

## 1. Overview & Purpose
The **Console** (`/console`) is the primary operating canvas of the Dabbawala Protocol. It allows judges and operators to observe and control the verifiable, bounded-authority simulation of autonomous delivery robots across Mumbai's urban grid.

The console translates the three target sponsor technologies (**0G Compute & Storage**, **Hedera x402**, and **ENSv2**) into a tangible, game-like simulation board adhering to the aesthetic guidelines in `DESIGN.md` (Bombay Ledger & Rail theme: Chai Paper `#F2EADB`, Kaali Ink `#14110F`, Peeli Yellow `#FFC20E`, tactile hairlines, and flat vector cartography).

---

## 2. Architecture & Layout (Based on DESIGN.md)

### 2.1 Viewport Structure (Fixed 100vh)
```
+----------------------------------------------------------------------------------------------------+
| TOPBAR: Brand Lockup | Scenario Badge | 0G Live Switch | Sepolia Net | Back to Landing | Launch Demo |
+------------------------------+----------------------------------------------------+----------------+
| LEFT PANEL (320px)           | CENTER: INTERACTIVE GAME MAP                       | RIGHT PANEL    |
| - Scenarios / Test Cases     | - Mumbai Shoreline & Surveyor Grid Canvas          | (380px)        |
| - Filter by Track / Sponsor  | - Railway Corridors (Western, Central, Harbour)    | - Robot        |
| - Surprise Me / Random       | - Stations, Kitchens & Checkpoints                 |   Passport     |
| - Quick-pick Status Tags     | - 3 Tiffin Robots (Ramu, Sakhu, Janu)              | - Live Proof   |
|                              | - Dynamic Route Paths (Yellow 0G vs Dashed Ink)    |   Receipt      |
|                              | - Live Speech & Event Bubbles                      | - Gate Decision|
|                              +----------------------------------------------------+   Desk         |
|                              | BOTTOM PLAYBACK DOCK: Play/Pause | Step | Speed     |                |
+------------------------------+----------------------------------------------------+----------------+
```

### 2.2 Unnecessary Elements Removed from `ref/console.html`
1. **Removed Gamified Arcade Mechanics:** Removed "Edmondson 20-Punch Season Pass" ticket modal, Stationmaster XP points, and prediction betting ("Call It: Delivers / Reroutes / Stopped").
2. **Removed Clutter Modals:** Replaced disconnected multi-step modals with integrated in-context drawer actions (Inspector Drawer, Human Gate Modal when triggered, and Verdict Stamp Overlay).
3. **Streamlined UI:** Fixed styling strictly to `DESIGN.md`: no cards with heavy rounded borders, 1px ink hairlines, clean typography using Geist, Geist Mono, Instrument Serif, and Barlow Condensed.

---

## 3. Map Component Design (The Core Game Board)

The map canvas will be built with high interactivity, smooth animations, and Mumbai geographic flavor:

### 3.1 Cartographic Elements & Places
* **Arabian Sea Coastline & Marine Drive:** Left shoreline contour with water depth soundings, Queen's Necklace promenade line art, and coastal landmarks (Gateway of India, Rajabai Clock Tower).
* **Railway Spine:** Western Railway double steel track running from Andheri through Bandra, Dadar, and Churchgate to Colaba.
* **Stations & Checkpoints:**
  * **K1 / K2:** Andheri Cloud Kitchen & Worli Relay Kitchen.
  * **ADH:** Andheri Terminus (origin).
  * **CP1:** Mahim Interchange (ENS Policy Validation checkpoint).
  * **BVI / DDR:** Dadar Junction (Hedera x402 micro-payment checkpoint).
  * **SV Canal:** Waterlogged monsoon hazard zone with detour options.
  * **CP3 / Sentry Gate:** Restricted Zone R-2 perimeter with human authorization requirement.
  * **CCG:** Churchgate Station & Relay Hub.
  * **COL:** Colaba Gate 4 & Mittal Towers (final delivery destination).
* **Restricted Zone R-2 (Docks & Navy Perimeter):** Red hatched hazard polygon. When a robot enters without an approval token, gate sentry enforces immediate halt or turnaround.

### 3.2 The 3 Robot Entities
| Robot | ENS Passport | Ring Color | Code Mark | Default Route / Role |
|---|---|---|---|---|
| **Ramu** | `ramu.dabbawala.eth` | Peeli Yellow (`#FFC20E`) | `A·●·7` | Primary Western Line courier |
| **Sakhu** | `sakhu.dabbawala.eth` | Marine Teal (`#0F5257`) | `B·●·2` | Monsoon SV Canal detour scout |
| **Janu** | `janu.dabbawala.eth` | Steel / Crimson (`#A9ACAB`) | `C·●·9` | Restricted Zone R-2 cargo specialist |

### 3.3 Map Interactivity & Game Mechanics
* **Interactive Pan & Zoom:** Drag to pan around Mumbai; smooth zoom buttons (+ / - / recenter).
* **Animated Trajectories:** Robots glide smoothly along SVG paths using Framer Motion and GSAP interpolation.
* **Speech & State Bubbles:** Floating tactile badges above robots displaying real-time events (e.g., `⚡ Paying 0.002 HBAR`, `📍 0G Route Verified`, `🛑 Paused via ENS`).
* **Entity Selection:** Clicking any robot focuses the camera and opens its passport in the right inspector; clicking any checkpoint highlights its policy criteria.

---

## 4. Test Cases & Scenarios Engine

A predefined test case suite demonstrating all protocol invariants:

1. **TC-01: Clean Delivery (Happy Path)**
   * *Flow:* Ramu reads ENS -> Buys route intel over Hedera x402 -> 0G Compute routes to destination -> Delivered to Mittal Towers.
   * *Proof:* All 5 check receipts validated.

2. **TC-02: Monsoon Flooded Lane Reroute**
   * *Flow:* SV Canal is waterlogged; 0G Router detects flood hazard at Dadar -> chooses detour path via Mahim -> Sakhu completes delivery without stalling.

3. **TC-03: Three Robots Concurrent Relay**
   * *Flow:* Ramu hands off dabba box to Sakhu at Dadar Junction; Sakhu transfers to Janu; all 3 synchronize manifests.

4. **TC-04: Over Per-Request Cap**
   * *Flow:* Intel server demands 0.050 HBAR (above Spend Controller deploy cap of 0.005 HBAR) -> Spend Controller refuses to sign -> Robot halts safely.

5. **TC-05: Budget Exhausted**
   * *Flow:* Robot's ENS budget is depleted mid-transit -> x402 payment refused -> Operator-ask event fired -> Robot safe-stops.

6. **TC-08: Safety Officer Halts One Robot**
   * *Flow:* Safety officer edits ENS text record `status=paused` for Janu -> Janu immediately halts with `POLICY_PAUSED` -> Ramu and Sakhu continue unaffected.

7. **TC-12: Human Gate Approved (Restricted Zone R-2)**
   * *Flow:* Janu requests entry to Zone R-2 -> Gatekeeper modal appears -> Stationmaster clicks APPROVE -> 60s single-use token minted -> Sentry opens.

8. **TC-13: Human Gate Denied**
   * *Flow:* Stationmaster clicks DENY in Gatekeeper modal -> No token issued -> Janu executes safe turnaround.

9. **TC-16: 0G Outage Safe-Stop (No Guessing)**
   * *Flow:* 0G endpoint goes down (or user toggles 0G Switch) -> Robot fails closed with reason code `ZG_TIMEOUT` -> Halts on nearest safe cell.

10. **TC-20: Cryptographic Replay & Verification**
    * *Flow:* Downloads episode JSONL log -> Hashes execution steps -> Compares against 0G Galileo `RelayLedger` contract root -> Match confirmed.

### 4.1 "Choose Random" / "Surprise Me" Feature
* Clicking **"Surprise Me"** cycles through scenarios with a rapid tactile highlight animation (~600ms) before selecting a random test case and dispatching the bots.

---

## 5. Right Inspector & Proof Drawer
* **Robot Passport Card:** Shows live ENS record fields (`owner`, `resolver`, `zones`, `budget`, `status`, `last-episode`), block height, and verifiable access roles.
* **5-Tier Checkpoint Receipt:**
  1. *ENS Passport:* Block-stamped policy snapshot.
  2. *Hedera x402 Payment:* Settled transaction ID, HCS topic link, fee breakdown.
  3. *0G Compute Decision:* Request ID (`ZG-Res-Key`), model hash, closed action output.
  4. *Human Gate Permit:* Cryptographic single-use permit, nonce, zone ID, expiry timer.
  5. *0G Storage Ledger:* Merkle root, RelayLedger Galileo anchor contract address.
* **Verdict Rubber Stamp Overlay:** High-impact tactile rubber stamp (`REFUSED`, `APPROVED`, `HALTED`, `SAFE-STOP`, `DELIVERED`) appearing upon scenario conclusion.

---

## 6. Implementation Technical Stack
* **Framework:** Next.js 16 (App Router) + TypeScript.
* **Styling:** Tailwind CSS v4 + Custom Bombay Ledger tokens.
* **Animation:** Framer Motion + GSAP for robotic cartographic paths.
* **State Management:** React state & hooks for scenario stepping, timeline playback, and robot state machines.

---

## 7. V2 Architecture (rework after Task 9 review)

### 7.1 Full-bleed board, floating shell
The three-column layout of §2.1 is retired. The cartographic board now fills
the viewport (`fixed inset-0`, SVG with `preserveAspectRatio="xMidYMid
slice"`) and every chrome element floats above it:

```
+----------------------------------------------------------------------------------+
| HEADER (fixed, z-40): TiffinMark lockup -> Link "/" | LVL pill | NET | 0G lever   |
|                                  [full-bleed cartographic board, z-0]             |
| The Line drawer (z-30)              Receipt drawer (z-30)                         |
| FleetBadges (bottom-left)   Dispatch dock (bottom-center)   Zoom (bottom-right)   |
| Overlays: 0G vignette (z-20), Gate desk + Verdict (z-50)                          |
+----------------------------------------------------------------------------------+
```
Drawers are slide-overs (`open`/`onClose`); opening one never reflows or
re-renders the map.

### 7.2 Per-robot lanes (all 3 robots in every test case)
`ScenarioTestCase.lanes: Record<RobotId, RobotLane>` gives Ramu, Sakhu and
Janu their own polyline route and per-step callouts. One shared step clock
advances all three with a convoy lag; `leadRobot` highlights the active lane
in Peeli Yellow while the others render dashed. `ScenarioStep.haltTarget`
lets a halt stop one robot (TC-08: Janu `POLICY_PAUSED`) while the fleet
keeps running; a lead-robot or 0G halt stops everything.

### 7.3 Performance contract (the lag fix)
- Pan/zoom mutate the `<svg>` element's CSS `transform` through refs —
  GPU-composited, zero React work per pointer event (matches how
  `ref/console.html` drives its board with `transform: scale()`).
- Static cartography, checkpoint layer and route layer are memoized; only
  the robot token layer re-renders, and only on the runner's 50ms tick.
- Zoom is clamped (0.8–1.9) with cursor-anchored wheel zoom so zooming out
  stays coherent.

### 7.4 Service boundary (backend swap point)
All I/O-shaped operations go through `src/app/console/services/consoleApi.ts`
(`loadScenarios`, `loadScenario`, `loadPassport`, `submitGateDecision`,
`loadEpisodeLog`). Contract: `docs/CONSOLE_ENDPOINTS.md`. Today each body
resolves deterministic local data with `source: "sim"`; the backend replaces
bodies only, without touching components. The gate modal's APPROVE/DENY
already flows through `submitGateDecision`, so the future allowlist (403)
and single-use-token enforcement land server-side with no UI change.

### 7.5 What stayed excluded (§2.2 still holds)
No Edmondson season pass, no XP, no prediction betting. Gamified *feel* comes
from the hard-shadow dock, the stamp-slam verdict, and the fleet badges — not
from scores.

