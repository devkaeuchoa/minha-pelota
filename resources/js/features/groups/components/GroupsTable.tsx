import { Link } from '@inertiajs/react';
import { Group } from '@/types';
import { formatTimeHHMM, getWeekdayLabel } from '@/utils/datetime';
import { resolveGroupPermissions, resolveGroupSettings } from '@/utils/groups';
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
    <div className="overflow-x-auto max-w-full">
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
                {resolveGroupPermissions(group, true).can_manage_group ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(group.id)}
                    onChange={() => onToggleSelected(group.id)}
                  />
                ) : (
                  '-'
                )}
              </RetroTableCell>
              <RetroTableCell variant="strong">{group.name}</RetroTableCell>
              <RetroTableCell variant="muted">
                {getWeekdayLabel(resolveGroupSettings(group).default_weekday) ??
                  resolveGroupSettings(group).default_weekday ??
                  '-'}
              </RetroTableCell>
              <RetroTableCell variant="muted">
                {formatTimeHHMM(resolveGroupSettings(group).default_time)}
              </RetroTableCell>
              <RetroTableCell variant="soft">{group.location_name}</RetroTableCell>
              <RetroTableCell className="flex gap-2">
                <Link
                  href={`/groups/${group.id}`}
                  className="text-[#39ff14] hover:underline underline-offset-2 px-4"
                >
                  Ver
                </Link>{' '}
                {resolveGroupPermissions(group, true).can_manage_group ? (
                  <Link
                    href={`/groups/${group.id}/edit`}
                    className="text-[#ffd700] hover:underline underline-offset-2 px-4"
                  >
                    Editar
                  </Link>
                ) : null}
              </RetroTableCell>
            </RetroTableRow>
          ))}
        </tbody>
      </RetroTable>
    </div>
  );
}
