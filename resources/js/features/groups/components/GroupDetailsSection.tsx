import { Group, Match } from '@/types';
import { getWeekdayLabel } from '@/utils/datetime';
import { getRecurrenceLabel, RecurrenceValue } from '@/utils/groups';

interface GroupDetailsSectionProps {
  group: Group;
  matches: Match[];
}

export function GroupDetailsSection({ group, matches }: GroupDetailsSectionProps) {
  const weekdayLabel = getWeekdayLabel(group.weekday) ?? group.weekday;
  const recurrenceLabel = getRecurrenceLabel(group.recurrence as RecurrenceValue);

  const { currentMonthDates, nextUpcomingId } = getCurrentMonthMatchDates(matches);

  return (
    <>
      <div className="flex items-center justify-between border-b-2 border-[#4060c0] pb-1">
        <span className="retro-text-shadow text-xl tracking-widest text-white">{group.name}</span>
      </div>

      <div className="flex flex-col gap-1 pt-1">
        <Row label="DIA" value={weekdayLabel} />
        <Row label="HORÁRIO" value={group.time} />
        <Row label="LOCAL" value={group.location_name} />
        <Row label="RECORRÊNCIA" value={recurrenceLabel} />
        <DatesRow dates={currentMonthDates} nextUpcomingId={nextUpcomingId} />
      </div>
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
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const formatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });

  const dates: MatchDateItem[] = matches
    .map((match) => {
      const date = new Date(match.scheduled_at);
      return { id: match.id, date, label: formatter.format(date) };
    })
    .filter(
      (item) => item.date.getFullYear() === currentYear && item.date.getMonth() === currentMonth,
    )
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
}

function DatesRow({ dates, nextUpcomingId }: DatesRowProps) {
  if (dates.length === 0) {
    return <Row label="DATAS" value="Nenhuma partida neste mês" />;
  }

  return (
    <div className="flex flex-col gap-1 pt-1">
      <span className="retro-text-shadow text-base text-[#a0b0ff]">DATAS:</span>
      <div className="retro-drop-shadow flex items-stretch border-2 border-[#4060c0] bg-[#1e348c]">
        <div className="flex flex-1 divide-x-2 divide-[#4060c0]">
          {dates.map((item) => {
            const isNext = item.id === nextUpcomingId;
            return (
              <div
                key={item.id}
                className={
                  isNext
                    ? 'z-10 -mx-[1px] -my-[1px] flex flex-1 items-center justify-center border-2 border-[#39ff14] bg-[#2540a0] text-sm text-[#ffd700] shadow-[0_0_4px_#39ff14]'
                    : 'flex flex-1 items-center justify-center text-sm text-[#e5e7eb]'
                }
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
