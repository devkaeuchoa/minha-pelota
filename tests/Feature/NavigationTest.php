<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_redirects_authenticated_player_to_player_home(): void
    {
        $player = Player::factory()->create(['is_admin' => false]);

        $this->actingAs($player)
            ->get(route('home'))
            ->assertRedirect(route('player.home'));
    }

    public function test_root_redirects_authenticated_admin_to_admin_home(): void
    {
        $admin = Player::factory()->create(['is_admin' => true]);
        Group::factory()->create(['owner_player_id' => $admin->id]);

        $this->actingAs($admin)
            ->get(route('home'))
            ->assertRedirect(route('admin.home'));
    }
}
