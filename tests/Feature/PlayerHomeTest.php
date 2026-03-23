<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\Player;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerHomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_player_home_shows_empty_state_when_user_has_no_group(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('player.home'));

        $response->assertOk();
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Home/Player')
                ->where('hasGroup', false)
                ->where('nextMatch', null)
                ->where('canQuickConfirm', false)
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

        $response = $this->actingAs($user)->post(route('player.home.presence.confirm', $match));

        $response->assertRedirect(route('player.home'));
        $this->assertDatabaseHas('match_attendance', [
            'match_id' => $match->id,
            'player_id' => $player->id,
            'status' => 'going',
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

        $response = $this->actingAs($user)->post(route('player.home.presence.confirm', $otherMatch));

        $response->assertStatus(403);
    }

    private function createPlayerMemberContext(): array
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $user = User::factory()->create([
            'phone' => '11999999999',
        ]);
        $user->groups()->attach($group->id, ['is_admin' => false]);

        $player = Player::factory()->create([
            'phone' => '11999999999',
        ]);
        $group->players()->attach($player->id);

        return [$user, $group, $player];
    }
}
