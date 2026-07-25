<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\MonthlyCharge;
use App\Models\Player;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MonthlyChargesTest extends TestCase
{
    use RefreshDatabase;

    public function test_generating_matches_creates_monthly_charge_per_group_player(): void
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
        $group->settings()->updateOrCreate([], ['monthly_fee' => 40.0]);

        $memberOne = Player::factory()->create();
        $memberTwo = Player::factory()->create();
        $group->players()->attach([$owner->id, $memberOne->id, $memberTwo->id]);

        $this->actingAs($owner)
            ->post(route('groups.matches.generate-current-month', $group))
            ->assertRedirect(route('groups.show', $group));

        $referenceMonth = CarbonImmutable::now()->startOfMonth()->toDateString();

        foreach ([$owner, $memberOne, $memberTwo] as $player) {
            $this->assertDatabaseHas('monthly_charges', [
                'group_id' => $group->id,
                'player_id' => $player->id,
                'reference_month' => $referenceMonth,
                'amount' => 40,
            ]);
        }
    }

    public function test_sync_creates_missing_monthly_charges_for_resolved_month(): void
    {
        CarbonImmutable::setTestNow('2026-05-10 10:00:00');

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->settings()->updateOrCreate([], ['monthly_fee' => 25.0]);

        $member = Player::factory()->create();
        $group->players()->attach($member->id);

        $this->actingAs($owner)
            ->post(route('groups.monthly-charges.sync', ['group' => $group->id]))
            ->assertRedirect(route('groups.payments.calendar', [
                'group' => $group->id,
                'month' => '2026-05-01',
            ]));

        $this->assertDatabaseHas('monthly_charges', [
            'group_id' => $group->id,
            'player_id' => $member->id,
            'reference_month' => '2026-05-01',
            'amount' => 25,
            'payment_status' => 'unpaid',
        ]);
    }

    public function test_sync_respects_explicit_month_query_parameter(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $member = Player::factory()->create();
        $group->players()->attach($member->id);

        $this->actingAs($owner)
            ->post(route('groups.monthly-charges.sync', ['group' => $group->id, 'month' => '2026-08']))
            ->assertRedirect(route('groups.payments.calendar', [
                'group' => $group->id,
                'month' => '2026-08-01',
            ]));

        $this->assertDatabaseHas('monthly_charges', [
            'group_id' => $group->id,
            'player_id' => $member->id,
            'reference_month' => '2026-08-01',
        ]);
    }

    public function test_sync_is_owner_and_admin_only(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $member */
        $member = Player::factory()->create();
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->players()->syncWithoutDetaching([$member->id]);

        $this->actingAs($member)
            ->post(route('groups.monthly-charges.sync', ['group' => $group->id]))
            ->assertStatus(403);
    }

    public function test_sync_requires_authentication(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->post(route('groups.monthly-charges.sync', ['group' => $group->id]))
            ->assertRedirect(route('login'));
    }

    public function test_update_marks_monthly_charge_paid_and_persists_paid_amount(): void
    {
        CarbonImmutable::setTestNow('2026-04-15 10:00:00');

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->settings()->updateOrCreate([], ['monthly_fee' => 50.0]);
        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        $this->actingAs($owner)->patch(route('groups.monthly-charges.update', [
            'group' => $group->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'paid',
            'paid_amount' => 50.00,
        ])->assertRedirect(route('groups.payments.calendar', [
            'group' => $group->id,
            'month' => '2026-04-01',
        ]));

        $this->assertDatabaseHas('monthly_charges', [
            'group_id' => $group->id,
            'player_id' => $player->id,
            'reference_month' => '2026-04-01',
            'payment_status' => 'paid',
            'paid_amount' => 50,
            'amount' => 50,
        ]);
    }

    public function test_update_can_mark_monthly_charge_unpaid(): void
    {
        CarbonImmutable::setTestNow('2026-04-15 10:00:00');

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        MonthlyCharge::query()->create([
            'group_id' => $group->id,
            'player_id' => $player->id,
            'reference_month' => '2026-04-01',
            'amount' => 30,
            'payment_status' => 'paid',
            'paid_amount' => 30,
        ]);

        $this->actingAs($owner)->patch(route('groups.monthly-charges.update', [
            'group' => $group->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'unpaid',
            'paid_amount' => 0,
        ])->assertRedirect();

        $this->assertDatabaseHas('monthly_charges', [
            'group_id' => $group->id,
            'player_id' => $player->id,
            'reference_month' => '2026-04-01',
            'payment_status' => 'unpaid',
            'paid_amount' => 0,
        ]);
    }

    public function test_update_is_owner_and_admin_only(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $member */
        $member = Player::factory()->create();
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->players()->syncWithoutDetaching([$member->id]);
        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        $this->actingAs($member)->patch(route('groups.monthly-charges.update', [
            'group' => $group->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'paid',
            'paid_amount' => 10,
        ])->assertStatus(403);
    }

    public function test_update_validates_payment_status_and_paid_amount(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        $this->actingAs($owner)->patch(route('groups.monthly-charges.update', [
            'group' => $group->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'invalid-status',
            'paid_amount' => -5,
        ])->assertSessionHasErrors(['payment_status', 'paid_amount']);
    }

    public function test_player_can_view_their_own_monthly_charges(): void
    {
        CarbonImmutable::setTestNow('2026-06-10 10:00:00');

        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->players()->attach($owner->id);

        MonthlyCharge::query()->create([
            'group_id' => $group->id,
            'player_id' => $owner->id,
            'reference_month' => '2026-06-01',
            'amount' => 35,
            'payment_status' => 'paid',
            'paid_amount' => 35,
        ]);
        MonthlyCharge::query()->create([
            'group_id' => $group->id,
            'player_id' => $owner->id,
            'reference_month' => '2026-05-01',
            'amount' => 35,
            'payment_status' => 'unpaid',
            'paid_amount' => 0,
        ]);

        $this->actingAs($owner)
            ->get(route('player.groups.monthly-charges', ['group' => $group->id]))
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Home/PlayerMonthlyCharges')
                ->where('group.id', $group->id)
                ->where('currentMonth.reference_month', '2026-06-01')
                ->where('currentMonth.status', 'paid')
                ->has('history', 2)
                ->etc());
    }

    public function test_player_cannot_view_monthly_charges_for_group_they_dont_belong_to(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        /** @var Player $outsider */
        $outsider = Player::factory()->create();

        $this->actingAs($outsider)
            ->get(route('player.groups.monthly-charges', ['group' => $group->id]))
            ->assertStatus(403);
    }
}
