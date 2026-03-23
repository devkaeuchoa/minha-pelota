<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerStat extends Model
{
    protected $fillable = [
        'player_id',
        'goals',
        'assists',
        'manual_goals_delta',
        'manual_assists_delta',
        'games_played',
        'games_missed',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'player_id');
    }

    public static function ensureForPlayer(int $playerId): self
    {
        return self::query()->firstOrCreate(
            ['player_id' => $playerId],
            [
                'goals' => 0,
                'assists' => 0,
                'manual_goals_delta' => 0,
                'manual_assists_delta' => 0,
                'games_played' => 0,
                'games_missed' => 0,
            ],
        );
    }

    public static function syncForPlayer(int $playerId): self
    {
        $stats = self::ensureForPlayer($playerId);

        $goalsFromMatches = (int) MatchPlayerStat::query()
            ->where('player_id', $playerId)
            ->sum('goals');
        $assistsFromMatches = (int) MatchPlayerStat::query()
            ->where('player_id', $playerId)
            ->sum('assists');

        $gamesPlayed = (int) MatchAttendance::query()
            ->where('player_id', $playerId)
            ->where('status', 'going')
            ->count();
        $gamesMissed = (int) MatchAttendance::query()
            ->where('player_id', $playerId)
            ->where('status', 'not_going')
            ->count();

        $stats->fill([
            'goals' => max(0, $goalsFromMatches + (int) $stats->manual_goals_delta),
            'assists' => max(0, $assistsFromMatches + (int) $stats->manual_assists_delta),
            'games_played' => $gamesPlayed,
            'games_missed' => $gamesMissed,
        ]);
        $stats->save();

        return $stats->fresh();
    }
}
