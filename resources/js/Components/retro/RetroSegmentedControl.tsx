interface Option {
  id: string;
  label: string;
}

interface RetroSegmentedControlProps {
  label: string;
  options: Option[];
  activeId: string;
  onChange?: (id: string) => void;
}

export function RetroSegmentedControl({
  label,
  options,
  activeId,
  onChange,
}: RetroSegmentedControlProps) {
  return (
    <div className="retro-drop-shadow flex h-8 items-stretch border-2 border-[#4060c0] bg-[#1e348c]">
      <div className="flex items-center border-r-2 border-[#4060c0] bg-[#101c54] px-2">
        <span className="retro-text-shadow text-lg text-[#a0b0ff]">{label}</span>
      </div>
      <div className="flex flex-1">
        {options.map((option) => {
          const isActive = option.id === activeId;
          return (
            <button
              key={option.id}
              onClick={() => onChange?.(option.id)}
              className={
                isActive
                  ? 'retro-text-shadow z-10 -m-[2px] flex-1 border-2 border-white bg-[#2540a0] text-lg text-white'
                  : 'flex-1 bg-transparent text-lg text-[#6070a0] transition-colors hover:text-white'
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
