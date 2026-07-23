<?php

namespace Tests\Feature\Auth;

use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FirstAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_access_screen_can_be_rendered(): void
    {
        $response = $this->get('/primeiro-acesso');

        $response->assertStatus(200);
    }

    public function test_first_registrant_becomes_admin_and_lands_on_admin_home(): void
    {
        $response = $this->post('/primeiro-acesso', [
            'name' => 'Admin Zero',
            'nickname' => 'zero',
            'phone' => '(11) 99999-0001',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.home', absolute: false));

        $this->assertDatabaseHas('players', [
            'phone' => '11999990001',
            'is_admin' => true,
        ]);
    }

    public function test_second_attempt_after_admin_exists_does_not_grant_admin(): void
    {
        Player::factory()->create(['is_admin' => true]);

        $response = $this->post('/primeiro-acesso', [
            'name' => 'Late Comer',
            'nickname' => 'late',
            'phone' => '(11) 99999-0002',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('register', absolute: false));
        $this->assertDatabaseMissing('players', ['phone' => '11999990002']);
        $this->assertGuest();
    }

    public function test_first_access_link_hidden_from_login_once_admin_exists(): void
    {
        Player::factory()->create(['is_admin' => true]);

        $response = $this->get('/login');

        $response->assertInertia(fn ($page) => $page->where('hasAdmin', true));
    }

    public function test_first_access_screen_redirects_to_register_when_admin_already_exists(): void
    {
        Player::factory()->create(['is_admin' => true]);

        $response = $this->get('/primeiro-acesso');

        $response->assertRedirect(route('register', absolute: false));
    }
}
