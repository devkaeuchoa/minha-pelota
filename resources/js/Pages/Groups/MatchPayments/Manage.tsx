/* global route */
import { Head, router } from '@inertiajs/react';
import { Group, MatchPayment, PageProps } from '@/types';
import {
  RetroButton,
  RetroFormField,
  RetroInfoCard,
  RetroInlineInfo,
  RetroSectionHeader,
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
    payment: MatchPayment;
  }>;
  summary: {
    confirmed_count: number;
    paid_count: number;
    unpaid_count: number;
  };
  status?: string;
  permissions?: {
    can_manage_payments?: boolean;
  };
}

type RowState = {
  payment_status: 'paid' | 'unpaid';
  paid_amount: number;
  is_monthly_exempt: boolean;
};

type PersistedPlayer = {
  id: number;
  payment: RowState;
};

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
          payment_status: player.payment.status,
          paid_amount:
            player.payment.paid_amount > 0
              ? player.payment.paid_amount
              : hasMonthlyFee
                ? monthlyFee
                : 0,
          is_monthly_exempt: player.payment.is_monthly_exempt,
        },
      ]),
    ),
  );
  const [processingPlayerId, setProcessingPlayerId] = useState<number | null>(null);
  const [persistedStatusByPlayerId, setPersistedStatusByPlayerId] = useState<
    Record<number, 'paid' | 'unpaid'>
  >(() =>
    Object.fromEntries(
      players.map((player) => [player.id, player.payment.status as 'paid' | 'unpaid']),
    ),
  );
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
              [playerId]: persistedPlayer.payment,
            }));
            setPersistedStatusByPlayerId((prev) => ({
              ...prev,
              [playerId]: persistedPlayer.payment.payment_status,
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

  const setMonthlyExempt = (playerId: number, checked: boolean) => {
    setEditingByPlayerId((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        is_monthly_exempt: checked,
        payment_status: checked ? 'paid' : prev[playerId].payment_status,
        paid_amount: checked ? 0 : prev[playerId].paid_amount,
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

          <div className="flex flex-row gap-3 md:justify-between">
            <RetroValueDisplay label="CONFIRMADOS" value={summary.confirmed_count.toString()} />
            <RetroValueDisplay label="PAGOS" value={summary.paid_count.toString()} />
            <RetroValueDisplay label="NÃO PAGOS" value={summary.unpaid_count.toString()} />
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
                <RetroTableHeaderCell>DÍVIDA ANTERIOR</RetroTableHeaderCell>
                <RetroTableHeaderCell>STATUS</RetroTableHeaderCell>
                <RetroTableHeaderCell>{t('payments.valueToPayColumn')}</RetroTableHeaderCell>
                {hasMonthlyFee ? (
                  <RetroTableHeaderCell>ISENTO MENSALIDADE</RetroTableHeaderCell>
                ) : null}
                <RetroTableHeaderCell>AÇÃO</RetroTableHeaderCell>
              </RetroTableHeaderRow>
            </thead>
            <tbody>
              {players.map((player, index) => {
                const current = editingByPlayerId[player.id];
                const isProcessing = processingPlayerId === player.id;
                const controlsDisabled = !canManagePayments || isProcessing;

                return (
                  <RetroTableRow
                    key={player.id}
                    index={index}
                    className={
                      persistedStatusByPlayerId[player.id] === 'paid' ? 'bg-[#214f3a]' : undefined
                    }
                  >
                    <RetroTableCell>
                      <div className="flex flex-col">
                        <span>{player.name}</span>
                        <span className="text-xs text-[#a0b0ff]">{player.nick}</span>
                      </div>
                    </RetroTableCell>
                    <RetroTableCell>
                      {player.payment.has_previous_debt
                        ? `SIM (${player.payment.previous_debt_matches_count} partida(s))`
                        : 'NÃO'}
                    </RetroTableCell>
                    <RetroTableCell>
                      <select
                        value={current.payment_status}
                        disabled={controlsDisabled || current.is_monthly_exempt}
                        onChange={(event) =>
                          setPaymentStatus(player.id, event.target.value as 'paid' | 'unpaid')
                        }
                        className="retro-input w-full border-2 border-[#4060c0] bg-[#0b1340] px-2 py-1 text-[#ffd700] outline-none"
                      >
                        <option value="unpaid">NÃO PAGO</option>
                        <option value="paid">PAGO</option>
                      </select>
                    </RetroTableCell>
                    <RetroTableCell>
                      {formatBrlCurrencyValue(String(current.paid_amount))}
                    </RetroTableCell>
                    {hasMonthlyFee ? (
                      <RetroTableCell>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={current.is_monthly_exempt}
                            disabled={controlsDisabled}
                            onChange={(event) => setMonthlyExempt(player.id, event.target.checked)}
                          />
                          {current.is_monthly_exempt ? 'SIM (MENSALIDADE)' : 'NÃO'}
                        </label>
                      </RetroTableCell>
                    ) : null}
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
