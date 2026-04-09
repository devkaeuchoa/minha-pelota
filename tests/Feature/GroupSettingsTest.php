<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use App\Services\Groups\GroupInviteTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroupSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_group_creation_auto_creates_settings_with_invite_token(): void
    {
        $owner = Player::factory()->create();
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
        ]);

        $group->refresh()->load('settings');
        $this->assertNotNull($group->settings);
        $this->assertNotNull($group->settings?->invite_token);
        $this->assertNotNull($group->settings?->invite_expires_at);
    }

    public function test_expired_invite_token_is_renewed_for_group(): void
    {
        $owner = Player::factory()->create();
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
        ]);

        $settings = $group->settings()->firstOrFail();
        $oldToken = $settings->invite_token;
        $settings->update([
            'invite_expires_at' => now()->subDay(),
        ]);

        $service = app(GroupInviteTokenService::class);
        $updated = $service->ensureValidToken($group->refresh());

        $this->assertNotSame($oldToken, $updated->invite_token);
        $this->assertTrue($updated->invite_expires_at->isFuture());
    }
}
