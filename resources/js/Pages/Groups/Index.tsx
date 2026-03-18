import { Head } from '@inertiajs/react';
import { Group, PageProps } from '@/types';
import { useGroupsIndexController } from '@/features/groups/useGroupsIndexController';
import { GroupsHeader } from '@/features/groups/components/GroupsHeader';
import { GroupsTable } from '@/features/groups/components/GroupsTable';
import { RetroControlHintBar, RetroPanel, RetroSectionHeader } from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';

interface IndexProps extends PageProps {
  groups: Group[];
}

export default function Index({ groups }: IndexProps) {
  const controller = useGroupsIndexController(groups);

  if (!groups.length) {
    return (
      <RetroAppShell activeId="groups" title="GRUPOS">
        <Head title="Meus grupos" />
        <RetroSectionHeader title="1. GRUPOS" />
        <RetroPanel>
          <GroupsHeader
            processing={false}
            hasSelection={false}
            total={0}
            selectedCount={0}
          />
          <p className="retro-text-shadow text-lg text-[#a0b0ff]">
            VOCÊ AINDA NÃO POSSUI GRUPOS.
          </p>
        </RetroPanel>
      </RetroAppShell>
    );
  }

  return (
    <RetroAppShell activeId="groups" title="GRUPOS">
      <Head title="Meus grupos" />
      <form onSubmit={controller.handleBatchDelete}>
        <RetroSectionHeader title="1. GRUPOS" />
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
            { key: 'B', label: 'REMOVER SELECIONADOS', color: '#ff0055' },
          ]}
        />
      </form>
    </RetroAppShell>
  );
}
