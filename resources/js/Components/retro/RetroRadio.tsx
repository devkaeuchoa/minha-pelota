interface RadioOption {
  id: string;
  label: string;
}

interface RetroRadioProps {
  label: string;
  options: RadioOption[];
  activeId: string;
  onChange?: (id: string) => void;
}

export function RetroRadio({ label, options, activeId, onChange }: RetroRadioProps) {
  return (
    <div className="flex flex-col gap-2 border-2 border-[#4060c0] bg-[#1a2c7a] p-2">
      <span className="retro-text-shadow text-base text-[#a0b0ff]">{label}</span>
      <div className="flex flex-col gap-1">
        {options.map((option) => {
          const isActive = option.id === activeId;
          return (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2"
              onClick={() => onChange?.(option.id)}
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 bg-[#0b1340] ${
                  isActive ? 'border-[#39ff14]' : 'border-[#4060a0]'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${isActive ? 'bg-[#39ff14]' : 'bg-transparent'}`}
                />
              </div>
              <span
                className={`retro-text-shadow text-lg ${
                  isActive ? 'text-white' : 'text-[#6070a0]'
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
