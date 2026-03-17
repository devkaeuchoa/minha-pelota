import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ auth, group, players }) {
    const addForm = useForm({
        user_id: '',
        is_admin: false,
    });

    const handleAdd = (e) => {
        e.preventDefault();
        addForm.post(`/api/groups/${group.id}/players`);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2>Grupo: {group.name}</h2>
            }
        >
            <Head title={group.name} />

            <section className="space-y-4">
                <div>
                    <p>Dia: {group.weekday}</p>
                    <p>Horário: {group.time}</p>
                    <p>Local: {group.location_name}</p>
                </div>
            </section>

            <section className="space-y-4">
                <h3>Jogadores</h3>

                {players.length === 0 ? (
                    <p>Nenhum jogador neste grupo.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Condição física</th>
                                    <th>Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map((player) => (
                                    <tr key={player.id}>
                                        <td>{player.name}</td>
                                        <td>{player.email}</td>
                                        <td>{player.physical_condition}</td>
                                        <td>{player.is_admin ? 'Sim' : 'Não'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h3>Adicionar jogador</h3>
                <form onSubmit={handleAdd}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="user_id">ID do usuário</label>
                            <input
                                id="user_id"
                                type="number"
                                value={addForm.data.user_id}
                                onChange={(e) => addForm.setData('user_id', e.target.value)}
                            />
                            {addForm.errors.user_id && <p>{addForm.errors.user_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="is_admin">
                                <input
                                    id="is_admin"
                                    type="checkbox"
                                    checked={addForm.data.is_admin}
                                    onChange={(e) =>
                                        addForm.setData('is_admin', e.target.checked)
                                    }
                                />
                                Admin do grupo
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={addForm.processing}>
                                Adicionar
                            </button>
                            <Link href="/groups">Voltar para lista</Link>
                        </div>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
}

