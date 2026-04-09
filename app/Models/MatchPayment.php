<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchPayment extends Model
{
    protected $fillable = [
        'match_id',
        'player_id',
        'payment_status',
        'paid_amount',
        'is_monthly_exempt',
    ];

    protected $casts = [
        'is_monthly_exempt' => 'boolean',
        'paid_amount' => 'float',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'match_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'player_id');
    }
}
