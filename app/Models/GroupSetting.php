<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupSetting extends Model
{
    protected $fillable = [
        'group_id',
        'monthly_fee',
        'drop_in_fee',
        'default_weekday',
        'default_time',
        'recurrence',
        'invite_token',
        'invite_expires_at',
    ];

    protected $casts = [
        'invite_expires_at' => 'datetime',
        'monthly_fee' => 'float',
        'drop_in_fee' => 'float',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }
}
