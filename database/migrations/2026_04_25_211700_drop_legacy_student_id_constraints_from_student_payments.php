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

        if ($driver === 'pgsql') {
            try {
                DB::statement('ALTER TABLE student_payments DROP CONSTRAINT IF EXISTS student_payments_student_id_foreign');
            } catch (\Throwable) {
                // foreign key may already be dropped
            }

            try {
                DB::statement('ALTER TABLE student_payments DROP CONSTRAINT IF EXISTS student_payments_student_id_month_unique');
            } catch (\Throwable) {
                // unique constraint may already be dropped
            }

            return;
        }

        try {
            DB::statement('ALTER TABLE student_payments DROP FOREIGN KEY student_payments_student_id_foreign');
        } catch (\Throwable) {
            // foreign key may already be dropped
        }

        try {
            DB::statement('ALTER TABLE student_payments DROP INDEX student_payments_student_id_month_unique');
        } catch (\Throwable) {
            // unique index may already be dropped
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

        if ($driver === 'pgsql') {
            try {
                DB::statement('ALTER TABLE student_payments ADD CONSTRAINT student_payments_student_id_foreign FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE');
            } catch (\Throwable) {
                // ignore if already exists
            }

            try {
                DB::statement('CREATE UNIQUE INDEX student_payments_student_id_month_unique ON student_payments (student_id, month)');
            } catch (\Throwable) {
                // ignore if already exists
            }

            return;
        }

        try {
            DB::statement('ALTER TABLE student_payments ADD CONSTRAINT student_payments_student_id_foreign FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE');
        } catch (\Throwable) {
            // ignore if already exists
        }

        try {
            DB::statement('ALTER TABLE student_payments ADD UNIQUE student_payments_student_id_month_unique (student_id, month)');
        } catch (\Throwable) {
            // ignore if already exists
        }
    }
};
