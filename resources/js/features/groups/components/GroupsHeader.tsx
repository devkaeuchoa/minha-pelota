import { Link } from '@inertiajs/react';
import {
  RetroButton,
  RetroInlineInfo,
  RetroStatusPill,
  RetroValueDisplay,
} from '@/Components/retro';

interface GroupsHeaderProps {
  processing: boolean;
  hasSelection: boolean;
  total: number;
  selectedCount: number;
}

export function GroupsHeader({
  processing,
  hasSelection,
  total,
  selectedCount,
}: GroupsHeaderProps) {
  const statusLabel = 'SELEÇÃO';
  const status = hasSelection ? 'on' : 'off';
  const totalLabel = total.toString();
  const selectedLabel = selectedCount.toString();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between align-items-end">
        <RetroStatusPill status={status} label={statusLabel} />

        <div className="flex justify-end gap-5">
          <RetroValueDisplay label="GRUPOS" value={totalLabel} />
          <RetroValueDisplay label="SELECIONADOS" value={selectedLabel} />
        </div>
      </div>

      <RetroInlineInfo message="GERENCIE SEUS GRUPOS E PARTIDAS." />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-1 justify-end gap-3">
          <RetroButton
            size="sm"
            className="flex-1"
            type="submit"
            variant="danger"
            disabled={!hasSelection || processing}
          >
            REMOVER SELECIONADOS
          </RetroButton>
          <Link href="/groups/create" className="flex-1">
            <RetroButton size="sm" type="button" variant="success">
              NOVO GRUPO
            </RetroButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
