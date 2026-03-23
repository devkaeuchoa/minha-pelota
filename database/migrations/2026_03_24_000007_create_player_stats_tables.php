<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->unique()->constrained('players')->cascadeOnDelete();
            $table->unsignedInteger('goals')->default(0);
            $table->unsignedInteger('assists')->default(0);
            $table->integer('manual_goals_delta')->default(0);
            $table->integer('manual_assists_delta')->default(0);
            $table->unsignedInteger('games_played')->default(0);
            $table->unsignedInteger('games_missed')->default(0);
            $table->timestamps();
        });

        Schema::create('match_player_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('players')->cascadeOnDelete();
            $table->unsignedInteger('goals')->default(0);
            $table->unsignedInteger('assists')->default(0);
            $table->timestamps();

            $table->unique(['match_id', 'player_id']);
            $table->index(['player_id', 'match_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_player_stats');
        Schema::dropIfExists('player_stats');
    }
};
