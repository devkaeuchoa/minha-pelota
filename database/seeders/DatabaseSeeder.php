<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Group;
use App\Models\MatchAttendance;
use App\Models\MatchAttendanceLink;
use App\Models\Player;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Player::factory()->create([
            'name' => 'Test Player',
            'nick' => 'test-player',
            'phone' => '11999999999',
        ]);

        $owner = Player::factory()->create([
            'name' => 'Owner Player',
            'nick' => 'owner-player',
            'phone' => '11988888888',
            'is_admin' => true,
        ]);

        $playerWithGroup = Player::factory()->create([
            'name' => 'Grouped Player',
            'nick' => 'grouped-player',
            'phone' => '11977777777',
            'is_admin' => false,
        ]);

        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'E2E Group',
            'slug' => 'e2e-group',
            'location_name' => 'Arena E2E',
        ]);

        $group->players()->syncWithoutDetaching([
            $owner->id => ['is_admin' => true],
            $playerWithGroup->id => ['is_admin' => false],
        ]);

        Game::query()->create([
            'group_id' => $group->id,
            'scheduled_at' => now()->addDays(3),
            'status' => 'scheduled',
            'location_name' => 'Arena E2E',
            'duration_minutes' => 90,
        ]);

        // Admin without groups — used by group-management E2E suite (empty-state + creation tests)
        Player::factory()->create([
            'name' => 'Admin No Groups',
            'nick' => 'admin-no-groups',
            'phone' => '11966666666',
            'is_admin' => true,
        ]);

        // Profile E2E — senha / exclusão (sem grupos para não afetar outras suites)
        Player::factory()->create([
            'name' => 'E2E Profile Password',
            'nick' => 'e2e-profile-pw',
            'phone' => '11944444444',
            'is_admin' => false,
        ]);
        Player::factory()->create([
            'name' => 'E2E Profile Delete',
            'nick' => 'e2e-profile-del',
            'phone' => '11955555555',
            'is_admin' => false,
        ]);

        // Extra groups owned by Owner Player — used by group-management E2E suite (edit + batch-delete tests)
        Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'E2E Group 2',
            'slug' => 'e2e-group-2',
            'location_name' => 'Arena E2E 2',
        ]);

        Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'E2E Batch Delete 1',
            'slug' => 'e2e-batch-delete-1',
            'location_name' => 'Arena Lote 1',
        ]);

        Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'E2E Batch Delete 2',
            'slug' => 'e2e-batch-delete-2',
            'location_name' => 'Arena Lote 2',
        ]);

        // Expired invite link — used by E2E invite suite (show rejects expired tokens)
        $expiredInviteGroup = Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'E2E Invite Expired',
            'slug' => 'e2e-invite-expired',
            'location_name' => 'Arena Convite Expirado',
        ]);
        $expiredInviteGroup->settings()->update([
            'invite_expires_at' => now()->subDay(),
        ]);

        // Expired presence link — token must match tests/e2e/match-presence.spec.ts (E2E_PRESENCE_EXPIRED_TOKEN)
        $expiredPresenceGroup = Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'E2E Presence Expired',
            'slug' => 'e2e-presence-expired',
            'location_name' => 'Arena Presença Expirada',
        ]);
        $pastPresenceMatch = Game::query()->create([
            'group_id' => $expiredPresenceGroup->id,
            'scheduled_at' => now()->subDays(2),
            'status' => 'finished',
            'location_name' => 'Arena Presença Expirada',
            'duration_minutes' => 90,
        ]);
        MatchAttendanceLink::query()->create([
            'match_id' => $pastPresenceMatch->id,
            'token' => str_pad('e2e_presence_expired', 64, '0'),
            'expires_at' => $pastPresenceMatch->scheduled_at,
            'created_by' => null,
        ]);

        // Finished match + presença confirmada — E2E pagamentos (atalho = última partida finalizada do owner)
        $paymentsGroup = Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'E2E Match Payments',
            'slug' => 'e2e-match-payments',
            'location_name' => 'Arena Pagamentos E2E',
        ]);
        $paymentsGroup->players()->syncWithoutDetaching([
            $owner->id => ['is_admin' => true],
            $playerWithGroup->id => ['is_admin' => false],
        ]);
        $finishedPaymentsMatch = Game::query()->create([
            'group_id' => $paymentsGroup->id,
            'scheduled_at' => now()->subHours(6),
            'status' => 'finished',
            'location_name' => 'Arena Pagamentos E2E',
            'duration_minutes' => 90,
        ]);
        MatchAttendance::query()->create([
            'match_id' => $finishedPaymentsMatch->id,
            'player_id' => $playerWithGroup->id,
            'status' => 'going',
        ]);
    }
}
