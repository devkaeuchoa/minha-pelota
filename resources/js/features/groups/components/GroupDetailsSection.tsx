import { Group } from '@/types';

interface GroupDetailsSectionProps {
  group: Group;
}

export function GroupDetailsSection({ group }: GroupDetailsSectionProps) {
  return (
    <section className="section section--tight">
      <div>
        <p>Dia: {group.weekday}</p>
        <p>Horário: {group.time}</p>
        <p>Local: {group.location_name}</p>
      </div>
    </section>
  );
}

