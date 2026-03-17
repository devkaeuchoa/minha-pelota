import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Group, PageProps } from '@/types';
import { slugifyKebab } from '@/utils/slug';
import {
  RetroButton,
  RetroFormField,
  RetroLayout,
  RetroPanel,
  RetroRadio,
  RetroSectionHeader,
  RetroTextInput,
  RetroValueDisplay,
} from '@/Components/retro';

const weekdayOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

interface FormProps extends PageProps {
  group: Group | null;
  submitUrl: string;
  method: 'post' | 'put';
  title: string;
}

export default function Form({ group, submitUrl, method, title }: FormProps) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: group?.name ?? '',
    slug: group?.slug ?? '',
    weekday: group?.weekday?.toString() ?? '',
    time: group?.time ?? '',
    location_name: group?.location_name ?? '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (method === 'post') {
      post(submitUrl);
    } else {
      put(submitUrl);
    }
  };

  const activeWeekdayId = data.weekday;

  return (
    <RetroLayout>
      <Head title={title} />

      <RetroSectionHeader title="1. CONFIGURAÇÃO DO GRUPO" />
      <RetroPanel>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <RetroFormField label="NOME" htmlFor="group_name">
            <RetroTextInput
              id="group_name"
              value={data.name}
              onChange={(e) => {
                const value = e.target.value;
                setData((current) => ({
                  ...current,
                  name: value,
                  slug: slugifyKebab(value),
                }));
              }}
            />
            {errors.name && (
              <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.name}</p>
            )}
          </RetroFormField>

          <RetroFormField label="SLUG" htmlFor="group_slug">
            <RetroTextInput
              id="group_slug"
              value={data.slug}
              onChange={(e) => setData('slug', e.target.value)}
            />
            {errors.slug && (
              <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.slug}</p>
            )}
          </RetroFormField>

          <RetroRadio
            label="DIA DA SEMANA"
            options={weekdayOptions.map((option) => ({
              id: option.value,
              label: option.label,
            }))}
            activeId={activeWeekdayId}
            onChange={(id) => setData('weekday', id === activeWeekdayId ? '' : id)}
          />
          {errors.weekday && (
            <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.weekday}</p>
          )}

          <RetroFormField label="HORÁRIO" htmlFor="group_time">
            <RetroTextInput
              id="group_time"
              type="time"
              value={data.time}
              onChange={(e) => setData('time', e.target.value)}
            />
            {errors.time && (
              <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.time}</p>
            )}
          </RetroFormField>

          <RetroFormField label="LOCAL" htmlFor="group_location">
            <RetroTextInput
              id="group_location"
              value={data.location_name}
              onChange={(e) => setData('location_name', e.target.value)}
            />
            {errors.location_name && (
              <p className="retro-text-shadow text-sm text-[#ff0055]">
                {errors.location_name}
              </p>
            )}
          </RetroFormField>

          <div className="mt-2 flex gap-3">
            <RetroButton type="submit" variant="success" disabled={processing}>
              SALVAR
            </RetroButton>
            <Link href="/groups" className="flex-1">
              <RetroButton type="button" variant="danger">
                CANCELAR
              </RetroButton>
            </Link>
          </div>
        </form>
      </RetroPanel>
    </RetroLayout>
  );
}
