/* global route */

import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Player } from '@/types';

interface UseGroupPlayersControllerArgs {
  groupId: number;
  availablePlayers: Player[];
  groupPlayers: Player[];
}

export function useGroupPlayersController({
  groupId,
  availablePlayers,
  groupPlayers,
}: UseGroupPlayersControllerArgs) {
  const [available, setAvailable] = useState(availablePlayers);
  const [inGroup, setInGroup] = useState(groupPlayers);
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [processingAdd, setProcessingAdd] = useState(false);
  const [processingRemove, setProcessingRemove] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleAvailable = (id: number) => {
    setSelectedAvailableIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSelectedGroupId(null);
  };

  const handleSelectGroup = (id: number) => {
    setSelectedGroupId(id);
    setSelectedAvailableIds(new Set());
  };

  const filteredAvailable = useMemo(() => {
    if (!searchTerm.trim()) return available;
    const term = searchTerm.toLowerCase();
    return available.filter((player) => {
      const base = `${player.name} ${player.nick ?? ''}`.toLowerCase();
      return base.includes(term);
    });
  }, [available, searchTerm]);

  const handleAddToGroup = () => {
    if (selectedAvailableIds.size === 0 || processingAdd) return;
    setProcessingAdd(true);

    const ids = Array.from(selectedAvailableIds);

    router.post(
      route('groups.players.attach', { group: groupId }),
      { player_ids: ids },
      {
        onFinish: () => setProcessingAdd(false),
        onSuccess: () => {
          setAvailable((list) => list.filter((p) => !selectedAvailableIds.has(p.id)));
          setInGroup((list) => [
            ...list,
            ...available.filter((p) => selectedAvailableIds.has(p.id)),
          ]);
          setSelectedAvailableIds(new Set());
        },
      },
    );
  };

  const handleRemoveFromGroup = () => {
    if (!selectedGroupId || processingRemove) return;
    setProcessingRemove(true);

    router.delete(route('groups.players.destroy', { group: groupId, player: selectedGroupId }), {
      onFinish: () => setProcessingRemove(false),
      onSuccess: () => {
        const player = inGroup.find((p) => p.id === selectedGroupId);
        if (!player) return;
        setInGroup((list) => list.filter((p) => p.id !== selectedGroupId));
        setAvailable((list) => [...list, player]);
        setSelectedGroupId(null);
      },
    });
  };

  return {
    available,
    inGroup,
    filteredAvailable,
    selectedAvailableIds,
    selectedGroupId,
    processingAdd,
    processingRemove,
    searchTerm,
    setSearchTerm,
    handleToggleAvailable,
    handleSelectGroup,
    handleAddToGroup,
    handleRemoveFromGroup,
  };
}

