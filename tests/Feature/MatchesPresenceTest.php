<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchAttendanceLink;
use App\Models\Player;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchesPresenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_generate_presence_link_and_player_can_toggle_presence(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);

        $player = Player::factory()->create(['phone' => '21988776655']);
        $group->players()->attach($player->id);

        $match = Game::create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-03-24 18:00:00',
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $response = $this->actingAs($owner)->post(route('groups.matches.presence.generate-link', [
            'group' => $group->id,
            'match' => $match->id,
        ]));

        $response->assertRedirect(route('groups.matches.presence.manage', [
            'group' => $group->id,
            'match' => $match->id,
        ]));

        $link = MatchAttendanceLink::query()->where('match_id', $match->id)->firstOrFail();

        $this->post(route('presence.store', $link->token), [
            'phone' => $player->phone,
            'status' => 'going',
        ])->assertRedirect(route('presence.show', $link->token));

        $this->assertDatabaseHas('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'going',
        ]);
        $this->assertDatabaseHas('player_stats', [
            'player_id' => $player->id,
            'games_played' => 1,
            'games_missed' => 0,
        ]);

        $this->post(route('presence.store', $link->token), [
            'phone' => $player->phone,
            'status' => 'not_going',
        ])->assertRedirect(route('presence.show', $link->token));

        $this->assertDatabaseHas('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'not_going',
        ]);
        $this->assertDatabaseHas('player_stats', [
            'player_id' => $player->id,
            'games_played' => 0,
            'games_missed' => 1,
        ]);
    }

    public function test_expired_link_disallows_player_marking_presence(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $owner->id]);

        $player = Player::factory()->create(['phone' => '21988776655']);
        $group->players()->attach($player->id);

        $match = Game::create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-03-20 18:00:00',
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $this->actingAs($owner)->post(route('groups.matches.presence.generate-link', [
            'group' => $group->id,
            'match' => $match->id,
        ]));

        $link = MatchAttendanceLink::query()->where('match_id', $match->id)->firstOrFail();

        CarbonImmutable::setTestNow('2026-03-20 18:00:01');

        $this->post(route('presence.store', $link->token), [
            'phone' => $player->phone,
            'status' => 'going',
        ])->assertRedirect(route('presence.show', $link->token));

        $this->assertDatabaseMissing('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $player->id,
        ]);
    }
}
