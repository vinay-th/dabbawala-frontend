"use client";

// Bottom-center dispatch dock (ref/console.html lines 382-399): The Line
// secondary button, primary Peeli Yellow DISPATCH control, step fwd/back,
// reset, 1x/2x/4x speed and a timeline strip with green/amber/red step
// markers. Floating over the full-bleed board.

import type { ScenarioRunner } from "../state/useScenarioRunner";

type PlaybackControlsProps = {
  runner: ScenarioRunner;
  onOpenTheLine: () => void;
};

const SPEEDS = [1, 2, 4] as const;

export default function PlaybackControls({ runner, onOpenTheLine }: PlaybackControlsProps) {
  const { playing, speed, stepIndex, totalSteps, progress, records, controls, verdict } = runner;

  const pct = verdict ? 100 : ((stepIndex + progress) / Math.max(1, totalSteps)) * 100;

  const markerColor = (outcome: "ok" | "wait" | "stop") =>
    outcome === "ok" ? "bg-[#2E9E5B]" : outcome === "wait" ? "bg-[#E07B00]" : "bg-[#D0342C]";

  const handlePrimary = () => {
    if (playing) {
      controls.pause();
    } else if (verdict) {
      controls.reset();
      controls.play();
    } else {
      controls.play();
    }
  };

  const primaryLabel = playing
    ? "Pause Run"
    : verdict
      ? "Re-Dispatch"
      : runner.haltReason && runner.haltedRobots.length > 0
        ? "Resume (Fresh 0G)"
        : "Dispatch (Play)";

  const secondaryBtn =
    "px-3 py-2 bg-[#FFF8EF] text-[#14110F] border-[1.5px] border-[#14110F] font-extrabold text-[11px] uppercase tracking-wider hover:bg-[#E6DBC3] transition-colors shadow-[2px_2px_0_#14110F] active:shadow-[0.5px_0.5px_0_#14110F] active:translate-x-[1.5px] active:translate-y-[1.5px]";

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
      {/* The Line (scenario drawer) */}
      <button
        onClick={onOpenTheLine}
        className={`${secondaryBtn} flex items-center gap-1.5`}
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        title="Open dispatch scenarios"
      >
        <span aria-hidden="true">⇄</span>
        <span>The Line</span>
      </button>

      {/* Transport cluster */}
      <div className="flex items-center gap-1.5 bg-[#FAF4E9]/95 border border-[#14110F] p-1.5 shadow-[2px_2px_0_#14110F] backdrop-blur-[2px]">
        <button
          onClick={controls.stepBack}
          title="Step back"
          aria-label="Step back"
          className="w-7 h-7 border border-[#14110F]/30 hover:border-[#14110F] hover:bg-[#E6DBC3] transition-colors font-mono text-xs"
        >
          ⏮
        </button>

        {/* Primary DISPATCH */}
        <button
          onClick={handlePrimary}
          className="px-5 py-2 bg-[#FFC20E] text-[#14110F] border-2 border-[#14110F] font-black text-[13px] uppercase tracking-widest shadow-[2.5px_2.5px_0_#14110F] hover:shadow-[3.5px_3.5px_0_#14110F] active:shadow-[0.5px_0.5px_0_#14110F] active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
          <span>{primaryLabel}</span>
        </button>

        <button
          onClick={controls.stepForward}
          title="Step forward"
          aria-label="Step forward"
          className="w-7 h-7 border border-[#14110F]/30 hover:border-[#14110F] hover:bg-[#E6DBC3] transition-colors font-mono text-xs"
        >
          ⏭
        </button>
        <button
          onClick={controls.reset}
          title="Reset run"
          aria-label="Reset run"
          className="w-7 h-7 border border-[#14110F]/30 hover:border-[#14110F] hover:bg-[#E6DBC3] transition-colors font-mono text-xs"
        >
          ⟲
        </button>

        {/* Speed + timeline */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#14110F]/20">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => controls.setSpeed(s)}
              className={`px-1.5 py-0.5 text-[10px] border transition-colors ${
                speed === s
                  ? "border-[#14110F] bg-[#FFC20E]"
                  : "border-[#14110F]/25 hover:border-[#14110F]/60"
              }`}
              style={{ fontFamily: "'Geist Mono', monospace" }}
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}

          <div className="relative w-36 h-2 bg-[#E6DBC3] border border-[#14110F]/40" title="Run timeline">
            <div className="absolute inset-y-0 left-0 bg-[#FFC20E]" style={{ width: `${pct}%` }} />
            {Array.from({ length: totalSteps }).map((_, i) => {
              const rec = records.find((r) => r.stepIndex === i);
              return (
                <span
                  key={i}
                  className={`absolute top-0 bottom-0 w-1 ${rec ? markerColor(rec.outcome) : "bg-[#14110F]/20"}`}
                  style={{ left: `${((i + 1) / totalSteps) * 100 - 1}%` }}
                />
              );
            })}
          </div>
          <span
            className="text-[10px] shrink-0 text-[#14110F]/70 tabular-nums"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            {Math.min(stepIndex + 1, totalSteps)}/{totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}
