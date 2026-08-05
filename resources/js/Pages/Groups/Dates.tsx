/* global route */
import { Head, router } from '@inertiajs/react';
import { Group, Match, PageProps } from '@/types';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { RetroInfoCard, RetroSectionHeader, RetroSelect } from '@/Components/retro';
import { GroupMatchesGenerationSection } from '@/features/groups/components/GroupMatchesGenerationSection';
import { useGroupMatchesController } from '@/features/groups/useGroupMatchesController';
import { resolveGroupPermissions } from '@/utils/groups';

interface DatesPageProps extends PageProps {
  groups: Group[];
  selectedGroupId: number | null;
  selectedGroup: Group | null;
  matches: Match[];
}

export default function Dates({ groups, selectedGroupId, selectedGroup, matches }: DatesPageProps) {
  const matchesController = useGroupMatchesController(selectedGroup, matches, {
    redirectToDates: true,
  });
  const permissions = selectedGroup
    ? resolveGroupPermissions(selectedGroup, true)
    : {
        can_manage_group: false,
        can_manage_players: false,
        can_manage_matches: false,
        can_manage_attendance: false,
        can_manage_payments: false,
        can_manage_invites: false,
      };

  return (
    <RetroAppShell activeId="dates">
      <Head title="Datas" />
      <RetroSectionHeader title="DATAS" />

      <RetroInfoCard>
        <div className="flex flex-col gap-3">
          <RetroSelect
            id="dates_group_selector"
            label="GRUPO"
            value={selectedGroupId ?? ''}
            onChange={(e) => {
              const nextGroupId = Number(e.target.value);
              if (Number.isNaN(nextGroupId)) return;
              router.visit(route('dates.index', { group: nextGroupId }), {
                preserveScroll: true,
              });
            }}
            options={groups.map((group) => ({ value: String(group.id), label: group.name }))}
          />

          {selectedGroup ? (
            <GroupMatchesGenerationSection
              matches={matches}
              generateProcessing={matchesController.generateProcessing}
              form={matchesController.matchesSection.form}
              editingMatchId={matchesController.matchesSection.editingMatchId}
              deleteProcessingId={matchesController.matchesSection.deleteProcessingId}
              onGenerateCurrentMonth={matchesController.onGenerateCurrentMonth}
              onGenerateForMonths={matchesController.onGenerateForMonths}
              onCreateMatch={matchesController.matchesSection.onCreateMatch}
              onSaveEditedMatch={matchesController.matchesSection.onSaveEditedMatch}
              onStartEditMatch={matchesController.matchesSection.onStartEditMatch}
              onCancelEditMatch={matchesController.matchesSection.onCancelEditMatch}
              onDeleteMatch={matchesController.matchesSection.onDeleteMatch}
              onOpenMatchPresence={(matchId) =>
                router.visit(
                  route('groups.matches.presence.manage', {
                    group: selectedGroup.id,
                    match: matchId,
                  }),
                )
              }
              onOpenMatchPayments={(matchId) =>
                router.visit(
                  route('groups.matches.payments.manage', {
                    group: selectedGroup.id,
                    match: matchId,
                  }),
                )
              }
              canManageMatches={permissions.can_manage_matches}
              canManageAttendance={permissions.can_manage_attendance}
              canManagePayments={permissions.can_manage_payments}
            />
          ) : null}
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
