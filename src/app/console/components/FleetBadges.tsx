"use client";

// Bottom-left fleet badges (ref/console.html lines 344-381): three tiffin
// token badges with live status tags. Clicking a badge selects that robot
// and opens its receipt/inspector drawer. Status derives from the runner —
// no extra state.

import type { RobotId } from "../data/types";
import type { RobotRuntime } from "../state/useScenarioRunner";

type FleetBadgesProps = {
  robots: RobotRuntime[];
  selected: RobotId;
  onSelect: (id: RobotId) => void;
};

const ROBOT_CARD: Record<RobotId, { name: string; code: string; bg: string; fg: string; hint: string }> = {
  ramu: { name: "RAMU", code: "A7", bg: "bg-[#FFC20E]", fg: "text-[#14110F]", hint: "Inspect Ramu (A·●·7)" },
  sakhu: { name: "SAKHU", code: "B2", bg: "bg-[#0F5257]", fg: "text-[#F2EADB]", hint: "Inspect Sakhu (B·●·2)" },
  janu: { name: "JANU", code: "C9", bg: "bg-[#C9CCCB]", fg: "text-[#14110F]", hint: "Inspect Janu (C·●·9)" },
};

function statusFor(state: RobotRuntime["state"]): { text: string; dot: string; label: string } {
  switch (state) {
    case "moving":
      return { text: "EN ROUTE", dot: "bg-[#FFC20E]", label: "text-[#B07C00]" };
    case "checkpoint":
      return { text: "AT CP", dot: "bg-[#2E9E5B]", label: "text-[#2E9E5B]" };
    case "halted":
      return { text: "HALTED", dot: "bg-[#D0342C]", label: "text-[#D0342C]" };
    case "delivered":
      return { text: "DELIVERED", dot: "bg-[#2E9E5B]", label: "text-[#2E9E5B]" };
    default:
      return { text: "STANDBY", dot: "bg-[#14110F]/40", label: "text-[#14110F]/55" };
  }
}

export default function FleetBadges({ robots, selected, onSelect }: FleetBadgesProps) {
  return (
    <div className="fixed bottom-5 left-5 z-30 flex items-center gap-1.5 bg-[#FAF4E9]/95 border border-[#14110F] p-1.5 shadow-[2px_2px_0_#14110F] backdrop-blur-[2px]">
      {robots.map((robot, i) => {
        const card = ROBOT_CARD[robot.id];
        const status = statusFor(robot.state);
        const isSelected = robot.id === selected;

        return (
          <div key={robot.id} className="flex items-center">
            {i > 0 && <div className="w-px h-5 bg-[#14110F]/20 mr-1.5" />}
            <button
              onClick={() => onSelect(robot.id)}
              title={card.hint}
              className={`flex items-center gap-2 px-2 py-1 transition-colors ${
                isSelected ? "bg-[#E6DBC3] outline outline-1 outline-[#14110F]" : "hover:bg-[#F2EADB]"
              }`}
            >
              <span
                className={`relative w-6 h-6 border-2 border-[#14110F] ${card.bg} ${card.fg} flex items-center justify-center text-xs shadow-[1px_1px_0_#14110F]`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
              >
                {card.code}
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-[#14110F] ${status.dot}`}
                />
              </span>
              <span className="flex flex-col leading-none text-left">
                <span
                  className="font-bold text-[11px] uppercase tracking-wider text-[#14110F]"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {card.name}
                </span>
                <span
                  className={`text-[7.5px] font-semibold mt-0.5 ${status.label}`}
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {status.text}
                </span>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
