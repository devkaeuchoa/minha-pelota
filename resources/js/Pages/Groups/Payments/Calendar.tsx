/* global route */
import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { Group, PageProps } from '@/types';
import {
  RetroButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroSectionHeader,
  RetroTable,
  RetroTableCell,
  RetroTableHeaderCell,
  RetroTableHeaderRow,
  RetroTableRow,
  RetroValueDisplay,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { formatBrlCurrencyValue } from '@/utils/currency';
import { useLocale } from '@/hooks/useLocale';

interface CalendarMatch {
  id: number;
  scheduled_at: string;
  status: string;
  summary: {
    paid_count: number;
    unpaid_count: number;
    dispensado_count: number;
  };
}

interface MonthlyChargeRow {
  player_id: number;
  name: string;
  nick: string;
  status: 'paid' | 'unpaid';
  paid_amount: number;
}

interface CalendarProps extends PageProps {
  group: Pick<Group, 'id' | 'name'> & {
    has_monthly_fee: boolean;
    monthly_fee: number;
    currency: string;
    payment_day: number | null;
  };
  month: string;
  has_previous_month_matches: boolean;
  has_next_month_matches: boolean;
  matches: CalendarMatch[];
  monthly_charges: MonthlyChargeRow[];
  summary: {
    monthly_paid_count: number;
    monthly_total_count: number;
  };
  status?: string;
  permissions?: {
    can_manage_payments?: boolean;
  };
}

const WEEKDAY_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

type CalendarCell = CalendarMatch | { day: number } | null;

function buildCalendarWeeks(month: string, matches: CalendarMatch[]): CalendarCell[][] {
  const [year, monthIndex] = month.split('-').map((part) => Number.parseInt(part, 10));
  const firstOfMonth = new Date(year, monthIndex - 1, 1);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const matchesByDay = new Map<number, CalendarMatch>();
  matches.forEach((match) => {
    const day = new Date(match.scheduled_at).getDate();
    matchesByDay.set(day, match);
  });

  const cells: CalendarCell[] = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(matchesByDay.get(day) ?? { day });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split('-').map((part) => Number.parseInt(part, 10));
  const date = new Date(year, monthIndex - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function Calendar({
  group,
  month,
  has_previous_month_matches: hasPreviousMonthMatches,
  has_next_month_matches: hasNextMonthMatches,
  matches,
  monthly_charges: monthlyCharges,
  summary,
  status,
  permissions,
}: CalendarProps) {
  const { t } = useLocale();
  const canManagePayments = permissions?.can_manage_payments ?? true;
  const weeks = useMemo(() => buildCalendarWeeks(month, matches), [month, matches]);
  const [calendarYear, calendarMonthIndex] = useMemo(
    () => month.split('-').map((part) => Number.parseInt(part, 10)),
    [month],
  );
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const monthLabel = useMemo(() => {
    return new Date(calendarYear, calendarMonthIndex - 1, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }, [calendarYear, calendarMonthIndex]);

  const toggleMonthlyCharge = (playerId: number, nextStatus: 'paid' | 'unpaid') => {
    router.patch(
      route('groups.monthly-charges.update', { group: group.id, player: playerId }),
      {
        month,
        payment_status: nextStatus,
        paid_amount: nextStatus === 'paid' ? group.monthly_fee : 0,
      },
      { preserveScroll: true },
    );
  };

  return (
    <RetroAppShell activeId="groups">
      <Head title={`Pagamentos — ${group.name}`} />
      <RetroSectionHeader title={t('payments.calendar.title')} />

      <RetroInfoCard>
        <div className="flex flex-col gap-4">
          {status ? <RetroInlineInfo message={status} /> : null}

          <div className="flex items-center justify-between gap-3">
            {hasPreviousMonthMatches ? (
              <Link
                href={route('groups.payments.calendar', {
                  group: group.id,
                  month: shiftMonth(month, -1),
                })}
              >
                <RetroButton type="button" variant="neutral" size="sm">
                  {t('payments.calendar.previousMonth')}
                </RetroButton>
              </Link>
            ) : (
              <div />
            )}
            <RetroValueDisplay label="MÊS" value={monthLabel.toUpperCase()} />
            {hasNextMonthMatches ? (
              <Link
                href={route('groups.payments.calendar', {
                  group: group.id,
                  month: shiftMonth(month, 1),
                })}
              >
                <RetroButton type="button" variant="neutral" size="sm">
                  {t('payments.calendar.nextMonth')}
                </RetroButton>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {group.has_monthly_fee ? (
            <div className="flex flex-wrap gap-3">
              <RetroValueDisplay
                label={t('payments.calendar.monthlyChargesPaidCount')}
                value={`${summary.monthly_paid_count}/${summary.monthly_total_count}`}
              />
              <RetroValueDisplay
                label="VALOR"
                value={formatBrlCurrencyValue(String(group.monthly_fee))}
              />
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-1 text-center">
              <thead>
                <tr>
                  {WEEKDAY_LABELS.map((label) => (
                    <th key={label} className="retro-text-shadow w-[14.28%] p-2 text-lg text-white">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((cell, cellIndex) => {
                      if (!cell) {
                        return (
                          <td key={cellIndex} className="p-0 align-top">
                            <div className="min-h-[72px] rounded border-2 border-[#1e348c]" />
                          </td>
                        );
                      }

                      if (!('id' in cell)) {
                        const cellDate = new Date(calendarYear, calendarMonthIndex - 1, cell.day);
                        cellDate.setHours(0, 0, 0, 0);
                        const isPast = cellDate.getTime() < today.getTime();
                        const isToday = cellDate.getTime() === today.getTime();

                        return (
                          <td key={cellIndex} className="p-0 align-top">
                            <div
                              className={`retro-text-shadow min-h-[72px] rounded border-2 p-2 text-lg text-white ${
                                isToday ? 'border-[#ffd700]' : 'border-[#1e348c]'
                              } ${isPast ? 'opacity-40 grayscale' : ''}`}
                            >
                              {cell.day}
                            </div>
                          </td>
                        );
                      }

                      const day = new Date(cell.scheduled_at).getDate();
                      const totalPlayers =
                        cell.summary.paid_count +
                        cell.summary.unpaid_count +
                        cell.summary.dispensado_count;
                      const allPaid = totalPlayers > 0 && cell.summary.paid_count === totalPlayers;

                      const cellDate = new Date(cell.scheduled_at);
                      cellDate.setHours(0, 0, 0, 0);
                      const isPastMatch = cellDate.getTime() < today.getTime();
                      const isToday = cellDate.getTime() === today.getTime();
                      const hasPendingPayments = cell.summary.unpaid_count > 0;
                      const isOverdue = isPastMatch && hasPendingPayments;

                      const bgClass = allPaid
                        ? 'bg-[#214f3a]'
                        : isOverdue
                          ? 'bg-[#5c1f2e]'
                          : 'bg-[#1e348c]';

                      const borderClass = isToday
                        ? 'border-[#ffd700]'
                        : isOverdue
                          ? 'border-[#ff0055]'
                          : 'border-transparent';

                      return (
                        <td key={cellIndex} className="p-0 align-top">
                          <Link
                            href={route('groups.matches.payments.manage', {
                              group: group.id,
                              match: cell.id,
                            })}
                            className={`retro-text-shadow flex min-h-[72px] flex-col gap-0.5 rounded border-2 p-2 text-base ${bgClass} ${borderClass}`}
                          >
                            <span className="text-xl leading-tight text-[#ffd700]">{day}</span>
                            <span className="truncate text-sm leading-tight text-white">
                              {cell.summary.paid_count}/{totalPlayers} PAGOS
                            </span>
                            {isOverdue ? (
                              <span className="retro-text-shadow truncate text-sm leading-tight text-[#ff8080]">
                                {t('payments.calendar.overdue')}
                              </span>
                            ) : null}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {matches.length === 0 ? (
            <p className="retro-text-shadow text-sm text-[#a0b0ff]">
              {t('payments.calendar.noMatches')}
            </p>
          ) : null}

          {group.has_monthly_fee ? (
            <div className="flex flex-col gap-2">
              <RetroSectionHeader title={t('payments.calendar.monthlyChargesTitle')} />
              <RetroTable>
                <thead>
                  <RetroTableHeaderRow>
                    <RetroTableHeaderCell>JOGADOR</RetroTableHeaderCell>
                    <RetroTableHeaderCell>STATUS</RetroTableHeaderCell>
                    <RetroTableHeaderCell>AÇÃO</RetroTableHeaderCell>
                  </RetroTableHeaderRow>
                </thead>
                <tbody>
                  {monthlyCharges.map((charge, index) => (
                    <RetroTableRow
                      key={charge.player_id}
                      index={index}
                      className={charge.status === 'paid' ? 'bg-[#214f3a]' : undefined}
                    >
                      <RetroTableCell>
                        <div className="flex flex-col">
                          <span>{charge.name}</span>
                          <span className="text-xs text-[#a0b0ff]">{charge.nick}</span>
                        </div>
                      </RetroTableCell>
                      <RetroTableCell>
                        {charge.status === 'paid'
                          ? t('monthlyCharges.status.paid')
                          : t('monthlyCharges.status.unpaid')}
                      </RetroTableCell>
                      <RetroTableCell>
                        <RetroButton
                          size="sm"
                          type="button"
                          variant={charge.status === 'paid' ? 'neutral' : 'success'}
                          disabled={!canManagePayments}
                          onClick={() =>
                            toggleMonthlyCharge(
                              charge.player_id,
                              charge.status === 'paid' ? 'unpaid' : 'paid',
                            )
                          }
                        >
                          {charge.status === 'paid'
                            ? t('payments.calendar.markUnpaid')
                            : t('payments.calendar.markPaid')}
                        </RetroButton>
                      </RetroTableCell>
                    </RetroTableRow>
                  ))}
                </tbody>
              </RetroTable>
            </div>
          ) : null}
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
