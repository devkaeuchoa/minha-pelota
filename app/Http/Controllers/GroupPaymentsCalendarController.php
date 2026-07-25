<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesGroupOwnerAdmin;
use App\Models\Group;
use App\Models\MatchPayment;
use App\Models\MonthlyCharge;
use App\Models\Player;
use App\Services\Payments\SyncMatchPaymentsAction;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupPaymentsCalendarController extends Controller
{
    use AuthorizesGroupOwnerAdmin;

    public function show(Request $request, Group $group, SyncMatchPaymentsAction $syncPaymentsAction): Response
    {
        $this->authorizeOwnerOrAdmin($request, $group);

        $month = $this->resolveMonth($request);
        $referenceMonth = $month->toDateString();

        $matches = $group->matches()
            ->forPeriod($month, $month->endOfMonth())
            ->orderBy('scheduled_at')
            ->get();

        $matches->each(fn ($match) => $syncPaymentsAction->execute($match));

        $paymentsByMatchId = MatchPayment::query()
            ->whereIn('match_id', $matches->pluck('id'))
            ->get()
            ->groupBy('match_id');

        $matchesPayload = $matches->map(function ($match) use ($paymentsByMatchId): array {
            $payments = $paymentsByMatchId->get($match->id, collect());

            return [
                'id' => $match->id,
                'scheduled_at' => $match->scheduled_at->toISOString(),
                'status' => $match->status,
                'summary' => [
                    'paid_count' => $payments->where('payment_status', 'paid')->count(),
                    'unpaid_count' => $payments->where('payment_status', 'unpaid')->count(),
                    'dispensado_count' => $payments->where('payment_status', 'dispensado')->count(),
                ],
            ];
        })->values();

        $previousMonth = $month->subMonthNoOverflow();
        $nextMonth = $month->addMonthNoOverflow();

        $hasPreviousMonthMatches = $group->matches()
            ->forPeriod($previousMonth, $previousMonth->endOfMonth())
            ->exists();
        $hasNextMonthMatches = $group->matches()
            ->forPeriod($nextMonth, $nextMonth->endOfMonth())
            ->exists();

        $groupPlayers = $group->players()->orderBy('name')->get();

        $chargesByPlayerId = MonthlyCharge::query()
            ->where('group_id', $group->id)
            ->where('reference_month', $referenceMonth)
            ->get()
            ->keyBy('player_id');

        $monthlyCharges = $groupPlayers->map(function (Player $player) use ($chargesByPlayerId): array {
            $charge = $chargesByPlayerId->get($player->id);

            return [
                'player_id' => $player->id,
                'name' => $player->name,
                'nick' => $player->nick,
                'status' => $charge?->payment_status ?? 'unpaid',
                'paid_amount' => (float) ($charge?->paid_amount ?? 0),
            ];
        })->values();

        return Inertia::render('Groups/Payments/Calendar', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'has_monthly_fee' => (float) ($group->settings?->monthly_fee ?? 0) > 0,
                'monthly_fee' => (float) ($group->settings?->monthly_fee ?? 0),
                'currency' => $group->currency,
                'payment_day' => $group->payment_day,
            ],
            'month' => $referenceMonth,
            'has_previous_month_matches' => $hasPreviousMonthMatches,
            'has_next_month_matches' => $hasNextMonthMatches,
            'matches' => $matchesPayload,
            'monthly_charges' => $monthlyCharges,
            'summary' => [
                'monthly_paid_count' => $monthlyCharges->where('status', 'paid')->count(),
                'monthly_total_count' => $monthlyCharges->count(),
            ],
            'status' => session('status'),
        ]);
    }

    private function resolveMonth(Request $request): CarbonImmutable
    {
        $month = $request->query('month');

        if (is_string($month) && preg_match('/^\d{4}-\d{2}$/', $month)) {
            return CarbonImmutable::createFromFormat('Y-m-d', $month.'-01')->startOfMonth();
        }

        return CarbonImmutable::now()->startOfMonth();
    }
}
