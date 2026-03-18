<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('slug', 150)->unique();
            $table->unsignedTinyInteger('weekday');
            $table->time('time');
            $table->string('location_name', 150);
            $table->string('status', 20)->default('active');
            $table->string('recurrence', 20)->default('weekly');

            $table->unsignedTinyInteger('max_players')->nullable();
            $table->unsignedTinyInteger('max_guests')->nullable();
            $table->boolean('allow_guests')->default(false);
            $table->unsignedSmallInteger('default_match_duration_minutes')->nullable();

            $table->string('join_mode', 20)->default('invite_only');
            $table->string('invite_code', 50)->nullable()->unique();
            $table->boolean('join_approval_required')->default(true);

            $table->boolean('has_monthly_fee')->default(false);
            $table->unsignedInteger('monthly_fee_cents')->nullable();
            $table->unsignedTinyInteger('payment_day')->nullable();
            $table->string('currency', 3)->default('BRL');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
