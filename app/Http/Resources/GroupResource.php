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
        $settings = $this->settings;

        return [
            'id' => $this->id,
            'owner_player_id' => $this->owner_player_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'weekday' => $settings?->default_weekday,
            'time' => $settings?->default_time,
            'location_name' => $this->location_name,
            'recurrence' => $settings?->recurrence,
            'status' => $this->status,
            'max_players' => $this->max_players,
            'max_guests' => $this->max_guests,
            'allow_guests' => (bool) $this->allow_guests,
            'default_match_duration_minutes' => $this->default_match_duration_minutes,
            'join_mode' => $this->join_mode,
            'invite_code' => $settings?->invite_token,
            'join_approval_required' => (bool) $this->join_approval_required,
            'has_monthly_fee' => (float) ($settings?->monthly_fee ?? 0) > 0,
            'monthly_fee' => $settings?->monthly_fee ?? 0,
            'drop_in_fee' => $settings?->drop_in_fee ?? 0,
            'invite_expires_at' => $settings?->invite_expires_at,
            'payment_day' => $this->payment_day,
            'currency' => $this->currency,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
