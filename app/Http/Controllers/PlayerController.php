<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Models\Group;
use App\Models\Player;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlayerController extends Controller
{
    public function store(StorePlayerRequest $request, Group $group): RedirectResponse
    {
        $this->authorizeOwner($request, $group);

        $data = $request->validated();

        $player = Player::firstOrCreate(
            ['phone' => $data['phone']],
            ['name' => $data['name'], 'nick' => $data['nick']]
        );

        if (! $group->players()->where('player_id', $player->id)->exists()) {
            $group->players()->attach($player->id);
        }

        return redirect()->route('groups.show', $group);
    }

    public function attachExisting(Request $request, Group $group): RedirectResponse|Response
    {
        $this->authorizeOwner($request, $group);

        $data = $request->validate([
            'player_id' => ['required', 'integer', 'exists:players,id'],
        ]);

        if (! $group->players()->where('player_id', $data['player_id'])->exists()) {
            $group->players()->attach($data['player_id']);
        }

        if ($request->wantsJson()) {
            return Inertia::location(route('groups.players', $group));
        }

        return redirect()->route('groups.players', $group);
    }

    public function update(UpdatePlayerRequest $request, Group $group, Player $player): RedirectResponse
    {
        $this->authorizeOwner($request, $group);

        $player->update($request->validated());

        return redirect()->route('groups.show', $group);
    }

    public function destroy(Request $request, Group $group, Player $player): RedirectResponse
    {
        $this->authorizeOwner($request, $group);

        $group->players()->detach($player->id);

        return redirect()->route('groups.show', $group);
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        if (app()->environment('local')) {
            return;
        }

        abort_unless(
            $group->owner_id === $request->user()->id,
            403,
            'You are not allowed to manage players for this group.'
        );
    }
}
