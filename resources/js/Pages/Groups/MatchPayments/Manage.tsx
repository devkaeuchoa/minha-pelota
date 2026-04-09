/* global route */
import { Head, router } from '@inertiajs/react';
import { Group, MatchPayment, PageProps } from '@/types';
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
import { formatDateTimePtBr } from '@/utils/datetime';
import { FormEvent, useMemo, useState } from 'react';

interface MatchPaymentsManageProps extends PageProps {
  group: Pick<Group, 'id' | 'name'>;
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

export default function Manage({
  group,
  match,
  players,
  summary,
  status,
  permissions,
}: MatchPaymentsManageProps) {
  const [editingByPlayerId, setEditingByPlayerId] = useState<Record<number, RowState>>(() =>
    Object.fromEntries(
      players.map((player) => [
        player.id,
        {
          payment_status: player.payment.status,
          paid_amount: player.payment.paid_amount,
          is_monthly_exempt: player.payment.is_monthly_exempt,
        },
      ]),
    ),
  );
  const [processingPlayerId, setProcessingPlayerId] = useState<number | null>(null);
  const canManagePayments = permissions?.can_manage_payments ?? true;

  const matchLabel = useMemo(() => formatDateTimePtBr(match.scheduled_at), [match.scheduled_at]);

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

          <RetroTable>
            <thead>
              <RetroTableHeaderRow>
                <RetroTableHeaderCell>JOGADOR</RetroTableHeaderCell>
                <RetroTableHeaderCell>DÍVIDA ANTERIOR</RetroTableHeaderCell>
                <RetroTableHeaderCell>STATUS</RetroTableHeaderCell>
                <RetroTableHeaderCell>VALOR PAGO (R$)</RetroTableHeaderCell>
                <RetroTableHeaderCell>ISENTO MENSALIDADE</RetroTableHeaderCell>
                <RetroTableHeaderCell>AÇÃO</RetroTableHeaderCell>
              </RetroTableHeaderRow>
            </thead>
            <tbody>
              {players.map((player, index) => {
                const current = editingByPlayerId[player.id];
                const isProcessing = processingPlayerId === player.id;
                const controlsDisabled = !canManagePayments || isProcessing;

                return (
                  <RetroTableRow key={player.id} index={index}>
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
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={current.paid_amount}
                        disabled={controlsDisabled || current.is_monthly_exempt}
                        onChange={(event) => setPaidAmount(player.id, event.target.value)}
                        className="retro-input w-full border-2 border-[#4060c0] bg-[#0b1340] px-2 py-1 text-[#ffd700] outline-none"
                      />
                    </RetroTableCell>
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
