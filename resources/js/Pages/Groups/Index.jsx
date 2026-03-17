import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ auth, groups }) {
  const {
    data,
    setData,
    delete: destroy,
    processing,
  } = useForm({
    ids: [],
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const toggleSelected = (id) => {
    setSelectedIds((current) => (current.has(id) ? current.delete(id) : current.add(id)));
    setData('ids', Array.from(selectedIds));
  };

  const handleBatchDelete = (event) => {
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

    destroy(route('groups.destroyMany'), {
      data,
    });
  };

  if (!groups.length) {
    return (
      <AuthenticatedLayout user={auth.user} header={<h2>Meus grupos</h2>}>
        <Head title="Meus grupos" />
        <section className="section">
          <HeaderActions processing={false} />
          <EmptyState />
        </section>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout user={auth.user} header={<h2>Meus grupos</h2>}>
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

function HeaderActions({ processing }) {
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

function BatchDeleteForm({ processing, onSubmit, groups, selectedIds, onToggleSelected }) {
  return (
    <form onSubmit={onSubmit}>
      <HeaderActions processing={processing} />
      <GroupsTable groups={groups} selectedIds={selectedIds} onToggleSelected={onToggleSelected} />
    </form>
  );
}

function GroupsTable({ groups, selectedIds, onToggleSelected }) {
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
