import { ReactNode } from 'react';

interface RetroTeamCardProps {
  teamName: string;
  playerLabel: string;
  formationLabel: string;
  formation: string;
  flag?: ReactNode;
}

export function RetroTeamCard({
  teamName,
  playerLabel,
  formationLabel,
  formation,
  flag,
}: RetroTeamCardProps) {
  return (
    <div
      data-component="retro-team-card"
      className="retro-border-panel relative overflow-hidden bg-[#1e348c] p-2"
    >
      <div
        className="absolute inset-0 bg-[#101c54] opacity-50"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b-2 border-[#4060c0] pb-1">
          <div className="flex items-center gap-2">
            {flag ?? <DefaultFlag />}
            <span className="retro-text-shadow text-2xl tracking-widest text-white">
              {teamName}
            </span>
          </div>
          <span className="retro-text-shadow text-xl text-[#ffd700]">{playerLabel}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="retro-text-shadow text-[#a0b0ff]">{formationLabel}</span>
          <span className="retro-text-shadow text-xl text-white">{formation}</span>
        </div>
      </div>
    </div>
  );
}

function DefaultFlag() {
  return (
    <div className="relative flex h-7 w-10 overflow-hidden border-2 border-[#a0b0ff] bg-white shadow-[1px_1px_0_#000]">
      <div className="absolute inset-y-0 left-1/2 -ml-[3px] w-1.5 bg-red-600" />
      <div className="absolute inset-x-0 top-1/2 -mt-[3px] h-1.5 bg-red-600" />
    </div>
  );
}
