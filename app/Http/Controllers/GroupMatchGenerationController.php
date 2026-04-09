<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Services\Matches\GenerateGroupMatchesAction;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GroupMatchGenerationController extends Controller
{
    public function generateCurrentMonth(
        Request $request,
        Group $group,
        GenerateGroupMatchesAction $action
    ): RedirectResponse {
        $this->authorizeOwner($request, $group);

        $from = CarbonImmutable::now();
        $until = $from->endOfMonth();

        $created = $action->execute($group, $from, $until);

        return redirect()
            ->to($this->targetUrl($request, $group))
            ->with('status', "Partidas geradas: {$created->count()}");
    }

    public function generateForMonths(
        Request $request,
        Group $group,
        GenerateGroupMatchesAction $action
    ): RedirectResponse {
        $this->authorizeOwner($request, $group);

        $data = $request->validate([
            'months' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $from = CarbonImmutable::now();
        $until = $from->addMonthsNoOverflow($data['months'])->endOfMonth();

        $created = $action->execute($group, $from, $until);

        return redirect()
            ->to($this->targetUrl($request, $group))
            ->with('status', "Partidas geradas: {$created->count()}");
    }

    private function targetUrl(Request $request, Group $group): string
    {
        if ($request->boolean('redirect_to_dates')) {
            return route('dates.index', ['group' => $group->id]);
        }

        return route('groups.show', $group);
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        $user = $request->user();
        $isAdmin = (bool) ($user->is_admin ?? false);
        $isOwner = $group->owner_player_id === $user->id;

        abort_unless(
            $isAdmin && $isOwner,
            403,
            'You are not allowed to access this group.'
        );
    }
}
