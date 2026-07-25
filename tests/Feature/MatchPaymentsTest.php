<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchPayment;
use App\Models\MonthlyCharge;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MatchPaymentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_open_payments_page_and_all_group_players_are_listed(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => 'Arena Central',
            'duration_minutes' => 90,
        ]);

        $goingPlayer = Player::factory()->create();
        $maybePlayer = Player::factory()->create();
        $group->players()->attach([$goingPlayer->id, $maybePlayer->id]);

        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $goingPlayer->id,
            'status' => 'going',
        ]);
        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $maybePlayer->id,
            'status' => 'maybe',
        ]);

        $response = $this->actingAs($owner)
            ->get(route('groups.matches.payments.manage', ['group' => $group->id, 'match' => $match->id]));

        $response->assertOk();
        $response->assertInertia(fn(Assert $page) => $page
            ->component('Groups/MatchPayments/Manage')
            ->where('group.has_monthly_fee', false)
            ->where('group.monthly_fee', 0)
            ->where('summary.confirmed_count', 1)
            ->has('players', 2)
            ->etc());

        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $goingPlayer->id,
            'payment_status' => 'unpaid',
        ]);
        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $maybePlayer->id,
            'payment_status' => 'dispensado',
        ]);
    }

    public function test_non_owner_member_cannot_update_payment(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $member */
        $member = Player::factory()->create();
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->players()->syncWithoutDetaching([$member->id]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);
        $player = Player::factory()->create();
        $group->players()->attach($player->id);
        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'going',
        ]);
        MatchPayment::query()->create([
            'match_id' => $match->id,
            'player_id' => $player->id,
            'payment_status' => 'unpaid',
            'paid_amount' => 0,
            'is_monthly_exempt' => false,
        ]);

        $response = $this->actingAs($member)->patch(route('groups.matches.payments.update', [
            'group' => $group->id,
            'match' => $match->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'paid',
            'paid_amount' => 25.00,
            'is_monthly_exempt' => false,
        ]);

        $response->assertStatus(403);
    }

    public function test_update_payment_marks_as_paid_when_monthly_charge_already_paid(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);
        $player = Player::factory()->create();
        $group->players()->attach($player->id);
        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'going',
        ]);
        MonthlyCharge::query()->create([
            'group_id' => $group->id,
            'player_id' => $player->id,
            'reference_month' => $match->scheduled_at->copy()->startOfMonth()->toDateString(),
            'amount' => 30,
            'payment_status' => 'paid',
            'paid_amount' => 30,
        ]);

        $this->actingAs($owner)->patch(route('groups.matches.payments.update', [
            'group' => $group->id,
            'match' => $match->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'unpaid',
            'paid_amount' => 14.00,
        ])->assertRedirect();

        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'payment_status' => 'paid',
            'paid_amount' => 0,
            'is_monthly_exempt' => true,
        ]);
    }

    public function test_manage_page_returns_monthly_fee_flags_when_group_has_monthly_fee(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->settings()->updateOrCreate([], ['monthly_fee' => 30.0]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);
        $player = Player::factory()->create();
        $group->players()->attach($player->id);
        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'going',
        ]);

        $this->actingAs($owner)
            ->get(route('groups.matches.payments.manage', ['group' => $group->id, 'match' => $match->id]))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Groups/MatchPayments/Manage')
                ->where('group.has_monthly_fee', true)
                ->where('group.monthly_fee', 30)
                ->where('summary.confirmed_count', 1)
                ->etc());
    }

    public function test_non_owner_and_non_admin_cannot_access_payments(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        /** @var Player $other */
        $other = Player::factory()->create();
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $this->actingAs($other)
            ->get(route('groups.matches.payments.manage', ['group' => $group->id, 'match' => $match->id]))
            ->assertStatus(403);
    }

    public function test_groups_index_includes_group_shortcut_for_payments_calendar(): void
    {
        // NOTE: `groups.index` used to expose a `lastFinishedMatchForPayments`
        // shortcut; that was replaced by `groupForPaymentsCalendar` when the
        // payments calendar feature was introduced (see routes/web.php).
        // This test was updated to match the current payload shape.
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->actingAs($owner)
            ->get(route('groups.index'))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Groups/Index')
                ->where('groupForPaymentsCalendar.group_id', $group->id)
                ->etc());
    }

    public function test_sync_creates_payment_rows_for_confirmed_players(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $going = Player::factory()->create();
        $group->players()->attach($going->id);
        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $going->id,
            'status' => 'going',
        ]);

        $this->actingAs($owner)->post(route('groups.matches.payments.sync', [
            'group' => $group->id,
            'match' => $match->id,
        ]))->assertRedirect(route('groups.matches.payments.manage', [
            'group' => $group->id,
            'match' => $match->id,
        ]));

        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $going->id,
            'payment_status' => 'unpaid',
            'paid_amount' => 0,
            'is_monthly_exempt' => false,
        ]);
    }

    public function test_payment_update_rejected_when_match_not_finished(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);
        $player = Player::factory()->create();
        $group->players()->attach($player->id);
        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'going',
        ]);

        $response = $this->actingAs($owner)->patch(route('groups.matches.payments.update', [
            'group' => $group->id,
            'match' => $match->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'paid',
            'paid_amount' => 10,
            'is_monthly_exempt' => false,
        ]);

        $response
            ->assertRedirect(route('groups.matches.payments.manage', [
                'group' => $group->id,
                'match' => $match->id,
            ]))
            ->assertSessionHas('status', 'Partida deve estar finalizada antes de atualizar pagamentos.');

        $this->assertDatabaseMissing('match_payments', [
            'match_id' => $match->id,
            'player_id' => $player->id,
        ]);
    }

    public function test_generating_match_creates_dispensado_for_unconfirmed_and_unpaid_for_confirmed(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $goingPlayer = Player::factory()->create();
        $unconfirmedPlayer = Player::factory()->create();
        $group->players()->attach([$goingPlayer->id, $unconfirmedPlayer->id]);

        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $goingPlayer->id,
            'status' => 'going',
        ]);

        app(\App\Services\Payments\SyncMatchPaymentsAction::class)->execute($match->fresh());

        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $goingPlayer->id,
            'payment_status' => 'unpaid',
        ]);
        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $unconfirmedPlayer->id,
            'payment_status' => 'dispensado',
        ]);
    }

    public function test_generating_match_marks_payment_paid_when_monthly_charge_already_paid(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        MonthlyCharge::query()->create([
            'group_id' => $group->id,
            'player_id' => $player->id,
            'reference_month' => $match->scheduled_at->copy()->startOfMonth()->toDateString(),
            'amount' => 30,
            'payment_status' => 'paid',
            'paid_amount' => 30,
        ]);

        app(\App\Services\Payments\SyncMatchPaymentsAction::class)->execute($match->fresh());

        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'payment_status' => 'paid',
            'is_monthly_exempt' => true,
        ]);
    }

    public function test_confirming_attendance_promotes_dispensado_payment_to_unpaid_when_manage_reopened(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        // First sync: no attendance yet, payment should be dispensado.
        app(\App\Services\Payments\SyncMatchPaymentsAction::class)->execute($match->fresh());

        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'payment_status' => 'dispensado',
        ]);

        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'going',
        ]);

        $response = $this->actingAs($owner)
            ->get(route('groups.matches.payments.manage', ['group' => $group->id, 'match' => $match->id]));

        $response->assertOk();

        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'payment_status' => 'unpaid',
        ]);
    }

    public function test_update_allows_editing_dispensado_payment_without_confirmed_attendance(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $player = Player::factory()->create();
        $group->players()->attach($player->id);

        MatchPayment::query()->create([
            'match_id' => $match->id,
            'player_id' => $player->id,
            'payment_status' => 'dispensado',
            'paid_amount' => 0,
            'is_monthly_exempt' => false,
        ]);

        $this->actingAs($owner)->patch(route('groups.matches.payments.update', [
            'group' => $group->id,
            'match' => $match->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'paid',
            'paid_amount' => 20.00,
        ])->assertRedirect();

        $this->assertDatabaseHas('match_payments', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'payment_status' => 'paid',
            'paid_amount' => 20,
        ]);
    }
}
