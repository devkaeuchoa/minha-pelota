<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\Player;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class E2EGroupsEmptyStateSeeder extends Seeder
{
    /**
     * Seed state for E2E group-empty scenarios.
     */
    public function run(): void
    {
        // Reset groups so the admin starts with empty groups list.
        Group::query()->delete();

        // Ensure deterministic admin user for E2E login.
        Player::query()->updateOrCreate(
            ['phone' => '11966666666'],
            [
                'name' => 'Admin No Groups',
                'nick' => 'admin-no-groups',
                'is_admin' => true,
                'password' => Hash::make('password'),
            ]
        );
    }
}
