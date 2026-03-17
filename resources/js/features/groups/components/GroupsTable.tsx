import { Link } from '@inertiajs/react';
import { Group } from '@/types';

interface GroupsTableProps {
  groups: Group[];
  selectedIds: Set<number>;
  onToggleSelected: (id: number) => void;
}

export function GroupsTable({ groups, selectedIds, onToggleSelected }: GroupsTableProps) {
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>Selecionar</th>
            <th>Nome</th>
            <th>Dia</th>
            <th>Horário</th>
            <th>Local</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(group.id)}
                  onChange={() => onToggleSelected(group.id)}
                />
              </td>
              <td>{group.name}</td>
              <td>{group.weekday}</td>
              <td>{group.time}</td>
              <td>{group.location_name}</td>
              <td>
                <Link href={`/groups/${group.id}`}>Ver</Link>{' '}
                <Link href={`/groups/${group.id}/edit`}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
