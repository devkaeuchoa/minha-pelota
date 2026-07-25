<?php

namespace App\Services\Payments;

use App\Models\Game;
use App\Models\MatchPayment;
use App\Models\MonthlyCharge;

class SyncMatchPaymentsAction
{
    public function execute(Game $match): void
    {
        $group = $match->group;
        $players = $group->players;
        $referenceMonth = $match->scheduled_at->copy()->startOfMonth()->toDateString();
        $monthlyFee = (float) ($group->settings?->monthly_fee ?? 0);

        foreach ($players as $player) {
            MonthlyCharge::query()->firstOrCreate(
                [
                    'group_id' => $group->id,
                    'player_id' => $player->id,
                    'reference_month' => $referenceMonth,
                ],
                [
                    'amount' => $monthlyFee,
                    'payment_status' => 'unpaid',
                    'paid_amount' => 0,
                ]
            );
        }

        $monthlyPaidPlayerIds = MonthlyCharge::query()
            ->where('group_id', $group->id)
            ->where('reference_month', $referenceMonth)
            ->where('payment_status', 'paid')
            ->pluck('player_id')
            ->all();

        $confirmedPlayerIds = $match->attendances()
            ->where('status', 'going')
            ->pluck('player_id')
            ->all();

        $existingPayments = MatchPayment::query()
            ->where('match_id', $match->id)
            ->whereIn('player_id', $players->pluck('id'))
            ->get()
            ->keyBy('player_id');

        foreach ($players as $player) {
            $isMonthlyExempt = in_array($player->id, $monthlyPaidPlayerIds, true);
            $isConfirmed = in_array($player->id, $confirmedPlayerIds, true);
            $status = $isMonthlyExempt ? 'paid' : ($isConfirmed ? 'unpaid' : 'dispensado');

            $existing = $existingPayments->get($player->id);

            if ($existing === null) {
                MatchPayment::query()->create([
                    'match_id' => $match->id,
                    'player_id' => $player->id,
                    'payment_status' => $status,
                    'paid_amount' => 0,
                    'is_monthly_exempt' => $isMonthlyExempt,
                ]);

                continue;
            }

            if ($existing->payment_status === 'dispensado' && $status !== 'dispensado') {
                $existing->update([
                    'payment_status' => $status,
                    'paid_amount' => $isMonthlyExempt ? 0 : $existing->paid_amount,
                    'is_monthly_exempt' => $isMonthlyExempt,
                ]);
            }
        }
    }
}
