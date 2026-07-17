<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchAttendance extends Model
{
    protected $table = 'match_attendance';

    protected $fillable = [
        'match_id',
        'player_id',
        'status',
        'team',
    ];

    protected static function booted(): void
    {
        static::saved(function (self $attendance): void {
            PlayerStat::syncForPlayer((int) $attendance->player_id);
        });

        static::deleted(function (self $attendance): void {
            PlayerStat::syncForPlayer((int) $attendance->player_id);
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
