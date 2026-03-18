import { InputHTMLAttributes } from 'react';

interface RetroTextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
}

export function RetroTextInput({ label, id, ...props }: RetroTextInputProps) {
  return (
    <div data-component="retro-text-input" className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="retro-text-shadow text-base text-[#a0b0ff]">
          {label}
        </label>
      )}
      <div className="retro-inset-shadow flex border-2 border-[#4060c0] bg-[#0b1340] p-1">
        <input
          id={id}
          {...props}
          className="retro-input w-full bg-transparent font-retro text-xl tracking-widest text-[#ffd700] outline-none placeholder:text-[#4060a0]"
        />
      </div>
    </div>
  );
}
