/* global route */

import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Group, PageProps } from '@/types';
import { slugifyKebab } from '@/utils/slug';
import { resolveGroupSettings } from '@/utils/groups';
import { formatBrlCurrencyValue, parseBrlCurrencyInput } from '@/utils/currency';
import {
  RetroButton,
  RetroFormField,
  RetroLevelSelector,
  RetroPanel,
  RetroRadio,
  RetroSectionHeader,
  RetroTextInput,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { useLocale } from '@/hooks/useLocale';

const weekdayOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

const recurrenceLevels = [
  { id: 'none', label: 'NENHUMA' },
  { id: 'weekly', label: 'SEMANAL' },
  { id: 'biweekly', label: 'QUINZENAL' },
  { id: 'monthly', label: 'MENSAL' },
];

interface FormProps extends PageProps {
  group: Group | null;
  submitUrl: string;
  method: 'post' | 'put';
  title: string;
}

export default function Form({ group, submitUrl, method, title }: FormProps) {
  const { t } = useLocale();
  const settings = group ? resolveGroupSettings(group) : null;
  const initialMonthlyFeeValue = settings?.monthly_fee ?? group?.monthly_fee ?? null;
  const initialHasMonthlyFee =
    group?.has_monthly_fee === true ||
    (typeof initialMonthlyFeeValue === 'number' && initialMonthlyFeeValue > 0);
  const [hasMonthlyFee, setHasMonthlyFee] = useState(initialHasMonthlyFee);
  const { data, setData, transform, post, put, processing, errors } = useForm({
    name: group?.name ?? '',
    slug: group?.slug ?? '',
    weekday: settings?.default_weekday?.toString() ?? '',
    recurrence: settings?.recurrence ?? 'weekly',
    time: settings?.default_time ?? '',
    location_name: group?.location_name ?? '',
    monthly_fee:
      typeof initialMonthlyFeeValue === 'number' && initialMonthlyFeeValue > 0
        ? String(initialMonthlyFeeValue)
        : '0',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const identityTransform = (current: typeof data) => current;

    transform((current) => ({
      ...current,
      monthly_fee: hasMonthlyFee ? (current.monthly_fee === '' ? '0' : current.monthly_fee) : '0',
    }));

    if (method === 'post') {
      post(submitUrl, {
        onFinish: () => transform(identityTransform),
      });
    } else {
      put(submitUrl, {
        onFinish: () => transform(identityTransform),
      });
    }
  };

  const activeWeekdayId = data.weekday;

  return (
    <RetroAppShell activeId="groups">
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

          <RetroLevelSelector
            label="RECORRÊNCIA"
            levels={recurrenceLevels}
            activeId={data.recurrence}
            onChange={(id) => setData('recurrence', id)}
          />
          {errors.recurrence && (
            <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.recurrence}</p>
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
              <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.location_name}</p>
            )}
          </RetroFormField>

          <RetroRadio
            label={t('groups.form.monthlyFeeEnabled')}
            options={[
              { id: 'yes', label: t('groups.form.yes') },
              { id: 'no', label: t('groups.form.no') },
            ]}
            activeId={hasMonthlyFee ? 'yes' : 'no'}
            onChange={(id) => {
              const enabled = id === 'yes';
              setHasMonthlyFee(enabled);
              setData('monthly_fee', enabled ? data.monthly_fee : '0');
            }}
          />

          {hasMonthlyFee ? (
            <RetroFormField label={t('groups.form.monthlyFeeAmount')} htmlFor="group_monthly_fee">
              <RetroTextInput
                id="group_monthly_fee"
                type="text"
                inputMode="numeric"
                value={formatBrlCurrencyValue(data.monthly_fee)}
                onChange={(e) => setData('monthly_fee', parseBrlCurrencyInput(e.target.value))}
              />
              {errors.monthly_fee && (
                <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.monthly_fee}</p>
              )}
            </RetroFormField>
          ) : null}

          <div className="mt-2 flex gap-3">
            <Link href={route('groups.index')} className="flex-1">
              <RetroButton type="button" variant="danger">
                CANCELAR
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
