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
        if (! Schema::hasTable('group_settings')) {
            return;
        }

        Schema::table('group_settings', function (Blueprint $table): void {
            if (! Schema::hasColumn('group_settings', 'monthly_fee')) {
                $table->float('monthly_fee')->default(0);
            }
            if (! Schema::hasColumn('group_settings', 'drop_in_fee')) {
                $table->float('drop_in_fee')->default(0);
            }
            if (! Schema::hasColumn('group_settings', 'default_weekday')) {
                $table->unsignedTinyInteger('default_weekday')->default(0);
            }
            if (! Schema::hasColumn('group_settings', 'default_time')) {
                $table->time('default_time')->default('20:00:00');
            }
            if (! Schema::hasColumn('group_settings', 'recurrence')) {
                $table->string('recurrence', 20)->default('weekly');
            }
            if (! Schema::hasColumn('group_settings', 'invite_token')) {
                $table->string('invite_token', 80)->nullable();
            }
            if (! Schema::hasColumn('group_settings', 'invite_expires_at')) {
                $table->timestamp('invite_expires_at')->nullable();
            }
        });

        if (Schema::hasColumn('group_settings', 'monthly_fee_cents')) {
            DB::table('group_settings')
                ->where('monthly_fee', 0)
                ->update([
                    'monthly_fee' => DB::raw('monthly_fee_cents / 100.0'),
                ]);
        }

        if (Schema::hasColumn('group_settings', 'drop_in_fee_cents')) {
            DB::table('group_settings')
                ->where('drop_in_fee', 0)
                ->update([
                    'drop_in_fee' => DB::raw('drop_in_fee_cents / 100.0'),
                ]);
        }

        if (Schema::hasColumn('group_settings', 'weekday')) {
            DB::table('group_settings')
                ->where('default_weekday', 0)
                ->update([
                    'default_weekday' => DB::raw('weekday'),
                ]);
        }

        if (Schema::hasColumn('group_settings', 'time')) {
            DB::table('group_settings')
                ->where('default_time', '20:00:00')
                ->update([
                    'default_time' => DB::raw('time'),
                ]);
        }

        $settings = DB::table('group_settings')
            ->select(['id', 'group_id', 'invite_token'])
            ->get();

        foreach ($settings as $setting) {
            if (! $setting->invite_token) {
                DB::table('group_settings')
                    ->where('id', $setting->id)
                    ->update([
                        'invite_token' => Str::random(40),
                        'invite_expires_at' => now()->addMonth(),
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    public function down(): void
    {
        // no-op: compatibility migration
    }
};
