<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchesGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_generate_matches_for_current_month(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
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
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $other */
        $other = Player::factory()->create();
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
        ]);

        $response = $this->actingAs($other)
            ->post(route('groups.matches.generate-current-month', $group));

        $response->assertStatus(403);
    }

    public function test_non_owner_member_cannot_generate_matches(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $member */
        $member = Player::factory()->create();
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
            'weekday' => 5,
            'time' => '20:00',
            'recurrence' => 'weekly',
        ]);
        $group->players()->syncWithoutDetaching([$member->id]);

        $response = $this->actingAs($member)
            ->post(route('groups.matches.generate-current-month', $group));

        $response->assertStatus(403);
    }

    public function test_owner_can_generate_matches_for_multiple_months(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
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
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $other */
        $other = Player::factory()->create();
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
        ]);

        $response = $this->actingAs($other)
            ->post(route('groups.matches.generate-months', $group), [
                'months' => 3,
            ]);

        $response->assertStatus(403);
    }

    public function test_generate_months_validates_months_range(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
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

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
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
