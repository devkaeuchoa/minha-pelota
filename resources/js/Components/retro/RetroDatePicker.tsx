import { ReactNode } from 'react';

interface DateSegment {
  id: string;
  value: string;
  active?: boolean;
}

interface RetroDatePickerProps {
  label: string;
  segments: DateSegment[];
  onSegmentClick?: (id: string) => void;
}

export function RetroDatePicker({ label, segments, onSegmentClick }: RetroDatePickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="retro-text-shadow text-sm text-[#a0b0ff]">{label}</label>
      <div className="flex gap-1">
        {segments.map((seg, i) => (
          <SegmentRow key={seg.id}>
            {i > 0 && <span className="self-center text-xl text-[#ffd700]">/</span>}
            <button
              onClick={() => onSegmentClick?.(seg.id)}
              className={
                seg.active
                  ? 'retro-text-shadow flex-1 border-2 border-[#39ff14] bg-[#2540a0] text-lg text-[#ffd700] shadow-[0_0_4px_#39ff14]'
                  : 'retro-text-shadow retro-drop-shadow flex-1 border-2 border-[#4060c0] bg-[#1e348c] text-lg text-white hover:bg-[#2540a0]'
              }
            >
              {seg.value}
            </button>
          </SegmentRow>
        ))}
      </div>
    </div>
  );
}

function SegmentRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 items-center gap-1">{children}</div>;
}
