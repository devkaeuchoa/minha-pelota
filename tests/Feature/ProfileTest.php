<?php

namespace Tests\Feature;

use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        /** @var Player $user */
        $user = Player::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        /** @var Player $user */
        $user = Player::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'nickname' => 'tester',
                'phone' => '11999998888',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('tester', $user->nick);
        $this->assertSame('11999998888', $user->phone);
    }

    public function test_phone_must_be_unique_when_updating_profile(): void
    {
        /** @var Player $user */
        $user = Player::factory()->create(['phone' => '11999998888']);
        /** @var Player $otherUser */
        $otherUser = Player::factory()->create(['phone' => '11911112222']);

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->patch('/profile', [
                'name' => 'Test User',
                'phone' => $otherUser->phone,
            ]);

        $response
            ->assertSessionHasErrors('phone')
            ->assertRedirect('/profile');
    }

    public function test_user_can_delete_their_account(): void
    {
        /** @var Player $user */
        $user = Player::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        /** @var Player $user */
        $user = Player::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
