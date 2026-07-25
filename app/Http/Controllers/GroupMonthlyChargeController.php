<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesGroupOwnerAdmin;
use App\Http\Requests\UpdateMonthlyChargeRequest;
use App\Models\Group;
use App\Models\MonthlyCharge;
use App\Models\Player;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GroupMonthlyChargeController extends Controller
{
    use AuthorizesGroupOwnerAdmin;

    public function sync(Request $request, Group $group): RedirectResponse
    {
        $this->authorizeOwnerOrAdmin($request, $group);

        $referenceMonth = $this->resolveReferenceMonth($request);
        $monthlyFee = (float) ($group->settings?->monthly_fee ?? 0);

        foreach ($group->players as $player) {
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

        return redirect()
            ->route('groups.payments.calendar', ['group' => $group->id, 'month' => $referenceMonth])
            ->with('status', 'Mensalidades sincronizadas.');
    }

    public function update(UpdateMonthlyChargeRequest $request, Group $group, Player $player): RedirectResponse
    {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($group->players()->where('players.id', $player->id)->exists(), 404);

        $referenceMonth = $this->resolveReferenceMonth($request);
        $data = $request->validated();

        MonthlyCharge::query()->updateOrCreate(
            [
                'group_id' => $group->id,
                'player_id' => $player->id,
                'reference_month' => $referenceMonth,
            ],
            [
                'amount' => (float) ($group->settings?->monthly_fee ?? 0),
                'payment_status' => $data['payment_status'],
                'paid_amount' => (float) $data['paid_amount'],
            ]
        );

        return redirect()
            ->route('groups.payments.calendar', ['group' => $group->id, 'month' => $referenceMonth])
            ->with('status', 'Mensalidade atualizada com sucesso.');
    }

    private function resolveReferenceMonth(Request $request): string
    {
        $month = $request->input('month');

        if (is_string($month) && preg_match('/^\d{4}-\d{2}$/', $month)) {
            return CarbonImmutable::createFromFormat('Y-m-d', $month.'-01')->toDateString();
        }

        return CarbonImmutable::now()->startOfMonth()->toDateString();
    }
}
