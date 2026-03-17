import { InputHTMLAttributes } from 'react';

interface RetroSearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  value: string;
  onChange: (value: string) => void;
}

export function RetroSearchInput({
  value,
  onChange,
  placeholder = 'BUSCAR',
  ...props
}: RetroSearchInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="retro-inset-shadow flex border-2 border-[#4060c0] bg-[#0b1340] p-1">
        <input
          {...props}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-retro text-base tracking-wide text-[#ffd700] outline-none placeholder:text-[#4060a0]"
        />
      </div>
    </div>
  );
}

