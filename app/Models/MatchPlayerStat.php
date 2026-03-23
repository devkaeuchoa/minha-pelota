<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchPlayerStat extends Model
{
    protected $fillable = [
        'match_id',
        'player_id',
        'goals',
        'assists',
    ];

    protected static function booted(): void
    {
        static::saved(function (self $stat): void {
            PlayerStat::syncForPlayer((int) $stat->player_id);
        });

        static::deleted(function (self $stat): void {
            PlayerStat::syncForPlayer((int) $stat->player_id);
        });
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'match_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'player_id');
    }
}
