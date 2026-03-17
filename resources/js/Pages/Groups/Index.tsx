import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Group, PageProps } from '@/types';
import { useGroupsIndexController } from '@/features/groups/useGroupsIndexController';
import { GroupsHeader } from '@/features/groups/components/GroupsHeader';
import { GroupsTable } from '@/features/groups/components/GroupsTable';
import {
  RetroControlHintBar,
  RetroPanel,
  RetroSectionHeader,
} from '@/Components/retro';

interface IndexProps extends PageProps {
  groups: Group[];
}

export default function Index({ groups }: IndexProps) {
  const controller = useGroupsIndexController(groups);

  if (!groups.length) {
    return (
      <AuthenticatedLayout header={<h2>Meus grupos</h2>}>
        <Head title="Meus grupos" />
        <section className="section">
          <RetroSectionHeader title="1. GROUPS" />
          <RetroPanel>
            <GroupsHeader
              processing={false}
              hasSelection={false}
              total={0}
              selectedCount={0}
            />
            <p className="retro-text-shadow text-lg text-[#a0b0ff]">
              YOU DON&apos;T HAVE GROUPS YET.
            </p>
          </RetroPanel>
        </section>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout header={<h2>Meus grupos</h2>}>
      <Head title="Meus grupos" />
      <section className="section">
        <form onSubmit={controller.handleBatchDelete}>
          <RetroSectionHeader title="1. GROUPS" />
          <RetroPanel>
            <GroupsHeader
              processing={controller.processing}
              hasSelection={controller.hasSelection}
              total={controller.groups.length}
              selectedCount={controller.selectedIds.size}
            />
            <GroupsTable
              groups={controller.groups}
              selectedIds={controller.selectedIds}
              onToggleSelected={controller.toggleSelected}
            />
          </RetroPanel>
          <RetroControlHintBar
            hints={[
              { key: 'A', label: 'TOGGLE SELECTION', color: '#39ff14' },
              { key: 'B', label: 'DELETE SELECTED', color: '#ff0055' },
            ]}
          />
        </form>
      </section>
    </AuthenticatedLayout>
  );
}
