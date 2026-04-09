<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('players')->cascadeOnDelete();
            $table->string('payment_status', 20)->default('unpaid');
            $table->float('paid_amount')->default(0);
            $table->boolean('is_monthly_exempt')->default(false);
            $table->timestamps();

            $table->unique(['match_id', 'player_id']);
            $table->index(['player_id', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_payments');
    }
};
