"use client";

// Robot tokens rendered inside the MumbaiMap SVG (v2). Style follows
// ref/console.html: 56px tiffin token — colored aura ring with hard
// tactile drop shadow, ink core with Barlow code mark, mono label plate
// above, speech bubble with tail on the right. Selection adds a dashed
// aura; a halt flips the aura to stop red.

import type { RobotId } from "../data/types";
import type { RobotRuntime } from "../state/useScenarioRunner";

const ROBOT_STYLE: Record<RobotId, { aura: string; coreText: string; ringText: string; code: string; label: string }> = {
  ramu: { aura: "#FFC20E", coreText: "#FFC20E", ringText: "#14110F", code: "A7", label: "RAMU · A·●·7" },
  sakhu: { aura: "#0F5257", coreText: "#0F5257", ringText: "#14110F", code: "B2", label: "SAKHU · B·●·2" },
  janu: { aura: "#C9CCCB", coreText: "#F2EADB", ringText: "#14110F", code: "C9", label: "JANU · C·●·9" },
};

type MapRobotsProps = {
  robots: RobotRuntime[];
  selected: RobotId;
  onSelect: (id: RobotId) => void;
};

export default function MapRobots({ robots, selected, onSelect }: MapRobotsProps) {
  return (
    <g id="map-robots">
      {robots.map((robot) => {
        const style = ROBOT_STYLE[robot.id];
        const isSelected = robot.id === selected;
        const isHalted = robot.state === "halted";
        const aura = isHalted ? "#D0342C" : style.aura;
        const bubbleRight = robot.pos.x > 1050; // keep bubbles inside the board

        return (
          <g
            key={robot.id}
            transform={`translate(${robot.pos.x}, ${robot.pos.y})`}
            className="cursor-pointer"
            onClick={() => onSelect(robot.id)}
            role="button"
            aria-label={`Select robot ${style.label}`}
          >
            {/* selection aura */}
            {isSelected && (
              <circle r="34" fill="none" stroke={aura} strokeWidth="1" strokeDasharray="3 4" opacity="0.9" />
            )}

            {/* outer tactile aura */}
            <circle r="28" fill={aura} filter="url(#tactileShadow)" stroke="#14110F" strokeWidth="2.5" />

            {/* ink core with code mark */}
            <circle r="20" fill="#14110F" />
            <text
              y="6"
              textAnchor="middle"
              fontFamily="'Barlow Condensed', sans-serif"
              fontSize="17"
              fontWeight="800"
              fill={isHalted ? "#F2EADB" : style.coreText === "#F2EADB" ? "#F2EADB" : style.coreText}
            >
              {style.code}
            </text>

            {/* label plate above */}
            <g transform="translate(0, -46)">
              <rect x="-38" y="-12" width="76" height="16" fill="#F2EADB" stroke="#14110F" strokeWidth="1.2" />
              <text y="0" textAnchor="middle" fontFamily="'Geist Mono', monospace" fontSize="9" fontWeight="700" fill="#14110F">
                {style.label}
              </text>
            </g>

            {/* speech bubble with tail */}
            {robot.callout && (
              <g transform={bubbleRight ? "translate(-184, -32)" : "translate(36, -32)"}>
                <rect
                  x="0"
                  y="-16"
                  width="148"
                  height="28"
                  fill="#FAF4E9"
                  filter="url(#tactileShadow)"
                  stroke="#14110F"
                  strokeWidth="1.5"
                />
                {bubbleRight ? (
                  <>
                    <polygon points="154,0 148,-5 148,5" fill="#FAF4E9" stroke="#14110F" strokeWidth="1.5" />
                    <rect x="149" y="-4" width="3" height="8" fill="#FAF4E9" />
                  </>
                ) : (
                  <>
                    <polygon points="-6,0 0,-5 0,5" fill="#FAF4E9" stroke="#14110F" strokeWidth="1.5" />
                    <rect x="-1" y="-4" width="3" height="8" fill="#FAF4E9" />
                  </>
                )}
                <text
                  x="10"
                  y="2"
                  fontFamily="'Geist Mono', monospace"
                  fontSize="9.5"
                  fontWeight="600"
                  fill={isHalted ? "#D0342C" : robot.id === "sakhu" ? "#0F5257" : "#14110F"}
                >
                  {(robot.callout ?? "").slice(0, 24)}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
