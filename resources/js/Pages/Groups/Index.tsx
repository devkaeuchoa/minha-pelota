/* global route */
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Group, PageProps } from '@/types';
import { useGroupsIndexController } from '@/features/groups/useGroupsIndexController';
import { GroupsHeader } from '@/features/groups/components/GroupsHeader';
import { GroupsTable } from '@/features/groups/components/GroupsTable';
import { GroupsList } from '@/features/groups/components/GroupsList';
import {
  RetroControlHintBar,
  RetroModal,
  RetroPanel,
  RetroSectionHeader,
  RetroSegmentedControl,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { resolveGroupPermissions } from '@/utils/groups';
import { useLocale } from '@/hooks/useLocale';

type GroupsViewMode = 'table' | 'list';

interface IndexProps extends PageProps {
  groups: Group[];
  groupForPaymentsCalendar: {
    group_id: number;
  } | null;
  groupsViewPreference: GroupsViewMode;
}

export default function Index({
  groups,
  groupForPaymentsCalendar,
  groupsViewPreference,
}: IndexProps) {
  const { t } = useLocale();
  const controller = useGroupsIndexController(groups);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState<GroupsViewMode>(groupsViewPreference);

  const handleViewModeChange = (mode: string) => {
    const nextMode = mode as GroupsViewMode;
    setViewMode(nextMode);
    router.patch(
      route('groups.view-preference.update'),
      { view: nextMode },
      { preserveScroll: true, preserveState: true },
    );
  };
  const canManageGroups = groups.some(
    (group) => resolveGroupPermissions(group, true).can_manage_group,
  );
  const canManagePayments = groups.some(
    (group) => resolveGroupPermissions(group, true).can_manage_payments,
  );

  if (!groups.length) {
    return (
      <RetroAppShell activeId="groups">
        <Head title="Meus grupos" />
        <RetroSectionHeader title="1. GRUPOS" />
        <RetroPanel>
          <GroupsHeader
            processing={false}
            hasSelection={false}
            total={0}
            selectedCount={0}
            groupForPaymentsCalendar={groupForPaymentsCalendar}
          />
          <div className="flex flex-col gap-3">
            <p className="retro-text-shadow text-lg text-[#a0b0ff]">
              VOCÊ AINDA NÃO POSSUI GRUPOS.
            </p>
          </div>
        </RetroPanel>
      </RetroAppShell>
    );
  }

  return (
    <RetroAppShell activeId="groups">
      <Head title="Meus grupos" />
      <form>
        <RetroSectionHeader title="1. GRUPOS" />
        <RetroPanel>
          <GroupsHeader
            processing={controller.processing}
            hasSelection={controller.hasSelection}
            total={controller.groups.length}
            selectedCount={controller.selectedIds.size}
            onBatchDeleteClick={() => setShowBatchDeleteModal(true)}
            groupForPaymentsCalendar={groupForPaymentsCalendar}
            canManageGroups={canManageGroups}
            canManagePayments={canManagePayments}
          />
          <div className="md:hidden">
            <GroupsList
              groups={controller.groups}
              selectedIds={controller.selectedIds}
              onToggleSelected={controller.toggleSelected}
            />
          </div>

          <div className="hidden md:block">
            <div className="mb-3 flex justify-end">
              <RetroSegmentedControl
                label={t('groups.viewModeLabel')}
                options={[
                  { id: 'table', label: t('groups.viewMode.table') },
                  { id: 'list', label: t('groups.viewMode.list') },
                ]}
                activeId={viewMode}
                onChange={handleViewModeChange}
              />
            </div>
            {viewMode === 'table' ? (
              <GroupsTable
                groups={controller.groups}
                selectedIds={controller.selectedIds}
                onToggleSelected={controller.toggleSelected}
              />
            ) : (
              <GroupsList
                groups={controller.groups}
                selectedIds={controller.selectedIds}
                onToggleSelected={controller.toggleSelected}
              />
            )}
          </div>
        </RetroPanel>
        {canManageGroups && (
          <RetroControlHintBar
            hints={[{ key: 'B', label: 'REMOVER SELECIONADOS', color: '#ff0055' }]}
          />
        )}
      </form>
      <RetroModal
        open={showBatchDeleteModal}
        title="CONFIRMAR REMOÇÃO"
        message={
          <span>
            Tem certeza que deseja remover os grupos selecionados? Essa ação não pode ser desfeita.
          </span>
        }
        onCancel={() => setShowBatchDeleteModal(false)}
        onConfirm={() => {
          controller.handleBatchDelete();
          setShowBatchDeleteModal(false);
        }}
        confirmText="SIM, REMOVER"
        cancelText="NÃO"
        processing={controller.processing}
      />
    </RetroAppShell>
  );
}
