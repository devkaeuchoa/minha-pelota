<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesGroupOwnerAdmin;
use App\Http\Requests\UpdateMatchPaymentRequest;
use App\Models\Game;
use App\Models\Group;
use App\Models\MatchPayment;
use App\Models\MonthlyCharge;
use App\Models\Player;
use App\Services\Payments\SyncMatchPaymentsAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupMatchPaymentController extends Controller
{
    use AuthorizesGroupOwnerAdmin;

    public function sync(Request $request, Group $group, Game $match, SyncMatchPaymentsAction $action): RedirectResponse
    {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $action->execute($match);

        return redirect()
            ->route('groups.matches.payments.manage', [
                'group' => $group->id,
                'match' => $match->id,
            ])
            ->with('status', 'Pagamentos sincronizados.');
    }

    public function manage(Request $request, Group $group, Game $match, SyncMatchPaymentsAction $action): Response
    {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $action->execute($match);

        $groupPlayers = $group->players()->orderBy('name')->get();

        $confirmedPlayerIds = $match->attendances()
            ->where('status', 'going')
            ->pluck('player_id')
            ->all();

        $paymentsByPlayerId = MatchPayment::query()
            ->where('match_id', $match->id)
            ->whereIn('player_id', $groupPlayers->pluck('id'))
            ->get()
            ->keyBy('player_id');

        $players = $groupPlayers->map(function (Player $player) use ($match, $paymentsByPlayerId, $confirmedPlayerIds): array {
            /** @var MatchPayment|null $payment */
            $payment = $paymentsByPlayerId->get($player->id);
            $previousDebtMatches = MatchPayment::query()
                ->where('player_id', $player->id)
                ->where('payment_status', 'unpaid')
                ->where('is_monthly_exempt', false)
                ->where('match_id', '!=', $match->id)
                ->whereHas('match', function ($query) use ($match): void {
                    $query->where('group_id', $match->group_id)
                        ->where('scheduled_at', '<', $match->scheduled_at);
                })
                ->count();

            return [
                'id' => $player->id,
                'name' => $player->name,
                'nick' => $player->nick,
                'confirmed' => in_array($player->id, $confirmedPlayerIds, true),
                'payment' => [
                    'status' => $payment?->payment_status ?? 'dispensado',
                    'paid_amount' => (float) ($payment?->paid_amount ?? 0),
                    'is_monthly_exempt' => (bool) ($payment?->is_monthly_exempt ?? false),
                    'has_previous_debt' => $previousDebtMatches > 0,
                    'previous_debt_matches_count' => $previousDebtMatches,
                ],
            ];
        })->values();

        return Inertia::render('Groups/MatchPayments/Manage', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'has_monthly_fee' => (float) ($group->settings?->monthly_fee ?? 0) > 0,
                'monthly_fee' => (float) ($group->settings?->monthly_fee ?? 0),
            ],
            'match' => [
                'id' => $match->id,
                'scheduled_at' => $match->scheduled_at->toISOString(),
                'location_name' => $match->location_name,
                'status' => $match->status,
            ],
            'players' => $players,
            'summary' => [
                'confirmed_count' => count($confirmedPlayerIds),
                'paid_count' => $players->where('payment.status', 'paid')->count(),
                'unpaid_count' => $players->where('payment.status', 'unpaid')->count(),
                'dispensado_count' => $players->where('payment.status', 'dispensado')->count(),
            ],
            'status' => session('status'),
        ]);
    }

    public function update(
        UpdateMatchPaymentRequest $request,
        Group $group,
        Game $match,
        Player $player
    ): RedirectResponse {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($match->group_id === $group->id, 404);
        abort_unless($group->players()->where('players.id', $player->id)->exists(), 404);

        if ($match->status !== 'finished') {
            return redirect()
                ->route('groups.matches.payments.manage', [
                    'group' => $group->id,
                    'match' => $match->id,
                ])
                ->with('status', 'Partida deve estar finalizada antes de atualizar pagamentos.');
        }

        $data = $request->validated();
        $isMonthlyExempt = MonthlyCharge::query()
            ->where('group_id', $group->id)
            ->where('player_id', $player->id)
            ->where('reference_month', $match->scheduled_at->copy()->startOfMonth()->toDateString())
            ->where('payment_status', 'paid')
            ->exists();
        $paymentStatus = $isMonthlyExempt ? 'paid' : $data['payment_status'];
        $paidAmount = $isMonthlyExempt ? 0 : (float) $data['paid_amount'];

        MatchPayment::query()->updateOrCreate(
            [
                'match_id' => $match->id,
                'player_id' => $player->id,
            ],
            [
                'payment_status' => $paymentStatus,
                'paid_amount' => $paidAmount,
                'is_monthly_exempt' => $isMonthlyExempt,
            ]
        );

        return redirect()
            ->route('groups.matches.payments.manage', [
                'group' => $group->id,
                'match' => $match->id,
            ])
            ->with('status', 'Pagamento atualizado com sucesso.');
    }
}
