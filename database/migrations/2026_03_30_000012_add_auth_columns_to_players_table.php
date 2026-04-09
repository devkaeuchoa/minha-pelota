<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->string('password')->nullable()->after('phone');
            $table->rememberToken()->after('password');
        });

        $legacyUsers = DB::table('users')
            ->select(['phone', 'password', 'remember_token'])
            ->get()
            ->keyBy('phone');

        $players = DB::table('players')->select(['id', 'phone'])->get();
        foreach ($players as $player) {
            $legacy = $legacyUsers->get($player->phone);
            if (! $legacy) {
                continue;
            }

            DB::table('players')
                ->where('id', $player->id)
                ->update([
                    'password' => $legacy->password,
                    'remember_token' => $legacy->remember_token,
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn(['password', 'remember_token']);
        });
    }
};
