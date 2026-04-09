interface RetroStatusPillProps {
  status: 'on' | 'off';
  label: string;
  isLabelCentered?: boolean;
}

export function RetroStatusPill({ status, label, isLabelCentered = false }: RetroStatusPillProps) {
  const isOn = status === 'on';

  return (
    <div
      data-component="retro-status-pill"
      className={`retro-border-panel flex items-center gap-2 bg-[#1e348c] px-2 py-1 ${
        isOn ? '' : 'opacity-50'
      } ${isLabelCentered && 'justify-center'}`}
    >
      <span
        className={`h-3 w-3 rounded-full ${
          isOn ? 'bg-[#39ff14] shadow-[0_0_5px_#39ff14]' : 'bg-[#ff0055]'
        }`}
      />
      <span className={`retro-text-shadow ${isOn ? 'text-white' : 'text-[#a0b0ff]'}`}>{label}</span>
    </div>
  );
}
