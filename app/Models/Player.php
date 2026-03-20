<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'nick',
        'phone',
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
}
