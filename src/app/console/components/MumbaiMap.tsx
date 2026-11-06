"use client";

// Cartographic Mumbai board (v2). Full-bleed SVG in a 1440x900 survey
// grid, styled after ref/console.html: archival ledger grid, Arabian Sea
// with Marathi label, Western/Central rail spines, SV Canal waterlog,
// Restricted Zone R-2 hazard hatch, enamel station plates, checkpoint
// diamonds.
//
// PERFORMANCE: pan/zoom mutate the <svg> element's CSS transform through
// refs (GPU-composited), never React state — the board tree does not
// re-render on pointer movement. Only the robot layer re-renders, on the
// runner's tick. Cartography is stylized sim art, not survey data.

import { useCallback, useMemo, useRef } from "react";
import MapRobots from "./MapRobots";
import { laneToPathD } from "../state/useScenarioRunner";
import type { Checkpoint, RobotId, ScenarioTestCase } from "../data/types";
import type { RobotRuntime } from "../state/useScenarioRunner";

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 1.9;

const SIGNAL: Record<Checkpoint["status"], { fill: string; word: string }> = {
  pending: { fill: "#E07B00", word: "HOLD" },
  passed: { fill: "#2E9E5B", word: "CLEAR" },
  halted: { fill: "#D0342C", word: "HALT" },
};

type MumbaiMapProps = {
  scenario: ScenarioTestCase;
  checkpoints: Checkpoint[];
  robots: RobotRuntime[];
  selectedRobot: RobotId;
  onSelectRobot: (id: RobotId) => void;
  reducedMotion: boolean;
};

export default function MumbaiMap({
  scenario,
  checkpoints,
  robots,
  selectedRobot,
  onSelectRobot,
  reducedMotion,
}: MumbaiMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const view = useRef({ tx: 0, ty: 0, scale: 1 });

  const applyTransform = useCallback((animate: boolean) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.style.transition = animate && !reducedMotion ? "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    const v = view.current;
    svg.style.transform = `translate(${v.tx}px, ${v.ty}px) scale(${v.scale})`;
  }, [reducedMotion]);

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number, animate: boolean) => {
      const v = view.current;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * factor));
      const k = next / v.scale;
      v.tx = cx - (cx - v.tx) * k;
      v.ty = cy - (cy - v.ty) * k;
      v.scale = next;
      applyTransform(animate);
    },
    [applyTransform],
  );

  const zoomButton = useCallback(
    (dir: 1 | -1) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      zoomAt(dir === 1 ? 1.18 : 0.85, r.width / 2, r.height / 2, true);
    },
    [zoomAt],
  );

  const recenter = useCallback(() => {
    view.current = { tx: 0, ty: 0, scale: 1 };
    applyTransform(true);
  }, [applyTransform]);

  // Zoom controls: named onClick handlers (event paths may touch refs; a
  // data array of closures created during render is not allowed by the
  // react-hooks/refs rule).
  const zoomIn = useCallback(() => zoomButton(1), [zoomButton]);
  const zoomOut = useCallback(() => zoomButton(-1), [zoomButton]);

  // Pointer pan (direct DOM writes, no React re-render).
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    applyTransform(false);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const v = view.current;
    v.tx += e.clientX - d.x;
    v.ty += e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    applyTransform(false);
  };
  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drag.current?.id === e.pointerId) {
      drag.current = null;
      applyTransform(true);
    }
  };
  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - r.left, e.clientY - r.top, false);
  };

  // Memoized static cartography: never re-renders on tick or pan/zoom.
  const baseBoard = useMemo(
    () => (
      <>
        {/* Ledger grid floor */}
        <rect x="0" y="0" width="1440" height="900" fill="#E9DFCA" />
        <rect x="0" y="0" width="1440" height="900" fill="url(#ledgerGrid)" />

        {/* Arabian Sea: coast, depth, Marathi label, skyline contour */}
        <g>
          <path
            d="M 0,0 L 290,0 Q 330,220 280,450 T 260,710 Q 300,820 270,900 L 0,900 Z"
            fill="#DDE6E4"
            opacity="0.65"
          />
          <path
            d="M 290,0 Q 330,220 280,450 T 260,710 Q 300,820 270,900"
            fill="none"
            opacity="0.35"
            stroke="#14110F"
            strokeDasharray="4,4"
            strokeWidth="1.5"
          />
          <text
            fill="#14110F"
            fontFamily="'Tiro Devanagari Marathi', serif"
            fontSize="30"
            letterSpacing="6"
            opacity="0.16"
            transform="rotate(-90 62 470)"
            x="62"
            y="470"
          >
            अरबी समुद्र · ARABIAN SEA
          </text>
          <text
            fill="#14110F"
            fontFamily="'Geist Mono', monospace"
            fontSize="10"
            letterSpacing="2"
            opacity="0.35"
            x="72"
            y="836"
          >
            WESTERN HARBOUR ROADSTEAD // DEPTH 14M
          </text>
          {[190, 350, 520, 680].map((y, i) => (
            <text
              key={y}
              x={40 + (i % 2) * 26}
              y={y}
              fontFamily="'Geist Mono', monospace"
              fontSize="9"
              fill="#14110F"
              opacity="0.3"
            >
              {-4 - i * 3}m
            </text>
          ))}
          {/* faint skyline contour */}
          <path
            d="M 20,890 L 20,850 L 35,850 L 35,820 L 45,790 L 55,820 L 55,850 L 90,850 L 90,830 L 110,830 L 110,870 L 140,870 L 140,810 L 155,780 L 170,810 L 170,880 L 220,880 L 220,890 Z"
            fill="none"
            opacity="0.12"
            stroke="#14110F"
            strokeWidth="1"
          />
        </g>

        {/* Western Line: double rail ink dash + red ribbon */}
        <g>
          <path
            d="M 540,40 L 540,290 L 510,480 L 510,750 L 530,880"
            fill="none"
            opacity="0.75"
            stroke="#14110F"
            strokeDasharray="7,5"
            strokeWidth="4.5"
          />
          <path
            d="M 540,40 L 540,290 L 510,480 L 510,750 L 530,880"
            fill="none"
            stroke="#D0342C"
            strokeWidth="1.8"
            opacity="0.8"
          />
          <text
            transform="rotate(84 556 220)"
            x="556"
            y="220"
            fontFamily="'Barlow Condensed', sans-serif"
            fontSize="12"
            fontWeight="800"
            letterSpacing="2"
            fill="#14110F"
            opacity="0.4"
          >
            WESTERN LINE
          </text>
          {/* gliding local train glyph */}
          <g transform="translate(537, 180)">
            <rect x="-7" y="-26" width="14" height="52" rx="2" fill="#D0342C" stroke="#14110F" strokeWidth="1.5" />
            <circle cx="0" cy="-16" r="2.5" fill="#FFC20E" />
            <line x1="-5" x2="5" y1="0" y2="0" stroke="#F2EADB" strokeWidth="1.2" />
            <text x="16" y="4" fontFamily="'Barlow Condensed', sans-serif" fontSize="11" fontWeight="700" letterSpacing="1" fill="#14110F">
              LOCAL #904 DOWN
            </text>
          </g>
        </g>

        {/* Central Line branch */}
        <g>
          <path
            d="M 510,480 Q 640,510 820,620 T 1020,780"
            fill="none"
            opacity="0.55"
            stroke="#14110F"
            strokeDasharray="5,4"
            strokeWidth="3"
          />
          <path
            d="M 510,480 Q 640,510 820,620 T 1020,780"
            fill="none"
            stroke="#0F5257"
            strokeWidth="1.4"
            opacity="0.8"
          />
          <text x="700" y="560" fontFamily="'Geist Mono', monospace" fontSize="9" letterSpacing="1" fill="#0F5257" opacity="0.6">
            CENTRAL LINE BRANCH
          </text>
        </g>

        {/* Waterlogged SV Road Canal */}
        <g>
          <path
            d="M 480,560 C 560,540 660,580 760,550 S 910,530 1000,560"
            fill="none"
            opacity="0.2"
            stroke="#0F5257"
            strokeLinecap="round"
            strokeWidth="14"
          />
          <path
            d="M 480,560 C 560,540 660,580 760,550 S 910,530 1000,560"
            fill="none"
            stroke="#0F5257"
            strokeDasharray="5,4"
            strokeWidth="1.8"
          />
          <rect x="610" y="534" width="170" height="18" fill="#0F5257" stroke="#14110F" strokeWidth="1" />
          <text x="695" y="547" textAnchor="middle" fontFamily="'Geist Mono', monospace" fontSize="9" fontWeight="600" letterSpacing="1" fill="#F2EADB">
            WATERLOGGED: SV CANAL
          </text>
        </g>

        {/* Restricted Zone R-2 */}
        <g>
          <polygon
            points="840,320 1180,320 1240,490 880,490"
            fill="url(#hazardHatch)"
            stroke="#D0342C"
            strokeWidth="2"
          />
          <rect x="860" y="327" width="190" height="24" fill="#D0342C" stroke="#14110F" strokeWidth="1.2" />
          <text x="955" y="343" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontSize="14" fontWeight="700" letterSpacing="1.5" fill="#F2EADB">
            RESTRICTED ZONE R-2
          </text>
          <text x="866" y="368" fontFamily="'Geist Mono', monospace" fontSize="9.5" fontWeight="600" fill="#D0342C">
            HUMAN ESCORT SIGN-OFF MANDATED
          </text>
        </g>

        {/* Kitchen K2 (relay kitchen near canal lane) */}
        <g transform="translate(900, 140)">
          <rect x="-12" y="-12" width="24" height="24" fill="#14110F" stroke="#E9DFCA" strokeWidth="1.2" />
          <text y="4" textAnchor="middle" fontFamily="'Geist Mono', monospace" fontSize="10" fontWeight="700" fill="#E9DFCA">
            K2
          </text>
          <text x="20" y="3" fontFamily="'Geist', sans-serif" fontSize="11" fontWeight="600" fill="#14110F">
            Worli Relay Kitchen
          </text>
        </g>

        {/* Dropoff: Mittal Towers */}
        <g transform="translate(790, 810)">
          <rect x="-10" y="-10" width="20" height="20" fill="#2E9E5B" stroke="#14110F" strokeWidth="1.5" />
          <text x="16" y="4" fontFamily="'Geist', sans-serif" fontSize="11" fontWeight="600" fill="#14110F">
            Mittal Towers [Dropoff]
          </text>
        </g>
      </>
    ),
    [],
  );

  // Checkpoint layer (re-renders only when statuses change).
  const checkpointLayer = useMemo(
    () => (
      <>
        {checkpoints.map((cp) => {
          const sig = SIGNAL[cp.status];
          return (
            <g key={cp.id} transform={`translate(${cp.coordinates.x}, ${cp.coordinates.y})`}>
              <polygon points="0,-9 9,0 0,9 -9,0" fill={sig.fill} stroke="#14110F" strokeWidth="1.6" />
              <text x="14" y="3.5" fontFamily="'Geist Mono', monospace" fontSize="9.5" fontWeight="700" fill="#14110F">
                {cp.name.toUpperCase()} [{sig.word}]
              </text>
            </g>
          );
        })}
      </>
    ),
    [checkpoints],
  );

  // Inactive fleet lanes (dashed, robot colors) + active lead lane (yellow).
  const routeLayer = useMemo(
    () => (
      <>
        {(Object.keys(scenario.lanes) as RobotId[])
          .filter((id) => id !== scenario.leadRobot)
          .map((id) => {
            const color = id === "sakhu" ? "#0F5257" : "#1D2A30";
            return (
              <path
                key={id}
                d={laneToPathD(scenario.lanes[id].route)}
                fill="none"
                opacity={id === "sakhu" ? 0.45 : 0.35}
                stroke={color}
                strokeDasharray="4,4"
                strokeWidth="1.5"
              />
            );
          })}
        {/* active lead route: ink casing + solid peeli yellow */}
        <path
          d={laneToPathD(scenario.lanes[scenario.leadRobot].route)}
          fill="none"
          stroke="#14110F"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <path
          d={laneToPathD(scenario.lanes[scenario.leadRobot].route)}
          fill="none"
          stroke="#FFC20E"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    [scenario],
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#E9DFCA] cursor-grab active:cursor-grabbing select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        style={{ transformOrigin: "0 0", willChange: "transform" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        role="img"
        aria-label="Simulated Mumbai dispatch board"
      >
        <defs>
          <pattern id="ledgerGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#14110F" strokeOpacity="0.06" />
          </pattern>
          <pattern id="hazardHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#D0342C" strokeWidth="1.4" opacity="0.4" />
          </pattern>
          <filter id="tactileShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="3" dy="3" floodColor="#14110F" stdDeviation="0" />
          </filter>
        </defs>

        {baseBoard}
        {routeLayer}
        {checkpointLayer}
        {/* Station enamel plates + kitchen K1 */}
        <g>
          {[
            { code: "ANDHERI · ADH", x: 540, y: 140, w: 130 },
            { code: "BANDRA · BVI", x: 510, y: 430, w: 130 },
            { code: "CHURCHGATE · CCG", x: 510, y: 750, w: 150 },
          ].map((st) => (
            <g key={st.code} transform={`translate(${st.x}, ${st.y})`} filter="url(#tactileShadow)">
              <rect x={-st.w / 2} y="-16" width={st.w} height="30" fill="#F2EADB" stroke="#14110F" strokeWidth="1.8" />
              <text y="4" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontSize="16" fontWeight="700" letterSpacing="1.5" fill="#14110F">
                {st.code}
              </text>
              <circle cy="22" r="3.5" fill="#D0342C" stroke="#14110F" strokeWidth="1" />
            </g>
          ))}
          {/* Colaba Gate 4: destination plate */}
          <g transform="translate(630, 840)" filter="url(#tactileShadow)">
            <rect x="-70" y="-15" width="140" height="30" fill="#14110F" stroke="#FFC20E" strokeWidth="2" />
            <text y="5" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontSize="16" fontWeight="700" letterSpacing="1.5" fill="#FFC20E">
              COLABA GATE 4
            </text>
          </g>
          {/* Kitchen K1 */}
          <g transform="translate(650, 120)">
            <rect x="-12" y="-12" width="24" height="24" fill="#14110F" stroke="#E9DFCA" strokeWidth="1.2" />
            <text y="4" textAnchor="middle" fontFamily="'Geist Mono', monospace" fontSize="10" fontWeight="700" fill="#E9DFCA">
              K1
            </text>
            <text x="20" y="3" fontFamily="'Geist', sans-serif" fontSize="11" fontWeight="600" fill="#14110F">
              Andheri Kitchen
            </text>
          </g>
        </g>

        <MapRobots
          robots={robots}
          selected={selectedRobot}
          onSelect={onSelectRobot}
        />
      </svg>

      {/* Surveyor plat annotations (HTML overlay, non-interactive) */}
      <div className="absolute top-16 left-6 font-mono text-[9px] tracking-widest opacity-25 uppercase flex flex-col gap-0.5 pointer-events-none">
        <span>SURVEY PLAT 1890-B · WESTERN DIVISION</span>
        <span>BOMBAY CENTRAL ↔ CHURCHGATE ↔ ANDHERI [KM 18.4]</span>
        <span>GAUGE: BROAD 1676MM · CADASTRE SHEET #04</span>
      </div>
      <div className="absolute top-16 right-6 font-mono text-[9px] tracking-widest opacity-25 uppercase text-right flex flex-col gap-0.5 pointer-events-none">
        <span>LAT 18°55&apos;48&quot; N · LON 72°49&apos;38&quot; E</span>
        <span>DAILY TIFFIN SORT RUN: 200,000 DABBIS</span>
        <span>SIMULATED BOARD — NOT SURVEY DATA</span>
      </div>

      {/* Hairline zoom controls (bottom-right) */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-0.5 bg-[#FAF4E9]/95 border border-[#14110F] p-1 shadow-[2px_2px_0_#14110F]">
        <button
          onClick={zoomIn}
          title="Zoom in"
          aria-label="Zoom in"
          className="w-6 h-6 flex items-center justify-center border border-[#14110F]/15 hover:bg-[#E9DFCA] hover:border-[#14110F] font-mono font-bold text-xs transition-colors"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          title="Zoom out"
          aria-label="Zoom out"
          className="w-6 h-6 flex items-center justify-center border border-[#14110F]/15 hover:bg-[#E9DFCA] hover:border-[#14110F] font-mono font-bold text-xs transition-colors"
        >
          −
        </button>
        <button
          onClick={recenter}
          title="Recenter board"
          aria-label="Recenter board"
          className="w-6 h-6 flex items-center justify-center border border-[#14110F]/15 hover:bg-[#E9DFCA] hover:border-[#14110F] font-mono font-bold text-xs transition-colors"
        >
          ⌖
        </button>
      </div>
    </div>
  );
}
