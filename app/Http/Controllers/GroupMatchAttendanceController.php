<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchAttendanceLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class GroupMatchAttendanceController extends Controller
{
    public function manage(Request $request, Group $group, Game $match): Response
    {
        $this->authorizeOwner($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $link = MatchAttendanceLink::query()->where('match_id', $match->id)->first();
        $expired = $link
            ? now()->greaterThanOrEqualTo($link->expires_at)
            : false;

        $players = $group->players()
            ->orderBy('name')
            ->get();

        $attendance = MatchAttendance::query()
            ->where('match_id', $match->id)
            ->get()
            ->keyBy('player_id');

        $playersWithAttendance = $players->map(function ($player) use ($attendance) {
            return [
                'id' => $player->id,
                'name' => $player->name,
                'nick' => $player->nick,
                'status' => $attendance->get($player->id)?->status ?? null,
            ];
        });

        return Inertia::render('Groups/MatchPresence/Manage', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
            ],
            'match' => [
                'id' => $match->id,
                'scheduled_at' => $match->scheduled_at->toISOString(),
                'location_name' => $match->location_name,
            ],
            'hasLink' => (bool) $link,
            'expired' => $expired,
            'link' => $link
                ? [
                    'token' => $link->token,
                    'expires_at' => $link->expires_at->toISOString(),
                    'linkUrl' => route('presence.show', $link->token),
                ]
                : null,
            'players' => $playersWithAttendance,
            'summary' => [
                'going' => $playersWithAttendance->where('status', 'going')->count(),
                'not_going' => $playersWithAttendance->where('status', 'not_going')->count(),
                'pending' => $playersWithAttendance->where('status', null)->count(),
            ],
        ]);
    }

    public function generateLink(Request $request, Group $group, Game $match): RedirectResponse
    {
        $this->authorizeOwner($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $existing = MatchAttendanceLink::query()->where('match_id', $match->id)->first();
        if ($existing) {
            return redirect()
                ->route('groups.matches.presence.manage', [
                    'group' => $group->id,
                    'match' => $match->id,
                ])
                ->with('status', 'O link de presença para esta partida já foi gerado.');
        }

        $token = Str::random(64);
        $link = MatchAttendanceLink::create([
            'match_id' => $match->id,
            'token' => $token,
            'expires_at' => $match->scheduled_at,
            'created_by' => $request->user()?->id,
        ]);

        return redirect()
            ->route('groups.matches.presence.manage', [
                'group' => $group->id,
                'match' => $match->id,
            ])
            ->with('status', "Link de presença gerado. Expira em {$link->expires_at->format('d/m/Y H:i')}");
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        if (app()->environment('local')) {
            return;
        }

        abort_unless(
            $group->owner_id === $request->user()->id,
            403,
            'You are not allowed to manage this group.'
        );
    }
}

