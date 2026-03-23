<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InviteTest extends TestCase
{
    use RefreshDatabase;

    public function test_invite_page_renders_for_valid_code(): void
    {
        $group = Group::factory()->create();

        $response = $this->get(route('invite.show', $group->invite_code));

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

        $response = $this->post(route('invite.store', $group->invite_code), [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
        ]);

        $response->assertRedirect(route('invite.success', $group->invite_code));

        $this->assertDatabaseHas('players', [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
        ]);

        $player = Player::where('phone', '21988776655')->first();
        $this->assertDatabaseHas('group_player', [
            'group_id' => $group->id,
            'player_id' => $player->id,
        ]);
    }

    public function test_invite_normalizes_phone(): void
    {
        $group = Group::factory()->create();

        $this->post(route('invite.store', $group->invite_code), [
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
        $existing = Player::factory()->create(['phone' => '21988776655']);

        $this->post(route('invite.store', $group->invite_code), [
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
        Player::factory()->create(['phone' => '21988776655']);

        $response = $this->get(route('invite.phone-availability', $group->invite_code) . '?phone=21988776655');

        $response->assertOk();
        $response->assertJson([
            'available' => false,
        ]);
    }

    public function test_invite_phone_availability_returns_available_for_new_phone(): void
    {
        $group = Group::factory()->create();

        $response = $this->get(route('invite.phone-availability', $group->invite_code) . '?phone=21900000000');

        $response->assertOk();
        $response->assertJson([
            'available' => true,
        ]);
    }

    public function test_duplicate_player_in_same_group_does_not_fail(): void
    {
        $group = Group::factory()->create();

        $this->post(route('invite.store', $group->invite_code), [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
        ]);

        $response = $this->post(route('invite.store', $group->invite_code), [
            'name' => 'Carlos',
            'nick' => 'carlao',
            'phone' => '21988776655',
        ]);

        $response->assertRedirect();
        $player = Player::where('phone', '21988776655')->first();
        $this->assertEquals(1, $group->players()->where('player_id', $player->id)->count());
    }

    public function test_group_gets_invite_code_on_creation(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);

        $this->assertNotNull($group->invite_code);
        $this->assertGreaterThanOrEqual(12, strlen($group->invite_code));
    }

    public function test_success_page_renders(): void
    {
        $group = Group::factory()->create();

        $response = $this->get(route('invite.success', $group->invite_code));

        $response->assertOk();
    }
}
