<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MatchTeamsTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_open_manage_page_and_only_going_players_are_listed(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
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

        $this->actingAs($owner)
            ->get(route('groups.matches.teams.manage', ['group' => $group->id, 'match' => $match->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Groups/MatchTeams/Manage')
                ->has('players', 1)
                ->where('players.0.id', $goingPlayer->id));
    }

    public function test_non_owner_member_cannot_access_manage_generate_or_update(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $member = Player::factory()->create();
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->players()->syncWithoutDetaching([$member->id]);

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

        $this->actingAs($member)
            ->get(route('groups.matches.teams.manage', ['group' => $group->id, 'match' => $match->id]))
            ->assertStatus(403);

        $this->actingAs($member)
            ->post(route('groups.matches.teams.generate', ['group' => $group->id, 'match' => $match->id]))
            ->assertStatus(403);

        $this->actingAs($member)
            ->patch(route('groups.matches.teams.update', [
                'group' => $group->id,
                'match' => $match->id,
                'player' => $player->id,
            ]), ['team' => 'a'])
            ->assertStatus(403);
    }

    public function test_generate_assigns_teams_respecting_team_size_and_overflow(): void
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

        $players = Player::factory()->count(5)->create();
        $group->players()->attach($players->pluck('id'));
        foreach ($players as $player) {
            MatchAttendance::query()->create([
                'match_id' => $match->id,
                'player_id' => $player->id,
                'status' => 'going',
            ]);
        }

        $this->actingAs($owner)
            ->post(route('groups.matches.teams.generate', ['group' => $group->id, 'match' => $match->id]), [
                'team_size' => 2,
            ])
            ->assertRedirect(route('groups.matches.teams.manage', ['group' => $group->id, 'match' => $match->id]));

        $this->assertDatabaseHas('matches', ['id' => $match->id, 'team_size' => 2]);

        $teamACount = MatchAttendance::query()->where('match_id', $match->id)->where('team', 'a')->count();
        $teamBCount = MatchAttendance::query()->where('match_id', $match->id)->where('team', 'b')->count();
        $unassignedCount = MatchAttendance::query()->where('match_id', $match->id)->whereNull('team')->count();

        $this->assertSame(2, $teamACount);
        $this->assertSame(2, $teamBCount);
        $this->assertSame(1, $unassignedCount);
    }

    public function test_generate_without_team_size_leaves_nobody_unassigned(): void
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

        $players = Player::factory()->count(5)->create();
        $group->players()->attach($players->pluck('id'));
        foreach ($players as $player) {
            MatchAttendance::query()->create([
                'match_id' => $match->id,
                'player_id' => $player->id,
                'status' => 'going',
            ]);
        }

        $this->actingAs($owner)
            ->post(route('groups.matches.teams.generate', ['group' => $group->id, 'match' => $match->id]));

        $unassignedCount = MatchAttendance::query()->where('match_id', $match->id)->whereNull('team')->count();
        $this->assertSame(0, $unassignedCount);
    }

    public function test_manual_update_swaps_player_team_and_persists(): void
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
            'team' => 'a',
        ]);

        $this->actingAs($owner)
            ->patch(route('groups.matches.teams.update', [
                'group' => $group->id,
                'match' => $match->id,
                'player' => $player->id,
            ]), ['team' => 'b'])
            ->assertRedirect(route('groups.matches.teams.manage', ['group' => $group->id, 'match' => $match->id]));

        $this->assertDatabaseHas('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'team' => 'b',
        ]);
    }

    public function test_update_for_non_going_player_returns_422(): void
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
            'status' => 'maybe',
        ]);

        $this->actingAs($owner)
            ->patch(route('groups.matches.teams.update', [
                'group' => $group->id,
                'match' => $match->id,
                'player' => $player->id,
            ]), ['team' => 'a'])
            ->assertStatus(422);
    }

    public function test_group_default_team_size_used_when_match_has_no_override(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->settings()->updateOrCreate([], ['default_team_size' => 2]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $players = Player::factory()->count(5)->create();
        $group->players()->attach($players->pluck('id'));
        foreach ($players as $player) {
            MatchAttendance::query()->create([
                'match_id' => $match->id,
                'player_id' => $player->id,
                'status' => 'going',
            ]);
        }

        $this->actingAs($owner)
            ->post(route('groups.matches.teams.generate', ['group' => $group->id, 'match' => $match->id]));

        $unassignedCount = MatchAttendance::query()->where('match_id', $match->id)->whereNull('team')->count();
        $this->assertSame(1, $unassignedCount);
    }

    public function test_match_level_team_size_override_takes_precedence_over_group_default(): void
    {
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->settings()->updateOrCreate([], ['default_team_size' => 2]);

        $match = Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
            'team_size' => 3,
        ]);

        $players = Player::factory()->count(5)->create();
        $group->players()->attach($players->pluck('id'));
        foreach ($players as $player) {
            MatchAttendance::query()->create([
                'match_id' => $match->id,
                'player_id' => $player->id,
                'status' => 'going',
            ]);
        }

        $this->actingAs($owner)
            ->post(route('groups.matches.teams.generate', ['group' => $group->id, 'match' => $match->id]));

        $unassignedCount = MatchAttendance::query()->where('match_id', $match->id)->whereNull('team')->count();
        $this->assertSame(0, $unassignedCount);
    }
}
