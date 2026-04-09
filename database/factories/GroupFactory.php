<?php

namespace Database\Factories;

use App\Models\GroupSetting;
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
            'owner_player_id' => PlayerFactory::new(),
            'name' => $this->faker->unique()->words(3, true),
            'slug' => $this->faker->unique()->slug(),
            'weekday' => $this->faker->numberBetween(0, 6),
            'time' => $this->faker->time('H:i'),
            'location_name' => $this->faker->city(),
            'status' => 'active',
            'recurrence' => 'weekly',
            'max_players' => $this->faker->numberBetween(10, 22),
            'max_guests' => $this->faker->numberBetween(0, 5),
            'allow_guests' => $this->faker->boolean(),
            'default_match_duration_minutes' => $this->faker->randomElement([60, 75, 90]),
            'join_mode' => $this->faker->randomElement(['invite_only', 'link', 'open_request']),
            'invite_code' => null,
            'join_approval_required' => true,
            'has_monthly_fee' => false,
            'monthly_fee' => null,
            'payment_day' => null,
            'currency' => 'BRL',
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Group $group): void {
            GroupSetting::query()->firstOrCreate(
                ['group_id' => $group->id],
                [
                    'monthly_fee' => 0,
                    'drop_in_fee' => 0,
                    'default_weekday' => (int) $group->weekday,
                    'default_time' => strlen((string) $group->time) === 5 ? "{$group->time}:00" : (string) $group->time,
                    'recurrence' => (string) $group->recurrence,
                    'invite_token' => fake()->unique()->regexify('[A-Za-z0-9]{40}'),
                    'invite_expires_at' => now()->addMonth(),
                ]
            );
        });
    }
}
