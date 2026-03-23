<?php

namespace App\Http\Controllers;

use App\Enums\PhysicalCondition;
use App\Models\Game;
use App\Models\Group;
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
                'confirmedPlayers' => [],
                'physicalCondition' => PhysicalCondition::Unknown->value,
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

        $confirmedPlayers = [];
        if ($nextMatch) {
            $confirmedPlayers = MatchAttendance::query()
                ->where('match_id', $nextMatch->id)
                ->where('status', 'going')
                ->with('player')
                ->get()
                ->map(fn(MatchAttendance $row) => [
                    'id' => $row->player?->id,
                    'name' => $row->player?->name,
                    'nick' => $row->player?->nick,
                ])
                ->filter(fn(array $row) => ! empty($row['id']))
                ->values()
                ->all();
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
            'confirmedPlayers' => $confirmedPlayers,
            'physicalCondition' => PhysicalCondition::normalize($player?->physical_condition)->value,
        ]);
    }

    public function updatePresence(Request $request, Game $match): RedirectResponse
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

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:going,not_going,maybe'],
        ]);

        MatchAttendance::query()->updateOrCreate(
            [
                'match_id' => $match->id,
                'player_id' => $player->id,
            ],
            [
                'status' => $validated['status'],
            ],
        );

        $statusLabel = match ($validated['status']) {
            'going' => 'confirmada',
            'not_going' => 'desconfirmada',
            default => 'marcada como talvez',
        };

        return redirect()
            ->route('player.home')
            ->with('status', "Presença {$statusLabel} com sucesso.");
    }

    public function updatePhysicalCondition(Request $request, Group $group): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        $isMember = $user->groups()->where('groups.id', $group->id)->exists();
        abort_unless($isMember, 403);

        $validated = $request->validate([
            'physical_condition' => ['required', 'string', 'in:otimo,regular,ruim,machucado,unknown'],
        ]);

        $player = $this->resolvePlayerForUserInGroup($request, (int) $group->id);
        if (! $player) {
            return redirect()
                ->route('player.home')
                ->with('status', 'Não foi possível identificar seu jogador neste grupo.');
        }

        $player->physical_condition = PhysicalCondition::normalize($validated['physical_condition'])->value;
        $player->save();

        return redirect()
            ->route('player.home')
            ->with('status', 'Condição física atualizada com sucesso.');
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
