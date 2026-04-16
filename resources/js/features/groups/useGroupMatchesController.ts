/* global route */
import { FormEvent, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Group, Match } from '@/types';
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

interface UseGroupMatchesControllerOptions {
  redirectToDates?: boolean;
}

export function useGroupMatchesController(
  group: Group | null,
  matches: Match[],
  options?: UseGroupMatchesControllerOptions,
) {
  const matchForm = useForm<MatchFormData>(INITIAL_MATCH_FORM);
  const [generateProcessing, setGenerateProcessing] = useState(false);
  const [deleteMatchProcessingId, setDeleteMatchProcessingId] = useState<number | null>(null);
  const redirectToDates = options?.redirectToDates ?? false;

  const handleGenerateCurrentMonth = () => {
    if (!group) return;

    setGenerateProcessing(true);
    router.post(
      route('groups.matches.generate-current-month', group),
      { redirect_to_dates: redirectToDates },
      {
        preserveScroll: true,
        onFinish: () => setGenerateProcessing(false),
      },
    );
  };

  const handleGenerateForMonths = (months: number) => {
    if (!group) return;

    setGenerateProcessing(true);
    router.post(
      route('groups.matches.generate-months', group),
      { months, redirect_to_dates: redirectToDates },
      {
        preserveScroll: true,
        onFinish: () => setGenerateProcessing(false),
      },
    );
  };

  const handleCreateMatch = (e: FormEvent) => {
    e.preventDefault();
    if (!group) return;

    matchForm.post(route('groups.matches.store', group), {
      preserveScroll: true,
      onSuccess: () => matchForm.setData(INITIAL_MATCH_FORM),
      data: { ...matchForm.data, redirect_to_dates: redirectToDates },
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
    if (!group || !matchForm.data.id) return;

    matchForm.put(route('groups.matches.update', { group: group.id, match: matchForm.data.id }), {
      preserveScroll: true,
      onSuccess: () => matchForm.setData(INITIAL_MATCH_FORM),
      data: { ...matchForm.data, redirect_to_dates: redirectToDates },
    });
  };

  const handleDeleteMatch = (match: Match) => {
    if (!group) return;

    setDeleteMatchProcessingId(match.id);
    router.delete(route('groups.matches.destroy', { group: group.id, match: match.id }), {
      preserveScroll: true,
      data: { redirect_to_dates: redirectToDates },
      onFinish: () => setDeleteMatchProcessingId(null),
    });
  };

  return {
    generateProcessing,
    onGenerateCurrentMonth: handleGenerateCurrentMonth,
    onGenerateForMonths: handleGenerateForMonths,
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
