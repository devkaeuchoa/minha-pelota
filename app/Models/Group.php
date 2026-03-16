<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Group extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'weekday',
        'time',
        'location_name',
        'status',
        'max_players',
        'max_guests',
        'allow_guests',
        'default_match_duration_minutes',
        'join_mode',
        'invite_code',
        'join_approval_required',
        'has_monthly_fee',
        'monthly_fee_cents',
        'payment_day',
        'currency',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_user')
            ->withTimestamps();
    }
}
