import { Group } from '@/types';
import { RetroInfoCard } from '@/Components/retro';

interface GroupDetailsSectionProps {
  group: Group;
}

export function GroupDetailsSection({ group }: GroupDetailsSectionProps) {
  return (
    <RetroInfoCard>
      <div className="flex items-center justify-between border-b-2 border-[#4060c0] pb-1">
        <span className="retro-text-shadow text-xl tracking-widest text-white">
          {group.name}
        </span>
      </div>

      <div className="flex flex-col gap-1 pt-1">
        <Row label="DIA" value={group.weekday} />
        <Row label="HORÁRIO" value={group.time} />
        <Row label="LOCAL" value={group.location_name} />
      </div>
    </RetroInfoCard>
  );
}

interface RowProps {
  label: string;
  value: string | number | null;
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="retro-text-shadow text-xs text-[#a0b0ff]">{label}:</span>
      <span className="retro-text-shadow text-sm text-white">{value ?? '-'}</span>
    </div>
  );
}

