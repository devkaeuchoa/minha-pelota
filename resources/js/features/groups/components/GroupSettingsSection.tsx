import { Link } from '@inertiajs/react';
import { RetroButton } from '@/Components/retro';

interface GroupSettingsSectionProps {
  groupId: number;
  recurrence?: string | null;
  deleteProcessing: boolean;
  generateProcessing: boolean;
  onDeleteGroup: () => void;
  onGenerateMatches: () => void;
}

export function GroupSettingsSection({
  groupId,
  recurrence,
  deleteProcessing,
  generateProcessing,
  onDeleteGroup,
  onGenerateMatches,
}: GroupSettingsSectionProps) {
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
      {recurrence !== 'none' && (
        <RetroButton
          size="sm"
          className="mt-2 w-full"
          type="button"
          variant="neutral"
          disabled={generateProcessing}
          onClick={onGenerateMatches}
        >
          GERAR JOGOS (MÊS ATUAL)
        </RetroButton>
      )}
    </div>
  );
}
