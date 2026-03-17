import { Link } from '@inertiajs/react';
import { Group } from '@/types';
import {
  RetroTable,
  RetroTableHeaderCell,
  RetroTableHeaderRow,
  RetroTableRow,
  RetroTableCell,
} from '@/Components/retro';

interface GroupsTableProps {
  groups: Group[];
  selectedIds: Set<number>;
  onToggleSelected: (id: number) => void;
}

export function GroupsTable({ groups, selectedIds, onToggleSelected }: GroupsTableProps) {
  return (
    <RetroTable>
      <thead>
        <RetroTableHeaderRow>
          <RetroTableHeaderCell>Selecionar</RetroTableHeaderCell>
          <RetroTableHeaderCell>Nome</RetroTableHeaderCell>
          <RetroTableHeaderCell>Dia</RetroTableHeaderCell>
          <RetroTableHeaderCell>Horário</RetroTableHeaderCell>
          <RetroTableHeaderCell>Local</RetroTableHeaderCell>
          <RetroTableHeaderCell>Ações</RetroTableHeaderCell>
        </RetroTableHeaderRow>
      </thead>
      <tbody>
        {groups.map((group, index) => (
          <RetroTableRow key={group.id} index={index}>
            <RetroTableCell>
              <input
                type="checkbox"
                checked={selectedIds.has(group.id)}
                onChange={() => onToggleSelected(group.id)}
              />
            </RetroTableCell>
            <RetroTableCell variant="strong">{group.name}</RetroTableCell>
            <RetroTableCell variant="muted">{group.weekday}</RetroTableCell>
            <RetroTableCell variant="muted">{group.time}</RetroTableCell>
            <RetroTableCell variant="soft">{group.location_name}</RetroTableCell>
            <RetroTableCell className="flex gap-2">
              <Link href={`/groups/${group.id}`} className="text-[#39ff14] hover:underline underline-offset-2 px-4">
                Ver
              </Link>{' '}
              <Link href={`/groups/${group.id}/edit`} className="text-[#ffd700] hover:underline underline-offset-2 px-4">
                Editar
              </Link>
            </RetroTableCell>
          </RetroTableRow>
        ))}
      </tbody>
    </RetroTable>
  );
}
