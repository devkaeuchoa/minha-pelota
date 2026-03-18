<?php

namespace App\Http\Resources;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Group */
class GroupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'owner_id' => $this->owner_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'weekday' => $this->weekday,
            'time' => $this->time,
            'location_name' => $this->location_name,
            'recurrence' => $this->recurrence,
            'status' => $this->status,
            'max_players' => $this->max_players,
            'max_guests' => $this->max_guests,
            'allow_guests' => (bool) $this->allow_guests,
            'default_match_duration_minutes' => $this->default_match_duration_minutes,
            'join_mode' => $this->join_mode,
            'invite_code' => $this->invite_code,
            'join_approval_required' => (bool) $this->join_approval_required,
            'has_monthly_fee' => (bool) $this->has_monthly_fee,
            'monthly_fee_cents' => $this->monthly_fee_cents,
            'payment_day' => $this->payment_day,
            'currency' => $this->currency,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}

