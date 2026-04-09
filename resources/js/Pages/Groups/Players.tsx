import { Head } from '@inertiajs/react';
import { Group, Player, PageProps } from '@/types';
import {
  RetroButton,
  RetroPlayerList,
  RetroSearchInput,
  RetroSectionHeader,
} from '@/Components/retro';
import { useGroupPlayersController } from '@/features/groups/useGroupPlayersController';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { useLocale } from '@/hooks/useLocale';

interface PlayersPageProps extends PageProps {
  group: Group;
  availablePlayers: Player[];
  groupPlayers: Player[];
}

export default function Players({ group, availablePlayers, groupPlayers }: PlayersPageProps) {
  const { t } = useLocale();
  const controller = useGroupPlayersController({
    groupId: group.id,
    availablePlayers,
    groupPlayers,
  });

  return (
    <RetroAppShell activeId="groups">
      <Head title={`Jogadores — ${group.name}`} />

      <RetroSectionHeader title="3. JOGADORES DO GRUPO" />

      <div className="mb-2">
        <p className="retro-text-shadow text-sm text-[#a0b0ff]">
          SELECIONE UM JOGADOR NA LISTA ESQUERDA PARA ADICIONAR AO GRUPO OU UM DA DIREITA PARA
          REMOVER.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <RetroSearchInput
            value={controller.searchTerm}
            onChange={controller.setSearchTerm}
            placeholder="BUSCAR JOGADOR"
          />
          <RetroPlayerList
            title="DISPONÍVEIS"
            emptyLabel={t('retro.playerList.empty')}
            players={controller.filteredAvailable.map((player) => ({
              ...player,
              presenceLabel: formatPlayerMeta(player),
            }))}
            selectedIds={Array.from(controller.selectedAvailableIds)}
            onToggle={controller.handleToggleAvailable}
            variant="available"
          />
        </div>
        <RetroPlayerList
          title="NO GRUPO"
          emptyLabel={t('retro.playerList.empty')}
          players={controller.inGroup.map((player) => ({
            ...player,
            presenceLabel: formatPlayerMeta(player),
          }))}
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
          disabled={controller.selectedAvailableIds.size === 0 || controller.processingAdd}
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
    </RetroAppShell>
  );
}

function formatPlayerMeta(player: Player): string {
  const rating = player.rating ? `R${player.rating}/5` : 'R-';
  const stats = player.stats ?? { goals: 0, assists: 0, games_played: 0, games_missed: 0 };

  return `${rating} G${stats.goals} A${stats.assists} J${stats.games_played} P${stats.games_missed}`;
}
