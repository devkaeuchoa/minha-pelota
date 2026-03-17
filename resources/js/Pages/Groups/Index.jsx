import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, groups }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2>Meus grupos</h2>
            }
        >
            <Head title="Meus grupos" />

            <section className="section">
                <div className="flex items-center justify-between">
                    <p>Gerencie aqui os grupos que você criou.</p>
                    <Link href="/groups/create">Criar novo grupo</Link>
                </div>

                {groups.length === 0 ? (
                    <p>Você ainda não possui grupos.</p>
                ) : (
                    <div className="table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Dia</th>
                                    <th>Horário</th>
                                    <th>Local</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((group) => (
                                    <tr key={group.id}>
                                        <td>{group.name}</td>
                                        <td>{group.weekday}</td>
                                        <td>{group.time}</td>
                                        <td>{group.location_name}</td>
                                        <td>
                                            <Link href={`/groups/${group.id}`}>Ver</Link>{' '}
                                            <Link href={`/groups/${group.id}/edit`}>Editar</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

