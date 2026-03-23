/* global route */
import { Head, router } from '@inertiajs/react';
import { Group, Match, Player, PageProps } from '@/types';
import { useGroupShowController } from '@/features/groups/useGroupShowController';
import { GroupDetailsSection } from '@/features/groups/components/GroupDetailsSection';
import { GroupInviteSection } from '@/features/groups/components/GroupInviteSection';
import { GroupMatchesGenerationSection } from '@/features/groups/components/GroupMatchesGenerationSection';
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
  const { invite, playersSection, settings, matchesSection } = useGroupShowController(
    group,
    players,
    matches,
  );
  const nextMatch =
    matches.find(
      (match) => match.status === 'scheduled' && new Date(match.scheduled_at) >= new Date(),
    ) ?? null;

  return (
    <RetroAppShell activeId="groups">
      <Head title={group.name} />

      <RetroSectionHeader title="2. DETALHES DO GRUPO" />
      <RetroInfoCard>
        <GroupDetailsSection group={group} nextMatch={nextMatch} />
        <div className="mt-3 flex flex-col gap-3">
          <GroupSettingsSection
            groupId={settings.groupId}
            deleteProcessing={settings.deleteProcessing}
            onDeleteGroup={settings.onDeleteGroup}
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

      {group.recurrence !== 'none' && (
        <RetroAccordion title="3. GERAR DATAS" defaultOpen={false}>
          <GroupMatchesGenerationSection
            matches={matches}
            generateProcessing={settings.generateProcessing}
            form={matchesSection.form}
            editingMatchId={matchesSection.editingMatchId}
            deleteProcessingId={matchesSection.deleteProcessingId}
            onGenerateCurrentMonth={settings.onGenerateCurrentMonth}
            onGenerateForMonths={settings.onGenerateForMonths}
            onCreateMatch={matchesSection.onCreateMatch}
            onSaveEditedMatch={matchesSection.onSaveEditedMatch}
            onStartEditMatch={matchesSection.onStartEditMatch}
            onCancelEditMatch={matchesSection.onCancelEditMatch}
            onDeleteMatch={matchesSection.onDeleteMatch}
            onOpenMatchPresence={(matchId) =>
              router.visit(
                route('groups.matches.presence.manage', { group: group.id, match: matchId }),
              )
            }
          />
        </RetroAccordion>
      )}

      <RetroAccordion title="4. CONVITE" defaultOpen={false}>
        <GroupInviteSection
          inviteUrl={invite.inviteUrl}
          processing={invite.processing}
          onGenerateInvite={invite.onGenerate}
        />
      </RetroAccordion>

      <RetroAccordion title={`5. JOGADORES (${playersSection.players.length})`} defaultOpen={false}>
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
