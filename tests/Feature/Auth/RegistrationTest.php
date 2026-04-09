<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_players_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'nickname' => 'testinho',
            'phone' => '(11) 99999-9999',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('player.home', absolute: false));

        $this->assertDatabaseHas('players', [
            'name' => 'Test User',
            'nick' => 'testinho',
            'phone' => '11999999999',
        ]);

        $this->assertAuthenticated();
    }
}
