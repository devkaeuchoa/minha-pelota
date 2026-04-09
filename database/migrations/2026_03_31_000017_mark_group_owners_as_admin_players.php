<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $ownerIds = DB::table('groups')
            ->whereNotNull('owner_player_id')
            ->pluck('owner_player_id');

        if ($ownerIds->isEmpty()) {
            return;
        }

        DB::table('players')
            ->whereIn('id', $ownerIds->all())
            ->update(['is_admin' => true]);
    }

    public function down(): void
    {
        // intentionally no-op to avoid removing manually granted admin flags
    }
};
