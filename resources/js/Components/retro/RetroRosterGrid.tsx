import { Player } from '@/types';

interface RetroRosterGridProps {
  players: Player[];
}

export function RetroRosterGrid({ players }: RetroRosterGridProps) {
  if (!players.length) {
    return null;
  }

  const manyPlayers = players.length > 20;
  const nameClass = manyPlayers ? 'text-base tracking-wide' : 'text-xl tracking-wider';
  const faceSize = manyPlayers ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="border-panel-blue bg-[#0b1340] w-full">
      <div className="flex max-h-[360px] flex-col flex-wrap content-start gap-y-1 gap-x-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex h-8 w-full items-center gap-3 border-y-2 border-l-2 border-r-2 border-[#334155] border-b-black bg-[#020617] px-2"
          >
            <div
              className={`${faceSize} rounded-full border border-black bg-[#facc15] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3)] flex items-center justify-center`}
            >
              <span className={manyPlayers ? 'text-xs' : 'text-sm'}>🙂</span>
            </div>
            <span className={`retro-text-shadow text-[#ffd700] uppercase truncate ${nameClass}`}>
              {player.nick || player.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
