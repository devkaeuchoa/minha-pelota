/* global route */
import { Head, router } from '@inertiajs/react';
import { Group, MatchPayment, PageProps } from '@/types';
import {
  RetroBreadcrumbs,
  RetroButton,
  RetroFormField,
  RetroInfoCard,
  RetroInlineInfo,
  RetroSectionHeader,
  RetroSelect,
  RetroTable,
  RetroTableCell,
  RetroTableHeaderCell,
  RetroTableHeaderRow,
  RetroTableRow,
  RetroTextInput,
  RetroValueDisplay,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { formatDateTimePtBr } from '@/utils/datetime';
import { FormEvent, useMemo, useState } from 'react';
import { formatBrlCurrencyValue, parseBrlCurrencyInput } from '@/utils/currency';
import { useLocale } from '@/hooks/useLocale';

interface MatchPaymentsManageProps extends PageProps {
  group: Pick<Group, 'id' | 'name'> & {
    has_monthly_fee: boolean;
    monthly_fee: number;
  };
  match: {
    id: number;
    scheduled_at: string;
    location_name: string | null;
    status: string;
  };
  players: Array<{
    id: number;
    name: string;
    nick: string;
    confirmed: boolean;
    payment: MatchPayment;
  }>;
  summary: {
    confirmed_count: number;
    paid_count: number;
    unpaid_count: number;
    dispensado_count: number;
  };
  status?: string;
  permissions?: {
    can_manage_payments?: boolean;
  };
}

type RowState = {
  payment_status: 'paid' | 'unpaid';
  paid_amount: number;
};

type PersistedPlayer = {
  id: number;
  payment: MatchPayment;
};

const toEditableStatus = (status: MatchPayment['status']): 'paid' | 'unpaid' =>
  status === 'paid' ? 'paid' : 'unpaid';

export default function Manage({
  group,
  match,
  players,
  summary,
  status,
  permissions,
}: MatchPaymentsManageProps) {
  const { t } = useLocale();
  const hasMonthlyFee = group.has_monthly_fee;
  const monthlyFee = group.monthly_fee;
  const [editingByPlayerId, setEditingByPlayerId] = useState<Record<number, RowState>>(() =>
    Object.fromEntries(
      players.map((player) => [
        player.id,
        {
          payment_status: toEditableStatus(player.payment.status),
          paid_amount:
            player.payment.paid_amount > 0
              ? player.payment.paid_amount
              : hasMonthlyFee
                ? monthlyFee
                : 0,
        },
      ]),
    ),
  );
  const [processingPlayerId, setProcessingPlayerId] = useState<number | null>(null);
  const [persistedPaymentByPlayerId, setPersistedPaymentByPlayerId] = useState<
    Record<number, MatchPayment>
  >(() => Object.fromEntries(players.map((player) => [player.id, player.payment])));
  const canManagePayments = permissions?.can_manage_payments ?? true;
  const [poolTotal, setPoolTotal] = useState<string>('0');

  const matchLabel = useMemo(() => formatDateTimePtBr(match.scheduled_at), [match.scheduled_at]);
  const poolPerPlayer = useMemo(() => {
    if (summary.confirmed_count === 0) return 0;
    const total = Number(poolTotal);
    if (Number.isNaN(total) || total < 0) return 0;
    return total / summary.confirmed_count;
  }, [poolTotal, summary.confirmed_count]);

  const handleSubmit =
    (playerId: number) =>
    (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      const row = editingByPlayerId[playerId];
      if (!row) return;

      setProcessingPlayerId(playerId);
      router.patch(
        route('groups.matches.payments.update', {
          group: group.id,
          match: match.id,
          player: playerId,
        }),
        row,
        {
          preserveScroll: true,
          onSuccess: (page) => {
            const persistedPlayers = (page.props.players ?? []) as PersistedPlayer[];
            const persistedPlayer = persistedPlayers.find((entry) => entry.id === playerId);

            if (!persistedPlayer) return;

            setEditingByPlayerId((prev) => ({
              ...prev,
              [playerId]: {
                payment_status: toEditableStatus(persistedPlayer.payment.status),
                paid_amount: persistedPlayer.payment.paid_amount,
              },
            }));
            setPersistedPaymentByPlayerId((prev) => ({
              ...prev,
              [playerId]: persistedPlayer.payment,
            }));
          },
          onFinish: () => setProcessingPlayerId(null),
        },
      );
    };

  const setPaymentStatus = (playerId: number, paymentStatus: 'paid' | 'unpaid') => {
    setEditingByPlayerId((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        payment_status: paymentStatus,
      },
    }));
  };

  const setPaidAmount = (playerId: number, value: string) => {
    const next = Number.parseFloat(value);
    setEditingByPlayerId((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        paid_amount: Number.isFinite(next) && next >= 0 ? next : 0,
      },
    }));
  };

  const applyPoolToAllRows = () => {
    if (summary.confirmed_count === 0) return;
    setEditingByPlayerId((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([playerId, row]) => [
          Number(playerId),
          {
            ...row,
            paid_amount: poolPerPlayer,
            payment_status: 'unpaid',
          },
        ]),
      ),
    );
  };

  return (
    <RetroAppShell activeId="groups">
      <Head title={`Pagamentos — ${group.name}`} />
      <RetroBreadcrumbs
        items={[
          { label: t('common.groups'), href: route('groups.index') },
          { label: group.name, href: route('groups.show', group.id) },
          { label: t('breadcrumbs.payments'), href: route('groups.payments.calendar', group.id) },
          { label: t('breadcrumbs.match') },
        ]}
      />
      <RetroSectionHeader title="PAGAMENTOS DA PARTIDA" />

      <RetroInfoCard>
        <div className="flex flex-col gap-4">
          {status ? <RetroInlineInfo message={status} /> : null}

          <div className="flex flex-wrap gap-3">
            <RetroValueDisplay label="PARTIDA" value={matchLabel} />
            {match.location_name ? (
              <RetroValueDisplay label="LOCAL" value={match.location_name} />
            ) : null}
          </div>

          <div className="flex flex-row flex-wrap gap-3 md:justify-between">
            <RetroValueDisplay label="CONFIRMADOS" value={summary.confirmed_count.toString()} />
            <RetroValueDisplay label="PAGOS" value={summary.paid_count.toString()} />
            <RetroValueDisplay label="NÃO PAGOS" value={summary.unpaid_count.toString()} />
            <RetroValueDisplay
              label={t('payments.dispensadoCount')}
              value={summary.dispensado_count.toString()}
            />
          </div>

          {!hasMonthlyFee ? (
            <div className="rounded border-2 border-[#4060c0] bg-[#1e348c] p-3">
              <div className="grid gap-3 md:grid-cols-4 md:items-end">
                <RetroValueDisplay
                  label={t('payments.pool.presentPlayers')}
                  value={summary.confirmed_count.toString()}
                />
                <RetroFormField
                  label={t('payments.pool.targetAmount')}
                  htmlFor="pool_total_to_collect"
                >
                  <RetroTextInput
                    id="pool_total_to_collect"
                    type="text"
                    inputMode="numeric"
                    value={formatBrlCurrencyValue(poolTotal)}
                    onChange={(event) => setPoolTotal(parseBrlCurrencyInput(event.target.value))}
                  />
                </RetroFormField>
                <RetroValueDisplay
                  label={t('payments.pool.totalPerPlayer')}
                  value={formatBrlCurrencyValue(poolPerPlayer.toFixed(2))}
                />
                <RetroButton
                  type="button"
                  variant="neutral"
                  size="sm"
                  disabled={!canManagePayments || summary.confirmed_count === 0}
                  onClick={applyPoolToAllRows}
                >
                  {t('payments.pool.applyAll')}
                </RetroButton>
              </div>
            </div>
          ) : null}

          <RetroTable>
            <thead>
              <RetroTableHeaderRow>
                <RetroTableHeaderCell>JOGADOR</RetroTableHeaderCell>
                <RetroTableHeaderCell>PRESENÇA</RetroTableHeaderCell>
                <RetroTableHeaderCell>DÍVIDA ANTERIOR</RetroTableHeaderCell>
                <RetroTableHeaderCell>STATUS</RetroTableHeaderCell>
                <RetroTableHeaderCell>{t('payments.valueToPayColumn')}</RetroTableHeaderCell>
                <RetroTableHeaderCell>AÇÃO</RetroTableHeaderCell>
              </RetroTableHeaderRow>
            </thead>
            <tbody>
              {players.map((player, index) => {
                const current = editingByPlayerId[player.id];
                const persistedPayment = persistedPaymentByPlayerId[player.id];
                const isProcessing = processingPlayerId === player.id;
                const isMonthlyExempt = persistedPayment.is_monthly_exempt;
                const controlsDisabled = !canManagePayments || isProcessing || isMonthlyExempt;

                return (
                  <RetroTableRow
                    key={player.id}
                    index={index}
                    className={persistedPayment.status === 'paid' ? 'bg-[#214f3a]' : undefined}
                  >
                    <RetroTableCell>
                      <div className="flex flex-col">
                        <span>{player.name}</span>
                        <span className="text-xs text-[#a0b0ff]">{player.nick}</span>
                      </div>
                    </RetroTableCell>
                    <RetroTableCell>
                      {player.confirmed
                        ? t('payments.presenceConfirmed')
                        : t('payments.presenceNotConfirmed')}
                    </RetroTableCell>
                    <RetroTableCell>
                      {player.payment.has_previous_debt
                        ? `SIM (${player.payment.previous_debt_matches_count} partida(s))`
                        : 'NÃO'}
                    </RetroTableCell>
                    <RetroTableCell>
                      {isMonthlyExempt ? (
                        <span className="text-xs font-bold text-[#ffd700]">
                          {t('payments.exemptMonthlyBadge')}
                        </span>
                      ) : (
                        <RetroSelect
                          value={current.payment_status}
                          disabled={controlsDisabled}
                          onChange={(event) =>
                            setPaymentStatus(player.id, event.target.value as 'paid' | 'unpaid')
                          }
                          options={[
                            { value: 'unpaid', label: 'NÃO PAGO' },
                            { value: 'paid', label: 'PAGO' },
                          ]}
                        />
                      )}
                      {!player.confirmed && !isMonthlyExempt ? (
                        <div className="mt-1 text-xs text-[#a0b0ff]">
                          {t('payments.noAttendanceBadge')}
                        </div>
                      ) : null}
                    </RetroTableCell>
                    <RetroTableCell>
                      {isMonthlyExempt
                        ? formatBrlCurrencyValue('0')
                        : formatBrlCurrencyValue(String(current.paid_amount))}
                    </RetroTableCell>
                    <RetroTableCell>
                      <form onSubmit={handleSubmit(player.id)}>
                        <RetroButton
                          size="sm"
                          type="submit"
                          variant="success"
                          disabled={controlsDisabled}
                        >
                          {!canManagePayments
                            ? 'SEM PERMISSÃO'
                            : isProcessing
                              ? 'SALVANDO...'
                              : 'SALVAR'}
                        </RetroButton>
                      </form>
                    </RetroTableCell>
                  </RetroTableRow>
                );
              })}
            </tbody>
          </RetroTable>
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
