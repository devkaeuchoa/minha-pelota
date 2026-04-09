<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroupLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_group_via_store(): void
    {
        $admin = Player::factory()->createOne(['is_admin' => true]);

        $slug = 'meu-grupo-' . uniqid();

        $response = $this->actingAs($admin)->post(route('groups.store'), [
            'name' => 'Meu Grupo',
            'slug' => $slug,
            'location_name' => 'Arena Central',
            'weekday' => 4,
            'time' => '20:00',
            'recurrence' => 'weekly',
            'allow_guests' => false,
            'join_approval_required' => true,
            'monthly_fee' => 0,
            'drop_in_fee' => 0,
        ]);

        $group = Group::query()->where('slug', $slug)->firstOrFail();
        $response->assertRedirect(route('groups.show', $group));

        $this->assertSame($admin->id, (int) $group->owner_player_id);
        $this->assertTrue($group->players()->where('players.id', $admin->id)->exists());
        $this->assertNotNull($group->settings);
    }

    public function test_admin_can_create_group_with_monthly_fee(): void
    {
        $admin = Player::factory()->createOne(['is_admin' => true]);
        $slug = 'grupo-mensalidade-' . uniqid();

        $response = $this->actingAs($admin)->post(route('groups.store'), [
            'name' => 'Grupo com Mensalidade',
            'slug' => $slug,
            'location_name' => 'Arena Mensal',
            'weekday' => 2,
            'time' => '19:30',
            'recurrence' => 'weekly',
            'monthly_fee' => 35.5,
        ]);

        $group = Group::query()->where('slug', $slug)->firstOrFail();
        $response->assertRedirect(route('groups.show', $group));

        $this->assertNotNull($group->settings);
        $this->assertSame(35.5, (float) $group->settings->monthly_fee);
    }

    public function test_owner_can_bulk_delete_own_groups(): void
    {
        $owner = Player::factory()->createOne(['is_admin' => true]);
        $g1 = Group::factory()->create(['owner_player_id' => $owner->id]);
        $g2 = Group::factory()->create(['owner_player_id' => $owner->id]);

        $this->actingAs($owner)
            ->delete(route('groups.destroyMany'), ['ids' => [$g1->id, $g2->id]])
            ->assertRedirect(route('groups.index'));

        $this->assertSoftDeleted('groups', ['id' => $g1->id]);
        $this->assertSoftDeleted('groups', ['id' => $g2->id]);
    }

    public function test_bulk_delete_ignores_groups_not_owned_by_actor(): void
    {
        $ownerA = Player::factory()->createOne(['is_admin' => true]);
        $ownerB = Player::factory()->createOne(['is_admin' => true]);
        $groupA = Group::factory()->create(['owner_player_id' => $ownerA->id]);
        $groupB = Group::factory()->create(['owner_player_id' => $ownerB->id]);

        $this->actingAs($ownerA)
            ->delete(route('groups.destroyMany'), ['ids' => [$groupA->id, $groupB->id]])
            ->assertRedirect(route('groups.index'));

        $this->assertSoftDeleted('groups', ['id' => $groupA->id]);
        $this->assertDatabaseHas('groups', ['id' => $groupB->id, 'deleted_at' => null]);
    }

    public function test_owner_can_attach_existing_players_to_group(): void
    {
        $owner = Player::factory()->createOne(['is_admin' => true]);
        $group = Group::factory()->create(['owner_player_id' => $owner->id]);
        $extra = Player::factory()->createOne();

        $this->actingAs($owner)
            ->post(route('groups.players.attach', $group), [
                'player_ids' => [$extra->id],
            ])
            ->assertRedirect(route('groups.players', $group));

        $this->assertTrue($group->players()->where('players.id', $extra->id)->exists());
    }

    public function test_owner_can_update_group(): void
    {
        $owner = Player::factory()->createOne(['is_admin' => true]);
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'Nome Antigo',
        ]);

        $this->actingAs($owner)
            ->put(route('groups.update', $group), [
                'name' => 'Nome Novo',
            ])
            ->assertRedirect(route('groups.show', $group));

        $this->assertSame('Nome Novo', $group->fresh()->name);
    }

    public function test_owner_can_disable_monthly_fee_on_update(): void
    {
        $owner = Player::factory()->createOne(['is_admin' => true]);
        $group = Group::factory()->create([
            'owner_player_id' => $owner->id,
            'name' => 'Grupo Mensal',
        ]);
        $group->settings()->updateOrCreate([], ['monthly_fee' => 50]);

        $this->actingAs($owner)
            ->put(route('groups.update', $group), [
                'monthly_fee' => 0,
            ])
            ->assertRedirect(route('groups.show', $group));

        $this->assertNotNull($group->fresh()->settings);
        $this->assertSame(0.0, (float) $group->fresh()->settings->monthly_fee);
    }

    public function test_non_owner_cannot_update_foreign_group(): void
    {
        $ownerA = Player::factory()->createOne(['is_admin' => true]);
        $ownerB = Player::factory()->createOne(['is_admin' => true]);
        $groupB = Group::factory()->create([
            'owner_player_id' => $ownerB->id,
            'name' => 'Grupo B',
        ]);

        $this->actingAs($ownerA)
            ->put(route('groups.update', $groupB), [
                'name' => 'Alteração indevida',
            ])
            ->assertForbidden();

        $this->assertSame('Grupo B', $groupB->fresh()->name);
    }
}
