/* global route */
import { Head, router } from '@inertiajs/react';
import { Group, Match, Player, PageProps } from '@/types';
import { useGroupShowController } from '@/features/groups/useGroupShowController';
import { GroupDetailsSection } from '@/features/groups/components/GroupDetailsSection';
import { GroupInviteSection } from '@/features/groups/components/GroupInviteSection';
import { GroupSettingsSection } from '@/features/groups/components/GroupSettingsSection';
import {
  RetroRosterGrid,
  RetroButton,
  RetroInfoCard,
  RetroAccordion,
  RetroSectionHeader,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';

interface ShowProps extends PageProps {
  group: Group;
  players: Player[];
  matches: Match[];
}

export default function Show({ group, players, matches }: ShowProps) {
  const { invite, playersSection, settings } = useGroupShowController(group, players);
  const nextMatch = matches[0] ?? null;

  return (
    <RetroAppShell activeId="groups">
      <Head title={group.name} />

      <RetroSectionHeader title="2. DETALHES DO GRUPO" />
      <RetroInfoCard>
        <GroupDetailsSection group={group} matches={matches} />
        <div className="mt-3 flex flex-col gap-3">
          <GroupSettingsSection
            groupId={settings.groupId}
            recurrence={group.recurrence}
            deleteProcessing={settings.deleteProcessing}
            generateProcessing={settings.generateProcessing}
            onDeleteGroup={settings.onDeleteGroup}
            onGenerateMatches={settings.onGenerateMatches}
          />
          {nextMatch && (
            <RetroButton
              variant="neutral"
              size="sm"
              type="button"
              onClick={() =>
                router.visit(
                  route('groups.matches.presence.manage', { group: group.id, match: nextMatch.id }),
                )
              }
            >
              VER ESCALAÇÃO
            </RetroButton>
          )}
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
        <RetroButton
          type="button"
          variant="success"
          size="md"
          onClick={() => router.visit(route('groups.players', group.id))}
        >
          GERENCIAR JOGADORES
        </RetroButton>
        <RetroRosterGrid players={playersSection.players} />
      </RetroAccordion>
    </RetroAppShell>
  );
}
