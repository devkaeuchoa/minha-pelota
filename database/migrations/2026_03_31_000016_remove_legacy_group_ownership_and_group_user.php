<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('groups')) {
            Schema::table('groups', function (Blueprint $table): void {
                if (Schema::hasColumn('groups', 'owner_player_id')) {
                    $table->foreignId('owner_player_id')->nullable(false)->change();
                }
            });

            Schema::table('groups', function (Blueprint $table): void {
                if (Schema::hasColumn('groups', 'owner_id')) {
                    $table->dropConstrainedForeignId('owner_id');
                }
            });
        }

        if (Schema::hasTable('group_user')) {
            Schema::drop('group_user');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('groups')) {
            return;
        }

        Schema::table('groups', function (Blueprint $table): void {
            if (! Schema::hasColumn('groups', 'owner_id')) {
                $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            }
        });

        if (! Schema::hasTable('group_user')) {
            Schema::create('group_user', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->boolean('is_admin')->default(false);
                $table->timestamps();
                $table->unique(['group_id', 'user_id']);
            });
        }
    }
};
