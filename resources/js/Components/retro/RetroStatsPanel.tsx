import { PropsWithChildren } from 'react';

interface RetroStatsPanelProps extends PropsWithChildren {
  title?: string;
}

export function RetroStatsPanel({ title, children }: RetroStatsPanelProps) {
  return (
    <div
      data-component="retro-stats-panel"
      className="retro-bg-metallic retro-border-emboss p-2 shadow-[2px_2px_10px_rgba(0,0,0,0.8)]"
    >
      <div className="retro-border-inset relative flex flex-col gap-2 bg-[#0b1340] p-2">
        {title && (
          <div className="retro-text-shadow absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-x border-[#4060c0] bg-[#0b1340] px-2 text-sm text-[#a0b0ff]">
            {title}
          </div>
        )}
        <div className="mt-2 flex flex-col gap-1.5">{children}</div>
      </div>
    </div>
  );
}
