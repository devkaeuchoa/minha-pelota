<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_attendance_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->dateTime('expires_at');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // The MVP requires one link per match.
            $table->unique(['match_id']);
        });

        Schema::create('match_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('players')->cascadeOnDelete();
            $table->string('status', 20);
            $table->timestamps();

            $table->unique(['match_id', 'player_id']);

            $table->index(['player_id', 'match_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_attendance');
        Schema::dropIfExists('match_attendance_links');
    }
};

