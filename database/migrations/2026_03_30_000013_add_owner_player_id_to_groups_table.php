<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->foreignId('owner_player_id')->nullable()->after('owner_id')->constrained('players')->nullOnDelete();
        });

        $usersById = DB::table('users')->select(['id', 'phone'])->get()->keyBy('id');
        $playersByPhone = DB::table('players')->select(['id', 'phone'])->get()->keyBy('phone');
        $groups = DB::table('groups')->select(['id', 'owner_id'])->get();

        foreach ($groups as $group) {
            $owner = $usersById->get($group->owner_id);
            if (! $owner) {
                continue;
            }

            $player = $playersByPhone->get($owner->phone);
            if (! $player) {
                continue;
            }

            DB::table('groups')
                ->where('id', $group->id)
                ->update(['owner_player_id' => $player->id]);
        }
    }

    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropConstrainedForeignId('owner_player_id');
        });
    }
};
