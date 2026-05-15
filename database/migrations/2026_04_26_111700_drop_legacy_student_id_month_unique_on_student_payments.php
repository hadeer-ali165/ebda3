<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            try {
                DB::statement('DROP INDEX IF EXISTS student_payments_student_id_month_unique');
            } catch (\Throwable) {
                // Ignore to keep migration idempotent across states.
            }

            return;
        }

        if ($driver === 'pgsql') {
            try {
                DB::statement('ALTER TABLE student_payments DROP CONSTRAINT IF EXISTS student_payments_student_id_month_unique');
            } catch (\Throwable) {
                // Ignore to keep migration idempotent across states.
            }

            return;
        }

        try {
            DB::statement('ALTER TABLE student_payments DROP INDEX student_payments_student_id_month_unique');
        } catch (\Throwable) {
            // Index may already be removed.
        }
    }

    public function down(): void
    {
        try {
            DB::statement('CREATE UNIQUE INDEX student_payments_student_id_month_unique ON student_payments (student_id, month)');
        } catch (\Throwable) {
            // Ignore if already exists or column does not exist.
        }
    }
};
