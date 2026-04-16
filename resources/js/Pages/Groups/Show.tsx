/* global route */
import { Head, router } from '@inertiajs/react';
import { Group, Match, Player, PageProps } from '@/types';
import { useGroupShowController } from '@/features/groups/useGroupShowController';
import { GroupDetailsSection } from '@/features/groups/components/GroupDetailsSection';
import { GroupInviteSection } from '@/features/groups/components/GroupInviteSection';
import { GroupMatchesQuickActionsSection } from '@/features/groups/components/GroupMatchesQuickActionsSection';
import { GroupSettingsSection } from '@/features/groups/components/GroupSettingsSection';
import {
  RetroRosterGrid,
  RetroButton,
  RetroInfoCard,
  RetroAccordion,
  RetroSectionHeader,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { resolveGroupPermissions, resolveGroupSettings } from '@/utils/groups';

interface ShowProps extends PageProps {
  group: Group;
  players: Player[];
  matches: Match[];
}

export default function Show({ group, players, matches }: ShowProps) {
  const { invite, playersSection, settings } = useGroupShowController(group, players, matches);
  const permissions = resolveGroupPermissions(group, true);
  const groupSettings = resolveGroupSettings(group);
  const nextMatch =
    matches.find(
      (match) => match.status === 'scheduled' && new Date(match.scheduled_at) >= new Date(),
    ) ?? null;

  return (
    <RetroAppShell activeId="groups">
      <Head title={group.name} />

      <RetroSectionHeader title="DETALHES DO GRUPO" />
      <RetroInfoCard>
        <GroupDetailsSection group={group} nextMatch={nextMatch} />
        <div className="mt-3 flex flex-col gap-3">
          <GroupSettingsSection
            groupId={settings.groupId}
            deleteProcessing={settings.deleteProcessing}
            onDeleteGroup={settings.onDeleteGroup}
            canManageGroup={permissions.can_manage_group}
          />
          {nextMatch && permissions.can_manage_attendance ? (
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
              VER PRESENÇA DA PRÓXIMA PARTIDA
            </RetroButton>
          ) : null}
        </div>
      </RetroInfoCard>

      {groupSettings.recurrence !== 'none' && permissions.can_manage_matches && (
        <RetroAccordion title="GERAR DATAS" defaultOpen={false}>
          <GroupMatchesQuickActionsSection
            generateProcessing={settings.generateProcessing}
            onGenerateCurrentMonth={settings.onGenerateCurrentMonth}
            onGenerateForMonths={settings.onGenerateForMonths}
            onOpenDatesPage={() => router.visit(route('dates.index', { group: group.id }))}
          />
        </RetroAccordion>
      )}

      {permissions.can_manage_invites ? (
        <RetroAccordion title="CONVITE" defaultOpen={false}>
          <GroupInviteSection
            inviteUrl={invite.inviteUrl}
            processing={invite.processing}
            onGenerateInvite={invite.onGenerate}
          />
        </RetroAccordion>
      ) : null}

      <RetroAccordion title={`JOGADORES (${playersSection.players.length})`} defaultOpen={false}>
        {permissions.can_manage_players ? (
          <RetroButton
            type="button"
            variant="success"
            size="md"
            onClick={() => router.visit(route('groups.players', { group: group.id }))}
          >
            GERENCIAR JOGADORES
          </RetroButton>
        ) : null}
        <RetroRosterGrid players={playersSection.players} />
      </RetroAccordion>
    </RetroAppShell>
  );
}
