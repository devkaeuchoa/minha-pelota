<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_player', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->after('player_id');
        });

        $legacyMemberships = DB::table('group_user')
            ->join('users', 'users.id', '=', 'group_user.user_id')
            ->join('players', 'players.phone', '=', 'users.phone')
            ->select([
                'group_user.group_id',
                'players.id as player_id',
                'group_user.is_admin',
            ])
            ->get();

        foreach ($legacyMemberships as $membership) {
            DB::table('group_player')
                ->where('group_id', $membership->group_id)
                ->where('player_id', $membership->player_id)
                ->update(['is_admin' => (bool) $membership->is_admin]);
        }
    }

    public function down(): void
    {
        Schema::table('group_player', function (Blueprint $table) {
            $table->dropColumn('is_admin');
        });
    }
};
