/* global route */

import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { PageProps } from '@/types';
import {
  RetroButton,
  RetroFormField,
  RetroInlineInfo,
  RetroPanel,
  RetroSectionHeader,
  RetroTextInput,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';

interface GroupSettingsEditProps extends PageProps {
  group: { id: number; name: string };
  defaultTeamSize: number | null;
  status?: string;
}

export default function Edit({ group, defaultTeamSize, status }: GroupSettingsEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    default_team_size: defaultTeamSize !== null ? String(defaultTeamSize) : '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    put(route('groups.settings.update', group.id));
  };

  return (
    <RetroAppShell activeId="groups">
      <Head title={`Configurações — ${group.name}`} />

      <RetroSectionHeader title="CONFIGURAÇÕES DO GRUPO" />
      <RetroPanel>
        {status ? <RetroInlineInfo message={status} /> : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <RetroFormField label="JOGADORES POR TIME (PADRÃO)" htmlFor="default_team_size">
            <RetroTextInput
              id="default_team_size"
              type="number"
              min={2}
              max={50}
              value={data.default_team_size}
              onChange={(e) => setData('default_team_size', e.target.value)}
            />
            {errors.default_team_size && (
              <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.default_team_size}</p>
            )}
          </RetroFormField>

          <div className="mt-2 flex gap-3">
            <Link href={route('groups.show', group.id)} className="flex-1">
              <RetroButton type="button" variant="danger">
                VOLTAR
              </RetroButton>
            </Link>
            <RetroButton type="submit" variant="success" disabled={processing} className="flex-1">
              SALVAR
            </RetroButton>
          </div>
        </form>
      </RetroPanel>
    </RetroAppShell>
  );
}
