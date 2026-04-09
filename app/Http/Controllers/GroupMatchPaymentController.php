<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateMatchPaymentRequest;
use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchPayment;
use App\Models\Player;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupMatchPaymentController extends Controller
{
    public function sync(Request $request, Group $group, Game $match): RedirectResponse
    {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $confirmedPlayerIds = MatchAttendance::query()
            ->where('match_id', $match->id)
            ->where('status', 'going')
            ->whereHas('player.groups', fn($query) => $query->where('groups.id', $group->id))
            ->pluck('player_id');

        foreach ($confirmedPlayerIds as $playerId) {
            MatchPayment::query()->firstOrCreate(
                [
                    'match_id' => $match->id,
                    'player_id' => $playerId,
                ],
                [
                    'payment_status' => 'unpaid',
                    'paid_amount' => 0,
                    'is_monthly_exempt' => false,
                ]
            );
        }

        return redirect()
            ->route('groups.matches.payments.manage', [
                'group' => $group->id,
                'match' => $match->id,
            ])
            ->with('status', 'Pagamentos sincronizados com os confirmados.');
    }

    public function manage(Request $request, Group $group, Game $match): Response
    {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $confirmedPlayers = $group->players()
            ->whereHas('matchAttendances', function ($query) use ($match): void {
                $query->where('match_id', $match->id)->where('status', 'going');
            })
            ->orderBy('name')
            ->get();

        $paymentsByPlayerId = MatchPayment::query()
            ->where('match_id', $match->id)
            ->whereIn('player_id', $confirmedPlayers->pluck('id'))
            ->get()
            ->keyBy('player_id');

        $players = $confirmedPlayers->map(function (Player $player) use ($group, $match, $paymentsByPlayerId): array {
            /** @var MatchPayment $payment */
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
                'payment' => [
                    'status' => $payment?->payment_status ?? 'unpaid',
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
                'confirmed_count' => $players->count(),
                'paid_count' => $players->where('payment.status', 'paid')->count(),
                'unpaid_count' => $players->where('payment.status', 'unpaid')->count(),
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

        $confirmedAttendanceExists = MatchAttendance::query()
            ->where('match_id', $match->id)
            ->where('player_id', $player->id)
            ->where('status', 'going')
            ->exists();
        abort_unless($confirmedAttendanceExists, 422, 'Player is not confirmed for this match.');
        if ($match->status !== 'finished') {
            return redirect()
                ->route('groups.matches.payments.manage', [
                    'group' => $group->id,
                    'match' => $match->id,
                ])
                ->with('status', 'Partida deve estar finalizada antes de atualizar pagamentos.');
        }

        $data = $request->validated();
        $isMonthlyExempt = (bool) $data['is_monthly_exempt'];
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

    private function authorizeOwnerOrAdmin(Request $request, Group $group): void
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $isAdmin = (bool) ($user->is_admin ?? false);
        $isOwner = $group->owner_player_id === $user->id;

        abort_unless($isAdmin && $isOwner, 403, 'You are not allowed to access this group.');
    }
}
