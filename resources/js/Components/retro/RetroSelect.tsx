import { SelectHTMLAttributes } from 'react';

interface RetroSelectOption {
  value: string;
  label: string;
}

interface RetroSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string;
  options: RetroSelectOption[];
}

export function RetroSelect({ label, options, ...props }: RetroSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="retro-text-shadow text-sm text-[#a0b0ff]">{label}</label>
      <div className="relative">
        <select
          {...props}
          className="retro-text-shadow retro-drop-shadow w-full cursor-pointer appearance-none border-2 border-[#4060c0] bg-[#1e348c] px-3 py-2 font-retro text-xl text-white outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1e348c]">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#ffd700]">
          ▼
        </span>
      </div>
    </div>
  );
}
