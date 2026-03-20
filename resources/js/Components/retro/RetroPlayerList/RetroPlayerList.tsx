import { ReactNode } from 'react';
import styles from './RetroPlayerList.module.css';

type PlayerVariant = 'available' | 'group';

interface RetroPlayerListProps {
  title: string;
  players: {
    id: number;
    name: string;
    nick?: string | null;
    physicalEmoji?: ReactNode;
    presenceLabel?: string;
  }[];
  selectedId?: number | null;
  selectedIds?: number[];
  onSelect?: (id: number) => void;
  onToggle?: (id: number) => void;
  variant?: PlayerVariant;
  highlightSelectedBackground?: boolean;
}

export function RetroPlayerList({
  title,
  players,
  selectedId,
  selectedIds,
  onSelect,
  onToggle,
  variant = 'available',
  highlightSelectedBackground = false,
}: RetroPlayerListProps) {
  return (
    <RetroPlayerListShell title={title}>
      <div className={styles.list}>
        {players.map((player) => (
          <RetroPlayerListItem
            key={player.id}
            name={player.name}
            nick={player.nick}
            physicalEmoji={player.physicalEmoji}
            presenceLabel={player.presenceLabel}
            active={selectedIds ? selectedIds.includes(player.id) : player.id === selectedId}
            variant={variant}
            highlightSelectedBackground={highlightSelectedBackground}
            hideArrows
            onClick={() => {
              if (onToggle) {
                onToggle(player.id);
              } else {
                onSelect?.(player.id);
              }
            }}
          />
        ))}
        {players.length === 0 && <div className={styles.empty}>NENHUM JOGADOR</div>}
      </div>
    </RetroPlayerListShell>
  );
}

interface RetroPlayerListShellProps {
  title: string;
  children: ReactNode;
}

function RetroPlayerListShell({ title, children }: RetroPlayerListShellProps) {
  return (
    <div data-component="retro-player-list" className={styles.shell}>
      <div className={styles.overlay} />
      <div className={styles.inner}>
        <div className={styles.titleBar}>
          <span className={styles.title}>{title}</span>
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
  physicalEmoji?: ReactNode;
  presenceLabel?: string;
  highlightSelectedBackground: boolean;
  hideArrows?: boolean;
  onClick?: () => void;
}

function RetroPlayerListItem({
  name,
  nick,
  active,
  variant,
  physicalEmoji,
  presenceLabel,
  highlightSelectedBackground,
  onClick,
  hideArrows = false,
}: RetroPlayerListItemProps) {
  const labelClass =
    variant === 'available' ? styles.inactiveLabelAvailable : styles.inactiveLabelGroup;

  const activeLabelClass = highlightSelectedBackground
    ? styles.activeLabelHighlight
    : variant === 'available'
      ? styles.activeLabelAvailable
      : styles.activeLabelGroup;

  if (active) {
    const activeButtonClass = highlightSelectedBackground
      ? `${styles.activeButton} ${styles.activeButtonHighlight}`
      : `${styles.activeButton} ${styles.activeButtonDefault}`;

    return (
      <div className={styles.activeWrap}>
        <button type="button" onClick={onClick} className={activeButtonClass}>
          {physicalEmoji ? <span className={styles.emoji}>{physicalEmoji}</span> : null}
          {hideArrows ? null : <span className={styles.arrowForward}>▶</span>}

          <span className={`${styles.activeLabel} ${activeLabelClass}`}>
            <span className={styles.playerInner}>{nick || name}</span>
          </span>
        </button>
        {hideArrows ? null : <span className={styles.arrowBack}>◀</span>}
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className={styles.inactiveButton}>
      {physicalEmoji ? <span className={styles.emoji}>{physicalEmoji}</span> : null}
      <span className={`${styles.inactiveLabel} ${labelClass}`}>
        <span className={styles.playerInner}>{nick || name}</span>
        {presenceLabel ? <span className={styles.presenceLabel}>{presenceLabel}</span> : null}
      </span>
    </button>
  );
}
