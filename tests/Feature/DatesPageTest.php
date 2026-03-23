<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DatesPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_dates_page_lists_owner_and_admin_groups(): void
    {
        $user = User::factory()->create();
        $ownedGroup = Group::factory()->create([
            'owner_id' => $user->id,
            'name' => 'Owned Group',
        ]);

        $ownerOfAdminGroup = User::factory()->create();
        $adminGroup = Group::factory()->create([
            'owner_id' => $ownerOfAdminGroup->id,
            'name' => 'Admin Group',
        ]);
        $user->groups()->attach($adminGroup->id, ['is_admin' => true]);

        Group::factory()->create(['name' => 'Unrelated Group']);

        $this->actingAs($user)
            ->get(route('dates.index'))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Groups/Dates')
                ->has('groups', 2)
                ->where('groups.0.name', 'Admin Group')
                ->where('groups.1.name', 'Owned Group')
                ->where('selectedGroupId', $adminGroup->id));

        $this->assertDatabaseHas('groups', ['id' => $ownedGroup->id]);
    }

    public function test_dates_page_respects_selected_group_query_when_group_is_accessible(): void
    {
        $user = User::factory()->create();
        $firstGroup = Group::factory()->create([
            'owner_id' => $user->id,
            'name' => 'A Group',
        ]);
        $secondGroup = Group::factory()->create([
            'owner_id' => $user->id,
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
