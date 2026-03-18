interface Level {
  id: string;
  label: string;
}

interface RetroLevelSelectorProps {
  label: string;
  levels: Level[];
  activeId: string;
  onChange?: (id: string) => void;
}

export function RetroLevelSelector({ label, levels, activeId, onChange }: RetroLevelSelectorProps) {
  return (
    <div
      data-component="retro-level-selector"
      className="retro-drop-shadow flex h-8 items-stretch border-2 border-[#4060c0] bg-[#1e348c]"
    >
      <div className="flex items-center border-r-2 border-[#4060c0] bg-[#101c54] px-2">
        <span className="retro-text-shadow text-lg text-[#a0b0ff]">{label}</span>
      </div>
      <div className="flex flex-1 divide-x-2 divide-[#4060c0]">
        {levels.map((level) => {
          const isActive = level.id === activeId;
          return (
            <button
              type="button"
              key={level.id}
              onClick={() => onChange?.(level.id)}
              className={
                isActive
                  ? 'z-10 -mx-[2px] -my-[2px] flex flex-1 items-center justify-center border-2 border-[#39ff14] bg-[#2540a0] text-sm text-[#ffd700] shadow-[0_0_4px_#39ff14]'
                  : 'flex flex-1 items-center justify-center text-sm text-[#6070a0]'
              }
            >
              {level.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
