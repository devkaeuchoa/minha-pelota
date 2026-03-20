interface RetroValueDisplayProps {
  label: string;
  value: string;
}

export function RetroValueDisplay({ label, value }: RetroValueDisplayProps) {
  return (
    <div data-component="retro-value-display" className="flex flex-col gap-1 w-full">
      <label className="retro-text-shadow text-sm text-[#a0b0ff]">{label}</label>
      <div className="retro-inset-shadow flex border-2 border-[#4060c0] bg-[#0b1340] p-1">
        <span className="retro-text-shadow w-full text-xl tracking-widest text-[#ffd700]">
          {value}
        </span>
      </div>
    </div>
  );
}
