/* global route */

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
  onBatchDeleteClick?: () => void;
  lastFinishedMatchForPayments?: {
    group_id: number;
    match_id: number;
    scheduled_at: string;
  } | null;
  canManageGroups?: boolean;
  canManagePayments?: boolean;
}

export function GroupsHeader({
  processing,
  hasSelection,
  total,
  selectedCount,
  onBatchDeleteClick,
  lastFinishedMatchForPayments,
  canManageGroups = true,
  canManagePayments = true,
}: GroupsHeaderProps) {
  const statusLabel = 'SELEÇÃO';
  const status = hasSelection ? 'on' : 'off';
  const totalLabel = total.toString();
  const selectedLabel = selectedCount.toString();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex w-full justify-between gap-5 md:w-auto md:justify-start">
          <RetroValueDisplay label="GRUPOS" value={totalLabel} />
          <RetroValueDisplay label="SELECIONADOS" value={selectedLabel} />
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          <RetroStatusPill status={status} label={statusLabel} isLabelCentered />
          {canManageGroups && (
            <>
              <RetroButton
                size="sm"
                className="w-full sm:w-auto"
                type="button"
                variant="danger"
                disabled={!hasSelection || processing}
                onClick={onBatchDeleteClick}
              >
                REMOVER SELECIONADOS
              </RetroButton>
              <Link href={route('groups.create')} className="w-full sm:w-auto">
                <RetroButton size="sm" type="button" variant="success">
                  NOVO GRUPO
                </RetroButton>
              </Link>
            </>
          )}
        </div>
      </div>

      <RetroInlineInfo message="GERENCIE SEUS GRUPOS E PARTIDAS." />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-1 justify-end gap-3">
          {lastFinishedMatchForPayments && canManagePayments ? (
            <Link
              href={route('groups.matches.payments.manage', {
                group: lastFinishedMatchForPayments.group_id,
                match: lastFinishedMatchForPayments.match_id,
              })}
              className="flex-1"
            >
              <RetroButton size="sm" type="button" variant="neutral">
                PAGAMENTOS ÚLTIMA PARTIDA
              </RetroButton>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
