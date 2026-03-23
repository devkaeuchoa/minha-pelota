<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class Game extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'matches';

    protected $fillable = [
        'group_id',
        'scheduled_at',
        'status',
        'location_name',
        'duration_minutes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function attendanceLink(): HasOne
    {
        return $this->hasOne(MatchAttendanceLink::class, 'match_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(MatchAttendance::class, 'match_id');
    }

    public function matchStats(): HasMany
    {
        return $this->hasMany(MatchPlayerStat::class, 'match_id');
    }

    public function scopeForPeriod(Builder $query, \DateTimeInterface $start, \DateTimeInterface $end): Builder
    {
        return $query->whereBetween('scheduled_at', [$start, $end]);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('scheduled_at', '>=', now());
    }
}
