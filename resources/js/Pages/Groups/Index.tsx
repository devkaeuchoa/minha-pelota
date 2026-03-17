import { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Group, PageProps } from '@/types';

interface IndexProps extends PageProps {
  groups: Group[];
}

export default function Index({ groups }: IndexProps) {
  const {
    data,
    setData,
    delete: destroy,
    processing,
  } = useForm<{ ids: number[] }>({
    ids: [],
  });
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

  const handleBatchDelete = (event: FormEvent) => {
    event.preventDefault();

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

  if (!groups.length) {
    return (
      <AuthenticatedLayout header={<h2>Meus grupos</h2>}>
        <Head title="Meus grupos" />
        <section className="section">
          <HeaderActions processing={false} />
          <EmptyState />
        </section>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout header={<h2>Meus grupos</h2>}>
      <Head title="Meus grupos" />
      <section className="section">
        <BatchDeleteForm
          processing={processing}
          onSubmit={handleBatchDelete}
          groups={groups}
          selectedIds={selectedIds}
          onToggleSelected={toggleSelected}
        />
      </section>
    </AuthenticatedLayout>
  );
}

function HeaderActions({ processing }: { processing: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <p>Gerencie aqui os grupos que você criou.</p>
      <div>
        <button type="submit" disabled={processing}>
          Remover selecionados
        </button>{' '}
        <Link href="/groups/create">Criar novo grupo</Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return <p>Você ainda não possui grupos.</p>;
}

interface BatchDeleteFormProps {
  processing: boolean;
  onSubmit: (e: FormEvent) => void;
  groups: Group[];
  selectedIds: Set<number>;
  onToggleSelected: (id: number) => void;
}

function BatchDeleteForm({
  processing,
  onSubmit,
  groups,
  selectedIds,
  onToggleSelected,
}: BatchDeleteFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <HeaderActions processing={processing} />
      <GroupsTable groups={groups} selectedIds={selectedIds} onToggleSelected={onToggleSelected} />
    </form>
  );
}

interface GroupsTableProps {
  groups: Group[];
  selectedIds: Set<number>;
  onToggleSelected: (id: number) => void;
}

function GroupsTable({ groups, selectedIds, onToggleSelected }: GroupsTableProps) {
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>Selecionar</th>
            <th>Nome</th>
            <th>Dia</th>
            <th>Horário</th>
            <th>Local</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const isSelected = selectedIds.has(group.id);

            return (
              <tr key={group.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelected(group.id)}
                  />
                </td>
                <td>{group.name}</td>
                <td>{group.weekday}</td>
                <td>{group.time}</td>
                <td>{group.location_name}</td>
                <td>
                  <Link href={`/groups/${group.id}`}>Ver</Link>{' '}
                  <Link href={`/groups/${group.id}/edit`}>Editar</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
