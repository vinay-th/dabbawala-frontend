'use client';

interface RailProgressProps {
  activeFrame: number;
  onGoToFrame: (frame: number) => void;
}

const STATIONS = [
  { id: 0, label: '00', title: 'Hero' },
  { id: 1, label: '01', title: 'ENS' },
  { id: 2, label: '02', title: 'Hedera' },
  { id: 3, label: '03', title: '0G' },
  { id: 4, label: '04', title: 'Gate' },
  { id: 5, label: '05', title: 'Storage' },
  { id: 6, label: '06', title: 'Close' },
];

export default function RailProgress({ activeFrame, onGoToFrame }: RailProgressProps) {
  return (
    <aside
      aria-label="Protocol rail progress"
      className="fixed left-5 sm:left-7 top-[48%] -translate-y-1/2 z-40 hidden md:flex flex-col items-center text-current"
    >
      <div
        className="text-[9px] tracking-widest uppercase opacity-45 -rotate-90 origin-center mb-5 whitespace-nowrap"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}
      >
        RAIL TIMETABLE
      </div>
      <div className="flex flex-col items-center gap-2">
        {STATIONS.map((station, i) => (
          <div key={station.id} className="flex flex-col items-center">
            <button
              className="group flex items-center gap-2 p-1"
              onClick={() => onGoToFrame(station.id)}
              title={station.title}
            >
              <span
                className="text-[11px] font-bold opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {station.label}
              </span>
              <span
                className="w-[7px] h-[7px] rounded-full border-[1.5px] border-current transition-all duration-250"
                style={
                  activeFrame === station.id
                    ? {
                        backgroundColor: '#FFC20E',
                        borderColor: '#FFC20E',
                        boxShadow: '0 0 0 3px rgba(255,194,14,0.35)',
                      }
                    : {}
                }
              />
            </button>
            {i < STATIONS.length - 1 && (
              <div className="w-px h-2.5 bg-current opacity-20" />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

