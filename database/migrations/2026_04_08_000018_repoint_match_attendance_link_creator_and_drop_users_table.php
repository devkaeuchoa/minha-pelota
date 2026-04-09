<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('match_attendance_links')) {
            Schema::table('match_attendance_links', function (Blueprint $table): void {
                $table->dropForeign(['created_by']);
            });

            Schema::table('match_attendance_links', function (Blueprint $table): void {
                $table->foreign('created_by')
                    ->references('id')
                    ->on('players')
                    ->nullOnDelete();
            });
        }

        Schema::dropIfExists('users');
    }

    public function down(): void
    {
        // Irreversible: `users` table and legacy data are not restored.
    }
};
