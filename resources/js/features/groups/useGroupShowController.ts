/* global confirm, route */
import { FormEvent, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Group, Match, Player } from '@/types';
import { normalizePhone } from '@/utils/phone';
import { getGroupInviteUrl } from '@/utils/group';
import { formatDateTimeLocalInputPtBr } from '@/utils/datetime';

interface MatchFormData {
  id: number | null;
  scheduled_at: string;
  location_name: string;
  duration_minutes: string;
  status: 'scheduled' | 'cancelled' | 'finished';
}

const INITIAL_MATCH_FORM: MatchFormData = {
  id: null,
  scheduled_at: '',
  location_name: '',
  duration_minutes: '',
  status: 'scheduled',
};

export function useGroupShowController(group: Group, players: Player[], matches: Match[]) {
  const addForm = useForm({ name: '', nick: '', phone: '' });
  const inviteForm = useForm({});
  const deleteForm = useForm({});
  const matchForm = useForm<MatchFormData>(INITIAL_MATCH_FORM);
  const [removeProcessingId, setRemoveProcessingId] = useState<number | null>(null);
  const [generateProcessing, setGenerateProcessing] = useState(false);
  const [deleteMatchProcessingId, setDeleteMatchProcessingId] = useState<number | null>(null);

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

  const handleDeleteGroup = () => {
    if (!confirm('Tem certeza que deseja remover este grupo? Essa ação não pode ser desfeita.')) {
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
    router.post(
      route('groups.matches.generate-months', group),
      { months },
      {
        onFinish: () => setGenerateProcessing(false),
      },
    );
  };

  const handleCreateMatch = (e: FormEvent) => {
    e.preventDefault();
    matchForm.post(route('groups.matches.store', group), {
      preserveScroll: true,
      onSuccess: () => matchForm.setData(INITIAL_MATCH_FORM),
    });
  };

  const handleStartEditMatch = (match: Match) => {
    matchForm.setData({
      id: match.id,
      scheduled_at: formatDateTimeLocalInputPtBr(match.scheduled_at),
      location_name: match.location_name ?? '',
      duration_minutes: match.duration_minutes?.toString() ?? '',
      status: normalizeMatchStatus(match.status),
    });
  };

  const handleCancelEditMatch = () => {
    matchForm.setData(INITIAL_MATCH_FORM);
    matchForm.clearErrors();
  };

  const handleSaveEditedMatch = (e: FormEvent) => {
    e.preventDefault();
    if (!matchForm.data.id) return;
    matchForm.put(route('groups.matches.update', { group: group.id, match: matchForm.data.id }), {
      preserveScroll: true,
      onSuccess: () => matchForm.setData(INITIAL_MATCH_FORM),
    });
  };

  const handleDeleteMatch = (match: Match) => {
    if (!confirm('Tem certeza que deseja remover esta partida?')) return;

    setDeleteMatchProcessingId(match.id);
    router.delete(route('groups.matches.destroy', { group: group.id, match: match.id }), {
      preserveScroll: true,
      onFinish: () => setDeleteMatchProcessingId(null),
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
    matchesSection: {
      matches,
      form: {
        values: matchForm.data,
        errors: matchForm.errors,
        processing: matchForm.processing,
        onChange: matchForm.setData,
      },
      deleteProcessingId: deleteMatchProcessingId,
      editingMatchId: matchForm.data.id,
      onCreateMatch: handleCreateMatch,
      onSaveEditedMatch: handleSaveEditedMatch,
      onStartEditMatch: handleStartEditMatch,
      onCancelEditMatch: handleCancelEditMatch,
      onDeleteMatch: handleDeleteMatch,
    },
  };
}

function normalizeMatchStatus(status: string): MatchFormData['status'] {
  if (status === 'cancelled' || status === 'finished') return status;
  return 'scheduled';
}
