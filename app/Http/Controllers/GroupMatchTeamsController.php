<?php

namespace App\Http\Controllers;

use App\Enums\PhysicalCondition;
use App\Http\Requests\GenerateMatchTeamsRequest;
use App\Http\Requests\UpdateMatchTeamRequest;
use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\Player;
use App\Services\Matches\BalanceMatchTeamsAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupMatchTeamsController extends Controller
{
    public function __construct(private readonly BalanceMatchTeamsAction $balancer) {}

    public function manage(Request $request, Group $group, Game $match): Response
    {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $players = $this->buildPlayers($group, $match);

        return Inertia::render('Groups/MatchTeams/Manage', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
            ],
            'match' => [
                'id' => $match->id,
                'scheduled_at' => $match->scheduled_at->toISOString(),
                'location_name' => $match->location_name,
                'team_size' => $match->team_size,
            ],
            'defaultTeamSize' => $group->default_team_size,
            'players' => $players,
            'status' => session('status'),
        ]);
    }

    public function generate(GenerateMatchTeamsRequest $request, Group $group, Game $match): RedirectResponse
    {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        if ($request->filled('team_size')) {
            $match->update(['team_size' => $request->validated('team_size')]);
        }

        $teamSize = $match->team_size ?? $group->default_team_size;

        $confirmedPlayers = $this->confirmedPlayersQuery($group, $match)->get();

        $players = $confirmedPlayers->map(fn (Player $player): array => [
            'id' => $player->id,
            'rating' => $player->rating,
            'physical_condition' => $player->physical_condition,
        ]);

        $result = $this->balancer->execute($players, $teamSize);

        $this->assignTeam($match, $result['a'], 'a');
        $this->assignTeam($match, $result['b'], 'b');
        $this->assignTeam($match, $result['unassigned'], null);

        return redirect()
            ->route('groups.matches.teams.manage', ['group' => $group->id, 'match' => $match->id])
            ->with('status', 'Times gerados com sucesso.');
    }

    public function update(UpdateMatchTeamRequest $request, Group $group, Game $match, Player $player): RedirectResponse
    {
        $this->authorizeOwnerOrAdmin($request, $group);
        abort_unless($match->group_id === $group->id, 404);

        $attendance = MatchAttendance::query()
            ->where('match_id', $match->id)
            ->where('player_id', $player->id)
            ->where('status', 'going')
            ->first();

        abort_unless($attendance !== null, 422, 'Player is not confirmed for this match.');

        $attendance->update(['team' => $request->validated('team')]);

        return redirect()
            ->route('groups.matches.teams.manage', ['group' => $group->id, 'match' => $match->id])
            ->with('status', 'Time atualizado.');
    }

    /**
     * @param  array<int, int>  $playerIds
     */
    private function assignTeam(Game $match, array $playerIds, ?string $team): void
    {
        if ($playerIds === []) {
            return;
        }

        MatchAttendance::query()
            ->where('match_id', $match->id)
            ->whereIn('player_id', $playerIds)
            ->update(['team' => $team]);
    }

    private function confirmedPlayersQuery(Group $group, Game $match)
    {
        return $group->players()
            ->whereHas('matchAttendances', function ($query) use ($match): void {
                $query->where('match_id', $match->id)->where('status', 'going');
            })
            ->orderBy('name');
    }

    /**
     * @return array<int, array{id: int, name: string, nick: string, rating: int|null, physicalCondition: string, team: string|null}>
     */
    private function buildPlayers(Group $group, Game $match): array
    {
        $confirmedPlayers = $this->confirmedPlayersQuery($group, $match)->get();

        $attendanceByPlayerId = MatchAttendance::query()
            ->where('match_id', $match->id)
            ->whereIn('player_id', $confirmedPlayers->pluck('id'))
            ->get()
            ->keyBy('player_id');

        return $confirmedPlayers->map(fn (Player $player): array => [
            'id' => $player->id,
            'name' => $player->name,
            'nick' => $player->nick,
            'rating' => $player->rating,
            'physicalCondition' => PhysicalCondition::normalize($player->physical_condition)->value,
            'team' => $attendanceByPlayerId->get($player->id)?->team,
        ])->values()->all();
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
