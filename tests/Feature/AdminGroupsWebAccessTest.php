<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminGroupsWebAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_groups_index(): void
    {
        $player = Player::factory()->create(['is_admin' => false]);

        $this->actingAs($player)
            ->get(route('groups.index'))
            ->assertForbidden();
    }

    public function test_non_admin_cannot_access_groups_create(): void
    {
        $player = Player::factory()->create(['is_admin' => false]);

        $this->actingAs($player)
            ->get(route('groups.create'))
            ->assertForbidden();
    }

    public function test_admin_cannot_view_another_owners_group_show(): void
    {
        $ownerA = Player::factory()->create(['is_admin' => true]);
        $ownerB = Player::factory()->create(['is_admin' => true]);
        $groupB = Group::factory()->create(['owner_player_id' => $ownerB->id]);

        $this->actingAs($ownerA)
            ->get(route('groups.show', $groupB))
            ->assertForbidden();
    }

    public function test_admin_cannot_open_group_players_page_for_foreign_group(): void
    {
        $ownerA = Player::factory()->create(['is_admin' => true]);
        $ownerB = Player::factory()->create(['is_admin' => true]);
        $groupB = Group::factory()->create(['owner_player_id' => $ownerB->id]);

        $this->actingAs($ownerA)
            ->get(route('groups.players', $groupB))
            ->assertForbidden();
    }

    public function test_owner_can_access_group_show(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->actingAs($owner)
            ->get(route('groups.show', $group))
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page->component('Groups/Show'));
    }

    public function test_non_admin_cannot_post_new_group(): void
    {
        $player = Player::factory()->create(['is_admin' => false]);

        $this->actingAs($player)
            ->post(route('groups.store'), [
                'name' => 'Grupo X',
                'slug' => 'grupo-x-test',
                'location_name' => 'Quadra',
                'weekday' => 2,
                'time' => '19:30',
                'recurrence' => 'weekly',
                'allow_guests' => false,
                'join_approval_required' => false,
            ])
            ->assertForbidden();
    }
}
