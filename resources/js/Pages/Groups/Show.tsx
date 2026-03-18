import { Head, router } from '@inertiajs/react';
import { Group, Player, PageProps } from '@/types';
import { useGroupShowController } from '@/features/groups/useGroupShowController';
import { GroupDetailsSection } from '@/features/groups/components/GroupDetailsSection';
import { GroupInviteSection } from '@/features/groups/components/GroupInviteSection';
import { PlayersTable } from '@/features/groups/components/PlayersTable';
import { GroupSettingsSection } from '@/features/groups/components/GroupSettingsSection';
import {
  RetroButton,
  RetroInfoCard,
  RetroLayout,
  RetroAccordion,
  RetroSectionHeader,
} from '@/Components/retro';

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
        <div className="mt-3 flex flex-col gap-3">
          <GroupSettingsSection
            groupId={settings.groupId}
            deleteProcessing={settings.deleteProcessing}
            onDeleteGroup={settings.onDeleteGroup}
          />
          <RetroButton
            type="button"
            variant="success"
            size="md"
            onClick={() => router.visit(route('groups.players', group.id))}
          >
            GERENCIAR JOGADORES
          </RetroButton>
        </div>
      </RetroInfoCard>

      <RetroAccordion title="3. CONVITE" defaultOpen={false}>
        <GroupInviteSection
          inviteUrl={invite.inviteUrl}
          processing={invite.processing}
          onGenerateInvite={invite.onGenerate}
          onCopyInvite={invite.onCopy}
        />
      </RetroAccordion>

      <RetroAccordion title={`4. JOGADORES (${playersSection.players.length})`} defaultOpen={false}>
        <PlayersTable
          players={playersSection.players}
          onRemovePlayer={playersSection.onRemovePlayer}
          removeProcessingId={playersSection.removeProcessingId}
        />
      </RetroAccordion>

    </RetroLayout>
  );
}
