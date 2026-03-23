<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'email')) {
            DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email)');
            DB::statement('CREATE TABLE users_tmp (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                name VARCHAR NOT NULL,
                nickname VARCHAR NULL,
                email VARCHAR NULL,
                phone VARCHAR(20) NULL,
                email_verified_at DATETIME NULL,
                password VARCHAR NOT NULL,
                remember_token VARCHAR NULL,
                physical_condition VARCHAR NULL,
                created_at DATETIME NULL,
                updated_at DATETIME NULL
            )');
            DB::statement('INSERT INTO users_tmp (id, name, nickname, email, phone, email_verified_at, password, remember_token, physical_condition, created_at, updated_at)
                SELECT id, name, nickname, email, phone, email_verified_at, password, remember_token, physical_condition, created_at, updated_at FROM users');
            DB::statement('DROP TABLE users');
            DB::statement('ALTER TABLE users_tmp RENAME TO users');
            DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email)');
            DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone)');
        }
    }

    public function down(): void
    {
        // No-op rollback for sqlite table rebuild migration.
    }
};
