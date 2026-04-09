import { getWeekdayLabelFromIndex } from '@/utils/datetime';

interface InviteGroupSummaryProps {
  name: string;
  weekday: number | null;
  time: string | null;
  locationName: string;
}

export function InviteGroupSummary({ name, weekday, time, locationName }: InviteGroupSummaryProps) {
  const weekdayLabel = weekday !== null ? getWeekdayLabelFromIndex(weekday) ?? weekday : '-';
  return (
    <div className="flex flex-col gap-1">
      <h2 className="retro-text-shadow text-lg tracking-wider text-[#ffd700]">{name}</h2>
      <p className="retro-text-shadow text-sm text-[#e5e7eb]">
        {weekdayLabel} às {time ?? '-'} — {locationName}
      </p>
      <hr className="mt-1 border-[#4060c0]" />
    </div>
  );
}
