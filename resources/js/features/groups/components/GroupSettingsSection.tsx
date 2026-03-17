import { Link } from '@inertiajs/react';

interface GroupSettingsSectionProps {
  groupId: number;
  deleteProcessing: boolean;
  onDeleteGroup: () => void;
}

export function GroupSettingsSection({
  groupId,
  deleteProcessing,
  onDeleteGroup,
}: GroupSettingsSectionProps) {
  return (
    <section className="section section--tight">
      <h3>Configurações do grupo</h3>
      <Link href={`/groups/${groupId}/edit`}>Editar grupo</Link>
      <button type="button" disabled={deleteProcessing} onClick={onDeleteGroup}>
        Remover grupo
      </button>
    </section>
  );
}
