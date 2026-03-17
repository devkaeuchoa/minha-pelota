<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvitePlayerRequest;
use App\Models\Group;
use App\Models\Player;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InviteController extends Controller
{
    public function show(string $inviteCode): Response
    {
        $group = Group::where('invite_code', $inviteCode)->firstOrFail();

        return Inertia::render('Invite/Accept', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'weekday' => $group->weekday,
                'time' => $group->time,
                'location_name' => $group->location_name,
            ],
            'inviteCode' => $inviteCode,
        ]);
    }

    public function store(InvitePlayerRequest $request, string $inviteCode): RedirectResponse
    {
        $group = Group::where('invite_code', $inviteCode)->firstOrFail();

        $data = $request->validated();

        $player = Player::firstOrCreate(
            ['phone' => $data['phone']],
            ['name' => $data['name'], 'nick' => $data['nick']]
        );

        if (! $group->players()->where('player_id', $player->id)->exists()) {
            $group->players()->attach($player->id);
        }

        return redirect()->route('invite.success', $inviteCode);
    }

    public function success(string $inviteCode): Response
    {
        $group = Group::where('invite_code', $inviteCode)->firstOrFail();

        return Inertia::render('Invite/Success', [
            'group' => [
                'name' => $group->name,
            ],
        ]);
    }
}
