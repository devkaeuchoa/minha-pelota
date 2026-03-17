import { Head } from '@inertiajs/react';
import { Group, Player, PageProps } from '@/types';
import { useGroupShowController } from '@/features/groups/useGroupShowController';
import { GroupDetailsSection } from '@/features/groups/components/GroupDetailsSection';
import { GroupInviteSection } from '@/features/groups/components/GroupInviteSection';
import { PlayersTable } from '@/features/groups/components/PlayersTable';
import { PlayerForm } from '@/features/groups/components/PlayerForm';
import { GroupSettingsSection } from '@/features/groups/components/GroupSettingsSection';
import { RetroLayout, RetroSectionHeader, RetroPanel } from '@/Components/retro';

interface ShowProps extends PageProps {
  group: Group;
  players: Player[];
}

export default function Show({ group, players }: ShowProps) {
  const { addForm, invite, playersSection, settings } = useGroupShowController(group, players);

  return (
    <RetroLayout>
      <Head title={group.name} />

      <RetroSectionHeader title="2. DETALHES DO GRUPO" />
      <RetroPanel>
        <GroupDetailsSection group={group} />
      </RetroPanel>

      <RetroSectionHeader title="3. CONVITE" />
      <RetroPanel>
        <GroupInviteSection
          inviteUrl={invite.inviteUrl}
          processing={invite.processing}
          onGenerateInvite={invite.onGenerate}
          onCopyInvite={invite.onCopy}
        />
      </RetroPanel>

      <RetroSectionHeader title={`4. JOGADORES (${playersSection.players.length})`} />
      <RetroPanel>
        <PlayersTable
          players={playersSection.players}
          onRemovePlayer={playersSection.onRemovePlayer}
          removeProcessingId={playersSection.removeProcessingId}
        />
      </RetroPanel>

      <RetroSectionHeader title="5. ADICIONAR JOGADOR" />
      <RetroPanel>
        <PlayerForm
          values={addForm.values}
          errors={addForm.errors}
          processing={addForm.processing}
          onChange={addForm.onChange}
          onSubmit={addForm.onSubmit}
        />
      </RetroPanel>

      <RetroSectionHeader title="6. CONFIGURAÇÕES DO GRUPO" />
      <RetroPanel>
        <GroupSettingsSection
          groupId={settings.groupId}
          deleteProcessing={settings.deleteProcessing}
          onDeleteGroup={settings.onDeleteGroup}
        />
      </RetroPanel>
    </RetroLayout>
  );
}
