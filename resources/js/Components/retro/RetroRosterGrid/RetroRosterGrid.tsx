import { Player } from '@/types';
import styles from './RetroRosterGrid.module.css';

interface RetroRosterGridProps {
  players: Player[];
}

export function RetroRosterGrid({ players }: RetroRosterGridProps) {
  if (!players.length) {
    return null;
  }

  const manyPlayers = players.length > 20;

  return (
    <div data-component="retro-roster-grid" className={styles.container}>
      <div className={styles.rosterList}>
        {players.map((player) => (
          <div key={player.id} className={styles.row}>
            <div className={`${styles.face} ${manyPlayers ? styles.faceSmall : styles.faceLarge}`}>
              <span className={manyPlayers ? styles.emojiSmall : styles.emojiLarge}>🙂</span>
            </div>
            <span
              className={`${styles.name} ${
                manyPlayers ? styles.nameManyPlayers : styles.nameFewPlayers
              }`}
            >
              {player.nick || player.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
