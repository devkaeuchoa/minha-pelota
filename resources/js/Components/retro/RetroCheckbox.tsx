interface RetroCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function RetroCheckbox({ label, checked = false, onChange }: RetroCheckboxProps) {
  return (
    <div className="flex items-center gap-3 border-2 border-[#4060c0] bg-[#1e348c] p-2">
      <div
        className={`retro-inset-shadow relative flex h-6 w-6 items-center justify-center border-2 bg-[#0b1340] ${
          checked ? 'border-[#39ff14]' : 'border-[#4060c0]'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className={`h-4 w-4 cursor-pointer appearance-none ${checked ? 'bg-[#39ff14]' : ''}`}
        />
      </div>
      <span className={`retro-text-shadow text-lg ${checked ? 'text-white' : 'text-[#a0b0ff]'}`}>
        {label}
      </span>
    </div>
  );
}
