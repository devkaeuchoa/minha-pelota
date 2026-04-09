import { Link } from '@inertiajs/react';
import { RetroButton } from '@/Components/retro';

interface GroupSettingsSectionProps {
  groupId: number;
  deleteProcessing: boolean;
  onDeleteGroup: () => void;
  canManageGroup?: boolean;
}

export function GroupSettingsSection({
  groupId,
  deleteProcessing,
  onDeleteGroup,
  canManageGroup = true,
}: GroupSettingsSectionProps) {
  if (!canManageGroup) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="retro-text-shadow text-sm text-[#a0b0ff]">
        EDITE OU REMOVA AS CONFIGURAÇÕES DO GRUPO.
      </p>
      <div className="flex gap-3">
        <RetroButton
          size="md"
          className="flex-1"
          type="button"
          variant="danger"
          disabled={deleteProcessing}
          onClick={onDeleteGroup}
        >
          REMOVER GRUPO
        </RetroButton>
        <Link href={`/groups/${groupId}/edit`} className="flex-1">
          <RetroButton size="md" type="button" variant="success">
            EDITAR GRUPO
          </RetroButton>
        </Link>
      </div>
    </div>
  );
}
