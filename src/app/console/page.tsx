"use client";

// /console — the mission-control simulation board (v2). Full-bleed
// cartographic map with a floating shell: header, The Line drawer,
// receipt drawer, fleet badges, dispatch dock and overlays. All proof
// data on this page is SIMULATED demo data (docs/CONSOLE_IMPLEMENTATION.md);
// live 0G/Hedera/ENS wiring lands in ROADMAP Phase B through the
// services/consoleApi.ts boundary.

import { useMemo, useState, useSyncExternalStore } from "react";
import ConsoleHeader from "./components/ConsoleHeader";
import ConsoleModals from "./components/ConsoleModals";
import FleetBadges from "./components/FleetBadges";
import InspectorDrawer from "./components/InspectorDrawer";
import MumbaiMap from "./components/MumbaiMap";
import PlaybackControls from "./components/PlaybackControls";
import ScenarioDrawer from "./components/ScenarioDrawer";
import { SCENARIOS } from "./data/scenarios";
import type { Checkpoint, RobotId, ScenarioTestCase } from "./data/types";
import { useScenarioRunner } from "./state/useScenarioRunner";

export default function ConsolePage() {
  const [scenario, setScenario] = useState<ScenarioTestCase>(SCENARIOS[0]);
  const [selectedRobot, setSelectedRobot] = useState<RobotId>("ramu");
  const [ogUp, setOgUp] = useState(true);
  const [lineOpen, setLineOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Subscribe to the OS reduced-motion preference without a setState-in-effect
  // cascade (react-hooks/set-state-in-effect rule).
  const reducedMotion = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false, // SSR: assume motion allowed
  );

  const runner = useScenarioRunner(scenario, ogUp);

  // Checkpoint signal lights derive from the runner's step records.
  const checkpoints: Checkpoint[] = useMemo(() => {
    return scenario.checkpoints.map((cp) => {
      const rec = runner.records.find((r) => r.checkpointId === cp.id);
      const status: Checkpoint["status"] = rec
        ? rec.outcome === "ok"
          ? "passed"
          : rec.outcome === "stop"
            ? "halted"
            : "pending"
        : "pending";
      return { ...cp, status };
    });
  }, [scenario, runner.records]);

  const handleSelectScenario = (s: ScenarioTestCase) => {
    setScenario(s);
    setSelectedRobot(s.leadRobot);
    setOgUp(true);
    setLineOpen(false);
  };

  // Selecting on the map or the fleet badges also reveals the receipt drawer.
  const handleSelectRobot = (id: RobotId) => {
    setSelectedRobot(id);
    setInspectorOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-[#E9DFCA] text-[#14110F] overflow-hidden">
      {/* Full-bleed board (imperative pan/zoom — never re-renders on pointer) */}
      <MumbaiMap
        scenario={scenario}
        checkpoints={checkpoints}
        robots={runner.robots}
        selectedRobot={selectedRobot}
        onSelectRobot={handleSelectRobot}
        reducedMotion={reducedMotion}
      />

      {/* Floating shell */}
      <ConsoleHeader
        scenario={scenario}
        ogUp={ogUp}
        onToggleOg={() => setOgUp((v) => !v)}
        onOpenTheLine={() => setLineOpen(true)}
      />

      <ScenarioDrawer
        open={lineOpen}
        selected={scenario}
        onSelect={handleSelectScenario}
        onClose={() => setLineOpen(false)}
        reducedMotion={reducedMotion}
      />

      <InspectorDrawer
        open={inspectorOpen}
        scenario={scenario}
        runner={runner}
        selectedRobot={selectedRobot}
        onClose={() => setInspectorOpen(false)}
      />

      <FleetBadges robots={runner.robots} selected={selectedRobot} onSelect={handleSelectRobot} />

      <PlaybackControls runner={runner} onOpenTheLine={() => setLineOpen(true)} />

      <ConsoleModals
        runner={runner}
        ogUp={ogUp}
        reducedMotion={reducedMotion}
        onOpenReceipt={() => setInspectorOpen(true)}
      />
    </div>
  );
}
