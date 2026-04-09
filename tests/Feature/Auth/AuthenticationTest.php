<?php

namespace Tests\Feature\Auth;

use App\Models\Player;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = Player::factory()->create();

        $response = $this->post('/login', [
            'phone' => $user->phone,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('player.home', absolute: false));
    }

    public function test_admin_users_are_redirected_to_admin_home_after_login(): void
    {
        $admin = Player::factory()->create([
            'is_admin' => true,
        ]);
        Group::factory()->create([
            'owner_player_id' => $admin->id,
        ]);

        $response = $this->post('/login', [
            'phone' => $admin->phone,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.home', absolute: false));
    }

    public function test_platform_admin_without_owned_group_is_redirected_to_admin_home(): void
    {
        $admin = Player::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->post('/login', [
            'phone' => $admin->phone,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.home', absolute: false));
    }

    public function test_platform_admin_with_owned_group_is_redirected_to_admin_home(): void
    {
        $admin = Player::factory()->create([
            'is_admin' => true,
        ]);
        Group::factory()->create([
            'owner_player_id' => $admin->id,
        ]);

        $response = $this->post('/login', [
            'phone' => $admin->phone,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.home', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = Player::factory()->create();

        $this->post('/login', [
            'phone' => $user->phone,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        /** @var Player $user */
        $user = Player::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
