import { PropsWithChildren } from 'react';

export function RetroInfoCard({ children }: PropsWithChildren) {
  return (
    <div className="relative overflow-hidden bg-[#1e348c] retro-border-panel p-2">
      <div
        className="absolute inset-0 bg-[#101c54] opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
        }}
      />
      <div className="relative z-10 flex flex-col gap-3 text-sm sm:text-base">{children}</div>
    </div>
  );
}

