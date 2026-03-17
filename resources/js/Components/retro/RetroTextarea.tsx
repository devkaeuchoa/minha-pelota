import { TextareaHTMLAttributes } from 'react';

interface RetroTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
> {
  label: string;
}

export function RetroTextarea({ label, ...props }: RetroTextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="retro-text-shadow text-base text-[#a0b0ff]">{label}</label>
      <div className="retro-inset-shadow flex border-2 border-[#4060c0] bg-[#0b1340] p-2">
        <textarea
          {...props}
          className="w-full resize-none bg-transparent font-retro text-lg tracking-wide text-[#ffd700] outline-none placeholder:text-[#4060a0]"
        />
      </div>
    </div>
  );
}
