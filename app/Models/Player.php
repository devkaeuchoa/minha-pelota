<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'nick',
        'phone',
        'physical_condition',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_player')
            ->withTimestamps();
    }

    public function matchAttendances(): HasMany
    {
        return $this->hasMany(MatchAttendance::class, 'player_id');
    }

    public function stats(): HasOne
    {
        return $this->hasOne(PlayerStat::class, 'player_id');
    }

    public function matchStats(): HasMany
    {
        return $this->hasMany(MatchPlayerStat::class, 'player_id');
    }

    public function conditionHistories(): HasMany
    {
        return $this->hasMany(PlayerConditionHistory::class, 'player_id');
    }
}
