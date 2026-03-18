import { getWeekdayLabelFromIndex } from '@/utils/datetime';

interface InviteGroupSummaryProps {
  name: string;
  weekday: number;
  time: string;
  locationName: string;
}

export function InviteGroupSummary({ name, weekday, time, locationName }: InviteGroupSummaryProps) {
  return (
    <>
      <h2>{name}</h2>
      <p>
        {getWeekdayLabelFromIndex(weekday) ?? weekday} às {time} — {locationName}
      </p>
      <hr />
    </>
  );
}
