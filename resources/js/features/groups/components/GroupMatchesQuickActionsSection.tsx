import { RetroButton } from '@/Components/retro';
import { useState } from 'react';
import { Match } from '@/types';
import { formatDatePtBr, getBrazilYearMonthKey } from '@/utils/datetime';

interface GroupMatchesQuickActionsSectionProps {
  matches: Match[];
  generateProcessing: boolean;
  onGenerateCurrentMonth: () => void;
  onGenerateForMonths: (months: number) => void;
  onOpenMatchPresence: (matchId: number) => void;
  onOpenDatesPage: () => void;
}

export function GroupMatchesQuickActionsSection({
  matches,
  generateProcessing,
  onGenerateCurrentMonth,
  onGenerateForMonths,
  onOpenMatchPresence,
  onOpenDatesPage,
}: GroupMatchesQuickActionsSectionProps) {
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

      <RetroButton type="button" size="sm" variant="success" onClick={onOpenDatesPage}>
        ABRIR TELA DE DATAS
      </RetroButton>
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
