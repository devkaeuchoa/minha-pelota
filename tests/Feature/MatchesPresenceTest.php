<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchAttendanceLink;
use App\Models\Player;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchesPresenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_generate_presence_link_and_player_can_toggle_presence(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

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

        /** @var Player $owner */
        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

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

    public function test_generating_presence_link_twice_redirects_without_duplicating_row(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);

        $match = Game::create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-03-24 18:00:00',
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $this->actingAs($owner)->post(route('groups.matches.presence.generate-link', [
            'group' => $group->id,
            'match' => $match->id,
        ]))->assertRedirect();

        $this->assertSame(1, MatchAttendanceLink::query()->where('match_id', $match->id)->count());

        $this->actingAs($owner)->post(route('groups.matches.presence.generate-link', [
            'group' => $group->id,
            'match' => $match->id,
        ]))->assertRedirect(route('groups.matches.presence.manage', [
            'group' => $group->id,
            'match' => $match->id,
        ]));

        $this->assertSame(1, MatchAttendanceLink::query()->where('match_id', $match->id)->count());
    }

    public function test_non_owner_cannot_generate_presence_link(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = Player::factory()->create(['is_admin' => true]);
        $member = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $group->players()->attach($member->id);

        $match = Game::create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-03-24 18:00:00',
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $this->actingAs($member)->post(route('groups.matches.presence.generate-link', [
            'group' => $group->id,
            'match' => $match->id,
        ]))->assertForbidden();

        $this->assertSame(0, MatchAttendanceLink::query()->where('match_id', $match->id)->count());
    }

    public function test_presence_show_returns_404_for_unknown_token(): void
    {
        $this->get(route('presence.show', 'token-inexistente'))
            ->assertNotFound();
    }

    public function test_presence_show_renders_mark_page_for_valid_link(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $match = Game::create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-03-24 18:00:00',
            'status' => 'scheduled',
            'location_name' => 'Arena',
            'duration_minutes' => null,
        ]);

        $this->actingAs($owner)->post(route('groups.matches.presence.generate-link', [
            'group' => $group->id,
            'match' => $match->id,
        ]));

        $link = MatchAttendanceLink::query()->where('match_id', $match->id)->firstOrFail();

        $this->get(route('presence.show', $link->token))
            ->assertOk()
            ->assertInertia(fn($page) => $page
                ->component('Presence/Mark')
                ->where('expired', false)
                ->where('match.id', $match->id));
    }

    public function test_public_presence_rejects_unknown_phone(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $match = Game::create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-03-24 18:00:00',
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $this->actingAs($owner)->post(route('groups.matches.presence.generate-link', [
            'group' => $group->id,
            'match' => $match->id,
        ]));

        $link = MatchAttendanceLink::query()->where('match_id', $match->id)->firstOrFail();

        $this->post(route('presence.store', $link->token), [
            'phone' => '99999999999',
            'status' => 'going',
        ])->assertRedirect(route('presence.show', $link->token));

        $this->assertDatabaseMissing('match_attendance', [
            'match_id' => $match->id,
        ]);
    }

    public function test_public_presence_rejects_phone_not_in_group(): void
    {
        CarbonImmutable::setTestNow('2026-03-20 10:00:00');

        $owner = Player::factory()->create(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $outsider = Player::factory()->create();

        $match = Game::create([
            'group_id' => $group->id,
            'scheduled_at' => '2026-03-24 18:00:00',
            'status' => 'scheduled',
            'location_name' => null,
            'duration_minutes' => null,
        ]);

        $this->actingAs($owner)->post(route('groups.matches.presence.generate-link', [
            'group' => $group->id,
            'match' => $match->id,
        ]));

        $link = MatchAttendanceLink::query()->where('match_id', $match->id)->firstOrFail();

        $this->post(route('presence.store', $link->token), [
            'phone' => $outsider->phone,
            'status' => 'going',
        ])->assertRedirect(route('presence.show', $link->token));

        $this->assertDatabaseMissing('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $outsider->id,
        ]);
    }
}
