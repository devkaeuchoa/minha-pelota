<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DatesPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_dates_page_lists_only_owned_groups(): void
    {
        /** @var Player $user */
        $user = Player::factory()->create(['is_admin' => true]);
        $ownedGroup = Group::factory()->create([
            'owner_player_id' => $user->id,
            'name' => 'Owned Group',
        ]);

        Group::factory()->create(['name' => 'Unrelated Group']);

        $this->actingAs($user)
            ->get(route('dates.index'))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Groups/Dates')
                ->has('groups', 1)
                ->where('groups.0.name', 'Owned Group')
                ->where('selectedGroupId', $ownedGroup->id));

        $this->assertDatabaseHas('groups', ['id' => $ownedGroup->id]);
    }

    public function test_dates_page_respects_selected_group_query_when_group_is_accessible(): void
    {
        /** @var Player $user */
        $user = Player::factory()->create(['is_admin' => true]);
        $firstGroup = Group::factory()->create([
            'owner_player_id' => $user->id,
            'name' => 'A Group',
        ]);
        $secondGroup = Group::factory()->create([
            'owner_player_id' => $user->id,
            'name' => 'B Group',
        ]);

        $this->actingAs($user)
            ->get(route('dates.index', ['group' => $secondGroup->id]))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Groups/Dates')
                ->where('selectedGroupId', $secondGroup->id)
                ->where('selectedGroup.id', $secondGroup->id));

        $this->assertDatabaseHas('groups', ['id' => $firstGroup->id]);
    }
}
