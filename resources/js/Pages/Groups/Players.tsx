import { Head } from '@inertiajs/react';
import { Group, Player, PageProps } from '@/types';
import { RetroButton, RetroLayout, RetroPlayerList, RetroSectionHeader } from '@/Components/retro';
import { useGroupPlayersController } from '@/features/groups/useGroupPlayersController';

interface PlayersPageProps extends PageProps {
  group: Group;
  availablePlayers: Player[];
  groupPlayers: Player[];
}

export default function Players({ group, availablePlayers, groupPlayers }: PlayersPageProps) {
  const controller = useGroupPlayersController({
    groupId: group.id,
    availablePlayers,
    groupPlayers,
  });

  return (
    <RetroLayout>
      <Head title={`Jogadores — ${group.name}`} />

      <RetroSectionHeader title="3. JOGADORES DO GRUPO" />

      <div className="mb-2">
        <p className="retro-text-shadow text-sm text-[#a0b0ff]">
          SELECIONE UM JOGADOR NA LISTA ESQUERDA PARA ADICIONAR AO GRUPO OU UM DA DIREITA PARA
          REMOVER.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RetroPlayerList
          title="DISPONÍVEIS"
          players={controller.available}
          selectedId={controller.selectedAvailableId}
          onSelect={controller.handleSelectAvailable}
          variant="available"
        />
        <RetroPlayerList
          title="NO GRUPO"
          players={controller.inGroup}
          selectedId={controller.selectedGroupId}
          onSelect={controller.handleSelectGroup}
          variant="group"
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <RetroButton
          type="button"
          variant="success"
          size="lg"
          disabled={!controller.selectedAvailableId || controller.processingAdd}
          onClick={controller.handleAddToGroup}
        >
          ADICIONAR AO GRUPO
        </RetroButton>
        <RetroButton
          type="button"
          variant="danger"
          size="lg"
          disabled={!controller.selectedGroupId || controller.processingRemove}
          onClick={controller.handleRemoveFromGroup}
        >
          REMOVER DO GRUPO
        </RetroButton>
      </div>
    </RetroLayout>
  );
}

