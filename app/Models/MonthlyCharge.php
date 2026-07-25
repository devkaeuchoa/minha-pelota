<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyCharge extends Model
{
    protected $fillable = [
        'group_id',
        'player_id',
        'reference_month',
        'amount',
        'payment_status',
        'paid_amount',
    ];

    protected $casts = [
        'amount' => 'float',
        'paid_amount' => 'float',
    ];

    /**
     * reference_month is intentionally NOT cast via the standard 'date' cast:
     * that cast serializes to a full "Y-m-d H:i:s" string on write, while
     * every write/read site in the app (SyncMatchPaymentsAction, the
     * monthly-charge controllers, etc.) builds where()/firstOrCreate()/
     * updateOrCreate() conditions using a plain "Y-m-d" string. The mismatch
     * meant a lookup for an already-existing row never matched, so a second
     * firstOrCreate() for the same group/player/month (e.g. two matches
     * generated in the same month) would attempt a duplicate insert and
     * crash on the unique constraint. Storing as a plain "Y-m-d" string
     * keeps writes and reads consistent while still exposing a Carbon
     * instance to callers that expect one (e.g. ->toDateString()).
     */
    protected function referenceMonth(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value !== null ? Carbon::parse($value)->startOfDay() : null,
            set: fn ($value) => $value instanceof \DateTimeInterface
                ? $value->format('Y-m-d')
                : (string) $value,
        );
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
