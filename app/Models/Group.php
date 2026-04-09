<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Group extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected static function booted(): void
    {
        static::created(function (Group $group): void {
            GroupSetting::query()->firstOrCreate(
                ['group_id' => $group->id],
                [
                    'monthly_fee' => (float) ($group->monthly_fee ?? 0),
                    'drop_in_fee' => 0,
                    'default_weekday' => (int) ($group->getRawOriginal('weekday') ?? 0),
                    'default_time' => (string) ($group->getRawOriginal('time') ?? '20:00:00'),
                    'recurrence' => (string) ($group->getRawOriginal('recurrence') ?? 'weekly'),
                    'invite_token' => Str::random(40),
                    'invite_expires_at' => now()->addMonth(),
                ]
            );
        });
    }

    protected $fillable = [
        'owner_player_id',
        'name',
        'slug',
        'weekday',
        'time',
        'recurrence',
        'location_name',
        'status',
        'max_players',
        'max_guests',
        'allow_guests',
        'default_match_duration_minutes',
        'join_mode',
        'join_approval_required',
        'payment_day',
        'currency',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'owner_player_id');
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(Player::class, 'group_player')
            ->withPivot('is_admin')
            ->withTimestamps();
    }

    public function settings(): HasOne
    {
        return $this->hasOne(GroupSetting::class);
    }

    public function getWeekdayAttribute($value): int
    {
        return (int) ($this->settings?->default_weekday ?? $value ?? 0);
    }

    public function getTimeAttribute($value): string
    {
        return (string) ($this->settings?->default_time ?? $value ?? '20:00:00');
    }

    public function getRecurrenceAttribute($value): string
    {
        return (string) ($this->settings?->recurrence ?? $value ?? 'weekly');
    }

    public function getMonthlyFeeAttribute($value): float
    {
        return (float) ($this->settings?->monthly_fee ?? $value ?? 0);
    }

    public function getInviteCodeAttribute($value): ?string
    {
        return $this->settings?->invite_token ?? $value;
    }

    public function matches(): HasMany
    {
        return $this->hasMany(Game::class)->orderBy('scheduled_at');
    }
}
