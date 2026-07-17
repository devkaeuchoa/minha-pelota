<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_settings', function (Blueprint $table) {
            $table->unsignedTinyInteger('default_team_size')->nullable()->after('recurrence');
        });
    }

    public function down(): void
    {
        Schema::table('group_settings', function (Blueprint $table) {
            $table->dropColumn('default_team_size');
        });
    }
};
