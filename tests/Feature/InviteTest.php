<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InviteTest extends TestCase
{
    use RefreshDatabase;

    private function inviteTokenFor(Group $group): string
    {
        return (string) $group->settings()->firstOrFail()->invite_token;
    }

    public function test_invite_page_renders_for_valid_code(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);

        $response = $this->get(route('invite.show', $token));

        $response->assertOk();
    }

    public function test_invite_page_returns_404_for_invalid_code(): void
    {
        $response = $this->get('/invite/invalid-code');

        $response->assertNotFound();
    }

    public function test_player_can_register_via_invite_link(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);

        $response = $this->post(route('invite.store', $token), [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
            'rating' => 2,
        ]);

        $response->assertRedirect(route('invite.success', $token));

        $this->assertDatabaseHas('players', [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
            'rating' => 2,
        ]);

        $player = Player::where('phone', '21988776655')->first();
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

    public function test_invite_normalizes_phone(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);

        $this->post(route('invite.store', $token), [
            'name' => 'Teste',
            'nick' => 'teste',
            'phone' => '(21) 98877-6655',
        ]);

        $this->assertDatabaseHas('players', [
            'phone' => '21988776655',
        ]);
    }

    public function test_invite_reuses_existing_player_by_phone(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);
        $existing = Player::factory()->create(['phone' => '21988776655']);

        $this->post(route('invite.store', $token), [
            'name' => 'Outro nome',
            'nick' => 'outro',
            'phone' => '21988776655',
        ]);

        $this->assertEquals(1, Player::where('phone', '21988776655')->count());
        $this->assertDatabaseHas('group_player', [
            'group_id' => $group->id,
            'player_id' => $existing->id,
        ]);
    }

    public function test_invite_phone_availability_returns_unavailable_for_existing_phone(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);
        Player::factory()->create(['phone' => '21988776655']);

        $response = $this->get(route('invite.phone-availability', $token) . '?phone=21988776655');

        $response->assertOk();
        $response->assertJson([
            'available' => false,
        ]);
    }

    public function test_invite_phone_availability_returns_available_for_new_phone(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);

        $response = $this->get(route('invite.phone-availability', $token) . '?phone=21900000000');

        $response->assertOk();
        $response->assertJson([
            'available' => true,
        ]);
    }

    public function test_duplicate_player_in_same_group_does_not_fail(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);

        $this->post(route('invite.store', $token), [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
        ]);

        $response = $this->post(route('invite.store', $token), [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
        ]);

        $response->assertRedirect();
        $player = Player::where('phone', '21988776655')->first();
        $this->assertEquals(1, $group->players()->where('player_id', $player->id)->count());
    }

    public function test_invite_rejects_rating_outside_one_to_five(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);

        $response = $this->post(route('invite.store', $token), [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
            'rating' => 8,
        ]);

        $response->assertSessionHasErrors(['rating']);
        $this->assertDatabaseMissing('players', [
            'phone' => '21988776655',
        ]);
    }

    public function test_group_gets_invite_code_on_creation(): void
    {
        $group = Group::factory()->create();
        $group->load('settings');
        $this->assertNotNull($group->settings?->invite_token);
        $this->assertGreaterThanOrEqual(12, strlen((string) $group->settings?->invite_token));
    }

    public function test_success_page_renders(): void
    {
        $group = Group::factory()->create();
        $token = $this->inviteTokenFor($group);

        $response = $this->get(route('invite.success', $token));

        $response->assertOk();
    }
}
