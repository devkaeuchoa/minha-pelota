<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MonthlyCharge;
use App\Models\Player;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GroupPaymentsCalendarTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_view_payments_calendar(): void
    {
        CarbonImmutable::setTestNow('2026-04-10 10:00:00');

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->settings()->updateOrCreate([], ['monthly_fee' => 20.0]);

        Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => CarbonImmutable::parse('2026-04-05 20:00:00'),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $response = $this->actingAs($owner)
            ->get(route('groups.payments.calendar', ['group' => $group->id]));

        $response->assertOk();
        $response->assertInertia(fn(Assert $page) => $page
            ->component('Groups/Payments/Calendar')
            ->where('group.id', $group->id)
            ->where('group.has_monthly_fee', true)
            ->where('group.monthly_fee', 20)
            ->where('month', '2026-04-01')
            ->has('matches', 1)
            ->etc());
    }

    public function test_non_owner_and_non_admin_cannot_view_calendar(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $other */
        $other = Player::factory()->create();
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->actingAs($other)
            ->get(route('groups.payments.calendar', ['group' => $group->id]))
            ->assertStatus(403);
    }

    public function test_non_owner_member_cannot_view_calendar(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $member */
        $member = Player::factory()->create();
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->players()->syncWithoutDetaching([$member->id]);

        $this->actingAs($member)
            ->get(route('groups.payments.calendar', ['group' => $group->id]))
            ->assertStatus(403);
    }

    public function test_calendar_requires_authentication(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->get(route('groups.payments.calendar', ['group' => $group->id]))
            ->assertRedirect(route('login'));
    }

    public function test_matches_list_is_scoped_to_requested_month(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $aprilMatch = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => CarbonImmutable::parse('2026-04-05 20:00:00'),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);
        $mayMatch = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => CarbonImmutable::parse('2026-05-05 20:00:00'),
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $response = $this->actingAs($owner)
            ->get(route('groups.payments.calendar', ['group' => $group->id, 'month' => '2026-04']));

        $response->assertOk();
        $response->assertInertia(fn(Assert $page) => $page
            ->where('month', '2026-04-01')
            ->has('matches', 1)
            ->where('matches.0.id', $aprilMatch->id)
            ->where('has_previous_month_matches', false)
            ->where('has_next_month_matches', true)
            ->etc());

        $this->assertNotEquals($aprilMatch->id, $mayMatch->id);
    }

    public function test_previous_and_next_month_flags_reflect_generated_matches(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => CarbonImmutable::parse('2026-03-05 20:00:00'),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);
        Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => CarbonImmutable::parse('2026-04-05 20:00:00'),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $response = $this->actingAs($owner)
            ->get(route('groups.payments.calendar', ['group' => $group->id, 'month' => '2026-04']));

        $response->assertOk();
        $response->assertInertia(fn(Assert $page) => $page
            ->where('has_previous_month_matches', true)
            ->where('has_next_month_matches', false)
            ->etc());
    }

    public function test_calendar_computes_match_payment_and_monthly_charge_summaries(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => CarbonImmutable::parse('2026-04-05 20:00:00'),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $goingPlayer = Player::factory()->create();
        $paidUpPlayer = Player::factory()->create();
        $unconfirmedPlayer = Player::factory()->create();
        $group->players()->attach([$goingPlayer->id, $paidUpPlayer->id, $unconfirmedPlayer->id]);

        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $goingPlayer->id,
            'status' => 'going',
        ]);

        MonthlyCharge::query()->create([
            'group_id' => $group->id,
            'player_id' => $paidUpPlayer->id,
            'reference_month' => '2026-04-01',
            'amount' => 25,
            'payment_status' => 'paid',
            'paid_amount' => 25,
        ]);

        $response = $this->actingAs($owner)
            ->get(route('groups.payments.calendar', ['group' => $group->id, 'month' => '2026-04']));

        $response->assertOk();
        $response->assertInertia(fn(Assert $page) => $page
            ->where('matches.0.summary.paid_count', 1)
            ->where('matches.0.summary.unpaid_count', 1)
            ->where('matches.0.summary.dispensado_count', 1)
            ->where('summary.monthly_paid_count', 1)
            ->where('summary.monthly_total_count', 3)
            ->etc());
    }
}
