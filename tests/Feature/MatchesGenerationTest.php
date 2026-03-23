<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchesGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_generate_matches_for_current_month(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
            'weekday' => 5, // sexta
            'time' => '20:00',
            'recurrence' => 'weekly',
        ]);

        $response = $this->actingAs($owner)
            ->post(route('groups.matches.generate-current-month', $group));

        $response->assertRedirect(route('groups.show', $group));

        $this->assertDatabaseHas('matches', [
            'group_id' => $group->id,
        ]);
    }

    public function test_non_owner_cannot_generate_matches(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $response = $this->actingAs($other)
            ->post(route('groups.matches.generate-current-month', $group));

        $response->assertStatus(403);
    }

    public function test_admin_in_group_can_generate_matches(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
            'weekday' => 5,
            'time' => '20:00',
            'recurrence' => 'weekly',
        ]);
        $admin->groups()->attach($group->id, ['is_admin' => true]);

        $response = $this->actingAs($admin)
            ->post(route('groups.matches.generate-current-month', $group));

        $response->assertRedirect(route('groups.show', $group));
        $this->assertDatabaseHas('matches', [
            'group_id' => $group->id,
        ]);
    }

    public function test_owner_can_generate_matches_for_multiple_months(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
            'weekday' => 5,
            'time' => '20:00',
            'recurrence' => 'weekly',
        ]);

        $response = $this->actingAs($owner)
            ->post(route('groups.matches.generate-months', $group), [
                'months' => 3,
            ]);

        $response->assertRedirect(route('groups.show', $group));

        $this->assertDatabaseHas('matches', [
            'group_id' => $group->id,
        ]);
    }

    public function test_non_owner_cannot_generate_matches_for_multiple_months(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $response = $this->actingAs($other)
            ->post(route('groups.matches.generate-months', $group), [
                'months' => 3,
            ]);

        $response->assertStatus(403);
    }

    public function test_generate_months_validates_months_range(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
            'weekday' => 5,
            'time' => '20:00',
            'recurrence' => 'weekly',
        ]);

        $response = $this->from(route('groups.show', $group))
            ->actingAs($owner)
            ->post(route('groups.matches.generate-months', $group), [
                'months' => 13,
            ]);

        $response->assertRedirect(route('groups.show', $group));
        $response->assertSessionHasErrors('months');
    }

    public function test_generate_months_can_redirect_to_dates_page(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
            'weekday' => 5,
            'time' => '20:00',
            'recurrence' => 'weekly',
        ]);

        $response = $this->actingAs($owner)
            ->post(route('groups.matches.generate-months', $group), [
                'months' => 3,
                'redirect_to_dates' => true,
            ]);

        $response->assertRedirect(route('dates.index', ['group' => $group->id]));
    }
}
