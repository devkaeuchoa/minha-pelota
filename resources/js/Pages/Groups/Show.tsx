import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Group, Player, PageProps } from '@/types';
import { useGroupShowController } from '@/features/groups/useGroupShowController';
import { GroupDetailsSection } from '@/features/groups/components/GroupDetailsSection';
import { GroupInviteSection } from '@/features/groups/components/GroupInviteSection';
import { PlayersTable } from '@/features/groups/components/PlayersTable';
import { PlayerForm } from '@/features/groups/components/PlayerForm';
import { GroupSettingsSection } from '@/features/groups/components/GroupSettingsSection';

interface ShowProps extends PageProps {
  group: Group;
  players: Player[];
}

export default function Show({ group, players }: ShowProps) {
  const { addForm, invite, playersSection, settings } = useGroupShowController(group, players);

  return (
    <AuthenticatedLayout header={<h2>Grupo: {group.name}</h2>}>
      <Head title={group.name} />

      <GroupDetailsSection group={group} />

      <GroupInviteSection
        inviteUrl={invite.inviteUrl}
        processing={invite.processing}
        onGenerateInvite={invite.onGenerate}
        onCopyInvite={invite.onCopy}
      />

      <section className="section section--tight">
        <h3>Jogadores ({playersSection.players.length})</h3>
        <PlayersTable
          players={playersSection.players}
          onRemovePlayer={playersSection.onRemovePlayer}
          removeProcessingId={playersSection.removeProcessingId}
        />
      </section>

      <PlayerForm
        values={addForm.values}
        errors={addForm.errors}
        processing={addForm.processing}
        onChange={addForm.onChange}
        onSubmit={addForm.onSubmit}
      />

      <GroupSettingsSection
        groupId={settings.groupId}
        deleteProcessing={settings.deleteProcessing}
        onDeleteGroup={settings.onDeleteGroup}
      />
    </AuthenticatedLayout>
  );
}
