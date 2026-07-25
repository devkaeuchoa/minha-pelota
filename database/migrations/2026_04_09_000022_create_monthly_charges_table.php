<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('players')->cascadeOnDelete();
            $table->date('reference_month');
            $table->float('amount')->default(0);
            $table->string('payment_status', 20)->default('unpaid');
            $table->float('paid_amount')->default(0);
            $table->timestamps();

            $table->unique(['group_id', 'player_id', 'reference_month']);
            $table->index(['player_id', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_charges');
    }
};
