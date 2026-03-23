<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayersTest extends TestCase
{
    use RefreshDatabase;

    private function createOwnerWithGroup(): array
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);

        return [$owner, $group];
    }

    public function test_admin_can_add_player_to_group(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();

        $response = $this->actingAs($owner)
            ->post(route('groups.players.store', $group), [
                'name' => 'João Silva',
                'nick' => 'joaozinho',
                'phone' => '11999887766',
                'rating' => 4,
            ]);

        $response->assertRedirect(route('groups.show', $group));

        $this->assertDatabaseHas('players', [
            'name' => 'João Silva',
            'nick' => 'joaozinho',
            'phone' => '11999887766',
            'rating' => 4,
        ]);

        $player = Player::where('phone', '11999887766')->first();
        $this->assertDatabaseHas('group_player', [
            'group_id' => $group->id,
            'player_id' => $player->id,
        ]);
        $this->assertDatabaseHas('player_stats', [
            'player_id' => $player->id,
            'goals' => 0,
            'assists' => 0,
            'games_played' => 0,
            'games_missed' => 0,
        ]);
    }

    public function test_admin_can_add_player_with_formatted_phone(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();

        $response = $this->actingAs($owner)
            ->post(route('groups.players.store', $group), [
                'name' => 'Maria',
                'nick' => 'mari',
                'phone' => '(11) 99988-7766',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('players', [
            'phone' => '11999887766',
        ]);
    }

    public function test_existing_player_is_reused_by_phone(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();

        $existing = Player::factory()->create(['phone' => '11999887766']);

        $response = $this->actingAs($owner)
            ->post(route('groups.players.store', $group), [
                'name' => 'Outro nome',
                'nick' => 'outro',
                'phone' => '11999887766',
            ]);

        $response->assertRedirect();

        $this->assertEquals(1, Player::where('phone', '11999887766')->count());
        $this->assertDatabaseHas('group_player', [
            'group_id' => $group->id,
            'player_id' => $existing->id,
        ]);
    }

    public function test_player_can_be_in_multiple_groups(): void
    {
        $owner = User::factory()->create();
        $group1 = Group::factory()->create(['owner_id' => $owner->id]);
        $group2 = Group::factory()->create(['owner_id' => $owner->id]);

        $this->actingAs($owner)
            ->post(route('groups.players.store', $group1), [
                'name' => 'Multi',
                'nick' => 'multi',
                'phone' => '11111111111',
            ]);

        $this->actingAs($owner)
            ->post(route('groups.players.store', $group2), [
                'name' => 'Multi',
                'nick' => 'multi',
                'phone' => '11111111111',
            ]);

        $player = Player::where('phone', '11111111111')->first();

        $this->assertEquals(1, Player::where('phone', '11111111111')->count());
        $this->assertDatabaseHas('group_player', ['group_id' => $group1->id, 'player_id' => $player->id]);
        $this->assertDatabaseHas('group_player', ['group_id' => $group2->id, 'player_id' => $player->id]);
    }

    public function test_admin_can_update_player(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();
        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        $response = $this->actingAs($owner)
            ->put(route('groups.players.update', [$group, $player]), [
                'nick' => 'novo-apelido',
                'rating' => 5,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('players', ['id' => $player->id, 'nick' => 'novo-apelido', 'rating' => 5]);
    }

    public function test_rating_must_be_between_one_and_five_on_create(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();

        $response = $this->actingAs($owner)
            ->post(route('groups.players.store', $group), [
                'name' => 'Player Test',
                'nick' => 'player',
                'phone' => '11999887766',
                'rating' => 6,
            ]);

        $response->assertSessionHasErrors(['rating']);
        $this->assertDatabaseMissing('players', [
            'phone' => '11999887766',
        ]);
    }

    public function test_admin_can_remove_player_from_group(): void
    {
        [$owner, $group] = $this->createOwnerWithGroup();
        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        $response = $this->actingAs($owner)
            ->delete(route('groups.players.destroy', [$group, $player]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('group_player', [
            'group_id' => $group->id,
            'player_id' => $player->id,
        ]);
        $this->assertDatabaseHas('players', ['id' => $player->id]);
    }
}
