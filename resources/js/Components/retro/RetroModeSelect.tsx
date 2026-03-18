import { ReactNode } from 'react';

interface Mode {
  id: string;
  label: string;
}

interface RetroModeSelectProps {
  title?: string;
  modes: Mode[];
  activeId: string;
  onChange?: (id: string) => void;
}

export function RetroModeSelect({ title, modes, activeId, onChange }: RetroModeSelectProps) {
  return (
    <div
      data-component="retro-mode-select"
      className="retro-border-panel flex flex-col gap-1.5 bg-[#0b1340] p-2"
    >
      {title && <ModeSelectTitle>{title}</ModeSelectTitle>}

      {modes.map((mode) => {
        const isActive = mode.id === activeId;

        if (isActive) {
          return (
            <div key={mode.id} className="relative flex w-full items-center">
              <span className="retro-text-shadow absolute left-1 animate-pulse text-2xl text-[#ffd700]">
                ▶
              </span>
              <button
                onClick={() => onChange?.(mode.id)}
                className="retro-text-shadow retro-border-highlight w-full bg-[#1e348c] py-1 text-xl text-[#ffd700]"
              >
                {mode.label}
              </button>
              <span className="retro-text-shadow absolute right-1 animate-pulse text-2xl text-[#ffd700]">
                ◀
              </span>
            </div>
          );
        }

        return (
          <button
            key={mode.id}
            onClick={() => onChange?.(mode.id)}
            className="retro-text-shadow w-full border-2 border-[#4060c0] bg-[#1e348c] py-1 text-xl text-white transition-colors hover:bg-[#2540a0]"
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

function ModeSelectTitle({ children }: { children: ReactNode }) {
  return (
    <div className="retro-bg-metallic retro-border-emboss mb-1 py-1 text-center">
      <span className="retro-text-shadow-light text-xl font-bold italic tracking-widest text-blue-900">
        {children}
      </span>
    </div>
  );
}
