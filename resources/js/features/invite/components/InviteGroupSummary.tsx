const weekdayLabels = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

interface InviteGroupSummaryProps {
  name: string;
  weekday: number;
  time: string;
  locationName: string;
}

export function InviteGroupSummary({
  name,
  weekday,
  time,
  locationName,
}: InviteGroupSummaryProps) {
  return (
    <>
      <h2>{name}</h2>
      <p>
        {weekdayLabels[weekday]} às {time} — {locationName}
      </p>
      <hr />
    </>
  );
}
