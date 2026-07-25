/* global route */
import { useState } from 'react';
import { Group, Match } from '@/types';
import { GroupInviteSection } from '@/features/groups/components/GroupInviteSection';
import { RetroIconTextButton, RetroModal } from '@/Components/retro';
import { formatDateTimePtBr, getWeekdayLabel } from '@/utils/datetime';
import { getRecurrenceLabel, RecurrenceValue, resolveGroupSettings } from '@/utils/groups';

interface GroupDetailsSectionProps {
  group: Group;
  nextMatch: Match | null;
  canManageGroup?: boolean;
  canManageInvites?: boolean;
  inviteUrl?: string | null;
  inviteProcessing?: boolean;
  onGenerateInvite?: () => void;
  deleteProcessing?: boolean;
  onDeleteGroup?: () => void;
}

export function GroupDetailsSection({
  group,
  nextMatch,
  canManageGroup = false,
  canManageInvites = false,
  inviteUrl = null,
  inviteProcessing = false,
  onGenerateInvite = () => {},
  deleteProcessing = false,
  onDeleteGroup = () => {},
}: GroupDetailsSectionProps) {
  const settings = resolveGroupSettings(group);
  const weekdayLabel =
    getWeekdayLabel(settings.default_weekday ?? null) ?? settings.default_weekday ?? null;
  const recurrenceLabel = getRecurrenceLabel(settings.recurrence as RecurrenceValue);
  const nextMatchLabel = formatNextMatch(nextMatch);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleConfirmDelete = () => {
    onDeleteGroup();
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b-2 border-[#4060c0] pb-1">
        <span className="retro-text-shadow text-xl tracking-widest text-white">{group.name}</span>
        {canManageGroup ? (
          <div className="flex items-center gap-2">
            <RetroIconTextButton
              icon="⚙"
              label="CONFIGURAR"
              variant="neutral"
              href={route('groups.edit', { group: group.id })}
              ariaLabel="Configurar grupo"
            />
            <RetroIconTextButton
              icon="🗑"
              label="REMOVER"
              variant="danger"
              disabled={deleteProcessing}
              onClick={() => setShowDeleteModal(true)}
              ariaLabel="Remover grupo"
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 pt-1">
        <Row label="DIA" value={weekdayLabel} />
        <Row label="HORÁRIO" value={settings.default_time ?? null} />
        <Row label="LOCAL" value={group.location_name} />
        <Row label="RECORRÊNCIA" value={recurrenceLabel} />
        <Row label="PRÓXIMA PARTIDA" value={nextMatchLabel} />
      </div>

      {canManageInvites ? (
        <div className="flex flex-col gap-3 border-t-2 border-[#4060c0] pt-3">
          <GroupInviteSection
            inviteUrl={inviteUrl}
            processing={inviteProcessing}
            onGenerateInvite={onGenerateInvite}
          />
        </div>
      ) : null}

      <RetroModal
        open={showDeleteModal}
        title="REMOVER GRUPO"
        message={
          <span>Tem certeza que deseja remover este grupo? Essa ação não pode ser desfeita.</span>
        }
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        confirmText="SIM, REMOVER"
        cancelText="NÃO"
        processing={deleteProcessing}
      />
    </>
  );
}

interface RowProps {
  label: string;
  value: string | number | null;
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="retro-text-shadow text-base text-[#a0b0ff]">{label}:</span>
      <span className="retro-text-shadow text-base text-white">{value ?? '-'}</span>
    </div>
  );
}

function formatNextMatch(match: Match | null): string {
  if (!match) return 'Nenhuma partida agendada';
  return formatDateTimePtBr(match.scheduled_at);
}
