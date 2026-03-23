/* global route */
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { maskPhone } from '@/utils/phone';
import {
  RetroButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroRadio,
  RetroSectionHeader,
  RetroTextInput,
} from '@/Components/retro';
import { FormEvent, useMemo } from 'react';

type PresenceStatus = 'going' | 'not_going' | 'maybe';

interface PresenceMarkProps extends PageProps {
  token: string;
  expired: boolean;
  status?: string;
  group: {
    id: number;
    name: string;
  };
  match: {
    id: number;
    scheduled_at: string;
    location_name: string | null;
  };
}

function formatDateTimePtBr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR');
}

export default function Mark({ token, expired, status, group, match }: PresenceMarkProps) {
  const form = useForm<{
    phone: string;
    status: PresenceStatus;
  }>({
    phone: '',
    status: 'going',
  });

  const matchLabel = useMemo(() => formatDateTimePtBr(match.scheduled_at), [match.scheduled_at]);

  const options = [
    { id: 'going', label: 'CONFIRMAR' },
    { id: 'maybe', label: 'TALVEZ' },
    { id: 'not_going', label: 'DESCONFIRMAR' },
  ];

  const submit = (e: FormEvent) => {
    e.preventDefault();

    form.post(route('presence.store', token), {
      preserveScroll: true,
    });
  };

  return (
    <div className="retro-body-bg retro-scanlines flex min-h-screen flex-col items-center pt-6">
      <Head title={`Presença — ${group.name}`} />

      <div className="w-full max-w-xl px-3">
        <RetroSectionHeader title="PRESENÇA" />

        <div className="mt-4">
          <RetroInfoCard>
            {status ? <RetroInlineInfo message={status} /> : null}

            <div className="flex flex-col gap-1">
              <div className="retro-text-shadow text-base text-[#a0b0ff]">GRUPO</div>
              <div className="retro-text-shadow text-lg text-[#ffd700]">{group.name}</div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="retro-text-shadow text-base text-[#a0b0ff]">PARTIDA</div>
              <div className="retro-text-shadow text-lg text-white">{matchLabel}</div>
              {match.location_name ? (
                <div className="retro-text-shadow text-sm text-[#a0b0ff]">
                  {match.location_name}
                </div>
              ) : null}
            </div>

            {expired ? (
              <RetroInlineInfo message="Este link expirou. A presença não pode mais ser atualizada." />
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <RetroTextInput
                  id="phone"
                  label="TELEFONE"
                  value={form.data.phone}
                  onChange={(e) => form.setData('phone', maskPhone(e.target.value))}
                  autoComplete="tel"
                  placeholder="(DD) 9xxxx-xxxx"
                  disabled={form.processing}
                />
                {form.errors.phone ? (
                  <div className="text-sm text-red-600">{form.errors.phone}</div>
                ) : null}

                <RetroRadio
                  label="PRESENÇA"
                  options={options}
                  activeId={form.data.status}
                  onChange={(id) => form.setData('status', id as PresenceStatus)}
                />

                <RetroButton type="submit" variant="success" disabled={form.processing}>
                  ATUALIZAR
                </RetroButton>
              </form>
            )}
          </RetroInfoCard>
        </div>
      </div>
    </div>
  );
}
