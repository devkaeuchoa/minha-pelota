import { InputHTMLAttributes } from 'react';

interface RetroTextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
}

export function RetroTextInput({ label, ...props }: RetroTextInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="retro-text-shadow text-sm text-[#a0b0ff]">{label}</label>
      <div className="retro-inset-shadow flex border-2 border-[#4060c0] bg-[#0b1340] p-1">
        <input
          {...props}
          className="w-full bg-transparent font-retro text-xl tracking-widest text-[#ffd700] outline-none placeholder:text-[#4060a0]"
        />
      </div>
    </div>
  );
}
