<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('student_payments')) {
            return;
        }

        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            try {
                DB::statement('DROP INDEX IF EXISTS student_payments_student_id_month_unique');
            } catch (\Throwable) {
                // Index might already be removed.
            }

            return;
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE student_payments DROP CONSTRAINT IF EXISTS student_payments_student_id_month_unique');

            if (Schema::hasColumn('student_payments', 'student_id')) {
                DB::statement('ALTER TABLE student_payments ALTER COLUMN student_id DROP NOT NULL');
            }

            return;
        }

        try {
            DB::statement('ALTER TABLE student_payments DROP INDEX student_payments_student_id_month_unique');
        } catch (\Throwable) {
            // Index might already be removed.
        }

        if (Schema::hasColumn('student_payments', 'student_id')) {
            DB::statement('ALTER TABLE student_payments MODIFY student_id BIGINT UNSIGNED NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('student_payments')) {
            return;
        }

        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            try {
                DB::statement('CREATE UNIQUE INDEX student_payments_student_id_month_unique ON student_payments (student_id, month)');
            } catch (\Throwable) {
                // Ignore if unique already exists.
            }

            return;
        }

        if ($driver === 'pgsql') {
            if (Schema::hasColumn('student_payments', 'student_id')) {
                DB::statement('ALTER TABLE student_payments ALTER COLUMN student_id SET NOT NULL');
            }

            try {
                DB::statement('CREATE UNIQUE INDEX student_payments_student_id_month_unique ON student_payments (student_id, month)');
            } catch (\Throwable) {
                // Ignore if unique already exists.
            }

            return;
        }

        if (Schema::hasColumn('student_payments', 'student_id')) {
            DB::statement('ALTER TABLE student_payments MODIFY student_id BIGINT UNSIGNED NOT NULL');
        }

        try {
            DB::statement('ALTER TABLE student_payments ADD UNIQUE student_payments_student_id_month_unique (student_id, month)');
        } catch (\Throwable) {
            // Ignore if unique already exists.
        }
    }
};
