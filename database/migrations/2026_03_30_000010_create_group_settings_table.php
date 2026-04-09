<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->unique()->constrained('groups')->cascadeOnDelete();
            $table->float('monthly_fee')->default(0);
            $table->float('drop_in_fee')->default(0);
            $table->unsignedTinyInteger('default_weekday')->default(0);
            $table->time('default_time')->default('20:00:00');
            $table->string('recurrence', 20)->default('weekly');
            $table->string('invite_token', 80)->unique();
            $table->timestamp('invite_expires_at')->nullable();
            $table->timestamps();
        });

        $groups = DB::table('groups')->select([
            'id',
            'weekday',
            'time',
            'recurrence',
            'monthly_fee',
            'invite_code',
        ])->get();

        $now = now();
        $rows = [];
        foreach ($groups as $group) {
            $rows[] = [
                'group_id' => $group->id,
                'monthly_fee' => max(0, (float) ($group->monthly_fee ?? 0)),
                'drop_in_fee' => 0,
                'default_weekday' => (int) ($group->weekday ?? 0),
                'default_time' => $group->time ?? '20:00:00',
                'recurrence' => $group->recurrence ?? 'weekly',
                'invite_token' => $group->invite_code ?: Str::random(40),
                'invite_expires_at' => $now->copy()->addMonth(),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows !== []) {
            DB::table('group_settings')->insert($rows);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('group_settings');
    }
};
