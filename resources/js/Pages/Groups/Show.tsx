import { Head } from '@inertiajs/react';
import { Group, Player, PageProps } from '@/types';
import { useGroupShowController } from '@/features/groups/useGroupShowController';
import { GroupDetailsSection } from '@/features/groups/components/GroupDetailsSection';
import { GroupInviteSection } from '@/features/groups/components/GroupInviteSection';
import { PlayersTable } from '@/features/groups/components/PlayersTable';
import { GroupSettingsSection } from '@/features/groups/components/GroupSettingsSection';
import { RetroInfoCard, RetroLayout, RetroPanel, RetroSectionHeader } from '@/Components/retro';

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
      <RetroInfoCard>
        <GroupDetailsSection group={group} />
        <div className="mt-3">
          <GroupSettingsSection
            groupId={settings.groupId}
            deleteProcessing={settings.deleteProcessing}
            onDeleteGroup={settings.onDeleteGroup}
          />
        </div>
      </RetroInfoCard>

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

      {/* Formulário de adicionar jogador será movido para uma tela específica futuramente */}
    </RetroLayout>
  );
}
