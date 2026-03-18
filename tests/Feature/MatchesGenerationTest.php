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
}

