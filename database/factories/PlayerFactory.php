<?php

namespace Database\Factories;

use App\Models\Player;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** @extends Factory<Player> */
class PlayerFactory extends Factory
{
    protected $model = Player::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'nick' => $this->faker->userName(),
            'phone' => $this->faker->unique()->numerify('###########'),
            'is_admin' => false,
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }
}
