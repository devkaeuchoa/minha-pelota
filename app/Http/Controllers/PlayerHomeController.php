<?php

namespace App\Http\Controllers;

use App\Enums\PhysicalCondition;
use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchPlayerStat;
use App\Models\Player;
use App\Models\PlayerConditionHistory;
use App\Models\PlayerStat;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PlayerHomeController extends Controller
{
    public function index(Request $request): Response
    {
        $player = $request->user();
        abort_unless($player instanceof Player, 401);

        $group = $player->groups()->orderBy('groups.name')->first();
        if (! $group) {
            return Inertia::render('Home/Player', [
                'hasGroup' => false,
                'group' => null,
                'nextMatch' => null,
                'presenceStatus' => 'pending',
                'confirmedPlayers' => [],
                'physicalCondition' => PhysicalCondition::Unknown->value,
                'playerSummary' => null,
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

        $playerSummary = null;
        if ($player) {
            $stats = PlayerStat::syncForPlayer((int) $player->id);
            $playerSummary = [
                'id' => $player->id,
                'rating' => $player->rating,
                'stats' => [
                    'goals' => $stats->goals,
                    'assists' => $stats->assists,
                    'games_played' => $stats->games_played,
                    'games_missed' => $stats->games_missed,
                ],
            ];
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
            'playerSummary' => $playerSummary,
        ]);
    }

    public function updatePresence(Request $request, Game $match): RedirectResponse
    {
        if ($match->scheduled_at && $match->scheduled_at->isPast()) {
            return redirect()
                ->route('player.home')
                ->with('status', 'A partida já aconteceu e não aceita novas confirmações.');
        }

        $player = $this->resolvePlayerForUserInGroup($request, (int) $match->group_id);
        abort_unless($player, 403, 'Não foi possível identificar seu jogador neste grupo.');

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
        $validated = $request->validate([
            'physical_condition' => ['required', 'string', 'in:otimo,regular,ruim,machucado,unknown'],
        ]);

        $player = $this->resolvePlayerForUserInGroup($request, (int) $group->id);
        if (! $player) {
            return redirect()
                ->route('player.home')
                ->with('status', 'Não foi possível identificar seu jogador neste grupo.');
        }

        $nextCondition = PhysicalCondition::normalize($validated['physical_condition'])->value;
        $previousCondition = PhysicalCondition::normalize($player->physical_condition)->value;

        if ($nextCondition !== $previousCondition) {
            PlayerConditionHistory::query()
                ->where('player_id', $player->id)
                ->where('group_id', $group->id)
                ->whereNull('ended_at')
                ->update([
                    'ended_at' => now(),
                ]);

            PlayerConditionHistory::query()->create([
                'player_id' => $player->id,
                'group_id' => $group->id,
                'condition' => $nextCondition,
                'started_at' => now(),
                'ended_at' => null,
            ]);
        }

        $player->physical_condition = $nextCondition;
        $player->save();

        return redirect()
            ->route('player.home')
            ->with('status', 'Condição física atualizada com sucesso.');
    }

    public function showGroup(Request $request, Group $group): Response
    {
        $player = $this->resolvePlayerForUserInGroup($request, (int) $group->id);
        abort_unless($player, 403, 'Não foi possível identificar seu jogador neste grupo.');

        $periodStart = CarbonImmutable::now()->startOfMonth();
        $periodEnd = CarbonImmutable::now()->endOfMonth();

        $rankings = [
            'artilheiro' => $this->buildTopScorerRanking((int) $group->id, $periodStart, $periodEnd),
            'garcom' => $this->buildTopAssistRanking((int) $group->id, $periodStart, $periodEnd),
            'ta_em_todas' => $this->buildPresenceRanking((int) $group->id, $periodStart, $periodEnd, false),
            'so_migue' => $this->buildPresenceRanking((int) $group->id, $periodStart, $periodEnd, true),
            'neymar' => $this->buildInjuryDaysRanking((int) $group->id, $periodStart, $periodEnd),
        ];

        return Inertia::render('Home/PlayerGroupShow', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
            ],
            'period' => [
                'start' => $periodStart->toIso8601String(),
                'end' => $periodEnd->toIso8601String(),
                'label' => $periodStart->translatedFormat('F/Y'),
            ],
            'rankings' => $rankings,
        ]);
    }

    public function leaveGroup(Request $request, Group $group): RedirectResponse
    {
        $player = $this->resolvePlayerForUserInGroup($request, (int) $group->id);
        abort_unless($player, 403);

        if ((int) $group->owner_player_id === (int) $player->id) {
            return redirect()
                ->route('player.home')
                ->with('status', 'Você é dono do grupo. Transfira a gestão antes de sair.');
        }

        $group->players()->detach($player->id);

        return redirect()
            ->route('player.home')
            ->with('status', 'Você saiu do grupo com sucesso.');
    }

    private function resolvePlayerForUserInGroup(Request $request, int $groupId): ?Player
    {
        $authPlayer = $request->user();
        if (! $authPlayer instanceof Player) {
            return null;
        }

        $belongsToGroup = $authPlayer->groups()->where('groups.id', $groupId)->exists();

        return $belongsToGroup ? $authPlayer : null;
    }

    private function buildTopScorerRanking(
        int $groupId,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd,
    ): ?array {
        $row = MatchPlayerStat::query()
            ->join('matches', 'matches.id', '=', 'match_player_stats.match_id')
            ->join('players', 'players.id', '=', 'match_player_stats.player_id')
            ->where('matches.group_id', $groupId)
            ->whereBetween('matches.scheduled_at', [$periodStart, $periodEnd])
            ->groupBy('players.id', 'players.name', 'players.nick')
            ->orderByRaw('SUM(match_player_stats.goals) DESC')
            ->orderBy('players.name')
            ->selectRaw('players.id as player_id, players.name, players.nick, SUM(match_player_stats.goals) as metric')
            ->first();

        return $this->mapRankingRow($row, 'gols');
    }

    private function buildTopAssistRanking(
        int $groupId,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd,
    ): ?array {
        $row = MatchPlayerStat::query()
            ->join('matches', 'matches.id', '=', 'match_player_stats.match_id')
            ->join('players', 'players.id', '=', 'match_player_stats.player_id')
            ->where('matches.group_id', $groupId)
            ->whereBetween('matches.scheduled_at', [$periodStart, $periodEnd])
            ->groupBy('players.id', 'players.name', 'players.nick')
            ->orderByRaw('SUM(match_player_stats.assists) DESC')
            ->orderBy('players.name')
            ->selectRaw('players.id as player_id, players.name, players.nick, SUM(match_player_stats.assists) as metric')
            ->first();

        return $this->mapRankingRow($row, 'assistências');
    }

    private function buildPresenceRanking(
        int $groupId,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd,
        bool $lowest,
    ): ?array {
        $base = MatchAttendance::query()
            ->join('matches', 'matches.id', '=', 'match_attendance.match_id')
            ->join('players', 'players.id', '=', 'match_attendance.player_id')
            ->where('matches.group_id', $groupId)
            ->whereBetween('matches.scheduled_at', [$periodStart, $periodEnd])
            ->where('match_attendance.status', 'going')
            ->groupBy('players.id', 'players.name', 'players.nick')
            ->selectRaw('players.id as player_id, players.name, players.nick, COUNT(*) as metric');

        if ($lowest) {
            $base->orderByRaw('COUNT(*) ASC')->orderBy('players.name');
        } else {
            $base->orderByRaw('COUNT(*) DESC')->orderBy('players.name');
        }

        $row = $base->first();

        return $this->mapRankingRow($row, 'presenças');
    }

    private function buildInjuryDaysRanking(
        int $groupId,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd,
    ): ?array {
        $rows = PlayerConditionHistory::query()
            ->join('players', 'players.id', '=', 'player_condition_histories.player_id')
            ->where('player_condition_histories.group_id', $groupId)
            ->where('player_condition_histories.condition', PhysicalCondition::Machucado->value)
            ->where(function ($query) use ($periodStart, $periodEnd) {
                $query
                    ->whereBetween('player_condition_histories.started_at', [$periodStart, $periodEnd])
                    ->orWhereBetween('player_condition_histories.ended_at', [$periodStart, $periodEnd])
                    ->orWhere(function ($inner) use ($periodStart, $periodEnd) {
                        $inner
                            ->where('player_condition_histories.started_at', '<', $periodStart)
                            ->where(function ($nested) use ($periodEnd) {
                                $nested
                                    ->whereNull('player_condition_histories.ended_at')
                                    ->orWhere('player_condition_histories.ended_at', '>', $periodEnd);
                            });
                    });
            })
            ->select([
                'player_condition_histories.player_id',
                'player_condition_histories.started_at',
                'player_condition_histories.ended_at',
                'players.name',
                'players.nick',
            ])
            ->get();

        if ($rows->isEmpty()) {
            return null;
        }

        $byPlayer = $rows->groupBy('player_id')
            ->map(function (Collection $entries) use ($periodStart, $periodEnd) {
                $days = 0;
                $name = '';
                $nick = null;

                foreach ($entries as $entry) {
                    $name = (string) $entry->name;
                    $nick = $entry->nick;
                    $start = CarbonImmutable::parse($entry->started_at)->max($periodStart);
                    $end = $entry->ended_at
                        ? CarbonImmutable::parse($entry->ended_at)->min($periodEnd)
                        : $periodEnd;

                    if ($end->greaterThan($start)) {
                        $days += $start->diffInDays($end);
                    }
                }

                return [
                    'player_id' => (int) $entries->first()->player_id,
                    'name' => $name,
                    'nick' => $nick,
                    'metric' => $days,
                ];
            })
            ->sortBy([
                ['metric', 'desc'],
                ['name', 'asc'],
            ])
            ->values()
            ->first();

        if (! $byPlayer || $byPlayer['metric'] <= 0) {
            return null;
        }

        return [
            'player_id' => $byPlayer['player_id'],
            'name' => $byPlayer['name'],
            'nick' => $byPlayer['nick'],
            'metric' => $byPlayer['metric'],
            'metric_label' => 'dias machucado',
        ];
    }

    private function mapRankingRow(mixed $row, string $metricLabel): ?array
    {
        if (! $row || (int) ($row->metric ?? 0) <= 0) {
            return null;
        }

        return [
            'player_id' => (int) $row->player_id,
            'name' => (string) $row->name,
            'nick' => $row->nick,
            'metric' => (int) $row->metric,
            'metric_label' => $metricLabel,
        ];
    }
}
