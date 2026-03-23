import { Group, Match } from '@/types';
import { formatDateTimePtBr, getWeekdayLabel } from '@/utils/datetime';
import { getRecurrenceLabel, RecurrenceValue } from '@/utils/groups';

interface GroupDetailsSectionProps {
  group: Group;
  nextMatch: Match | null;
}

export function GroupDetailsSection({ group, nextMatch }: GroupDetailsSectionProps) {
  const weekdayLabel = getWeekdayLabel(group.weekday) ?? group.weekday;
  const recurrenceLabel = getRecurrenceLabel(group.recurrence as RecurrenceValue);
  const nextMatchLabel = formatNextMatch(nextMatch);

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
        <Row label="PRÓXIMA PARTIDA" value={nextMatchLabel} />
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

function formatNextMatch(match: Match | null): string {
  if (!match) return 'Nenhuma partida agendada';
  return formatDateTimePtBr(match.scheduled_at);
}
