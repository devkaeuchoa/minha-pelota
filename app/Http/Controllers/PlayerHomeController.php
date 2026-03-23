<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\MatchAttendance;
use App\Models\Player;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlayerHomeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user, 401);

        $group = $user->groups()->orderBy('groups.name')->first();
        if (! $group) {
            return Inertia::render('Home/Player', [
                'hasGroup' => false,
                'group' => null,
                'nextMatch' => null,
                'presenceStatus' => 'pending',
                'canQuickConfirm' => false,
            ]);
        }

        $nextMatch = $group->matches()->upcoming()->orderBy('scheduled_at')->first();
        $player = $this->resolvePlayerForUserInGroup($request, (int) $group->id);

        $presenceStatus = 'pending';
        if ($nextMatch && $player) {
            $attendance = MatchAttendance::query()
                ->where('match_id', $nextMatch->id)
                ->where('player_id', $player->id)
                ->first();
            $presenceStatus = $attendance?->status ?? 'pending';
        }

        return Inertia::render('Home/Player', [
            'hasGroup' => true,
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
            ],
            'nextMatch' => $nextMatch ? [
                'id' => $nextMatch->id,
                'scheduled_at' => $nextMatch->scheduled_at?->toISOString(),
                'location_name' => $nextMatch->location_name,
            ] : null,
            'presenceStatus' => $presenceStatus,
            'canQuickConfirm' => (bool) ($nextMatch && $player && $presenceStatus !== 'going'),
        ]);
    }

    public function confirmPresence(Request $request, Game $match): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        $isMember = $user->groups()->where('groups.id', $match->group_id)->exists();
        abort_unless($isMember, 403);

        if ($match->scheduled_at && $match->scheduled_at->isPast()) {
            return redirect()
                ->route('player.home')
                ->with('status', 'A partida já aconteceu e não aceita novas confirmações.');
        }

        $player = $this->resolvePlayerForUserInGroup($request, (int) $match->group_id);
        if (! $player) {
            return redirect()
                ->route('player.home')
                ->with('status', 'Não foi possível identificar seu jogador neste grupo.');
        }

        MatchAttendance::query()->updateOrCreate(
            [
                'match_id' => $match->id,
                'player_id' => $player->id,
            ],
            [
                'status' => 'going',
            ],
        );

        return redirect()
            ->route('player.home')
            ->with('status', 'Presença confirmada com sucesso.');
    }

    private function resolvePlayerForUserInGroup(Request $request, int $groupId): ?Player
    {
        $phone = preg_replace('/\D/', '', (string) ($request->user()?->phone ?? ''));
        if (! $phone) {
            return null;
        }

        return Player::query()
            ->where('phone', $phone)
            ->whereHas('groups', fn($query) => $query->where('groups.id', $groupId))
            ->first();
    }
}
