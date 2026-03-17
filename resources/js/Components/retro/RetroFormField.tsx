import { PropsWithChildren } from 'react';

interface RetroFormFieldProps extends PropsWithChildren {
  label: string;
  htmlFor?: string;
}

export function RetroFormField({ label, htmlFor, children }: RetroFormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="retro-text-shadow text-base text-[#a0b0ff]">
        {label}
      </label>
      {children}
    </div>
  );
}
