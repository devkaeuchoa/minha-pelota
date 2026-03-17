import { Link } from '@inertiajs/react';

interface GroupsHeaderProps {
  processing: boolean;
  hasSelection: boolean;
}

export function GroupsHeader({ processing, hasSelection }: GroupsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <p>Gerencie aqui os grupos que você criou.</p>
      <div>
        {hasSelection && (
          <button type="submit" disabled={processing}>
            Remover selecionados
          </button>
        )}{' '}
        <Link href="/groups/create">Criar novo grupo</Link>
      </div>
    </div>
  );
}
