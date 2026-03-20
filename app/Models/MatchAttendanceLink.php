<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchAttendanceLink extends Model
{
    protected $fillable = [
        'match_id',
        'token',
        'expires_at',
        'created_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'match_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

