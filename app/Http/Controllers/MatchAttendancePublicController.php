<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMatchAttendanceRequest;
use App\Models\MatchAttendance;
use App\Models\MatchAttendanceLink;
use App\Models\Player;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchAttendancePublicController extends Controller
{
    public function show(Request $request, string $token): Response
    {
        $link = MatchAttendanceLink::query()->where('token', $token)->first();
        abort_unless($link, 404);

        $match = $link->match;
        $expired = now()->greaterThanOrEqualTo($link->expires_at);

        return Inertia::render('Presence/Mark', [
            'token' => $token,
            'expired' => $expired,
            'status' => $request->session()->get('status'),
            'group' => [
                'id' => $match->group_id,
                'name' => $match->group->name,
            ],
            'match' => [
                'id' => $match->id,
                'scheduled_at' => $match->scheduled_at->toISOString(),
                'location_name' => $match->location_name,
            ],
        ]);
    }

    public function store(StoreMatchAttendanceRequest $request, string $token): RedirectResponse
    {
        $link = MatchAttendanceLink::query()->where('token', $token)->first();
        abort_unless($link, 404);

        $match = $link->match;
        $expired = now()->greaterThanOrEqualTo($link->expires_at);
        if ($expired) {
            return redirect()
                ->route('presence.show', $token)
                ->with('status', 'Link expirado para esta partida.');
        }

        $data = $request->validated();

        $player = Player::query()->where('phone', $data['phone'])->first();
        if (! $player) {
            return redirect()
                ->route('presence.show', $token)
                ->with('status', 'Telefone não encontrado no grupo.');
        }

        $isMember = $player->groups()->where('groups.id', $match->group_id)->exists();
        if (! $isMember) {
            return redirect()
                ->route('presence.show', $token)
                ->with('status', 'Este telefone não pertence a este grupo.');
        }

        MatchAttendance::query()->updateOrCreate(
            [
                'match_id' => $match->id,
                'player_id' => $player->id,
            ],
            [
                'status' => $data['status'],
            ],
        );

        return redirect()
            ->route('presence.show', $token)
            ->with('status', 'Presença atualizada.');
    }
}
