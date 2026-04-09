<?php

namespace App\Services\Groups;

use App\Models\Group;
use App\Models\GroupSetting;
use Illuminate\Support\Str;

class GroupInviteTokenService
{
    public function ensureValidToken(Group $group): GroupSetting
    {
        $settings = $group->settings()->firstOrCreate([], [
            'monthly_fee' => 0,
            'drop_in_fee' => 0,
            'default_weekday' => 0,
            'default_time' => '20:00:00',
            'recurrence' => 'weekly',
        ]);

        if ($settings->invite_token && $settings->invite_expires_at && $settings->invite_expires_at->isFuture()) {
            return $settings;
        }

        $settings->invite_token = Str::random(40);
        $settings->invite_expires_at = now()->addMonth();
        $settings->save();

        return $settings;
    }

    public function regenerate(Group $group): GroupSetting
    {
        $settings = $group->settings()->firstOrCreate();
        $settings->invite_token = Str::random(40);
        $settings->invite_expires_at = now()->addMonth();
        $settings->save();

        return $settings;
    }
}
