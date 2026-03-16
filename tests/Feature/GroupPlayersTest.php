<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroupPlayersTest extends TestCase
{
    use RefreshDatabase;

    private function createOwnerWithGroup(): array
    {
        /** @var User $owner */
        $owner = User::factory()->create();

        /** @var Group $group */
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
        ]);

        return [$owner, $group];
    }

    public function test_owner_can_add_player_to_group(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();
        $player = User::factory()->create();

        $response = $this->actingAs($owner)
            ->postJson("/api/groups/{$group->id}/players", [
                'user_id' => $player->id,
                'is_admin' => true,
            ]);

        $response->assertCreated()
            ->assertJsonFragment([
                'id' => $player->id,
                'email' => $player->email,
                'is_admin' => true,
            ]);

        $this->assertDatabaseHas('group_user', [
            'group_id' => $group->id,
            'user_id' => $player->id,
            'is_admin' => true,
        ]);
    }

    public function test_owner_can_list_group_players(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();
        $players = User::factory()->count(2)->create();

        $group->players()->attach($players[0]->id, ['is_admin' => true]);
        $group->players()->attach($players[1]->id, ['is_admin' => false]);

        $response = $this->actingAs($owner)
            ->getJson("/api/groups/{$group->id}/players");

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $players[0]->id, 'is_admin' => true])
            ->assertJsonFragment(['id' => $players[1]->id, 'is_admin' => false]);
    }

    public function test_owner_can_update_player_admin_and_physical_condition(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();
        $player = User::factory()->create([
            'physical_condition' => 'unknown',
        ]);

        $group->players()->attach($player->id, ['is_admin' => false]);

        $response = $this->actingAs($owner)
            ->patchJson("/api/groups/{$group->id}/players/{$player->id}", [
                'is_admin' => true,
                'physical_condition' => 'fit',
            ]);

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $player->id,
                'is_admin' => true,
                'physical_condition' => 'fit',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $player->id,
            'physical_condition' => 'fit',
        ]);

        $this->assertDatabaseHas('group_user', [
            'group_id' => $group->id,
            'user_id' => $player->id,
            'is_admin' => true,
        ]);
    }

    public function test_owner_can_remove_player_from_group(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();
        $player = User::factory()->create();

        $group->players()->attach($player->id, ['is_admin' => false]);

        $response = $this->actingAs($owner)
            ->deleteJson("/api/groups/{$group->id}/players/{$player->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('group_user', [
            'group_id' => $group->id,
            'user_id' => $player->id,
        ]);
    }

    public function test_non_owner_cannot_manage_players(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();
        $otherUser = User::factory()->create();
        $player = User::factory()->create();

        $response = $this->actingAs($otherUser)
            ->postJson("/api/groups/{$group->id}/players", [
                'user_id' => $player->id,
            ]);

        $response->assertForbidden();
    }
}

