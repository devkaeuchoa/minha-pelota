import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Group, PageProps } from '@/types';
import { useGroupsIndexController } from '@/features/groups/useGroupsIndexController';
import { GroupsHeader } from '@/features/groups/components/GroupsHeader';
import { GroupsTable } from '@/features/groups/components/GroupsTable';

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
          <GroupsHeader processing={false} hasSelection={false} />
          <p>Você ainda não possui grupos.</p>
        </section>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout header={<h2>Meus grupos</h2>}>
      <Head title="Meus grupos" />
      <section className="section">
        <form onSubmit={controller.handleBatchDelete}>
          <GroupsHeader
            processing={controller.processing}
            hasSelection={controller.hasSelection}
          />
          <GroupsTable
            groups={controller.groups}
            selectedIds={controller.selectedIds}
            onToggleSelected={controller.toggleSelected}
          />
        </form>
      </section>
    </AuthenticatedLayout>
  );
}
