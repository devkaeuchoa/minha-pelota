/* global route */
import { FormEvent, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Group, Match, Player } from '@/types';
import { normalizePhone } from '@/utils/phone';
import { getGroupInviteUrl } from '@/utils/group';
import { useGroupMatchesController } from './useGroupMatchesController';

export function useGroupShowController(group: Group, players: Player[], matches: Match[]) {
  const addForm = useForm({ name: '', nick: '', phone: '' });
  const inviteForm = useForm({});
  const deleteForm = useForm({});
  const [removeProcessingId, setRemoveProcessingId] = useState<number | null>(null);
  const matchesController = useGroupMatchesController(group, matches);

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
    setRemoveProcessingId(player.id);
    router.delete(route('groups.players.destroy', { group: group.id, player: player.id }), {
      onFinish: () => setRemoveProcessingId(null),
    });
  };

  const handleGenerateInvite = () => {
    inviteForm.post(route('groups.invite.regenerate', group));
  };

  const handleDeleteGroup = () => {
    deleteForm.delete(route('groups.destroy', group));
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
      generateProcessing: matchesController.generateProcessing,
      onGenerateCurrentMonth: matchesController.onGenerateCurrentMonth,
      onGenerateForMonths: matchesController.onGenerateForMonths,
    },
    matchesSection: matchesController.matchesSection,
  };
}
