import { FormEvent, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Group } from '@/types';

export function useGroupsIndexController(groups: Group[]) {
  const {
    data,
    setData,
    delete: destroy,
    processing,
  } = useForm<{ ids: number[] }>({ ids: [] });

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setData('ids', Array.from(next));
      return next;
    });
  };

  const handleBatchDelete = (e: FormEvent) => {
    e.preventDefault();

    if (!data.ids.length) {
      return;
    }

    if (
      !confirm(
        'Tem certeza que deseja remover os grupos selecionados? Essa ação não pode ser desfeita.',
      )
    ) {
      return;
    }

    destroy(route('groups.destroyMany'));
  };

  return {
    groups,
    selectedIds,
    processing,
    hasSelection: selectedIds.size > 0,
    toggleSelected,
    handleBatchDelete,
  };
}
