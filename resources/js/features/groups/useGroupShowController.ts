/* global confirm, route, navigator */
import { FormEvent, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Group, Player } from '@/types';
import { normalizePhone } from '@/utils/phone';
import { getGroupInviteUrl } from '@/utils/group';

export function useGroupShowController(group: Group, players: Player[]) {
  const addForm = useForm({ name: '', nick: '', phone: '' });
  const inviteForm = useForm({});
  const deleteForm = useForm({});
  const [removeProcessingId, setRemoveProcessingId] = useState<number | null>(null);
  const [generateProcessing, setGenerateProcessing] = useState(false);

  const inviteUrl = getGroupInviteUrl(group);

  const handleAddPlayer = (e: FormEvent) => {
    e.preventDefault();
    addForm.transform((data) => ({
      ...data,
      phone: normalizePhone(data.phone),
    }));
    addForm.post(route('groups.players.store', group), {
      onSuccess: () => addForm.reset(),
    });
  };

  const handleRemovePlayer = (player: Player) => {
    if (!confirm(`Remover ${player.nick} do grupo?`)) {
      return;
    }
    setRemoveProcessingId(player.id);
    router.delete(route('groups.players.destroy', { group: group.id, player: player.id }), {
      onFinish: () => setRemoveProcessingId(null),
    });
  };

  const handleGenerateInvite = () => {
    inviteForm.post(route('groups.invite.regenerate', group));
  };

  const handleCopyInvite = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
    }
  };

  const handleDeleteGroup = () => {
    if (
      !confirm('Tem certeza que deseja remover este grupo? Essa ação não pode ser desfeita.')
    ) {
      return;
    }
    deleteForm.delete(route('groups.destroy', group));
  };

  const handleGenerateMatches = () => {
    if (
      !confirm(
        'Deseja gerar as partidas para o mês atual? Partidas já existentes neste período podem ser mantidas ou recriadas conforme a lógica do sistema.',
      )
    ) {
      return;
    }

    setGenerateProcessing(true);
    router.post(route('groups.matches.generate-current-month', group), undefined, {
      onFinish: () => setGenerateProcessing(false),
    });
  };

  const handleGenerateForMonths = (months: number) => {
    if (
      !confirm(
        `Deseja gerar as partidas para os próximos ${months} ${months === 1 ? 'mês' : 'meses'}?`,
      )
    ) {
      return;
    }

    setGenerateProcessing(true);
    router.post(route('groups.matches.generate-months', group), { months }, {
      onFinish: () => setGenerateProcessing(false),
    });
  };

  return {
    addForm: {
      values: addForm.data,
      errors: addForm.errors,
      processing: addForm.processing,
      onChange: addForm.setData,
      onSubmit: handleAddPlayer,
    },
    invite: {
      inviteUrl,
      processing: inviteForm.processing,
      onGenerate: handleGenerateInvite,
      onCopy: handleCopyInvite,
    },
    playersSection: {
      players,
      removeProcessingId,
      onRemovePlayer: handleRemovePlayer,
    },
    settings: {
      groupId: group.id,
      deleteProcessing: deleteForm.processing,
      onDeleteGroup: handleDeleteGroup,
      generateProcessing,
      onGenerateCurrentMonth: handleGenerateMatches,
      onGenerateForMonths: handleGenerateForMonths,
    },
  };
}
