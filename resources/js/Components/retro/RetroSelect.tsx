import { SelectHTMLAttributes } from 'react';

interface RetroSelectOption {
  value: string;
  label: string;
}

interface RetroSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  options: RetroSelectOption[];
}

export function RetroSelect({ label, options, id, ...props }: RetroSelectProps) {
  return (
    <div data-component="retro-select" className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="retro-text-shadow text-base text-[#a0b0ff]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          {...props}
          className="retro-text-shadow retro-drop-shadow h-9 w-full cursor-pointer appearance-none border-2 border-[#4060c0] bg-[#1e348c] px-3 font-retro text-xl text-white outline-none"
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
