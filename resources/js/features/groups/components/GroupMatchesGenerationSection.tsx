import {
  RetroButton,
  RetroTable,
  RetroTableCell,
  RetroTableHeaderCell,
  RetroTableHeaderRow,
  RetroTableRow,
} from '@/Components/retro';
import { FormEvent, useState } from 'react';
import { Match } from '@/types';
import { formatDatePtBr, formatDateTimePtBr, getBrazilYearMonthKey } from '@/utils/datetime';

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
  onCreateMatch: (e: FormEvent) => void;
  onSaveEditedMatch: (e: FormEvent) => void;
  onStartEditMatch: (match: Match) => void;
  onCancelEditMatch: () => void;
  onDeleteMatch: (match: Match) => void;
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
  onCreateMatch,
  onSaveEditedMatch,
  onStartEditMatch,
  onCancelEditMatch,
  onDeleteMatch,
}: GroupMatchesGenerationSectionProps) {
  const [customMonths, setCustomMonths] = useState(3);
  const presets = [3, 6, 12];
  const { currentMonthDates, nextUpcomingId } = getCurrentMonthMatchDates(matches);

  return (
    <div className="flex flex-col gap-2">
      <p className="retro-text-shadow text-sm text-[#a0b0ff]">
        ESCOLHA O PERIODO PARA GERAR AS DATAS DAS PARTIDAS.
      </p>
      <DatesRow
        dates={currentMonthDates}
        nextUpcomingId={nextUpcomingId}
        onOpenMatchPresence={onOpenMatchPresence}
      />

      <div className="grid grid-cols-3 gap-2">
        <RetroButton
          size="sm"
          type="button"
          variant="neutral"
          disabled={generateProcessing}
          onClick={onGenerateCurrentMonth}
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
            onClick={() => onGenerateForMonths(months)}
          >
            {months} MESES
          </RetroButton>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="generate_matches_months"
          className="retro-text-shadow text-xs uppercase tracking-wider text-[#a0b0ff]"
        >
          PERSONALIZADO
        </label>
        <input
          id="generate_matches_months"
          type="number"
          min={1}
          max={12}
          value={customMonths}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (Number.isNaN(parsed)) return;
            const normalized = Math.max(1, Math.min(12, Math.trunc(parsed)));
            setCustomMonths(normalized);
          }}
          className="retro-input w-20 border-2 border-[#4060c0] bg-[#0b1340] px-2 py-1 text-center text-[#ffd700] outline-none"
        />
        <RetroButton
          size="sm"
          type="button"
          variant="neutral"
          disabled={generateProcessing}
          onClick={() => onGenerateForMonths(customMonths)}
        >
          GERAR
        </RetroButton>
      </div>

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
              DURAÇÃO (MIN)
            </label>
            <input
              id="match_duration_minutes"
              type="number"
              min={1}
              value={form.values.duration_minutes}
              onChange={(e) => form.onChange('duration_minutes', e.target.value)}
              disabled={form.processing}
              className="retro-input border-2 border-[#4060c0] bg-[#0b1340] px-2 py-2 text-[#ffd700] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="retro-text-shadow text-xs text-[#a0b0ff]" htmlFor="match_status">
              STATUS
            </label>
            <select
              id="match_status"
              value={form.values.status}
              onChange={(e) =>
                form.onChange('status', e.target.value as 'scheduled' | 'cancelled' | 'finished')
              }
              disabled={form.processing}
              className="retro-input border-2 border-[#4060c0] bg-[#0b1340] px-2 py-2 text-[#ffd700] outline-none"
            >
              <option value="scheduled">AGENDADA</option>
              <option value="cancelled">CANCELADA</option>
              <option value="finished">FINALIZADA</option>
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
                      <RetroButton
                        type="button"
                        size="sm"
                        variant="neutral"
                        onClick={() => onOpenMatchPresence(match.id)}
                      >
                        PRESENÇA
                      </RetroButton>
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
                        onClick={() => onDeleteMatch(match)}
                        disabled={deleteProcessingId === match.id}
                      >
                        {deleteProcessingId === match.id ? 'REMOVENDO...' : 'REMOVER'}
                      </RetroButton>
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
    </div>
  );
}

interface MatchDateItem {
  id: number;
  date: Date;
  label: string;
}

function getCurrentMonthMatchDates(matches: Match[]): {
  currentMonthDates: MatchDateItem[];
  nextUpcomingId: number | null;
} {
  const now = new Date();
  const currentYearMonthKey = getBrazilYearMonthKey(now);

  const dates: MatchDateItem[] = matches
    .map((match) => {
      const date = new Date(match.scheduled_at);
      return { id: match.id, date, label: formatDatePtBr(match.scheduled_at) };
    })
    .filter((item) => getBrazilYearMonthKey(item.date) === currentYearMonthKey)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let nextUpcomingId: number | null = null;
  for (const item of dates) {
    if (item.date.getTime() >= now.getTime()) {
      nextUpcomingId = item.id;
      break;
    }
  }

  return { currentMonthDates: dates, nextUpcomingId };
}

interface DatesRowProps {
  dates: MatchDateItem[];
  nextUpcomingId: number | null;
  onOpenMatchPresence: (matchId: number) => void;
}

function DatesRow({ dates, nextUpcomingId, onOpenMatchPresence }: DatesRowProps) {
  if (dates.length === 0) {
    return (
      <p className="retro-text-shadow text-sm text-[#e5e7eb]">DATAS: Nenhuma partida neste mês</p>
    );
  }

  return (
    <div className="flex flex-col gap-1 pt-1">
      <span className="retro-text-shadow text-base text-[#a0b0ff]">DATAS:</span>
      <div className="retro-drop-shadow flex items-stretch border-2 border-[#4060c0] bg-[#1e348c]">
        <div className="flex flex-1 divide-x-2 divide-[#4060c0]">
          {dates.map((item) => {
            const isNext = item.id === nextUpcomingId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={isNext ? () => onOpenMatchPresence(item.id) : undefined}
                disabled={!isNext}
                className={
                  isNext
                    ? 'z-10 -mx-[1px] -my-[1px] flex flex-1 items-center justify-center border-2 border-[#39ff14] bg-[#2540a0] text-sm text-[#ffd700] shadow-[0_0_4px_#39ff14] cursor-pointer hover:brightness-110'
                    : 'flex flex-1 items-center justify-center text-sm text-[#e5e7eb] cursor-default'
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function toStatusLabel(status: string): string {
  if (status === 'cancelled') return 'CANCELADA';
  if (status === 'finished') return 'FINALIZADA';
  return 'AGENDADA';
}
