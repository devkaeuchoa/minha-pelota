import { router } from '@inertiajs/react';
import { useState } from 'react';
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
  const [selectedAvailableId, setSelectedAvailableId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [processingAdd, setProcessingAdd] = useState(false);
  const [processingRemove, setProcessingRemove] = useState(false);

  const handleSelectAvailable = (id: number) => {
    setSelectedAvailableId(id);
    setSelectedGroupId(null);
  };

  const handleSelectGroup = (id: number) => {
    setSelectedGroupId(id);
    setSelectedAvailableId(null);
  };

  const handleAddToGroup = () => {
    if (!selectedAvailableId || processingAdd) return;
    setProcessingAdd(true);

    router.post(
      route('groups.players.attach', groupId),
      { player_id: selectedAvailableId },
      {
        onFinish: () => setProcessingAdd(false),
        onSuccess: () => {
          const player = available.find((p) => p.id === selectedAvailableId);
          if (!player) return;
          setAvailable((list) => list.filter((p) => p.id !== selectedAvailableId));
          setInGroup((list) => [...list, player]);
          setSelectedAvailableId(null);
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
    selectedAvailableId,
    selectedGroupId,
    processingAdd,
    processingRemove,
    handleSelectAvailable,
    handleSelectGroup,
    handleAddToGroup,
    handleRemoveFromGroup,
  };
}

