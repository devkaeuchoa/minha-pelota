<?php

namespace Tests\Feature\Api;

use App\Models\Group;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GroupsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_groups_index_requires_authentication(): void
    {
        $this->getJson('/api/groups')->assertUnauthorized();
    }

    public function test_authenticated_owner_sees_only_own_groups_on_api_index(): void
    {
        $ownerA = Player::factory()->create(['is_admin' => true]);
        $ownerB = Player::factory()->create(['is_admin' => true]);
        $groupA = Group::factory()->create(['owner_player_id' => $ownerA->id]);
        Group::factory()->create(['owner_player_id' => $ownerB->id]);

        Sanctum::actingAs($ownerA);

        $response = $this->getJson('/api/groups');
        $response->assertOk();
        $decoded = $response->json();
        $rows = is_array($decoded['data'] ?? null) ? $decoded['data'] : $decoded;
        $this->assertIsArray($rows);
        $this->assertCount(1, $rows);
        $this->assertSame($groupA->id, $rows[0]['id']);
    }

    public function test_api_can_attach_player_with_player_id_payload(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $player = Player::factory()->create();

        Sanctum::actingAs($owner);

        $this->postJson(route('api.groups.players.store', $group), [
            'player_id' => $player->id,
        ])
            ->assertCreated()
            ->assertJsonPath('id', $player->id);

        $this->assertTrue($group->players()->where('players.id', $player->id)->exists());
    }
}
