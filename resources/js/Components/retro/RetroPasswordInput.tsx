import { InputHTMLAttributes } from 'react';

interface RetroPasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type'
> {
  label: string;
}

export function RetroPasswordInput({ label, ...props }: RetroPasswordInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="retro-text-shadow text-base text-[#a0b0ff]">{label}</label>
      <div className="retro-inset-shadow flex items-center gap-2 border-2 border-[#4060c0] bg-[#0b1340] p-1">
        <input
          type="password"
          {...props}
          className="flex-1 bg-transparent font-retro text-xl tracking-widest text-[#ffd700] outline-none"
        />
        <span className="text-lg text-[#ff0055]">🔒</span>
      </div>
    </div>
  );
}
