# Dabbawala Protocol — Console Implementation Tasks

## Phase Breakdown

### Task 1: Scenarios & Data Store Model (`src/app/console/data/scenarios.ts`)
- [x] Define TypeScript types for: `RobotState`, `Checkpoint`, `ScenarioTestCase`, `ProofReceipt`, `GateRequest`.
- [x] Implement data structures for the 10 core scenarios (TC-01, TC-02, TC-03, TC-04, TC-05, TC-08, TC-12, TC-13, TC-16, TC-20).
- [x] Define initial coordinates, route waypoints, and step-by-step actions for Ramu, Sakhu, and Janu.
- [x] *Acceptance:* Strongly-typed scenarios available for import with zero `any` types. (Files: `types.ts`, `scenarios.ts`)

### Task 2: Cartographic Mumbai Map (`src/app/console/components/MumbaiMap.tsx`)
- [x] Build high-fidelity SVG canvas (1440x900 base coordinate space) with pan & zoom handlers.
- [x] Render coastline, Arabian Sea depth markings, Mumbai landmarks (Gateway of India, Rajabai Tower, Queen's Necklace).
- [x] Render Western Railway tracks, Central Line branch, stations (Andheri, Bandra, Dadar, Churchgate, Colaba).
- [x] Render Kitchens (K1, K2), Dropoffs (Mittal Towers), and Restricted Zone R-2 with red hazard hatch pattern.
- [x] Render Checkpoint Signal lights (CP1, CP2, CP3) that reflect dynamic states (Green, Amber, Red).
- [x] *Acceptance:* Interactive SVG board renders crisply on any screen; zoom in/out and drag-to-pan work smoothly.

### Task 3: Interactive Robot Entities (`src/app/console/components/MapRobots.tsx`)
- [x] Create 3 robot tokens: Ramu (`A·●·7`), Sakhu (`B·●·2`), Janu (`C·●·9`).
- [x] Add smooth trajectory interpolation as bots advance along route legs.
- [x] Add dynamic speech & status callouts (e.g. `⚡ Paying 0.002 HBAR`, `🛑 Zone R-2 Halt Flag`).
- [x] Add selection state: clicking a robot sets it as the active entity in the inspector.
- [x] *Acceptance:* Robots glide smoothly between coordinates with animated speech bubbles.

### Task 4: Console Shell & Top Navigation (`src/app/console/components/ConsoleHeader.tsx`)
- [x] Display authentic Dabbawala Protocol brand mark and Marathi title line.
- [x] Add scenario selector pill with level name and modal/dropdown trigger.
- [x] Add 0G Active / Down toggle switch with heartbeat indicator.
- [x] Add Network indicator (`NET: SepoliaETH`) and Return to Landing Page button.
- [x] *Acceptance:* Header stays fixed at top with reactive 0G toggle and scenario indicator.

### Task 5: Left Scenario Drawer & "Surprise Me" Picker (`src/app/console/components/ScenarioDrawer.tsx`)
- [x] Collapsible left drawer (320px) listing all 10 scenarios organized by track/chapter.
- [x] Display TC code, title, brief description, and status tag (e.g., `APPROVED`, `REFUSED`, `SAFE-STOP`).
- [x] Implement "Surprise Me" (Choose Random) button with animated rapid cycling (~600ms) before selecting a random scenario.
- [x] *Acceptance:* Clicking any scenario loads its state and route paths; Surprise Me picks a scenario with visual fanfare.

### Task 6: Right Inspector & Cryptographic Proof Drawer (`src/app/console/components/InspectorDrawer.tsx`)
- [x] Robot Passport section displaying selected robot's ENS details (`name`, `owner`, `resolver`, `budget`, `status`, `block`).
- [x] 5-Tier Proof Receipt cards detailing:
  1. ENS Policy read snapshot
  2. Hedera x402 payment status (Tx link, amount, payee)
  3. 0G Compute decision (Request ID `ZG-Res-Key`, route chosen)
  4. Human Gate status (Approver allowlist, token TTL)
  5. 0G Storage ledger entry (Merkle root, RelayLedger contract link)
- [x] Export JSON log button.
- [x] *Acceptance:* Inspector dynamically reflects the active robot and selected scenario's cryptographic steps.

### Task 7: Playback Control Strip (`src/app/console/components/PlaybackControls.tsx`)
- [x] Fixed bottom dock with Play/Pause button (Peeli Yellow with hard shadow).
- [x] Step forward, Step backward, and Reset buttons.
- [x] Speed toggle (1x, 2x, 4x).
- [x] Progress timeline indicator showing progress through the current scenario.
- [x] *Acceptance:* Play starts simulation progression; Pause stops it; Step advances one checkpoint.

### Task 8: Human Gate Modal & Verdict Stamp Overlays (`src/app/console/components/ConsoleModals.tsx`)
- [x] Human Gate modal for Restricted Zone R-2 with 60s countdown timer and tactile APPROVE / DENY buttons.
- [x] Giant rotated rubber stamp verdict overlay (`REFUSED`, `DENIED`, `HALTED`, `SAFE-STOP`, `DELIVERED`).
- [x] 0G Outage vignette effect (dark monsoon dusk wash when 0G is toggled off).
- [x] *Acceptance:* Approving/denying in the gate modal resolves the robot's movement; stamp slams down with high impact.

### Task 9: Assemble `/console` Page & Link Landing Page
- [x] Connect components in `src/app/console/page.tsx`.
- [x] Update Landing Page `NavHeader` and CTA buttons to navigate to `/console`.
- [ ] Test complete workflow in Next.js development server. *(build + static prerender pass; needs human visual check in browser)*
- [ ] Verify responsive layout and ensure zero console errors. *(lint/build clean; needs human visual check)*
- [ ] *Acceptance:* Clicking "Launch app" on landing page seamlessly transitions to `/console` with a fully operational simulation. *(router wired; pending human visual confirmation)*

---

## V2 Rework (human-directed after Task 9 visual review)

Goal: `ref/console.html` cartography is the quality bar; the board must be
the wow factor with zero pan/zoom lag; all three robots act in every test
case; keep the backend swap point explicit.

### Task V2-1: Data model — per-robot lanes (`data/types.ts`, `data/scenarios.ts`)
- [x] Add `RobotLane` (role, polyline route, per-step callouts) and `lanes: Record<RobotId, RobotLane>` to `ScenarioTestCase`.
- [x] Add `leadRobot` and `haltTarget?: RobotId` (targeted halt: TC-08 stops Janu only).
- [x] Add `RobotPassport` shape matching the future `GET /api/robots/:id/passport` response.
- [x] Give all 10 scenarios lanes for Ramu, Sakhu and Janu with per-step callouts.
- [x] *Acceptance:* every TC renders three robots narrating their own activity; zero `any`.

### Task V2-2: Service layer (`services/consoleApi.ts`)
- [x] Extract the endpoint boundary: `loadScenarios`, `loadScenario`, `loadPassport`, `submitGateDecision`, `loadEpisodeLog`.
- [x] Document each against `docs/CONSOLE_ENDPOINTS.md` with `source: "sim" | "live"`.
- [x] Runner resolves gate decisions through `submitGateDecision` (single swap point).
- [x] *Acceptance:* no component calls data files directly except the service; `fetch` absent from bodies.

### Task V2-3: Runner v2 (`state/useScenarioRunner.ts`)
- [x] Polylines instead of checkpoint hops: `pointAlong` position per robot with convoy lag.
- [x] Per-robot halts (`haltTarget`) with fleet-continue vs fleet-halt distinction.
- [x] Async gate resolution through the service; resume only on fresh 0G + fresh policy read.
- [x] *Acceptance:* TC-08 halts Janu while Ramu/Sakhu keep moving; TC-16 fails closed all three.

### Task V2-4: Map rewrite (`components/MumbaiMap.tsx`, `MapRobots.tsx`)
- [x] Full-bleed `slice` board, ref-grade cartography (sea + Marathi label + skyline, Western/Central rails + LOCAL train glyph, SV Canal waterlog, R-2 hazard hatch, enamel station plates, K1/K2, surveyor plat annotations).
- [x] Lag fix: pan/zoom write the `<svg>` CSS `transform` imperatively via refs (GPU-composited); the board tree never re-renders on pointer movement; only the robot layer re-renders on runner ticks.
- [x] Wheel zoom at cursor, zoom clamp 0.8–1.9, hairline zoom/recenter controls bottom-right.
- [x] Ref-style tiffin tokens: aura + tactile shadow, ink core, label plate, speech bubble with tail (flips near board edge).
- [x] *Acceptance:* pan/zoom smooth while playing; zooming out stays coherent.

### Task V2-5: Shell components
- [x] `ConsoleHeader`: landing-identical `TiffinMark` lockup wrapped in `Link href="/"` (separate "back to landing" button removed); level pill opens The Line.
- [x] `ScenarioDrawer` / `InspectorDrawer`: slide-overs with `open`/`onClose` (board is full-bleed beneath).
- [x] `FleetBadges` (new): bottom-left three badges with live status; click selects + opens receipt.
- [x] `PlaybackControls`: floating bottom-center dispatch dock (The Line, DISPATCH primary, step/reset, speed, timeline).
- [x] `ConsoleModals`: gate desk with countdown ring + stamp buttons, verdict overlay with Run Again / View Receipt, 0G vignette.
- [x] *Acceptance:* shell floats over the board; drawers do not reflow the map.

### Task V2-6: Page assembly & verification (`page.tsx`)
- [x] Compose full-bleed layout with drawer open-state wiring (`onOpenTheLine`, robot select opens inspector).
- [x] `npm run lint` → 0 errors, 0 warnings.
- [x] `npm run build` → Next.js 16.4.3, `/console` static-prerendered.
- [ ] Human visual check of v2 board (pan/zoom feel, all-3-robot movement). *(pending)*

---

## Evidence

- `npm run lint` → 0 errors, 0 warnings (10/31)
- `npm run build` → Next.js 16.4.3 compiled; `/`, `/console` static-prerendered (10/31)
- All proof data, request ids, tx ids, merkle roots and ENS records on the console are SIMULATED demo placeholders until ROADMAP Phase B wires live integrations.
