import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Group, Player, PageProps } from '@/types';
import { normalizePhone, maskPhone } from '@/utils/phone';

interface ShowProps extends PageProps {
  group: Group;
  players: Player[];
}

export default function Show({ group, players }: ShowProps) {
  const addForm = useForm({
    name: '',
    nick: '',
    phone: '',
  });

  const inviteForm = useForm({});

  const deleteForm = useForm({});

  const handleAddPlayer = (e: FormEvent) => {
    e.preventDefault();
    addForm.transform((data) => ({
      ...data,
      phone: normalizePhone(data.phone),
    }));
    addForm.post(route('groups.players.store', group), {
      onSuccess: () => addForm.reset(),
    });
  };

  const inviteUrl = group.invite_code
    ? `${window.location.origin}/invite/${group.invite_code}`
    : null;

  return (
    <AuthenticatedLayout header={<h2>Grupo: {group.name}</h2>}>
      <Head title={group.name} />

      <section className="section section--tight">
        <div>
          <p>Dia: {group.weekday}</p>
          <p>Horário: {group.time}</p>
          <p>Local: {group.location_name}</p>
        </div>
      </section>

      <section className="section section--tight">
        <h3>Convite do grupo</h3>
        {inviteUrl ? (
          <>
            <p>Compartilhe este link para jogadores se cadastrarem no grupo:</p>
            <input type="text" value={inviteUrl} readOnly />
            <button type="button" onClick={() => navigator.clipboard.writeText(inviteUrl)}>
              Copiar link
            </button>
          </>
        ) : (
          <>
            <p>Este grupo ainda não possui um link de convite ativo.</p>
            <button
              type="button"
              disabled={inviteForm.processing}
              onClick={() => inviteForm.post(route('groups.invite.regenerate', group))}
            >
              Gerar link de convite
            </button>
          </>
        )}
      </section>

      <section className="section section--tight">
        <h3>Jogadores ({players.length})</h3>

        {players.length === 0 ? (
          <p>Nenhum jogador neste grupo.</p>
        ) : (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Apelido</th>
                  <th>Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <PlayerRow key={player.id} group={group} player={player} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section section--tight">
        <h3>Adicionar jogador</h3>
        <form onSubmit={handleAddPlayer} className="form">
          <div className="form__group">
            <label htmlFor="player_name">Nome</label>
            <input
              id="player_name"
              type="text"
              value={addForm.data.name}
              onChange={(e) => addForm.setData('name', e.target.value)}
            />
            {addForm.errors.name && <p>{addForm.errors.name}</p>}
          </div>

          <div className="form__group">
            <label htmlFor="player_nick">Apelido</label>
            <input
              id="player_nick"
              type="text"
              value={addForm.data.nick}
              onChange={(e) => addForm.setData('nick', e.target.value)}
            />
            {addForm.errors.nick && <p>{addForm.errors.nick}</p>}
          </div>

          <div className="form__group">
            <label htmlFor="player_phone">Telefone</label>
            <input
              id="player_phone"
              type="tel"
              value={addForm.data.phone}
              onChange={(e) => addForm.setData('phone', maskPhone(e.target.value))}
            />
            {addForm.errors.phone && <p>{addForm.errors.phone}</p>}
          </div>

          <div className="form__actions">
            <button type="submit" disabled={addForm.processing}>
              Adicionar
            </button>
          </div>
        </form>
      </section>

      <section className="section section--tight">
        <h3>Configurações do grupo</h3>
        <Link href={`/groups/${group.id}/edit`}>Editar grupo</Link>
        <button
          type="button"
          disabled={deleteForm.processing}
          onClick={() => {
            if (
              !confirm(
                'Tem certeza que deseja remover este grupo? Essa ação não pode ser desfeita.',
              )
            ) {
              return;
            }
            deleteForm.delete(route('groups.destroy', group));
          }}
        >
          Remover grupo
        </button>
      </section>
    </AuthenticatedLayout>
  );
}

function PlayerRow({ group, player }: { group: Group; player: Player }) {
  const removeForm = useForm({});

  const handleRemove = () => {
    if (!confirm(`Remover ${player.nick} do grupo?`)) {
      return;
    }
    removeForm.delete(route('groups.players.destroy', { group: group.id, player: player.id }));
  };

  return (
    <tr>
      <td>{player.name}</td>
      <td>{player.nick}</td>
      <td>{player.phone}</td>
      <td>
        <button type="button" onClick={handleRemove} disabled={removeForm.processing}>
          Remover
        </button>
      </td>
    </tr>
  );
}
