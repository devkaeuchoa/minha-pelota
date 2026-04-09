<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchPayment;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MatchPaymentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_open_payments_page_and_only_confirmed_players_are_listed(): void
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
            ->where('players.0.id', $goingPlayer->id)
            ->where('players.0.payment.status', 'unpaid'));

        $this->assertDatabaseMissing('match_payments', [
            'match_id' => $match->id,
            'player_id' => $goingPlayer->id,
        ]);
        $this->assertDatabaseMissing('match_payments', [
            'match_id' => $match->id,
            'player_id' => $maybePlayer->id,
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

    public function test_update_payment_marks_as_paid_when_monthly_exempt_is_true(): void
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

        $this->actingAs($owner)->patch(route('groups.matches.payments.update', [
            'group' => $group->id,
            'match' => $match->id,
            'player' => $player->id,
        ]), [
            'payment_status' => 'unpaid',
            'paid_amount' => 14.00,
            'is_monthly_exempt' => true,
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

    public function test_groups_index_includes_last_finished_match_shortcut_for_payments(): void
    {
        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $older = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDays(3),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);
        $newer = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'status' => 'finished',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $this->actingAs($owner)
            ->get(route('groups.index'))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Groups/Index')
                ->where('lastFinishedMatchForPayments.match_id', $newer->id)
                ->where('lastFinishedMatchForPayments.group_id', $group->id)
                ->etc());

        $this->assertNotEquals($older->id, $newer->id);
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
}
