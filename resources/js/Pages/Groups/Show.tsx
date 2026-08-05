/* global route */
import { Head, router } from '@inertiajs/react';
import { Group, Match, Player, PageProps } from '@/types';
import { useGroupShowController } from '@/features/groups/useGroupShowController';
import { GroupDetailsSection } from '@/features/groups/components/GroupDetailsSection';
import { GroupMatchesQuickActionsSection } from '@/features/groups/components/GroupMatchesQuickActionsSection';
import {
  RetroRosterGrid,
  RetroButton,
  RetroInfoCard,
  RetroAccordion,
  RetroBreadcrumbs,
  RetroSectionHeader,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { resolveGroupPermissions, resolveGroupSettings } from '@/utils/groups';
import { useLocale } from '@/hooks/useLocale';

interface ShowProps extends PageProps {
  group: Group;
  players: Player[];
  matches: Match[];
}

export default function Show({ group, players, matches }: ShowProps) {
  const { t } = useLocale();
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

      <RetroBreadcrumbs
        items={[{ label: t('common.groups'), href: route('groups.index') }, { label: group.name }]}
      />
      <RetroSectionHeader title="DETALHES DO GRUPO" />
      <RetroInfoCard>
        <GroupDetailsSection
          group={group}
          nextMatch={nextMatch}
          canManageGroup={permissions.can_manage_group}
          canManageInvites={permissions.can_manage_invites}
          inviteUrl={invite.inviteUrl}
          inviteProcessing={invite.processing}
          onGenerateInvite={invite.onGenerate}
          deleteProcessing={settings.deleteProcessing}
          onDeleteGroup={settings.onDeleteGroup}
        />
        <div className="mt-3 flex flex-col gap-3">
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
          {permissions.can_manage_payments ? (
            <RetroButton
              variant="neutral"
              size="sm"
              type="button"
              onClick={() => router.visit(route('groups.payments.calendar', { group: group.id }))}
            >
              VER PAGAMENTOS DO MÊS
            </RetroButton>
          ) : null}
        </div>
      </RetroInfoCard>

      {groupSettings.recurrence !== 'none' && permissions.can_manage_matches && (
        <RetroAccordion title="GERAR DATAS" defaultOpen={true}>
          <GroupMatchesQuickActionsSection
            generateProcessing={settings.generateProcessing}
            onGenerateCurrentMonth={settings.onGenerateCurrentMonth}
            onGenerateForMonths={settings.onGenerateForMonths}
            onOpenDatesPage={() => router.visit(route('dates.index', { group: group.id }))}
          />
        </RetroAccordion>
      )}

      <RetroAccordion title={`JOGADORES (${playersSection.players.length})`} defaultOpen={true}>
        <div className="mb-3 flex flex-wrap gap-3">
          {permissions.can_manage_players ? (
            <RetroButton
              type="button"
              variant="success"
              size="md"
              onClick={() => router.visit(route('groups.players', { group: group.id }))}
            >
              ADICIONAR/REMOVER JOGADORES
            </RetroButton>
          ) : null}
          {nextMatch && permissions.can_manage_attendance ? (
            <RetroButton
              variant="neutral"
              size="md"
              type="button"
              onClick={() =>
                router.visit(
                  route('groups.matches.teams.manage', { group: group.id, match: nextMatch.id }),
                )
              }
            >
              SORTEAR TIMES
            </RetroButton>
          ) : null}
        </div>
        <RetroRosterGrid players={playersSection.players} />
      </RetroAccordion>
    </RetroAppShell>
  );
}
