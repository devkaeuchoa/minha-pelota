import { PropsWithChildren } from 'react';

type PlayerVariant = 'available' | 'group';

interface RetroPlayerListProps {
  title: string;
  players: { id: number; name: string; nick?: string | null }[];
  selectedId?: number | null;
  selectedIds?: number[];
  onSelect?: (id: number) => void;
  onToggle?: (id: number) => void;
  variant?: PlayerVariant;
}

export function RetroPlayerList({
  title,
  players,
  selectedId,
  selectedIds,
  onSelect,
  onToggle,
  variant = 'available',
}: RetroPlayerListProps) {
  return (
    <RetroPlayerListShell title={title}>
      <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
        {players.map((player) => (
          <RetroPlayerListItem
            key={player.id}
            name={player.name}
            nick={player.nick}
            active={
              selectedIds ? selectedIds.includes(player.id) : player.id === selectedId
            }
            variant={variant}
            onClick={() => {
              if (onToggle) {
                onToggle(player.id);
              } else {
                onSelect?.(player.id);
              }
            }}
          />
        ))}
        {players.length === 0 && (
          <p className="retro-text-shadow text-xs text-[#a0b0ff]">NENHUM JOGADOR</p>
        )}
      </div>
    </RetroPlayerListShell>
  );
}

interface RetroPlayerListShellProps extends PropsWithChildren {
  title: string;
}

function RetroPlayerListShell({ title, children }: RetroPlayerListShellProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#1e348c] retro-border-panel p-2">
      <div
        className="absolute inset-0 bg-[#101c54] opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
        }}
      />
      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b-2 border-[#4060c0] pb-1">
          <span className="retro-text-shadow text-sm text-[#ffd700]">{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

interface RetroPlayerListItemProps {
  name: string;
  nick?: string | null;
  active?: boolean;
  variant: PlayerVariant;
  onClick?: () => void;
}

function RetroPlayerListItem({ name, nick, active, variant, onClick }: RetroPlayerListItemProps) {
  const baseColor = variant === 'available' ? 'text-[#39ff14]' : 'text-[#ffd700]';

  if (active) {
    return (
      <div className="relative flex w-full items-center">
        <button
          type="button"
          onClick={onClick}
          className="retro-text-shadow retro-border-highlight flex w-full items-center gap-2 bg-[#1e348c] px-2 py-1 text-left"
        >
          <span className="text-lg">🙂</span>
          <span className="retro-text-shadow left-1 text-lg text-[#ffd700]">▶</span>
          <span className={`retro-text-shadow text-base sm:text-lg ${baseColor}`}>
            {nick || name}
          </span>
        </button>
        <span className="retro-text-shadow absolute right-1 text-lg text-[#ffd700]">◀</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 border border-[#4060c0] bg-transparent px-2 py-1 text-left hover:bg-[#2540a0]"
    >
      <span className="text-lg">🙂</span>
      <span className={`retro-text-shadow text-base sm:text-lg ${baseColor}`}>{nick || name}</span>
    </button>
  );
}
