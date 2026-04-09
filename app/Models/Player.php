<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Player extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'nick',
        'phone',
        'is_admin',
        'password',
        'remember_token',
        'physical_condition',
        'rating',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'rating' => 'integer',
        'password' => 'hashed',
    ];

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_player')
            ->withPivot('is_admin')
            ->withTimestamps();
    }

    public function matchAttendances(): HasMany
    {
        return $this->hasMany(MatchAttendance::class, 'player_id');
    }

    public function matchPayments(): HasMany
    {
        return $this->hasMany(MatchPayment::class, 'player_id');
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
