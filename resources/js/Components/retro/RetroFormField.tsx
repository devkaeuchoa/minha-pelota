import { PropsWithChildren } from 'react';

interface RetroFormFieldProps extends PropsWithChildren {
  label: string;
}

export function RetroFormField({ label, children }: RetroFormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="retro-text-shadow text-sm text-[#a0b0ff]">{label}</label>
      {children}
    </div>
  );
}
