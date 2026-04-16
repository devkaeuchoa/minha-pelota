import {
  RetroButton,
  RetroModal,
  RetroTable,
  RetroTableCell,
  RetroTableHeaderCell,
  RetroTableHeaderRow,
  RetroTableRow,
} from '@/Components/retro';
import { FormEvent, useState } from 'react';
import { Match } from '@/types';
import { formatDateTimePtBr } from '@/utils/datetime';

type PendingGenerate = { kind: 'current-month' } | { kind: 'months'; months: number };

interface GroupMatchesGenerationSectionProps {
  matches: Match[];
  generateProcessing: boolean;
  form: {
    values: {
      id: number | null;
      scheduled_at: string;
      location_name: string;
      duration_minutes: string;
      status: 'scheduled' | 'cancelled' | 'finished';
    };
    errors: Partial<
      Record<'scheduled_at' | 'location_name' | 'duration_minutes' | 'status', string>
    >;
    processing: boolean;
    onChange: (
      field: 'id' | 'scheduled_at' | 'location_name' | 'duration_minutes' | 'status',
      value: string | number | null,
    ) => void;
  };
  editingMatchId: number | null;
  deleteProcessingId: number | null;
  onGenerateCurrentMonth: () => void;
  onGenerateForMonths: (months: number) => void;
  onOpenMatchPresence: (matchId: number) => void;
  onOpenMatchPayments: (matchId: number) => void;
  onCreateMatch: (e: FormEvent) => void;
  onSaveEditedMatch: (e: FormEvent) => void;
  onStartEditMatch: (match: Match) => void;
  onCancelEditMatch: () => void;
  onDeleteMatch: (match: Match) => void;
  canManageMatches?: boolean;
  canManageAttendance?: boolean;
  canManagePayments?: boolean;
}

export function GroupMatchesGenerationSection({
  matches,
  generateProcessing,
  form,
  editingMatchId,
  deleteProcessingId,
  onGenerateCurrentMonth,
  onGenerateForMonths,
  onOpenMatchPresence,
  onOpenMatchPayments,
  onCreateMatch,
  onSaveEditedMatch,
  onStartEditMatch,
  onCancelEditMatch,
  onDeleteMatch,
  canManageMatches = true,
  canManageAttendance = true,
  canManagePayments = true,
}: GroupMatchesGenerationSectionProps) {
  const presets = [3, 6, 12];
  const [pendingGenerate, setPendingGenerate] = useState<PendingGenerate | null>(null);
  const [pendingDeleteMatch, setPendingDeleteMatch] = useState<Match | null>(null);

  const handleConfirmGenerate = () => {
    if (!pendingGenerate) return;
    if (pendingGenerate.kind === 'current-month') {
      onGenerateCurrentMonth();
    } else {
      onGenerateForMonths(pendingGenerate.months);
    }
    setPendingGenerate(null);
  };

  const handleConfirmDeleteMatch = () => {
    if (!pendingDeleteMatch) return;
    onDeleteMatch(pendingDeleteMatch);
    setPendingDeleteMatch(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {canManageMatches ? (
        <form
          onSubmit={editingMatchId ? onSaveEditedMatch : onCreateMatch}
          className="mt-2 flex flex-col gap-2 rounded border-2 border-[#4060c0] bg-[#1e348c] p-3"
        >
          <span className="retro-text-shadow text-sm text-[#a0b0ff]">
            {editingMatchId ? 'EDITAR PARTIDA' : 'NOVA PARTIDA'}
          </span>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                className="retro-text-shadow text-xs text-[#a0b0ff]"
                htmlFor="match_scheduled_at"
              >
                DATA E HORA
              </label>
              <input
                id="match_scheduled_at"
                type="datetime-local"
                value={form.values.scheduled_at}
                onChange={(e) => form.onChange('scheduled_at', e.target.value)}
                disabled={form.processing}
                className="retro-input border-2 border-[#4060c0] bg-[#0b1340] px-2 py-2 text-[#ffd700] outline-none"
                required
              />
              {form.errors.scheduled_at ? (
                <span className="text-xs text-red-400">{form.errors.scheduled_at}</span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="retro-text-shadow text-xs text-[#a0b0ff]"
                htmlFor="match_location_name"
              >
                LOCAL
              </label>
              <input
                id="match_location_name"
                type="text"
                value={form.values.location_name}
                onChange={(e) => form.onChange('location_name', e.target.value)}
                disabled={form.processing}
                className="retro-input border-2 border-[#4060c0] bg-[#0b1340] px-2 py-2 text-[#ffd700] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="retro-text-shadow text-xs text-[#a0b0ff]"
                htmlFor="match_duration_minutes"
              >
                DURAÇÃO
              </label>
              <select
                id="match_duration_minutes"
                value={form.values.duration_minutes}
                onChange={(e) => form.onChange('duration_minutes', e.target.value)}
                disabled={form.processing}
                className="retro-input border-2 border-[#4060c0] bg-[#0b1340] px-2 py-2 text-[#ffd700] outline-none"
              >
                <option value="">—</option>
                {getDurationMinutesOptions(form.values.duration_minutes).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <RetroButton type="submit" size="sm" variant="success" disabled={form.processing}>
              {editingMatchId ? 'SALVAR' : 'CRIAR PARTIDA'}
            </RetroButton>
            {editingMatchId ? (
              <RetroButton
                type="button"
                size="sm"
                variant="neutral"
                onClick={onCancelEditMatch}
                disabled={form.processing}
              >
                CANCELAR EDIÇÃO
              </RetroButton>
            ) : null}
          </div>
        </form>
      ) : null}

      {canManageMatches ? (
        <p className="retro-text-shadow text-sm text-[#a0b0ff]">
          OU ESCOLHA O PERIODO PARA GERAR AS DATAS DAS PARTIDAS.
        </p>
      ) : null}

      {canManageMatches ? (
        <div className="grid grid-cols-3 gap-2">
          <RetroButton
            size="sm"
            type="button"
            variant="neutral"
            disabled={generateProcessing}
            onClick={() => setPendingGenerate({ kind: 'current-month' })}
          >
            MÊS ATUAL
          </RetroButton>
          {presets.map((months) => (
            <RetroButton
              key={months}
              size="sm"
              type="button"
              variant="neutral"
              disabled={generateProcessing}
              onClick={() => setPendingGenerate({ kind: 'months', months })}
            >
              {months} MESES
            </RetroButton>
          ))}
        </div>
      ) : null}

      <div className="mt-2">
        <span className="retro-text-shadow text-base text-[#a0b0ff]">TODAS AS PARTIDAS</span>
        <RetroTable>
          <thead>
            <RetroTableHeaderRow>
              <RetroTableHeaderCell>DATA/HORA</RetroTableHeaderCell>
              <RetroTableHeaderCell>LOCAL</RetroTableHeaderCell>
              <RetroTableHeaderCell>STATUS</RetroTableHeaderCell>
              <RetroTableHeaderCell>AÇÕES</RetroTableHeaderCell>
            </RetroTableHeaderRow>
          </thead>
          <tbody>
            {matches.length > 0 ? (
              matches.map((match, index) => (
                <RetroTableRow key={match.id} index={index}>
                  <RetroTableCell>{formatDateTimePtBr(match.scheduled_at)}</RetroTableCell>
                  <RetroTableCell>{match.location_name ?? '-'}</RetroTableCell>
                  <RetroTableCell>{toStatusLabel(match.status)}</RetroTableCell>
                  <RetroTableCell className="align-middle">
                    <div className="flex flex-wrap gap-2">
                      {canManageAttendance ? (
                        <RetroButton
                          type="button"
                          size="sm"
                          variant="neutral"
                          onClick={() => onOpenMatchPresence(match.id)}
                        >
                          PRESENÇA
                        </RetroButton>
                      ) : null}
                      {canManagePayments ? (
                        <RetroButton
                          type="button"
                          size="sm"
                          variant="neutral"
                          onClick={() => onOpenMatchPayments(match.id)}
                        >
                          PAGAMENTOS
                        </RetroButton>
                      ) : null}
                      {canManageMatches ? (
                        <>
                          <RetroButton
                            type="button"
                            size="sm"
                            variant="neutral"
                            onClick={() => onStartEditMatch(match)}
                          >
                            EDITAR
                          </RetroButton>
                          <RetroButton
                            type="button"
                            size="sm"
                            variant="danger"
                            onClick={() => setPendingDeleteMatch(match)}
                            disabled={deleteProcessingId === match.id}
                          >
                            {deleteProcessingId === match.id ? 'REMOVENDO...' : 'REMOVER'}
                          </RetroButton>
                        </>
                      ) : null}
                    </div>
                  </RetroTableCell>
                </RetroTableRow>
              ))
            ) : (
              <RetroTableRow>
                <td
                  className="border border-[#4060c0] px-3 py-2 text-center text-[#a0b0ff]"
                  colSpan={4}
                >
                  Nenhuma partida cadastrada.
                </td>
              </RetroTableRow>
            )}
          </tbody>
        </RetroTable>
      </div>

      <RetroModal
        open={pendingGenerate !== null}
        title="CONFIRMAR GERAÇÃO"
        message={
          <span>
            {pendingGenerate?.kind === 'current-month'
              ? 'Deseja gerar as partidas para o mês atual? Partidas já existentes neste período podem ser mantidas ou recriadas conforme a lógica do sistema.'
              : pendingGenerate
                ? `Deseja gerar as partidas para os próximos ${pendingGenerate.months} ${
                    pendingGenerate.months === 1 ? 'mês' : 'meses'
                  }?`
                : ''}
          </span>
        }
        onCancel={() => setPendingGenerate(null)}
        onConfirm={handleConfirmGenerate}
        confirmText="SIM, GERAR"
        cancelText="NÃO"
        processing={generateProcessing}
        confirmVariant="success"
      />

      <RetroModal
        open={pendingDeleteMatch !== null}
        title="REMOVER PARTIDA"
        message={
          <span>
            Tem certeza que deseja remover a partida de{' '}
            {pendingDeleteMatch ? formatDateTimePtBr(pendingDeleteMatch.scheduled_at) : ''}? Essa
            ação não pode ser desfeita.
          </span>
        }
        onCancel={() => setPendingDeleteMatch(null)}
        onConfirm={handleConfirmDeleteMatch}
        confirmText="SIM, REMOVER"
        cancelText="NÃO"
        processing={pendingDeleteMatch !== null && deleteProcessingId === pendingDeleteMatch.id}
      />
    </div>
  );
}

function toStatusLabel(status: string): string {
  if (status === 'cancelled') return 'CANCELADA';
  if (status === 'finished') return 'FINALIZADA';
  return 'AGENDADA';
}

interface DurationOption {
  value: string;
  label: string;
}

function getDurationMinutesOptions(currentValue: string): DurationOption[] {
  const presets: number[] = [];
  for (let minutes = 30; minutes <= 180; minutes += 15) {
    presets.push(minutes);
  }

  const options: DurationOption[] = presets.map((minutes) => ({
    value: String(minutes),
    label: formatDurationLabel(minutes),
  }));

  const currentParsed = Number(currentValue);
  if (
    currentValue !== '' &&
    Number.isFinite(currentParsed) &&
    currentParsed > 0 &&
    !presets.includes(currentParsed)
  ) {
    options.push({
      value: String(currentParsed),
      label: formatDurationLabel(currentParsed),
    });
    options.sort((a, b) => Number(a.value) - Number(b.value));
  }

  return options;
}

function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours}h`;
  return `${hours}h${String(rest).padStart(2, '0')}`;
}
