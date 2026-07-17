<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use App\Services\Groups\GroupInviteTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_owner_can_view_and_update_default_team_size(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->actingAs($owner)
            ->get(route('groups.settings.edit', $group->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Groups/Settings/Edit')
                ->where('defaultTeamSize', null));

        $this->actingAs($owner)
            ->put(route('groups.settings.update', $group->id), ['default_team_size' => 7])
            ->assertRedirect(route('groups.settings.edit', $group->id));

        $this->assertDatabaseHas('group_settings', [
            'group_id' => $group->id,
            'default_team_size' => 7,
        ]);
    }

    public function test_non_owner_cannot_update_group_settings(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $other = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->actingAs($other)
            ->get(route('groups.settings.edit', $group->id))
            ->assertStatus(403);

        $this->actingAs($other)
            ->put(route('groups.settings.update', $group->id), ['default_team_size' => 7])
            ->assertStatus(403);
    }

    public function test_validation_rejects_out_of_range_team_size(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->actingAs($owner)
            ->put(route('groups.settings.update', $group->id), ['default_team_size' => 1])
            ->assertSessionHasErrors('default_team_size');

        $this->actingAs($owner)
            ->put(route('groups.settings.update', $group->id), ['default_team_size' => 51])
            ->assertSessionHasErrors('default_team_size');
    }
}
