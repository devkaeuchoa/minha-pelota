<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchPlayerStat;
use App\Models\Player;
use App\Models\PlayerConditionHistory;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerHomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_player_home_shows_empty_state_when_user_has_no_group(): void
    {
        $player = Player::factory()->create();

        $response = $this->actingAs($player)->get(route('player.home'));

        $response->assertOk();
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Home/Player')
                ->where('hasGroup', false)
                ->where('nextMatch', null)
                ->where('confirmedPlayers', [])
                ->where('physicalCondition', 'unknown')
                ->where('playerSummary', null)
        );
    }

    public function test_player_home_shows_next_match_and_presence_status(): void
    {
        [$user, $group, $player] = $this->createPlayerMemberContext();
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->addDay(),
            'location_name' => 'Arena Teste',
            'status' => 'scheduled',
        ]);

        MatchAttendance::query()->create([
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'not_going',
        ]);

        $response = $this->actingAs($user)->get(route('player.home'));

        $response->assertOk();
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Home/Player')
                ->where('hasGroup', true)
                ->where('group.id', $group->id)
                ->where('nextMatch.id', $match->id)
                ->where('presenceStatus', 'not_going')
                ->where('physicalCondition', 'unknown')
                ->where('playerSummary.rating', null)
                ->where('playerSummary.stats.games_missed', 1)
        );
    }

    public function test_player_can_confirm_presence_quickly_from_home(): void
    {
        [$user, $group, $player] = $this->createPlayerMemberContext();
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->addDay(),
            'location_name' => 'Arena Teste',
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($user)->post(route('player.home.presence.update', $match), [
            'status' => 'going',
        ]);

        $response->assertRedirect(route('player.home'));
        $this->assertDatabaseHas('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'going',
        ]);
    }

    public function test_player_cannot_update_presence_for_past_match(): void
    {
        [$user, $group, $player] = $this->createPlayerMemberContext();
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->subDay(),
            'location_name' => 'Arena Passada',
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($user)->post(route('player.home.presence.update', $match), [
            'status' => 'going',
        ]);

        $response->assertRedirect(route('player.home'));
        $response->assertSessionHas('status', 'A partida já aconteceu e não aceita novas confirmações.');
        $this->assertDatabaseMissing('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $player->id,
        ]);
    }

    public function test_player_cannot_confirm_presence_for_match_from_other_group(): void
    {
        [$user] = $this->createPlayerMemberContext();
        $otherGroup = Group::factory()->create();
        $otherMatch = Game::query()->create([
            'group_id' => $otherGroup->id,
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($user)->post(route('player.home.presence.update', $otherMatch), [
            'status' => 'going',
        ]);

        $response->assertStatus(403);
    }

    public function test_player_can_mark_presence_as_maybe(): void
    {
        [$user, $group, $player] = $this->createPlayerMemberContext();
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($user)->post(route('player.home.presence.update', $match), [
            'status' => 'maybe',
        ]);

        $response->assertRedirect(route('player.home'));
        $this->assertDatabaseHas('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'maybe',
        ]);
    }

    public function test_player_can_update_physical_condition_from_home(): void
    {
        [$user, $group, $player] = $this->createPlayerMemberContext();

        $response = $this->actingAs($user)->post(route('player.home.physical-condition.update', $group), [
            'physical_condition' => 'ruim',
        ]);

        $response->assertRedirect(route('player.home'));
        $this->assertDatabaseHas('players', [
            'id' => $player->id,
            'physical_condition' => 'ruim',
        ]);
    }

    public function test_player_group_details_page_requires_membership(): void
    {
        [$user] = $this->createPlayerMemberContext();
        $otherGroup = Group::factory()->create();

        $response = $this->actingAs($user)->get(route('player.groups.show', $otherGroup));

        $response->assertStatus(403);
    }

    public function test_player_group_details_page_shows_monthly_rankings(): void
    {
        CarbonImmutable::setTestNow('2026-04-10 10:00:00');

        $owner = Player::factory()->create();
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $playerMain = Player::factory()->create([
            'phone' => '11999999999',
            'name' => 'Main Player',
            'nick' => 'main',
        ]);
        $playerB = Player::factory()->create(['name' => 'Bruno', 'nick' => 'bruno']);
        $playerC = Player::factory()->create(['name' => 'Carlos', 'nick' => 'carlos']);

        $group->players()->attach([$playerMain->id, $playerB->id, $playerC->id]);

        $match1 = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-04-04 19:00:00',
            'status' => 'scheduled',
            'location_name' => 'Arena 1',
        ]);
        $match2 = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-04-07 19:00:00',
            'status' => 'scheduled',
            'location_name' => 'Arena 1',
        ]);
        $previousMonthMatch = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-03-20 19:00:00',
            'status' => 'scheduled',
            'location_name' => 'Arena 1',
        ]);

        MatchPlayerStat::query()->create([
            'match_id' => $match1->id,
            'player_id' => $playerMain->id,
            'goals' => 2,
            'assists' => 1,
        ]);
        MatchPlayerStat::query()->create([
            'match_id' => $match2->id,
            'player_id' => $playerMain->id,
            'goals' => 1,
            'assists' => 3,
        ]);
        MatchPlayerStat::query()->create([
            'match_id' => $match1->id,
            'player_id' => $playerB->id,
            'goals' => 2,
            'assists' => 0,
        ]);
        MatchPlayerStat::query()->create([
            'match_id' => $previousMonthMatch->id,
            'player_id' => $playerB->id,
            'goals' => 10,
            'assists' => 10,
        ]);

        MatchAttendance::query()->create([
            'match_id' => $match1->id,
            'player_id' => $playerMain->id,
            'status' => 'going',
        ]);
        MatchAttendance::query()->create([
            'match_id' => $match2->id,
            'player_id' => $playerMain->id,
            'status' => 'going',
        ]);
        MatchAttendance::query()->create([
            'match_id' => $match1->id,
            'player_id' => $playerB->id,
            'status' => 'going',
        ]);
        MatchAttendance::query()->create([
            'match_id' => $match1->id,
            'player_id' => $playerC->id,
            'status' => 'not_going',
        ]);
        MatchAttendance::query()->create([
            'match_id' => $match2->id,
            'player_id' => $playerC->id,
            'status' => 'not_going',
        ]);

        PlayerConditionHistory::query()->create([
            'player_id' => $playerMain->id,
            'group_id' => $group->id,
            'condition' => 'machucado',
            'started_at' => '2026-04-01 00:00:00',
            'ended_at' => '2026-04-05 00:00:00',
        ]);
        PlayerConditionHistory::query()->create([
            'player_id' => $playerB->id,
            'group_id' => $group->id,
            'condition' => 'machucado',
            'started_at' => '2026-04-01 00:00:00',
            'ended_at' => '2026-04-03 00:00:00',
        ]);

        $response = $this->actingAs($playerMain)->get(route('player.groups.show', $group));

        $response->assertOk();
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Home/PlayerGroupShow')
                ->where('group.id', $group->id)
                ->where('rankings.artilheiro.nick', 'main')
                ->where('rankings.artilheiro.metric', 3)
                ->where('rankings.garcom.nick', 'main')
                ->where('rankings.garcom.metric', 4)
                ->where('rankings.ta_em_todas.nick', 'main')
                ->where('rankings.ta_em_todas.metric', 2)
                ->where('rankings.so_migue.nick', 'bruno')
                ->where('rankings.so_migue.metric', 1)
                ->where('rankings.neymar.nick', 'main')
                ->where('rankings.neymar.metric', 4)
        );
    }

    public function test_update_physical_condition_creates_history_rows_on_change(): void
    {
        CarbonImmutable::setTestNow('2026-04-10 10:00:00');

        [$user, $group, $player] = $this->createPlayerMemberContext();

        $this->actingAs($user)->post(route('player.home.physical-condition.update', $group), [
            'physical_condition' => 'machucado',
        ])->assertRedirect(route('player.home'));

        CarbonImmutable::setTestNow('2026-04-12 10:00:00');

        $this->actingAs($user)->post(route('player.home.physical-condition.update', $group), [
            'physical_condition' => 'regular',
        ])->assertRedirect(route('player.home'));

        $this->assertDatabaseHas('player_condition_histories', [
            'player_id' => $player->id,
            'group_id' => $group->id,
            'condition' => 'machucado',
            'started_at' => '2026-04-10 10:00:00',
            'ended_at' => '2026-04-12 10:00:00',
        ]);

        $this->assertDatabaseHas('player_condition_histories', [
            'player_id' => $player->id,
            'group_id' => $group->id,
            'condition' => 'regular',
            'started_at' => '2026-04-12 10:00:00',
            'ended_at' => null,
        ]);
    }

    public function test_player_can_leave_group(): void
    {
        [$user, $group, $player] = $this->createPlayerMemberContext();

        $response = $this->actingAs($user)->delete(route('api.player.groups.leave', $group));

        $response->assertRedirect(route('player.home'));
        $this->assertDatabaseMissing('group_player', [
            'group_id' => $group->id,
            'player_id' => $player->id,
        ]);
    }

    public function test_group_owner_cannot_leave_own_group(): void
    {
        $ownerPlayer = Player::factory()->create();
        $group = Group::factory()->create([
            'owner_player_id' => $ownerPlayer->id,
        ]);
        $group->players()->syncWithoutDetaching([$ownerPlayer->id]);

        $response = $this->actingAs($ownerPlayer)->delete(route('api.player.groups.leave', $group));

        $response->assertRedirect(route('player.home'));
        $response->assertSessionHas('status');
        $this->assertDatabaseHas('group_player', [
            'group_id' => $group->id,
            'player_id' => $ownerPlayer->id,
        ]);
    }

    private function createPlayerMemberContext(): array
    {
        $owner = Player::factory()->create();
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
        ]);

        $player = Player::factory()->create([
            'phone' => '11999999999',
        ]);
        $group->players()->attach($player->id);

        return [$player, $group, $player];
    }
}
