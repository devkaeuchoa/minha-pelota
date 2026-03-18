interface RetroInlineInfoProps {
  icon?: string;
  message: string;
}

export function RetroInlineInfo({ icon = 'ⓘ', message }: RetroInlineInfoProps) {
  return (
    <div
      data-component="retro-inline-info"
      className="flex items-center gap-2 border-2 border-[#404040] bg-[#0a0a0a] p-2"
    >
      <span className="text-xl text-[#39ff14]">{icon}</span>
      <span className="retro-text-shadow text-lg leading-tight text-[#c0c0c0]">{message}</span>
    </div>
  );
}
