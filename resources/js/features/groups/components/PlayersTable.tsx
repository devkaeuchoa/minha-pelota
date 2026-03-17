import { Player } from '@/types';

interface PlayersTableProps {
  players: Player[];
  onRemovePlayer: (player: Player) => void;
  removeProcessingId: number | null;
}

export function PlayersTable({ players, onRemovePlayer, removeProcessingId }: PlayersTableProps) {
  if (players.length === 0) {
    return <p>Nenhum jogador neste grupo.</p>;
  }

  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Apelido</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.nick}</td>
              <td>{player.phone}</td>
              <td>
                <button
                  type="button"
                  onClick={() => onRemovePlayer(player)}
                  disabled={removeProcessingId === player.id}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
