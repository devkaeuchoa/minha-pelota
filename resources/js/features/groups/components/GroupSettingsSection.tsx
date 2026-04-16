import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { RetroButton, RetroModal } from '@/Components/retro';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!canManageGroup) {
    return null;
  }

  const handleConfirmDelete = () => {
    onDeleteGroup();
    setShowDeleteModal(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <RetroButton
          size="sm"
          className="flex-1"
          type="button"
          variant="danger"
          disabled={deleteProcessing}
          onClick={() => setShowDeleteModal(true)}
        >
          REMOVER GRUPO
        </RetroButton>
        <Link href={`/groups/${groupId}/edit`} className="flex-1">
          <RetroButton size="sm" type="button" variant="success">
            CONFIGURAR GRUPO
          </RetroButton>
        </Link>
      </div>

      <RetroModal
        open={showDeleteModal}
        title="REMOVER GRUPO"
        message={
          <span>Tem certeza que deseja remover este grupo? Essa ação não pode ser desfeita.</span>
        }
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        confirmText="SIM, REMOVER"
        cancelText="NÃO"
        processing={deleteProcessing}
      />
    </div>
  );
}
