<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MatchesCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_match(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
            'location_name' => 'Arena Central',
            'default_match_duration_minutes' => 90,
        ]);

        $response = $this->actingAs($owner)->post(route('groups.matches.store', $group), [
            'scheduled_at' => '2026-04-02T19:30',
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
        ]);

        $response->assertRedirect(route('groups.show', $group));
        $this->assertDatabaseHas('matches', [
            'group_id' => $group->id,
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
        ]);
    }

    public function test_non_owner_cannot_create_match(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($other)->post(route('groups.matches.store', $group), [
            'scheduled_at' => '2026-04-02T19:30',
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_in_group_can_create_match(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $admin->groups()->attach($group->id, ['is_admin' => true]);

        $response = $this->actingAs($admin)->post(route('groups.matches.store', $group), [
            'scheduled_at' => '2026-04-02T19:30',
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
        ]);

        $response->assertRedirect(route('groups.show', $group));
        $this->assertDatabaseHas('matches', [
            'group_id' => $group->id,
            'location_name' => 'Arena Norte',
        ]);
    }

    public function test_owner_can_update_match(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-04-02 19:30:00',
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($owner)->put(route('groups.matches.update', [
            'group' => $group->id,
            'match' => $match->id,
        ]), [
            'scheduled_at' => '2026-04-03T20:00',
            'location_name' => 'Arena Sul',
            'duration_minutes' => 80,
            'status' => 'finished',
        ]);

        $response->assertRedirect(route('groups.show', $group));
        $this->assertDatabaseHas('matches', [
            'id' => $match->id,
            'location_name' => 'Arena Sul',
            'duration_minutes' => 80,
            'status' => 'finished',
        ]);
    }

    public function test_owner_can_soft_delete_match_and_it_disappears_from_group_show(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-04-02 19:30:00',
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
        ]);

        $deleteResponse = $this->actingAs($owner)->delete(route('groups.matches.destroy', [
            'group' => $group->id,
            'match' => $match->id,
        ]));
        $deleteResponse->assertRedirect(route('groups.show', $group));

        $this->assertSoftDeleted('matches', ['id' => $match->id]);

        $this->actingAs($owner)
            ->get(route('groups.show', $group))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Groups/Show')
                ->where('matches', []));
    }

    public function test_cannot_create_duplicate_match_datetime_for_same_group(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);
        Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-04-02 19:30:00',
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
        ]);

        $response = $this->from(route('groups.show', $group))
            ->actingAs($owner)
            ->post(route('groups.matches.store', $group), [
                'scheduled_at' => '2026-04-02T19:30',
                'location_name' => 'Arena Sul',
                'duration_minutes' => 90,
                'status' => 'scheduled',
            ]);

        $response->assertRedirect(route('groups.show', $group));
        $response->assertSessionHasErrors('scheduled_at');
    }

    public function test_can_reuse_datetime_when_previous_match_is_soft_deleted(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-04-02 19:30:00',
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
        ]);
        $match->delete();

        $response = $this->actingAs($owner)->post(route('groups.matches.store', $group), [
            'scheduled_at' => '2026-04-02T19:30',
            'location_name' => 'Arena Sul',
            'duration_minutes' => 90,
            'status' => 'scheduled',
        ]);

        $response->assertRedirect(route('groups.show', $group));
        $this->assertDatabaseCount('matches', 2);
    }

    public function test_create_match_can_redirect_to_dates_page(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
            'location_name' => 'Arena Central',
            'default_match_duration_minutes' => 90,
        ]);

        $response = $this->actingAs($owner)->post(route('groups.matches.store', $group), [
            'scheduled_at' => '2026-04-02T19:30',
            'location_name' => 'Arena Norte',
            'duration_minutes' => 75,
            'status' => 'scheduled',
            'redirect_to_dates' => true,
        ]);

        $response->assertRedirect(route('dates.index', ['group' => $group->id]));
    }
}
