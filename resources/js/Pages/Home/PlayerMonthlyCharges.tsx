import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { RetroInfoCard, RetroSectionHeader, RetroValueDisplay } from '@/Components/retro';
import { useLocale } from '@/hooks/useLocale';
import { formatBrlCurrencyValue } from '@/utils/currency';

interface MonthlyChargeEntry {
  reference_month: string;
  status: 'paid' | 'unpaid';
  amount: number;
  paid_amount: number;
}

interface PlayerMonthlyChargesProps extends PageProps {
  group: {
    id: number;
    name: string;
    currency: string;
    payment_day: number | null;
  };
  currentMonth: MonthlyChargeEntry | null;
  history: MonthlyChargeEntry[];
}

function formatMonthLabel(referenceMonth: string): string {
  const [year, month] = referenceMonth.split('-').map((part) => Number.parseInt(part, 10));
  return new Date(year, month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .toUpperCase();
}

export default function PlayerMonthlyCharges({
  group,
  currentMonth,
  history,
}: PlayerMonthlyChargesProps) {
  const { t } = useLocale();

  return (
    <RetroAppShell activeId="home">
      <Head title={t('monthlyCharges.title')} />
      <RetroSectionHeader title={t('monthlyCharges.title')} />

      <RetroInfoCard>
        <div className="flex flex-col gap-4">
          <RetroValueDisplay label="GRUPO" value={group.name} />

          <div className="flex flex-col gap-2">
            <span className="retro-text-shadow text-sm text-[#a0b0ff]">
              {t('monthlyCharges.currentMonth')}
            </span>
            {currentMonth ? (
              <div className="flex flex-wrap gap-3">
                <RetroValueDisplay
                  label={formatMonthLabel(currentMonth.reference_month)}
                  value={
                    currentMonth.status === 'paid'
                      ? t('monthlyCharges.status.paid')
                      : t('monthlyCharges.status.unpaid')
                  }
                />
                <RetroValueDisplay
                  label="VALOR"
                  value={formatBrlCurrencyValue(String(currentMonth.amount))}
                />
              </div>
            ) : (
              <p className="retro-text-shadow text-sm text-[#a0b0ff]">
                {t('monthlyCharges.noCharge')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="retro-text-shadow text-sm text-[#a0b0ff]">
              {t('monthlyCharges.history')}
            </span>
            <div className="flex flex-col gap-2">
              {history.map((entry) => (
                <div
                  key={entry.reference_month}
                  className={`flex items-center justify-between rounded border-2 border-[#4060c0] p-2 ${
                    entry.status === 'paid' ? 'bg-[#214f3a]' : 'bg-[#1e348c]'
                  }`}
                >
                  <span className="retro-text-shadow text-sm text-[#ffd700]">
                    {formatMonthLabel(entry.reference_month)}
                  </span>
                  <span className="retro-text-shadow text-sm text-white">
                    {entry.status === 'paid'
                      ? t('monthlyCharges.status.paid')
                      : t('monthlyCharges.status.unpaid')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
