<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Group extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (Group $group): void {
            if (empty($group->invite_code)) {
                $group->invite_code = Str::random(12);
            }
        });
    }

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'weekday',
        'time',
        'location_name',
        'status',
        'recurrence',
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
        return $this->belongsToMany(Player::class, 'group_player')
            ->withTimestamps();
    }

    public function matches(): HasMany
    {
        return $this->hasMany(Game::class)->orderBy('scheduled_at');
    }
}
