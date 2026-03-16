<?php

namespace Database\Factories;

use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Group>
 */
class GroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => UserFactory::new(),
            'name' => $this->faker->unique()->words(3, true),
            'slug' => $this->faker->unique()->slug(),
            'weekday' => $this->faker->randomElement(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
            'time' => $this->faker->time('H:i'),
            'location_name' => $this->faker->city(),
            'status' => 'active',
            'max_players' => $this->faker->numberBetween(10, 22),
            'max_guests' => $this->faker->numberBetween(0, 5),
            'allow_guests' => $this->faker->boolean(),
            'default_match_duration_minutes' => $this->faker->randomElement([60, 75, 90]),
            'join_mode' => $this->faker->randomElement(['invite_only', 'link', 'open_request']),
            'invite_code' => null,
            'join_approval_required' => true,
            'has_monthly_fee' => false,
            'monthly_fee_cents' => null,
            'payment_day' => null,
            'currency' => 'BRL',
        ];
    }
}
