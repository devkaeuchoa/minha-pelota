import { PropsWithChildren } from 'react';

export function RetroPanel({ children }: PropsWithChildren) {
  return (
    <div
      data-component="retro-panel"
      className="retro-border-panel flex flex-col gap-3 bg-[#0b1340] p-2"
    >
      {children}
    </div>
  );
}
