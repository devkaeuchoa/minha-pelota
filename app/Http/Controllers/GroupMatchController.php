<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGroupMatchRequest;
use App\Http\Requests\UpdateGroupMatchRequest;
use App\Models\Game;
use App\Models\Group;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GroupMatchController extends Controller
{
    public function store(StoreGroupMatchRequest $request, Group $group): RedirectResponse
    {
        $this->authorizeOwner($request, $group);
        $data = $request->validated();

        $scheduledAt = CarbonImmutable::createFromFormat(
            'Y-m-d\TH:i',
            $data['scheduled_at'],
            config('app.timezone')
        );

        Game::create([
            'group_id' => $group->id,
            'scheduled_at' => $scheduledAt,
            'location_name' => $data['location_name'] ?: $group->location_name,
            'duration_minutes' => $data['duration_minutes'] ?? $group->default_match_duration_minutes,
            'status' => $data['status'],
        ]);

        return redirect()
            ->route('groups.show', $group)
            ->with('status', 'Partida criada com sucesso.');
    }

    public function update(UpdateGroupMatchRequest $request, Group $group, Game $match): RedirectResponse
    {
        $this->authorizeOwner($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $data = $request->validated();
        $scheduledAt = CarbonImmutable::createFromFormat(
            'Y-m-d\TH:i',
            $data['scheduled_at'],
            config('app.timezone')
        );

        $match->update([
            'scheduled_at' => $scheduledAt,
            'location_name' => $data['location_name'] ?: $group->location_name,
            'duration_minutes' => $data['duration_minutes'] ?? $group->default_match_duration_minutes,
            'status' => $data['status'],
        ]);

        return redirect()
            ->route('groups.show', $group)
            ->with('status', 'Partida atualizada com sucesso.');
    }

    public function destroy(Request $request, Group $group, Game $match): RedirectResponse
    {
        $this->authorizeOwner($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $match->delete();

        return redirect()
            ->route('groups.show', $group)
            ->with('status', 'Partida removida com sucesso.');
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        if (app()->environment('local')) {
            return;
        }

        abort_unless(
            $group->owner_id === $request->user()->id,
            403,
            'You are not allowed to access this group.'
        );
    }
}
