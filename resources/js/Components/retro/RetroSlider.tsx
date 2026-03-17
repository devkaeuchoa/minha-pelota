interface RetroSliderProps {
  label: string;
  min?: number;
  max?: number;
  value: number;
  onChange?: (value: number) => void;
}

export function RetroSlider({ label, min = 0, max = 100, value }: RetroSliderProps) {
  const range = max - min;
  const pct = range > 0 ? ((value - min) / range) * 100 : 0;

  return (
    <div className="flex items-center gap-3 border-2 border-[#4060c0] bg-[#1e348c] p-2">
      <div className="flex flex-1 flex-col gap-1">
        <label className="retro-text-shadow text-sm text-[#a0b0ff]">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-lg text-white">{min}</span>
          <div className="retro-inset-shadow relative h-3 flex-1 border border-[#4060c0] bg-[#0b1340]">
            <div
              className="absolute inset-y-0 left-0 border-r-2 border-white bg-gradient-to-r from-[#ff0055] via-[#ffea00] to-[#39ff14]"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-2 -translate-x-1/2 -translate-y-1/2 border-2 border-[#4060c0] bg-white shadow-[1px_1px_0_#000]"
              style={{ left: `${pct}%` }}
            />
          </div>
          <span className="text-lg text-[#ffd700]">{max}</span>
        </div>
      </div>
      <span className="retro-text-shadow text-2xl font-bold text-[#ffd700]">{value}</span>
    </div>
  );
}
